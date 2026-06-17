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

/** Every gatherable resource in the world. */
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
  | 'tide_pool_gift';

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

/** A crafted item set into a hale slot. */
export interface PlacedItem {
  craftedItemId: string;
  slot: number;
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
  | { type: 'PLACE_ITEM'; craftedItemId: string; slot: number }
  | { type: 'END_DAY' }
  | { type: 'RESET_GAME' }
  | { type: 'HYDRATE'; state: GameState };
