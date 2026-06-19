/**
 * Mālie — core game types.
 *
 * A cozy ahupuaʻa-inspired tending game. The loop is:
 * observe → gather → craft → place → rest.
 *
 * Everything here is plain data. The reducer (state/gameReducer.ts) is the only
 * place that mutates a GameState, and it does so purely (returns a new object).
 */

/** Season of the year. MVP cycles through these every few days. */
export type Season = 'Hooilo' | 'Kau' | 'Makahiki' | 'Transition';

/** The state of the shore. Cycles once per day. */
export type Tide = 'low' | 'rising' | 'high' | 'falling';

/** The four parts of the ahupuaʻa the player moves between. */
export type PanelId = 'lewa_wao' | 'kula_kahawai' | 'kahakai_moana' | 'hale';

/** Every resource in the world — gathered, or prepared as a crafting material. */
export type ResourceId =
  | 'flower'
  | 'leaf'
  | 'feather'
  | 'star_sign'
  | 'smooth_stone'
  | 'kalo'
  | 'fiber'
  | 'wood'
  | 'gourd'
  | 'herb'
  | 'bark_fiber'
  | 'shell'
  | 'fish'
  | 'limu'
  | 'driftwood'
  | 'tide_pool_gift'
  // gathered additions
  | 'kukui'
  | 'wauke'
  | 'lauhala'
  | 'coral'
  // prepared materials (made at Craft, consumed by other recipes)
  | 'cordage'
  | 'kapa_cloth';

/** A bag of resources: resource id → count. */
export type Inventory = Partial<Record<ResourceId, number>>;

/** Static description of a resource, for display. */
export interface Resource {
  id: ResourceId;
  name: string;
  /** A small glyph stand-in until illustrated assets land. */
  glyph: string;
  /** One quiet line of flavor. */
  note: string;
}

/**
 * Conditional bonus rewards layered on top of a panel action's base rewards
 * when the day's sign or tide lines up.
 */
export interface ConditionalReward {
  guidanceId?: string;
  tide?: Tide;
  rewards: Inventory;
}

/** Something the player can do within a panel. Most cost nothing but the day. */
export interface PanelAction {
  id: string;
  label: string;
  description: string;
  panelId: PanelId;
  /** A verb hint used purely for the button's small icon/tone. */
  kind: 'observe' | 'gather' | 'tend' | 'fish';
  rewards?: Inventory;
  conditionalRewards?: ConditionalReward[];
}

/** A part of the ecosystem the player can visit. */
export interface Panel {
  id: PanelId;
  title: string;
  subtitle: string;
  description: string;
  glyph: string;
}

/** What family of thing a recipe makes. Flavor + light grouping only. */
export type RecipeCategory =
  | 'rest'
  | 'nourish'
  | 'tend'
  | 'fish'
  | 'guidance'
  | 'relationship'
  | 'home';

/** What a crafted result can be/do. All optional, all soft. */
export interface RecipeResult {
  /** Can be set down in the hale. */
  placeable?: boolean;
  /** Can be used (a quiet flavor flag for MVP). */
  usable?: boolean;
  /** A gesture of gratitude. */
  offering?: boolean;
  /** Something the hale remembers in its morning greeting. */
  memory?: boolean;
  /** A lasting tool. Crafted once, kept, and unlocks other recipes. */
  tool?: boolean;
}

/** A light crafting recipe — never more than a few ingredients. */
export interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  description: string;
  ingredients: Inventory;
  /** When the world allows this craft. Omitted means always. */
  availableWhen?: {
    tides?: Tide[];
    seasons?: Season[];
    signs?: string[];
  };
  /** Tools (recipe ids) the player must own before this can be crafted. */
  requiresTools?: string[];
  /**
   * If set, crafting yields these resources into the bag instead of producing a
   * placeable/kept item — for preparing materials like cordage or kapa cloth.
   */
  yields?: Inventory;
  result: RecipeResult;
}

/** A specific thing the player has made, with the day it was made. */
export interface CraftedItem {
  /** Unique instance id. */
  id: string;
  recipeId: string;
  name: string;
  placed: boolean;
  createdDay: number;
}

/** The kinds of spots in the hale a crafted item can occupy. */
export type SlotType = 'shelf' | 'cubby' | 'floor' | 'wall' | 'hanging';

/**
 * A placement spot painted onto the hale background. `x`/`y` are percentages of
 * the background box (0–100), `scale` sizes the item relative to a base size,
 * `zIndex` controls front/back overlap, `rotation` (deg) is optional.
 */
export interface HaleSlot {
  id: string;
  type: SlotType;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
  rotation?: number;
}

/**
 * Placement metadata for a craftable, keyed by its recipe id. Separate from the
 * Recipe (which owns cost + availability) so art/placement can evolve freely.
 */
export interface Craftable {
  /** Matches the Recipe id. */
  id: string;
  name: string;
  category: RecipeCategory;
  /** Which slot types this item is allowed to occupy. */
  allowedSlots: SlotType[];
  /** Emoji or icon path shown in lists/trays. */
  inventoryIcon: string;
  /** Asset to render per slot type; missing/failed loads fall back to the icon. */
  assetBySlotType: Partial<Record<SlotType, string>>;
}

/** A crafted item set into a named hale slot. */
export interface PlacedItem {
  craftedItemId: string;
  slotId: string;
}

/** A day's reading of the sky/sea — guidance that colors the day. */
export interface Guidance {
  id: string;
  name: string;
  message: string;
  effectDescription: string;
}

/** The whole game, in one serializable object. */
export interface GameState {
  day: number;
  season: Season;
  tide: Tide;
  guidanceId: string;
  activePanel: PanelId;
  inventory: Inventory;
  craftedItems: CraftedItem[];
  placedItems: PlacedItem[];
  /** Panel-action ids already done today. Reset each dawn. */
  actionsUsedToday: string[];
  /** Newest-first log of gentle messages. */
  messageLog: string[];
}

/** Everything the reducer understands. */
export type GameAction =
  | { type: 'SET_PANEL'; panelId: PanelId }
  | { type: 'PERFORM_PANEL_ACTION'; actionId: string }
  | { type: 'CRAFT'; recipeId: string }
  | { type: 'PLACE_ITEM'; craftedItemId: string; slotId: string }
  | { type: 'END_DAY' }
  | { type: 'RESET_GAME' }
  | { type: 'HYDRATE'; state: GameState };
