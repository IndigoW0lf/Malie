/** Mālie — the quiet status bar: day, season, tide, the day's sign. */
import type { GameState } from '../types/game';
import { GUIDANCE_BY_ID } from '../data/guidance';

const TIDE_GLYPH: Record<GameState['tide'], string> = {
  low: '🌙',
  rising: '🌗',
  high: '🌕',
  falling: '🌖',
};

const TIDE_LABEL: Record<GameState['tide'], string> = {
  low: 'Low tide',
  rising: 'Rising tide',
  high: 'High tide',
  falling: 'Falling tide',
};

interface Props {
  state: GameState;
  onToggleInventory: () => void;
  onOpenPilina: () => void;
  onOpenSky: () => void;
  inventoryCount: number;
}

export function TopStatusBar({
  state,
  onToggleInventory,
  onOpenPilina,
  onOpenSky,
  inventoryCount,
}: Props) {
  const sign = GUIDANCE_BY_ID[state.guidanceId];
  return (
    <header className="m-statusbar">
      <div className="m-status-group">
        <span className="m-status-item">
          <span className="m-status-label">Day</span>
          <span className="m-status-value">{state.day}</span>
        </span>
        <span className="m-status-item">
          <span className="m-status-label">Season</span>
          <span className="m-status-value">{state.season}</span>
        </span>
        <span className="m-status-item">
          <span className="m-status-label">Tide</span>
          <span className="m-status-value">
            {TIDE_GLYPH[state.tide]} {TIDE_LABEL[state.tide]}
          </span>
        </span>
        <span className="m-status-item m-status-sign" title={sign?.effectDescription}>
          <span className="m-status-label">Sign</span>
          <span className="m-status-value">{sign?.name ?? '—'}</span>
        </span>
      </div>
      <div className="m-status-actions">
        <button className="m-inventory-toggle" onClick={onOpenPilina}>
          ✦ Pilina
        </button>
        <button className="m-inventory-toggle" onClick={onOpenSky}>
          🌌 Sky
        </button>
        <button className="m-inventory-toggle" onClick={onToggleInventory}>
          🧺 Bag <span className="m-pill">{inventoryCount}</span>
        </button>
      </div>
    </header>
  );
}
