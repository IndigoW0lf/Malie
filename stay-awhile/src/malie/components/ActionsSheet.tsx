/**
 * Mālie — the Tend tray. The one menu for planting and net-setting on the
 * current scene. Each plantable claims a slot from its pool (three garden beds,
 * one loʻi, one grove, three net spots), so a row shows how many spots are free
 * and disables when the pool is full, a tool is missing, or you can't afford it.
 */
import type { GameAction, GameState, Inventory, ResourceId } from '../types/game';
import { plantablesForPanel, slotsForPlantable, type SlotGroup } from '../data/stations';
import { PANELS_BY_ID } from '../data/panels';
import { findRecipe } from '../data/recipes';
import { resourceName } from '../data/resources';
import { canAfford } from '../state/initialState';

const GROUP_NOUN: Record<SlotGroup, string> = {
  garden: 'beds',
  loi: 'loʻi',
  grove: 'grove',
  net: 'nets',
};

function describeYield(y: Inventory): string {
  return (Object.entries(y) as [ResourceId, number][])
    .map(([id, n]) => `${n} ${resourceName(id).toLowerCase()}`)
    .join(', ');
}

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onClose: () => void;
}

export function ActionsSheet({ state, dispatch, onClose }: Props) {
  const place = PANELS_BY_ID[state.activePanel];
  const plantables = plantablesForPanel(state.activePanel);
  const taken = new Set(state.jobs.map((j) => j.slotId));

  return (
    <div className="m-sheet">
      <div className="m-sheet-head">
        <h2>Tend · {place.subtitle}</h2>
        <button className="m-icon-btn" onClick={onClose} aria-label="Close tend menu">
          ✕
        </button>
      </div>

      {plantables.length === 0 ? (
        <p className="m-empty">Nothing to plant or set here.</p>
      ) : (
        <ul className="m-gather-list">
          {plantables.map((p) => {
            const slots = slotsForPlantable(p);
            const free = slots.filter((s) => !taken.has(s.id)).length;
            const hasTool =
              !p.requiresCraft || state.craftedItems.some((c) => c.recipeId === p.requiresCraft);
            const afford = !p.cost || canAfford(state.inventory, p.cost);
            const can = free > 0 && hasTool && afford;

            let stateLabel: string;
            if (!hasTool) {
              stateLabel = `needs ${findRecipe(p.requiresCraft!)?.name ?? 'a tool'}`;
            } else if (free === 0) {
              stateLabel = `${GROUP_NOUN[p.group]} full`;
            } else if (!afford) {
              stateLabel = 'need more';
            } else {
              stateLabel = `${p.startVerb.toLowerCase()} · ${free}/${slots.length} free`;
            }

            return (
              <li key={p.id}>
                <button
                  className="m-gather-row"
                  disabled={!can}
                  onClick={() => dispatch({ type: 'START_JOB', plantableId: p.id })}
                >
                  <span className="m-gather-text">
                    <span className="m-gather-label">
                      {p.glyph} {p.name}
                    </span>
                    <span className="m-gather-desc">gives {describeYield(p.baseYield)}</span>
                  </span>
                  <span className="m-gather-state">{stateLabel}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
