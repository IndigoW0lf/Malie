/**
 * Mālie — Observe the sky. A small, gentle interaction: trace tonight's pattern
 * by tapping its bright stars in order. Success is never required — you can
 * always finish — but a careful trace records a clearer note and a star sign.
 */
import { useState } from 'react';
import type { SkyPattern } from '../data/sky';

interface Props {
  pattern: SkyPattern;
  onObserve: (traced: boolean) => void;
  onClose: () => void;
}

export function SkyObserve({ pattern, onObserve, onClose }: Props) {
  /** Star indices tapped so far, in order. */
  const [tapped, setTapped] = useState<number[]>([]);
  const traced = tapped.length === pattern.stars.length;
  const nextIdx = tapped.length; // the star the trace expects next

  const tapStar = (i: number) => {
    if (traced) return;
    if (i === nextIdx) setTapped((t) => [...t, i]); // right star, in order
    else setTapped([]); // out of order — the line falls away, try again
  };

  return (
    <div className="m-sky" role="dialog" aria-label="Observe the sky">
      <div className="m-sky-head">
        <div>
          <h2>{pattern.name}</h2>
          <p className="m-sky-sub">{traced ? 'You hold the whole shape.' : pattern.observationText}</p>
        </div>
        <button className="m-icon-btn" onClick={onClose} aria-label="Leave the sky">
          ✕
        </button>
      </div>

      <div className="m-sky-field">
        {/* the traced line, drawn between stars already tapped */}
        <svg className="m-sky-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {tapped.slice(1).map((idx, k) => {
            const a = pattern.stars[tapped[k]!]!;
            const b = pattern.stars[idx]!;
            return <line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
          })}
        </svg>

        {pattern.stars.map((s, i) => {
          const done = tapped.includes(i);
          const isNext = i === nextIdx && !traced;
          return (
            <button
              key={i}
              className={`m-sky-star${done ? ' m-sky-star-on' : ''}${isNext ? ' m-sky-star-next' : ''}`}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              onClick={() => tapStar(i)}
              aria-label={`star ${i + 1}`}
            >
              ✦
            </button>
          );
        })}
      </div>

      <div className="m-sky-foot">
        <p className="m-sky-note">
          {traced ? 'You find the pattern. You record where it rises.' : pattern.description}
        </p>
        <button className="m-sky-done" onClick={() => onObserve(traced)}>
          {traced ? 'Record it' : 'That’s enough for tonight'}
        </button>
      </div>
    </div>
  );
}
