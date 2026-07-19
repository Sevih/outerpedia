'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { img } from '@/lib/images';
import { useUrlSlice, writeUrl } from '@/hooks/useUrlSlice';

/**
 * Landing des outils : onglets de catégorie (filtrage) + grille de cartes. La
 * catégorie active vit dans le HASH (`#cat-<slug>`) — l'URL est la source de
 * vérité (deep-link du footer), écrite par `replaceState`. Les cartes pointent
 * `/tools/<slug>` ; ces sous-pages ne sont pas encore portées (404 assumée le
 * temps du portage — décision Sevih : landing d'abord).
 */
export interface ToolVM {
  slug: string;
  icon: string;
  title: string;
  desc: string;
  href: string;
}
export interface ToolGroupVM {
  slug: string;
  label: string;
  tools: ToolVM[];
}

const ALL = '__all__';
const PREFIX = 'cat-';

export function ToolsBrowser({ groups, allLabel }: { groups: ToolGroupVM[]; allLabel: string }) {
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

  const total = groups.reduce((n, g) => n + g.tools.length, 0);
  const visible = active === ALL ? groups : groups.filter((g) => g.slug === active);

  return (
    <div className="mt-6 flex flex-col gap-8">
      <div
        role="tablist"
        className="border-line-subtle bg-surface-raised flex flex-wrap items-center justify-center gap-2 rounded-xl border px-3 py-2.5"
      >
        <Tab label={allLabel} count={total} active={active === ALL} onClick={() => select(ALL)} />
        {groups.map((g) => (
          <Tab
            key={g.slug}
            label={g.label}
            count={g.tools.length}
            active={active === g.slug}
            onClick={() => select(g.slug)}
          />
        ))}
      </div>

      {visible.map((g) => (
        <section key={g.slug} className="flex flex-col gap-3">
          <div className="border-line-subtle flex items-end gap-3 border-b pb-2">
            <h2 className="text-content-strong text-base font-semibold">{g.label}</h2>
            <span className="text-content-subtle ml-auto font-mono text-[10px] tracking-wider uppercase">
              {g.tools.length}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.tools.map((tool) => (
              <Link
                key={tool.slug}
                href={tool.href as Route}
                className="card-interactive flex items-start gap-3 p-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
                <img
                  src={img.toolIcon(tool.icon)}
                  alt=""
                  className="size-10 shrink-0 object-contain"
                />
                <div className="min-w-0">
                  <p className="text-content-strong text-sm font-semibold">{tool.title}</p>
                  <p className="text-content-subtle mt-0.5 line-clamp-2 text-xs">{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Tab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
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
          ? 'border-accent text-content-strong font-medium'
          : 'border-line-subtle text-content-muted hover:text-content-strong'
      }`}
    >
      {label}
      <span className="text-content-subtle font-mono text-[10px] tracking-wider">{count}</span>
    </button>
  );
}
