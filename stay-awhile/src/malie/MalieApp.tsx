/**
 * Mālie — the root. Owns the game state and the two bits of UI-local state
 * (the bag drawer and the crafting modal), and lays out the cozy interface:
 *
 *   ┌ status bar ───────────────────────────┐
 *   │ scene (active place / hale)            │
 *   │ message log                            │
 *   ├ panel tabs ───────────────────────────┤
 *   └ action row ───────────────────────────┘
 */
import { useState } from 'react';
import './malie.css';
import { useGame } from './state/useGame';
import { TopStatusBar } from './components/TopStatusBar';
import { ScenePanel } from './components/ScenePanel';
import { MessageLog } from './components/MessageLog';
import { PanelTabs } from './components/PanelTabs';
import { ActionRow } from './components/ActionRow';
import { InventoryDrawer } from './components/InventoryDrawer';
import { CraftingPanel } from './components/CraftingPanel';
import {
  sceneVariantForState,
  sceneBackground,
  constellationImage,
  showsConstellations,
} from './data/scenes';

export default function MalieApp() {
  const { state, dispatch, ready } = useGame();
  const [bagOpen, setBagOpen] = useState(false);
  const [craftOpen, setCraftOpen] = useState(false);

  const inventoryCount = Object.values(state.inventory).reduce((n, c) => n + (c ?? 0), 0);

  const variant = sceneVariantForState(state);
  const sceneBg = sceneBackground(state.activePanel, variant);
  const showStars = showsConstellations(state.activePanel, variant);

  if (!ready) {
    return (
      <div className="m-loading">
        <p>Mālie</p>
        <span>opening the day…</span>
      </div>
    );
  }

  return (
    <div className="m-root">
      {/* Full-bleed per-scene background. Variant (time-of-day / weather) is
          chosen from the day's sign; art cascades variant → default → gradient.
          See src/malie/data/scenes.ts. */}
      <div className="m-bg" style={{ backgroundImage: sceneBg }} aria-hidden />

      {/* Constellation overlay — only on the sky/forest scene's dark variants.
          Transparent (shows nothing) until public/scenes/lewa_wao/stars/<season>.png exists. */}
      {showStars && (
        <div
          className="m-bg-stars"
          style={{ backgroundImage: `url('${constellationImage(state.season)}')` }}
          aria-hidden
        />
      )}

      <TopStatusBar
        state={state}
        inventoryCount={inventoryCount}
        onToggleInventory={() => setBagOpen((v) => !v)}
      />

      <main className="m-main">
        <ScenePanel state={state} dispatch={dispatch} />
        <MessageLog messages={state.messageLog} />
      </main>

      <PanelTabs active={state.activePanel} onSelect={(id) => dispatch({ type: 'SET_PANEL', panelId: id })} />

      <ActionRow state={state} dispatch={dispatch} onOpenCrafting={() => setCraftOpen(true)} />

      <InventoryDrawer open={bagOpen} inventory={state.inventory} onClose={() => setBagOpen(false)} />
      <CraftingPanel open={craftOpen} state={state} dispatch={dispatch} onClose={() => setCraftOpen(false)} />
    </div>
  );
}
