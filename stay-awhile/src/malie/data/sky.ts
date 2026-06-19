/**
 * Mālie — Ka Lani, the sky.
 *
 * A sky *pattern* is the slow background of the night — it changes with the
 * season, not the day. (The day's *sign* in guidance.ts is the fast layer: the
 * weather/mood of one morning.) Observing a pattern fills the Sky Journal and,
 * as the pilina with Pueo deepens, turns the sky into a quiet forecast.
 *
 * This is recorded knowledge, not relationship favor — a respectful, sourced
 * homage to Hawaiian sky-reading and wayfinding, never a power system. For
 * anything beyond a jam, a cultural/navigational reviewer should pass on this.
 */
import type { Guidance, Season, Tide } from '../types/game';
import type { Source } from './spirits';
import { levelForPoints } from './spirits';

/** The patterns the player can come to know. */
export type SkyPatternId = 'makalii' | 'na_kao' | 'hokulea';

/** A point in the sky-observation box (0–100% of width/height). */
export interface StarPoint {
  x: number;
  y: number;
}

export interface SkyPattern {
  id: SkyPatternId;
  name: string;
  /** The season this pattern dominates the sky. */
  season: Season;
  /** Always shown — the poetry of the pattern. */
  description: string;
  /** Prompt for the observe interaction. */
  observationText: string;
  /** What you record once you trace it. */
  risesText: string;
  /** Vague forecast (Pueo Recognized). */
  gameplayHint: string;
  /** Named forecast (Pueo Trusted+). */
  preciseHint: string;
  /** The activity the sky favors (Pueo In Pilina). */
  favoredActivity: string;
  /** Short, sourced learning note for the journal card. */
  learningNote: string;
  sources: Source[];
  /** Three bright stars to trace, in order. */
  stars: [StarPoint, StarPoint, StarPoint];
}

export const SKY_PATTERNS: Record<SkyPatternId, SkyPattern> = {
  makalii: {
    id: 'makalii',
    name: 'Makaliʻi',
    season: 'Makahiki',
    description:
      'A small cluster rises in the east — Makaliʻi, the little eyes. Its return opens the season of rest.',
    observationText: 'Trace the little cluster, low in the east.',
    risesText: 'You record where it rises: low over the eastern ridge.',
    gameplayHint: 'When Makaliʻi rises, the land favors planting. Rain may follow.',
    preciseHint: 'Makaliʻi rises over the eastern ridge — a good morning to plant, with rain not far off.',
    favoredActivity: 'The māla will take new planting kindly.',
    learningNote:
      'The dusk rising of Makaliʻi (the Pleiades) marks the start of Makahiki — months of rest, gratitude, and ceremony honoring Lono.',
    sources: [
      {
        title: 'Makahiki & the rising of Makaliʻi',
        organization: 'National Park Service — Haleakalā',
        url: 'https://www.nps.gov/hale/',
      },
    ],
    stars: [
      { x: 68, y: 50 },
      { x: 76, y: 56 },
      { x: 72, y: 62 },
    ],
  },
  na_kao: {
    id: 'na_kao',
    name: 'Nā Kao',
    season: 'Hooilo',
    description:
      'Three bright stars stand in a row — Nā Kao, the darts, high in the winter sky.',
    observationText: 'Tap the three stars of the row, in order.',
    risesText: 'You record their path: rising in the east, crossing high over the sea.',
    gameplayHint: 'The winter stars stand over the sea. The fishing grounds shift with the cold.',
    preciseHint: 'Nā Kao stands high over the water — the shore net will favor the falling tide.',
    favoredActivity: 'Set nets along the shore; the catch runs there now.',
    learningNote:
      'Nā Kao — the three stars of Orion’s Belt — are prominent in the Hawaiian winter (Hoʻoilo) sky and were among the stars steered by at sea.',
    sources: [
      {
        title: 'Hawaiian star lines & wayfinding',
        organization: 'Polynesian Voyaging Society',
        url: 'https://www.hokulea.com/',
      },
    ],
    stars: [
      { x: 38, y: 34 },
      { x: 50, y: 38 },
      { x: 62, y: 42 },
    ],
  },
  hokulea: {
    id: 'hokulea',
    name: 'Hōkūleʻa',
    season: 'Kau',
    description:
      'One star passes straight overhead — Hōkūleʻa, the star of gladness, zenith star of these islands.',
    observationText: 'Find the bright star nearest the top of the sky.',
    risesText: 'You record its height: passing straight overhead at its zenith.',
    gameplayHint: 'The zenith star marks these islands. The season is at its height.',
    preciseHint: 'Hōkūleʻa passes overhead — summer holds. Calm seas, long days.',
    favoredActivity: 'Good days for the deeper reef and for drying kapa.',
    learningNote:
      'Hōkūleʻa (Arcturus) is the zenith star of Hawaiʻi — it passes directly overhead at the islands’ latitude, a cornerstone of traditional navigation. The voyaging canoe Hōkūleʻa is named for it.',
    sources: [
      {
        title: 'Hōkūleʻa, the zenith star',
        organization: 'Polynesian Voyaging Society',
        url: 'https://www.hokulea.com/',
      },
    ],
    stars: [
      { x: 48, y: 18 },
      { x: 44, y: 26 },
      { x: 54, y: 24 },
    ],
  },
};

export const SKY_PATTERN_IDS: SkyPatternId[] = ['makalii', 'na_kao', 'hokulea'];

/** Which pattern dominates a season's sky. Transition keeps Makaliʻi in view. */
const SEASON_TO_PATTERN: Record<Season, SkyPatternId> = {
  Makahiki: 'makalii',
  Transition: 'makalii',
  Hooilo: 'na_kao',
  Kau: 'hokulea',
};

export function skyPatternForSeason(season: Season): SkyPatternId {
  return SEASON_TO_PATTERN[season];
}

/**
 * The sky-reading the player hears after observing, layered by their pilina with
 * Pueo. Low relationship gives only poetry; higher gives a real forecast.
 *   Noticed     → poetic description
 *   Recognized  → one vague hint
 *   Trusted     → tomorrow's sign named
 *   In Pilina   → tide/weather + the favored activity
 */
export function skyReadingForLevel(
  p: SkyPattern,
  pueoPoints: number,
  nextGuidance: Guidance,
  nextTide: Tide,
): string {
  const lvl = levelForPoints(pueoPoints);
  if (lvl <= 1) return p.description;
  if (lvl === 2) return p.gameplayHint;
  if (lvl === 3) return `${p.preciseHint} Tomorrow, ${nextGuidance.name.toLowerCase()}.`;
  return `${p.preciseHint} Tomorrow brings ${nextGuidance.name.toLowerCase()}, on a ${nextTide} tide. ${p.favoredActivity}`;
}
