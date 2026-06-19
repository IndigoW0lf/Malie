/**
 * Mālie — the timed-growing world, in two halves:
 *
 *  • PLOTS    — fixed physical spots on a scene (a garden bed, the loʻi, the
 *               grove, a net spot). They have positions so growth art can be
 *               overlaid on the right field. Slots of the same `group` form a
 *               pool: e.g. three garden beds you can fill with any crop.
 *  • PLANTABLES — the things you can plant or set, chosen from the Tend menu.
 *               A plantable targets a slot `group`; starting it claims the next
 *               free slot in that group.
 *
 * So: three garden beds + {herb, flower, ipu} crops = up to three crops growing
 * at once, in any mix. The loʻi (kalo) and grove (kukui) are single slots — one
 * at a time. Nets pool into three shore spots and need a crafted Fishing Net.
 *
 * Durations are short here so growth is visible within a jam session; lengthen
 * them toward "come back later" for release. Pilina deepens via deriveModifiers.
 */
import type { Inventory, PanelId, ResourceId, SpiritId, Tide } from '../types/game';

export type SlotGroup = 'garden' | 'loi' | 'grove' | 'net';

/** One possible result of hauling a net — picked at collection time by weight. */
export interface CatchOption {
  /** Display name (Hawaiian fish), recorded in the message/journal. */
  species: string;
  /** Relative likelihood. */
  weight: number;
  /** Fish this catch brings. */
  fish: number;
  /** Anything else it brings (limu, shell). */
  extra?: Inventory;
}

/** A fixed spot on a scene that can hold one running job. */
export interface PlotSlot {
  id: string;
  group: SlotGroup;
  panelId: PanelId;
  /** Overlay position, as % of the stage box (where growth art sits). */
  x: number;
  y: number;
}

/** Something you can plant (crop) or set (net) from the Tend menu. */
export interface Plantable {
  id: string;
  kind: 'crop' | 'net';
  group: SlotGroup;
  name: string;
  glyph: string;
  panelId: PanelId;
  /** Base grow / soak time in ms, before Pilina modifiers. */
  durationMs: number;
  /** Cost to start (seed / labor). Usually nothing — time is the cost. */
  cost?: Inventory;
  /** A crafted item that must be owned to start (e.g. the Fishing Net). */
  requiresCraft?: string;
  /** Base yield on collect, before yield bonuses. */
  baseYield: Inventory;
  /** Pilina granted on collect (deliberate tending — always lands). */
  spiritGain?: Partial<Record<SpiritId, number>>;
  startVerb: string;
  readyVerb: string;
  /** Word for the in-progress state ("growing", "soaking"). */
  workingLabel: string;

  // ─── net-only: the catch is resolved at collect time, not snapshotted ───────
  /** Possible species; one is chosen by weighted roll when hauled in. */
  catch?: CatchOption[];
  /** Tides that improve the haul (+1 fish). */
  tideBoost?: Tide[];
  /** A day's sign that improves the haul (+1 fish). */
  luckySign?: string;
}

/** One game-minute, in ms. */
const MIN = 60_000;

// ─── Plots: the fixed spots on each scene ──────────────────────────────────────
// TODO(art): x/y are rough — nudge against the real scene art when the growth
// sprites land, then place public/fields/<plantable>/<stage>.png over each slot.
export const PLOTS: PlotSlot[] = [
  // Kula / Kahawai — three garden beds (pool), the loʻi, the grove.
  { id: 'garden_a', group: 'garden', panelId: 'kula_kahawai', x: 72, y: 30 },
  { id: 'garden_b', group: 'garden', panelId: 'kula_kahawai', x: 83, y: 40 },
  { id: 'garden_c', group: 'garden', panelId: 'kula_kahawai', x: 75, y: 50 },
  { id: 'loi_a', group: 'loi', panelId: 'kula_kahawai', x: 44, y: 72 },
  { id: 'grove_a', group: 'grove', panelId: 'kula_kahawai', x: 17, y: 45 },

  // Kahakai / Moana — three net spots (pool).
  { id: 'net_a', group: 'net', panelId: 'kahakai_moana', x: 32, y: 60 },
  { id: 'net_b', group: 'net', panelId: 'kahakai_moana', x: 50, y: 73 },
  { id: 'net_c', group: 'net', panelId: 'kahakai_moana', x: 68, y: 64 },
];

// ─── Plantables: what you can plant / set ──────────────────────────────────────
// The garden pool holds many more crops than there are beds (3), so choosing
// what to grow — food, fabric, cordage, offering, or relationship crop — is the
// real decision. The loʻi is for kalo; the grove for trees.
export const PLANTABLES: Plantable[] = [
  // ─── Loʻi ──────────────────────────────────────────────────────────────────
  {
    id: 'kalo',
    kind: 'crop',
    group: 'loi',
    name: 'Kalo',
    glyph: '🌱',
    panelId: 'kula_kahawai',
    durationMs: 5 * MIN,
    baseYield: { kalo: 3, leaf: 1 },
    spiritGain: { lono: 1, moo_aumakua: 1, kane: 1 },
    startVerb: 'Plant',
    readyVerb: 'Harvest',
    workingLabel: 'growing',
  },

  // ─── Garden beds (pool of 3 — pick among these) ─────────────────────────────
  {
    id: 'uala',
    kind: 'crop',
    group: 'garden',
    name: 'ʻUala (Sweet Potato)',
    glyph: '🥔',
    panelId: 'kula_kahawai',
    durationMs: 4 * MIN,
    baseYield: { uala: 3, leaf: 1 },
    spiritGain: { lono: 1 },
    startVerb: 'Plant',
    readyVerb: 'Harvest',
    workingLabel: 'growing',
  },
  {
    id: 'wauke',
    kind: 'crop',
    group: 'garden',
    name: 'Wauke (Paper Mulberry)',
    glyph: '🟫',
    panelId: 'kula_kahawai',
    durationMs: 6 * MIN,
    baseYield: { wauke: 3, bark_fiber: 1 },
    spiritGain: { ku: 1, lono: 1 },
    startVerb: 'Plant',
    readyVerb: 'Strip',
    workingLabel: 'growing',
  },
  {
    id: 'ti',
    kind: 'crop',
    group: 'garden',
    name: 'Kī (Tī Leaf)',
    glyph: '🎍',
    panelId: 'kula_kahawai',
    durationMs: 4 * MIN,
    baseYield: { ti_leaf: 3 },
    spiritGain: { lono: 1, pueo_aumakua: 1 },
    startVerb: 'Plant',
    readyVerb: 'Gather',
    workingLabel: 'growing',
  },
  {
    id: 'awa',
    kind: 'crop',
    group: 'garden',
    name: 'ʻAwa (Kava)',
    glyph: '🫚',
    panelId: 'kula_kahawai',
    durationMs: 8 * MIN,
    baseYield: { awa: 2 },
    spiritGain: { kane: 1, lono: 1 },
    startVerb: 'Plant',
    readyVerb: 'Harvest',
    workingLabel: 'growing',
  },
  {
    id: 'herb',
    kind: 'crop',
    group: 'garden',
    name: 'Herbs',
    glyph: '🌿',
    panelId: 'kula_kahawai',
    durationMs: 3 * MIN,
    baseYield: { herb: 2, leaf: 1 },
    spiritGain: { lono: 1, kane: 1 },
    startVerb: 'Plant',
    readyVerb: 'Gather',
    workingLabel: 'growing',
  },
  {
    id: 'flower',
    kind: 'crop',
    group: 'garden',
    name: 'Flowers',
    glyph: '🌺',
    panelId: 'kula_kahawai',
    durationMs: 3 * MIN,
    baseYield: { flower: 2, leaf: 1 },
    spiritGain: { kane: 1 },
    startVerb: 'Plant',
    readyVerb: 'Gather',
    workingLabel: 'growing',
  },
  {
    id: 'ipu',
    kind: 'crop',
    group: 'garden',
    name: 'Ipu (Gourd)',
    glyph: '🥥',
    panelId: 'kula_kahawai',
    durationMs: 6 * MIN,
    baseYield: { gourd: 2 },
    spiritGain: { lono: 1 },
    startVerb: 'Plant',
    readyVerb: 'Harvest',
    workingLabel: 'growing',
  },

  // ─── Grove ──────────────────────────────────────────────────────────────────
  {
    id: 'kukui',
    kind: 'crop',
    group: 'grove',
    name: 'Kukui Grove',
    glyph: '🌳',
    panelId: 'kula_kahawai',
    durationMs: 8 * MIN,
    baseYield: { kukui: 3 },
    spiritGain: { ku: 1 },
    startVerb: 'Tend',
    readyVerb: 'Gather',
    workingLabel: 'ripening',
  },
  {
    id: 'maia',
    kind: 'crop',
    group: 'grove',
    name: 'Maiʻa (Banana)',
    glyph: '🍌',
    panelId: 'kula_kahawai',
    durationMs: 7 * MIN,
    baseYield: { banana: 3 },
    spiritGain: { lono: 1, kane: 1 },
    startVerb: 'Tend',
    readyVerb: 'Gather',
    workingLabel: 'ripening',
  },

  // ─── Kahakai / Moana — nets (need a Fishing Net; catch resolved on haul) ─────
  {
    id: 'net_fishpond',
    kind: 'net',
    group: 'net',
    name: 'Loko Iʻa (Fishpond)',
    glyph: '🐟',
    panelId: 'kahakai_moana',
    durationMs: 4 * MIN,
    requiresCraft: 'fishing_net',
    baseYield: { fish: 2 },
    spiritGain: { kanaloa: 1 },
    startVerb: 'Set net',
    readyVerb: 'Haul in',
    workingLabel: 'soaking',
    tideBoost: ['high', 'rising'],
    luckySign: 'iwa_birds',
    catch: [
      { species: 'ʻamaʻama', weight: 3, fish: 2 },
      { species: 'ʻanae', weight: 2, fish: 2 },
      { species: 'ʻōpae', weight: 1, fish: 1 },
    ],
  },
  {
    id: 'net_shore',
    kind: 'net',
    group: 'net',
    name: 'Shore Net',
    glyph: '🌊',
    panelId: 'kahakai_moana',
    durationMs: 3 * MIN,
    requiresCraft: 'fishing_net',
    baseYield: { fish: 1, limu: 1 },
    spiritGain: { kanaloa: 1 },
    startVerb: 'Set net',
    readyVerb: 'Haul in',
    workingLabel: 'soaking',
    tideBoost: ['low', 'falling'],
    luckySign: 'iwa_birds',
    catch: [
      { species: 'manini', weight: 3, fish: 1, extra: { limu: 1 } },
      { species: 'ʻōpelu', weight: 2, fish: 2 },
      { species: 'weke', weight: 1, fish: 1, extra: { limu: 1 } },
    ],
  },
  {
    id: 'net_reef',
    kind: 'net',
    group: 'net',
    name: 'Reef Net',
    glyph: '🪸',
    panelId: 'kahakai_moana',
    durationMs: 6 * MIN,
    requiresCraft: 'fishing_net',
    baseYield: { fish: 2, shell: 1 },
    spiritGain: { kanaloa: 1, shark_aumakua: 1 },
    startVerb: 'Set net',
    readyVerb: 'Haul in',
    workingLabel: 'soaking',
    tideBoost: ['low'],
    luckySign: 'watchful_sea',
    catch: [
      { species: 'uhu', weight: 2, fish: 2, extra: { shell: 1 } },
      { species: 'kūmū', weight: 2, fish: 2 },
      { species: 'weke', weight: 1, fish: 1, extra: { shell: 1 } },
    ],
  },
];

const PLOTS_BY_ID: Record<string, PlotSlot> = PLOTS.reduce(
  (acc, p) => ((acc[p.id] = p), acc),
  {} as Record<string, PlotSlot>,
);
const PLANTABLES_BY_ID: Record<string, Plantable> = PLANTABLES.reduce(
  (acc, p) => ((acc[p.id] = p), acc),
  {} as Record<string, Plantable>,
);

export function findPlot(id: string): PlotSlot | undefined {
  return PLOTS_BY_ID[id];
}
export function findPlantable(id: string): Plantable | undefined {
  return PLANTABLES_BY_ID[id];
}

/** Plantables shown in a panel's Tend menu, in declaration order. */
export function plantablesForPanel(panelId: PanelId): Plantable[] {
  return PLANTABLES.filter((p) => p.panelId === panelId);
}

/** All plot slots on a panel. */
export function plotsForPanel(panelId: PanelId): PlotSlot[] {
  return PLOTS.filter((p) => p.panelId === panelId);
}

/** The slots in a plantable's pool (same group + panel). */
export function slotsForPlantable(p: Plantable): PlotSlot[] {
  return PLOTS.filter((s) => s.group === p.group && s.panelId === p.panelId);
}

/**
 * Resolve a net's catch at haul-in time (not at set time), so tide, the day's
 * sign, and Pilina all shape the result. `roll` is a single PRNG value in [0,1);
 * the reducer threads the seeded rng and passes it in (keeping the reducer pure).
 */
export function resolveNetCatch(
  net: Plantable,
  opts: {
    tide: Tide;
    guidanceId: string;
    netYieldBonus: number;
    preventEmptyNet: boolean;
    roll: number;
  },
): { items: Inventory; species: string } {
  const table = net.catch ?? [];
  if (table.length === 0) return { items: { ...net.baseYield }, species: 'a modest catch' };

  const total = table.reduce((s, c) => s + c.weight, 0);
  let pick = opts.roll * total;
  let chosen = table[table.length - 1]!;
  for (const c of table) {
    if (pick < c.weight) {
      chosen = c;
      break;
    }
    pick -= c.weight;
  }

  let fish = chosen.fish;
  if (net.tideBoost?.includes(opts.tide)) fish += 1; // the tide is right
  if (net.luckySign && net.luckySign === opts.guidanceId) fish += 1; // the sign is with you
  fish += opts.netYieldBonus; // Kanaloa / Manō blessing
  if (fish < 1 && opts.preventEmptyNet) fish = 1; // the net is never empty

  const items: Inventory = fish > 0 ? { fish } : {};
  if (chosen.extra) {
    for (const [id, n] of Object.entries(chosen.extra) as [ResourceId, number][]) {
      items[id] = (items[id] ?? 0) + n;
    }
  }
  return { items, species: chosen.species };
}
