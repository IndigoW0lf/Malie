/**
 * Mālie — persistence.
 *
 * Save state lives in the kit's cloud-synced STORAGE service (src/services/
 * storage.ts → RundotGameAPI.appStorage), which is what makes a save follow the
 * player across devices and survive a reload. The kit owns the versioned
 * envelope; Mālie's GameState rides inside its `data` field.
 *
 * Because the SDK only answers inside the Run.Game playground, every call here
 * also has a localStorage fallback so the game still persists under a plain
 * `npm run dev` in a normal tab. The kit path is tried first and wins when it
 * works; the fallback keeps the prototype playable offline.
 */
import type { GameState } from '../types/game';
import { loadSave, persistSave, defaultSaveState } from '../../services/storage';

const LOCAL_KEY = 'malie_save_v1';

/** Narrow an unknown blob into a GameState, or null if it doesn't look like one. */
function asGameState(data: unknown): GameState | null {
  if (data == null || typeof data !== 'object') return null;
  const g = data as Partial<GameState>;
  if (typeof g.day !== 'number') return null;
  if (typeof g.activePanel !== 'string') return null;
  if (typeof g.inventory !== 'object' || g.inventory == null) return null;
  if (!Array.isArray(g.craftedItems)) return null;
  if (!Array.isArray(g.placedItems)) return null;
  if (!Array.isArray(g.messageLog)) return null;
  // actionsUsedToday was added alongside the daily-limit rule; tolerate older blobs.
  if (!Array.isArray(g.actionsUsedToday)) g.actionsUsedToday = [];
  // Placement moved from numeric `slot` to named `slotId`; drop pre-migration
  // entries that lack a string slotId so they don't render as ghosts.
  g.placedItems = g.placedItems.filter(
    (p): p is { craftedItemId: string; slotId: string } =>
      p != null && typeof (p as { slotId?: unknown }).slotId === 'string',
  );
  return g as GameState;
}

function loadLocal(): GameState | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    return asGameState(JSON.parse(raw));
  } catch {
    return null;
  }
}

function saveLocal(state: GameState): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
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
    const fromCloud = asGameState(envelope.data?.['malie']);
    if (fromCloud) return fromCloud;
  } catch {
    /* fall through to local */
  }
  return loadLocal();
}

/**
 * Persist the game. Always writes localStorage (cheap, synchronous-ish) and
 * additionally pushes to the kit's cloud save when the SDK is reachable. A cloud
 * failure is swallowed — the local copy keeps the player whole.
 */
export async function saveGame(state: GameState): Promise<void> {
  saveLocal(state);
  try {
    const envelope = await loadSave().catch(() => defaultSaveState());
    await persistSave({
      ...envelope,
      savedAt: envelope.savedAt, // kept as-is; time service owns the real clock
      data: { ...envelope.data, malie: state },
    });
  } catch {
    /* cloud save best-effort; local already holds the truth */
  }
}
