/**
 * Mālie — recipes. Crafting is intentionally light: two or three ingredients,
 * no deep dependency chains. The result is something to place, use, offer, or
 * remember — never a number that goes up.
 */
import type { Recipe } from '../types/game';

export const RECIPES: Recipe[] = [
  {
    id: 'woven_mat',
    name: 'Woven Mat',
    category: 'rest',
    description: 'A simple mat for the hale floor.',
    ingredients: { fiber: 3, leaf: 1 },
    result: { placeable: true },
  },
  {
    id: 'flower_shell_offering',
    name: 'Flower & Shell Offering',
    category: 'relationship',
    description: 'A quiet offering of gratitude.',
    ingredients: { flower: 1, shell: 1 },
    availableWhen: { tides: ['low', 'falling'] },
    result: { placeable: true, offering: true },
  },
  {
    id: 'poi_bowl',
    name: 'Poi Bowl',
    category: 'nourish',
    description: 'Prepared kalo in a wooden bowl.',
    ingredients: { kalo: 2, wood: 1 },
    result: { placeable: true, usable: true },
  },
  {
    id: 'fishing_net',
    name: 'Fishing Net',
    category: 'fish',
    description: 'A small net for gentle shoreline fishing.',
    ingredients: { fiber: 3, shell: 1 },
    result: { usable: true },
  },
  {
    id: 'star_marker',
    name: 'Star Marker',
    category: 'guidance',
    description: 'A smooth stone marked after observing the sky.',
    ingredients: { smooth_stone: 1, star_sign: 1 },
    result: { placeable: true, memory: true },
  },
  {
    id: 'hale_shelf',
    name: 'Hale Shelf',
    category: 'home',
    description: 'A simple shelf where crafted items can rest.',
    ingredients: { wood: 3, fiber: 1 },
    result: { placeable: true },
  },
  {
    id: 'herb_bundle',
    name: 'Herb Bundle',
    category: 'tend',
    description: 'A fragrant bundle gathered from the garden.',
    ingredients: { herb: 2, leaf: 1 },
    result: { placeable: true, usable: true },
  },
  {
    id: 'limu_fish_plate',
    name: 'Limu & Fish Plate',
    category: 'nourish',
    description: 'A small nourishing meal from the sea.',
    ingredients: { fish: 1, limu: 1 },
    result: { placeable: true, usable: true },
  },
];

/** Placeholder glyphs for crafted items. TODO(assets): replace with art. */
export const RECIPE_GLYPHS: Record<string, string> = {
  woven_mat: '🟫',
  flower_shell_offering: '🌸',
  poi_bowl: '🥣',
  fishing_net: '🕸️',
  star_marker: '🌟',
  hale_shelf: '🪜',
  herb_bundle: '🌿',
  limu_fish_plate: '🍽️',
};

export function recipeGlyph(recipeId: string): string {
  return RECIPE_GLYPHS[recipeId] ?? '🎍';
}

export const RECIPES_BY_ID: Record<string, Recipe> = RECIPES.reduce(
  (acc, r) => ((acc[r.id] = r), acc),
  {} as Record<string, Recipe>,
);

export function findRecipe(recipeId: string): Recipe | undefined {
  return RECIPES_BY_ID[recipeId];
}
