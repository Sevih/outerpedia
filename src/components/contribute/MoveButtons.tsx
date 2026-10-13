'use client';

/**
 * Les deux flèches « monter / descendre » d'une ligne de liste éditable.
 *
 * DÉSACTIVÉES aux extrémités plutôt qu'inertes : un bouton qui ne fait rien
 * quand on clique dessus se lit comme une panne. La logique d'échange vit dans
 * `lib/admin/reorder` — ici il n'y a que deux boutons.
 */
import { btn } from './_ui';

export function MoveButtons({
  index,
  count,
  onMove,
  what = 'item',
}: {
  index: number;
  count: number;
  onMove: (dir: -1 | 1) => void;
  /** Ce qu'on déplace, pour les lecteurs d'écran (« Move hero up »). */
  what?: string;
}) {
  return (
    <>
      <button
        type="button"
        className={btn}
        onClick={() => onMove(-1)}
        disabled={index === 0}
        aria-label={`Move ${what} up`}
      >
        ↑
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => onMove(1)}
        disabled={index === count - 1}
        aria-label={`Move ${what} down`}
      >
        ↓
      </button>
    </>
  );
}
