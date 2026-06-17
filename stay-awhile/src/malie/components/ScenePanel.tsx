/**
 * Mālie — the main scene. The full-bleed background (see MalieApp's `.m-bg`)
 * carries the art; this component only floats the readable overlays on top.
 *
 * Outdoor places show a translucent text card (title, description, the day's
 * sign). The hale shows its warm interior view over the hale background.
 *
 * TODO(assets): backgrounds live in public/scenes/<panel>.png and are wired in
 * malie.css `.m-bg[data-panel=...]`. Design at 1080×1920 (9:16), keep focal
 * detail centered, top ~12% / bottom ~30% calm for the UI overlays.
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
      <section className="m-scene m-scene-hale">
        <HaleView state={state} dispatch={dispatch} />
      </section>
    );
  }

  const sign = GUIDANCE_BY_ID[state.guidanceId];

  return (
    <section className={`m-scene m-scene-outdoor m-scene-${panel.id}`}>
      <div className="m-scene-text">
        <h2 className="m-scene-title">
          <span className="m-scene-glyph" aria-hidden>
            {panel.glyph}
          </span>
          {panel.title}
        </h2>
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
