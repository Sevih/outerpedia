import Link from 'next/link';
import type { Route } from 'next';
import { img } from '@/lib/images';
import { FLAGSHIP_ACCENT, type FlagshipKey } from './tierlistTheme';

/**
 * Carte phare PvE / PvP : panneau d'art (dégradé radial d'accent + texture rayée
 * + grand glyphe « S »), bloc titre et pastille CTA. Le CLUSTER DE PORTRAITS
 * top-tier de la V2 est omis : la donnée de rang par perso n'existe pas encore en
 * V3 (elle vit dans l'outil tierlist, non porté) — le glyphe S est centré à la place.
 */
export function FlagshipCard({
  flagship,
  title,
  description,
  href,
  side,
  viewLabel,
  previewLabel,
}: {
  flagship: FlagshipKey;
  title: string;
  description: string;
  href: string;
  side: 'left' | 'right';
  viewLabel: string;
  previewLabel: string;
}) {
  const accent = FLAGSHIP_ACCENT[flagship];
  const eyebrow = flagship === 'pve' ? 'PVE' : 'PVP';

  return (
    <Link
      href={href as Route}
      className={`group focus-visible:ring-accent relative flex flex-1 flex-col gap-4 overflow-hidden rounded-2xl border p-5 transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-px focus-visible:ring-2 focus-visible:outline-none md:p-6 ${accent.border} ${accent.surface} ${accent.borderHover} ${accent.glow}`}
    >
      {/* Panneau d'art */}
      <div className="border-line-subtle bg-surface-base/50 relative h-40 overflow-hidden rounded-xl border">
        <div
          className={`absolute inset-0 opacity-80 ${side === 'left' ? 'bg-radial-[at_85%_50%]' : 'bg-radial-[at_15%_50%]'} ${accent.radialFrom} to-transparent`}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[repeating-linear-gradient(135deg,#16161c_0_14px,#101015_14px_28px)] opacity-30"
          aria-hidden
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center transition-transform duration-200 group-hover:-translate-y-0.5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
          <img
            src={img.rank('S')}
            alt=""
            className="size-28 object-contain opacity-70 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
          />
        </div>
        <div
          className={`text-content-subtle absolute bottom-2 font-mono text-[10px] tracking-[0.14em] uppercase ${side === 'left' ? 'left-3' : 'right-3'}`}
        >
          {previewLabel}
        </div>
      </div>

      {/* Bloc titre */}
      <div>
        <div
          className={`font-mono text-[10px] font-semibold tracking-[0.18em] uppercase ${accent.text}`}
        >
          {eyebrow}
        </div>
        <h2 className="text-content-strong mt-1 text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h2>
        <p className="text-content-muted mt-2 max-w-xl text-sm">{description}</p>
      </div>

      {/* CTA */}
      <div className="mt-auto flex justify-end">
        <span
          className={`bg-surface-base inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${accent.pillBorder} ${accent.text}`}
        >
          {viewLabel}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
