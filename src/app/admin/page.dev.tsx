import Link from 'next/link';
import type { Route } from 'next';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getCharacterListItems } from '@/lib/data/characters';
import { loadCuratedCharacters } from '@/lib/data/curated';
import { getMergedEffects, loadCuratedEffects } from '@/lib/data/effects';
import { getEEViews, loadEquipmentEditorial } from '@/lib/data/equipment';
import { reviewAll, reviewBuckets, type DiffBuckets } from '@/lib/admin/review-store';

// Accueil = tableau de bord, extraction fraîche, jamais prérendu.
export const dynamic = 'force-dynamic';

/**
 * Case EXTRACT = diff « data du jeu ↔ data du site » (moteur review : committé
 * vs extraction fraîche). Trois buckets : `new` (dans le jeu, pas sur le site),
 * `diff` (vrai champ changé), `typo` (n'a changé que typographiquement —
 * cosmétique, en gris). ✓ si tout est à zéro.
 */
function ExtractCell({ href, b }: { href: string; b: DiffBuckets }) {
  const actionable = b.new + b.diff + b.removed;
  return (
    <td className="px-3 py-2 text-center">
      <Link
        href={href as Route}
        className="inline-flex items-center justify-center hover:underline"
      >
        {actionable === 0 && b.typo === 0 ? (
          <span className="text-success">✓</span>
        ) : (
          <span className="flex items-center justify-center gap-2 text-xs tabular-nums">
            {b.new > 0 && <span className="text-warn font-medium">{b.new} new</span>}
            {b.diff > 0 && <span className="text-danger font-medium">{b.diff} diff</span>}
            {b.removed > 0 && <span className="text-danger font-medium">{b.removed} rm</span>}
            {b.typo > 0 && <span className="text-content-subtle">{b.typo} typo</span>}
          </span>
        )}
      </Link>
    </td>
  );
}

/**
 * Case ÉDITION = couverture de la couche CURÉE (combien d'entités portent au
 * moins un champ curé, sur le total). Informative — pas une TODO : la plupart
 * des entités n'ont pas besoin d'override. `—` si l'entité n'a pas d'éditeur.
 */
function EditionCell({ cover }: { cover: { href: string; done: number; total: number } | null }) {
  if (!cover) return <td className="text-content-subtle px-3 py-2 text-center">—</td>;
  return (
    <td className="px-3 py-2 text-center">
      <Link
        href={cover.href as Route}
        className="text-content-muted inline-flex items-center justify-center text-xs tabular-nums hover:underline"
      >
        {cover.done}/{cover.total} curated
      </Link>
    </td>
  );
}

/** Lecture tolérante d'un JSON du repo (dictionnaire d'ids) — `{}` si absent. */
function readIdDict(rel: string): Record<string, unknown> {
  try {
    return JSON.parse(readFileSync(resolve(process.cwd(), rel), 'utf8')) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/** Rapport de collecte d'assets (écrit par `pnpm assets:collect`), si présent. */
function readAssetsReport(): { total: number; missingCount: number; generatedAt: string } | null {
  try {
    return JSON.parse(
      readFileSync(resolve(process.cwd(), '.assets-staging/manifest-report.json'), 'utf8'),
    ) as { total: number; missingCount: number; generatedAt: string };
  } catch {
    return null;
  }
}

export default function AdminHome() {
  const chars = getCharacterListItems();
  const curated = loadCuratedCharacters();

  // EXTRACT : un seul moteur pour toutes les entités (committé vs frais).
  const buckets = new Map(reviewAll().map((r) => [r.id, reviewBuckets(r.diff)]));
  const empty: DiffBuckets = { new: 0, diff: 0, typo: 0, removed: 0 };
  const ex = (id: string, route: string) => ({ href: route, b: buckets.get(id) ?? empty });

  // ÉDITION : couverture curée, pour les entités qui ont un éditeur d'entité.
  const charCurated = chars.filter(
    (c) => curated[c.id] && Object.keys(curated[c.id]).length,
  ).length;
  const effTotal = getMergedEffects().length;
  const effCurated = Object.keys(loadCuratedEffects()).length;
  const eeViews = getEEViews();
  const eeCur = loadEquipmentEditorial().ee;
  const eeCurated = eeViews.filter((v) => {
    const e = eeCur[v.characterId];
    return e && Object.keys(e).length > 0;
  }).length;

  const rows: {
    label: string;
    extract: { href: string; b: DiffBuckets };
    edition: { href: string; done: number; total: number } | null;
  }[] = [
    {
      label: 'Character',
      extract: ex('character', '/admin/extractor/characters'),
      edition: { href: '/admin/editor/characters', done: charCurated, total: chars.length },
    },
    {
      label: 'Effect',
      extract: ex('effect', '/admin/extractor/effects'),
      edition: { href: '/admin/editor/effects', done: effCurated, total: effTotal },
    },
    { label: 'Monster', extract: ex('monster', '/admin/extractor/monsters'), edition: null },
    {
      label: 'EE',
      extract: ex('ee', '/admin/extractor/ee'),
      edition: { href: '/admin/editor/ee', done: eeCurated, total: eeViews.length },
    },
    { label: 'Weapons', extract: ex('weapon', '/admin/extractor/weapons'), edition: null },
    { label: 'Amulet', extract: ex('amulet', '/admin/extractor/amulets'), edition: null },
    { label: 'Armor', extract: ex('armor', '/admin/extractor/armors'), edition: null },
    { label: 'Talisman', extract: ex('talisman', '/admin/extractor/talismans'), edition: null },
    { label: 'Sets', extract: ex('set', '/admin/extractor/sets'), edition: null },
    {
      label: 'Item',
      extract: ex('item', '/admin/extractor/items'),
      edition: {
        href: '/admin/editor/items',
        done: Object.keys(readIdDict('data/curated/items.json')).length,
        total: Object.keys(readIdDict('data/generated/items.json')).length,
      },
    },
  ];

  const totalActionable = rows.reduce(
    (n, r) => n + r.extract.b.new + r.extract.b.diff + r.extract.b.removed,
    0,
  );
  const totalTypo = rows.reduce((n, r) => n + r.extract.b.typo, 0);

  // Tools transverses (couverture éditoriale).
  const prosDone = chars.filter(
    (c) => curated[c.id]?.prosCons?.pros?.length || curated[c.id]?.prosCons?.cons?.length,
  ).length;
  const synDone = chars.filter((c) => curated[c.id]?.synergies?.length).length;

  const assets = readAssetsReport();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-content-strong text-xl font-semibold">Administration</h1>
        <p className="text-content-muted text-sm">
          {totalActionable === 0 ? (
            <span className="text-success">✓ Extraction up to date everywhere.</span>
          ) : (
            <span className="text-warn">{totalActionable} extraction diff(s) to process</span>
          )}
          {totalTypo > 0 && <span className="text-content-subtle"> · {totalTypo} typo</span>}{' '}
          <span className="text-content-subtle">
            Extract = game ↔ site diff (new/diff/typo) · Edition = curated coverage.
          </span>
        </p>
      </div>

      {/* Matrice entité × fonction : Extract = diff jeu↔site, Édition = couverture curée */}
      <section className="border-line-subtle bg-surface-raised overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="text-content-subtle text-left text-xs uppercase">
            <tr className="border-line-subtle border-b">
              <th className="px-3 py-2 font-medium">Entity</th>
              <th className="px-3 py-2 text-center font-medium">Extract (game ↔ site)</th>
              <th className="px-3 py-2 text-center font-medium">Edition (curated)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-line-subtle hover:bg-surface-base border-t">
                <td className="text-content px-3 py-2">{r.label}</td>
                <ExtractCell href={r.extract.href} b={r.extract.b} />
                <EditionCell cover={r.edition} />
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Tools transverses */}
      <section className="space-y-2">
        <h2 className="text-content-strong text-sm font-semibold uppercase">Tools</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href={'/admin/tools/pros-cons' as Route}
            className="border-line bg-surface-raised hover:border-accent block rounded-lg border p-4"
          >
            <div className="text-content-strong font-medium">Pro / Con</div>
            <div className="text-content-subtle text-sm">
              {prosDone}/{chars.length} characters covered
            </div>
          </Link>
          <Link
            href={'/admin/tools/synergies' as Route}
            className="border-line bg-surface-raised hover:border-accent block rounded-lg border p-4"
          >
            <div className="text-content-strong font-medium">Synergy</div>
            <div className="text-content-subtle text-sm">
              {synDone}/{chars.length} persos couverts
            </div>
          </Link>
        </div>
      </section>

      {/* Assets (R2) */}
      <section className="space-y-2">
        <h2 className="text-content-strong text-sm font-semibold uppercase">Assets (R2)</h2>
        <div className="border-line-subtle bg-surface-raised rounded-lg border p-4 text-sm">
          {assets ? (
            <p className="text-content-muted">
              {assets.total} required by data ·{' '}
              {assets.missingCount > 0 ? (
                <span className="text-warn">{assets.missingCount} missing from pool</span>
              ) : (
                <span className="text-success">all collected</span>
              )}{' '}
              <span className="text-content-subtle">
                (collected on {new Date(assets.generatedAt).toLocaleDateString('fr-FR')})
              </span>
            </p>
          ) : (
            <p className="text-content-subtle">
              No report — run <code>pnpm assets:collect</code> then <code>pnpm assets:push</code>.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
