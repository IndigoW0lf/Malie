/** Mālie — the hale floor: a grid of slots holding what you've set down. */
import type { CraftedItem, PlacedItem } from '../types/game';
import { recipeGlyph } from '../data/recipes';

interface Props {
  slots: number;
  placedItems: PlacedItem[];
  craftedById: Map<string, CraftedItem>;
}

export function PlacedItemGrid({ slots, placedItems, craftedById }: Props) {
  const bySlot = new Map(placedItems.map((p) => [p.slot, p]));

  return (
    <div className="m-hale-grid">
      {Array.from({ length: slots }, (_, slot) => {
        const placed = bySlot.get(slot);
        const item = placed ? craftedById.get(placed.craftedItemId) : undefined;
        return (
          <div key={slot} className={`m-slot${item ? ' m-slot-filled' : ''}`} title={item?.name}>
            {item ? (
              <>
                <span className="m-slot-glyph">{recipeGlyph(item.recipeId)}</span>
                <span className="m-slot-name">{item.name}</span>
              </>
            ) : (
              <span className="m-slot-empty">·</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
