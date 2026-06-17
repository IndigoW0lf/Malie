/**
 * Mālie — the hale interior. The morning greeting, the floor of placed things,
 * and the crafted items waiting to be set down.
 */
import type { GameAction, GameState } from '../types/game';
import { recipeGlyph } from '../data/recipes';
import { PlacedItemGrid } from './PlacedItemGrid';

export const HALE_SLOTS = 12;

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export function HaleView({ state, dispatch }: Props) {
  const craftedById = new Map(state.craftedItems.map((c) => [c.id, c]));
  const unplaced = state.craftedItems.filter((c) => !c.placed);
  const usedSlots = new Set(state.placedItems.map((p) => p.slot));

  // The next open slot on the floor, or null when the hale is full.
  const nextSlot = (() => {
    for (let i = 0; i < HALE_SLOTS; i++) if (!usedSlots.has(i)) return i;
    return null;
  })();

  // The most recent dawn greeting is the freshest message in the log.
  const greeting = state.messageLog[0] ?? '';

  return (
    <div className="m-hale">
      <p className="m-hale-greeting">{greeting}</p>

      <PlacedItemGrid slots={HALE_SLOTS} placedItems={state.placedItems} craftedById={craftedById} />

      <div className="m-hale-crafted">
        <h3>Crafted, waiting to be placed</h3>
        {unplaced.length === 0 ? (
          <p className="m-empty">Nothing yet. Gather a little, then make something at Craft.</p>
        ) : (
          <ul className="m-crafted-list">
            {unplaced.map((c) => (
              <li key={c.id} className="m-crafted-item">
                <span className="m-crafted-glyph">{recipeGlyph(c.recipeId)}</span>
                <span className="m-crafted-name">{c.name}</span>
                <button
                  className="m-place-btn"
                  disabled={nextSlot === null}
                  onClick={() =>
                    nextSlot !== null &&
                    dispatch({ type: 'PLACE_ITEM', craftedItemId: c.id, slot: nextSlot })
                  }
                >
                  {nextSlot === null ? 'Hale is full' : 'Place in Hale'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
