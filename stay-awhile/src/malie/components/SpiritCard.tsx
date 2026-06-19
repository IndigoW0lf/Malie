/**
 * Mālie — a presence's card. Opened from the Pilina Map. Shows the relationship,
 * what it feels like at this level, the signs and ways it deepens, a short
 * sourced learning note, and a way to offer something you've made.
 */
import type { GameAction, GameState, SpiritId } from '../types/game';
import { SPIRITS, LEVEL_NAMES, levelForPoints, pointsToNext, OFFERING_AFFINITY } from '../data/spirits';
import { findRecipe, recipeGlyph } from '../data/recipes';

interface Props {
  spiritId: SpiritId;
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onBack: () => void;
}

export function SpiritCard({ spiritId, state, dispatch, onBack }: Props) {
  const def = SPIRITS[spiritId];
  const rel = state.spirits[spiritId];
  const lvl = levelForPoints(rel.points);
  const toNext = pointsToNext(rel.points);

  // Unplaced crafted items that are offerings.
  const offerables = state.craftedItems.filter(
    (c) => !c.placed && findRecipe(c.recipeId)?.result.offering,
  );

  return (
    <div className="m-card-scrim" onClick={onBack}>
      <div className="m-card" onClick={(e) => e.stopPropagation()}>
        <div className="m-card-head">
          <span className="m-card-glyph">{def.glyph}</span>
          <div className="m-card-title">
            <p className="m-card-name">{def.name}</p>
            <p className="m-card-kind">
              {def.kind === 'akua' ? 'akua' : 'ʻaumakua'} · {def.title}
            </p>
          </div>
          <button className="m-icon-btn" onClick={onBack} aria-label="Back to map">
            ✕
          </button>
        </div>

        <div className="m-card-level">
          <strong>{LEVEL_NAMES[lvl]}</strong>
          {toNext != null && <span className="m-card-next"> · {toNext} more to deepen</span>}
        </div>
        {lvl > 0 && <p className="m-card-effect">{def.effectByLevel[lvl]}</p>}

        <dl className="m-card-facts">
          <dt>Place</dt>
          <dd>{def.place}</dd>
          <dt>Signs</dt>
          <dd>{def.signs.join(' · ')}</dd>
          <dt>Deepens through</dt>
          <dd>{def.deepensThrough.join(' · ')}</dd>
        </dl>

        <p className="m-card-note">{def.learningNote}</p>
        <p className="m-card-source">— {def.source}</p>

        <div className="m-card-offer">
          <h4>Offer</h4>
          {offerables.length === 0 ? (
            <p className="m-empty">Make an offering — a bowl, a bundle — to give it here.</p>
          ) : (
            <ul className="m-offer-list">
              {offerables.map((c) => {
                const aligned = (OFFERING_AFFINITY[c.recipeId] ?? []).includes(spiritId);
                return (
                  <li key={c.id} className="m-offer-row">
                    <span className="m-offer-name">
                      {recipeGlyph(c.recipeId)} {c.name}
                      {aligned && <em className="m-offer-aligned"> · welcomed</em>}
                    </span>
                    <button
                      className="m-offer-btn"
                      onClick={() =>
                        dispatch({ type: 'OFFER_TO_SPIRIT', spiritId, craftedItemId: c.id })
                      }
                    >
                      Offer
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
