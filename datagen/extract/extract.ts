/**
 * extract — lance AssetStudioModCLI sur les bundles pour en sortir :
 *   - les .bytes (templates + textes)  → .gamedata/extracted/bytes/
 *   - les images (sprite/tex2d)        → .gamedata/extracted/images/
 *   - l'audio (OST/BGM → mp3)          → .gamedata/extracted/audio/bgm/
 *   - les wallpapers (webp + png)      → .gamedata/extracted/wallpapers/
 *
 * Étape locale (l'outil .NET n'est pas réécrit en TS, juste piloté proprement).
 * Le convert (.bytes → templates typés) viendra ensuite, en TS. L'audio est
 * délégué à `extract-audio.ts` ; les wallpapers à `extract-wallpapers.ts` (qui
 * SCANNE le pool d'images ci-dessus — d'où l'ordre images → wallpapers).
 *
 * CIBLÉ PAR LE MANIFESTE (27/08/2026) : AssetStudio n'ouvre plus les 19 Go du
 * dossier pour en garder 35 Mo. Chaque cible (`TARGETS`) désigne ses bundles
 * via `manifest.dat` (mêmes regex que ses filtres AssetStudio, fermeture des
 * dépendances — `lib/bundle-manifest`), les lie en dur dans un dossier
 * d'entrée (`extracted/.input-<cible>/`, même volume, zéro copie), et note
 * l'empreinte de ce jeu de bundles dans `extracted/.extract-stamp.json` : tant
 * qu'elle ne bouge pas, la cible est SAUTÉE — un patch qui ne touche que les
 * voix ou les scènes ne relance plus l'extraction des images. `--force` rejoue.
 *
 * Usage :
 *   pnpm datagen:extract              # bytes + images + audio + wallpapers
 *   pnpm datagen:extract bytes        # uniquement les .bytes
 *   pnpm datagen:extract images       # uniquement les images
 *   pnpm datagen:extract audio        # uniquement l'OST (= pnpm datagen:extract-audio)
 *   pnpm datagen:extract wallpapers   # uniquement les wallpapers (= pnpm datagen:extract-wallpapers)
 *   pnpm datagen:extract [cible] --force   # ignorer l'empreinte, ré-extraire
 *
 * Chemin de l'outil surchargeable via ASTUDIO_CLI.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, linkSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { cpus } from 'node:os';
import { basename, join, resolve } from 'node:path';
import {
  bundlePaths,
  bundlesFor,
  bundlesSignature,
  readManifest,
  type BundleInfo,
  type ExtractTarget,
} from '../lib/bundle-manifest';
import { isMain } from '../lib/is-main';
import { ASSETSTUDIO, ensureTool } from './tools';
import { runAudio } from './extract-audio';
import { runWallpapers } from './extract-wallpapers';
import { gamedata } from '../lib/paths';

const ROOT = gamedata();
// Surcharge explicite via ASTUDIO_CLI ; sinon `ensureTool` le résout (et le tire
// de R2 s'il manque) au premier appel.
const CLI_OVERRIDE = process.env.ASTUDIO_CLI;
const EXTRACTED = resolve(ROOT, 'extracted');
const OUT_BYTES = resolve(EXTRACTED, 'bytes');
const OUT_IMAGES = resolve(EXTRACTED, 'images');
const STAMP = resolve(EXTRACTED, '.extract-stamp.json');

// Garde-fou anti-BLOCAGE (audit E4) — pas un plafond de durée normale. Un appel
// AssetStudio (bytes OU images) n'est qu'une fraction du process complet, qui
// tourne ~10-15 min sur un gros patch (pull+extract+build) ; 30 min est donc bien
// au-dessus du pire cas d'UNE passe, mais borne un process réellement pendu (qui,
// lui, ne rendrait jamais la main). Aligné en esprit sur le timeout de l'audio.
const EXTRACT_TIMEOUT_MS = 30 * 60_000;

/**
 * Les deux cibles AssetStudio. Les regex sont LA définition : elles servent à
 * la fois à désigner les bundles (manifeste) et à filtrer les assets
 * (`--filter-by-name` / `--filter-by-container`, via `.source`) — un seul
 * endroit à changer, et l'équivalence avec le scan complet tient par
 * construction.
 */
const TARGETS: Record<'bytes' | 'images', ExtractTarget & { out: string; label: string }> = {
  /** .bytes = templates (Templet) + textes (Text*), à plat. */
  bytes: { label: '.bytes (templates + textes)', name: /Templet|^Text/, out: OUT_BYTES },
  /** Images sprite/tex2d des UI/ressources (hors FX et textures de police). */
  images: {
    label: 'images (sprite/tex2d)',
    name: /^(?!T_FX_|Font Texture)/,
    container: /assets\/editor\/resources\/(sprite|texture|prefabs\/ui)|assets\/art\/ui\//i,
    out: OUT_IMAGES,
  },
};

function cli(args: string[]): void {
  const bin = CLI_OVERRIDE ?? ensureTool(ASSETSTUDIO);
  execFileSync(bin, args, { stdio: 'inherit', timeout: EXTRACT_TIMEOUT_MS });
}

type Stamp = Partial<Record<keyof typeof TARGETS, string>>;

function readStamp(): Stamp {
  try {
    return JSON.parse(readFileSync(STAMP, 'utf8')) as Stamp;
  } catch {
    return {};
  }
}

function writeStamp(patch: Stamp): void {
  mkdirSync(EXTRACTED, { recursive: true });
  writeFileSync(STAMP, JSON.stringify({ ...readStamp(), ...patch }, null, 2) + '\n');
}

/**
 * Dossier d'entrée d'une cible : liens durs vers les bundles retenus, rebâti à
 * chaque passe. Un lien dur = le même fichier sous un autre nom, sur le même
 * volume (`.gamedata` entier) — AssetStudio y voit un dossier ordinaire.
 */
function stageInput(key: keyof typeof TARGETS, bundles: BundleInfo[]): string {
  const dir = resolve(EXTRACTED, `.input-${key}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const src of bundlePaths(bundles)) linkSync(src, join(dir, basename(src)));
  return dir;
}

/**
 * Une cible : bundles désignés par le manifeste → empreinte → saut si rien de
 * neuf (sauf `force` ou sortie absente) → AssetStudio sur le dossier lié →
 * empreinte notée (APRÈS succès : une passe plantée se rejoue d'elle-même).
 */
function runTarget(key: keyof typeof TARGETS, force: boolean, extraArgs: string[]): void {
  const t = TARGETS[key];
  const bundles = bundlesFor(readManifest(), t);
  const sig = bundlesSignature(bundles);
  const size = bundles.reduce((n, b) => n + b.fileSize, 0);
  const summary = `${bundles.length} bundle(s), ${(size / 1e6).toFixed(0)} Mo`;
  if (!force && existsSync(t.out) && readStamp()[key] === sig) {
    console.log(
      `⏭  ${t.label} : ${summary} inchangés depuis la dernière extraction — sautée (--force pour rejouer).`,
    );
    return;
  }
  console.log(`↻ extraction des ${t.label} — ${summary} sur ${readManifest().length}...`);
  mkdirSync(t.out, { recursive: true });
  const input = stageInput(key, bundles);
  const args = [input, '-m', 'export', '-r', '-o', t.out, '--log-level', 'warning'];
  const filters = ['--filter-by-name', t.name.source];
  if (t.container) filters.push('--filter-by-container', t.container.source);
  filters.push('--filter-with-regex');
  cli([...args, ...extraArgs, ...filters]);
  rmSync(input, { recursive: true, force: true });
  writeStamp({ [key]: sig });
}

function extractBytes(force: boolean): void {
  // `-g none` : à plat, le convert lit `extracted/bytes/<Nom>.bytes`.
  runTarget('bytes', force, ['-t', 'textAsset', '-g', 'none']);
}

function extractImages(force: boolean): void {
  const maxTasks = Math.min(Math.max(cpus().length - 4, 1), 16);
  runTarget('images', force, [
    '-t',
    'sprite,tex2d',
    // Groupement par container complet : les consommateurs lisent
    // `extracted/images/<container>/…`.
    '-g',
    'containerFull',
    '--max-export-tasks',
    String(maxTasks),
  ]);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const force = argv.includes('--force');
  const what = argv.find((a) => !a.startsWith('--')) ?? 'all';
  if (what === 'bytes' || what === 'all') extractBytes(force);
  if (what === 'images' || what === 'all') extractImages(force);
  // L'audio (OST) : sa propre chaîne (WAV → fusion intro/loop → mp3), déléguée.
  if (what === 'audio' || what === 'all') runAudio();
  // Les wallpapers DÉRIVENT du pool d'images (scan + dédup sharp) : donc APRÈS
  // images, et asynchrone. Délégué à extract-wallpapers.ts.
  if (what === 'wallpapers' || what === 'all') await runWallpapers();
  console.log('✅ Extraction terminée.');
}

// Exécution directe seulement (`pnpm datagen:extract [cible]`) — un import ne
// doit pas déclencher une extraction complète.
if (isMain(import.meta.url)) {
  main().catch((e) => {
    console.error(`\n\x1b[31mErreur : ${e?.message ?? e}\x1b[0m`);
    process.exit(1);
  });
}
