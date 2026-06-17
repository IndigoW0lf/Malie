/**
 * Mālie — the bottom row of gestures. Shows the current place's actions (each
 * doable once a day), plus Craft and Rest, which are always at hand.
 */
import type { GameAction, GameState } from '../types/game';
import { ACTIONS_BY_PANEL } from '../data/panels';

const KIND_GLYPH: Record<string, string> = {
  observe: '👁️',
  gather: '🤲',
  tend: '🌱',
  fish: '🎣',
};

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onOpenCrafting: () => void;
}

export function ActionRow({ state, dispatch, onOpenCrafting }: Props) {
  const actions = ACTIONS_BY_PANEL[state.activePanel] ?? [];

  return (
    <footer className="m-actionrow">
      <div className="m-actions">
        {actions.map((a) => {
          const used = state.actionsUsedToday.includes(a.id);
          return (
            <button
              key={a.id}
              className={`m-action${used ? ' m-action-used' : ''}`}
              disabled={used}
              title={a.description}
              onClick={() => dispatch({ type: 'PERFORM_PANEL_ACTION', actionId: a.id })}
            >
              <span className="m-action-glyph">{KIND_GLYPH[a.kind] ?? '•'}</span>
              <span className="m-action-label">{a.label}</span>
              {used && <span className="m-action-done">done today</span>}
            </button>
          );
        })}
        {actions.length === 0 && (
          <p className="m-actions-empty">This is a place for making and resting, not gathering.</p>
        )}
      </div>

      <div className="m-actions-fixed">
        <button className="m-action m-action-craft" onClick={onOpenCrafting}>
          <span className="m-action-glyph">🧶</span>
          <span className="m-action-label">Craft</span>
        </button>
        <button
          className="m-action m-action-rest"
          onClick={() => dispatch({ type: 'END_DAY' })}
          title="Let the day close and begin the next."
        >
          <span className="m-action-glyph">🌙</span>
          <span className="m-action-label">Rest · End Day</span>
        </button>
      </div>
    </footer>
  );
}
