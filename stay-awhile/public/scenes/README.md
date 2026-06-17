# Scene backgrounds

Full-bleed background art for each of Mālie's places, with per-mood variants.
Drop files here and they appear automatically — no code changes. Selection logic
lives in `src/malie/data/scenes.ts`.

## Spec (every image)
- **Orientation:** portrait
- **Size:** 1080 × 1920 px (9:16). `cover`-fit, centered — taller phones crop
  the top/bottom a little, so keep the focal subject centered.
- **Keep calm zones for UI overlays:** top ~12% (status bar), bottom ~30% (tabs +
  action row).
- **Format:** PNG (or WebP — see note at bottom).

## Folder layout
```
public/scenes/
  lewa_wao/        Sky & Forest
    default.png      ← dusk / evening   (also the fallback for this scene)
    night.png        ← predawn / night
    dawn.png         ← misty dawn
    rain.png         ← cloudy / rainy twilight
    stars/           constellation overlays (transparent PNG, stars only)
      hooilo.png
      kau.png
      makahiki.png
      transition.png
  kula_kahawai/    Garden & Stream   (same default/night/dawn/rain set)
  kahakai_moana/   Shore & Ocean     (same set)
  hale/            Home interior     (same set)
```

## How a variant is chosen
The day's **sign** picks the mood (edit the map in `scenes.ts` to change this):

| Sign            | Variant shown | Mood                     |
| --------------- | ------------- | ------------------------ |
| Clear stars     | `night.png`   | predawn / night          |
| Quiet rain      | `rain.png`    | cloudy / rainy twilight  |
| ʻIwa birds      | `dawn.png`    | misty dawn               |
| Watchful sea    | `default.png` | dusk / evening           |

## Graceful fallback (cascade)
For any scene the game draws the first image that loads:
**chosen variant → that scene's `default.png` → a CSS gradient.**
So a scene with only `default.png` looks right under every sign, and a scene
with no art at all shows its gradient. Add art incrementally.

## Constellations
`lewa_wao/stars/<season>.png` are **transparent** overlays (stars on
transparency) drawn over the sky on the dark-sky variants (`night`, `default`)
only — so stars never appear in daylight or rain. They change with the season
(Hooilo / Kau / Makahiki / Transition).

## WebP instead of PNG?
The code requests `.png`. To use `.webp`, change the two extensions in
`src/malie/data/scenes.ts` (`sceneBackground` and `constellationImage`).
