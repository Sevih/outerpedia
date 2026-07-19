/**
 * Accents du hub tier list (portage V2). Style maison : PvE → émeraude, PvP →
 * rouge, rail « autres classements » → bleu ciel. Couleurs vives autorisées hors
 * `guides/**` ; les neutres passent aux tokens dans les composants. Classes
 * LITTÉRALES (Tailwind v4).
 */
export type FlagshipKey = 'pve' | 'pvp';

export interface FlagshipAccent {
  text: string;
  dot: string;
  border: string;
  borderHover: string;
  surface: string;
  pillBorder: string;
  glow: string;
  /** Dégradé radial du panneau d'art (accordé à `text`). */
  radialFrom: string;
}

export const FLAGSHIP_ACCENT: Record<FlagshipKey, FlagshipAccent> = {
  pve: {
    text: 'text-emerald-300',
    dot: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]',
    border: 'border-emerald-500/40',
    borderHover: 'hover:border-emerald-500/60',
    surface: 'bg-linear-to-b from-emerald-500/10 to-surface-raised',
    pillBorder: 'border-emerald-500/40',
    glow: 'hover:shadow-[0_6px_24px_-12px_#34d399]',
    radialFrom: 'from-emerald-500/20',
  },
  pvp: {
    text: 'text-red-300',
    dot: 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]',
    border: 'border-red-500/40',
    borderHover: 'hover:border-red-500/60',
    surface: 'bg-linear-to-b from-red-500/10 to-surface-raised',
    pillBorder: 'border-red-500/40',
    glow: 'hover:shadow-[0_6px_24px_-12px_#f87171]',
    radialFrom: 'from-red-500/20',
  },
};

/** Chrome bleu ciel du rail « autres classements ». */
export const RAIL_ACCENT = {
  text: 'text-sky-300',
  stripe: 'bg-sky-400',
  dot: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]',
  hoverBorder: 'hover:border-sky-500/40',
  hoverGlow: 'hover:shadow-[0_6px_24px_-12px_#38bdf8]',
  iconBorder: 'border-sky-500/30',
  iconFrom: 'from-sky-500/15',
} as const;
