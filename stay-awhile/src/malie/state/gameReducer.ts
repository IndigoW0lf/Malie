/**
 * Mālie — the reducer. The single place game state changes, and it changes
 * purely: every branch returns a new GameState, never mutating the old one.
 */
import type { CraftedItem, GameAction, GameState, Inventory, ResourceId } from '../types/game';
import { findAction } from '../data/panels';
import { findRecipe, isToolRecipe } from '../data/recipes';
import { getSlot } from '../data/haleSlots';
import { allowsSlotType } from '../data/craftables';
import { guidanceForDay } from '../data/guidance';
import { resourceName } from '../data/resources';
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

      // Base rewards plus any that the day's sign or tide unlocks.
      let gained: Inventory = { ...(def.rewards ?? {}) };
      for (const cond of def.conditionalRewards ?? []) {
        const signMatches = cond.guidanceId == null || cond.guidanceId === state.guidanceId;
        const tideMatches = cond.tide == null || cond.tide === state.tide;
        if (signMatches && tideMatches) {
          gained = addRewards(gained, cond.rewards);
        }
      }

      const gainedText = describeRewards(gained);
      const line = gainedText
        ? `${def.label}. You gather ${gainedText}.`
        : `${def.label}.`;

      return {
        ...state,
        inventory: addRewards(state.inventory, gained),
        actionsUsedToday: [...state.actionsUsedToday, def.id],
        messageLog: pushLog(state.messageLog, line),
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

      // Material craft: yields resources into the bag, makes no kept item.
      if (recipe.yields) {
        return {
          ...state,
          inventory: addRewards(inventory, recipe.yields),
          messageLog: pushLog(state.messageLog, `You prepare ${describeRewards(recipe.yields)}.`),
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
        messageLog: pushLog(state.messageLog, line),
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
