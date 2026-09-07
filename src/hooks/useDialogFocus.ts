'use client';

import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * FOCUS D'UNE BOÎTE DE DIALOGUE — les trois gestes que `role="dialog"` promet
 * et qu'aucune modale du site ne faisait (audit 07/09, G22) :
 *   1. à l'ouverture, le focus ENTRE (sur `initial`, sinon le premier
 *      focusable, sinon le conteneur) ;
 *   2. Tab et Shift+Tab BOUCLENT dans la boîte (piège) ;
 *   3. à la fermeture, le focus REVIENT à l'élément qui l'avait ouverte.
 * Échap est optionnel (`onEscape`) : certaines modales l'écoutent déjà au
 * niveau `window`.
 *
 * Montage = ouverture, démontage = fermeture ; une modale rendue sous
 * condition DANS un composant toujours monté passe `active` (ImageLightbox).
 */
export function useDialogFocus(
  ref: RefObject<HTMLElement | null>,
  options: {
    initial?: RefObject<HTMLElement | null>;
    onEscape?: () => void;
    active?: boolean;
  } = {},
): void {
  // Les options vivent dans un ref, posé DANS un effet (pas pendant le rendu,
  // règle `react-hooks/refs`) : l'effet principal ne se rejoue pas à chaque
  // rendu (un `onEscape` inline changerait d'identité à chaque fois).
  const opts = useRef(options);
  useEffect(() => {
    opts.current = options;
  });

  const active = options.active ?? true;
  useEffect(() => {
    const root = ref.current;
    if (!active || !root) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusables = () =>
      [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);

    const target = opts.current.initial?.current ?? focusables()[0] ?? root;
    if (target === root && !root.hasAttribute('tabindex')) root.tabIndex = -1;
    target.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && opts.current.onEscape) {
        e.preventDefault();
        opts.current.onEscape();
        return;
      }
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (!list.length) {
        e.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !root.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !root.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    root.addEventListener('keydown', onKey);
    return () => {
      root.removeEventListener('keydown', onKey);
      // `isConnected` : l'ouvreur a pu disparaître entre-temps (navigation).
      if (previous?.isConnected) previous.focus();
    };
  }, [ref, active]);
}
