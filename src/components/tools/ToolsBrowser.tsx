'use client';

import { useUrlSlice, writeUrl } from '@/hooks/useUrlSlice';
import { CATEGORY_ACCENT, asAccentKey, type CategoryAccent } from './toolsTheme';
import { ToolCard, type ToolCardVM } from './ToolCard';
import { FeaturedRow, type FeaturedStrings } from './FeaturedRow';

/**
 * Landing des outils : rail « Featured » (onglet All), onglets de catégorie
 * COLORÉS (accent par catégorie), et sections à en-tête barré d'accent. La
 * catégorie active vit dans le HASH (`#cat-<slug>`, deep-link footer). Les
 * cartes pointent `/tools/<slug>` (sous-outils non encore portés).
 */
export interface ToolGroupVM {
  slug: string;
  label: string;
  tools: ToolCardVM[];
}

const ALL = '__all__';
const PREFIX = 'cat-';

export function ToolsBrowser({
  groups,
  allLabel,
  comingSoonLabel,
  countLabel,
  featured,
}: {
  groups: ToolGroupVM[];
  allLabel: string;
  comingSoonLabel: string;
  /** Gabarit `{count}`. */
  countLabel: string;
  featured: FeaturedStrings;
}) {
  const hash = useUrlSlice('hashchange', () => decodeURIComponent(window.location.hash.slice(1)));
  const fromHash = hash?.startsWith(PREFIX) ? hash.slice(PREFIX.length) : null;
  const active =
    fromHash && (fromHash === ALL || groups.some((g) => g.slug === fromHash)) ? fromHash : ALL;

  const select = (v: string) =>
    writeUrl(() => {
      const url = new URL(window.location.href);
      url.hash = `${PREFIX}${v}`;
      window.history.replaceState(null, '', url);
    });

  const allTools = groups.flatMap((g) => g.tools);
  const visible = active === ALL ? groups : groups.filter((g) => g.slug === active);

  return (
    <div className="mt-6 flex flex-col gap-8">
      {active === ALL && <FeaturedRow tools={allTools} strings={featured} />}

      <div
        role="tablist"
        className="border-line-subtle bg-surface-raised flex flex-wrap items-center justify-center gap-2 rounded-xl border px-3 py-2.5"
      >
        <Tab
          label={allLabel}
          count={allTools.length}
          active={active === ALL}
          onClick={() => select(ALL)}
        />
        {groups.map((g) => (
          <Tab
            key={g.slug}
            label={g.label}
            count={g.tools.length}
            active={active === g.slug}
            accent={CATEGORY_ACCENT[asAccentKey(g.slug)]}
            onClick={() => select(g.slug)}
          />
        ))}
      </div>

      {visible.map((g) => {
        const accent = CATEGORY_ACCENT[asAccentKey(g.slug)];
        return (
          <section key={g.slug} className="flex flex-col gap-3">
            <div className="border-line-subtle relative flex items-end gap-3 border-b pb-2">
              <span
                className={`absolute -bottom-px left-0 h-0.5 w-10 rounded-full ${accent.stripe}`}
                aria-hidden
              />
              <h2 className={`text-base font-semibold tracking-tight ${accent.text}`}>{g.label}</h2>
              <span className="text-content-subtle ml-auto font-mono text-[10px] tracking-[0.12em] uppercase">
                {countLabel.replace('{count}', String(g.tools.length))}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.tools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} comingSoonLabel={comingSoonLabel} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Tab({
  label,
  count,
  active,
  accent,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  accent?: CategoryAccent;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm transition ${
        active
          ? accent
            ? `${accent.tabActiveBorder} ${accent.tabActiveBg} ${accent.tabActiveText} font-medium`
            : 'border-line text-content-strong font-medium'
          : 'border-line-subtle text-content-muted hover:text-content-strong'
      }`}
    >
      {accent && <span className={`size-1.5 rounded-full ${accent.dot}`} aria-hidden />}
      {label}
      <span
        className={`font-mono text-[10px] tracking-wider ${
          active ? (accent ? accent.tabActiveCount : 'text-content-muted') : 'text-content-subtle'
        }`}
      >
        {count}
      </span>
    </button>
  );
}
