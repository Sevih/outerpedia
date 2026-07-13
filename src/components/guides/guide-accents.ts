/**
 * Accents par catégorie de guides (portage V2 : `guidesTheme.ts`).
 *
 * Chaque catégorie a une couleur thématique (émeraude pour les fondamentaux,
 * ambre pour le contenu de boss, rose pour l'endgame…) déclinée en utilitaires
 * Tailwind. Tailwind v4 ne voit que les classes ÉCRITES EN LITTÉRAL — jamais de
 * concaténation : chaque déclinaison est une chaîne complète.
 *
 * Typé sur `GuideCategorySlug` (Record exhaustif) : ajouter une catégorie sans
 * son accent casse la compilation — pas de repli « other » silencieux comme en V2.
 */
import type { GuideCategorySlug } from '@/lib/data/guide-categories';

export type GuideAccent = {
  text: string;
  textSoft: string;
  dot: string;
  /** Aplat utilitaire pour bandes de section / soulignés. */
  stripe: string;
  border: string;
  hoverBorder: string;
  iconBorder: string;
  iconFrom: string;
  pillBg: string;
  pillBorder: string;
  glow: string;
};

export const GUIDE_ACCENT: Record<GuideCategorySlug, GuideAccent> = {
  'general-guides': {
    text: 'text-emerald-300',
    textSoft: 'text-emerald-400/80',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]',
    stripe: 'bg-emerald-400',
    border: 'border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-500/50',
    iconBorder: 'border-emerald-500/30',
    iconFrom: 'from-emerald-500/15',
    pillBg: 'bg-emerald-500/10',
    pillBorder: 'border-emerald-500/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_#4ade80]',
  },
  adventure: {
    text: 'text-sky-300',
    textSoft: 'text-sky-400/80',
    dot: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]',
    stripe: 'bg-sky-400',
    border: 'border-sky-500/30',
    hoverBorder: 'hover:border-sky-500/50',
    iconBorder: 'border-sky-500/30',
    iconFrom: 'from-sky-500/15',
    pillBg: 'bg-sky-500/10',
    pillBorder: 'border-sky-500/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_#38bdf8]',
  },
  'adventure-license': {
    text: 'text-indigo-300',
    textSoft: 'text-indigo-400/80',
    dot: 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]',
    stripe: 'bg-indigo-400',
    border: 'border-indigo-500/30',
    hoverBorder: 'hover:border-indigo-500/50',
    iconBorder: 'border-indigo-500/30',
    iconFrom: 'from-indigo-500/15',
    pillBg: 'bg-indigo-500/10',
    pillBorder: 'border-indigo-500/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_#818cf8]',
  },
  'guild-raid': {
    text: 'text-amber-300',
    textSoft: 'text-amber-400/80',
    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
    stripe: 'bg-amber-400',
    border: 'border-amber-500/30',
    hoverBorder: 'hover:border-amber-500/50',
    iconBorder: 'border-amber-500/30',
    iconFrom: 'from-amber-500/15',
    pillBg: 'bg-amber-500/10',
    pillBorder: 'border-amber-500/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_#fbbf24]',
  },
  'world-boss': {
    text: 'text-orange-300',
    textSoft: 'text-orange-400/80',
    dot: 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]',
    stripe: 'bg-orange-400',
    border: 'border-orange-500/30',
    hoverBorder: 'hover:border-orange-500/50',
    iconBorder: 'border-orange-500/30',
    iconFrom: 'from-orange-500/15',
    pillBg: 'bg-orange-500/10',
    pillBorder: 'border-orange-500/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_#fb923c]',
  },
  'dimensional-singularity': {
    text: 'text-violet-300',
    textSoft: 'text-violet-400/80',
    dot: 'bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.6)]',
    stripe: 'bg-violet-400',
    border: 'border-violet-500/30',
    hoverBorder: 'hover:border-violet-500/50',
    iconBorder: 'border-violet-500/30',
    iconFrom: 'from-violet-500/15',
    pillBg: 'bg-violet-500/10',
    pillBorder: 'border-violet-500/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_#a78bfa]',
  },
  'joint-challenge': {
    text: 'text-teal-300',
    textSoft: 'text-teal-400/80',
    dot: 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]',
    stripe: 'bg-teal-400',
    border: 'border-teal-500/30',
    hoverBorder: 'hover:border-teal-500/50',
    iconBorder: 'border-teal-500/30',
    iconFrom: 'from-teal-500/15',
    pillBg: 'bg-teal-500/10',
    pillBorder: 'border-teal-500/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_#2dd4bf]',
  },
  'special-request': {
    text: 'text-rose-300',
    textSoft: 'text-rose-400/80',
    dot: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]',
    stripe: 'bg-rose-400',
    border: 'border-rose-500/30',
    hoverBorder: 'hover:border-rose-500/50',
    iconBorder: 'border-rose-500/30',
    iconFrom: 'from-rose-500/15',
    pillBg: 'bg-rose-500/10',
    pillBorder: 'border-rose-500/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_#fb7185]',
  },
  'irregular-extermination': {
    text: 'text-red-300',
    textSoft: 'text-red-400/80',
    dot: 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
    stripe: 'bg-red-400',
    border: 'border-red-500/30',
    hoverBorder: 'hover:border-red-500/50',
    iconBorder: 'border-red-500/30',
    iconFrom: 'from-red-500/15',
    pillBg: 'bg-red-500/10',
    pillBorder: 'border-red-500/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_#ef4444]',
  },
  'monad-gate': {
    text: 'text-fuchsia-300',
    textSoft: 'text-fuchsia-400/80',
    dot: 'bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.6)]',
    stripe: 'bg-fuchsia-400',
    border: 'border-fuchsia-500/30',
    hoverBorder: 'hover:border-fuchsia-500/50',
    iconBorder: 'border-fuchsia-500/30',
    iconFrom: 'from-fuchsia-500/15',
    pillBg: 'bg-fuchsia-500/10',
    pillBorder: 'border-fuchsia-500/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_#e879f9]',
  },
  'skyward-tower': {
    text: 'text-cyan-300',
    textSoft: 'text-cyan-400/80',
    dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]',
    stripe: 'bg-cyan-400',
    border: 'border-cyan-500/30',
    hoverBorder: 'hover:border-cyan-500/50',
    iconBorder: 'border-cyan-500/30',
    iconFrom: 'from-cyan-500/15',
    pillBg: 'bg-cyan-500/10',
    pillBorder: 'border-cyan-500/30',
    glow: 'hover:shadow-[0_8px_28px_-12px_#22d3ee]',
  },
  /* Catégorie « fourre-tout » : gris neutres — via les tokens, pas des zinc en dur. */
  other: {
    text: 'text-content',
    textSoft: 'text-content-muted',
    dot: 'bg-content-muted shadow-[0_0_8px_rgba(161,161,170,0.5)]',
    stripe: 'bg-content-muted',
    border: 'border-line',
    hoverBorder: 'hover:border-line-strong',
    iconBorder: 'border-line',
    iconFrom: 'from-content-subtle/10',
    pillBg: 'bg-content-subtle/10',
    pillBorder: 'border-line-strong',
    glow: 'hover:shadow-[0_8px_28px_-12px_#a1a1aa]',
  },
} as const;
