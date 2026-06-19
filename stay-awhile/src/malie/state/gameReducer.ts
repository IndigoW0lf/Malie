/**
 * Mālie — the reducer. The single place game state changes, and it changes
 * purely: every branch returns a new GameState, never mutating the old one.
 */
import type { CraftedItem, GameAction, GameState, Inventory, ResourceId, SpiritId } from '../types/game';
import { findAction } from '../data/panels';
import { findRecipe, isToolRecipe } from '../data/recipes';
import { getSlot } from '../data/haleSlots';
import { allowsSlotType } from '../data/craftables';
import { guidanceForDay } from '../data/guidance';
import { resourceName } from '../data/resources';
import {
  SPIRITS,
  LEVEL_NAMES,
  levelForPoints,
  nearSpiritFor,
  ACTION_SPIRIT_GAINS,
  craftSpiritGains,
  spiritActionBonus,
  OFFERING_AFFINITY,
  OFFERING_BASE_POINTS,
  OFFERING_ALIGNED_BONUS,
  pueoRevealsNextSign,
} from '../data/spirits';
import { dawnMessages } from '../data/greetings';
import {
  addRewards,
  canAfford,
  createInitialState,
  removeItems,
  seasonForDay,
  tideForDay,
} from './initialState';

/** Cap the visible log so it never grows without bound. */
const MAX_LOG = 40;

function pushLog(log: string[], ...lines: string[]): string[] {
  // Newest first.
  return [...lines.reverse(), ...log].slice(0, MAX_LOG);
}

/** A short human phrase for a reward bag: "1 kalo, 1 fiber". */
function describeRewards(rewards: Inventory): string {
  return (Object.entries(rewards) as [ResourceId, number][])
    .map(([id, amount]) => `${amount} ${resourceName(id).toLowerCase()}`)
    .join(', ');
}

/** Stable-enough unique id for a crafted instance (no RNG needed). */
function craftedId(recipeId: string, state: GameState): string {
  return `${recipeId}-d${state.day}-${state.craftedItems.length}`;
}

/**
 * Apply Pilina point gains to the spirits map. Adds a +1 alignment bonus when a
 * gained presence is the one near today, and returns gentle messages for first
 * discovery and level-ups.
 *
 * `certain` gains (deliberate gifts — restraint, offerings) always land.
 * Otherwise a gain is a *chance* to be noticed: you don't always see a presence
 * in a passing act. A near-miss raises that presence's hidden `attention`, which
 * lifts the next chance, so luck never fully stalls discovery. Acting on a
 * presence's sign-day improves the odds.
 */
function applySpiritGains(
  spirits: GameState['spirits'],
  gains: Partial<Record<SpiritId, number>>,
  nearSpirit: SpiritId | undefined,
  certain: boolean,
): { spirits: GameState['spirits']; messages: string[] } {
  let next = spirits;
  const messages: string[] = [];
  for (const [id, base] of Object.entries(gains) as [SpiritId, number][]) {
    if (!base) continue;
    const before = next[id];
    const isNear = id === nearSpirit;

    if (!certain) {
      const baseChance = before.discovered ? 0.5 : 0.25; // noticing is harder
      const chance = Math.min(0.9, baseChance + (isNear ? 0.25 : 0) + before.attention * 0.1);
      if (Math.random() >= chance) {
        // A near-miss: nothing stirs, but attention builds for next time.
        next = { ...next, [id]: { ...before, attention: before.attention + 1 } };
        continue;
      }
    }

    const points = before.points + base + (isNear ? 1 : 0);
    next = { ...next, [id]: { points, discovered: true, attention: 0 } };
    if (!before.discovered) {
      messages.push(`You begin to notice ${SPIRITS[id].name}.`);
    } else if (levelForPoints(points) > levelForPoints(before.points)) {
      messages.push(`Your pilina with ${SPIRITS[id].name} deepens — ${LEVEL_NAMES[levelForPoints(points)]}.`);
    }
  }
  return { spirits: next, messages };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'RESET_GAME':
      return createInitialState();

    case 'SET_PANEL':
      if (state.activePanel === action.panelId) return state;
      return { ...state, activePanel: action.panelId };

    case 'PERFORM_PANEL_ACTION': {
      const def = findAction(action.actionId);
      if (!def) return state;
      // One gesture per action per day.
      if (state.actionsUsedToday.includes(def.id)) return state;
      // Restraint that gives something back (return a fish) needs it in hand.
      if (def.cost && !canAfford(state.inventory, def.cost)) return state;

      // Base rewards, plus what the day's sign/tide unlocks, plus a relationship
      // blessing (a deepened presence makes its domain a little more generous).
      let gained: Inventory = { ...(def.rewards ?? {}) };
      for (const cond of def.conditionalRewards ?? []) {
        const signMatches = cond.guidanceId == null || cond.guidanceId === state.guidanceId;
        const tideMatches = cond.tide == null || cond.tide === state.tide;
        if (signMatches && tideMatches) {
          gained = addRewards(gained, cond.rewards);
        }
      }
      gained = addRewards(gained, spiritActionBonus(def.id, state.spirits));

      let inventory = addRewards(state.inventory, gained);
      if (def.cost) inventory = removeItems(inventory, def.cost);

      // Pilina points (action's own gains + table gains), with alignment to today.
      // Restraint is a deliberate gift, so it always lands; passive acts are a
      // chance to be noticed.
      const gains = { ...ACTION_SPIRIT_GAINS[def.id], ...def.spiritGain };
      const { spirits, messages: spiritMsgs } = applySpiritGains(
        state.spirits,
        gains,
        nearSpiritFor(state.guidanceId),
        def.kind === 'restraint',
      );

      const gainedText = describeRewards(gained);
      const line =
        def.kind !== 'restraint' && gainedText
          ? `${def.label}. You gather ${gainedText}.`
          : `${def.label}.`;

      return {
        ...state,
        inventory,
        actionsUsedToday: [...state.actionsUsedToday, def.id],
        spirits,
        messageLog: pushLog(state.messageLog, ...spiritMsgs, line),
      };
    }

    case 'OFFER_TO_SPIRIT': {
      const item = state.craftedItems.find((c) => c.id === action.craftedItemId);
      if (!item || item.placed) return state;
      const recipe = findRecipe(item.recipeId);
      if (!recipe?.result.offering) return state; // only offerings may be offered

      const aligned = (OFFERING_AFFINITY[item.recipeId] ?? []).includes(action.spiritId);
      const pts = OFFERING_BASE_POINTS + (aligned ? OFFERING_ALIGNED_BONUS : 0);
      const { spirits, messages } = applySpiritGains(
        state.spirits,
        { [action.spiritId]: pts },
        undefined,
        true, // an offering is a deliberate gift — it always lands
      );

      return {
        ...state,
        craftedItems: state.craftedItems.filter((c) => c.id !== item.id),
        spirits,
        messageLog: pushLog(
          state.messageLog,
          ...messages,
          `You offer the ${item.name} to ${SPIRITS[action.spiritId].name}. The pilina deepens.`,
        ),
      };
    }

    case 'CRAFT': {
      const recipe = findRecipe(action.recipeId);
      if (!recipe) return state;

      // Tools are made once and kept — crafting an owned tool is a no-op.
      if (recipe.result.tool && state.craftedItems.some((c) => c.recipeId === recipe.id)) {
        return state;
      }
      if (!canAfford(state.inventory, recipe.ingredients)) return state;

      // Honor availability windows (tide / season / sign).
      const when = recipe.availableWhen;
      if (when) {
        if (when.tides && !when.tides.includes(state.tide)) return state;
        if (when.seasons && !when.seasons.includes(state.season)) return state;
        if (when.signs && !when.signs.includes(state.guidanceId)) return state;
      }

      // Required tools must be owned.
      if (recipe.requiresTools) {
        const owned = new Set(
          state.craftedItems.filter((c) => isToolRecipe(c.recipeId)).map((c) => c.recipeId),
        );
        if (!recipe.requiresTools.every((t) => owned.has(t))) return state;
      }

      const inventory = removeItems(state.inventory, recipe.ingredients);

      // Making things honors Kū (the work of hands), tools most of all.
      const { spirits, messages: kuMsgs } = applySpiritGains(
        state.spirits,
        craftSpiritGains(!!recipe.result.tool),
        nearSpiritFor(state.guidanceId),
        false, // Kū may or may not notice a given piece of work
      );

      // Material craft: yields resources into the bag, makes no kept item.
      if (recipe.yields) {
        return {
          ...state,
          inventory: addRewards(inventory, recipe.yields),
          spirits,
          messageLog: pushLog(
            state.messageLog,
            ...kuMsgs,
            `You prepare ${describeRewards(recipe.yields)}.`,
          ),
        };
      }

      // Object / tool craft: produce a kept item.
      const item: CraftedItem = {
        id: craftedId(recipe.id, state),
        recipeId: recipe.id,
        name: recipe.name,
        placed: false,
        createdDay: state.day,
      };
      const line = recipe.result.tool
        ? `You make a ${recipe.name}. A tool to keep.`
        : `You make a ${recipe.name}.`;

      return {
        ...state,
        inventory,
        craftedItems: [...state.craftedItems, item],
        spirits,
        messageLog: pushLog(state.messageLog, ...kuMsgs, line),
      };
    }

    case 'PLACE_ITEM': {
      const item = state.craftedItems.find((c) => c.id === action.craftedItemId);
      if (!item || item.placed) return state;

      const slot = getSlot(action.slotId);
      if (!slot) return state; // unknown slot
      if (state.placedItems.some((p) => p.slotId === slot.id)) return state; // slot taken
      if (!allowsSlotType(item.recipeId, slot.type)) return state; // wrong kind of spot

      return {
        ...state,
        craftedItems: state.craftedItems.map((c) =>
          c.id === item.id ? { ...c, placed: true } : c,
        ),
        placedItems: [...state.placedItems, { craftedItemId: item.id, slotId: slot.id }],
        messageLog: pushLog(state.messageLog, `You set the ${item.name} in the hale.`),
      };
    }

    case 'END_DAY': {
      const day = state.day + 1;
      const season = seasonForDay(day);
      const seasonTurned = season !== state.season;

      const dawn = dawnMessages(day, state);
      const lines = [...dawn];
      if (seasonTurned) lines.push(`The season turns toward ${season}.`);

      // Who is near today, if the player has come to know them.
      const nearId = nearSpiritFor(guidanceForDay(day).id);
      if (nearId && state.spirits[nearId].discovered) {
        lines.push(`${SPIRITS[nearId].name} is near.`);
      }
      // Pueo, once Trusted, shows tomorrow's sign.
      if (pueoRevealsNextSign(state.spirits)) {
        lines.push(`The owl shows the way — tomorrow, ${guidanceForDay(day + 1).name.toLowerCase()}.`);
      }

      return {
        ...state,
        day,
        season,
        tide: tideForDay(day),
        guidanceId: guidanceForDay(day).id,
        actionsUsedToday: [],
        messageLog: pushLog(state.messageLog, `— Day ${day} —`, ...lines),
      };
    }

    default:
      return state;
  }
}
