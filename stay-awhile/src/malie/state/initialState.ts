/**
 * Mālie — the first morning. Day 1, the hale, an empty bag, and a clear sky.
 */
import type { GameState, Inventory, ResourceId, Season, Tide } from '../types/game';
import { guidanceForDay } from '../data/guidance';
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

export function createInitialState(): GameState {
  const day = 1;
  return {
    day,
    season: seasonForDay(day),
    tide: tideForDay(day),
    guidanceId: guidanceForDay(day).id,
    activePanel: 'hale',
    inventory: {},
    craftedItems: [],
    placedItems: [],
    actionsUsedToday: [],
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
