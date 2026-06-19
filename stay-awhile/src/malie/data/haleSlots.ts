/**
 * Mālie — hale placement slots.
 *
 * Coordinates are calibrated against the hale background art (concept sheet is
 * reference only — we do NOT slice it; each item is its own asset). `x`/`y` are
 * percentages of the background box; `scale` sizes the item; `zIndex` controls
 * overlap so things further "forward" (floor) draw over things further "back"
 * (wall / shelf).
 *
 * TODO(art): nudge x/y/scale to match the final hale background.
 */
import type { HaleSlot, SlotType } from '../types/game';

/** Item width as a % of the hale box at scale 1; a slot's `scale` multiplies it.
 *  Shared by the render layer and the calibration tool so footprints match. */
export const BASE_ITEM_WIDTH_PCT = 26;

/** Depth ordering by slot type — back to front. */
const Z_BY_TYPE: Record<SlotType, number> = {
  wall: 1,
  shelf: 2,
  hanging: 2,
  cubby: 3,
  floor: 5,
};

/** Raw slot positions, before zIndex is filled in. Calibrated against hale.png. */
const RAW: Omit<HaleSlot, 'zIndex'>[] = [
  { id: 'top_shelf_1', type: 'shelf', x: 46, y: 15.4, scale: 0.45, rotation: -1 },
  { id: 'top_shelf_2', type: 'shelf', x: 61.4, y: 15, scale: 0.45, rotation: -1 },
  { id: 'top_shelf_3', type: 'shelf', x: 76.7, y: 15, scale: 0.45 },

  { id: 'middle_shelf_1', type: 'shelf', x: 45.7, y: 24.5, scale: 0.35, rotation: -1 },
  { id: 'middle_shelf_2', type: 'shelf', x: 60.8, y: 24.4, scale: 0.35 },
  { id: 'middle_shelf_3', type: 'shelf', x: 76.3, y: 24.3, scale: 0.35 },

  { id: 'lower_shelf_1', type: 'shelf', x: 52.5, y: 33.3, scale: 0.35 },
  { id: 'lower_shelf_2', type: 'shelf', x: 70.4, y: 33.3, scale: 0.35 },

  { id: 'cubby_top_1', type: 'cubby', x: 48.1, y: 41.6, scale: 0.4, rotation: 1 },
  { id: 'cubby_top_2', type: 'cubby', x: 62, y: 42.1, scale: 0.35, rotation: 1 },
  { id: 'cubby_top_3', type: 'cubby', x: 76.3, y: 41.9, scale: 0.4, rotation: 1 },
  { id: 'cubby_top_4', type: 'cubby', x: 91.5, y: 42.2, scale: 0.35, rotation: 1 },

  { id: 'cubby_1', type: 'cubby', x: 38.8, y: 49.1, scale: 0.3, rotation: 2 },
  { id: 'cubby_2', type: 'cubby', x: 60.7, y: 49.6, scale: 0.3, rotation: 2 },
  { id: 'cubby_3', type: 'cubby', x: 82.2, y: 49.9, scale: 0.3, rotation: 1 },
  { id: 'cubby_4', type: 'cubby', x: 39.7, y: 54.8, scale: 0.2, rotation: 2 },
  { id: 'cubby_5', type: 'cubby', x: 60.6, y: 55.3, scale: 0.2, rotation: 2 },
  { id: 'cubby_6', type: 'cubby', x: 82.4, y: 55.9, scale: 0.2, rotation: 2 },
  { id: 'cubby_7', type: 'cubby', x: 39.6, y: 59.5, scale: 0.2, rotation: 3 },
  { id: 'cubby_8', type: 'cubby', x: 60.5, y: 60.4, scale: 0.2, rotation: 2 },
  { id: 'cubby_9', type: 'cubby', x: 82.3, y: 61.1, scale: 0.2, rotation: 2 },

  { id: 'floor_left', type: 'floor', x: 39.9, y: 75.2, scale: 1.1, rotation: 4 },
  { id: 'floor_center', type: 'floor', x: 76.4, y: 76.4, scale: 1.05, rotation: 4 },
  { id: 'wall_left', type: 'wall', x: 28.9, y: 14.9, scale: 0.45 },
];

/** Slots with their depth filled in. zIndex nudged by y so equal-type slots
 *  lower on screen still draw slightly in front. */
export const HALE_SLOTS: HaleSlot[] = RAW.map((s) => ({
  ...s,
  zIndex: Z_BY_TYPE[s.type] * 10 + Math.round(s.y / 10),
}));

export const HALE_SLOTS_BY_ID: Record<string, HaleSlot> = HALE_SLOTS.reduce(
  (acc, s) => ((acc[s.id] = s), acc),
  {} as Record<string, HaleSlot>,
);

export function getSlot(id: string): HaleSlot | undefined {
  return HALE_SLOTS_BY_ID[id];
}
