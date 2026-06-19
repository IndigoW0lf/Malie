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
  // crop harvests
  | 'uala'
  | 'awa'
  | 'ti_leaf'
  | 'banana'
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
  /** A verb hint used for the button's tone. 'restraint' = giving, not taking. */
  kind: 'observe' | 'gather' | 'tend' | 'fish' | 'restraint';
  rewards?: Inventory;
  conditionalRewards?: ConditionalReward[];
  /** Resources this action gives back / spends (e.g. returning a fish). */
  cost?: Inventory;
  /** Pilina points this action offers to presences. */
  spiritGain?: Partial<Record<SpiritId, number>>;
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

// ─── Timed jobs (real-time growth / fishing / crafting) ──────────────────────

/** What a running job is: a crop growing, a net soaking, or a craft building. */
export type JobKind = 'crop' | 'net' | 'craft';

/**
 * A unit of work that takes real time. Readiness is *derived* from the clock —
 * we store `startedAt`/`readyAt` (in game-clock ms, see gameNow) and never a
 * "stage", so progress survives reloads and offline time with no bookkeeping.
 */
export interface TimedJob {
  /** Unique instance id (monotonic, like crafted items). */
  id: string;
  kind: JobKind;
  /** The station id (crop/net) or recipe id (craft) this job runs. */
  definitionId: string;
  /** For crop/net: the station slot it occupies. Undefined for craft. */
  slotId?: string;
  /** Game-clock ms when the job started and when it becomes ready. */
  startedAt: number;
  readyAt: number;
  /** What collecting drops into the bag (snapshotted at start, with modifiers). */
  yield: Inventory;
  /** Pilina points granted when the job is collected. */
  spiritGain?: Partial<Record<SpiritId, number>>;
  /** Crop only: a one-time tend has been given (adds a little yield + pilina). */
  tended?: boolean;
}

/**
 * Centralized Pilina effects for the timed systems. Derived from `spirits` (see
 * deriveModifiers) so relationship blessings live in ONE place instead of being
 * scattered across actions. Multipliers <1 mean "faster"; bonuses are additive.
 */
export interface GameModifiers {
  cropDurationMultiplier: number;
  cropYieldBonus: number;
  craftDurationMultiplier: number;
  netDurationMultiplier: number;
  netYieldBonus: number;
  /** Kanaloa, deep in pilina: a set net always brings something home. */
  preventEmptyNet: boolean;
  /** Pueo, trusted: tomorrow's sign is shown at dawn. */
  revealNextGuidance: boolean;
}

/** A day's reading of the sky/sea — guidance that colors the day. */
export interface Guidance {
  id: string;
  name: string;
  message: string;
  effectDescription: string;
}

// ─── Pilina (relationships with akua / ʻaumākua) ─────────────────────────────

/** The presences the player can come into relationship with. */
export type SpiritId =
  | 'lono'
  | 'kanaloa'
  | 'pueo_aumakua'
  | 'kane'
  | 'ku'
  | 'moo_aumakua'
  | 'shark_aumakua';

export type SpiritKind = 'akua' | 'aumakua';

/** The player's relationship with one presence. `points` drives the level;
 *  `discovered` flips true the first time the presence is noticed. `attention`
 *  is hidden pity — it rises on a near-miss and lifts the next chance, so luck
 *  never fully stalls discovery. */
export interface SpiritRelationship {
  points: number;
  discovered: boolean;
  attention: number;
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
  /** Pilina relationships, keyed by presence. */
  spirits: Record<SpiritId, SpiritRelationship>;
  /** Running timed jobs — crops growing, nets soaking, crafts building. */
  jobs: TimedJob[];
  /** Newest-first log of gentle messages. */
  messageLog: string[];

  // ─── spine ────────────────────────────────────────────────────────────────
  /** Seeded PRNG state. Keeps the reducer pure and randomness reproducible. */
  rng: number;
  /** Monotonic counter for unique entity ids (never reuses, unlike array length). */
  nextEntityId: number;
  /** ms to add to client `Date.now()` to project server time (anti-clock-cheat).
   *  Re-anchored from the server on every load — not a place to store skips. */
  timeOffsetMs: number;
  /** Accumulated time the player has skipped forward by resting. Persisted, and
   *  added on top of the server anchor — so job timestamps stay immutable facts
   *  and all deliberate time-skipping lives in one field. */
  skipOffsetMs: number;
}

/** Everything the reducer understands. */
export type GameAction =
  | { type: 'SET_PANEL'; panelId: PanelId }
  | { type: 'PERFORM_PANEL_ACTION'; actionId: string }
  | { type: 'CRAFT'; recipeId: string }
  | { type: 'OFFER_TO_SPIRIT'; spiritId: SpiritId; craftedItemId: string }
  | { type: 'PLACE_ITEM'; craftedItemId: string; slotId: string }
  // ─── timed jobs ────────────────────────────────────────────────────────────
  /** Plant a crop / set a net — claims the next free slot in its pool. */
  | { type: 'START_JOB'; plantableId: string }
  /** A one-time tending gesture on a growing crop. */
  | { type: 'TEND_JOB'; jobId: string }
  /** Harvest a crop / haul in a net once ready. */
  | { type: 'COLLECT_JOB'; jobId: string }
  /** Begin building a tool/object (timed; one at a time). */
  | { type: 'START_CRAFT'; recipeId: string }
  /** Claim a finished craft into the bag / crafted items. */
  | { type: 'CLAIM_CRAFT'; jobId: string }
  /** Pull every running job forward to the moment the soonest one is ready. */
  | { type: 'REST_UNTIL_NEXT_READY' }
  | { type: 'END_DAY' }
  | { type: 'SET_TIME_OFFSET'; offsetMs: number }
  | { type: 'RESET_GAME' }
  | { type: 'HYDRATE'; state: GameState };
