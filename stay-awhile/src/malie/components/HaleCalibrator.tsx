/**
 * Mālie — hale slot calibration tool (DEV ONLY).
 *
 * Overlays every hale slot on the real hale background so you can drag each one
 * into place and tune its scale, then copy the updated coordinates straight back
 * into src/malie/data/haleSlots.ts (the RAW array).
 *
 * This is a build-time aid, not gameplay: it's only mounted under
 * import.meta.env.DEV, so it never ships in a production build.
 */
import { useRef, useState } from 'react';
import type { HaleSlot, SlotType } from '../types/game';
import { HALE_SLOTS, BASE_ITEM_WIDTH_PCT } from '../data/haleSlots';

/** A slot under edit — the persisted fields, without the derived zIndex. */
type EditSlot = Omit<HaleSlot, 'zIndex'>;

const round = (n: number, dp = 1) => Number(n.toFixed(dp));

/** Emit the RAW array source the user pastes back into haleSlots.ts. */
function toSource(slots: EditSlot[]): string {
  const line = (s: EditSlot) => {
    const rot = s.rotation ? `, rotation: ${s.rotation}` : '';
    return `  { id: '${s.id}', type: '${s.type}', x: ${round(s.x)}, y: ${round(s.y)}, scale: ${round(
      s.scale,
      2,
    )}${rot} },`;
  };
  return `const RAW: Omit<HaleSlot, 'zIndex'>[] = [\n${slots.map(line).join('\n')}\n];`;
}

interface Props {
  onClose: () => void;
}

export function HaleCalibrator({ onClose }: Props) {
  const [slots, setSlots] = useState<EditSlot[]>(() =>
    HALE_SLOTS.map(
      (s): EditSlot => ({
        id: s.id,
        type: s.type,
        x: s.x,
        y: s.y,
        scale: s.scale,
        ...(s.rotation !== undefined ? { rotation: s.rotation } : {}),
      }),
    ),
  );
  const [selectedId, setSelectedId] = useState<string | null>(slots[0]?.id ?? null);
  const [copied, setCopied] = useState(false);
  /** Panel position (px, stage-relative). null = use default CSS placement. */
  const [panelPos, setPanelPos] = useState<{ x: number; y: number } | null>(null);
  const dragId = useRef<string | null>(null);
  /** Pointer→panel offset while dragging the control panel. */
  const panelDrag = useRef<{ dx: number; dy: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const selected = slots.find((s) => s.id === selectedId) ?? null;

  const update = (id: string, patch: Partial<EditSlot>) =>
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  /** Convert a pointer position to %-of-stage coordinates. */
  const pointToPct = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    // Dragging the control panel takes priority over dragging a slot.
    if (panelDrag.current) {
      const stage = stageRef.current?.getBoundingClientRect();
      if (stage) {
        setPanelPos({
          x: e.clientX - stage.left - panelDrag.current.dx,
          y: e.clientY - stage.top - panelDrag.current.dy,
        });
      }
      return;
    }
    if (!dragId.current) return;
    const p = pointToPct(e.clientX, e.clientY);
    if (p) update(dragId.current, { x: round(p.x), y: round(p.y) });
  };

  const endDrag = () => {
    dragId.current = null;
    panelDrag.current = null;
  };

  /** Begin dragging the control panel by its header. */
  const startPanelDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
    const panel = (e.currentTarget as HTMLElement).closest('.m-cal-panel');
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    panelDrag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
  };

  const copySource = () => {
    const src = toSource(slots);
    void navigator.clipboard?.writeText(src).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const nudgeScale = (delta: number) => {
    if (!selected) return;
    update(selected.id, { scale: Math.max(0.1, round(selected.scale + delta, 2)) });
  };

  const nudgeRotation = (delta: number) => {
    if (!selected) return;
    const next = Math.max(-45, Math.min(45, Math.round((selected.rotation ?? 0) + delta)));
    update(selected.id, { rotation: next });
  };

  return (
    <div
      className="m-cal"
      ref={stageRef}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      {slots.map((s) => {
        const isSel = s.id === selectedId;
        const width = `${s.scale * BASE_ITEM_WIDTH_PCT}%`;
        return (
          <div
            key={s.id}
            className={`m-cal-slot m-cal-${s.type}${isSel ? ' m-cal-sel' : ''}`}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width,
              transform: `translate(-50%, -50%) rotate(${s.rotation ?? 0}deg)`,
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              setSelectedId(s.id);
              dragId.current = s.id;
            }}
          >
            <span className="m-cal-label">{s.id}</span>
          </div>
        );
      })}

      <div
        className="m-cal-panel"
        onPointerDown={(e) => e.stopPropagation()}
        style={panelPos ? { left: panelPos.x, top: panelPos.y, right: 'auto' } : undefined}
      >
        <div className="m-cal-head m-cal-drag" onPointerDown={startPanelDrag}>
          <strong>⠿ Hale calibration</strong>
          <button className="m-cal-x" onPointerDown={(e) => e.stopPropagation()} onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="m-cal-hint">Drag a slot onto the art. Selected:</p>

        {selected ? (
          <div className="m-cal-edit">
            <div className="m-cal-row">
              <span className="m-cal-id">{selected.id}</span>
              <select
                aria-label="Slot type"
                title="Slot type"
                value={selected.type}
                onChange={(e) => update(selected.id, { type: e.target.value as SlotType })}
              >
                {(['shelf', 'cubby', 'floor', 'wall', 'hanging'] as SlotType[]).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="m-cal-row">
              <span>
                x {round(selected.x)} · y {round(selected.y)}
              </span>
            </div>
            <div className="m-cal-row">
              <span>scale {round(selected.scale, 2)}</span>
              <button onClick={() => nudgeScale(-0.05)}>−</button>
              <button onClick={() => nudgeScale(0.05)}>＋</button>
            </div>
            <div className="m-cal-row">
              <span>angle {Math.round(selected.rotation ?? 0)}°</span>
              <button onClick={() => nudgeRotation(-1)}>−</button>
              <button onClick={() => nudgeRotation(1)}>＋</button>
              <button onClick={() => update(selected.id, { rotation: 0 })}>0</button>
            </div>
            <input
              className="m-cal-range"
              type="range"
              min={-20}
              max={20}
              step={1}
              aria-label="Slot angle in degrees"
              value={selected.rotation ?? 0}
              onChange={(e) => update(selected.id, { rotation: Number(e.target.value) })}
            />
          </div>
        ) : (
          <p className="m-cal-hint">none</p>
        )}

        <button className="m-cal-copy" onClick={copySource}>
          {copied ? 'Copied ✓' : 'Copy haleSlots source'}
        </button>
        <p className="m-cal-note">Paste over the RAW array in data/haleSlots.ts</p>
      </div>
    </div>
  );
}
