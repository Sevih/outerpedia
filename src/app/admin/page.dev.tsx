import Link from 'next/link';
import type { Route } from 'next';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getCharacterListItems } from '@/lib/data/characters';
import { loadCuratedCharacters } from '@/lib/data/curated';
import { getMergedEffects, v2MissingInV3 } from '@/lib/data/effects';
import { reviewTarget, reviewTotals } from '@/lib/admin/review-store';
import { equipmentV2Control } from '@/lib/admin/equipment-control';

// Accueil = tableau de bord, extraction fraîche, jamais prérendu.
export const dynamic = 'force-dynamic';

type Cell = { href: string; count: number; tone: 'warn' | 'danger' } | null;

/** Une case de la matrice : compteur « à traiter » (✓ si 0), ou « — » si N/A. */
function MatrixCell({ cell }: { cell: Cell }) {
  if (!cell) return <td className="text-content-subtle px-3 py-2 text-center">—</td>;
  return (
    <td className="px-3 py-2 text-center">
      <Link href={cell.href as Route} className="inline-flex items-center gap-1 hover:underline">
        {cell.count === 0 ? (
          <span className="text-success">✓</span>
        ) : (
          <span
            className={`${cell.tone === 'danger' ? 'text-danger' : 'text-warn'} font-medium tabular-nums`}
          >
            {cell.count}
          </span>
        )}
      </Link>
    </td>
  );
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

  // Extractor = écarts vs oracle V2. Editor = à compléter (couverture curée).
  const charReview = reviewTotals(reviewTarget('character').diff);
  const charUncurated = chars.filter(
    (c) => !(curated[c.id] && Object.keys(curated[c.id]).length),
  ).length;
  const effRegress = v2MissingInV3().length;
  const effNoDesc = getMergedEffects().filter((e) => !e.desc.en).length;
  const gear = Object.fromEntries(
    equipmentV2Control().map((r) => [r.name, r.issues.length + r.missingV3.length]),
  );
  const g = (k: string, href: string): Cell => ({ href, count: gear[k] ?? 0, tone: 'warn' });

  const rows: { label: string; extractor: Cell; editor: Cell }[] = [
    {
      label: 'Personnage',
      extractor: { href: '/admin/extractor/characters', count: charReview, tone: 'warn' },
      editor: { href: '/admin/editor/characters', count: charUncurated, tone: 'warn' },
    },
    {
      label: 'Effect',
      extractor: { href: '/admin/extractor/effects', count: effRegress, tone: 'danger' },
      editor: { href: '/admin/editor/effects', count: effNoDesc, tone: 'warn' },
    },
    { label: 'EE', extractor: g('ee', '/admin/extractor/ee'), editor: null },
    { label: 'Armes', extractor: g('weapons', '/admin/extractor/weapons'), editor: null },
    { label: 'Amulet', extractor: g('amulets', '/admin/extractor/amulets'), editor: null },
    { label: 'Armor', extractor: null, editor: null },
    { label: 'Talisman', extractor: g('talismans', '/admin/extractor/talismans'), editor: null },
    { label: 'Sets', extractor: g('sets', '/admin/extractor/sets'), editor: null },
    { label: 'Monstre', extractor: null, editor: null },
  ];

  const extractorPending = rows.reduce((n, r) => n + (r.extractor?.count ?? 0), 0);

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
          {extractorPending === 0 ? (
            <span className="text-success">✓ Extraction à jour partout.</span>
          ) : (
            <span className="text-warn">
              {extractorPending} écart(s) d&apos;extraction à traiter.
            </span>
          )}{' '}
          <span className="text-content-subtle">
            Extractor = écarts vs oracle V2 · Editor = à compléter.
          </span>
        </p>
      </div>

      {/* Matrice fonction × entité : reflet du menu, cases = à traiter */}
      <section className="border-line-subtle bg-surface-raised overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="text-content-subtle text-left text-xs uppercase">
            <tr className="border-line-subtle border-b">
              <th className="px-3 py-2 font-medium">Entité</th>
              <th className="px-3 py-2 text-center font-medium">Extractor</th>
              <th className="px-3 py-2 text-center font-medium">Editor</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-line-subtle hover:bg-surface-base border-t">
                <td className="text-content px-3 py-2">{r.label}</td>
                <MatrixCell cell={r.extractor} />
                <MatrixCell cell={r.editor} />
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
              {prosDone}/{chars.length} persos couverts
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
              {assets.total} requis par la donnée ·{' '}
              {assets.missingCount > 0 ? (
                <span className="text-warn">{assets.missingCount} manquant(s) au pool</span>
              ) : (
                <span className="text-success">tout est collecté</span>
              )}{' '}
              <span className="text-content-subtle">
                (collecte du {new Date(assets.generatedAt).toLocaleDateString('fr-FR')})
              </span>
            </p>
          ) : (
            <p className="text-content-subtle">
              Aucun rapport — lance <code>pnpm assets:collect</code> puis{' '}
              <code>pnpm assets:push</code>.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
