# Mālie — art checklist

Everything the game can show, and where each file goes. Anything missing falls
back to an emoji, so you can add art incrementally.

---

## 1. Scene backgrounds  →  `public/scenes/<panel>/<variant>.png`

Portrait **1080×1920 (9:16)**, `cover`-fit, focal subject centered, top ~12% /
bottom ~30% kept calm for UI. Variant is chosen by the day's sign (see
`src/malie/data/scenes.ts`). Cascade: variant → that scene's `default` → gradient.

| Scene | Files (variant = mood) | Status |
| --- | --- | --- |
| `lewa_wao/` (Sky & Forest) | `default` (dusk), `night`, `dawn`, `rain` | ✅ have |
| `kula_kahawai/` (Garden & Stream) | `default`, `night`, `dawn`, `rain` | ✅ have |
| `kahakai_moana/` (Shore & Ocean) | `default`, `night`, `dawn`, `rain` | ✅ have |
| `hale/` (Home interior) | `default` | ✅ have |

**Constellation overlays** (optional) → `public/scenes/lewa_wao/stars/<season>.png`
— transparent PNG, stars only, shown on dark sky variants:
`hooilo.png`, `kau.png`, `makahiki.png`, `transition.png`.  *Status: ⬜ none yet.*

---

## 2. Item sprites  →  `public/items/<recipeId>.png`  (ONE per item)

Transparent PNG, ~512×512, subject centered, trimmed margins. These are the
things placed in the hale. **One file per item is enough** — the game reuses it
on every slot the item allows. (Optional per-slot override:
`public/items/<recipeId>/<slotType>.png`.)

The "sits on" column is just context for framing — you still only make one sprite.

### Rest / Nourish / Tend
| Item | `recipeId` | Made from | Sits on |
| --- | --- | --- | --- |
| Woven Mat | `woven_mat` | fiber ×3, leaf ×1 | floor |
| Poi Bowl | `poi_bowl` | kalo ×2, wood ×1 | shelf, cubby, floor |
| Limu & Fish Plate | `limu_fish_plate` | fish ×1, limu ×1 | shelf, cubby, floor |
| Herb Bundle | `herb_bundle` | herb ×2, leaf ×1 | wall, hanging, shelf |
| Planting Basket | `planting_basket` | lauhala ×2 *(needs Digging Stick)* | floor, cubby |

### Fish
| Item | `recipeId` | Made from | Sits on |
| --- | --- | --- | --- |
| Fish Basket (Hīnaʻi) | `fish_basket` | lauhala ×2, cordage ×1 *(needs Net Needle)* | floor, cubby |
| Limu Basket | `limu_basket` | lauhala ×2 *(needs Shell Knife)* | floor, cubby |

### Relationship / Offerings
| Item | `recipeId` | Made from | Sits on |
| --- | --- | --- | --- |
| Flower & Shell Offering | `flower_shell_offering` | flower ×1, shell ×1 | shelf, cubby, floor |
| Shell Bowl | `shell_bowl` | shell ×2 | shelf, cubby |
| Water Bowl | `water_bowl` | gourd ×1, coral ×1 | shelf, cubby, floor |
| Wind Chime | `wind_chime` | shell ×3, cordage ×1 | hanging, wall |

### Guidance
| Item | `recipeId` | Made from | Sits on |
| --- | --- | --- | --- |
| Feather Bundle | `feather_bundle` | feather ×2, fiber ×1 | wall, hanging, shelf |
| Star Marker | `star_marker` | smooth_stone ×1, star_sign ×1 | shelf, wall, cubby |
| Carved Token | `carved_token` | smooth_stone ×1, coral ×1 *(needs Shell Knife)* | shelf, wall, cubby |
| Kukui Light | `kukui_light` | kukui ×2, cordage ×1 | shelf, cubby, floor |

### Home / structures
| Item | `recipeId` | Made from | Sits on |
| --- | --- | --- | --- |
| Hale Shelf | `hale_shelf` | wood ×3, fiber ×1 | floor, wall |
| Gourd Bottle (Huewai) | `gourd_bottle` | gourd ×1, cordage ×1 | shelf, cubby, floor |
| Folded Kapa | `folded_kapa` | kapa_cloth ×1 | shelf, cubby, floor |

**→ 18 item sprites total.**

---

## 3. Tools  (icons optional — shown in lists, not placed in the hale)

Crafted once and kept. They appear as a small icon + name in the crafting tray
and the hale "Tools:" line. Emoji now; a small icon sprite is optional and not
yet wired to load from a file.

| Tool | `recipeId` | Made from | Unlocks |
| --- | --- | --- | --- |
| Kapa Beater | `kapa_beater` | wood ×1, smooth_stone ×1 | Kapa Cloth |
| Net Needle | `net_needle` | wood ×1, fiber ×2 | Fishing Net, Fish Basket |
| Shell Knife | `shell_knife` | shell ×1, wood ×1 | Limu Basket, Carved Token |
| Digging Stick (ʻŌʻō) | `digging_stick` | wood ×2, fiber ×1 | Planting Basket |

**Fishing Net** (`fishing_net`, fiber ×3 + shell ×1, needs Net Needle) is a
*usable* tool, not placed in the hale — emoji only.

---

## 4. Materials  (made at Craft, used by other recipes — emoji icons)

| Material | `recipeId` | Made from | Used in |
| --- | --- | --- | --- |
| Cordage | `cordage` | fiber ×3 | Wind Chime, Kukui Light, Gourd Bottle, Fish Basket |
| Kapa Cloth | `kapa_cloth` | wauke ×2 *(needs Kapa Beater)* | Folded Kapa |

---

## 5. Resources  (gathered — emoji icons in the bag / ingredient lists)

Not placed in the hale; shown as small icons only (emoji today). Sprites optional.

`flower, leaf, feather, star_sign, smooth_stone, kalo, fiber, wood, gourd, herb,
shell, fish, limu, driftwood, tide_pool_gift, kukui, wauke, lauhala, coral`
(plus the two materials above). `bark_fiber` exists but is currently unused.

---

## Priority for the jam
1. **18 item sprites** (`public/items/<id>.png`) — the biggest visible win in the hale.
2. **Constellation overlays** for Lewa/Wao (4) — atmospheric, optional.
3. Tool / resource icons — nice-to-have; emoji read fine.
