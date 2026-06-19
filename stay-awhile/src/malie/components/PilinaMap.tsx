/**
 * Mālie — the Pilina Map. A vertical mauka→makai view of the ahupuaʻa with each
 * presence at its place. Unmet presences are dim silhouettes at their place;
 * met ones glow brighter as the relationship deepens. The one near today pulses.
 *
 * Presences are represented by their signs in nature (rain, the reef, the night
 * sky) — never as figures.
 */
import { useState } from 'react';
import type { GameState, GameAction, SpiritId } from '../types/game';
import { SPIRITS, SPIRIT_IDS, levelForPoints, LEVEL_NAMES, nearSpiritFor } from '../data/spirits';
import { SpiritCard } from './SpiritCard';

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onClose: () => void;
}

export function PilinaMap({ state, dispatch, onClose }: Props) {
  const [selected, setSelected] = useState<SpiritId | null>(null);
  const near = nearSpiritFor(state.guidanceId);

  return (
    <div className="m-pilina">
      <div className="m-pilina-head">
        <div>
          <h2>Pilina</h2>
          <p className="m-pilina-sub">Tend what is here. Notice what changes.</p>
        </div>
        <button className="m-icon-btn" onClick={onClose} aria-label="Close map">
          ✕
        </button>
      </div>

      <div className="m-pilina-map">
        <span className="m-region m-region-top">ka uka · the uplands</span>
        <span className="m-region m-region-mid">ke kula · the fields</span>
        <span className="m-region m-region-bot">ke kai · the sea</span>

        {SPIRIT_IDS.map((id, idx) => {
          const def = SPIRITS[id];
          const rel = state.spirits[id];
          const lvl = levelForPoints(rel.points);
          const known = rel.discovered;
          const isNear = near === id && known;
          // Alternate banks of the stream so labels never stack into each other.
          const side = idx % 2 === 0 ? 'left' : 'right';
          return (
            <button
              key={id}
              className={`m-presence m-presence-${side} m-presence-l${lvl}${
                known ? ' m-presence-known' : ''
              }${isNear ? ' m-presence-near' : ''}`}
              style={{ top: `${def.mapY}%` }}
              onClick={() => known && setSelected(id)}
              disabled={!known}
            >
              <span className="m-presence-badge">
                <span className="m-presence-glyph">{known ? def.glyph : '?'}</span>
              </span>
              <span className="m-presence-text">
                <span className="m-presence-name">{known ? def.name : 'not yet met'}</span>
                <span className="m-presence-place">
                  {def.place}
                  {known && ` · ${LEVEL_NAMES[lvl]}`}
                  {isNear && ' · near today'}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="m-pilina-foot">
        Tend each place and the presences there reveal themselves. Take only what belongs.
      </p>

      {selected && (
        <SpiritCard
          spiritId={selected}
          state={state}
          dispatch={dispatch}
          onBack={() => setSelected(null)}
        />
      )}
    </div>
  );
}
