import Link from 'next/link';
import type { Route } from 'next';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getCharacterListItems } from '@/lib/data/characters';
import { loadCuratedCharacters } from '@/lib/data/curated';
import { getMergedEffects, loadCuratedEffects } from '@/lib/data/effects';
import { getEEViews, loadEquipmentEditorial } from '@/lib/data/equipment';
import { buildInbox, readAssetsReport, type InboxTone } from '@/lib/admin/admin-inbox';

// Accueil = tableau de bord, extraction fraîche, jamais prérendu.
export const dynamic = 'force-dynamic';

const TONE: Record<InboxTone, string> = {
  danger: 'border-danger/40 text-danger',
  warn: 'border-warn/40 text-warn',
  muted: 'border-line-subtle text-content-subtle',
};

/** Lecture tolérante d'un JSON du repo (dictionnaire d'ids) — `{}` si absent. */
function readIdDict(rel: string): Record<string, unknown> {
  try {
    return JSON.parse(readFileSync(resolve(process.cwd(), rel), 'utf8')) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/**
 * Ligne de COUVERTURE curée : combien d'entités portent au moins un champ curé.
 * Informative, JAMAIS une TODO — la plupart des entités n'ont besoin d'aucun
 * override. C'est pour ça qu'elle vit sous l'inbox et non dedans.
 */
function CoverageRow({
  href,
  label,
  done,
  total,
}: {
  href: string;
  label: string;
  done: number;
  total: number;
}) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <Link
      href={href as Route}
      className="hover:bg-surface-base flex items-center gap-3 rounded px-2 py-1.5"
    >
      <span className="text-content w-24 shrink-0 text-sm">{label}</span>
      <span className="bg-surface-base h-1.5 min-w-0 flex-1 overflow-hidden rounded-full">
        <span className="bg-accent/60 block h-full rounded-full" style={{ width: `${pct}%` }} />
      </span>
      <span className="text-content-subtle w-28 shrink-0 text-right text-xs tabular-nums">
        {done}/{total} curated
      </span>
    </Link>
  );
}

export default function AdminHome() {
  const inbox = buildInbox();
  const assets = readAssetsReport();

  // COUVERTURE curée (informative) — seules les entités qui ont un éditeur.
  const chars = getCharacterListItems();
  const curated = loadCuratedCharacters();
  const charCurated = chars.filter(
    (c) => curated[c.id] && Object.keys(curated[c.id]).length,
  ).length;
  const eeViews = getEEViews();
  const eeCur = loadEquipmentEditorial().ee;
  const eeCurated = eeViews.filter((v) => {
    const e = eeCur[v.characterId];
    return e && Object.keys(e).length > 0;
  }).length;
  const prosDone = chars.filter(
    (c) => curated[c.id]?.prosCons?.pros?.length || curated[c.id]?.prosCons?.cons?.length,
  ).length;
  const synDone = chars.filter((c) => curated[c.id]?.synergies?.length).length;

  const coverage = [
    {
      href: '/admin/editor/characters',
      label: 'Character',
      done: charCurated,
      total: chars.length,
    },
    {
      href: '/admin/editor/effects',
      label: 'Effect',
      done: Object.keys(loadCuratedEffects()).length,
      total: getMergedEffects().length,
    },
    { href: '/admin/editor/ee', label: 'EE', done: eeCurated, total: eeViews.length },
    {
      href: '/admin/editor/items',
      label: 'Item',
      done: Object.keys(readIdDict('data/curated/items.json')).length,
      total: Object.keys(readIdDict('data/generated/items.json')).length,
    },
    { href: '/admin/tools/pros-cons', label: 'Pro / Con', done: prosDone, total: chars.length },
    { href: '/admin/tools/synergies', label: 'Synergy', done: synDone, total: chars.length },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-content-strong text-xl font-semibold">Administration</h1>
        <p className="text-content-muted text-sm">
          {inbox.length === 0
            ? 'Everything is up to date.'
            : `${inbox.length} thing(s) to look at, most urgent first.`}
        </p>
      </div>

      {/* INBOX — uniquement ce qui demande une action, trié par urgence. */}
      <section className="space-y-2">
        <h2 className="text-content-strong text-sm font-semibold uppercase">Inbox</h2>
        {inbox.length === 0 ? (
          <p className="border-line-subtle bg-surface-raised text-success rounded-lg border p-4 text-sm">
            ✓ Nothing to process — extraction, editorial tags and assets are all clean.
          </p>
        ) : (
          <ul className="space-y-2">
            {inbox.map((it) => (
              <li key={it.key}>
                <Link
                  href={it.href as Route}
                  className={`bg-surface-raised hover:bg-surface-base flex items-center gap-3 rounded-lg border border-l-4 p-3 ${TONE[it.tone]}`}
                >
                  <span className="text-content-strong text-sm font-medium">{it.label}</span>
                  <span className="text-content-muted min-w-0 flex-1 truncate text-sm">
                    {it.detail}
                  </span>
                  <span className="text-content-subtle shrink-0 text-xs">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* COUVERTURE éditoriale — informative (pas une TODO). */}
      <section className="space-y-2">
        <h2 className="text-content-strong text-sm font-semibold uppercase">Editorial coverage</h2>
        <div className="border-line-subtle bg-surface-raised space-y-0.5 rounded-lg border p-2">
          {coverage.map((c) => (
            <CoverageRow key={c.label} {...c} />
          ))}
        </div>
        <p className="text-content-subtle text-xs">
          {assets ? (
            <>
              Assets: {assets.total} required by data,{' '}
              {assets.missingCount > 0
                ? `${assets.missingCount} missing (see inbox)`
                : 'all collected'}{' '}
              ({new Date(assets.generatedAt).toLocaleDateString('fr-FR')}).
            </>
          ) : (
            <>
              No assets report — run <code>pnpm images</code>.
            </>
          )}
        </p>
      </section>
    </div>
  );
}
