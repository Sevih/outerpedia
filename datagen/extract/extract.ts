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
 * Usage :
 *   pnpm datagen:extract              # bytes + images + audio + wallpapers
 *   pnpm datagen:extract bytes        # uniquement les .bytes
 *   pnpm datagen:extract images       # uniquement les images
 *   pnpm datagen:extract audio        # uniquement l'OST (= pnpm datagen:extract-audio)
 *   pnpm datagen:extract wallpapers   # uniquement les wallpapers (= pnpm datagen:extract-wallpapers)
 *
 * Chemin de l'outil surchargeable via ASTUDIO_CLI.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { cpus } from 'node:os';
import { resolve } from 'node:path';
import { isMain } from '../lib/is-main';
import { ASSETSTUDIO, ensureTool } from './tools';
import { runAudio } from './extract-audio';
import { runWallpapers } from './extract-wallpapers';

const ROOT = resolve('.gamedata');
// Surcharge explicite via ASTUDIO_CLI ; sinon `ensureTool` le résout (et le tire
// de R2 s'il manque) au premier appel.
const CLI_OVERRIDE = process.env.ASTUDIO_CLI;
const BUNDLES = resolve(ROOT, 'files/bundles');
const OUT_BYTES = resolve(ROOT, 'extracted/bytes');
const OUT_IMAGES = resolve(ROOT, 'extracted/images');

function cli(args: string[]): void {
  const bin = CLI_OVERRIDE ?? ensureTool(ASSETSTUDIO);
  execFileSync(bin, args, { stdio: 'inherit' });
}

/** .bytes = templates (Templet) + textes (Text*), à plat. */
function extractBytes(): void {
  console.log('↻ extraction des .bytes (templates + textes)...');
  mkdirSync(OUT_BYTES, { recursive: true });
  cli([
    BUNDLES,
    '-m',
    'export',
    '-t',
    'textAsset',
    '-g',
    'none',
    '-r',
    '-o',
    OUT_BYTES,
    '--log-level',
    'warning',
    '--filter-by-name',
    'Templet|^Text',
    '--filter-with-regex',
  ]);
}

/** Images sprite/tex2d des UI/ressources (hors FX). */
function extractImages(): void {
  console.log('↻ extraction des images (sprite/tex2d)...');
  mkdirSync(OUT_IMAGES, { recursive: true });
  const maxTasks = Math.min(Math.max(cpus().length - 4, 1), 16);
  cli([
    BUNDLES,
    '-m',
    'export',
    '-t',
    'sprite,tex2d',
    '-g',
    'containerFull',
    '-r',
    '-o',
    OUT_IMAGES,
    '--max-export-tasks',
    String(maxTasks),
    '--log-level',
    'warning',
    '--filter-by-container',
    'assets/editor/resources/(sprite|texture|prefabs/ui)|assets/art/ui/',
    '--filter-by-name',
    '^(?!T_FX_|Font Texture)',
    '--filter-with-regex',
  ]);
}

async function main(): Promise<void> {
  const what = process.argv[2] ?? 'all';
  if (what === 'bytes' || what === 'all') extractBytes();
  if (what === 'images' || what === 'all') extractImages();
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
