/**
 * extract-audio — sort l'OST (BGM) des bundles Unity, en V3 native.
 *
 * Trois temps, comme la chaîne V2 (`pipeline/steps/bgm-extract.ts`) mais câblée
 * sur l'outillage V3 (AssetStudioModCLI, `.gamedata/`) :
 *   1. EXTRACTION   : AssetStudioModCLI `-t audio` → WAV, filtrés par la regex
 *      des préfixes de BGM (mêmes familles que la V2), à plat.
 *   2. FUSION       : chaque paire `X_intro` + `X` est concaténée (ffmpeg concat)
 *      en un seul fichier nommé `X` ; un `X_intro` sans loop `X` reste tel quel.
 *   3. CONVERSION   : WAV → MP3 192k, métadonnées enlevées ; les WAV sont jetés.
 *
 * CONTRAT DE NOMMAGE (à ne PAS casser) : le stem du mp3 RESTE le token
 * `ResourceFile` du jeu (`Agitpunkt`, `Battle_01`, `Boss_Season_01_intro`…) —
 * c'est la clé de jointure du mapping (`LRT_BGM.ResourceFile` ↔ nom de fichier,
 * cf. datagen/generators/bgm-mapping.ts). On ne produit QUE les fichiers ; les
 * noms localisés sont résolus ailleurs. Aucun renommage, aucun mapping ici.
 *
 * Sortie : `.gamedata/extracted/audio/bgm/<ResourceFile>.mp3` — même racine que
 * les images extraites, pool V3-owned (fin de la dépendance à
 * `outerpedia-v2/public/audio/bgm`). `assets:collect-audio` le collecte ensuite.
 *
 * Usage : `pnpm datagen:extract-audio` (autonome), OU branché sur l'ombrelle
 * `pnpm datagen:extract [all]` via `runAudio()` (cf. datagen/extract/extract.ts).
 * Outils auto-résolus via `ensureTool` (tirés de R2 s'ils manquent) : AssetStudio
 * + ffmpeg. Surcharges d'exe : ASTUDIO_CLI, FFMPEG (build local hors R2).
 */
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { cpus } from 'node:os';
import { parse as parsePath, resolve } from 'node:path';
import { isMain } from '../lib/is-main';
import { ASSETSTUDIO, FFMPEG, ensureTool } from './tools';

const ROOT = resolve('.gamedata');
const BUNDLES = resolve(ROOT, 'files/bundles');
const OUT_BGM = resolve(ROOT, 'extracted/audio/bgm');
const WAV_TMP = resolve(ROOT, 'extracted/audio/_wav');

const BITRATE = '192k';
// Familles de ResourceFile portées par l'OST (identique à la V2 — même jeu).
const BGM_FILTER =
  '^(Agitpunkt|Battle_|Boss_|Event_|Guild_Agit|Intro|Lobby_|Remains_|Scene_|Gacha_BGM|Monadgate|Result_|RTPVP_|RuinIsland)';

/**
 * ffmpeg : override `FFMPEG` (build local), sinon `ensureTool(FFMPEG)` le résout
 * et le tire de R2 (`tools/ffmpeg`) au besoin — même binaire auto-fetch que le
 * ffprobe du mapping OST, zéro dépendance PATH.
 */
function ffmpegBin(): string {
  return process.env.FFMPEG ?? ensureTool(FFMPEG);
}

/** 1) Extraction WAV depuis les bundles, à plat dans `WAV_TMP`. */
function extractWavs(): number {
  const bin = process.env.ASTUDIO_CLI ?? ensureTool(ASSETSTUDIO);
  rmSync(WAV_TMP, { recursive: true, force: true });
  mkdirSync(WAV_TMP, { recursive: true });
  const maxTasks = Math.min(Math.max(cpus().length - 4, 1), 16);
  console.log('↻ extraction de l’audio (BGM) depuis les bundles...');
  execFileSync(
    bin,
    [
      BUNDLES,
      '-m',
      'export',
      '-t',
      'audio',
      '--audio-format',
      'wav',
      '-g',
      'none',
      '-r',
      '-o',
      WAV_TMP,
      '--max-export-tasks',
      String(maxTasks),
      '--log-level',
      'warning',
      '--filter-by-name',
      BGM_FILTER,
      '--filter-with-regex',
    ],
    { timeout: 600_000, stdio: 'inherit' },
  );
  // `-g none` peut nicher sous un sous-dossier selon l'outil : on récupère les
  // WAV où qu'ils soient, remontés à plat dans WAV_TMP.
  const wavs: string[] = [];
  const walk = (dir: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = resolve(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.toLowerCase().endsWith('.wav')) wavs.push(p);
    }
  };
  walk(WAV_TMP);
  for (const p of wavs) {
    const flat = resolve(WAV_TMP, parsePath(p).base);
    if (p !== flat && !existsSync(flat)) renameSync(p, flat);
  }
  return readdirSync(WAV_TMP).filter((f) => f.toLowerCase().endsWith('.wav')).length;
}

interface Pair {
  base: string;
  main: string;
  intro: string;
}

/** 2) Paires `X_intro` + `X` (par stem, insensible à la casse) ; le reste isolé. */
function findPairs(): { pairs: Pair[]; standalone: string[] } {
  const wavs = readdirSync(WAV_TMP).filter((f) => f.toLowerCase().endsWith('.wav'));
  const byStem = new Map<string, string>();
  for (const f of wavs) byStem.set(parsePath(f).name.toLowerCase(), f);

  const pairs: Pair[] = [];
  const paired = new Set<string>();
  for (const [stem, file] of byStem) {
    if (stem.endsWith('_intro')) continue;
    const intro = byStem.get(`${stem}_intro`);
    if (intro) {
      pairs.push({ base: parsePath(file).name, main: file, intro });
      paired.add(file.toLowerCase());
      paired.add(intro.toLowerCase());
    }
  }
  const standalone = wavs.filter((f) => !paired.has(f.toLowerCase()));
  return { pairs, standalone };
}

/** Concatène intro+loop en un seul mp3 (démuxeur concat, params partagés). */
function mergeToMp3(ffmpeg: string, intro: string, main: string, out: string): void {
  const list = resolve(parsePath(out).dir, '_concat_list.txt');
  writeFileSync(list, `file '${intro.replace(/\\/g, '/')}'\nfile '${main.replace(/\\/g, '/')}'\n`);
  try {
    execFileSync(
      ffmpeg,
      ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-b:a', BITRATE, '-map_metadata', '-1', out],
      { stdio: 'ignore' },
    );
  } finally {
    try {
      unlinkSync(list);
    } catch {
      /* rien à nettoyer */
    }
  }
}

/** Transcode un WAV isolé en mp3. */
function convertToMp3(ffmpeg: string, input: string, out: string): void {
  execFileSync(ffmpeg, ['-y', '-i', input, '-b:a', BITRATE, '-map_metadata', '-1', out], {
    stdio: 'ignore',
  });
}

/** Extraction complète de l'OST — appelable seul ou depuis l'ombrelle `extract`. */
export function runAudio(): void {
  if (!existsSync(BUNDLES)) {
    throw new Error(`bundles absents (${BUNDLES}) — lance d'abord la récupération des bundles.`);
  }
  const ffmpeg = ffmpegBin();

  const count = extractWavs();
  if (!count) {
    console.log('⚠ aucun WAV extrait (filtre trop strict ou bundles sans audio).');
    return;
  }
  console.log(`✓ ${count} WAV extraits.`);

  // Sortie propre : on repart de zéro (les mp3 sont dérivés, pas des sources).
  rmSync(OUT_BGM, { recursive: true, force: true });
  mkdirSync(OUT_BGM, { recursive: true });

  const { pairs, standalone } = findPairs();
  let merged = 0;
  for (const { base, main, intro } of pairs) {
    mergeToMp3(
      ffmpeg,
      resolve(WAV_TMP, intro),
      resolve(WAV_TMP, main),
      resolve(OUT_BGM, `${base}.mp3`),
    );
    merged++;
  }
  let converted = 0;
  for (const f of standalone) {
    convertToMp3(ffmpeg, resolve(WAV_TMP, f), resolve(OUT_BGM, `${parsePath(f).name}.mp3`));
    converted++;
  }

  rmSync(WAV_TMP, { recursive: true, force: true });
  const total = readdirSync(OUT_BGM).filter((f) => f.endsWith('.mp3')).length;
  console.log(
    `✅ Audio extrait : ${total} mp3 (${merged} fusionnés intro+loop, ${converted} isolés) → ${OUT_BGM}`,
  );
}

if (isMain(import.meta.url)) runAudio();
