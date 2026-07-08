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
import { loadTable, num } from '../lib/tables';
import { loadTextIndex, resolveText } from '../lib/text';
import { slugEnum } from '../lib/enums';
import { GAME_LANGS, type LangDict } from '../lib/lang';

export interface Costume {
  name: LangDict;
  desc?: LangDict;
  icon: string; // SpriteCostumeIcon (TI_Costume_*)
  grade: string; // IG_RARE → rare
  /** Perso qui peut l'équiper (CharacterID). */
  characterId: string;
  /** Provenance (slug : shop/event_shop/battlepass…), si connue. */
  source?: string;
}

const hasText = (d: LangDict): boolean => GAME_LANGS.some((l) => d[l]);

export function buildCostumes(): Record<string, Costume> {
  const rows = loadTable('CostumeTemplet');
  const names = loadTextIndex('TextCharacter');
  const descs = loadTextIndex('TextSystem');

  const out: Record<string, Costume> = {};
  for (const r of rows) {
    const id = r.ID;
    if (!id) continue;

    const c: Costume = {
      name: resolveText(names, r.CostumeName),
      icon: r.SpriteCostumeIcon ?? r.RewardCostumeIcon ?? '',
      grade: slugEnum(r.ItemGrade),
      characterId: r.CharacterID ?? '',
    };
    const desc = resolveText(descs, r.DescID);
    if (hasText(desc)) c.desc = desc;
    const source = slugEnum(r.CostumePurchaseType);
    if (source && source !== 'none') c.source = source;

    out[id] = c;
  }

  // tri par id numérique pour un fichier stable et lisible
  const sorted = Object.entries(out).sort(([a], [b]) => num(a) - num(b) || a.localeCompare(b));
  return Object.fromEntries(sorted);
}

// Exécution directe : échantillon pour revue.
if (process.argv[1] && process.argv[1].endsWith('costumes.ts')) {
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
