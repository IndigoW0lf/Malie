/**
 * Mālie — Pilina: relationships with akua and ʻaumākua.
 *
 * This is a respectful, educational homage, not a "collect the gods" mechanic.
 * Presences are met through noticing signs, tending, restraint, and offerings —
 * never summoned or bought. We represent them through their signs in nature
 * (rain, the reef, the night sky), never as figures. Learning notes are short
 * and sourced; for anything beyond a game jam, a Hawaiian cultural reviewer
 * should pass on this text.
 *
 * Sources noted per presence below (NPS; DLNR / Herb Kawainui Kāne).
 */
import type { GameModifiers, Inventory, ResourceId, SpiritId, SpiritKind } from '../types/game';

/** A citable reference for a presence's learning note. `url` is optional — we
 *  only link out to stable institutional/public-domain pages, and otherwise
 *  name the work and organization so a reader can find it. */
export interface Source {
  title: string;
  organization: string;
  url?: string;
}

export interface SpiritDef {
  id: SpiritId;
  name: string;
  kind: SpiritKind;
  /** Short epithet for the card header. */
  title: string;
  /** Where it sits on the mauka→makai map (0 = sky, 100 = deep sea). */
  mapY: number;
  /** The place-name shown on the map. */
  place: string;
  /** Nature-sign placeholder glyph (TODO(art): replace with illustrated sign). */
  glyph: string;
  domains: string[];
  /** Signs the player might notice in the world. */
  signs: string[];
  /** Player-facing ways the relationship deepens. */
  deepensThrough: string[];
  /** The daily guidance sign that means this presence is near (if any). */
  guidanceSign?: string;
  /** Short, sourced learning note. */
  learningNote: string;
  /** Short attribution line shown under the note. */
  source: string;
  /** Citable references, surfaced in the card's Sources drawer. */
  sources: Source[];
  /** One line per relationship level (index 0–4) describing what it feels like. */
  effectByLevel: [string, string, string, string, string];
}

export const SPIRITS: Record<SpiritId, SpiritDef> = {
  pueo_aumakua: {
    id: 'pueo_aumakua',
    name: 'Pueo',
    kind: 'aumakua',
    title: 'an ʻaumakua of the night sky',
    mapY: 12,
    place: 'Night Sky & Forest Edge',
    glyph: '🦉',
    domains: ['stars', 'night', 'guidance', 'watchfulness'],
    signs: ['clear stars', 'an owl beyond the hale', 'a guiding quiet'],
    deepensThrough: ['Observe the stars', 'Sit with the night sky', 'Offer light or a woven bundle'],
    guidanceSign: 'clear_stars',
    learningNote:
      'The pueo, the Hawaiian owl, can be an ʻaumakua — an ancestral guardian. ʻAumākua are family-specific: they watch over their own descendants and may appear in forms such as the owl, the shark, or the moʻo.',
    source: 'DLNR — H. K. Kāne, “The ʻAumākua.”',
    sources: [
      { title: 'The ʻAumākua (ancestral guardians)', organization: 'Hawaiʻi DLNR — Herb Kawainui Kāne' },
      {
        title: 'Hawaiian Mythology — ʻAumakua',
        organization: 'M. Beckwith (public domain)',
        url: 'https://www.sacred-texts.com/pac/hm/',
      },
    ],
    effectByLevel: [
      '—',
      'The night feels watched over.',
      'You read the stars a little clearer.',
      'Guidance comes before the day.',
      'The owl shows tomorrow’s sky.',
    ],
  },
  lono: {
    id: 'lono',
    name: 'Lono',
    kind: 'akua',
    title: 'of rain, growth, and peace',
    mapY: 48,
    place: 'Rain & Fields',
    glyph: '🌧️',
    domains: ['rain', 'growth', 'fields', 'peace'],
    signs: ['soft rain', 'gathering clouds', 'green, growing fields'],
    deepensThrough: ['Tend the loʻi', 'Let the loʻi rest', 'Offer water or the first harvest'],
    guidanceSign: 'quiet_rain',
    learningNote:
      'Lono is associated with rain, agriculture, fertility, music, and peace — and with the Makahiki, the season of rest, renewal, and gratitude for the land.',
    source: 'NPS — Haleakalā, “Makahiki.”',
    sources: [
      { title: 'Makahiki', organization: 'National Park Service — Haleakalā', url: 'https://www.nps.gov/hale/' },
      {
        title: 'Hawaiian Mythology — Lono',
        organization: 'M. Beckwith (public domain)',
        url: 'https://www.sacred-texts.com/pac/hm/',
      },
    ],
    effectByLevel: [
      '—',
      'You feel the rain’s rhythm.',
      'Tending the loʻi gives a little more.',
      'The garden gives more freely.',
      'The fields wake ready at dawn.',
    ],
  },
  kanaloa: {
    id: 'kanaloa',
    name: 'Kanaloa',
    kind: 'akua',
    title: 'of the ocean and the deep',
    mapY: 78,
    place: 'Reef & Deep Sea',
    glyph: '🌊',
    domains: ['ocean', 'tides', 'fishing', 'restraint'],
    signs: ['birds working offshore', 'a watchful, generous sea', 'the turning tide'],
    deepensThrough: ['Watch the tide', 'Fish gently', 'Return a fish to the sea', 'Offer a shell'],
    guidanceSign: 'iwa_birds',
    learningNote:
      'Kanaloa is associated with the ocean and the deep sea, and is often invoked together with Kāne, the god of fresh water and life. The sea asks for restraint: take only what is needed.',
    source: 'Hawaiian tradition (paired with Kāne).',
    sources: [
      {
        title: 'Hawaiian Mythology — Kāne and Kanaloa',
        organization: 'M. Beckwith (public domain)',
        url: 'https://www.sacred-texts.com/pac/hm/',
      },
    ],
    effectByLevel: [
      '—',
      'The sea feels near.',
      'Fishing comes a little easier.',
      'The tide leaves more gifts.',
      'The net is never empty.',
    ],
  },

  // ─── stretch presences ─────────────────────────────────────────────────────
  kane: {
    id: 'kane',
    name: 'Kāne',
    kind: 'akua',
    title: 'of fresh water and life',
    mapY: 25,
    place: 'Mountain Spring & Forest',
    glyph: '💧',
    domains: ['water', 'life', 'forest', 'growth'],
    signs: ['a clear spring', 'sunlight through leaves', 'green new growth'],
    deepensThrough: ['Tend the loʻi', 'Gather from the māla', 'Offer fresh water'],
    learningNote:
      'Kāne is associated with fresh water, sunlight, and life itself — the waters that make the land green. He is often invoked together with Kanaloa.',
    source: 'Hawaiian tradition (Kāne & Kanaloa).',
    sources: [
      {
        title: 'Hawaiian Mythology — Kāne and Kanaloa',
        organization: 'M. Beckwith (public domain)',
        url: 'https://www.sacred-texts.com/pac/hm/',
      },
    ],
    effectByLevel: [
      '—',
      'The spring runs clear.',
      'The garden drinks deeply.',
      'Fresh water gives more freely.',
      'The land is green to its roots.',
    ],
  },
  ku: {
    id: 'ku',
    name: 'Kū',
    kind: 'akua',
    title: 'of the forest and the work of hands',
    mapY: 37,
    place: 'Forest & the Work of Hands',
    glyph: '🌲',
    domains: ['forest', 'craft', 'work', 'strength'],
    signs: ['the standing forest', 'a finished tool', 'steady work'],
    deepensThrough: ['Gather wood', 'Craft tools and shelves', 'Make with care'],
    learningNote:
      'Kū has many forms (kino lau). Among them is the Kū of the upland forest and of the craftspeople who shape wood — the canoe-builders and tool-makers. This is the Kū of work and the standing forest.',
    source: 'Hawaiian tradition (Kū-pulupulu, forest & craft).',
    sources: [
      {
        title: 'Hawaiian Mythology — Kū and his forms (kino lau)',
        organization: 'M. Beckwith (public domain)',
        url: 'https://www.sacred-texts.com/pac/hm/',
      },
    ],
    effectByLevel: [
      '—',
      'The forest stands with you.',
      'Gathering wood goes easier.',
      'Your hands work true.',
      'Nothing you make is wasted.',
    ],
  },
  moo_aumakua: {
    id: 'moo_aumakua',
    name: 'Moʻo',
    kind: 'aumakua',
    title: 'a guardian of fresh water',
    mapY: 61,
    place: 'Stream & Loʻi',
    glyph: '🦎',
    domains: ['freshwater', 'loʻi', 'stream', 'guardianship'],
    signs: ['still pond water', 'a darting shadow', 'a well-kept loʻi'],
    deepensThrough: ['Tend the loʻi', 'Let the loʻi rest', 'Offer water'],
    learningNote:
      'Moʻo are water guardians — powerful ancestral spirits, often taking lizard form, who keep watch over fresh water: streams, ponds, and the loʻi.',
    source: 'Hawaiian tradition (moʻo kiaʻi wai).',
    sources: [
      {
        title: 'Hawaiian Mythology — Moʻo (water guardians)',
        organization: 'M. Beckwith (public domain)',
        url: 'https://www.sacred-texts.com/pac/hm/',
      },
    ],
    effectByLevel: [
      '—',
      'The stream feels watched.',
      'The loʻi holds its water.',
      'The kalo grows strong.',
      'The waters keep you.',
    ],
  },
  shark_aumakua: {
    id: 'shark_aumakua',
    name: 'Manō',
    kind: 'aumakua',
    title: "a family's guardian of the sea",
    mapY: 91,
    place: 'Reef & Open Sea',
    glyph: '🦈',
    domains: ['ocean', 'protection', 'restraint', 'family'],
    signs: ['a shadow beyond the reef', 'a calm after fishing', 'the open sea'],
    deepensThrough: ['Fish gently', 'Return a fish to the sea', 'Offer a shell'],
    guidanceSign: 'watchful_sea',
    learningNote:
      'A manō (shark) can be an ʻaumakua — a family’s ocean guardian. ʻAumākua are family-specific; a shark ancestor watches over its descendants at sea, asking respect and restraint.',
    source: 'DLNR — H. K. Kāne, “The ʻAumākua.”',
    sources: [
      {
        title: 'Sharks (manō) in Hawaiian culture',
        organization: 'Hawaiʻi DLNR — Division of Aquatic Resources',
        url: 'https://dlnr.hawaii.gov/sharks/',
      },
      { title: 'The ʻAumākua', organization: 'Hawaiʻi DLNR — Herb Kawainui Kāne' },
    ],
    effectByLevel: [
      '—',
      'The deep feels near.',
      'The sea returns your restraint.',
      'The catch is always honest.',
      'The open water keeps you.',
    ],
  },
};

export const SPIRIT_IDS: SpiritId[] = [
  'pueo_aumakua',
  'kane',
  'ku',
  'lono',
  'moo_aumakua',
  'kanaloa',
  'shark_aumakua',
];

// ─── levels ──────────────────────────────────────────────────────────────────

export const LEVEL_NAMES = ['Unseen', 'Noticed', 'Recognized', 'Trusted', 'In Pilina'] as const;
/** Points needed to reach each level (index = level). */
export const LEVEL_THRESHOLDS = [0, 1, 8, 20, 40];

export type SpiritLevel = 0 | 1 | 2 | 3 | 4;

export function levelForPoints(points: number): SpiritLevel {
  let lvl: SpiritLevel = 0;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i]!) lvl = i as SpiritLevel;
  }
  return lvl;
}

/** Points until the next level, or null if already at the top. */
export function pointsToNext(points: number): number | null {
  const lvl = levelForPoints(points);
  if (lvl >= 4) return null;
  return LEVEL_THRESHOLDS[lvl + 1]! - points;
}

// ─── the day's sign → who is near ────────────────────────────────────────────

/** Maps the existing daily guidance signs onto the presences. */
export const SIGN_TO_SPIRIT: Record<string, SpiritId> = {
  quiet_rain: 'lono',
  iwa_birds: 'kanaloa',
  watchful_sea: 'shark_aumakua', // the sea that asks restraint
  clear_stars: 'pueo_aumakua',
};

export function nearSpiritFor(guidanceId: string): SpiritId | undefined {
  return SIGN_TO_SPIRIT[guidanceId];
}

// ─── what raises a relationship ──────────────────────────────────────────────

/** Pilina points a panel action offers, by action id. Restraint gives most.
 *  A place is often watched by more than one presence (the loʻi by Lono, Moʻo,
 *  and Kāne; the sea by Kanaloa and the shark ʻaumakua). */
export const ACTION_SPIRIT_GAINS: Record<string, Partial<Record<SpiritId, number>>> = {
  observe_stars: { pueo_aumakua: 1 },
  listen_birds: { pueo_aumakua: 1 },
  gather_kukui: { ku: 1 },
  tend_loi: { lono: 2, moo_aumakua: 1, kane: 1 },
  gather_garden: { lono: 1, kane: 1 },
  gather_wood: { ku: 1 },
  watch_tide: { kanaloa: 1 },
  fish_gently: { kanaloa: 1, shark_aumakua: 1 },
  gather_shore: { kanaloa: 1 },
  // restraint actions (defined in panels.ts) carry their own spiritGain.
};

/** Pilina points crafting offers Kū, by recipe shape. Tools honor Kū most. */
export function craftSpiritGains(isTool: boolean): Partial<Record<SpiritId, number>> {
  return { ku: isTool ? 2 : 1 };
}

/** Which presences an offering best suits (alignment gives a small bonus). */
export const OFFERING_AFFINITY: Record<string, SpiritId[]> = {
  leaf_bundle: ['pueo_aumakua'],
  star_marker: ['pueo_aumakua'],
  kukui_light: ['pueo_aumakua'],
  // ʻAwa was the best offering and had a special role in ʻaumakua worship, so it
  // aligns with the ancestral guardians (the family ʻaumākua), not every akua.
  awa_offering: ['pueo_aumakua', 'moo_aumakua', 'shark_aumakua'],
  shell_bowl: ['kanaloa', 'shark_aumakua'],
  water_bowl: ['lono', 'kanaloa', 'kane', 'moo_aumakua'],
};

export const OFFERING_BASE_POINTS = 5;
export const OFFERING_ALIGNED_BONUS = 3;

// ─── gentle effects (relationship → small bonuses, fitting the day-loop) ─────

/**
 * Bonus resources an action gives because of a deepened relationship. Mirrors
 * the `effectByLevel` flavor. Kept small — guidance and blessing, not power-ups.
 */
export function spiritActionBonus(
  actionId: string,
  spirits: Record<SpiritId, { points: number }>,
): Inventory {
  const lvl = (id: SpiritId) => levelForPoints(spirits[id]?.points ?? 0);
  const bonus: Inventory = {};

  const add = (id: ResourceId, n: number) => (bonus[id] = (bonus[id] ?? 0) + n);

  if (actionId === 'observe_stars' && lvl('pueo_aumakua') >= 2) add('star_sign', 1);
  if (actionId === 'tend_loi' && lvl('lono') >= 2) add('kalo', 1);
  if (actionId === 'tend_loi' && lvl('moo_aumakua') >= 2) add('fiber', 1);
  if (actionId === 'gather_garden' && lvl('lono') >= 3) add('herb', 1);
  if (actionId === 'gather_garden' && lvl('kane') >= 2) add('leaf', 1);
  if (actionId === 'gather_wood' && lvl('ku') >= 2) add('wood', 1);
  if (actionId === 'fish_gently' && lvl('kanaloa') >= 2) add('fish', 1);
  if (actionId === 'fish_gently' && lvl('shark_aumakua') >= 3) add('fish', 1);
  if (actionId === 'watch_tide' && lvl('kanaloa') >= 3) add('tide_pool_gift', 1);

  return bonus;
}

/** Pueo at Trusted+ reveals tomorrow's sign at dawn. */
export function pueoRevealsNextSign(spirits: Record<SpiritId, { points: number }>): boolean {
  return levelForPoints(spirits.pueo_aumakua?.points ?? 0) >= 3;
}

// ─── centralized Pilina effects for the timed systems (GameModifiers) ────────

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * The single place relationship blessings shape the timed systems. As a pilina
 * deepens, the land and sea give a little faster and a little more — guidance,
 * not power. Kept gentle and bounded (growth never more than halves).
 *
 *  • Crops — Lono (rain/growth), Kāne (fresh water), Moʻo (the loʻi's keeper)
 *  • Crafting — Kū (the work of hands)
 *  • Nets — Kanaloa (the deep), Manō (a family's sea guardian)
 *  • Guidance — Pueo (the night sky) reveals tomorrow's sign
 */
export function deriveModifiers(spirits: Record<SpiritId, { points: number }>): GameModifiers {
  const lvl = (id: SpiritId) => levelForPoints(spirits[id]?.points ?? 0);

  let cropDur = 1;
  let cropYield = 0;
  if (lvl('lono') >= 2) {
    cropDur -= 0.1;
    cropYield += 1;
  }
  if (lvl('kane') >= 2) cropDur -= 0.1;
  if (lvl('moo_aumakua') >= 2) cropDur -= 0.1;
  if (lvl('lono') >= 3) cropYield += 1;

  let craftDur = 1;
  if (lvl('ku') >= 2) craftDur -= 0.15;
  if (lvl('ku') >= 3) craftDur -= 0.1;

  let netDur = 1;
  let netYield = 0;
  if (lvl('kanaloa') >= 2) netDur -= 0.1;
  if (lvl('kanaloa') >= 3) netYield += 1;
  if (lvl('shark_aumakua') >= 3) netYield += 1;
  const preventEmptyNet = lvl('kanaloa') >= 4;

  return {
    cropDurationMultiplier: clamp(cropDur, 0.5, 1),
    cropYieldBonus: cropYield,
    craftDurationMultiplier: clamp(craftDur, 0.5, 1),
    netDurationMultiplier: clamp(netDur, 0.5, 1),
    netYieldBonus: netYield,
    preventEmptyNet,
    revealNextGuidance: lvl('pueo_aumakua') >= 3,
  };
}
