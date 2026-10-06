'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { NewEffectForm } from '@/components/admin/NewEffectForm';
import { EffectIconTile } from '@/components/character/EffectChips';
import { filterEffectCatalog, type EffectCatalog } from '@/lib/admin/effect-search';
import { input } from './_ui';

/** Une ligne du catalogue, préparée par le serveur (il lit les fichiers). */
export interface EffectRow {
  id: string;
  /** Nom anglais — celui que la liste affiche. */
  name: string;
  icon: string;
  isDebuff: boolean;
  origin: 'tooltip' | 'type' | 'curated';
  iconEditorial: boolean;
  irremovable: boolean;
  tag?: string;
  overridden: boolean;
  hidden: boolean;
  /** Champs cherchables normalisés (`effectHaystack`) : id, clés, noms. */
  haystack: string;
}

/** Une cellule du catalogue : icône, nom (lien éditeur), badges d'état. */
function EffectCell({ e }: { e?: EffectRow }) {
  if (!e) return <td className="px-3 py-1.5" />;
  return (
    <td className="px-3 py-1.5">
      <div className="flex items-center gap-2">
        {e.icon && <EffectIconTile icon={e.icon} isDebuff={e.isDebuff} />}
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-1.5">
            <Link
              href={`/admin/editor/effects/${encodeURIComponent(e.id)}` as Route}
              className="text-content-strong hover:text-accent font-medium"
            >
              {e.name || <span className="text-danger italic">no name</span>}
            </Link>
            {e.irremovable && <span className="text-warn text-2xs uppercase">irremovable</span>}
          </div>
          <div className="text-content-subtle text-xs">
            <span className="font-mono">{e.id}</span>
            <span> · {e.origin}</span>
            {e.icon ? (
              e.iconEditorial ? (
                <span className="text-warn"> · wiki</span>
              ) : (
                <span className="text-success"> · game</span>
              )
            ) : (
              <span className="text-danger"> · no icon</span>
            )}
            {e.tag ? ` · ${e.tag}` : ''}
            {e.overridden && e.origin !== 'curated' ? ' · curated' : ''}
            {e.hidden ? ' · hidden' : ''}
          </div>
        </div>
      </div>
    </td>
  );
}

/**
 * Catalogue des effets : en-tête (compteurs, filtre « sans description »),
 * recherche au fil de la frappe, tableau buff ↔ debuff. Le serveur fournit le
 * catalogue déjà apparié et trié ; ici on ne fait que le filtrer.
 */
export function EffectsCatalog({
  catalog,
  noDescOnly,
  noDescCount,
}: {
  catalog: EffectCatalog<EffectRow>;
  /** `?filter=no-desc` est actif — le catalogue reçu est déjà restreint. */
  noDescOnly: boolean;
  /** Effets sans description, tous filtres confondus (libellé du lien). */
  noDescCount: number;
}) {
  const [q, setQ] = useState('');

  const { pairs, orphanBuffs, orphanDebuffs } = useMemo(
    () => filterEffectCatalog(catalog, q),
    [catalog, q],
  );
  // Les compteurs disent ce qui est AFFICHÉ : le miroir d'une paire gardée par
  // son autre membre compte aussi.
  const effects = useMemo(
    () => [...pairs.flatMap((p) => [p.buff, p.debuff]), ...orphanBuffs, ...orphanDebuffs],
    [pairs, orphanBuffs, orphanDebuffs],
  );
  const curated = effects.filter((e) => e.overridden).length;
  const noName = effects.filter((e) => !e.name).length;
  const orphanRows = Math.max(orphanBuffs.length, orphanDebuffs.length);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-content-strong text-xl font-semibold">Editor · Effect</h1>
          <p className="text-content-muted text-sm">
            {effects.length} effects ({effects.filter((e) => e.origin === 'tooltip').length}{' '}
            statuses + {effects.filter((e) => e.origin === 'type').length} mechanics +{' '}
            {effects.filter((e) => e.origin === 'curated').length} creations) · {curated} curated
            {noName ? ` · ${noName} no name` : ''}
            {' · '}
            <Link
              href={
                (noDescOnly
                  ? '/admin/editor/effects'
                  : '/admin/editor/effects?filter=no-desc') as Route
              }
              className={noDescOnly ? 'text-accent underline' : 'text-warn hover:underline'}
            >
              {noDescCount} no description{noDescOnly ? ' (filtered — show all)' : ''}
            </Link>
            {' · '}
            <Link
              href={'/admin/extractor/effects' as Route}
              className="text-content-subtle hover:underline"
            >
              regression control (Extractor) →
            </Link>
          </p>
        </div>
        <NewEffectForm basePath="/admin/editor/effects" />
      </div>

      <input
        type="search"
        className={`${input} text-content w-full sm:w-80`}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Name (any language), id or key (BT_…)…"
        aria-label="Search effects"
      />

      {/* Catalogue : paires buff ↔ debuff (miroirs), puis orphelins alphabétiques */}
      <section className="border-line-subtle bg-surface-raised overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="text-content-subtle text-left text-xs uppercase">
            <tr className="border-line-subtle border-b">
              <th className="text-success w-1/2 px-3 py-2 font-medium">Buff</th>
              <th className="text-danger w-1/2 px-3 py-2 font-medium">Debuff</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map(({ buff, debuff }) => (
              <tr key={buff.id} className="border-line-subtle hover:bg-surface-base border-t">
                <EffectCell e={buff} />
                <EffectCell e={debuff} />
              </tr>
            ))}
            <tr className="border-line-subtle border-t">
              <td
                colSpan={2}
                className="text-content-subtle bg-surface-base px-3 py-1.5 text-xs font-semibold uppercase"
              >
                No mirror ({orphanBuffs.length + orphanDebuffs.length})
              </td>
            </tr>
            {Array.from({ length: orphanRows }, (_, i) => (
              <tr
                key={orphanBuffs[i]?.id ?? orphanDebuffs[i]?.id ?? i}
                className="border-line-subtle hover:bg-surface-base border-t"
              >
                <EffectCell e={orphanBuffs[i]} />
                <EffectCell e={orphanDebuffs[i]} />
              </tr>
            ))}
            {effects.length === 0 && (
              <tr className="border-line-subtle border-t">
                <td colSpan={2} className="text-content-subtle px-3 py-2 text-xs">
                  No matching effect.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
