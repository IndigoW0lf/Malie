# Hale item art

Per-item, per-slot-type art for things placed in the hale. The concept/reference
sheet is **not** sliced — each item is its own asset. Until a file exists, the
item renders its emoji icon as a fallback.

## Path convention
```
public/items/<recipeId>/<slotType>.png
```
- `<recipeId>` matches the recipe / craftable id (see `src/malie/data/craftables.ts`).
- `<slotType>` is one of: `shelf`, `cubby`, `floor`, `wall`, `hanging`.

An item only needs art for the slot types it's allowed in (`allowedSlots`). The
same item can look different depending on where it sits — e.g. a bowl on a shelf
vs. on the floor — which is the whole point of splitting by slot type.

## Which items, which slots
| Item (`recipeId`)        | Allowed slots              |
| ------------------------ | -------------------------- |
| `woven_mat`              | floor                      |
| `flower_shell_offering`  | shelf, cubby, floor        |
| `poi_bowl`               | shelf, cubby, floor        |
| `star_marker`            | shelf, wall, cubby         |
| `hale_shelf`             | floor, wall                |
| `herb_bundle`            | wall, hanging, shelf       |
| `limu_fish_plate`        | shelf, cubby, floor        |

Example: `public/items/poi_bowl/shelf.png`, `public/items/poi_bowl/floor.png`.

## Art spec
- Transparent PNG, square-ish framing (the item is centered in its slot box).
- Sized so it reads at small scale — slots render items at 0.45–0.8 of a base
  size. Keep the subject filling most of the canvas; trim empty margins.
- ~512×512 px is plenty.

## Slot coordinates
Where each slot sits on the hale background lives in
`src/malie/data/haleSlots.ts` (percentage x/y + scale). Tune those to your final
hale art; you don't touch this folder to move a slot.
