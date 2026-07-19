/**
 * Registre des OUTILS PUBLICS DE CONTRIBUTION (hub `/contribute`).
 *
 * Chaque outil est une page publique (prod, sans login, sans écriture serveur)
 * où un contributeur édite du contenu et EXPORTE un JSON ; Sevih l'importe et le
 * relit côté admin. Ajouter un outil ici le fait apparaître sur le hub tout
 * seul — pas de liste à maintenir ailleurs.
 */
export interface ContributeTool {
  /** Segment d'URL sous `/contribute`. */
  slug: string;
  title: string;
  description: string;
}

export const CONTRIBUTE_TOOLS: ContributeTool[] = [
  {
    slug: 'premium-reviews',
    title: 'Premium & Limited — Reviews',
    description:
      'Write or adjust per-hero reviews (impact ratings, recommended transcendence targets) for the Premium & Limited guide, then export a hero to send back.',
  },
];
