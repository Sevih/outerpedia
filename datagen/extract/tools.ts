/**
 * tools — bootstrap des binaires d'outillage extraction (`pnpm datagen:tools`).
 *
 * Ces outils tiers, lourds et non versionnés vivent dans `.gamedata/tools/`
 * (PARTAGÉ entre les sources Android et Steam — cf. lib/paths `TOOLS_DIR`). On
 * les récupère s'ils manquent, par l'une de deux voies :
 *   - R2 (préfixe `tools/<Nom>`) — versions épinglées côté bucket ;
 *   - NuGet (`nuget`) — paquet public, version ET sha256 épinglés ici : même
 *     reproductibilité, sans dépôt manuel sur R2. Réservé aux outils publiés
 *     là-bas (ilspycmd), qui tournent sur le runtime .NET installé.
 * Appelé à la demande par les étapes qui en dépendent :
 *   - AssetStudioModCLI → `datagen:extract`
 *   - Il2CppDumper      → `datagen:dump-android` (le secours)
 *   - ilspycmd          → `datagen:dump` (Steam : décompile Assembly-CSharp.dll ;
 *                         paquet « dotnet tool », lancé via `dotnet <dll>` — il
 *                         exige le runtime .NET de sa cible, cf. `ILSPYCMD`)
 *   - ffmpeg + ffprobe  → `datagen:extract-audio` (conversion) et `datagen:build`
 *                         (durées du mapping OST). Même dossier R2 `tools/ffmpeg`
 *                         (les deux exe à plat) ; deux entrées Tool distinctes.
 *
 * Surcharge d'un chemin d'exe possible via ASTUDIO_CLI / IL2CPP_DUMPER /
 * ILSPYCMD / FFMPEG / FFPROBE (pour pointer un build local hors `.gamedata/tools`).
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { isMain } from '../lib/is-main';
import { TOOLS_DIR } from '../lib/paths';
import { r2Copy } from '../lib/r2';

export type Tool = {
  name: string;
  exe: string;
  /** Provisioning NuGet (sinon R2) : id du paquet, version et sha256 du .nupkg. */
  nuget?: { id: string; version: string; sha256: string };
};

export const ASSETSTUDIO: Tool = { name: 'AssetStudioModCLI', exe: 'AssetStudioModCLI.exe' };
export const IL2CPPDUMPER: Tool = { name: 'Il2CppDumper', exe: 'Il2CppDumper.exe' };
/**
 * ilspycmd 11 cible net10.0 : il faut le RUNTIME .NET 10 (`dotnet --list-runtimes`),
 * pas le SDK. Le .nupkg est un zip : l'exécutable est `tools/net10.0/any/ilspycmd.dll`.
 * Empreinte relevée le 2026-08-26 sur nuget.org.
 */
export const ILSPYCMD: Tool = {
  name: 'ilspycmd',
  exe: 'tools/net10.0/any/ilspycmd.dll',
  nuget: {
    id: 'ilspycmd',
    version: '11.0.0.9375',
    sha256: '8f555b3fca90a1d7a59050d78539c69deedaad421756bd4fe478d135bdac2dea',
  },
};
/** ffmpeg + ffprobe partagent le dossier R2 `tools/ffmpeg` (exe à plat). */
export const FFMPEG: Tool = { name: 'ffmpeg', exe: 'ffmpeg.exe' };
export const FFPROBE: Tool = { name: 'ffmpeg', exe: 'ffprobe.exe' };

/**
 * Télécharge le .nupkg épinglé, VÉRIFIE son sha256 avant de l'ouvrir, puis le
 * dézippe dans `dir` (`tar` sait lire un zip — c'est le bsdtar de Windows 10+,
 * déjà requis par le pull Android). Un octet de travers = refus, fichier effacé.
 */
function fetchNuget(tool: Tool, dir: string): void {
  const { id, version, sha256 } = tool.nuget!;
  const url = `https://www.nuget.org/api/v2/package/${id}/${version}`;
  mkdirSync(dir, { recursive: true });
  const pkg = resolve(dir, `${id}.${version}.nupkg`);
  execFileSync('curl', ['-sSL', '-o', pkg, url], { stdio: 'inherit' });
  const got = createHash('sha256').update(readFileSync(pkg)).digest('hex');
  if (got !== sha256) {
    rmSync(pkg, { force: true });
    throw new Error(`${id} ${version} : sha256 inattendu (${got}) — paquet refusé.`);
  }
  // Le bsdtar DE WINDOWS (System32), explicitement : celui de Git Bash, qui
  // passe devant dans le PATH, est un GNU tar qui ne lit pas les zip. Nom
  // RELATIF + cwd, jamais le chemin absolu (« C: » lu comme un hôte distant).
  const bsdtar = join(process.env.SystemRoot ?? 'C:\Windows', 'System32', 'tar.exe');
  execFileSync(existsSync(bsdtar) ? bsdtar : 'tar', ['-xf', basename(pkg)], {
    cwd: dir,
    stdio: 'inherit',
  });
  writeFileSync(resolve(dir, '.version'), `${version}\n`);
}

/** Chemin de l'exe d'un outil, en le tirant de sa source (NuGet ou R2) s'il manque. */
export function ensureTool(tool: Tool): string {
  const dir = resolve(TOOLS_DIR, tool.name);
  const exe = resolve(dir, tool.exe);
  if (existsSync(exe)) return exe;
  if (tool.nuget) {
    console.log(`↻ ${tool.name} absent → NuGet ${tool.nuget.id} ${tool.nuget.version}...`);
    fetchNuget(tool, dir);
  } else {
    console.log(`↻ ${tool.name} absent → récupération depuis R2 (tools/${tool.name})...`);
    r2Copy(`tools/${tool.name}`, dir);
  }
  if (!existsSync(exe)) {
    throw new Error(`${tool.exe} introuvable après récupération (${tool.name}).`);
  }
  console.log(`✓ ${tool.name} prêt.`);
  return exe;
}

// Exécution directe (`pnpm datagen:tools`) : garantit TOUS les outils.
if (isMain(import.meta.url)) {
  try {
    ensureTool(ASSETSTUDIO);
    ensureTool(IL2CPPDUMPER);
    ensureTool(ILSPYCMD);
    ensureTool(FFMPEG); // rapatrie aussi ffprobe.exe (même dossier `tools/ffmpeg`)
    console.log('✅ Outils prêts.');
  } catch (e) {
    console.error('\n✗ datagen:tools a échoué :', e instanceof Error ? e.message : e);
    process.exit(1);
  }
}
