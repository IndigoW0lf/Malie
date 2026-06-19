/**
 * Mālie — the hale's morning greetings and the small memories it keeps.
 *
 * A greeting is chosen deterministically from the day number so the same day
 * always reads the same. Memory lines are added when the player has placed
 * something the hale would remember (an offering, a star marker).
 */
import type { GameState, PlacedItem } from '../types/game';

export const GREETINGS: string[] = [
  'The hale is quiet. Morning light rests on the mat.',
  'A soft wind moves through the doorway.',
  'The tide left something shining at the shore.',
  'The stars were clear last night.',
  'A flower from yesterday still holds its color.',
  'The fire has settled into warm ash.',
];

/** Deterministic greeting for a day. */
export function greetingForDay(day: number): string {
  const idx = (((day - 1) % GREETINGS.length) + GREETINGS.length) % GREETINGS.length;
  return GREETINGS[idx]!;
}

/**
 * A small extra line the hale offers when it remembers something placed.
 * Returns null when there is nothing to remember yet.
 */
export function memoryLine(placedItems: PlacedItem[], craftedById: Map<string, { recipeId: string }>): string | null {
  const placedRecipeIds = new Set(
    placedItems.map((p) => craftedById.get(p.craftedItemId)?.recipeId).filter(Boolean) as string[],
  );

  if (placedRecipeIds.has('star_marker')) {
    return 'Your star marker catches the morning light.';
  }
  if (placedRecipeIds.has('awa_offering')) {
    return 'The ʻawa you offered still rests in its gourd cup by the door.';
  }
  if (placedRecipeIds.has('woven_mat')) {
    return 'The woven mat is warm underfoot.';
  }
  return null;
}

/**
 * Build the full set of dawn messages for a new day: the greeting, plus any
 * memory line. Newest-first ordering is handled by the reducer.
 */
export function dawnMessages(day: number, state: Pick<GameState, 'placedItems' | 'craftedItems'>): string[] {
  const craftedById = new Map(state.craftedItems.map((c) => [c.id, { recipeId: c.recipeId }]));
  const messages = [greetingForDay(day)];
  const memory = memoryLine(state.placedItems, craftedById);
  if (memory) messages.push(memory);
  return messages;
}
