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
import { useState } from 'react';
import type { GameAction, GameState } from '../types/game';
import { PANELS_BY_ID } from '../data/panels';
import { GUIDANCE_BY_ID } from '../data/guidance';
import { HaleView } from './HaleView';
import { StationLayer } from './StationLayer';

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onBeginPlacement: (craftedItemId: string) => void;
  /** Hides the hale chrome (greeting + tray) while calibrating. */
  hideHaleChrome?: boolean;
}

export function ScenePanel({ state, dispatch, onBeginPlacement, hideHaleChrome }: Props) {
  const panel = PANELS_BY_ID[state.activePanel];
  // The scene card collapses to just title + subtitle so the art breathes; tap
  // to reveal the description and the day's sign.
  const [expanded, setExpanded] = useState(false);

  if (state.activePanel === 'hale') {
    return (
      <section className="m-scene m-scene-hale">
        <HaleView state={state} onBeginPlacement={onBeginPlacement} hidden={hideHaleChrome} />
      </section>
    );
  }

  const sign = GUIDANCE_BY_ID[state.guidanceId];

  return (
    <section className={`m-scene m-scene-outdoor m-scene-${panel.id}`}>
      <div className={`m-scene-text${expanded ? ' m-scene-text-open' : ''}`}>
        <button
          className="m-scene-toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded ? 'true' : 'false'}
        >
          <span className="m-scene-heading">
            <span className="m-scene-glyph" aria-hidden>
              {panel.glyph}
            </span>
            <span className="m-scene-titles">
              <span className="m-scene-title">{panel.title}</span>
              <span className="m-scene-sub">{panel.subtitle}</span>
            </span>
          </span>
          <span className="m-scene-chev" aria-hidden>
            {expanded ? '▾' : '▸'}
          </span>
        </button>
        {expanded && (
          <div className="m-scene-body">
            <p className="m-scene-desc">{panel.description}</p>
            {sign && (
              <p className="m-scene-sign">
                <em>{sign.message}</em> {sign.effectDescription}
              </p>
            )}
          </div>
        )}
      </div>
      <StationLayer state={state} dispatch={dispatch} />
    </section>
  );
}
