/**
 * Accents des PRIMITIVES ÉDITORIALES (QACard, Callout, TocBar…) — la palette à
 * 6 teintes du redesign FAQ de la V2, exprimée en utilitaires Tailwind.
 *
 * Distincte de `guide-accents.ts` (UNE couleur par CATÉGORIE, pour les listes
 * et cartes de guides) : ici l'accent est un choix ÉDITORIAL local — chaque
 * section/encart d'un guide prend la teinte qui code son propos (sky = début,
 * amber = gear, rose = avancé…), plusieurs teintes cohabitent dans une page.
 *
 * Même contrainte que guide-accents : Tailwind v4 ne voit que les classes
 * écrites EN LITTÉRAL — jamais de concaténation.
 */

export type EditorialAccent = 'sky' | 'violet' | 'emerald' | 'amber' | 'rose' | 'cyan';

export interface EditorialAccentClasses {
  /** Texte à la couleur d'accent (libellés, numéros, liens). */
  text: string;
  /** Aplat plein (barre de section, liseré featured). */
  stripe: string;
  /** Fond doux des chips (pastille Q, numéros, pills du TOC). */
  chipBg: string;
  /** Bordure des chips / cartes featured. */
  chipBorder: string;
  /** Fond très doux des callouts. */
  calloutBg: string;
  /** Bordure discrète des callouts. */
  calloutBorder: string;
  /** Liseré gauche des callouts (`border-l-2` posé par le composant). */
  borderL: string;
  /** Liseré haut des mini-panels (`border-t-2` posé par le composant). */
  borderT: string;
  /** Puce lumineuse des listes à points. */
  dot: string;
  /** Départ du dégradé des cartes featured (avec `bg-gradient-to-b … to-transparent`). */
  from: string;
}

export const EDITORIAL_ACCENT: Record<EditorialAccent, EditorialAccentClasses> = {
  sky: {
    text: 'text-sky-400',
    stripe: 'bg-sky-400',
    chipBg: 'bg-sky-400/10',
    chipBorder: 'border-sky-400/30',
    calloutBg: 'bg-sky-400/5',
    calloutBorder: 'border-sky-400/20',
    borderL: 'border-l-sky-400',
    borderT: 'border-t-sky-400',
    dot: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]',
    from: 'from-sky-400/10',
  },
  violet: {
    text: 'text-violet-400',
    stripe: 'bg-violet-400',
    chipBg: 'bg-violet-400/10',
    chipBorder: 'border-violet-400/30',
    calloutBg: 'bg-violet-400/5',
    calloutBorder: 'border-violet-400/20',
    borderL: 'border-l-violet-400',
    borderT: 'border-t-violet-400',
    dot: 'bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.6)]',
    from: 'from-violet-400/10',
  },
  emerald: {
    text: 'text-emerald-400',
    stripe: 'bg-emerald-400',
    chipBg: 'bg-emerald-400/10',
    chipBorder: 'border-emerald-400/30',
    calloutBg: 'bg-emerald-400/5',
    calloutBorder: 'border-emerald-400/20',
    borderL: 'border-l-emerald-400',
    borderT: 'border-t-emerald-400',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
    from: 'from-emerald-400/10',
  },
  amber: {
    text: 'text-amber-400',
    stripe: 'bg-amber-400',
    chipBg: 'bg-amber-400/10',
    chipBorder: 'border-amber-400/30',
    calloutBg: 'bg-amber-400/5',
    calloutBorder: 'border-amber-400/20',
    borderL: 'border-l-amber-400',
    borderT: 'border-t-amber-400',
    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
    from: 'from-amber-400/10',
  },
  rose: {
    text: 'text-rose-400',
    stripe: 'bg-rose-400',
    chipBg: 'bg-rose-400/10',
    chipBorder: 'border-rose-400/30',
    calloutBg: 'bg-rose-400/5',
    calloutBorder: 'border-rose-400/20',
    borderL: 'border-l-rose-400',
    borderT: 'border-t-rose-400',
    dot: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]',
    from: 'from-rose-400/10',
  },
  cyan: {
    text: 'text-cyan-400',
    stripe: 'bg-cyan-400',
    chipBg: 'bg-cyan-400/10',
    chipBorder: 'border-cyan-400/30',
    calloutBg: 'bg-cyan-400/5',
    calloutBorder: 'border-cyan-400/20',
    borderL: 'border-l-cyan-400',
    borderT: 'border-t-cyan-400',
    dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]',
    from: 'from-cyan-400/10',
  },
};
