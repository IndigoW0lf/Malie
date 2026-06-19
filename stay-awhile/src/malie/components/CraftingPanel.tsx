/**
 * Mālie — crafting tray. Light recipes grouped as you scroll. Each shows its
 * ingredients with what you have, whether the world (and your tools) allow it,
 * and a single Craft button.
 *
 * Three recipe shapes are surfaced: tools (made once, then "Made ✓"), materials
 * (yield a resource into the bag), and objects (kept/placed). Recipes gated by a
 * tool you don't own yet read "Needs <tool>".
 */
import type { GameAction, GameState, Recipe, ResourceId, Tide } from '../types/game';
import { RECIPES, RECIPES_BY_ID, recipeGlyph, isToolRecipe } from '../data/recipes';
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

  const ownedTools = new Set(
    state.craftedItems.filter((c) => isToolRecipe(c.recipeId)).map((c) => c.recipeId),
  );
  const missingTools = (r: Recipe) => (r.requiresTools ?? []).filter((t) => !ownedTools.has(t));

  return (
    <div className="m-sheet m-sheet-craft">
      <div className="m-sheet-head">
        <h2>Make Something</h2>
        <button className="m-icon-btn" onClick={onClose} aria-label="Close crafting">
          ✕
        </button>
      </div>
      <p className="m-sheet-note">Take only what you need. A few things, made with care.</p>

      <ul className="m-recipe-list">
        {RECIPES.map((r) => {
          const owned = r.result.tool && ownedTools.has(r.id);
          const needTools = missingTools(r);
          const afford = canAfford(state.inventory, r.ingredients);
          const avail = availableNow(r, state);
          const craftable = !owned && needTools.length === 0 && afford && avail.ok;

          const lockReason =
            needTools.length > 0
              ? `Needs ${needTools.map((t) => RECIPES_BY_ID[t]?.name ?? t).join(', ')}`
              : !avail.ok
                ? avail.reason
                : null;

          let label = 'Craft';
          if (owned) label = 'Made ✓';
          else if (needTools.length > 0) label = 'Locked';
          else if (!avail.ok) label = 'Not today';
          else if (!afford) label = 'Need more';

          return (
            <li key={r.id} className={`m-recipe${owned ? ' m-recipe-owned' : ''}`}>
              <div className="m-recipe-head">
                <span className="m-recipe-glyph">{recipeGlyph(r.id)}</span>
                <div>
                  <p className="m-recipe-name">{r.name}</p>
                  <p className="m-recipe-cat">
                    {r.result.tool ? 'tool' : r.yields ? 'material' : r.category}
                  </p>
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
              {lockReason && <p className="m-recipe-locked">{lockReason}</p>}
              <button
                className="m-craft-btn"
                disabled={!craftable}
                onClick={() => dispatch({ type: 'CRAFT', recipeId: r.id })}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
