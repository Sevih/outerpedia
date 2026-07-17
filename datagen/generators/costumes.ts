/**
 * Générateur — COSTUMES / skins (`CostumeTemplet`).
 *
 * Les costumes sont des apparences alternatives rattachées à un perso. Le
 * catalogue perso (`characters.json`) les liste déjà IMBRIQUÉS par perso ; ce
 * générateur en produit une vue PLATE (id → costume) destinée au catalogue
 * d'items admin (Editor › Item + picker de rewards), au même titre que les
 * monnaies (`goods.json`).
 *
 * Entrées (tables du jeu) : CostumeTemplet, TextCharacter (noms), TextSystem
 * (descriptions). Sortie : data/costumes.json (id → entité).  [PROPOSITION]
 */
import { isMain } from '../lib/is-main';
import { loadTable, num, type Row } from '../lib/tables';
import { hasText, loadTextIndex, resolveText } from '../lib/text';
import { slugEnum } from '../lib/enums';
import type { LangDict } from '../lib/lang';

/** Un costume de la vue PLATE (catalogue d'items) — cf. `Costume` de la spec
 * perso pour la vue imbriquée (modèles/full arts en plus). */
export interface CostumeEntry {
  name: LangDict;
  desc?: LangDict;
  icon: string; // SpriteCostumeIcon (TI_Costume_*)
  grade: string; // IG_RARE → rare
  /** Perso qui peut l'équiper (CharacterID). */
  characterId: string;
  /** Provenance (slug : shop/event_shop/battlepass…), si connue. */
  source?: string;
}

/** Champs communs d'une ligne `CostumeTemplet` (cf. `costumeCore`). */
export interface CostumeCore {
  name: LangDict;
  icon: string;
  grade: string;
  source?: string;
}

/**
 * Extraction COMMUNE d'une ligne `CostumeTemplet` — source unique partagée par
 * la vue plate (ici) et la spec perso (costumes imbriqués de characters.json).
 * Icône : `SpriteCostumeIcon` avec repli `RewardCostumeIcon` (filet — toutes
 * les lignes actuelles ont un sprite, mais le jeu ne le garantit pas).
 */
export function costumeCore(r: Row, names: Map<string, LangDict>): CostumeCore {
  const core: CostumeCore = {
    name: resolveText(names, r.CostumeName),
    icon: r.SpriteCostumeIcon ?? r.RewardCostumeIcon ?? '',
    grade: slugEnum(r.ItemGrade),
  };
  const source = slugEnum(r.CostumePurchaseType);
  if (source && source !== 'none') core.source = source;
  return core;
}

export function buildCostumes(): Record<string, CostumeEntry> {
  const rows = loadTable('CostumeTemplet');
  const names = loadTextIndex('TextCharacter');
  const descs = loadTextIndex('TextSystem');

  const out: Record<string, CostumeEntry> = {};
  for (const r of rows) {
    const id = r.ID;
    if (!id) continue;

    const { name, icon, grade, source } = costumeCore(r, names);
    // Costume d'un contenu PAS ENCORE SORTI : nom absent de TextCharacter (et
    // sprite souvent pas encore livré dans les bundles). Pas d'entrée fantôme
    // au catalogue — elle revient d'elle-même quand le jeu publie le contenu.
    if (!hasText(name)) continue;
    const c: CostumeEntry = { name, icon, grade, characterId: r.CharacterID ?? '' };
    const desc = resolveText(descs, r.DescID);
    if (hasText(desc)) c.desc = desc;
    if (source) c.source = source;

    out[id] = c;
  }

  // tri par id numérique pour un fichier stable et lisible
  const sorted = Object.entries(out).sort(([a], [b]) => num(a) - num(b) || a.localeCompare(b));
  return Object.fromEntries(sorted);
}

// Exécution directe : échantillon pour revue.
if (isMain(import.meta.url)) {
  const c = buildCostumes();
  const ids = Object.keys(c);
  console.log(`costumes: ${ids.length}`);
  console.log('avec desc:', ids.filter((i) => c[i].desc).length);
  const grades: Record<string, number> = {};
  for (const i of ids) grades[c[i].grade] = (grades[c[i].grade] ?? 0) + 1;
  console.log('par grade:', JSON.stringify(grades));
  console.log('\n— échantillon —');
  console.log(JSON.stringify({ id: ids[0], ...c[ids[0]] }, null, 2));
}
