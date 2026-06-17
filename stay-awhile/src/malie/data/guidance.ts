/**
 * Mālie — the day's signs. These are gentle readings of sky and sea, never a
 * power system. A sign slightly shifts what the day offers and what feels
 * meaningful. One sign is in effect each day, chosen deterministically by day
 * number so a reloaded save reads the same sky.
 */
import type { Guidance } from '../types/game';

export const GUIDANCE_SIGNS: Guidance[] = [
  {
    id: 'iwa_birds',
    name: 'ʻIwa birds offshore',
    message: 'The birds circle where the water is generous.',
    effectDescription: 'Fishing feels promising today.',
  },
  {
    id: 'quiet_rain',
    name: 'Quiet rain',
    message: 'The land drinks deeply.',
    effectDescription: 'Crops are easier to tend today.',
  },
  {
    id: 'clear_stars',
    name: 'Clear stars',
    message: 'The sky offers a clean path.',
    effectDescription: 'Observing the sky may leave a smooth stone in your hand.',
  },
  {
    id: 'watchful_sea',
    name: 'Watchful sea',
    message: 'Take only what you need.',
    effectDescription: 'Offerings feel especially meaningful today.',
  },
];

export const GUIDANCE_BY_ID: Record<string, Guidance> = GUIDANCE_SIGNS.reduce(
  (acc, g) => ((acc[g.id] = g), acc),
  {} as Record<string, Guidance>,
);

/** The sign in effect on a given day (1-indexed days, deterministic). */
export function guidanceForDay(day: number): Guidance {
  const idx = (day - 1) % GUIDANCE_SIGNS.length;
  return GUIDANCE_SIGNS[(idx + GUIDANCE_SIGNS.length) % GUIDANCE_SIGNS.length];
}
