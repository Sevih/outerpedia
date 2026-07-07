/**
 * Générateur — source canonique des items (HORS équipement).
 *
 * UNE seule source pour les items « simples » (gem / material / present / box) :
 * nom + description localisés (4 langues), type/sous-type/grade normalisés,
 * étoiles, icône. Tout consommateur référence un item par son `id` et lit ici.
 *
 * L'ÉQUIPEMENT (IT_EQUIP) est une entité distincte, bien plus riche (stats,
 * pools d'options…) → générateur `equipment` à part.
 *
 * Entrées (tables du jeu) : ItemTemplet, TextItem.
 * Sortie : data/items.json (id → entité).  [PROPOSITION — forme à valider]
 */
import { loadTable, num } from '../lib/tables';
import { loadTextIndex, resolveText } from '../lib/text';
import { slugEnum } from '../lib/enums';
import type { LangDict } from '../lib/lang';

export interface Item {
  name: LangDict;
  desc?: LangDict; // présent seulement si l'item a une _DESC
  type: string; // dérivé de ItemType    (IT_GEM      → gem)
  subType: string; // dérivé de ItemSubType (ITS_GEM_ATK → gem_atk)
  grade: string; // dérivé de ItemGrade   (IG_NORMAL   → normal)
  star: number; // BasicStar
  icon: string; // IconName
  /** Réservé à UN perso (presents d'affinité dédiés — Veronica, Tio…). */
  characterLimit?: string;
}

/** Vrai si au moins une langue du dict est non vide. */
function hasText(d: LangDict): boolean {
  return d.en !== '' || d.jp !== '' || d.kr !== '' || d.zh !== '';
}

export function buildItems(): Record<string, Item> {
  const rows = loadTable('ItemTemplet');
  const text = loadTextIndex('TextItem');

  const out: Record<string, Item> = {};
  for (const r of rows) {
    const id = r.ID;
    if (!id) continue;
    if (r.ItemType === 'IT_EQUIP') continue; // l'équipement est une entité à part

    const item: Item = {
      name: resolveText(text, r.NameID),
      type: slugEnum(r.ItemType),
      subType: slugEnum(r.ItemSubType),
      grade: slugEnum(r.ItemGrade),
      star: num(r.BasicStar),
      icon: r.IconName ?? '',
    };
    if (r.CharacterLimit) item.characterLimit = r.CharacterLimit;

    // description : convention de clé `_NAME` → `_DESC`, ajoutée seulement si elle existe
    const descKey = r.NameID?.replace(/_NAME$/, '_DESC');
    const desc = descKey ? resolveText(text, descKey) : null;
    if (desc && hasText(desc)) item.desc = desc;

    out[id] = item;
  }

  // tri par id numérique pour un fichier stable et lisible
  const sorted = Object.entries(out).sort(([a], [b]) => num(a) - num(b) || a.localeCompare(b));
  return Object.fromEntries(sorted);
}

// Exécution directe : écrit un échantillon en staging (hors git) pour revue.
if (process.argv[1] && process.argv[1].endsWith('items.ts')) {
  const items = buildItems();
  const ids = Object.keys(items);
  console.log(`items: ${ids.length}`);
  const pick = (pred: (it: Item) => boolean) => {
    const id = ids.find((i) => pred(items[i]));
    return id ? { id, ...items[id] } : null;
  };
  const byType: Record<string, number> = {};
  for (const i of ids) byType[items[i].type] = (byType[items[i].type] ?? 0) + 1;
  console.log('par type:', JSON.stringify(byType));
  console.log('avec desc:', ids.filter((i) => items[i].desc).length);
  console.log('\n— échantillons —');
  console.log(
    JSON.stringify(
      pick((it) => it.type === 'material' && !!it.desc),
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify(
      pick((it) => it.type === 'gem'),
      null,
      2,
    ),
  );
}
