/**
 * Mālie — the first morning. Day 1, the hale, an empty bag, and a clear sky.
 */
import type { GameState, Inventory, ResourceId, Season, Tide } from '../types/game';
import { guidanceForDay } from '../data/guidance';
import { skyPatternForSeason } from '../data/sky';
import { greetingForDay } from '../data/greetings';

/** Tide cycles once per day, in order. */
export const TIDE_CYCLE: Tide[] = ['low', 'rising', 'high', 'falling'];

/** Seasons turn every SEASON_LENGTH days (MVP: a gentle, short year). */
export const SEASON_CYCLE: Season[] = ['Hooilo', 'Kau', 'Makahiki', 'Transition'];
export const SEASON_LENGTH = 7;

/** Deterministic tide for a given day. */
export function tideForDay(day: number): Tide {
  const idx = (((day - 1) % TIDE_CYCLE.length) + TIDE_CYCLE.length) % TIDE_CYCLE.length;
  return TIDE_CYCLE[idx]!;
}

/** Deterministic season for a given day. */
export function seasonForDay(day: number): Season {
  const raw = Math.floor((day - 1) / SEASON_LENGTH) % SEASON_CYCLE.length;
  const idx = ((raw % SEASON_CYCLE.length) + SEASON_CYCLE.length) % SEASON_CYCLE.length;
  return SEASON_CYCLE[idx]!;
}

/** Default PRNG seed for a fresh state; useGame reseeds real new games. */
export const DEFAULT_SEED = 0x9e3779b9;

/**
 * mulberry32 — a small, fast, deterministic PRNG. Returns the next value in
 * [0, 1) and the next seed. The game threads the seed through GameState so the
 * reducer stays pure and "luck" is reproducible from a save.
 */
export function rngNext(seed: number): [value: number, next: number] {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, t >>> 0];
}

/** Total ms to add to the client clock: the server anchor plus any time the
 *  player has skipped by resting. */
export function clockOffsetMs(state: Pick<GameState, 'timeOffsetMs' | 'skipOffsetMs'>): number {
  return state.timeOffsetMs + state.skipOffsetMs;
}

/** The canonical "now" for the game: server-anchored, advanced by rests. Anchored
 *  on load (see useGame); falls back to the client clock until then. */
export function gameNow(state: Pick<GameState, 'timeOffsetMs' | 'skipOffsetMs'>): number {
  return Date.now() + clockOffsetMs(state);
}

export function createInitialState(seed: number = DEFAULT_SEED): GameState {
  const day = 1;
  return {
    rng: seed >>> 0,
    nextEntityId: 1,
    timeOffsetMs: 0,
    skipOffsetMs: 0,
    day,
    season: seasonForDay(day),
    tide: tideForDay(day),
    guidanceId: guidanceForDay(day).id,
    skyPatternId: skyPatternForSeason(seasonForDay(day)),
    skyJournal: [],
    activePanel: 'hale',
    inventory: {},
    craftedItems: [],
    placedItems: [],
    actionsUsedToday: [],
    spirits: {
      lono: { points: 0, discovered: false, attention: 0 },
      kanaloa: { points: 0, discovered: false, attention: 0 },
      pueo_aumakua: { points: 0, discovered: false, attention: 0 },
      kane: { points: 0, discovered: false, attention: 0 },
      ku: { points: 0, discovered: false, attention: 0 },
      moo_aumakua: { points: 0, discovered: false, attention: 0 },
      shark_aumakua: { points: 0, discovered: false, attention: 0 },
    },
    jobs: [],
    messageLog: [greetingForDay(day)],
  };
}

// ─── small inventory helpers (pure) ──────────────────────────────────────────

/** Return a new inventory with `amount` of `id` added. */
export function addItem(inv: Inventory, id: ResourceId, amount: number): Inventory {
  return { ...inv, [id]: (inv[id] ?? 0) + amount };
}

/** Merge a reward bag into an inventory, returning a new inventory. */
export function addRewards(inv: Inventory, rewards: Inventory): Inventory {
  let next = inv;
  for (const [id, amount] of Object.entries(rewards) as [ResourceId, number][]) {
    next = addItem(next, id, amount);
  }
  return next;
}

/** Does the inventory cover every ingredient in `cost`? */
export function canAfford(inv: Inventory, cost: Inventory): boolean {
  return (Object.entries(cost) as [ResourceId, number][]).every(
    ([id, amount]) => (inv[id] ?? 0) >= amount,
  );
}

/** Subtract a cost from an inventory, returning a new inventory (clamped at 0). */
export function removeItems(inv: Inventory, cost: Inventory): Inventory {
  const next: Inventory = { ...inv };
  for (const [id, amount] of Object.entries(cost) as [ResourceId, number][]) {
    const remaining = (next[id] ?? 0) - amount;
    if (remaining > 0) next[id] = remaining;
    else delete next[id];
  }
  return next;
}
