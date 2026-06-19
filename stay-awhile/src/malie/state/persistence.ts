/**
 * Mālie — persistence & save migration.
 *
 * Save state lives in the kit's cloud-synced STORAGE service (src/services/
 * storage.ts → RundotGameAPI.appStorage), which makes a save follow the player
 * across devices and survive a reload. The kit owns its own envelope; Mālie's
 * save rides inside `data.malie` as `{ v, state }`.
 *
 * Because the SDK only answers inside the Run.Game playground, every call also
 * has a localStorage fallback so the game persists under a plain `npm run dev`.
 *
 * Saves are versioned. `migrate()` brings any older blob — including legacy
 * pre-versioning bare-state saves (v0) — up to the current schema, defaulting
 * any field a newer build expects. As the schema grows (timed jobs, farm plots),
 * add a step to `migrate()` and bump SAVE_VERSION.
 */
import type { GameState, Season } from '../types/game';
import { loadSave, persistSave, defaultSaveState } from '../../services/storage';
import { createInitialState } from './initialState';
import { skyPatternForSeason } from '../data/sky';

const SEASONS: Season[] = ['Hooilo', 'Kau', 'Makahiki', 'Transition'];

/** Current Mālie save schema version. Bump when the shape changes.
 *  v1 → v2: added `jobs` (timed crops / nets / crafts).
 *  v2 → v3: added `skipOffsetMs` (rest-forward game-clock skip).
 *  v3 → v4: added `skyPatternId` + `skyJournal` (Ka Lani, the sky journal). */
export const SAVE_VERSION = 4;

const LOCAL_KEY = 'malie_save_v1';

const SPIRIT_IDS = ['lono', 'kanaloa', 'pueo_aumakua', 'kane', 'ku', 'moo_aumakua', 'shark_aumakua'];

/**
 * Validate + fill a raw state object into a full GameState, defaulting every
 * field a current build expects. Returns null only when the blob is too broken
 * to be a save at all. This is where forward-compatible defaulting happens.
 */
function coerce(data: unknown): GameState | null {
  if (data == null || typeof data !== 'object') return null;
  const g = { ...(data as Record<string, unknown>) } as Partial<GameState> & Record<string, unknown>;

  // Load-bearing fields: if these are wrong, it isn't a save.
  if (typeof g.day !== 'number') return null;
  if (typeof g.activePanel !== 'string') return null;
  if (typeof g.inventory !== 'object' || g.inventory == null) return null;
  if (!Array.isArray(g.craftedItems)) return null;
  if (!Array.isArray(g.placedItems)) return null;
  if (!Array.isArray(g.messageLog)) return null;

  const d = createInitialState();

  if (!Array.isArray(g.actionsUsedToday)) g.actionsUsedToday = [];

  // Placement moved from numeric `slot` to named `slotId`; drop ghosts.
  g.placedItems = (g.placedItems as unknown[]).filter(
    (p): p is { craftedItemId: string; slotId: string } =>
      p != null && typeof (p as { slotId?: unknown }).slotId === 'string',
  );

  // Backfill every presence (the roster has grown over time).
  {
    const blank = { points: 0, discovered: false, attention: 0 };
    const existing = (g.spirits ?? {}) as Record<string, Partial<typeof blank>>;
    const merged: Record<string, typeof blank> = {};
    for (const id of SPIRIT_IDS) merged[id] = { ...blank, ...existing[id] };
    g.spirits = merged as GameState['spirits'];
  }

  // Spine fields added with versioning — default from a fresh state.
  if (typeof g.rng !== 'number') g.rng = d.rng;
  if (typeof g.nextEntityId !== 'number') {
    // Old length-based ids; start the counter safely past any existing item.
    g.nextEntityId = (g.craftedItems as unknown[]).length + 1;
  }
  if (typeof g.timeOffsetMs !== 'number') g.timeOffsetMs = 0;
  if (typeof g.skipOffsetMs !== 'number') g.skipOffsetMs = 0; // v3

  // v4: the sky journal. Default the pattern from the save's own season.
  if (typeof g.skyPatternId !== 'string') {
    const season = SEASONS.includes(g.season as Season) ? (g.season as Season) : d.season;
    g.skyPatternId = skyPatternForSeason(season);
  }
  if (!Array.isArray(g.skyJournal)) g.skyJournal = [];

  // v2: timed jobs. Default to none, and drop any malformed entries.
  if (!Array.isArray(g.jobs)) g.jobs = [];
  g.jobs = (g.jobs as unknown[]).filter(
    (j): j is GameState['jobs'][number] =>
      j != null &&
      typeof (j as { id?: unknown }).id === 'string' &&
      typeof (j as { readyAt?: unknown }).readyAt === 'number' &&
      typeof (j as { startedAt?: unknown }).startedAt === 'number',
  );

  return g as GameState;
}

/**
 * Bring any saved blob up to the current schema. Handles the versioned envelope
 * `{ v, state }` and legacy bare-state saves (treated as v0). Returns null when
 * the blob isn't a usable save.
 */
function migrate(raw: unknown): GameState | null {
  if (raw == null || typeof raw !== 'object') return null;

  // Versioned envelope?
  if ('state' in raw && 'v' in raw) {
    // (Future: run step migrations keyed on (raw as { v: number }).v here.)
    return coerce((raw as { state: unknown }).state);
  }

  // Legacy v0: the bare GameState was stored directly.
  return coerce(raw);
}

function loadLocal(): GameState | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw));
  } catch {
    return null;
  }
}

function saveLocal(state: GameState): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ v: SAVE_VERSION, state }));
  } catch {
    /* private mode / quota — nothing we can do, and nothing worth crashing over */
  }
}

/**
 * Load the saved game. Tries the kit's cloud save first; on any failure (running
 * outside the playground, offline, corrupt) falls back to localStorage. Returns
 * null when there is no save anywhere — the caller starts a fresh game.
 */
export async function loadGame(): Promise<GameState | null> {
  try {
    const envelope = await loadSave();
    const fromCloud = migrate(envelope.data?.['malie']);
    if (fromCloud) return fromCloud;
  } catch {
    /* fall through to local */
  }
  return loadLocal();
}

/**
 * Persist the game. Always writes localStorage and additionally pushes to the
 * kit's cloud save when the SDK is reachable. A cloud failure is swallowed — the
 * local copy keeps the player whole.
 */
export async function saveGame(state: GameState): Promise<void> {
  saveLocal(state);
  try {
    const envelope = await loadSave().catch(() => defaultSaveState());
    await persistSave({
      ...envelope,
      savedAt: envelope.savedAt, // kept as-is; time service owns the real clock
      data: { ...envelope.data, malie: { v: SAVE_VERSION, state } },
    });
  } catch {
    /* cloud save best-effort; local already holds the truth */
  }
}
