/**
 * Mālie — the four panels of the ahupuaʻa and the actions within each.
 *
 * Each action can be done once per day (the reducer enforces this). That daily
 * limit is the whole point: a day holds only a few gentle gestures.
 *
 * TODO(assets): each panel `glyph` is a stand-in for an illustrated scene.
 */
import type { Panel, PanelAction, PanelId } from '../types/game';

export const PANELS: Panel[] = [
  {
    id: 'lewa_wao',
    title: 'Lewa / Wao',
    subtitle: 'Sky & Forest',
    description:
      'The upland reaches and the open sky. Stars, birds, and the season speak here. Listen before you take.',
    glyph: '🌌',
  },
  {
    id: 'kula_kahawai',
    title: 'Kula / Kahawai',
    subtitle: 'Garden & Stream',
    description:
      'The loʻi kalo and the māla, fed by the kahawai. Tend the land and it tends you back.',
    glyph: '🌾',
  },
  {
    id: 'kahakai_moana',
    title: 'Kahakai / Moana',
    subtitle: 'Shore & Ocean',
    description:
      'The shoreline and the fishpond. Read the tide, mend the net, and take only what belongs.',
    glyph: '🌊',
  },
  {
    id: 'hale',
    title: 'Hale',
    subtitle: 'Home',
    description:
      'The warm hale. Craft, set things down, and let the home remember the days you have spent.',
    glyph: '🏠',
  },
];

export const PANELS_BY_ID: Record<PanelId, Panel> = PANELS.reduce(
  (acc, p) => ((acc[p.id] = p), acc),
  {} as Record<PanelId, Panel>,
);

export const PANEL_ACTIONS: PanelAction[] = [
  // ─── Lewa / Wao ────────────────────────────────────────────────────────────
  {
    id: 'observe_stars',
    label: 'Observe Stars',
    description: 'Spend a quiet moment reading the sky.',
    panelId: 'lewa_wao',
    kind: 'observe',
    rewards: { star_sign: 1 },
    conditionalRewards: [{ guidanceId: 'clear_stars', rewards: { smooth_stone: 1 } }],
  },
  {
    id: 'gather_flowers',
    label: 'Gather Flowers',
    description: 'Gather only a few blooms and a leaf or two.',
    panelId: 'lewa_wao',
    kind: 'gather',
    rewards: { flower: 1, leaf: 1 },
  },
  {
    id: 'listen_birds',
    label: 'Listen to Birds',
    description: 'Watch the birds and let one feather fall to you.',
    panelId: 'lewa_wao',
    kind: 'observe',
    rewards: { feather: 1 },
    conditionalRewards: [{ guidanceId: 'iwa_birds', rewards: { feather: 1 } }],
  },

  // ─── Kula / Kahawai ────────────────────────────────────────────────────────
  {
    id: 'tend_loi',
    label: 'Tend Loʻi',
    description: 'Clear, water, and tend the kalo.',
    panelId: 'kula_kahawai',
    kind: 'tend',
    rewards: { kalo: 1, fiber: 1 },
    conditionalRewards: [{ guidanceId: 'quiet_rain', rewards: { kalo: 1 } }],
  },
  {
    id: 'gather_garden',
    label: 'Gather from the Māla',
    description: 'Pick herbs and a leaf from the garden.',
    panelId: 'kula_kahawai',
    kind: 'gather',
    rewards: { herb: 1, leaf: 1 },
    conditionalRewards: [{ guidanceId: 'quiet_rain', rewards: { herb: 1 } }],
  },
  {
    id: 'gather_wood',
    label: 'Gather Wood & Fiber',
    description: 'Collect fallen wood and strip a little bark fiber.',
    panelId: 'kula_kahawai',
    kind: 'gather',
    rewards: { wood: 1, bark_fiber: 1, gourd: 1 },
  },

  // ─── Kahakai / Moana ───────────────────────────────────────────────────────
  {
    id: 'watch_tide',
    label: 'Watch the Tide',
    description: 'Read the movement of the shore.',
    panelId: 'kahakai_moana',
    kind: 'observe',
    rewards: { shell: 1 },
    conditionalRewards: [{ tide: 'low', rewards: { tide_pool_gift: 1, limu: 1 } }],
  },
  {
    id: 'fish_gently',
    label: 'Fish Gently',
    description: 'Cast with patience. Take only what is needed.',
    panelId: 'kahakai_moana',
    kind: 'fish',
    rewards: { fish: 1 },
    conditionalRewards: [{ guidanceId: 'iwa_birds', rewards: { fish: 1 } }],
  },
  {
    id: 'gather_shore',
    label: 'Walk the Shore',
    description: 'Gather what the sea has set down: a shell, driftwood, limu.',
    panelId: 'kahakai_moana',
    kind: 'gather',
    rewards: { shell: 1, driftwood: 1, limu: 1 },
  },
];

export const ACTIONS_BY_PANEL: Record<PanelId, PanelAction[]> = PANEL_ACTIONS.reduce(
  (acc, a) => {
    (acc[a.panelId] ??= []).push(a);
    return acc;
  },
  { lewa_wao: [], kula_kahawai: [], kahakai_moana: [], hale: [] } as Record<PanelId, PanelAction[]>,
);

export function findAction(actionId: string): PanelAction | undefined {
  return PANEL_ACTIONS.find((a) => a.id === actionId);
}
