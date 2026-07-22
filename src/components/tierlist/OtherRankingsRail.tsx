import Link from 'next/link';
import type { Route } from 'next';
import { img } from '@/lib/images';
import { RAIL_ACCENT } from './tierlistTheme';

export interface RailToolVM {
  slug: string;
  icon: string;
  title: string;
  desc: string;
  href: string;
}

/** Rail « autres classements » (accent bleu ciel) sous les cartes phares. */
export function OtherRankingsRail({
  tools,
  heading,
  countLabel,
}: {
  tools: RailToolVM[];
  heading: string;
  /** Déjà formaté, ex. « 3 rankings ». */
  countLabel: string;
}) {
  if (tools.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="border-line-subtle relative flex items-end justify-between gap-3 border-b pb-3">
        <span
          className={`absolute -bottom-px left-0 h-0.5 w-10 rounded-full ${RAIL_ACCENT.stripe}`}
          aria-hidden
        />
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${RAIL_ACCENT.dot}`} aria-hidden />
          <h2 className={`text-base font-semibold tracking-tight ${RAIL_ACCENT.text}`}>
            {heading}
          </h2>
        </div>
        <span className="text-content-subtle font-mono text-[10px] tracking-[0.12em] uppercase">
          {countLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={tool.href as Route}
            className={`group border-line-subtle bg-surface-raised hover:bg-surface-overlay flex items-start gap-3 rounded-xl border p-4 transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-px ${RAIL_ACCENT.hoverBorder} ${RAIL_ACCENT.hoverGlow} focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none`}
          >
            <div
              className={`relative flex size-12 shrink-0 items-center justify-center rounded-lg border bg-linear-to-br to-transparent ${RAIL_ACCENT.iconBorder} ${RAIL_ACCENT.iconFrom}`}
            >
              <img
                src={img.toolIcon(tool.icon)}
                alt=""
                aria-hidden
                className="absolute inset-0 size-full object-contain p-1"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-content-strong truncate text-sm font-semibold">{tool.title}</h3>
              <p className="text-content-muted mt-0.5 line-clamp-2 text-xs">{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
