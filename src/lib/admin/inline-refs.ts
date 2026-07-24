/**
 * Données d'AUTOCOMPLÉTION des tags inline `{X/…}` pour l'éditeur assisté
 * (`InlineTextField`) — réservé à l'ADMIN. Construit côté SERVEUR (accès disque
 * via les data layers) puis passé au composant client : la liste des refs
 * résolvables par type de tag, chaque entrée = { value (à insérer, clé EN),
 * label (affichage) }.
 *
 * La VALIDATION et l'APERÇU fidèle restent côté serveur (`checkText`/`parseText`
 * via la server action `renderInlinePreview`) ; ici on ne sert que la saisie assistée.
 */
import type { Glossaries } from '@contracts';
import { loadDataJson } from '@/lib/data/disk';
import { getMergedEffect, curatedKeyIndex } from '@/lib/data/effects';
import { getAllCharacters, characterDisplayName } from '@/lib/data/characters';
import {
  getAmuletFamilies,
  getSetViews,
  getTalismanFamilies,
  getWeaponFamilies,
} from '@/lib/data/equipment';
import { listGuides } from '@/lib/data/guides';
import { STAT_ICON } from '@/lib/stats';
import { ELEMENT_ORDER } from '@/lib/images';

/** Une référence proposable : `value` = ce qu'on insère dans le tag, `label` = affichage. */
export interface RefItem {
  value: string;
  label: string;
}

/** Listes d'autocomplétion par nature de référence (clés EN du contenu). */
export interface InlineRefs {
  effectBuff: RefItem[];
  effectDebuff: RefItem[];
  stat: RefItem[];
  element: RefItem[];
  klass: RefItem[];
  character: RefItem[];
  characterEE: RefItem[];
  weapon: RefItem[];
  amulet: RefItem[];
  talisman: RefItem[];
  set: RefItem[];
  item: RefItem[];
  /** Cibles de lien guide — `value` = `Titre|/guides/cat/slug`. */
  guide: RefItem[];
}

const byLabel = (a: RefItem, b: RefItem) => a.label.localeCompare(b.label);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Dédoublonne par `value` (le tag inséré) : deux persos au même nom EN (modèle
 *  base/skin) ne doivent proposer qu'UNE entrée d'autocomplétion (sinon clés
 *  React dupliquées côté `InlineTextField`, keyé par `value`). */
const dedupeByValue = (list: RefItem[]): RefItem[] => {
  const seen = new Set<string>();
  return list.filter((r) => (seen.has(r.value) ? false : (seen.add(r.value), true)));
};

/** Clés éditoriales d'effet d'un côté (glossaire `effectByKey` + créations curées).
 *  Un même effet a souvent PLUSIEURS clés (variantes, jumeau `_IR`…) au rendu
 *  STRICTEMENT identique (nom + icône + description) : le picker n'en propose
 *  qu'UNE — la clé la plus courte (la base, pas le jumeau). Deux effets homonymes
 *  à description DIFFÉRENTE restent distincts (ce sont de vrais effets séparés). */
function effectRefs(side: 'buff' | 'debuff'): RefItem[] {
  const G = loadDataJson<Glossaries>('generated/glossaries.json');
  const bySig = new Map<string, { key: string; label: string }>();
  const consider = (key: string, id: string) => {
    const eff = getMergedEffect(id);
    const label = eff?.name.en || key;
    const sig = `${label}␟${eff?.icon ?? ''}␟${eff?.desc?.en ?? ''}`;
    const prev = bySig.get(sig);
    // À apparence égale, on garde la clé la plus courte (puis la plus petite) —
    // choix déterministe qui fait ressortir la base (`BT_X`) plutôt que `BT_X_IR`.
    if (!prev || key.length < prev.key.length || (key.length === prev.key.length && key < prev.key))
      bySig.set(sig, { key, label });
  };
  for (const [key, id] of Object.entries(G.effectByKey[side] ?? {})) consider(key, id);
  // Créations curées adressées par `keys` (mécaniques sans texte de jeu).
  for (const [sk, id] of curatedKeyIndex().bySideKey) {
    const sep = sk.indexOf('|');
    if (sk.slice(0, sep) !== side) continue;
    consider(sk.slice(sep + 1), id);
  }
  return [...bySig.values()].map((e) => ({ value: e.key, label: e.label })).sort(byLabel);
}

/** Toutes les listes d'autocomplétion (clés EN). Server-only. */
export function buildInlineRefs(): InlineRefs {
  const chars = getAllCharacters();
  // `value` = NOM D'AFFICHAGE EN (préfixe compris : « Core Fusion … », surnoms)
  // — c'est la clé indexée par `findCharacterByName`, donc le SEUL nom que le
  // tag `{P/…}`/`{SK/…}` sait résoudre. Lister le nom nu (`c.name.en`) rendait
  // les persos à nom composé introuvables au picker ET fondait les fusions/skins
  // sous le nom de base (dédup par `value`).
  const named = (c: (typeof chars)[number]) => {
    const name = characterDisplayName(c, 'en');
    return { value: name, label: name };
  };
  const character = dedupeByValue(chars.map(named).sort(byLabel));
  const characterEE = dedupeByValue(
    chars
      .filter((c) => c.ee)
      .map(named)
      .sort(byLabel),
  );

  const klass = [...new Set(chars.map((c) => c.class))]
    .map((k) => ({ value: cap(k), label: cap(k) }))
    .sort(byLabel);

  const famRefs = (fams: { name: { en: string } }[]): RefItem[] =>
    fams.map((f) => ({ value: f.name.en, label: f.name.en })).sort(byLabel);

  const items =
    loadDataJson<Record<string, { name?: { en?: string }; hidden?: boolean }>>(
      'generated/items.json',
    );
  const item: RefItem[] = [];
  const itemSeen = new Set<string>();
  for (const e of Object.values(items)) {
    const name = e.name?.en?.trim();
    if (!name || e.hidden || itemSeen.has(name.toLowerCase())) continue;
    itemSeen.add(name.toLowerCase());
    item.push({ value: name, label: name });
  }
  item.sort(byLabel);

  const guide = listGuides()
    .map((g) => {
      const label = g.title.en;
      return { value: `${label}|/guides/${g.category}/${g.slug}`, label };
    })
    .sort(byLabel);

  return {
    effectBuff: effectRefs('buff'),
    effectDebuff: effectRefs('debuff'),
    stat: Object.keys(STAT_ICON).map((s) => ({ value: s, label: s })),
    element: ELEMENT_ORDER.map((e) => ({ value: cap(e), label: cap(e) })),
    klass,
    character,
    characterEE,
    weapon: famRefs(getWeaponFamilies()),
    amulet: famRefs(getAmuletFamilies()),
    talisman: famRefs(getTalismanFamilies()),
    set: getSetViews('en')
      .map((s) => ({ value: s.name.en, label: s.name.en }))
      .sort(byLabel),
    item,
    guide,
  };
}
