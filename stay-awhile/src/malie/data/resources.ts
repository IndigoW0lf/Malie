/**
 * Mālie — the resources of the ahupuaʻa.
 *
 * Glyphs are placeholders. TODO(assets): swap each `glyph` for an illustrated
 * icon (see CLAUDE.md → jam-ready-assets) once art lands.
 */
import type { Resource, ResourceId } from '../types/game';

export const RESOURCES: Record<ResourceId, Resource> = {
  flower: { id: 'flower', name: 'Flower', glyph: '🌺', note: 'A few blooms, no more.' },
  leaf: { id: 'leaf', name: 'Leaf', glyph: '🌿', note: 'Green and pliant.' },
  star_sign: { id: 'star_sign', name: 'Star Sign', glyph: '✨', note: 'A reading of the sky.' },
  smooth_stone: { id: 'smooth_stone', name: 'Smooth Stone', glyph: '🪨', note: 'Worn kind by water.' },
  kalo: { id: 'kalo', name: 'Kalo', glyph: '🍠', note: 'Taro from the loʻi.' },
  fiber: { id: 'fiber', name: 'Fiber', glyph: '🧵', note: 'Strands for weaving.' },
  wood: { id: 'wood', name: 'Wood', glyph: '🪵', note: 'Gathered, not felled.' },
  gourd: { id: 'gourd', name: 'Gourd', glyph: '🥥', note: 'A vessel in waiting.' },
  herb: { id: 'herb', name: 'Herb', glyph: '🌱', note: 'Fragrant and fresh.' },
  bark_fiber: { id: 'bark_fiber', name: 'Bark Fiber', glyph: '🪢', note: 'Stripped with care.' },
  shell: { id: 'shell', name: 'Shell', glyph: '🐚', note: 'A gift of the tide.' },
  fish: { id: 'fish', name: 'Fish', glyph: '🐟', note: 'Only what is needed.' },
  limu: { id: 'limu', name: 'Limu', glyph: '🌾', note: 'Seaweed from the shallows.' },
  driftwood: { id: 'driftwood', name: 'Driftwood', glyph: '🪵', note: 'Carried in by the sea.' },
  tide_pool_gift: { id: 'tide_pool_gift', name: 'Tide-Pool Gift', glyph: '💠', note: 'Something shining, left behind.' },

  // gathered additions
  kukui: { id: 'kukui', name: 'Kukui Nut', glyph: '🌰', note: 'Oily nut, good for light.' },
  wauke: { id: 'wauke', name: 'Wauke Bark', glyph: '🟫', note: 'Bark strips for kapa.' },
  lauhala: { id: 'lauhala', name: 'Lauhala', glyph: '🍃', note: 'Pandanus leaves for weaving.' },
  coral: { id: 'coral', name: 'Coral', glyph: '🪸', note: 'A piece worn smooth by the sea.' },

  // crop harvests
  uala: { id: 'uala', name: 'ʻUala', glyph: '🥔', note: 'Sweet potato from the māla.' },
  awa: { id: 'awa', name: 'ʻAwa', glyph: '🫚', note: 'Kava root, for ceremony and rest.' },
  ti_leaf: { id: 'ti_leaf', name: 'Lāʻī', glyph: '🎍', note: 'Tī leaf — wrapping, blessing, protection.' },
  banana: { id: 'banana', name: 'Maiʻa', glyph: '🍌', note: 'Banana from the grove.' },

  // prepared materials
  cordage: { id: 'cordage', name: 'Cordage', glyph: '🧶', note: 'Twisted fiber, ready to bind.' },
  kapa_cloth: { id: 'kapa_cloth', name: 'Kapa Cloth', glyph: '🧻', note: 'Beaten bark cloth.' },
};

/** Display helper. */
export function resourceName(id: ResourceId): string {
  return RESOURCES[id]?.name ?? id;
}

export function resourceGlyph(id: ResourceId): string {
  return RESOURCES[id]?.glyph ?? '•';
}
