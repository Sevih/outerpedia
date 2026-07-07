/**
 * IMPORT ONE-SHOT — éditorial équipement V2 → `data/curated/equipment.json`.
 *
 * Reprend du legacy (oracle V2, écrit main) ce que le jeu ne dit pas :
 *   - sources d'obtention (boss / libellé) des armes, amulettes, sets, talismans ;
 *   - type AP/CP des talismans ;
 *   - rangs éditoriaux des EE (rank / rank10).
 *
 * Correspondance par NOM EN (le legacy ne connaît pas les ids V3) vers l'id
 * CANONIQUE de la famille (plus petit id numérique du groupe de même nom).
 * Les suffixes de classe V2 (« Nom [Striker] ») sont repliés sur la famille.
 * Relançable : ÉCRASE le fichier (source de vérité = legacy, tant qu'on n'a
 * pas commencé à curer à la main — après, ne plus relancer).
 *
 * Usage : pnpm exec tsx datagen/import-equipment.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { LangDict } from './lib/lang';
import {
  validateEquipmentCurated,
  type EquipmentCurated,
  type EquipmentCuratedEntry,
} from './curated/equipment';

interface LegacyItem {
  name: string;
  boss?: string | string[] | null;
  source?: string | null;
}
interface LegacyEE {
  rank?: string;
  rank10?: string;
}

const norm = (s: string) => s.replace(/[’']/g, "'").trim().toLowerCase();
const stripClass = (s: string) => s.replace(/\s*\[[^\]]+\]\s*$/, '');

function legacy<T>(file: string): T {
  return JSON.parse(readFileSync(resolve('data/legacy/equipment', file), 'utf8')) as T;
}
function generated<T>(file: string): T {
  return JSON.parse(readFileSync(resolve('data/generated/equipment', file), 'utf8')) as T;
}

/** name EN normalisé → id canonique. Sets : une entrée par groupe (pas de familles). */
function nameIndex(table: Record<string, { name: LangDict }>): Map<string, string> {
  const idx = new Map<string, string>();
  for (const [id, e] of Object.entries(table)) {
    const key = norm(e.name.en);
    const prev = idx.get(key);
    if (!prev || Number(id) < Number(prev)) idx.set(key, id);
  }
  return idx;
}

/** name EN normalisé → id canonique de famille (source : `families.json`). */
function familyIndex(
  table: Record<string, { name: LangDict }>,
  families: { id: string; topId: string }[],
): Map<string, string> {
  return new Map(families.map((f) => [norm(table[f.topId].name.en), f.id]));
}

function toBosses(boss: LegacyItem['boss']): string[] | undefined {
  if (!boss) return undefined;
  const list = (Array.isArray(boss) ? boss : String(boss).split(','))
    .map((b) => b.trim())
    .filter(Boolean);
  return list.length ? list : undefined;
}

function sourceOf(it: LegacyItem): EquipmentCuratedEntry['source'] {
  const bosses = toBosses(it.boss);
  const label = it.source?.trim() || undefined;
  return bosses || label
    ? { ...(bosses ? { bosses } : {}), ...(label ? { label } : {}) }
    : undefined;
}

function importSection(
  sectionName: string,
  items: LegacyItem[],
  idx: Map<string, string>,
  /** Familles dont la source est déjà EXTRAITE (sources.json) : rien à curer. */
  extracted?: Set<string>,
): { out: Record<string, EquipmentCuratedEntry>; missed: string[] } {
  const out: Record<string, EquipmentCuratedEntry> = {};
  const missed: string[] = [];
  let skipped = 0;
  for (const it of items) {
    const id = idx.get(norm(stripClass(it.name)));
    if (!id) {
      missed.push(it.name);
      continue;
    }
    if (extracted?.has(id)) {
      skipped++;
      continue;
    }
    const entry: EquipmentCuratedEntry = { ...(out[id] ?? {}) };
    const source = sourceOf(it);
    if (source) {
      // Variantes de classe d'une même famille : union des boss.
      const bosses = [...new Set([...(entry.source?.bosses ?? []), ...(source.bosses ?? [])])];
      entry.source = {
        ...(bosses.length ? { bosses } : {}),
        ...((source.label ?? entry.source?.label)
          ? { label: source.label ?? entry.source?.label }
          : {}),
      };
    }
    if (Object.keys(entry).length) out[id] = entry;
  }
  console.log(
    `  ${sectionName.padEnd(10)} ${items.length} entrées legacy → ${Object.keys(out).length} familles` +
      (skipped ? ` · ${skipped} couvertes par l'extraction` : '') +
      (missed.length ? ` · ${missed.length} sans correspondance` : ''),
  );
  for (const m of missed) console.log(`    ! ${m}`);
  return { out, missed };
}

function main(): void {
  console.log('import-equipment → data/curated/equipment.json');

  const families =
    generated<
      Record<'weapon' | 'accessory' | 'talisman', { id: string; topId: string; ids: string[] }[]>
    >('families.json');
  const sources = generated<Record<string, unknown>>('sources.json');
  const weaponsIdx = familyIndex(generated('weapon.json'), families.weapon);
  const amuletsIdx = familyIndex(generated('accessory.json'), families.accessory);
  const talismansIdx = familyIndex(generated('talisman.json'), families.talisman);
  // Sets : correspondance par nom du set généré.
  const setsIdx = nameIndex(generated('sets.json'));

  // Familles dont un membre apparaît dans les sources EXTRAITES.
  const extractedFams = (fams: { id: string; ids: string[] }[]) =>
    new Set(fams.filter((f) => f.ids.some((id) => id in sources)).map((f) => f.id));
  // Sets couverts : une pièce d'armure du set apparaît dans les sources.
  const extractedSets = new Set<string>();
  for (const slot of ['helmet.json', 'armor.json', 'gloves.json', 'shoes.json']) {
    for (const [id, piece] of Object.entries(
      generated<Record<string, { set?: string | null }>>(slot),
    )) {
      if (piece.set && id in sources) extractedSets.add(piece.set);
    }
  }

  const weapons = importSection(
    'weapons',
    legacy<LegacyItem[]>('weapon.json'),
    weaponsIdx,
    extractedFams(families.weapon),
  );
  const amulets = importSection(
    'amulets',
    legacy<LegacyItem[]>('accessory.json'),
    amuletsIdx,
    extractedFams(families.accessory),
  );
  const talismans = importSection(
    'talismans',
    legacy<LegacyItem[]>('talisman.json'),
    talismansIdx,
    extractedFams(families.talisman),
  );
  const sets = importSection('sets', legacy<LegacyItem[]>('sets.json'), setsIdx, extractedSets);

  // EE : legacy keyé par id de perso — on garde la même clé.
  const eeLegacy = legacy<Record<string, LegacyEE>>('ee.json');
  const ee: Record<string, EquipmentCuratedEntry> = {};
  for (const [charId, e] of Object.entries(eeLegacy)) {
    const entry: EquipmentCuratedEntry = {
      ...(e.rank ? { rank: e.rank } : {}),
      ...(e.rank10 ? { rank10: e.rank10 } : {}),
    };
    if (Object.keys(entry).length) ee[charId] = entry;
  }
  console.log(
    `  ee         ${Object.keys(eeLegacy).length} entrées legacy → ${Object.keys(ee).length} rangs`,
  );

  const curated: EquipmentCurated = {
    weapons: weapons.out,
    amulets: amulets.out,
    talismans: talismans.out,
    sets: sets.out,
    ee,
  };
  const issues = validateEquipmentCurated(curated);
  if (issues.length) {
    console.error(`✗ fichier produit invalide :\n  ${issues.join('\n  ')}`);
    process.exitCode = 1;
    return;
  }
  writeFileSync(resolve('data/curated/equipment.json'), JSON.stringify(curated, null, 2) + '\n');
  console.log('OK — data/curated/equipment.json écrit.');
}

main();
