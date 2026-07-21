import Link from 'next/link';
import type { Route } from 'next';
import { img } from '@/lib/images';
import { CATEGORY_ACCENT, type CategoryAccentKey } from './toolsTheme';
import { StatusBadge, type ToolBadgeStatus } from './StatusBadge';

/** Un outil prêt à rendre (titre/desc résolus, catégorie = clé d'accent). */
export interface ToolCardVM {
  slug: string;
  icon: string;
  title: string;
  desc: string;
  status: string;
  href: string;
  category: CategoryAccentKey;
  categoryLabel: string;
}

/** Carte d'outil : boîte d'icône à dégradé d'accent, titre + statut, desc. */
export function ToolCard({ tool, comingSoonLabel }: { tool: ToolCardVM; comingSoonLabel: string }) {
  const accent = CATEGORY_ACCENT[tool.category];
  const isDim = tool.status === 'coming-soon';

  const inner = (
    <>
      <div
        className={`relative flex size-12 shrink-0 items-center justify-center rounded-lg border bg-linear-to-br to-transparent transition-colors ${
          isDim ? 'border-line-subtle from-transparent' : `${accent.iconBorder} ${accent.iconFrom}`
        }`}
      >
        <img
          src={img.toolIcon(tool.icon)}
          alt=""
          className={`absolute inset-0 size-full object-contain p-1 ${isDim ? 'opacity-60' : ''}`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-content-strong truncate text-sm font-semibold">{tool.title}</h3>
          {tool.status !== 'available' && (
            <StatusBadge
              status={tool.status as ToolBadgeStatus}
              comingSoonLabel={comingSoonLabel}
            />
          )}
        </div>
        <p className="text-content-muted mt-0.5 line-clamp-2 text-xs">{tool.desc}</p>
      </div>
    </>
  );

  const base =
    'group flex items-start gap-3 rounded-xl border border-line-subtle bg-surface-raised p-4 transition-[transform,border-color,box-shadow] duration-150';

  if (isDim) return <div className={`${base} cursor-default opacity-70`}>{inner}</div>;

  return (
    <Link
      href={tool.href as Route}
      className={`${base} hover:bg-surface-overlay hover:-translate-y-px ${accent.hoverBorder} focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none`}
    >
      {inner}
    </Link>
  );
}
