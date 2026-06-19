/**
 * Mālie — pure helpers for timed jobs. Readiness and progress are *derived* from
 * the game clock (gameNow) against a job's startedAt/readyAt, so nothing about a
 * job's "stage" is ever stored — it just works after a reload or time away.
 */
import type { GameState, TimedJob } from '../types/game';
import { gameNow } from './initialState';

/** 0 → just started, 1 → ready. Clamped. */
export function jobProgress(job: TimedJob, now: number): number {
  const span = job.readyAt - job.startedAt;
  if (span <= 0) return 1;
  return Math.max(0, Math.min(1, (now - job.startedAt) / span));
}

/** Has the job finished? */
export function isReady(job: TimedJob, now: number): boolean {
  return now >= job.readyAt;
}

/** A coarse growth stage for staged field art: 0 sprout → 1 mid → 2 near-ready
 *  → 3 ready. Drives `data-stage` on the marker so sprites can swap by stage. */
export function cropStage(progress: number): 0 | 1 | 2 | 3 {
  if (progress >= 1) return 3;
  if (progress >= 0.66) return 2;
  if (progress >= 0.33) return 1;
  return 0;
}

/** The job occupying a station slot, if any. */
export function jobForStation(jobs: TimedJob[], slotId: string): TimedJob | undefined {
  return jobs.find((j) => j.slotId === slotId);
}

/** The single in-flight craft job, if one is running. */
export function craftJob(jobs: TimedJob[]): TimedJob | undefined {
  return jobs.find((j) => j.kind === 'craft');
}

/** ms until the soonest not-yet-ready job finishes, or null if none pending. */
export function nextReadyDelta(state: GameState): number | null {
  const now = gameNow(state);
  let soonest: number | null = null;
  for (const j of state.jobs) {
    if (isReady(j, now)) continue;
    const delta = j.readyAt - now;
    if (soonest == null || delta < soonest) soonest = delta;
  }
  return soonest;
}

/** A short "3m 20s" / "45s" label for a remaining duration. */
export function formatRemaining(ms: number): string {
  if (ms <= 0) return 'ready';
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m <= 0) return `${s}s`;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}
