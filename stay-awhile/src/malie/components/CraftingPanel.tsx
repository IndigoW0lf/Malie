/**
 * Mālie — crafting. A modal of light recipes. Each shows its ingredients with
 * what you have, whether the world allows it today, and a single Craft button.
 */
import type { GameAction, GameState, Recipe, ResourceId, Tide } from '../types/game';
import { RECIPES, recipeGlyph } from '../data/recipes';
import { RESOURCES } from '../data/resources';
import { canAfford } from '../state/initialState';

function tideListLabel(tides: Tide[]): string {
  const label: Record<Tide, string> = {
    low: 'low',
    rising: 'rising',
    high: 'high',
    falling: 'falling',
  };
  return tides.map((t) => label[t]).join(' or ') + ' tide';
}

/** Is this recipe allowed by the day's tide / season / sign? */
function availableNow(recipe: Recipe, state: GameState): { ok: boolean; reason?: string } {
  const w = recipe.availableWhen;
  if (!w) return { ok: true };
  if (w.tides && !w.tides.includes(state.tide)) {
    return { ok: false, reason: `Only at ${tideListLabel(w.tides)}` };
  }
  if (w.seasons && !w.seasons.includes(state.season)) {
    return { ok: false, reason: `Only in ${w.seasons.join(' / ')}` };
  }
  if (w.signs && !w.signs.includes(state.guidanceId)) {
    return { ok: false, reason: 'The sign is not right today' };
  }
  return { ok: true };
}

interface Props {
  open: boolean;
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onClose: () => void;
}

export function CraftingPanel({ open, state, dispatch, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="m-modal-scrim" onClick={onClose}>
      <div className="m-modal" onClick={(e) => e.stopPropagation()}>
        <div className="m-drawer-head">
          <h2>Make Something</h2>
          <button className="m-icon-btn" onClick={onClose} aria-label="Close crafting">
            ✕
          </button>
        </div>
        <p className="m-modal-note">Take only what you need. A few things, made with care.</p>

        <ul className="m-recipe-list">
          {RECIPES.map((r) => {
            const afford = canAfford(state.inventory, r.ingredients);
            const avail = availableNow(r, state);
            const craftable = afford && avail.ok;
            return (
              <li key={r.id} className="m-recipe">
                <div className="m-recipe-head">
                  <span className="m-recipe-glyph">{recipeGlyph(r.id)}</span>
                  <div>
                    <p className="m-recipe-name">{r.name}</p>
                    <p className="m-recipe-cat">{r.category}</p>
                  </div>
                </div>
                <p className="m-recipe-desc">{r.description}</p>
                <ul className="m-recipe-ingredients">
                  {(Object.entries(r.ingredients) as [ResourceId, number][]).map(([id, need]) => {
                    const have = state.inventory[id] ?? 0;
                    const enough = have >= need;
                    return (
                      <li key={id} className={`m-ingredient${enough ? '' : ' m-ingredient-short'}`}>
                        <span>{RESOURCES[id].glyph}</span>
                        <span>{RESOURCES[id].name}</span>
                        <span className="m-ingredient-count">
                          {have}/{need}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {!avail.ok && <p className="m-recipe-locked">{avail.reason}</p>}
                <button
                  className="m-craft-btn"
                  disabled={!craftable}
                  onClick={() => dispatch({ type: 'CRAFT', recipeId: r.id })}
                >
                  {craftable ? 'Craft' : afford ? 'Not today' : 'Need more'}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
