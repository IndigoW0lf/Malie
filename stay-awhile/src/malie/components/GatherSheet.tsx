/**
 * Mālie — the Gather tray. An expanding panel of the current place's actions as
 * compact text rows (no big icons). Each action is doable once per day.
 */
import type { GameAction, GameState, ResourceId } from '../types/game';
import { ACTIONS_BY_PANEL, PANELS_BY_ID } from '../data/panels';
import { resourceName } from '../data/resources';
import { canAfford } from '../state/initialState';

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onClose: () => void;
}

export function GatherSheet({ state, dispatch, onClose }: Props) {
  const actions = ACTIONS_BY_PANEL[state.activePanel] ?? [];
  const place = PANELS_BY_ID[state.activePanel];

  return (
    <div className="m-sheet">
      <div className="m-sheet-head">
        <h2>Gather · {place.subtitle}</h2>
        <button className="m-icon-btn" onClick={onClose} aria-label="Close gather">
          ✕
        </button>
      </div>

      {actions.length === 0 ? (
        <p className="m-empty">This is a place for making and resting, not gathering.</p>
      ) : (
        <ul className="m-gather-list">
          {actions.map((a) => {
            const used = state.actionsUsedToday.includes(a.id);
            const restraint = a.kind === 'restraint';
            const lacksCost = a.cost != null && !canAfford(state.inventory, a.cost);
            const disabled = used || lacksCost;

            let stateLabel: string;
            if (used) stateLabel = 'done today';
            else if (lacksCost) {
              const need = (Object.keys(a.cost ?? {}) as ResourceId[])[0];
              stateLabel = `need ${need ? resourceName(need).toLowerCase() : '…'}`;
            } else stateLabel = restraint ? 'give' : 'gather';

            return (
              <li key={a.id}>
                <button
                  className={`m-gather-row${used ? ' m-gather-used' : ''}${restraint ? ' m-gather-give' : ''}`}
                  disabled={disabled}
                  onClick={() => dispatch({ type: 'PERFORM_PANEL_ACTION', actionId: a.id })}
                >
                  <span className="m-gather-text">
                    <span className="m-gather-label">{a.label}</span>
                    <span className="m-gather-desc">{a.description}</span>
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
