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
 *
 * Les 6 teintes vivent en TOKENS `--ed-<teinte>` (base -400, cf. globals.css) ;
 * le halo des puces (`dot`) référence `--ed-<teinte>-glow` (rgba V2) en var brute
 * dans le `shadow-[…]`. L'opacité des fonds/bords reste ici, côté classe.
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
    text: 'text-ed-sky',
    stripe: 'bg-ed-sky',
    chipBg: 'bg-ed-sky/10',
    chipBorder: 'border-ed-sky/30',
    calloutBg: 'bg-ed-sky/5',
    calloutBorder: 'border-ed-sky/20',
    borderL: 'border-l-ed-sky',
    borderT: 'border-t-ed-sky',
    dot: 'bg-ed-sky shadow-[0_0_8px_var(--ed-sky-glow)]',
    from: 'from-ed-sky/10',
  },
  violet: {
    text: 'text-ed-violet',
    stripe: 'bg-ed-violet',
    chipBg: 'bg-ed-violet/10',
    chipBorder: 'border-ed-violet/30',
    calloutBg: 'bg-ed-violet/5',
    calloutBorder: 'border-ed-violet/20',
    borderL: 'border-l-ed-violet',
    borderT: 'border-t-ed-violet',
    dot: 'bg-ed-violet shadow-[0_0_8px_var(--ed-violet-glow)]',
    from: 'from-ed-violet/10',
  },
  emerald: {
    text: 'text-ed-emerald',
    stripe: 'bg-ed-emerald',
    chipBg: 'bg-ed-emerald/10',
    chipBorder: 'border-ed-emerald/30',
    calloutBg: 'bg-ed-emerald/5',
    calloutBorder: 'border-ed-emerald/20',
    borderL: 'border-l-ed-emerald',
    borderT: 'border-t-ed-emerald',
    dot: 'bg-ed-emerald shadow-[0_0_8px_var(--ed-emerald-glow)]',
    from: 'from-ed-emerald/10',
  },
  amber: {
    text: 'text-ed-amber',
    stripe: 'bg-ed-amber',
    chipBg: 'bg-ed-amber/10',
    chipBorder: 'border-ed-amber/30',
    calloutBg: 'bg-ed-amber/5',
    calloutBorder: 'border-ed-amber/20',
    borderL: 'border-l-ed-amber',
    borderT: 'border-t-ed-amber',
    dot: 'bg-ed-amber shadow-[0_0_8px_var(--ed-amber-glow)]',
    from: 'from-ed-amber/10',
  },
  rose: {
    text: 'text-ed-rose',
    stripe: 'bg-ed-rose',
    chipBg: 'bg-ed-rose/10',
    chipBorder: 'border-ed-rose/30',
    calloutBg: 'bg-ed-rose/5',
    calloutBorder: 'border-ed-rose/20',
    borderL: 'border-l-ed-rose',
    borderT: 'border-t-ed-rose',
    dot: 'bg-ed-rose shadow-[0_0_8px_var(--ed-rose-glow)]',
    from: 'from-ed-rose/10',
  },
  cyan: {
    text: 'text-ed-cyan',
    stripe: 'bg-ed-cyan',
    chipBg: 'bg-ed-cyan/10',
    chipBorder: 'border-ed-cyan/30',
    calloutBg: 'bg-ed-cyan/5',
    calloutBorder: 'border-ed-cyan/20',
    borderL: 'border-l-ed-cyan',
    borderT: 'border-t-ed-cyan',
    dot: 'bg-ed-cyan shadow-[0_0_8px_var(--ed-cyan-glow)]',
    from: 'from-ed-cyan/10',
  },
};
