/**
 * Mālie — craftables: the placement/render half of a recipe.
 *
 * A Recipe owns cost + availability; a Craftable owns where it can go in the
 * hale and what art renders there. Only placeable items appear here — usable-
 * only tools (e.g. the fishing net) are intentionally absent, so they can't be
 * placed.
 *
 * Assets render per slot type from public/items/<id>/<slotType>.png. None exist
 * yet, so every placement falls back to the emoji icon until art is added.
 */
import type { Craftable, RecipeCategory, SlotType } from '../types/game';
import { recipeGlyph } from './recipes';

/** Build the per-slot-type asset map for an item from its allowed slots. */
function assetsFor(id: string, slots: SlotType[]): Partial<Record<SlotType, string>> {
  return slots.reduce(
    (acc, t) => ((acc[t] = `/items/${id}/${t}.png`), acc),
    {} as Partial<Record<SlotType, string>>,
  );
}

interface CraftableSeed {
  id: string;
  name: string;
  category: RecipeCategory;
  allowedSlots: SlotType[];
}

const SEEDS: CraftableSeed[] = [
  { id: 'woven_mat', name: 'Woven Mat', category: 'rest', allowedSlots: ['floor'] },
  {
    id: 'flower_shell_offering',
    name: 'Flower & Shell Offering',
    category: 'relationship',
    allowedSlots: ['shelf', 'cubby', 'floor'],
  },
  { id: 'poi_bowl', name: 'Poi Bowl', category: 'nourish', allowedSlots: ['shelf', 'cubby', 'floor'] },
  { id: 'star_marker', name: 'Star Marker', category: 'guidance', allowedSlots: ['shelf', 'wall', 'cubby'] },
  { id: 'hale_shelf', name: 'Hale Shelf', category: 'home', allowedSlots: ['floor', 'wall'] },
  { id: 'herb_bundle', name: 'Herb Bundle', category: 'tend', allowedSlots: ['wall', 'hanging', 'shelf'] },
  {
    id: 'limu_fish_plate',
    name: 'Limu & Fish Plate',
    category: 'nourish',
    allowedSlots: ['shelf', 'cubby', 'floor'],
  },

  // New placeables (from the asset-sheet expansion).
  { id: 'fish_basket', name: 'Fish Basket', category: 'fish', allowedSlots: ['floor', 'cubby'] },
  { id: 'limu_basket', name: 'Limu Basket', category: 'nourish', allowedSlots: ['floor', 'cubby'] },
  { id: 'planting_basket', name: 'Planting Basket', category: 'tend', allowedSlots: ['floor', 'cubby'] },
  { id: 'shell_bowl', name: 'Shell Bowl', category: 'relationship', allowedSlots: ['shelf', 'cubby'] },
  {
    id: 'water_bowl',
    name: 'Water Bowl',
    category: 'relationship',
    allowedSlots: ['shelf', 'cubby', 'floor'],
  },
  { id: 'wind_chime', name: 'Wind Chime', category: 'relationship', allowedSlots: ['hanging', 'wall'] },
  {
    id: 'feather_bundle',
    name: 'Feather Bundle',
    category: 'guidance',
    allowedSlots: ['wall', 'hanging', 'shelf'],
  },
  { id: 'carved_token', name: 'Carved Token', category: 'guidance', allowedSlots: ['shelf', 'wall', 'cubby'] },
  {
    id: 'kukui_light',
    name: 'Kukui Light',
    category: 'guidance',
    allowedSlots: ['shelf', 'cubby', 'floor'],
  },
  {
    id: 'gourd_bottle',
    name: 'Gourd Bottle',
    category: 'home',
    allowedSlots: ['shelf', 'cubby', 'floor'],
  },
  { id: 'folded_kapa', name: 'Folded Kapa', category: 'home', allowedSlots: ['shelf', 'cubby', 'floor'] },
];

export const CRAFTABLES: Record<string, Craftable> = SEEDS.reduce((acc, s) => {
  acc[s.id] = {
    id: s.id,
    name: s.name,
    category: s.category,
    allowedSlots: s.allowedSlots,
    inventoryIcon: recipeGlyph(s.id),
    assetBySlotType: assetsFor(s.id, s.allowedSlots),
  };
  return acc;
}, {} as Record<string, Craftable>);

export function craftableFor(recipeId: string): Craftable | undefined {
  return CRAFTABLES[recipeId];
}

/** Can an item made from this recipe be placed in the hale at all? */
export function isPlaceable(recipeId: string): boolean {
  return recipeId in CRAFTABLES;
}

/** Is this craftable allowed in this slot type? */
export function allowsSlotType(recipeId: string, type: SlotType): boolean {
  return CRAFTABLES[recipeId]?.allowedSlots.includes(type) ?? false;
}
