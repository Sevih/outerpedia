/**
 * Générateur — MAPPING de l'OST (jukebox `/ost`).
 *
 * Chaque mp3 de l'OST (déjà extrait + converti par la chaîne datamine, hors
 * scope ici) reçoit un NOM localisé et ses métadonnées (taille, durée) :
 *   - NOM : les pistes « jukebox » du lobby portent un nom de jeu. On lit
 *     `LobbyCustomResourceTemplet` (lignes `LRT_BGM`), dont `ResourceFile` liste
 *     les fichiers (intro,loop) et `NAME` pointe une clé `TextSystem`. On résout
 *     la clé en `LangDict` (en/jp/kr/zh d'un coup — plus riche que la V2 qui ne
 *     prenait que l'anglais et reportait les autres langues à la main).
 *   - Les pistes SANS ligne lobby (musiques de scène/boss non sélectionnables)
 *     retombent sur un nom dérivé du fichier (`formatFilenameAsName`).
 *   - `size`/`duration` : lues sur le mp3 réel (statSync + ffprobe).
 *
 * Source audio : le pool extrait `.gamedata/extracted/audio/bgm` (produit par
 * `pnpm datagen:extract-audio`, comme les images le sont par l'extraction). On
 * lit la SOURCE, pas le staging : le mapping est un artefact de build, dérivé du
 * pool + des tables — le staging n'est qu'un tampon de push. Le mp3 n'est pas
 * ré-extrait ici (la conversion WAV→MP3 vit dans la chaîne datamine).
 *
 * Écriture CANONIQUE : `pnpm datagen:build` (writeJson + revue via `promote`),
 * comme tout `data/generated/`. L'exécution directe (`tsx …/bgm-mapping.ts`)
 * se contente d'IMPRIMER le résultat pour revue — elle n'écrit rien.
 */
import { execFile as execFileCb } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { parse as parsePath, resolve } from 'node:path';
import { promisify } from 'node:util';
import { loadTable } from '../lib/tables';
import { langDict } from '../lib/text';
import type { LangDict } from '../lib/lang';
import { isMain } from '../lib/is-main';
import { ensureTool, FFPROBE } from '../extract/tools';

const execFile = promisify(execFileCb);

const AUDIO_DIR = resolve(process.cwd(), '.gamedata/extracted/audio/bgm');

/** Chemin de `ffprobe` : surcharge `FFPROBE`, sinon rapatrié de R2 (ensureTool). */
function ffprobeBin(): string {
  return process.env.FFPROBE ?? ensureTool(FFPROBE);
}

/** Une piste de l'OST : nom localisé (anglais toujours) + métadonnées. */
export interface BgmTrack {
  file: string;
  name: string;
  name_jp?: string;
  name_kr?: string;
  name_zh?: string;
  /** Taille du mp3 en Mo (2 décimales). */
  size: number;
  /** Durée en secondes (1 décimale). */
  duration: number;
}

/** Durée du mp3 via ffprobe (secondes, 1 décimale) — `null` si erreur de lecture. */
async function getDuration(ffprobe: string, filePath: string): Promise<number | null> {
  try {
    const { stdout } = await execFile(ffprobe, [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      filePath,
    ]);
    return Math.round(parseFloat(stdout.trim()) * 10) / 10;
  } catch {
    return null;
  }
}

/**
 * Nom lisible dérivé d'un nom de fichier (repli quand la piste n'a pas de ligne
 * lobby). `Boss_Season_01` → « Boss - Season 01 ». Logique reprise de la V2.
 */
function formatFilenameAsName(filename: string): string {
  let name = filename.replace(/_[Ii]ntro$/, '');
  const isIntro = name !== filename;

  name = name
    .replace(/_/g, ' ')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();

  name = name
    .split(' ')
    .map((w) =>
      w === w.toUpperCase() && w.length >= 2
        ? w
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join(' ');

  // NB : pas de séparateur « Préfixe - … » injecté ici. Les vrais tirets
  // (« Thema - Base », « Battle - Normal ») viennent du nom ANGLAIS du jeu
  // (`dict.en`) ; les pistes sans ligne lobby gardent un nom simple (« Battle
  // 02 »), comme la curation V2 — pas un tiret devant un numéro.
  if (isIntro) name += ' (Intro)';
  return name;
}

/**
 * Comparateur de noms de fichiers DÉTERMINISTE (indépendant de l'ICU).
 * `localeCompare` pèse la ponctuation à poids variable → un nom et ses variantes
 * suffixées `_x` peuvent comparer égaux, et l'ordre du JSON dériverait alors de
 * l'ordre de `readdirSync`. Comparaison par unités de code + départage exact.
 */
function byFileNameCI(a: string, b: string): number {
  const al = a.toLowerCase();
  const bl = b.toLowerCase();
  if (al !== bl) return al < bl ? -1 : 1;
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Index « fichier de ressource (minuscule) → nom localisé » depuis le lobby. */
function bgmNameIndex(): Map<string, LangDict> {
  const textById = new Map(loadTable('TextSystem').map((r) => [r.ID, r]));
  const idx = new Map<string, LangDict>();
  for (const row of loadTable('LobbyCustomResourceTemplet')) {
    if (row.Type !== 'LRT_BGM') continue;
    const dict = langDict(textById.get(row.NAME));
    if (!dict.en) continue;
    for (const part of (row.ResourceFile ?? '').split(',')) {
      const token = part.trim();
      if (token) idx.set(token.toLowerCase(), dict);
    }
  }
  return idx;
}

/** Construit le mapping de l'OST depuis les mp3 du pool extrait + les tables. */
export async function buildBgmMapping(): Promise<BgmTrack[]> {
  const stems = readdirSync(AUDIO_DIR)
    .filter((f) => f.toLowerCase().endsWith('.mp3'))
    .map((f) => parsePath(f).name);
  const present = new Set(stems.map((s) => s.toLowerCase()));

  // On écarte une piste `X_intro` si sa piste `X` existe aussi (l'intro seule est
  // alors un doublon) ; sinon on la garde (intro-only, ex. Boss_Season_01_intro).
  const kept = stems.filter((s) => {
    if (!/_intro$/i.test(s)) return true;
    return !present.has(s.replace(/_intro$/i, '').toLowerCase());
  });

  const names = bgmNameIndex();
  const ffprobe = ffprobeBin(); // résolu une fois (surcharge FFPROBE ou fetch R2)
  const tracks: BgmTrack[] = [];
  for (const stem of kept.sort(byFileNameCI)) {
    const dict = names.get(stem.toLowerCase());
    const path = resolve(AUDIO_DIR, `${stem}.mp3`);
    const track: BgmTrack = {
      file: stem,
      name: dict?.en || formatFilenameAsName(stem),
      size: Math.round((statSync(path).size / (1024 * 1024)) * 100) / 100,
      duration: (await getDuration(ffprobe, path)) ?? 0,
    };
    // Langues secondaires : émises seulement si distinctes de l'anglais (le jeu
    // laisse souvent le nom anglais en repli) — JSON lisible, consommateur `l()`
    // retombe sur `name` en l'absence de champ.
    if (dict) {
      if (dict.jp && dict.jp !== dict.en) track.name_jp = dict.jp;
      if (dict.kr && dict.kr !== dict.en) track.name_kr = dict.kr;
      if (dict.zh && dict.zh !== dict.en) track.name_zh = dict.zh;
    }
    tracks.push(track);
  }
  return tracks;
}

// Exécution directe = REVUE (impression), comme les autres générateurs ; le
// writer canonique de `bgm_mapping.json` est `datagen:build`.
if (isMain(import.meta.url)) {
  buildBgmMapping().then((tracks) => console.log(JSON.stringify(tracks, null, 2)));
}
