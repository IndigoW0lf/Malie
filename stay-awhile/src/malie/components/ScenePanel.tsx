/**
 * Mālie — the main scene. Shows the active place; the hale gets its own warm
 * interior view, the outdoor places show their scene and the day's sign.
 *
 * TODO(assets): the `m-scene-art` block is a CSS stand-in for an illustrated
 * scene. Swap in a background image keyed on panel id + season.
 */
import type { GameAction, GameState } from '../types/game';
import { PANELS_BY_ID } from '../data/panels';
import { GUIDANCE_BY_ID } from '../data/guidance';
import { HaleView } from './HaleView';

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export function ScenePanel({ state, dispatch }: Props) {
  const panel = PANELS_BY_ID[state.activePanel];

  if (state.activePanel === 'hale') {
    return (
      <section className={`m-scene m-scene-hale`}>
        <HaleView state={state} dispatch={dispatch} />
      </section>
    );
  }

  const sign = GUIDANCE_BY_ID[state.guidanceId];

  return (
    <section className={`m-scene m-scene-${panel.id}`}>
      <div className="m-scene-art" aria-hidden>
        <span className="m-scene-glyph">{panel.glyph}</span>
      </div>
      <div className="m-scene-text">
        <h2 className="m-scene-title">{panel.title}</h2>
        <p className="m-scene-sub">{panel.subtitle}</p>
        <p className="m-scene-desc">{panel.description}</p>
        {sign && (
          <p className="m-scene-sign">
            <em>{sign.message}</em> {sign.effectDescription}
          </p>
        )}
      </div>
    </section>
  );
}
