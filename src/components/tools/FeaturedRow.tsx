import Link from 'next/link';
import type { Route } from 'next';
import { img } from '@/lib/images';
import { CATEGORY_ACCENT, FLAGSHIP_SLUGS, FLAGSHIP_RIBBON } from './toolsTheme';
import type { ToolCardVM } from './ToolCard';

export interface FeaturedStrings {
  featured: string;
  ribbon: { most_used: string; community_pick: string; new: string };
}

/**
 * Rail « Featured » au-dessus des onglets : 3 outils phares en grandes cartes à
 * halo d'accent, ruban et flèche CTA. Rien si aucun phare n'est présent.
 */
export function FeaturedRow({ tools, strings }: { tools: ToolCardVM[]; strings: FeaturedStrings }) {
  const byId = new Map(tools.map((t) => [t.slug, t]));
  const flagships = FLAGSHIP_SLUGS.map((slug) => byId.get(slug)).filter((t): t is ToolCardVM =>
    Boolean(t),
  );
  if (flagships.length === 0) return null;

  return (
    <section aria-label={strings.featured} className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-content-muted font-mono text-[10px] font-semibold tracking-[0.18em] uppercase">
          {strings.featured}
        </span>
        <span className="bg-line-subtle h-px flex-1" aria-hidden />
        <span className="text-content-subtle font-mono text-[10px] tracking-[0.12em] uppercase">
          {flagships.length} / {tools.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {flagships.map((tool) => {
          const accent = CATEGORY_ACCENT[tool.category];
          const ribbonKind = FLAGSHIP_RIBBON[tool.slug as (typeof FLAGSHIP_SLUGS)[number]];
          const ribbonLabel = ribbonKind ? strings.ribbon[ribbonKind] : '';
          return (
            <Link
              key={tool.slug}
              href={tool.href as Route}
              className={`group to-surface-raised flex min-h-44 flex-col gap-3 rounded-xl border bg-linear-to-b p-4 transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-px ${accent.featuredBorder} ${accent.featuredFrom} ${accent.hoverBorder} focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`size-1.5 rounded-full ${accent.dot}`} aria-hidden />
                  <span
                    className={`font-mono text-[10px] font-semibold tracking-[0.16em] uppercase ${accent.text}`}
                  >
                    {tool.categoryLabel}
                  </span>
                </div>
                {ribbonLabel && (
                  <span className="text-content-subtle font-mono text-[9.5px] tracking-[0.14em] uppercase">
                    {ribbonLabel}
                  </span>
                )}
              </div>

              <div className="flex items-end gap-3">
                <div
                  className={`relative flex size-14 shrink-0 items-center justify-center rounded-xl border bg-linear-to-br to-transparent ${accent.iconBorder} ${accent.iconFrom}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
                  <img
                    src={img.toolIcon(tool.icon)}
                    alt=""
                    className="absolute inset-0 size-full object-contain p-1"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-content-strong text-base font-semibold tracking-tight">
                    {tool.title}
                  </h3>
                  <p className="text-content-muted mt-0.5 line-clamp-2 text-xs">{tool.desc}</p>
                </div>
              </div>

              <div className="border-line-subtle mt-auto flex items-center justify-end border-t pt-2.5">
                <span
                  className={`inline-flex items-center transition-transform duration-150 group-hover:translate-x-0.5 ${accent.text}`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
