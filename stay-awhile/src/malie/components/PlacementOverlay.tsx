/**
 * Mālie — placement mode. After the player picks a crafted item to place, this
 * covers the hale: valid, empty slots glow as tap targets. Tap one to place;
 * tap the backdrop or Cancel to back out. No drag-and-drop — click then click.
 */
import type { CraftedItem, GameState, HaleSlot } from '../types/game';
import { HALE_SLOTS } from '../data/haleSlots';
import { craftableFor } from '../data/craftables';

interface Props {
  item: CraftedItem;
  state: GameState;
  onPlace: (slotId: string) => void;
  onCancel: () => void;
}

export function PlacementOverlay({ item, state, onPlace, onCancel }: Props) {
  const craftable = craftableFor(item.recipeId);
  const occupied = new Set(state.placedItems.map((p) => p.slotId));

  // Valid = an allowed slot type that isn't already taken.
  const validSlots: HaleSlot[] = craftable
    ? HALE_SLOTS.filter((s) => craftable.allowedSlots.includes(s.type) && !occupied.has(s.id))
    : [];

  return (
    <div className="m-place-overlay" onClick={onCancel}>
      <div className="m-place-banner" onClick={(e) => e.stopPropagation()}>
        <span>
          Placing <strong>{item.name}</strong> — tap a glowing spot
        </span>
        <button className="m-place-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {validSlots.length === 0 && (
        <p className="m-place-none" onClick={(e) => e.stopPropagation()}>
          No open spot for this here. Make room, or try a different item.
        </p>
      )}

      {validSlots.map((slot) => (
        <button
          key={slot.id}
          className={`m-place-target m-place-target-${slot.type}`}
          style={{ left: `${slot.x}%`, top: `${slot.y}%`, zIndex: slot.zIndex }}
          title={`${slot.type} — ${slot.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onPlace(slot.id);
          }}
        >
          <span className="m-place-target-dot" />
          <span className="m-place-target-label">{slot.type}</span>
        </button>
      ))}
    </div>
  );
}
