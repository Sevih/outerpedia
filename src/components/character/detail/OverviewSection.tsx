import type { Lang } from '@/lib/i18n/config';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { GameText } from '@/components/ui/GameText';
import { FullArtCarousel, type FullArt } from './FullArtCarousel';

export interface OverviewBadge {
  label: string;
  /** Icône (tag éditorial) — absent pour le badge rôle. */
  iconSrc?: string;
  /** Classe de fond (badge rôle). */
  bgClass?: string;
}

export interface OverviewProps {
  hex: string;
  fullArts: FullArt[];
  /** Badge type d'unité (premium/limited/…), si taggé. */
  unitTag: OverviewBadge | null;
  /** Badge rôle (dps/support/sustain), si curé. */
  roleTag: OverviewBadge | null;
  /** Épithète affichée en eyebrow (nickname), si le jeu la préfixe. */
  prefix: string | null;
  name: string;
  /** Suffixe sr-only du h1 (SEO). */
  srSuffix: string;
  rarity: number;
  element: { label: string; iconSrc: string; textClass: string };
  klass: { label: string; iconSrc: string };
  subClass: { label: string; iconSrc: string } | null;
  starSrc: string;
  /** Paires label → valeur (VA, anniversaire, taille, poids). */
  meta: Array<[string, string]>;
  story: string | null;
  lang: Lang;
}

/**
 * Header « héros » de la fiche (portage V2) : art en pied + badges + nom
 * monumental (dernière lettre à l'accent élément) + rareté/élément/classe +
 * méta profil + histoire.
 */
export function OverviewSection(p: OverviewProps) {
  return (
    <section
      id="overview"
      className="relative scroll-mt-24"
      style={{
        background: `radial-gradient(ellipse 60% 70% at 28% 45%, ${p.hex}16 0%, transparent 68%)`,
      }}
    >
      <div className="mx-auto grid max-w-330 grid-cols-1 gap-8 px-4 py-8 md:px-6 lg:grid-cols-[360px_1fr] lg:gap-14 lg:px-8 lg:py-14">
        <FullArtCarousel items={p.fullArts} hex={p.hex} />

        {/* Colonne méta */}
        <div className="flex min-w-0 flex-col gap-5 lg:pt-3">
          <div className="flex flex-wrap items-center gap-2">
            {p.unitTag && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-sm ring-1 ring-white/10">
                {p.unitTag.iconSrc && (
                  // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
                  <img src={p.unitTag.iconSrc} alt="" width={16} height={16} />
                )}
                {p.unitTag.label}
              </span>
            )}
            {p.roleTag && (
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm text-white ring-1 ring-white/10 ${p.roleTag.bgClass ?? ''}`}
              >
                {p.roleTag.label}
              </span>
            )}
            <span className="ml-auto">
              <ShareButtons title={p.prefix ? `${p.prefix} ${p.name}` : p.name} lang={p.lang} />
            </span>
          </div>

          <div>
            {p.prefix && (
              <div
                className="mb-2 font-mono text-xs font-medium tracking-[0.28em] uppercase lg:mb-3 lg:text-[13px] lg:tracking-[0.3em]"
                style={{ color: p.hex }}
              >
                {p.prefix}
              </div>
            )}
            <h1 className="font-game text-5xl leading-[0.95] font-bold tracking-tight text-zinc-100 lg:text-7xl">
              {p.name.slice(0, -1)}
              <span style={{ color: p.hex, textShadow: `0 0 32px ${p.hex}55` }}>
                {p.name.slice(-1)}
              </span>
              <span className="sr-only">{p.srSuffix}</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-0.5">
              {[...Array(p.rarity)].map((_, i) => (
                // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
                <img key={i} src={p.starSrc} alt="star" width={20} height={20} />
              ))}
            </span>
            <span className="h-4.5 w-px bg-white/15" />
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-medium ${p.element.textClass}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
              <img src={p.element.iconSrc} alt={p.element.label} width={22} height={22} />
              {p.element.label}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-zinc-200">
              {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
              <img src={p.klass.iconSrc} alt={p.klass.label} width={22} height={22} />
              {p.klass.label}
            </span>
            {p.subClass && (
              <span className="inline-flex items-center gap-1.5 text-sm text-zinc-400">
                {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
                <img src={p.subClass.iconSrc} alt={p.subClass.label} width={22} height={22} />
                {p.subClass.label}
              </span>
            )}
          </div>

          {p.meta.length > 0 && (
            <div className="flex flex-wrap gap-x-8 gap-y-3 border-y border-white/6 py-3.5">
              {p.meta.map(([label, value]) => (
                <div key={label}>
                  <div className="font-mono text-[10px] tracking-[0.14em] text-zinc-500 uppercase">
                    {label}
                  </div>
                  <div className="mt-0.5 text-sm text-zinc-200">{value}</div>
                </div>
              ))}
            </div>
          )}

          {p.story && (
            <GameText
              text={p.story}
              className="max-w-2xl text-sm leading-relaxed whitespace-pre-line text-zinc-300"
            />
          )}
        </div>
      </div>
    </section>
  );
}
