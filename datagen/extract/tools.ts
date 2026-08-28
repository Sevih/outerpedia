/**
 * tools — bootstrap des binaires d'outillage extraction (`pnpm datagen:tools`).
 *
 * Ces outils tiers, lourds et non versionnés vivent dans `.gamedata/tools/`
 * (PARTAGÉ entre les sources Android et Steam — cf. lib/paths `TOOLS_DIR`). On
 * les récupère s'ils manquent, par l'une de trois voies :
 *   - R2 (préfixe `tools/<Nom>`) — versions épinglées côté bucket ;
 *   - NuGet (`nuget`) — paquet public, version ET sha256 épinglés ici : même
 *     reproductibilité, sans dépôt manuel sur R2. Réservé aux outils publiés
 *     là-bas (ilspycmd), qui tournent sur le runtime .NET installé ;
 *   - release GitHub (`release`) — archive épinglée par URL et sha256. Sert aux
 *     outils dont le build DÉPEND DE LA PLATEFORME (AssetStudioModCLI hors
 *     Windows) : R2 n'héberge que le build Windows.
 *
 * Un quatrième cas ne récupère rien : `system`, qui prend la commande du PATH
 * hors Windows (ffmpeg, ffprobe) — voir `ensureTool`.
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
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { isMain } from '../lib/is-main';
import { TOOLS_DIR } from '../lib/paths';
import { r2Copy } from '../lib/r2';

export type Tool = {
  name: string;
  exe: string;
  /**
   * Commande système équivalente, cherchée sur le PATH HORS Windows. Quand elle
   * existe, elle prime sur `.gamedata/tools/` : ce dossier peut contenir des
   * `.exe` Windows rapatriés d'une autre machine, qui passent `existsSync` et
   * qu'on exécuterait alors comme des binaires PE (constaté le 28/08/2026).
   */
  system?: string;
  /** Provisioning NuGet (sinon R2) : id du paquet, version et sha256 du .nupkg. */
  nuget?: { id: string; version: string; sha256: string };
  /** Archive d'une release GitHub, URL ET sha256 épinglés (prioritaire sur R2). */
  release?: { url: string; file: string; sha256: string };
};

/** Chemin absolu d'une commande du PATH, ou null. */
function systemBin(cmd: string): string | null {
  const probe = spawnSync(process.platform === 'win32' ? 'where' : 'which', [cmd], {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  if (probe.status !== 0 || !probe.stdout) return null;
  return probe.stdout.split(/\r?\n/)[0]!.trim() || null;
}

/**
 * AssetStudioModCLI — le build DÉPEND DE LA PLATEFORME.
 *
 * Le build Windows embarque `fmod.dll`, `Texture2DDecoderNative.dll` et `ooz.dll`,
 * natifs Windows : rapatrié tel quel sur Linux il ne s'exécute pas du tout
 * (constaté le 28/08/2026 après migration). Le projet publie des builds Linux et
 * macOS qui embarquent les `.so`/`.dylib` équivalents — MÊME version 0.19.0.0 que
 * celle du poste Windows.
 *
 * Équivalence VÉRIFIÉE le 28/08/2026 sur la cible images complète (1095 bundles) :
 * 12 327 des 12 652 fichiers communs sont identiques AU BIT PRÈS, et les 325
 * restants sont TOUS dans des dossiers à doublons de noms — dont l'ordre dépend
 * de pathID que le patch du jeu avait fait bouger entre les deux extractions.
 * Aucun écart hors de ces dossiers : les décodeurs se comportent pareil.
 *
 * Hors Windows on tire l'archive des releases GitHub (version + sha256 épinglés,
 * même reproductibilité que la voie NuGet). Sous Windows, RIEN NE CHANGE : R2
 * continue de servir le build en place.
 */
const ASMOD_RELEASE = 'v0.19.0';
const ASMOD_BUILDS: Record<string, { file: string; exe: string; sha256: string }> = {
  linux: {
    file: 'AssetStudioModCLI_net9_linux64.zip',
    exe: 'AssetStudioModCLI_net9_linux64/AssetStudioModCLI',
    sha256: 'f285522118a534bac63ad27313f60e622d2f11544fb0228d50ed711a36c9fa37',
  },
  darwin: {
    file: 'AssetStudioModCLI_net9_mac64.zip',
    exe: 'AssetStudioModCLI_net9_mac64/AssetStudioModCLI',
    sha256: '6974f5790f269fb7573b5c2281159befd5482c99682fbb8dc3951a5e95186c3a',
  },
};
const asmod = ASMOD_BUILDS[process.platform];
export const ASSETSTUDIO: Tool = asmod
  ? {
      name: 'AssetStudioModCLI',
      exe: asmod.exe,
      release: {
        url: `https://github.com/aelurum/AssetStudioMod/releases/download/${ASMOD_RELEASE}/${asmod.file}`,
        file: asmod.file,
        sha256: asmod.sha256,
      },
    }
  : { name: 'AssetStudioModCLI', exe: 'AssetStudioModCLI.exe' };
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
export const FFMPEG: Tool = { name: 'ffmpeg', exe: 'ffmpeg.exe', system: 'ffmpeg' };
export const FFPROBE: Tool = { name: 'ffmpeg', exe: 'ffprobe.exe', system: 'ffprobe' };

/**
 * Télécharge le .nupkg épinglé, VÉRIFIE son sha256 avant de l'ouvrir, puis le
 * dézippe dans `dir`. Un octet de travers = refus, fichier effacé.
 */
/**
 * Dézippe un .nupkg (= un zip) dans `dir`, sur n'importe quel OS.
 *
 * Le piège : `tar` ne veut PAS dire la même chose partout. Sous Windows 10+,
 * `System32\\tar.exe` est un bsdtar qui lit les zip — mais celui de Git Bash,
 * qui passe devant dans le PATH, est un GNU tar qui ne les lit pas. Et sous
 * Linux, `tar` est TOUJOURS GNU tar : il échoue sur un zip (constaté le
 * 28/08/2026, GNU tar 1.35). On essaie donc les candidats dans l'ordre, et on
 * échoue avec un message clair plutôt que de laisser un dossier vide derrière.
 *
 * Nom de fichier RELATIF + `cwd`, jamais le chemin absolu : bsdtar lit « C: »
 * comme un hôte distant.
 */
function unzipInto(pkg: string, dir: string): void {
  const file = basename(pkg);
  const winTar = join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe');
  const candidates: Array<{ bin: string; args: string[] }> =
    process.platform === 'win32'
      ? [{ bin: existsSync(winTar) ? winTar : 'tar', args: ['-xf', file] }]
      : [
          { bin: 'bsdtar', args: ['-xf', file] },
          { bin: 'unzip', args: ['-q', '-o', file] },
        ];
  for (const { bin, args } of candidates) {
    if (!existsSync(bin) && !systemBin(bin)) continue;
    execFileSync(bin, args, { cwd: dir, stdio: 'inherit' });
    return;
  }
  throw new Error(
    `Impossible de dézipper ${file} : aucun outil capable de lire un zip. ` +
      'Installe `bsdtar` (paquet libarchive) ou `unzip`.',
  );
}

function fetchPinnedZip(
  url: string,
  file: string,
  sha256: string,
  dir: string,
  label: string,
): void {
  mkdirSync(dir, { recursive: true });
  const pkg = resolve(dir, file);
  execFileSync('curl', ['-sSL', '-o', pkg, url], { stdio: 'inherit' });
  const got = createHash('sha256').update(readFileSync(pkg)).digest('hex');
  if (got !== sha256) {
    // Effacé AVANT de lever : une archive au sha inattendu ne doit pas rester
    // sur le disque, où un `existsSync` la reprendrait plus tard.
    rmSync(pkg, { force: true });
    throw new Error(`${label} : sha256 inattendu (${got}) — archive refusée.`);
  }
  unzipInto(pkg, dir);
}

function fetchNuget(tool: Tool, dir: string): void {
  const { id, version, sha256 } = tool.nuget!;
  fetchPinnedZip(
    `https://www.nuget.org/api/v2/package/${id}/${version}`,
    `${id}.${version}.nupkg`,
    sha256,
    dir,
    `${id} ${version}`,
  );
  writeFileSync(resolve(dir, '.version'), `${version}\n`);
}

/** Chemin de l'exe d'un outil, en le tirant de sa source (NuGet ou R2) s'il manque. */
export function ensureTool(tool: Tool): string {
  // HORS WINDOWS, l'équivalent système passe AVANT `.gamedata/tools/` : ce
  // dossier peut contenir des .exe Windows (rapatriés d'une autre machine, ou
  // tirés de R2 qui n'héberge que les builds Windows). Ils existent, donc le
  // `existsSync` ci-dessous les accepterait — et on lancerait un binaire PE.
  if (tool.system && process.platform !== 'win32') {
    const found = systemBin(tool.system);
    if (found) return found;
  }
  const dir = resolve(TOOLS_DIR, tool.name);
  const exe = resolve(dir, tool.exe);
  if (existsSync(exe)) return exe;
  if (tool.release) {
    console.log(`↻ ${tool.name} absent → release GitHub (${tool.release.file})...`);
    fetchPinnedZip(tool.release.url, tool.release.file, tool.release.sha256, dir, tool.name);
  } else if (tool.nuget) {
    console.log(`↻ ${tool.name} absent → NuGet ${tool.nuget.id} ${tool.nuget.version}...`);
    fetchNuget(tool, dir);
  } else {
    console.log(`↻ ${tool.name} absent → récupération depuis R2 (tools/${tool.name})...`);
    r2Copy(`tools/${tool.name}`, dir);
  }
  if (!existsSync(exe)) {
    throw new Error(`${tool.exe} introuvable après récupération (${tool.name}).`);
  }
  // Un zip ne porte pas toujours le bit exécutable : sans ça l'ENOEXEC surgirait
  // au lancement de l'outil, loin d'ici, avec un message bien moins clair.
  if (process.platform !== 'win32') chmodSync(exe, 0o755);
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
