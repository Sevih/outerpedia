/**
 * Le catalogue des effets tel que l'éditeur le RANGE : paires buff ↔ debuff
 * miroir, puis orphelins — la règle de `/admin/editor/effects`, descendue de sa
 * page pour que l'onglet « Effets » de quick range pareil.
 *
 * Fichier PUR : il ne lit rien, ses appelants lui passent les effets fusionnés
 * (`getMergedEffects`) et les sources (`liveEffectSources`). Les imports de la
 * couche de données ne sont que des TYPES — `NewEffectForm`, composant client,
 * importe d'ici la règle de l'id.
 */
import type { EffectCatalog } from '@/lib/admin/effect-search';
import type { EffectSources, MergedEffect } from '@/lib/data/effects';

/**
 * Appariement buff ↔ debuff : même concept aux mots de DIRECTION près
 * (« Increased Defense » ↔ « Reduced Defense »). Les variantes irremovable
 * s'apparient entre elles (clé distincte). Sans nom anglais : pas de clé.
 */
export function effectPairKey(e: Pick<MergedEffect, 'name' | 'irremovable'>): string {
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
 * Range des effets en catalogue : par clé d'appariement, on zippe buffs et
 * debuffs ; l'excédent (et les clés à un seul côté) part dans les orphelins.
 * Paires et orphelins par nom anglais, l'irremovable après sa version normale ;
 * les effets sans nom ferment leur colonne (à nommer, à curer).
 */
export function pairEffects<T extends MergedEffect>(effects: readonly T[]): EffectCatalog<T> {
  const byKey = new Map<string, { buffs: T[]; debuffs: T[] }>();
  const unnamed: T[] = [];
  for (const e of effects) {
    const key = effectPairKey(e);
    if (!key) {
      unnamed.push(e);
      continue;
    }
    const slot = byKey.get(key) ?? { buffs: [], debuffs: [] };
    (e.isDebuff ? slot.debuffs : slot.buffs).push(e);
    byKey.set(key, slot);
  }

  const pairs: { buff: T; debuff: T }[] = [];
  const orphanBuffs: T[] = [];
  const orphanDebuffs: T[] = [];
  for (const { buffs, debuffs } of byKey.values()) {
    const n = Math.min(buffs.length, debuffs.length);
    for (let i = 0; i < n; i++) pairs.push({ buff: buffs[i], debuff: debuffs[i] });
    orphanBuffs.push(...buffs.slice(n));
    orphanDebuffs.push(...debuffs.slice(n));
  }

  const alpha = (a: T, b: T) =>
    (a.name.en || '').localeCompare(b.name.en || '') ||
    Number(a.irremovable) - Number(b.irremovable);
  pairs.sort((a, b) => alpha(a.buff, b.buff));
  orphanBuffs.sort(alpha);
  orphanDebuffs.sort(alpha);
  orphanBuffs.push(...unnamed.filter((e) => !e.isDebuff));
  orphanDebuffs.push(...unnamed.filter((e) => e.isDebuff));
  return { pairs, orphanBuffs, orphanDebuffs };
}

/**
 * Clés éditoriales par id d'effet : l'index généré (`BT_*`, les deux côtés)
 * puis les `keys` curées. `MergedEffect` ne les porte pas — la recherche si.
 */
export function effectKeysById(
  src: Pick<EffectSources, 'byKey' | 'curated'>,
): Map<string, Set<string>> {
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

/**
 * L'id d'un effet CRÉÉ, d'après ce qui est tapé : en capitales, les blancs en
 * `_` (conseillé : la clé éditoriale principale, `UNCOUNTERABLE`). Vide si
 * rien n'est tapé.
 */
export function newEffectId(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '_');
}
