/**
 * Accents par catégorie de guides (portage V2 : `guidesTheme.ts`).
 *
 * Chaque catégorie a une couleur thématique (émeraude pour les fondamentaux,
 * ambre pour le contenu de boss, rose pour l'endgame…) déclinée en utilitaires
 * Tailwind. Tailwind v4 ne voit que les classes ÉCRITES EN LITTÉRAL — jamais de
 * concaténation : chaque déclinaison est une chaîne complète.
 *
 * Les teintes vivent en TOKENS (`--cat-<teinte>-fg/-bd/-glow`, cf. globals.css) :
 * -fg = texte, -bd = bords/fonds (l'opacité reste ici, côté classe), -glow =
 * ombre colorée au survol (référencée en `var()` brute dans le `shadow-[…]`).
 *
 * Typé sur `GuideCategorySlug` (Record exhaustif) : ajouter une catégorie sans
 * son accent casse la compilation — pas de repli « other » silencieux comme en V2.
 */
import type { GuideCategorySlug } from '@/lib/data/guide-categories';

export type GuideAccent = {
  text: string;
  hoverBorder: string;
  iconBorder: string;
  iconFrom: string;
  pillBg: string;
  pillBorder: string;
  glow: string;
};

export const GUIDE_ACCENT: Record<GuideCategorySlug, GuideAccent> = {
  'general-guides': {
    text: 'text-cat-emerald-fg',
    hoverBorder: 'hover:border-cat-emerald-bd/50',
    iconBorder: 'border-cat-emerald-bd/30',
    iconFrom: 'from-cat-emerald-bd/15',
    pillBg: 'bg-cat-emerald-bd/10',
    pillBorder: 'border-cat-emerald-bd/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_var(--cat-emerald-glow)]',
  },
  adventure: {
    text: 'text-cat-sky-fg',
    hoverBorder: 'hover:border-cat-sky-bd/50',
    iconBorder: 'border-cat-sky-bd/30',
    iconFrom: 'from-cat-sky-bd/15',
    pillBg: 'bg-cat-sky-bd/10',
    pillBorder: 'border-cat-sky-bd/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_var(--cat-sky-glow)]',
  },
  'adventure-license': {
    text: 'text-cat-indigo-fg',
    hoverBorder: 'hover:border-cat-indigo-bd/50',
    iconBorder: 'border-cat-indigo-bd/30',
    iconFrom: 'from-cat-indigo-bd/15',
    pillBg: 'bg-cat-indigo-bd/10',
    pillBorder: 'border-cat-indigo-bd/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_var(--cat-indigo-glow)]',
  },
  'guild-raid': {
    text: 'text-cat-amber-fg',
    hoverBorder: 'hover:border-cat-amber-bd/50',
    iconBorder: 'border-cat-amber-bd/30',
    iconFrom: 'from-cat-amber-bd/15',
    pillBg: 'bg-cat-amber-bd/10',
    pillBorder: 'border-cat-amber-bd/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_var(--cat-amber-glow)]',
  },
  'world-boss': {
    text: 'text-cat-orange-fg',
    hoverBorder: 'hover:border-cat-orange-bd/50',
    iconBorder: 'border-cat-orange-bd/30',
    iconFrom: 'from-cat-orange-bd/15',
    pillBg: 'bg-cat-orange-bd/10',
    pillBorder: 'border-cat-orange-bd/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_var(--cat-orange-glow)]',
  },
  'dimensional-singularity': {
    text: 'text-cat-violet-fg',
    hoverBorder: 'hover:border-cat-violet-bd/50',
    iconBorder: 'border-cat-violet-bd/30',
    iconFrom: 'from-cat-violet-bd/15',
    pillBg: 'bg-cat-violet-bd/10',
    pillBorder: 'border-cat-violet-bd/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_var(--cat-violet-glow)]',
  },
  'joint-challenge': {
    text: 'text-cat-teal-fg',
    hoverBorder: 'hover:border-cat-teal-bd/50',
    iconBorder: 'border-cat-teal-bd/30',
    iconFrom: 'from-cat-teal-bd/15',
    pillBg: 'bg-cat-teal-bd/10',
    pillBorder: 'border-cat-teal-bd/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_var(--cat-teal-glow)]',
  },
  'special-request': {
    text: 'text-cat-rose-fg',
    hoverBorder: 'hover:border-cat-rose-bd/50',
    iconBorder: 'border-cat-rose-bd/30',
    iconFrom: 'from-cat-rose-bd/15',
    pillBg: 'bg-cat-rose-bd/10',
    pillBorder: 'border-cat-rose-bd/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_var(--cat-rose-glow)]',
  },
  'irregular-extermination': {
    text: 'text-cat-red-fg',
    hoverBorder: 'hover:border-cat-red-bd/50',
    iconBorder: 'border-cat-red-bd/30',
    iconFrom: 'from-cat-red-bd/15',
    pillBg: 'bg-cat-red-bd/10',
    pillBorder: 'border-cat-red-bd/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_var(--cat-red-glow)]',
  },
  'monad-gate': {
    text: 'text-cat-fuchsia-fg',
    hoverBorder: 'hover:border-cat-fuchsia-bd/50',
    iconBorder: 'border-cat-fuchsia-bd/30',
    iconFrom: 'from-cat-fuchsia-bd/15',
    pillBg: 'bg-cat-fuchsia-bd/10',
    pillBorder: 'border-cat-fuchsia-bd/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_var(--cat-fuchsia-glow)]',
  },
  'skyward-tower': {
    text: 'text-cat-cyan-fg',
    hoverBorder: 'hover:border-cat-cyan-bd/50',
    iconBorder: 'border-cat-cyan-bd/30',
    iconFrom: 'from-cat-cyan-bd/15',
    pillBg: 'bg-cat-cyan-bd/10',
    pillBorder: 'border-cat-cyan-bd/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_var(--cat-cyan-glow)]',
  },
  /* Catégorie « fourre-tout » : gris neutres — via les tokens, pas des zinc en dur. */
  other: {
    text: 'text-content',
    hoverBorder: 'hover:border-line-strong',
    iconBorder: 'border-line',
    iconFrom: 'from-content-subtle/10',
    pillBg: 'bg-content-subtle/10',
    pillBorder: 'border-line-strong',
    glow: 'hover:shadow-[0_8px_28px_-12px_#a1a1aa]',
  },
} as const;
