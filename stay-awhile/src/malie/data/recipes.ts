/**
 * Mālie — recipes. Crafting stays light: a couple of ingredients, no deep
 * dependency chains. Three shapes of recipe:
 *
 *  • tools     — `result.tool`; crafted once, kept, and unlock other recipes.
 *  • materials — `yields`; produce a resource into the bag (cordage, kapa cloth).
 *  • objects   — `result.placeable/offering/...`; things you set down in the hale.
 *
 * `requiresTools` gates a recipe behind owning a tool (e.g. kapa cloth needs the
 * kapa beater). The chains never run deeper than tool + one prepared material.
 */
import type { Recipe } from '../types/game';

export const RECIPES: Recipe[] = [
  // ─── Tools (craft once, kept, unlock other crafts) ─────────────────────────
  {
    id: 'kapa_beater',
    name: 'Kapa Beater',
    category: 'home',
    description: 'A grooved wooden beater. Lets you make kapa cloth.',
    ingredients: { wood: 1, smooth_stone: 1 },
    result: { tool: true },
  },
  {
    id: 'net_needle',
    name: 'Net Needle',
    category: 'fish',
    description: 'A netting shuttle for knotting nets and baskets.',
    ingredients: { wood: 1, fiber: 2 },
    result: { tool: true },
  },
  {
    id: 'shell_knife',
    name: 'Shell Knife',
    category: 'home',
    description: 'A sharp shell edge for cutting and carving.',
    ingredients: { shell: 1, wood: 1 },
    result: { tool: true },
  },
  {
    id: 'digging_stick',
    name: 'Digging Stick (ʻŌʻō)',
    category: 'tend',
    description: 'A fire-hardened stick for working the soil.',
    ingredients: { wood: 2, fiber: 1 },
    result: { tool: true },
  },

  // ─── Materials (prepared, then used by other recipes) ──────────────────────
  {
    id: 'cordage',
    name: 'Cordage',
    category: 'home',
    description: 'Twist fiber into strong cord.',
    ingredients: { fiber: 3 },
    yields: { cordage: 1 },
    result: {},
  },
  {
    id: 'kapa_cloth',
    name: 'Kapa Cloth',
    category: 'home',
    description: 'Beat soaked wauke bark into soft cloth.',
    ingredients: { wauke: 2 },
    requiresTools: ['kapa_beater'],
    yields: { kapa_cloth: 1 },
    result: {},
  },

  // ─── Rest / Nourish / Tend ─────────────────────────────────────────────────
  {
    id: 'woven_mat',
    name: 'Woven Mat',
    category: 'rest',
    description: 'A simple mat for the hale floor.',
    ingredients: { fiber: 3, leaf: 1 },
    result: { placeable: true },
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
    id: 'limu_fish_plate',
    name: 'Limu & Fish Plate',
    category: 'nourish',
    description: 'A small nourishing meal from the sea.',
    ingredients: { fish: 1, limu: 1 },
    result: { placeable: true, usable: true },
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
    id: 'planting_basket',
    name: 'Planting Basket',
    category: 'tend',
    description: 'A woven basket for starts and seed.',
    ingredients: { lauhala: 2 },
    requiresTools: ['digging_stick'],
    result: { placeable: true, usable: true },
  },

  // ─── Fish ──────────────────────────────────────────────────────────────────
  {
    id: 'fishing_net',
    name: 'Fishing Net',
    category: 'fish',
    description: 'A small net for gentle shoreline fishing. Kept, and used to set nets.',
    ingredients: { fiber: 3, shell: 1 },
    requiresTools: ['net_needle'],
    result: { tool: true },
  },
  {
    id: 'fish_basket',
    name: 'Fish Basket (Hīnaʻi)',
    category: 'fish',
    description: 'A woven trap-basket to keep the day’s catch.',
    ingredients: { lauhala: 2, cordage: 1 },
    requiresTools: ['net_needle'],
    result: { placeable: true, usable: true },
  },
  {
    id: 'limu_basket',
    name: 'Limu Basket',
    category: 'nourish',
    description: 'A small basket for gathering seaweed.',
    ingredients: { lauhala: 2 },
    requiresTools: ['shell_knife'],
    result: { placeable: true, usable: true },
  },

  // ─── Relationship / Offerings ──────────────────────────────────────────────
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
    id: 'shell_bowl',
    name: 'Shell Bowl',
    category: 'relationship',
    description: 'A polished shell to hold a small offering.',
    ingredients: { shell: 2 },
    result: { placeable: true, offering: true },
  },
  {
    id: 'water_bowl',
    name: 'Water Bowl',
    category: 'relationship',
    description: 'Fresh water held in a wide ipu vessel.',
    ingredients: { gourd: 1 },
    result: { placeable: true, offering: true },
  },
  {
    id: 'wind_chime',
    name: 'Shell Hanging',
    category: 'relationship',
    description: 'Shells and cord hung where the breeze can move them.',
    ingredients: { shell: 3, cordage: 1 },
    result: { placeable: true },
  },

  // ─── Guidance ──────────────────────────────────────────────────────────────
  {
    id: 'leaf_bundle',
    name: 'Lā‘ī Bundle',
    category: 'guidance',
    description: 'Tī leaves gathered, bound, and kept — a quiet token.',
    ingredients: { leaf: 2, fiber: 1 },
    result: { placeable: true, offering: true },
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
    id: 'carved_token',
    name: 'Carved Token',
    category: 'guidance',
    description: 'A symbol carved into stone and coral.',
    ingredients: { smooth_stone: 1, coral: 1 },
    requiresTools: ['shell_knife'],
    result: { placeable: true, memory: true },
  },
  {
    id: 'kukui_light',
    name: 'Kukui Light',
    category: 'guidance',
    description: 'A small lamp of kukui nut and cord.',
    ingredients: { kukui: 2, cordage: 1 },
    result: { placeable: true, usable: true },
  },

  // ─── Home / structures ─────────────────────────────────────────────────────
  {
    id: 'hale_shelf',
    name: 'Hale Shelf',
    category: 'home',
    description: 'A simple shelf where crafted items can rest.',
    ingredients: { wood: 3, fiber: 1 },
    result: { placeable: true },
  },
  {
    id: 'gourd_bottle',
    name: 'Gourd Bottle (Huewai)',
    category: 'home',
    description: 'A water gourd bound with cord.',
    ingredients: { gourd: 1, cordage: 1 },
    result: { placeable: true, usable: true },
  },
  {
    id: 'folded_kapa',
    name: 'Folded Kapa',
    category: 'home',
    description: 'Soft kapa cloth, folded and set aside.',
    ingredients: { kapa_cloth: 1 },
    result: { placeable: true },
  },
];

/** Placeholder glyphs for crafted items. TODO(assets): replace with art. */
export const RECIPE_GLYPHS: Record<string, string> = {
  // tools
  kapa_beater: '🔨',
  net_needle: '🧷',
  shell_knife: '🔪',
  digging_stick: '⛏️',
  // materials
  cordage: '🧶',
  kapa_cloth: '🧻',
  // objects
  woven_mat: '🟫',
  poi_bowl: '🥣',
  limu_fish_plate: '🍽️',
  herb_bundle: '🌿',
  planting_basket: '🪴',
  fishing_net: '🕸️',
  fish_basket: '🧺',
  limu_basket: '🪣',
  flower_shell_offering: '🌸',
  shell_bowl: '🥣',
  water_bowl: '🥛',
  wind_chime: '🎐',
  leaf_bundle: '🌿',
  star_marker: '🌟',
  carved_token: '🗿',
  kukui_light: '🪔',
  hale_shelf: '🪜',
  gourd_bottle: '🍶',
  folded_kapa: '🧣',
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

/** True when a recipe produces a lasting tool. */
export function isToolRecipe(recipeId: string): boolean {
  return RECIPES_BY_ID[recipeId]?.result.tool === true;
}

/** Base build time for a timed craft, before Kū's blessing. Tools take longer. */
export const CRAFT_BASE_MS = 2 * 60_000;
export const TOOL_BASE_MS = 3 * 60_000;

/** Base build time (ms) for a recipe before Pilina modifiers. */
export function craftBaseMs(recipe: Recipe): number {
  return recipe.result.tool ? TOOL_BASE_MS : CRAFT_BASE_MS;
}

/** Materials (yield a resource into the bag) are prepared instantly; tools and
 *  objects are built over time. */
export function isTimedCraft(recipe: Recipe): boolean {
  return !recipe.yields;
}
