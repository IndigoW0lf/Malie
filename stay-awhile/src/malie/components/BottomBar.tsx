/**
 * Mālie — the compact bottom bar. Small text buttons; Gather, Tend, and Craft
 * toggle their expanding trays, Rest closes the day. No oversized icons.
 */
type Sheet = 'gather' | 'craft' | 'tend' | null;

interface Props {
  isHale: boolean;
  /** Whether this scene has anything to plant / set (shows the Tend button). */
  showTend: boolean;
  openSheet: Sheet;
  onToggleGather: () => void;
  onToggleTend: () => void;
  onToggleCraft: () => void;
  onRest: () => void;
}

export function BottomBar({
  isHale,
  showTend,
  openSheet,
  onToggleGather,
  onToggleTend,
  onToggleCraft,
  onRest,
}: Props) {
  return (
    <nav className="m-bottombar" aria-label="Actions">
      {!isHale && (
        <button
          className={`m-bb-btn${openSheet === 'gather' ? ' m-bb-active' : ''}`}
          onClick={onToggleGather}
        >
          Gather <span className="m-bb-caret">{openSheet === 'gather' ? '▾' : '▴'}</span>
        </button>
      )}
      {!isHale && showTend && (
        <button
          className={`m-bb-btn${openSheet === 'tend' ? ' m-bb-active' : ''}`}
          onClick={onToggleTend}
        >
          Tend <span className="m-bb-caret">{openSheet === 'tend' ? '▾' : '▴'}</span>
        </button>
      )}
      <button
        className={`m-bb-btn${openSheet === 'craft' ? ' m-bb-active' : ''}`}
        onClick={onToggleCraft}
      >
        Craft <span className="m-bb-caret">{openSheet === 'craft' ? '▾' : '▴'}</span>
      </button>
      <button className="m-bb-btn m-bb-rest" onClick={onRest}>
        Rest · End Day
      </button>
    </nav>
  );
}
