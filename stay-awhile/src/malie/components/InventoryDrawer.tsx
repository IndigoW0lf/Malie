/** Mālie — the bag. A quiet list of what you carry. */
import type { Inventory, ResourceId } from '../types/game';
import { RESOURCES } from '../data/resources';

interface Props {
  open: boolean;
  inventory: Inventory;
  onClose: () => void;
}

export function InventoryDrawer({ open, inventory, onClose }: Props) {
  const entries = (Object.entries(inventory) as [ResourceId, number][])
    .filter(([, n]) => n > 0)
    .sort((a, b) => RESOURCES[a[0]].name.localeCompare(RESOURCES[b[0]].name));

  return (
    <div className={`m-drawer${open ? ' m-drawer-open' : ''}`} aria-hidden={!open}>
      <div className="m-drawer-head">
        <h2>Your Bag</h2>
        <button className="m-icon-btn" onClick={onClose} aria-label="Close bag">
          ✕
        </button>
      </div>
      {entries.length === 0 ? (
        <p className="m-empty">Nothing gathered yet. The day is young.</p>
      ) : (
        <ul className="m-inv-list">
          {entries.map(([id, n]) => {
            const r = RESOURCES[id];
            return (
              <li key={id} className="m-inv-item" title={r.note}>
                <span className="m-inv-glyph">{r.glyph}</span>
                <span className="m-inv-name">{r.name}</span>
                <span className="m-pill">{n}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
