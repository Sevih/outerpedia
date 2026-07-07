import Link from 'next/link';
import type { Route } from 'next';
import { getMergedEffects, v2MissingInV3, type MergedEffect } from '@/lib/data/effects';
import { NewEffectForm } from '@/components/admin/NewEffectForm';
import { EffectIconTile } from '@/components/character/EffectChips';

export const dynamic = 'force-dynamic';

/**
 * Appariement buff ↔ debuff : même concept aux mots de DIRECTION près
 * (« Increased Defense » ↔ « Reduced Defense »). Les variantes irremovable
 * s'apparient entre elles (clé distincte).
 */
function pairKey(e: MergedEffect): string {
  const base = (e.name.en ?? '')
    .toLowerCase()
    .replace(
      /\b(increased|increases|increase|reduced|reduces|reduce|decreased|decrease|reduction)\b/g,
      ' ',
    )
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  return base ? `${base}${e.irremovable ? '|irr' : ''}` : '';
}

/** Une cellule du catalogue : icône, nom (lien éditeur), badges d'état. */
function EffectCell({ e }: { e?: MergedEffect }) {
  if (!e) return <td className="px-3 py-1.5" />;
  return (
    <td className="px-3 py-1.5">
      <div className="flex items-center gap-2">
        {e.icon && <EffectIconTile icon={e.icon} isDebuff={e.isDebuff} />}
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-1.5">
            <Link
              href={`/admin/effects/${encodeURIComponent(e.id)}` as Route}
              className="text-content-strong hover:text-accent font-medium"
            >
              {e.name.en || <span className="text-danger italic">sans nom</span>}
            </Link>
            {e.irremovable && <span className="text-warn text-[10px] uppercase">irremovable</span>}
          </div>
          <div className="text-content-subtle text-xs">
            <span className="font-mono">{e.id}</span>
            <span> · {e.origin}</span>
            {e.icon ? (
              e.iconEditorial ? (
                <span className="text-warn"> · wiki</span>
              ) : (
                <span className="text-success"> · jeu</span>
              )
            ) : (
              <span className="text-danger"> · sans icône</span>
            )}
            {e.tag ? ` · ${e.tag}` : ''}
            {e.overridden && e.origin !== 'curated' ? ' · curé' : ''}
            {e.hidden ? ' · masqué' : ''}
          </div>
        </div>
      </div>
    </td>
  );
}

/** Index effets = catalogue apparié buff/debuff + tableau de bord anti-régression. */
export default async function AdminEffectsIndex({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string }>;
}) {
  const all = getMergedEffects();
  const noDescOnly = (await searchParams)?.filter === 'no-desc';
  const noDescCount = all.filter((e) => !e.desc.en).length;
  // Filtre « sans description » : n'affiche que les effets à documenter.
  const effects = noDescOnly ? all.filter((e) => !e.desc.en) : all;
  const missing = v2MissingInV3();
  const curated = effects.filter((e) => e.overridden).length;
  const noName = effects.filter((e) => !e.name.en).length;

  // Appariement : par clé normalisée, on zippe buffs et debuffs ; l'excédent
  // (et les clés à un seul côté) part dans les orphelins.
  const byKey = new Map<string, { buffs: MergedEffect[]; debuffs: MergedEffect[] }>();
  const unnamed: MergedEffect[] = [];
  for (const e of effects) {
    const key = pairKey(e);
    if (!key) {
      unnamed.push(e);
      continue;
    }
    const slot = byKey.get(key) ?? { buffs: [], debuffs: [] };
    (e.isDebuff ? slot.debuffs : slot.buffs).push(e);
    byKey.set(key, slot);
  }

  const pairs: { buff: MergedEffect; debuff: MergedEffect }[] = [];
  const orphanBuffs: MergedEffect[] = [];
  const orphanDebuffs: MergedEffect[] = [];
  for (const { buffs, debuffs } of byKey.values()) {
    const n = Math.min(buffs.length, debuffs.length);
    for (let i = 0; i < n; i++) pairs.push({ buff: buffs[i], debuff: debuffs[i] });
    orphanBuffs.push(...buffs.slice(n));
    orphanDebuffs.push(...debuffs.slice(n));
  }

  const alpha = (a: MergedEffect, b: MergedEffect) =>
    (a.name.en || '').localeCompare(b.name.en || '') ||
    Number(a.irremovable) - Number(b.irremovable);
  pairs.sort((a, b) => alpha(a.buff, b.buff));
  orphanBuffs.sort(alpha);
  orphanDebuffs.sort(alpha);
  // Sans nom : en queue de liste (à nommer/curer).
  orphanBuffs.push(...unnamed.filter((e) => !e.isDebuff));
  orphanDebuffs.push(...unnamed.filter((e) => e.isDebuff));

  const orphanRows = Math.max(orphanBuffs.length, orphanDebuffs.length);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-content-strong text-xl font-semibold">Effets</h1>
          <p className="text-content-muted text-sm">
            {effects.length} effets ({effects.filter((e) => e.origin === 'tooltip').length} statuts
            + {effects.filter((e) => e.origin === 'type').length} mécaniques +{' '}
            {effects.filter((e) => e.origin === 'curated').length} créations) · {curated} curés
            {noName ? ` · ${noName} sans nom` : ''}
            {' · '}
            <Link
              href={(noDescOnly ? '/admin/effects' : '/admin/effects?filter=no-desc') as Route}
              className={noDescOnly ? 'text-accent underline' : 'text-warn hover:underline'}
            >
              {noDescCount} sans description{noDescOnly ? ' (filtré — tout voir)' : ''}
            </Link>
          </p>
        </div>
        <NewEffectForm />
      </div>

      {missing.length === 0 ? (
        <p className="border-success/40 bg-success/5 text-success rounded-lg border p-4 text-sm">
          ✓ Aucune régression : tous les libellés V2 ont un équivalent V3.
        </p>
      ) : (
        <section className="border-danger/40 bg-danger/5 space-y-2 rounded-lg border p-4">
          <p className="text-danger text-sm font-semibold uppercase">
            Régression : {missing.length} effet(s) V2 sans équivalent V3
          </p>
          <p className="text-content-muted text-xs">
            Chaque ligne = un concept V2 introuvable dans les noms V3 (curé inclus). À combler par
            extraction (si la donnée de jeu l&apos;a) ou par curation (renommer un effet V3
            équivalent, ou créer l&apos;exception).
          </p>
          <table className="w-full text-sm">
            <thead className="text-content-subtle text-left text-xs uppercase">
              <tr>
                <th className="py-1 pr-3 font-medium">Libellé V2</th>
                <th className="py-1 pr-3 font-medium">Catégorie</th>
                <th className="py-1 pr-3 font-medium">Clé interne (name)</th>
                <th className="py-1 font-medium">Icône</th>
              </tr>
            </thead>
            <tbody>
              {missing.map((m, i) => (
                <tr key={i} className="border-line-subtle border-t">
                  <td className="text-content-strong py-1 pr-3">{m.label}</td>
                  <td className="text-content-muted py-1 pr-3">{m.category ?? '—'}</td>
                  <td className="text-content-subtle py-1 pr-3 font-mono text-xs">
                    {m.name ?? '—'}
                  </td>
                  <td className="text-content-subtle py-1 font-mono text-xs">{m.icon ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

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
                Sans miroir ({orphanBuffs.length + orphanDebuffs.length})
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
          </tbody>
        </table>
      </section>
    </div>
  );
}
