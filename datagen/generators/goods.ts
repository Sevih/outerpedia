/**
 * Générateur — MONNAIES / ressources (« goods »).
 *
 * La plupart des monnaies (Gold, Free Ether, tickets…) n'ont PAS de ligne item :
 * elles vivent dans `TextSystem` sous des clés `SYS_ASSET_*` (auto) ; les rares
 * hors convention (Stamina…) sont listées dans `EXTRA_GOODS`. On résout leur
 * icône par deux voies, du plus fiable au plus faible :
 *   1. la ligne `ItemTemplet` de même NameID, si elle existe (icône + grade
 *      garantis — ex. Ether = SYS_ASSET_CRISTAL → TI_Item_Cristal) ;
 *   2. sinon la CONVENTION `SYS_ASSET_<X>` → `TI_Item_<TitleCase(X)>`, mais
 *      seulement si le fichier existe VRAIMENT dans les assets extraits
 *      (`.gamedata/extracted/…`) — donc jamais d'icône fantôme.
 * Sans correspondance, l'icône reste vide (rendue 🪙 côté admin).
 *
 * NB : une icône n'est SERVIE en dev qu'une fois collectée (`pnpm assets:collect`),
 * comme tous les autres assets.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadTable } from '../lib/tables';
import { hasText, langDict } from '../lib/text';
import type { LangDict } from '../lib/lang';
import { slugEnum } from '../lib/enums';

export interface Goods {
  name: LangDict;
  desc?: LangDict;
  icon: string;
  grade: string;
}

const NON_ASSET = /(TOOLTIP|TITLE|DESC|POPUP|BTN|GUIDE|NOTICE|MSG|CHANGE)/;

const SPRITE_DIR = resolve(
  process.cwd(),
  '.gamedata/extracted/images/assets/editor/resources/sprite/at_thumbnailitemruntime',
);

let iconIndex: Map<string, string> | null = null;
/** minuscule → vrai nom de fichier d'icône (sans extension). */
function icons(): Map<string, string> {
  if (iconIndex) return iconIndex;
  const m = new Map<string, string>();
  try {
    for (const f of readdirSync(SPRITE_DIR)) {
      if (!f.toLowerCase().endsWith('.png')) continue;
      const n = f.replace(/\.png$/i, '');
      m.set(n.toLowerCase(), n);
    }
  } catch {
    /* assets pas encore extraits */
  }
  iconIndex = m;
  return m;
}

/** Convention `<REST>` → `TI_Item_<TitleCase(REST)>`, vérifiée contre les assets réels. */
function conventionIcon(part: string): string {
  const set = icons();
  const rest = part
    .split('_')
    .map((w) => (w ? w[0] + w.slice(1).toLowerCase() : w))
    .join('_');
  const cands = [
    rest,
    rest.replace(/_(\d+)$/, (_m, d: string) => '_' + d.padStart(2, '0')),
    rest.replace(/_0*(\d+)$/, '_$1'),
  ];
  for (const c of cands) {
    const hit = set.get(`ti_item_${c.toLowerCase()}`);
    if (hit) return hit;
  }
  return '';
}

export function buildGoods(): Record<string, Goods> {
  const textRows = loadTable('TextSystem');
  const textById = new Map(textRows.map((r) => [r.ID, r]));

  // Icône/grade/DescID des monnaies qui possèdent une ligne item (par NameID).
  const backed = new Map<string, { icon: string; grade: string; descId?: string }>();
  for (const r of loadTable('ItemTemplet')) {
    if (r.NameID?.startsWith('SYS_ASSET_') && r.IconName)
      backed.set(r.NameID, { icon: r.IconName, grade: slugEnum(r.ItemGrade), descId: r.DescID });
  }

  /** Construit une entrée goods : nom (ligne texte) + desc (1er candidat) + icône. */
  const make = (id: string, rest: string, descIds: (string | undefined)[]): Goods | null => {
    const r = textById.get(id);
    if (!r) return null;
    const b = backed.get(id);
    let desc: LangDict | undefined;
    for (const dc of descIds) {
      const dr = dc ? textById.get(dc) : undefined;
      if (dr) {
        const d = langDict(dr);
        if (hasText(d)) {
          desc = d;
          break;
        }
      }
    }
    const g: Goods = {
      name: langDict(r),
      icon: b?.icon ?? conventionIcon(rest),
      grade: b?.grade ?? 'normal',
    };
    if (desc) g.desc = desc;
    return g;
  };

  const out: Record<string, Goods> = {};

  // 1) Auto : toutes les clés SYS_ASSET_* (hors libellés d'UI).
  for (const r of textRows) {
    const id = r.ID;
    if (!id?.startsWith('SYS_ASSET_') || NON_ASSET.test(id)) continue;
    const en = (r.English ?? '').trim();
    if (!en) continue;
    // HEURISTIQUE « ceci est un NOM de monnaie, pas une phrase d'UI » : les
    // clés SYS_ASSET_* mélangent noms et textes d'interface que NON_ASSET ne
    // filtre pas tous. Un nom est court (≤ 40 car.), tient sur une ligne
    // (pas de \n) et ne se termine pas par un point (une phrase, si).
    // Les clés ADOSSÉES à une ligne item y échappent : l'évidence table prime
    // sur la forme du texte. Vérifié 2026-07-16 : l'heuristique n'écarte
    // aujourd'hui AUCUNE clé réelle — garde-fou purement prophylactique.
    if (!backed.has(id) && (en.length > 40 || en.includes('\\n') || en.endsWith('.'))) continue;
    const rest = id.slice('SYS_ASSET_'.length);
    const g = make(id, rest, [
      backed.get(id)?.descId,
      `SYS_DISC_${rest}`,
      `SYS_DISC_ASSET_${rest}`,
    ]);
    if (g) out[id] = g;
  }

  // Les monnaies hors `SYS_ASSET_*` (Stamina…) s'ajoutent via la couche curée
  // (création depuis l'admin Editor › Item), pas en dur ici.
  return out;
}

const DUMP_PATH = resolve(process.cwd(), '.gamedata/apk/dumped/dump.cs');

/**
 * Glossaire `assetTypes` : id NUMÉRIQUE de monnaie → clé du catalogue.
 *
 * Les tables de récompense référencent les monnaies par un id d'enum
 * (`RIT_ASSET` + TypeID 33), mais AUCUNE table du client ne porte ce mapping :
 * il vit dans le code (`enum ASSET_TYPE { AT_IRREGULAR_CHASE_1 = 33, … }`),
 * que l'extraction a déjà dumpé. On le LIT là — la convention `AT_<X>` ↔
 * `SYS_ASSET_<X>` est ensuite vérifiée contre le catalogue réel : seules les
 * correspondances qui existent sortent (l'enum a ses fantômes, comme
 * `AT_CRYSTAL` face à la clé texte `SYS_ASSET_CRISTAL`).
 */
export function buildAssetTypes(goods: Record<string, Goods>): Record<string, string> {
  const dump = readFileSync(DUMP_PATH, 'utf8');
  const out: Record<string, string> = {};
  for (const m of dump.matchAll(/public const ASSET_TYPE AT_([A-Z0-9_]+) = (\d+);/g)) {
    const [, name, id] = m;
    if (name === 'MAX') continue; // sentinelle de l'enum, pas une monnaie
    const key = `SYS_ASSET_${name}`;
    if (goods[key]) out[id] = key;
  }
  if (!Object.keys(out).length) {
    throw new Error(`buildAssetTypes : aucun ASSET_TYPE résolu depuis ${DUMP_PATH}`);
  }
  return out;
}
