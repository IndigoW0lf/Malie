/**
 * Mālie — crafting tray. Light recipes grouped as you scroll. Each shows its
 * ingredients with what you have, whether the world (and your tools) allow it,
 * and a single action.
 *
 * Two rhythms:
 *  • Materials (cordage, kapa cloth) are *prepared* instantly into the bag.
 *  • Tools and objects are *built* over real time — one at a time. While a build
 *    runs, a banner counts it down; when it finishes you Claim it. Kū's pilina
 *    shortens the wait (see deriveModifiers).
 */
import { useEffect, useState } from 'react';
import type { GameAction, GameState, Recipe, ResourceId, Tide } from '../types/game';
import {
  RECIPES,
  RECIPES_BY_ID,
  recipeGlyph,
  isToolRecipe,
  isTimedCraft,
  craftBaseMs,
} from '../data/recipes';
import { RESOURCES } from '../data/resources';
import { canAfford } from '../state/initialState';
import { deriveModifiers } from '../data/spirits';
import { craftJob, isReady, jobProgress, formatRemaining } from '../state/jobs';

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
  const offset = state.timeOffsetMs;
  const [now, setNow] = useState(() => Date.now() + offset);
  useEffect(() => {
    const tick = () => setNow(Date.now() + offset);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [offset]);

  if (!open) return null;

  const ownedTools = new Set(
    state.craftedItems.filter((c) => isToolRecipe(c.recipeId)).map((c) => c.recipeId),
  );
  const missingTools = (r: Recipe) => (r.requiresTools ?? []).filter((t) => !ownedTools.has(t));

  const active = craftJob(state.jobs);
  const activeRecipe = active ? RECIPES_BY_ID[active.definitionId] : undefined;
  const activeReady = active ? isReady(active, now) : false;
  const mods = deriveModifiers(state.spirits);

  // Group the long list by type so it's scannable. Each recipe lands in the
  // first matching bucket; empty buckets are skipped.
  const GROUPS: { key: string; label: string; test: (r: Recipe) => boolean }[] = [
    { key: 'tool', label: 'Tools', test: (r) => !!r.result.tool },
    { key: 'material', label: 'Materials', test: (r) => !!r.yields },
    {
      key: 'offering',
      label: 'Offerings',
      test: (r) => !!r.result.offering && !r.result.tool && !r.yields,
    },
    { key: 'object', label: 'For the Hale', test: () => true },
  ];
  const buckets = GROUPS.map((g) => ({ ...g, items: [] as Recipe[] }));
  for (const r of RECIPES) buckets.find((b) => b.test(r))!.items.push(r);
  const firstOpenKey = buckets.find((b) => b.items.length > 0)?.key;

  const renderRecipe = (r: Recipe) => {
    const timed = isTimedCraft(r);
    const owned = r.result.tool && ownedTools.has(r.id);
    const needTools = missingTools(r);
    const afford = canAfford(state.inventory, r.ingredients);
    const avail = availableNow(r, state);
    const busy = timed && active != null; // one build at a time
    const craftable = !owned && needTools.length === 0 && afford && avail.ok && !busy;

    const lockReason =
      needTools.length > 0
        ? `Needs ${needTools.map((t) => RECIPES_BY_ID[t]?.name ?? t).join(', ')}`
        : !avail.ok
          ? avail.reason
          : null;

    const estMs = Math.round(craftBaseMs(r) * mods.craftDurationMultiplier);

    let label: string;
    if (owned) label = 'Made ✓';
    else if (needTools.length > 0) label = 'Locked';
    else if (!avail.ok) label = 'Not today';
    else if (!afford) label = 'Need more';
    else if (busy) label = 'Building…';
    else if (!timed) label = 'Prepare';
    else label = `Build · ${formatRemaining(estMs)}`;

    return (
      <li key={r.id} className={`m-recipe${owned ? ' m-recipe-owned' : ''}`}>
        <div className="m-recipe-main">
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
        </div>
        <div className="m-recipe-action">
          <button
            className="m-craft-btn"
            disabled={!craftable}
            onClick={() =>
              dispatch(
                timed ? { type: 'START_CRAFT', recipeId: r.id } : { type: 'CRAFT', recipeId: r.id },
              )
            }
          >
            {label}
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className="m-sheet m-sheet-craft">
      <div className="m-sheet-head">
        <h2>Make Something</h2>
        <button className="m-icon-btn" onClick={onClose} aria-label="Close crafting">
          ✕
        </button>
      </div>
      <p className="m-sheet-note">Take only what you need. A few things, made with care.</p>

      {active && activeRecipe && (
        <div className={`m-build-banner${activeReady ? ' m-build-done' : ''}`}>
          <span className="m-build-glyph">{recipeGlyph(activeRecipe.id)}</span>
          <div className="m-build-text">
            <p className="m-build-name">{activeRecipe.name}</p>
            {activeReady ? (
              <p className="m-build-sub">finished</p>
            ) : (
              <>
                <div className="m-station-bar">
                  <div
                    className="m-station-fill"
                    style={{ width: `${Math.round(jobProgress(active, now) * 100)}%` }}
                  />
                </div>
                <p className="m-build-sub">making · {formatRemaining(active.readyAt - now)}</p>
              </>
            )}
          </div>
          {activeReady && (
            <button
              className="m-craft-btn m-craft-claim"
              onClick={() => dispatch({ type: 'CLAIM_CRAFT', jobId: active.id })}
            >
              Claim
            </button>
          )}
        </div>
      )}

      {buckets
        .filter((b) => b.items.length > 0)
        .map((b) => (
          <details key={b.key} className="m-craft-group" open={b.key === firstOpenKey}>
            <summary className="m-craft-group-head">
              {b.label} <span className="m-craft-group-count">{b.items.length}</span>
            </summary>
            <ul className="m-recipe-list">{b.items.map(renderRecipe)}</ul>
          </details>
        ))}
    </div>
  );
}
