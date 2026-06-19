/**
 * Mālie — scene navigation. Two soft arrows on the edges of the screen move
 * between the four places, replacing the old tab bar.
 */
import type { PanelId } from '../types/game';
import { PANELS_BY_ID, cyclePanel } from '../data/panels';

interface Props {
  active: PanelId;
  onGo: (panelId: PanelId) => void;
}

export function SceneNav({ active, onGo }: Props) {
  const prev = cyclePanel(active, -1);
  const next = cyclePanel(active, 1);
  return (
    <div className="m-scenenav" aria-label="Move between places">
      <button
        className="m-scene-arrow m-scene-arrow-prev"
        onClick={() => onGo(prev)}
        aria-label={`Go to ${PANELS_BY_ID[prev].title}`}
        title={PANELS_BY_ID[prev].title}
      >
        ‹
      </button>
      <button
        className="m-scene-arrow m-scene-arrow-next"
        onClick={() => onGo(next)}
        aria-label={`Go to ${PANELS_BY_ID[next].title}`}
        title={PANELS_BY_ID[next].title}
      >
        ›
      </button>
    </div>
  );
}
