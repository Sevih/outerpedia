import { getMergedEffects, liveEffectSources, type MergedEffect } from '@/lib/data/effects';
import { EffectsCatalog, type EffectRow } from '@/components/admin/EffectsCatalog';
import { effectHaystack } from '@/lib/admin/effect-search';

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

/**
 * Clés éditoriales par id d'effet : l'index généré (`BT_*`, les deux côtés)
 * puis les `keys` curées. `MergedEffect` ne les porte pas — la recherche si.
 */
function keysByEffect(): Map<string, Set<string>> {
  const src = liveEffectSources();
  const out = new Map<string, Set<string>>();
  const add = (id: string, key: string) => {
    const set = out.get(id) ?? new Set<string>();
    set.add(key);
    out.set(id, set);
  };
  for (const side of Object.values(src.byKey)) {
    for (const [key, id] of Object.entries(side)) add(id, key);
  }
  for (const [id, c] of Object.entries(src.curated)) {
    for (const key of c.keys ?? []) add(id, key);
  }
  return out;
}

/** Ligne du catalogue : ce que le composant client affiche et cherche. */
function toRow(e: MergedEffect, keys: Map<string, Set<string>>): EffectRow {
  return {
    id: e.id,
    name: e.name.en ?? '',
    icon: e.icon,
    isDebuff: e.isDebuff,
    origin: e.origin,
    iconEditorial: e.iconEditorial,
    irremovable: e.irremovable,
    tag: e.tag,
    overridden: e.overridden,
    hidden: e.hidden,
    haystack: effectHaystack({ id: e.id, keys: [...(keys.get(e.id) ?? [])], name: e.name }),
  };
}

/** Catalogue éditorial des effets : appariement buff/debuff + création/curation. */
export default async function EditorEffectsCatalog({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string }>;
}) {
  const all = getMergedEffects();
  const noDescOnly = (await searchParams)?.filter === 'no-desc';
  const noDescCount = all.filter((e) => !e.desc.en).length;
  // Filtre « sans description » : n'affiche que les effets à documenter.
  const effects = noDescOnly ? all.filter((e) => !e.desc.en) : all;

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

  // Le serveur lit et range ; la recherche (au fil de la frappe) et les
  // compteurs de ce qui reste affiché sont au composant client.
  const keys = keysByEffect();
  const row = (e: MergedEffect) => toRow(e, keys);

  return (
    <EffectsCatalog
      catalog={{
        pairs: pairs.map(({ buff, debuff }) => ({ buff: row(buff), debuff: row(debuff) })),
        orphanBuffs: orphanBuffs.map(row),
        orphanDebuffs: orphanDebuffs.map(row),
      }}
      noDescOnly={noDescOnly}
      noDescCount={noDescCount}
    />
  );
}
