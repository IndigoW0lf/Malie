/**
 * Mālie — the compact bottom bar. Small text buttons; Gather and Craft toggle
 * their expanding trays, Rest closes the day. No oversized icons.
 */
type Sheet = 'gather' | 'craft' | null;

interface Props {
  isHale: boolean;
  openSheet: Sheet;
  onToggleGather: () => void;
  onToggleCraft: () => void;
  onRest: () => void;
}

export function BottomBar({ isHale, openSheet, onToggleGather, onToggleCraft, onRest }: Props) {
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
