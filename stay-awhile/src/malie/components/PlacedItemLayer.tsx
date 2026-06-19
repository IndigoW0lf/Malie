/**
 * Mālie — the hale's placed-item layer. Renders every placed crafted item at
 * its slot's coordinates over the hale background. Display-only (no pointer
 * events); placement interaction lives in PlacementOverlay.
 *
 * Each item renders the asset for the slot type it sits in; a missing or failed
 * image falls back to the craftable's emoji icon.
 */
import { useState } from 'react';
import type { CraftedItem, GameState, HaleSlot } from '../types/game';
import { HALE_SLOTS_BY_ID, BASE_ITEM_WIDTH_PCT } from '../data/haleSlots';
import { craftableFor } from '../data/craftables';

interface SlotItemProps {
  slot: HaleSlot;
  item: CraftedItem;
}

function SlotItem({ slot, item }: SlotItemProps) {
  // Try art in order: slot-specific → one sprite for the whole item → emoji.
  // So a single /items/<id>.png is enough; per-slot files are an optional override.
  const [srcIdx, setSrcIdx] = useState(0);
  const craftable = craftableFor(item.recipeId);
  if (!craftable) return null;

  const sources = [
    craftable.assetBySlotType[slot.type],
    `/items/${item.recipeId}.png`,
  ].filter(Boolean) as string[];
  const src = sources[srcIdx];

  const width = `${slot.scale * BASE_ITEM_WIDTH_PCT}%`;
  const rotate = slot.rotation ? ` rotate(${slot.rotation}deg)` : '';

  const style: React.CSSProperties = {
    left: `${slot.x}%`,
    top: `${slot.y}%`,
    width,
    zIndex: slot.zIndex,
    transform: `translate(-50%, -50%)${rotate}`,
  };

  return (
    <div className="m-placed" style={style} title={`${item.name} · ${slot.type}`}>
      {src ? (
        <img
          className="m-placed-img"
          src={src}
          alt={item.name}
          onError={() => setSrcIdx((i) => i + 1)}
        />
      ) : (
        <span className="m-placed-fallback" role="img" aria-label={item.name}>
          {craftable.inventoryIcon}
        </span>
      )}
    </div>
  );
}

interface Props {
  state: GameState;
}

export function PlacedItemLayer({ state }: Props) {
  const craftedById = new Map(state.craftedItems.map((c) => [c.id, c]));

  return (
    <div className="m-placed-layer" aria-hidden>
      {state.placedItems.map((p) => {
        const slot = HALE_SLOTS_BY_ID[p.slotId];
        const item = craftedById.get(p.craftedItemId);
        if (!slot || !item) return null;
        return <SlotItem key={p.slotId} slot={slot} item={item} />;
      })}
    </div>
  );
}
