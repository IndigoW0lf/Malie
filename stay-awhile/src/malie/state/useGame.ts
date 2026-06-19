/**
 * Mālie — the game hook. Owns the reducer, hydrates from a save on mount, and
 * debounce-persists on change. Components get `state` and `dispatch`.
 */
import { useEffect, useReducer, useRef, useState } from 'react';
import type { GameAction, GameState } from '../types/game';
import { gameReducer } from './gameReducer';
import { createInitialState } from './initialState';
import { loadGame, saveGame } from './persistence';
import { getServerNow } from '../../services/time';

const SAVE_DEBOUNCE_MS = 600;

/** A varied seed for a brand-new game. App-side (not the reducer), so the live
 *  clock and entropy are fair game here. */
function makeSeed(): number {
  return ((Date.now() >>> 0) ^ ((Math.random() * 0xffffffff) >>> 0)) >>> 0;
}

export interface UseGame {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  /** False until the saved game (if any) has been loaded. */
  ready: boolean;
}

export function useGame(): UseGame {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate once: load a save, or seed a fresh, varied new game.
  useEffect(() => {
    let cancelled = false;
    void loadGame().then((saved) => {
      if (cancelled) return;
      dispatch({ type: 'HYDRATE', state: saved ?? createInitialState(makeSeed()) });
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Anchor the game clock to server time (anti-clock-cheat for timed systems).
  // Best-effort: if the server time can't be reached, the client clock stands in.
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void getServerNow()
      .then((serverNow) => {
        if (!cancelled) dispatch({ type: 'SET_TIME_OFFSET', offsetMs: serverNow - Date.now() });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [ready]);

  // Debounce-persist after hydration.
  useEffect(() => {
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveGame(state);
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, ready]);

  return { state, dispatch, ready };
}
