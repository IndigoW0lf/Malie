/**
 * Mālie — the hale chrome. The placed items themselves render on the background
 * (see PlacedItemLayer); this view is just the morning greeting and the tray of
 * crafted items waiting to be set down. Tapping one begins placement mode.
 */
import type { CraftedItem, GameState } from '../types/game';
import { recipeGlyph } from '../data/recipes';
import { isPlaceable } from '../data/craftables';

interface Props {
  state: GameState;
  onBeginPlacement: (craftedItemId: string) => void;
  /** Hidden while the calibration tool is open so the full hale art shows. */
  hidden?: boolean;
}

export function HaleView({ state, onBeginPlacement, hidden }: Props) {
  // Keep the stretchy spacer so layout doesn't jump, but show no chrome.
  if (hidden) return <div className="m-hale" />;

  const unplaced = state.craftedItems.filter((c) => !c.placed && isPlaceable(c.recipeId));
  const tools = state.craftedItems.filter((c) => !isPlaceable(c.recipeId));

  // The most recent dawn greeting is the freshest message in the log.
  const greeting = state.messageLog[0] ?? '';

  return (
    <div className="m-hale">
      <p className="m-hale-greeting">{greeting}</p>

      <div className="m-hale-tray">
        <h3>To place</h3>
        {unplaced.length === 0 ? (
          <p className="m-empty">Nothing waiting. Gather a little, then make something at Craft.</p>
        ) : (
          <ul className="m-tray-list">
            {unplaced.map((c: CraftedItem) => (
              <li key={c.id}>
                <button className="m-tray-chip" onClick={() => onBeginPlacement(c.id)}>
                  <span className="m-tray-glyph">{recipeGlyph(c.recipeId)}</span>
                  <span className="m-tray-name">{c.name}</span>
                  <span className="m-tray-place">place →</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {tools.length > 0 && (
          <p className="m-hale-tools">
            Tools:{' '}
            {tools.map((t) => `${recipeGlyph(t.recipeId)} ${t.name}`).join('  ·  ')}
          </p>
        )}
      </div>
    </div>
  );
}
