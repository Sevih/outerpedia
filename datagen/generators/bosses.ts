/**
 * Générateur — BOSS référencés par l'éditorial équipement.
 *
 * La couche curée (`data/curated/equipment.json`) et les sources extraites
 * référencent les boss par id (`MonsterTemplet`) ; on résout ici nom localisé,
 * portrait (`MT_<FaceIconID>`, vignette monstre du jeu), élément et — quand la
 * source extraite le sait — le TITRE du contenu où on l'affronte (clé
 * `TextSystem`, ex. `SYS_RAID_1_TITLE` → « Special Request: Ecology Study »).
 * Sortie : `data/generated/equipment/bosses.json` (uniquement les ids requis).
 */
import { loadTable } from '../lib/tables';
import { loadTextIndex, resolveText } from '../lib/text';
import { slugEnum } from '../lib/enums';
import type { LangDict } from '../lib/lang';

export interface Boss {
  name: LangDict;
  /** Nom de sprite portrait (`MT_<FaceIconID>`, at_thumbnailmonsterruntime). */
  icon: string;
  element: string;
  /** Titre localisé du contenu (mode de donjon) — absent si non extrait. */
  source?: LangDict;
}

export function buildBosses(
  bossIds: Iterable<string>,
  /** Boss id → clé de texte `TextSystem` du titre du contenu (cf. sources.ts). */
  sourceKeys?: Map<string, string>,
): Record<string, Boss> {
  const wanted = new Set(bossIds);
  if (!wanted.size) return {};
  const rows = loadTable('MonsterTemplet');
  const text = loadTextIndex('TextCharacter');
  const sys = loadTextIndex('TextSystem');
  const out: Record<string, Boss> = {};
  for (const r of rows) {
    if (!wanted.has(r.ID)) continue;
    const titleKey = sourceKeys?.get(r.ID);
    const source = titleKey ? resolveText(sys, titleKey) : undefined;
    out[r.ID] = {
      name: resolveText(text, r.NameID),
      icon: `MT_${r.FaceIconID ?? r.ID}`,
      element: slugEnum(r.Element),
      ...(source?.en ? { source } : {}),
    };
  }
  for (const id of wanted) {
    if (!out[id]) console.warn(`⚠ boss ${id} introuvable dans MonsterTemplet`);
  }
  return out;
}
