/**
 * Générateur de validation du classifier d'effets.
 *
 * Écrit dans `.gamedata/staging/effects/` :
 *   - `glossary.json`     : le glossaire des statuts nommés (BuffToolTipTemplet).
 *   - `families.json`     : distribution Type → famille (contrôle visuel du mapping).
 *   - `samples.json`      : quelques buffs résolus de bout en bout (sanity check).
 *
 * But : laisser l'utilisateur VOIR la sortie avant intégration (méthode validée).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  classifyFamily,
  loadStatusGlossary,
  resolveEffect,
  type EffectFamily,
} from '../lib/effects';
import { loadTable } from '../lib/tables';

const OUT = resolve('.gamedata/staging/effects');

function write(name: string, data: unknown): void {
  writeFileSync(resolve(OUT, name), JSON.stringify(data, null, 2));
  console.log(`  ${name}`);
}

function main(): void {
  mkdirSync(OUT, { recursive: true });
  const buffs = loadTable('BuffTemplet');

  // 1) Glossaire des statuts nommés.
  const glossary = loadStatusGlossary();
  write('glossary.json', Object.fromEntries(glossary));

  // 2) Distribution Type → famille (+ comptes), pour valider le mapping d'un coup d'œil.
  const byType = new Map<string, number>();
  for (const r of buffs) byType.set(r.Type ?? '?', (byType.get(r.Type ?? '?') ?? 0) + 1);
  const families: Record<EffectFamily, { count: number; types: string[] }> = {} as never;
  const familyOf = new Map<string, EffectFamily>();
  for (const type of byType.keys()) {
    const fam = classifyFamily(type);
    familyOf.set(type, fam);
    (families[fam] ??= { count: 0, types: [] }).types.push(type);
  }
  for (const [type, n] of byType) families[familyOf.get(type)!].count += n;
  for (const f of Object.values(families)) f.types.sort();
  write('families.json', families);

  // 3) Échantillons résolus de bout en bout (un par grande famille si possible).
  const seen = new Set<EffectFamily>();
  const samples: Array<{ buffId: string; level: string; effect: unknown }> = [];
  for (const r of buffs) {
    const fam = classifyFamily(r.Type ?? '');
    if (seen.has(fam)) continue;
    seen.add(fam);
    samples.push({ buffId: r.BuffID ?? '', level: r.Level ?? '', effect: resolveEffect(r) });
  }
  write('samples.json', samples);

  // Résumé console.
  console.log(`\nGlossaire: ${glossary.size} statuts nommés`);
  console.log('Familles (count = lignes BuffTemplet) :');
  for (const [fam, info] of Object.entries(families).sort((a, b) => b[1].count - a[1].count))
    console.log(
      `  ${String(info.count).padStart(5)}  ${fam.padEnd(11)} (${info.types.length} types)`,
    );
  const special = families.special;
  if (special)
    console.log(`\n⚠ special (${special.count} lignes) types: ${special.types.join(', ')}`);
}

// Exécution directe uniquement (importable sans effet de bord par l'orchestrateur).
if (process.argv[1] && process.argv[1].endsWith('effects.ts')) main();
