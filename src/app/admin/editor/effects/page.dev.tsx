import { getMergedEffects, liveEffectSources, type MergedEffect } from '@/lib/data/effects';
import { EffectsCatalog, type EffectRow } from '@/components/admin/EffectsCatalog';
import { effectKeysById, pairEffects } from '@/lib/admin/effect-catalog';
import { effectHaystack } from '@/lib/admin/effect-search';

export const dynamic = 'force-dynamic';

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

  // Appariement et tri : la règle de `effect-catalog`, partagée avec quick.
  const { pairs, orphanBuffs, orphanDebuffs } = pairEffects(effects);

  // Le serveur lit et range ; la recherche (au fil de la frappe) et les
  // compteurs de ce qui reste affiché sont au composant client.
  const keys = effectKeysById(liveEffectSources());
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
