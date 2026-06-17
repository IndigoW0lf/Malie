/**
 * Mālie — scene backgrounds & variants.
 *
 * Each place has up to four full-bleed background variants (a time-of-day /
 * weather mood). Which variant shows is chosen from the day's sign — the sign
 * IS the game's reading of the sky, so it maps naturally to a sky mood. Change
 * SIGN_TO_VARIANT below to drive variants off something else (season, day, …).
 *
 * Backgrounds layer as a cascade so missing art degrades gracefully:
 *   chosen variant  →  the scene's `default`  →  a CSS gradient
 * So a scene with only `default.png` still looks right under any sign, and a
 * scene with no art at all falls back to its gradient.
 *
 * Files live in: public/scenes/<panel>/<variant>.png
 * Constellations: public/scenes/lewa_wao/stars/<season>.png  (overlay, dark skies only)
 */
import type { GameState, PanelId, Season } from '../types/game';

/** A background mood. Filenames match these keys exactly. */
export type SceneVariant = 'default' | 'night' | 'dawn' | 'rain';

/**
 * The day's sign → which background mood to show.
 *   clear_stars  → night   (predawn / night, stars out)
 *   quiet_rain   → rain    (cloudy / rainy twilight)
 *   iwa_birds    → dawn    (misty dawn, birds offshore)
 *   watchful_sea → default (calm dusk / evening)
 * Edit this table to remap moods; add panels' own art without touching it.
 */
export const SIGN_TO_VARIANT: Record<string, SceneVariant> = {
  clear_stars: 'night',
  quiet_rain: 'rain',
  iwa_birds: 'dawn',
  watchful_sea: 'default',
};

/** The variant in effect right now. */
export function sceneVariantForState(state: GameState): SceneVariant {
  return SIGN_TO_VARIANT[state.guidanceId] ?? 'default';
}

/** Per-panel gradient fallback, used when no art has been added yet. */
export const PANEL_GRADIENT: Record<PanelId, string> = {
  lewa_wao: 'linear-gradient(180deg, #283c5e 0%, #4f6f96 45%, #7fb7c9 75%, #f2cf8c 100%)',
  kula_kahawai: 'linear-gradient(180deg, #7fb7c9 0%, #4f7d45 45%, #cfe0a0 100%)',
  kahakai_moana: 'linear-gradient(180deg, #6fa9c0 0%, #236c8f 45%, #123f5a 80%, #e7d6a8 100%)',
  hale: 'linear-gradient(180deg, #c9923c 0%, #e2b66f 50%, #8a5a2b 100%)',
};

/**
 * The `background-image` value for a scene: the chosen variant layered over the
 * scene's default, layered over the gradient. The browser draws the first layer
 * that successfully loads, so 404s simply fall through to the next.
 */
export function sceneBackground(panel: PanelId, variant: SceneVariant): string {
  const base = `/scenes/${panel}`;
  const layers = [
    `url('${base}/${variant}.png')`,
    `url('${base}/default.png')`,
    PANEL_GRADIENT[panel],
  ];
  // De-dupe when the variant IS default, so we don't request the same file twice.
  if (variant === 'default') layers.splice(0, 1);
  return layers.join(', ');
}

const SEASON_KEY: Record<Season, string> = {
  Hooilo: 'hooilo',
  Kau: 'kau',
  Makahiki: 'makahiki',
  Transition: 'transition',
};

/** Constellation overlay for a season (sky/forest only). */
export function constellationImage(season: Season): string {
  return `/scenes/lewa_wao/stars/${SEASON_KEY[season]}.png`;
}

/** Stars only make sense on the dark-sky variants of the sky/forest scene. */
export function showsConstellations(panel: PanelId, variant: SceneVariant): boolean {
  return panel === 'lewa_wao' && (variant === 'night' || variant === 'default');
}
