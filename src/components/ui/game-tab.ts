/**
 * Classes du bouton d'onglet « game » (glow façon UI Outerplane) — LE style
 * d'onglet du site. Le visuel actif vit dans `.tab-game-active` (globals.css),
 * teinte surchargée via la custom property `--tab-glow` (défaut ambre — la
 * fiche perso passe l'hex élémentaire). Partagé entre `guides/SegmentedTabs`
 * (variant game), `ui/Tabs` (variant game) et les onglets de builds de
 * `GearRecoSection` : un seul endroit pour la géométrie et l'état inactif.
 */
export function gameTabClass(active: boolean): string {
  return `rounded px-4 py-2 text-sm font-medium transition-all ${
    active
      ? 'tab-game-active'
      : 'border-line-subtle text-content-muted hover:text-content-strong hover:bg-surface-raised hover:border-line-strong cursor-pointer border'
  }`;
}

/** Barre d'onglets game : centrée, passe à la ligne. */
export const gameTabListClass = 'flex flex-wrap justify-center gap-2';
