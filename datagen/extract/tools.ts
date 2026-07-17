/**
 * tools — bootstrap des binaires d'outillage extraction (`pnpm datagen:tools`).
 *
 * Ces outils tiers, lourds et non versionnés vivent dans `.gamedata/tools/`. On
 * les récupère depuis R2 (préfixe `tools/<Nom>`) s'ils manquent — versions
 * épinglées côté bucket = reproductible. Appelé à la demande par les étapes qui
 * en dépendent :
 *   - AssetStudioModCLI → `datagen:extract`
 *   - Il2CppDumper      → `datagen:dump`
 *
 * Surcharge d'un chemin d'exe possible via ASTUDIO_CLI / IL2CPP_DUMPER (pour
 * pointer un build local hors `.gamedata/tools`).
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { isMain } from '../lib/is-main';
import { r2Copy } from '../lib/r2';

const TOOLS = resolve('.gamedata/tools');

export type Tool = { name: string; exe: string };

export const ASSETSTUDIO: Tool = { name: 'AssetStudioModCLI', exe: 'AssetStudioModCLI.exe' };
export const IL2CPPDUMPER: Tool = { name: 'Il2CppDumper', exe: 'Il2CppDumper.exe' };

/** Chemin de l'exe d'un outil, en le tirant de R2 s'il manque en local. */
export function ensureTool(tool: Tool): string {
  const dir = resolve(TOOLS, tool.name);
  const exe = resolve(dir, tool.exe);
  if (existsSync(exe)) return exe;
  console.log(`↻ ${tool.name} absent → récupération depuis R2 (tools/${tool.name})...`);
  r2Copy(`tools/${tool.name}`, dir);
  if (!existsSync(exe)) {
    throw new Error(`${tool.exe} introuvable après récupération R2 (tools/${tool.name}).`);
  }
  console.log(`✓ ${tool.name} prêt.`);
  return exe;
}

// Exécution directe (`pnpm datagen:tools`) : garantit TOUS les outils.
if (isMain(import.meta.url)) {
  try {
    ensureTool(ASSETSTUDIO);
    ensureTool(IL2CPPDUMPER);
    console.log('✅ Outils prêts.');
  } catch (e) {
    console.error('\n✗ datagen:tools a échoué :', e instanceof Error ? e.message : e);
    process.exit(1);
  }
}
