/**
 * Mālie — the growth overlay on an outdoor scene. Renders ONLY the plots that
 * currently hold a job, as a small marker over the right field (planting itself
 * happens in the Tend menu, see ActionsSheet). An empty field shows nothing, so
 * the background stays open.
 *
 *  • growing/soaking — glyph + a thin progress bar + remaining time, and (for a
 *    crop) a one-time Tend.
 *  • ready — the marker becomes a tap-to-harvest / tap-to-haul button.
 *
 * Readiness is derived from the game clock; a local `now` ticks once a second
 * only to animate progress — it never writes game state on a timer.
 *
 * TODO(art): swap the glyph for staged field sprites at public/fields/<id>/.
 */
import { useEffect, useState } from 'react';
import type { GameAction, GameState } from '../types/game';
import { plotsForPanel, findPlot, findPlantable } from '../data/stations';
import { jobProgress, isReady, formatRemaining, nextReadyDelta, cropStage } from '../state/jobs';
import { clockOffsetMs } from '../state/initialState';

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export function StationLayer({ state, dispatch }: Props) {
  const offset = clockOffsetMs(state);
  const [now, setNow] = useState(() => Date.now() + offset);
  useEffect(() => {
    const tick = () => setNow(Date.now() + offset);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [offset]);

  const plots = plotsForPanel(state.activePanel);
  if (plots.length === 0) return null;

  const here = new Set(plots.map((p) => p.id));
  const jobsHere = state.jobs.filter((j) => j.slotId != null && here.has(j.slotId));
  const restDelta = nextReadyDelta(state);

  return (
    <div className="m-fields" aria-label="Growing">
      {jobsHere.map((job) => {
        const plot = job.slotId ? findPlot(job.slotId) : undefined;
        const p = findPlantable(job.definitionId);
        if (!plot || !p) return null;
        const ready = isReady(job, now);

        return (
          <div
            key={job.id}
            className={`m-field${ready ? ' m-field-ready' : ''}`}
            data-kind={p.kind}
            data-stage={cropStage(jobProgress(job, now))}
            style={{ left: `${plot.x}%`, top: `${plot.y}%` }}
          >
            {ready ? (
              <button
                className="m-field-collect"
                onClick={() => dispatch({ type: 'COLLECT_JOB', jobId: job.id })}
              >
                <span className="m-field-glyph" aria-hidden>
                  {p.glyph}
                </span>
                <span className="m-field-verb">{p.readyVerb}</span>
              </button>
            ) : (
              <div className="m-field-grow">
                <span className="m-field-glyph" aria-hidden>
                  {p.glyph}
                </span>
                <div className="m-station-bar">
                  <div
                    className="m-station-fill"
                    style={{ width: `${Math.round(jobProgress(job, now) * 100)}%` }}
                  />
                </div>
                <span className="m-field-time">{formatRemaining(job.readyAt - now)}</span>
                {job.kind === 'crop' && !job.tended && (
                  <button
                    className="m-station-tend"
                    onClick={() => dispatch({ type: 'TEND_JOB', jobId: job.id })}
                  >
                    Tend
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {restDelta != null && (
        <button
          className="m-rest-ready"
          onClick={() => dispatch({ type: 'REST_UNTIL_NEXT_READY' })}
        >
          Sit a while · next ready in {formatRemaining(restDelta)}
        </button>
      )}
    </div>
  );
}
