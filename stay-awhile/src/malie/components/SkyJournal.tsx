/**
 * Mālie — Ka Lani, the Sky Journal. The sky's half of memory: patterns the
 * player has observed, with what they noticed of each, the season it rules, and
 * a short sourced note. Unlike the Pilina map, this is recorded knowledge — it
 * fills through observation, not favor.
 */
import { useState } from 'react';
import type { GameState } from '../types/game';
import { SKY_PATTERNS, SKY_PATTERN_IDS } from '../data/sky';
import type { SkyPatternId } from '../data/sky';

interface Props {
  state: GameState;
  onClose: () => void;
}

export function SkyJournal({ state, onClose }: Props) {
  const [selected, setSelected] = useState<SkyPatternId | null>(null);
  const entryFor = (id: SkyPatternId) => state.skyJournal.find((e) => e.patternId === id);

  return (
    <div className="m-sky-journal">
      <div className="m-pilina-head">
        <div>
          <h2>Ka Lani</h2>
          <p className="m-pilina-sub">The sky remembers what you learned.</p>
        </div>
        <button className="m-icon-btn" onClick={onClose} aria-label="Close sky journal">
          ✕
        </button>
      </div>

      <ul className="m-skyj-list">
        {SKY_PATTERN_IDS.map((id) => {
          const p = SKY_PATTERNS[id];
          const entry = entryFor(id);
          const known = entry != null;
          const inSky = state.skyPatternId === id;
          return (
            <li key={id}>
              <button
                className={`m-skyj-row${known ? ' m-skyj-known' : ''}${inSky ? ' m-skyj-current' : ''}`}
                onClick={() => known && setSelected(id)}
                disabled={!known}
              >
                <span className="m-skyj-glyph">{known ? '✦' : '·'}</span>
                <span className="m-skyj-text">
                  <span className="m-skyj-name">{known ? p.name : 'an unread pattern'}</span>
                  <span className="m-skyj-meta">
                    {known ? `${p.season} sky` : 'observe the sky to learn it'}
                    {inSky && ' · in the sky now'}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="m-pilina-foot">
        Observe the night sky to read its patterns. What you trace is recorded here.
      </p>

      {selected && (
        <SkyCard
          patternId={selected}
          state={state}
          onBack={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function SkyCard({
  patternId,
  state,
  onBack,
}: {
  patternId: SkyPatternId;
  state: GameState;
  onBack: () => void;
}) {
  const p = SKY_PATTERNS[patternId];
  const entry = state.skyJournal.find((e) => e.patternId === patternId);

  return (
    <div className="m-card-scrim" onClick={onBack}>
      <div className="m-card" onClick={(e) => e.stopPropagation()}>
        <div className="m-card-head">
          <span className="m-card-glyph">✦</span>
          <div className="m-card-title">
            <p className="m-card-name">{p.name}</p>
            <p className="m-card-kind">sky pattern · {p.season} sky</p>
          </div>
          <button className="m-icon-btn" onClick={onBack} aria-label="Back to journal">
            ✕
          </button>
        </div>

        <p className="m-card-effect">{p.description}</p>

        <dl className="m-card-facts">
          <dt>What you noticed</dt>
          <dd>{entry?.noticed ?? 'You have not yet traced this pattern.'}</dd>
          {entry && (
            <>
              <dt>First observed</dt>
              <dd>Day {entry.discoveredDay}</dd>
            </>
          )}
        </dl>

        <p className="m-card-note">{p.learningNote}</p>
        <details className="m-card-sources">
          <summary>Sources</summary>
          <ul className="m-source-list">
            {p.sources.map((s, i) => (
              <li key={i} className="m-source-row">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.title}
                  </a>
                ) : (
                  <span>{s.title}</span>
                )}
                <span className="m-source-org"> — {s.organization}</span>
              </li>
            ))}
          </ul>
          <p className="m-source-foot">
            A respectful homage to Hawaiian sky-reading. For anything beyond this jam, a cultural or
            navigational reviewer should pass on this text.
          </p>
        </details>
      </div>
    </div>
  );
}
