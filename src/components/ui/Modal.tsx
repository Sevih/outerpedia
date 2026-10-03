'use client';

import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { useDialogFocus } from '@/hooks/useDialogFocus';

/**
 * LE VOILE D'UNE BOÎTE DE DIALOGUE — ce que les modales des outils
 * réécrivaient chacune : le voile plein écran, `role="dialog"` nommé et
 * `aria-modal`, le focus qui entre, boucle et revient (`useDialogFocus`),
 * Échap et le clic sur le voile qui ferment. Rendu sous condition par
 * l'appelant : montage = ouverture, démontage = fermeture.
 *
 * Le clic sur le voile reste un raccourci souris ; ce qui est posé dessus
 * arrête la propagation (le panneau de `Modal` le fait, le contenu d'une
 * `Lightbox` le fait lui-même).
 */
function Overlay({
  scrim,
  label,
  onClose,
  initialFocus,
  lockScroll = false,
  children,
}: {
  scrim: 'bg-scrim/60' | 'bg-scrim/95';
  label: string;
  onClose: () => void;
  initialFocus?: RefObject<HTMLElement | null>;
  lockScroll?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(ref, { initial: initialFocus });

  // `onClose` vit dans un ref, posé dans un effet (règle `react-hooks/refs`) :
  // passé en ligne, il changerait d'identité à chaque rendu et rebrancherait
  // l'écoute.
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  // Échap s'écoute sur `document`, pas sur la boîte (`onEscape` du hook) : un
  // clic sur une zone non focusable — l'image d'une lightbox — renvoie le
  // focus au `body`, et la touche n'y passerait plus. Une boîte ouverte
  // par-dessus qui a déjà pris la touche (`defaultPrevented`) la garde.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      e.preventDefault();
      close.current();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Verrou du scroll de fond tant que la boîte est ouverte.
  useEffect(() => {
    if (!lockScroll) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lockScroll]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className={`${scrim} fixed inset-0 z-100 flex items-center justify-center p-4`}
      onClick={onClose}
    >
      {children}
    </div>
  );
}

/**
 * Modale à panneau centré. Le panneau (fond, largeur, hauteur max, bordure)
 * appartient à l'appelant via `className` ; son bouton de fermeture aussi, qui
 * doit porter un nom (texte ou `aria-label`).
 */
export function Modal({
  label,
  onClose,
  className,
  initialFocus,
  children,
}: {
  /** Nom accessible de la boîte (son titre). */
  label: string;
  onClose: () => void;
  /** Classes du panneau. */
  className: string;
  /** Élément qui reçoit le focus à l'ouverture (défaut : le premier focusable). */
  initialFocus?: RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  return (
    <Overlay scrim="bg-scrim/60" label={label} onClose={onClose} initialFocus={initialFocus}>
      <div className={className} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </Overlay>
  );
}

/**
 * Lightbox plein écran : voile dense, scroll de fond verrouillé, croix nommée,
 * et — si l'appelant les demande — compteur et flèches. Les enfants (l'image,
 * une barre d'actions) se posent directement sur le voile et arrêtent
 * eux-mêmes la propagation du clic. La navigation CLAVIER (←/→) reste chez
 * l'appelant, qui tient l'index.
 */
export function Lightbox({
  label,
  onClose,
  labels,
  counter,
  onNavigate,
  children,
}: {
  /** Nom accessible de la boîte (l'image affichée). */
  label: string;
  onClose: () => void;
  /** Noms accessibles de la croix et des flèches. */
  labels: { close: string; previous: string; next: string };
  /** Position dans la série (« 3 / 12 »), en haut à gauche. */
  counter?: string;
  /** Les flèches n'apparaissent que si la navigation est fournie. */
  onNavigate?: (dir: 1 | -1) => void;
  children: ReactNode;
}) {
  return (
    <Overlay scrim="bg-scrim/95" label={label} onClose={onClose} lockScroll>
      <button
        type="button"
        onClick={onClose}
        aria-label={labels.close}
        className="text-content/70 hover:text-content absolute top-4 right-4 z-10 p-2 transition-colors"
      >
        <CloseGlyph className="size-8" />
      </button>
      {counter && (
        <div className="text-content/70 absolute top-4 left-4 z-10 text-sm">{counter}</div>
      )}

      {onNavigate && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(-1);
            }}
            aria-label={labels.previous}
            className="text-content/50 hover:text-content absolute top-1/2 left-4 z-10 -translate-y-1/2 p-2 transition-colors"
          >
            <ChevronGlyph className="size-10 rotate-180" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(1);
            }}
            aria-label={labels.next}
            className="text-content/50 hover:text-content absolute top-1/2 right-4 z-10 -translate-y-1/2 p-2 transition-colors"
          >
            <ChevronGlyph className="size-10" />
          </button>
        </>
      )}

      {children}
    </Overlay>
  );
}

/* --- Glyphes ---------------------------------------------------------------- */

function CloseGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function ChevronGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}
