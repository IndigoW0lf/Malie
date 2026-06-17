/** Mālie — the four places, as gentle tabs. */
import type { PanelId } from '../types/game';
import { PANELS } from '../data/panels';

interface Props {
  active: PanelId;
  onSelect: (id: PanelId) => void;
}

export function PanelTabs({ active, onSelect }: Props) {
  return (
    <nav className="m-tabs" aria-label="Places">
      {PANELS.map((p) => (
        <button
          key={p.id}
          className={`m-tab${p.id === active ? ' m-tab-active' : ''}`}
          onClick={() => onSelect(p.id)}
        >
          <span className="m-tab-glyph">{p.glyph}</span>
          <span className="m-tab-title">{p.title}</span>
          <span className="m-tab-sub">{p.subtitle}</span>
        </button>
      ))}
    </nav>
  );
}
