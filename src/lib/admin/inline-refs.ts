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
import { getAllCharacters } from '@/lib/data/characters';
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

/** Clés éditoriales d'effet d'un côté (glossaire `effectByKey` + créations curées). */
function effectRefs(side: 'buff' | 'debuff'): RefItem[] {
  const G = loadDataJson<Glossaries>('generated/glossaries.json');
  const out: RefItem[] = [];
  const seen = new Set<string>();
  const push = (key: string, id: string) => {
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ value: key, label: getMergedEffect(id)?.name.en || key });
  };
  for (const [key, id] of Object.entries(G.effectByKey[side] ?? {})) push(key, id);
  // Créations curées adressées par `keys` (mécaniques sans texte de jeu).
  for (const [sk, id] of curatedKeyIndex().bySideKey) {
    const sep = sk.indexOf('|');
    if (sk.slice(0, sep) !== side) continue;
    push(sk.slice(sep + 1), id);
  }
  return out.sort(byLabel);
}

/** Toutes les listes d'autocomplétion (clés EN). Server-only. */
export function buildInlineRefs(): InlineRefs {
  const chars = getAllCharacters();
  const character = chars.map((c) => ({ value: c.name.en, label: c.name.en })).sort(byLabel);
  const characterEE = chars
    .filter((c) => c.ee)
    .map((c) => ({ value: c.name.en, label: c.name.en }))
    .sort(byLabel);

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
