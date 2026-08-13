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
import { curatedKeyIndex, resolveEffectKey } from '@/lib/data/effects';
import { getAllCharacters, characterDisplayName } from '@/lib/data/characters';
import {
  gearDisplayNames,
  getAmuletFamilies,
  getSetViews,
  getTalismanFamilies,
  getWeaponFamilies,
  type GearFamily,
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

/** Apparence d'un effet, réduite à ce qui distingue deux entrées du picker. */
interface EffectLook {
  name?: { en?: string };
  icon?: string;
  desc?: { en?: string };
}

/**
 * Cœur PUR du picker d'effets : une entrée par APPARENCE distincte.
 *
 * Un même effet a souvent plusieurs clés (variantes, jumeau `_IR`…) au rendu
 * strictement identique (nom + icône + description) : on n'en propose qu'UNE, la
 * plus courte (la base `BT_X`, pas `BT_X_IR`). Deux effets homonymes à
 * description DIFFÉRENTE restent distincts — ce sont de vrais effets séparés.
 *
 * ⚠ ON ITÈRE LES CLÉS, PAS LES IDS, et l'étiquette vient de ce que la clé
 * RÉSOUT. C'est ce qui garantit l'unicité de `value`, dont dépendent les clés
 * React d'`InlineTextField`. La version précédente parcourait les ids, or
 * PLUSIEURS ids peuvent réclamer la même clé : `BT_AP_CHARGE` est revendiquée par
 * le glossaire (des deux côtés) ET par trois effets curés. Chaque id apportant
 * son apparence, la dédup par signature les gardait tous — deux entrées, même
 * `value`, doublon de clé React à l'écran (constaté en dev le 26/07).
 * Étiqueter par `resolveEffectKey` corrige au passage un mensonge : le picker
 * montre désormais l'effet que le tag rendra vraiment, pas celui de l'id qui a
 * introduit la clé.
 */
export function effectRefsFromKeys(
  keys: Iterable<string>,
  resolve: (key: string) => EffectLook | undefined,
): RefItem[] {
  const bySig = new Map<string, { key: string; label: string }>();
  // Clés dédoublonnées ICI, et `resolve` appelé UNE fois par clé : c'est ce qui
  // rend l'unicité de `value` structurelle. Une clé vue deux fois pourrait sinon
  // gagner deux signatures et ressortir en double — le contrat ne doit pas
  // dépendre de la vigilance de l'appelant, c'est précisément ce qui a lâché.
  for (const key of new Set(keys)) {
    const eff = resolve(key);
    const label = eff?.name?.en || key;
    const sig = `${label}␟${eff?.icon ?? ''}␟${eff?.desc?.en ?? ''}`;
    const prev = bySig.get(sig);
    // À apparence égale, on garde la clé la plus courte (puis la plus petite) —
    // choix déterministe qui fait ressortir la base (`BT_X`) plutôt que `BT_X_IR`.
    if (!prev || key.length < prev.key.length || (key.length === prev.key.length && key < prev.key))
      bySig.set(sig, { key, label });
  }
  return [...bySig.values()].map((e) => ({ value: e.key, label: e.label })).sort(byLabel);
}

/** Clés éditoriales d'effet d'un côté : glossaire `effectByKey` + créations curées. */
function effectRefs(side: 'buff' | 'debuff'): RefItem[] {
  const G = loadDataJson<Glossaries>('generated/glossaries.json');
  const keys = new Set<string>(Object.keys(G.effectByKey?.[side] ?? {}));
  // Créations curées adressées par `keys` (mécaniques sans texte de jeu).
  for (const sk of curatedKeyIndex().bySideKey.keys()) {
    const sep = sk.indexOf('|');
    if (sk.slice(0, sep) === side) keys.add(sk.slice(sep + 1));
  }
  return effectRefsFromKeys(keys, (key) => resolveEffectKey(side, key));
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

  /**
   * UNE ENTRÉE PAR OBJET RÉEL, pas par famille. Briareos et Gorgon existent en
   * CINQ objets (un par classe : tuile, passif, mains et page détail
   * différents) ; n'en proposer qu'un rendait les quatre autres inatteignables
   * depuis l'éditeur, et le nom nu inséré affichait le striker à leur place.
   *
   * Le vocabulaire vient de `gearDisplayNames`, celui-là même que le résolveur
   * de tag indexe — le picker ne peut donc pas offrir ce que le rendu refuse.
   */
  const famRefs = (fams: GearFamily[]): RefItem[] =>
    fams
      .flatMap((f) => gearDisplayNames(f).map(({ name }) => ({ value: name.en, label: name.en })))
      .sort(byLabel);

  const items =
    loadDataJson<Record<string, { name?: { en?: string }; hidden?: boolean }>>(
      'generated/items.json',
    );
  const item: RefItem[] = [];
  const itemSeen = new Set<string>();
  for (const e of Object.values(items)) {
    const name = e.name?.en?.trim();
    // Un nom qui porte `{`, `}` ou `|` ne peut PAS voyager dans un tag : les
    // accolades ferment `{I-I/…}` et la barre est le séparateur de `{L/…}`.
    // Cas réel : « {0}'s Limit Break Factors », un gabarit du jeu dont le `{0}`
    // n'est jamais substitué. Proposé, il insérait un tag cassé — c'est-à-dire
    // que le picker offrait quelque chose que la validation refuse ensuite.
    if (!name || e.hidden || /[{}|]/.test(name) || itemSeen.has(name.toLowerCase())) continue;
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
