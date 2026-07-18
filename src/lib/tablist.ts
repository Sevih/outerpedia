import type { KeyboardEvent } from 'react';

/**
 * Navigation clavier WAI-ARIA d'une barre d'onglets (motif « roving tabindex »),
 * mutualisée par toutes les implémentations `role="tablist"` du site.
 *
 * À poser sur le `onKeyDown` du conteneur `role="tablist"` : →/↓ avance, ←/↑
 * recule (cyclique), Home/End vont aux extrémités. Sélectionne l'onglet cible ET
 * y déplace le focus — condition du roving tabindex, où seul l'onglet actif est
 * dans l'ordre de tabulation (`tabIndex=0`) et les autres en sont sortis
 * (`tabIndex=-1`), de sorte que Tab entre/sort de la barre et les flèches
 * naviguent DEDANS (comportement attendu par les lecteurs d'écran).
 *
 * Le focus vise les `[role="tab"]` du conteneur de l'évènement — pas de refs à
 * câbler côté appelant.
 */
export function onTabListKeyDown(
  e: KeyboardEvent<HTMLElement>,
  count: number,
  selected: number,
  select: (index: number) => void,
): void {
  let next: number;
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      next = (selected + 1) % count;
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      next = (selected - 1 + count) % count;
      break;
    case 'Home':
      next = 0;
      break;
    case 'End':
      next = count - 1;
      break;
    default:
      return;
  }
  e.preventDefault();
  select(next);
  const tabs = e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]');
  tabs[next]?.focus();
}
