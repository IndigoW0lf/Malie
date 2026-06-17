/**
 * Mālie — the game hook. Owns the reducer, hydrates from a save on mount, and
 * debounce-persists on change. Components get `state` and `dispatch`.
 */
import { useEffect, useReducer, useRef, useState } from 'react';
import type { GameAction, GameState } from '../types/game';
import { gameReducer } from './gameReducer';
import { createInitialState } from './initialState';
import { loadGame, saveGame } from './persistence';

const SAVE_DEBOUNCE_MS = 600;

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

  // Hydrate once from whatever save exists.
  useEffect(() => {
    let cancelled = false;
    void loadGame().then((saved) => {
      if (cancelled) return;
      if (saved) dispatch({ type: 'HYDRATE', state: saved });
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
