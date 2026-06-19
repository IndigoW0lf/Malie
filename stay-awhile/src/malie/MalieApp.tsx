/**
 * Mālie — the root. Owns the game state and UI-local state (bag drawer, which
 * bottom tray is open, placement, dev calibration), and lays out the interface:
 *
 *   ┌ status bar ───────────────────────────┐
 *   │ ‹  scene (full-bleed art / hale)    › │  ← arrows move between places
 *   │    message log                        │
 *   │ ┌ Gather / Craft tray (when open) ──┐ │
 *   └ [ Gather ] [ Craft ] [ Rest·End Day ] ┘
 */
import { useState } from 'react';
import './malie.css';
import { useGame } from './state/useGame';
import { TopStatusBar } from './components/TopStatusBar';
import { ScenePanel } from './components/ScenePanel';
import { MessageLog } from './components/MessageLog';
import { SceneNav } from './components/SceneNav';
import { BottomBar } from './components/BottomBar';
import { GatherSheet } from './components/GatherSheet';
import { ActionsSheet } from './components/ActionsSheet';
import { InventoryDrawer } from './components/InventoryDrawer';
import { CraftingPanel } from './components/CraftingPanel';
import { plantablesForPanel } from './data/stations';
import { PlacedItemLayer } from './components/PlacedItemLayer';
import { PlacementOverlay } from './components/PlacementOverlay';
import { HaleCalibrator } from './components/HaleCalibrator';
import { PilinaMap } from './components/PilinaMap';
import { SkyJournal } from './components/SkyJournal';
import { SkyObserve } from './components/SkyObserve';
import {
  sceneVariantForState,
  sceneBackground,
  constellationImage,
  showsConstellations,
} from './data/scenes';
import { SKY_PATTERNS } from './data/sky';
import type { SkyPatternId } from './data/sky';

export default function MalieApp() {
  const { state, dispatch, ready } = useGame();
  const [bagOpen, setBagOpen] = useState(false);
  /** Which bottom tray is open (Gather, Tend, or Craft), or none. */
  const [openSheet, setOpenSheet] = useState<'gather' | 'craft' | 'tend' | null>(null);
  /** Crafted item currently being placed (click-item → click-slot), or null. */
  const [placingId, setPlacingId] = useState<string | null>(null);
  /** DEV-only hale slot calibration overlay. */
  const [calOpen, setCalOpen] = useState(false);
  /** Pilina relationship map overlay. */
  const [pilinaOpen, setPilinaOpen] = useState(false);
  /** Sky journal (Ka Lani) overlay. */
  const [skyOpen, setSkyOpen] = useState(false);
  /** The Observe-Stars interaction, when open. */
  const [observing, setObserving] = useState(false);

  const inventoryCount = Object.values(state.inventory).reduce((n, c) => n + (c ?? 0), 0);

  const variant = sceneVariantForState(state);
  const sceneBg = sceneBackground(state.activePanel, variant);
  const showStars = showsConstellations(state.activePanel, variant);

  const isHale = state.activePanel === 'hale';
  const placingItem =
    placingId != null ? state.craftedItems.find((c) => c.id === placingId && !c.placed) ?? null : null;

  /** Switch place; close any open trays/placement so nothing lingers. */
  const goPanel = (panelId: typeof state.activePanel) => {
    setPlacingId(null);
    setOpenSheet(null);
    dispatch({ type: 'SET_PANEL', panelId });
  };

  const toggleSheet = (sheet: 'gather' | 'craft' | 'tend') =>
    setOpenSheet((cur) => (cur === sheet ? null : sheet));

  const hasTend = !isHale && plantablesForPanel(state.activePanel).length > 0;

  if (!ready) {
    return (
      <div className="m-loading">
        <p>Mālie</p>
        <span>opening the day…</span>
      </div>
    );
  }

  return (
    <div className="m-stage">
      {/* Ambient fill behind the stage on wide screens — the scene art, blurred
          and dimmed, so desktop margins feel intentional instead of empty. */}
      <div className="m-stage-amb" style={{ backgroundImage: sceneBg }} aria-hidden />

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

      {/* Placed items render on the hale background, between bg and the UI. */}
      {isHale && <PlacedItemLayer state={state} />}

      <TopStatusBar
        state={state}
        inventoryCount={inventoryCount}
        onToggleInventory={() => setBagOpen((v) => !v)}
        onOpenPilina={() => setPilinaOpen(true)}
        onOpenSky={() => setSkyOpen(true)}
      />

      <main className="m-main">
        <ScenePanel
          state={state}
          dispatch={dispatch}
          onBeginPlacement={setPlacingId}
          hideHaleChrome={calOpen}
        />
      </main>

      {/* Transient toast of what just happened — auto-fades, tap to dismiss. */}
      <MessageLog messages={state.messageLog} />

      {/* ‹ › arrows on the scene move between places (replaces the tab bar). */}
      {!calOpen && <SceneNav active={state.activePanel} onGo={goPanel} />}

      {/* Expanding trays sit above the bar; one open at a time. */}
      {openSheet === 'gather' && !isHale && (
        <GatherSheet
          state={state}
          dispatch={dispatch}
          onClose={() => setOpenSheet(null)}
          onObserveSky={() => {
            setOpenSheet(null);
            setObserving(true);
          }}
        />
      )}
      {openSheet === 'tend' && hasTend && (
        <ActionsSheet state={state} dispatch={dispatch} onClose={() => setOpenSheet(null)} />
      )}
      {openSheet === 'craft' && (
        <CraftingPanel open state={state} dispatch={dispatch} onClose={() => setOpenSheet(null)} />
      )}

      <BottomBar
        isHale={isHale}
        showTend={hasTend}
        openSheet={openSheet}
        onToggleGather={() => toggleSheet('gather')}
        onToggleTend={() => toggleSheet('tend')}
        onToggleCraft={() => toggleSheet('craft')}
        onRest={() => {
          setOpenSheet(null);
          dispatch({ type: 'END_DAY' });
        }}
      />

      <InventoryDrawer open={bagOpen} inventory={state.inventory} onClose={() => setBagOpen(false)} />

      {pilinaOpen && (
        <PilinaMap state={state} dispatch={dispatch} onClose={() => setPilinaOpen(false)} />
      )}

      {skyOpen && <SkyJournal state={state} onClose={() => setSkyOpen(false)} />}

      {observing && (
        <SkyObserve
          pattern={SKY_PATTERNS[state.skyPatternId as SkyPatternId]}
          onObserve={(traced) => {
            dispatch({ type: 'OBSERVE_SKY', traced });
            setObserving(false);
          }}
          onClose={() => setObserving(false)}
        />
      )}

      {/* Placement mode — only in the hale, only while an item is selected. */}
      {isHale && placingItem && (
        <PlacementOverlay
          item={placingItem}
          state={state}
          onPlace={(slotId) => {
            dispatch({ type: 'PLACE_ITEM', craftedItemId: placingItem.id, slotId });
            setPlacingId(null);
          }}
          onCancel={() => setPlacingId(null)}
        />
      )}

      {/* DEV-only: hale slot calibration. Stripped from production builds. */}
      {import.meta.env.DEV && isHale && (
        <button className="m-cal-toggle" onClick={() => setCalOpen((v) => !v)}>
          {calOpen ? 'close calibrate' : '⚙ calibrate'}
        </button>
      )}
      {import.meta.env.DEV && isHale && calOpen && (
        <HaleCalibrator onClose={() => setCalOpen(false)} />
      )}
      </div>
    </div>
  );
}
