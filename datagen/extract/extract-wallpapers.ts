/**
 * extract-wallpapers — sort les fonds d'écran (wallpapers) du jeu, en V3 native.
 *
 * Porté de `outerpedia-v2/pipeline/steps/wallpapers.ts` (règles identiques —
 * même jeu) mais recâblé V3 : on SCANNE le pool d'images DÉJÀ extrait
 * (`.gamedata/extracted/images/`, produit par `extract.ts`), on ne ré-extrait
 * rien. Trois temps :
 *   1. SCAN + FILTRE : tous les PNG du pool → exclusions (EXCLUDE_PATTERNS),
 *      largeur mini (MIN_WIDTH), puis catégorisation (Cutin/Full/Banner/Art).
 *   2. DÉDUP        : hash perceptuel 16×16 gris ; les quasi-doublons sont
 *      regroupés, on garde le meilleur représentant (getPriorityScore).
 *   3. ÉCRITURE     : par entrée retenue, un `.webp` (affichage, réencodé sharp)
 *      ET un `.png` (téléchargement, copié verbatim depuis la source).
 *
 * CONTRAT DE NOMMAGE (à ne PAS casser) : le stem du fichier RESTE le nom d'asset
 * du jeu (`T_ScenarioCG_A0106`, `T_CutIn_2000001`…) — c'est la clé que lit le
 * générateur `wallpapers.json` (buildWallpapers), qui scinde Full en
 * Full:Events/Full:Scenario/Full:Others par préfixe. On ne produit QUE les
 * fichiers ; la catégorie éditoriale Outerpedia + le mapping vivent ailleurs.
 *
 * HeroFullArt (IMG_<id>) EXCLU par décision : ces full-arts perso sont déjà
 * extraits/hébergés et RÉUTILISÉS tels quels par le générateur — on ne les
 * ré-extrait pas ici (cf. `/^IMG_\d+/` dans EXCLUDE_PATTERNS).
 *
 * Sortie : `.gamedata/extracted/wallpapers/{Cutin,Full,Banner,Art}/<name>.{webp,png}`
 * — pool V3-owned, gitignoré, artefact de build (comme l'audio). `assets/collect`
 * le collecte ensuite vers le staging.
 *
 * Usage : `pnpm datagen:extract-wallpapers` (autonome), OU branché sur l'ombrelle
 * `pnpm datagen:extract [all]` via `runWallpapers()` (cf. extract.ts).
 * Outillage : sharp (dédup perceptuelle + webp), pas de binaire externe.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  openSync,
  readSync,
  closeSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import sharp from 'sharp';
import { isMain } from '../lib/is-main';

const ROOT = resolve('.gamedata');
const SRC_IMAGES = resolve(ROOT, 'extracted/images');
const OUT_WP = resolve(ROOT, 'extracted/wallpapers');

/** Largeur minimale d'un candidat wallpaper (rejette les petites UI). */
const MIN_WIDTH = 250;
/** Qualité webp d'affichage (le png reste la source lossless pour le download). */
const WEBP_QUALITY = 90;

interface CategoryDef {
  name: string;
  match: (name: string, w: number, h: number) => boolean;
}

/**
 * Ordre SIGNIFICATIF (premier match gagne) — identique à la V2, MOINS
 * HeroFullArt (réutilisé ailleurs, cf. en-tête). Full est dimensionnel, les
 * autres sont par nom.
 */
const CATEGORIES: CategoryDef[] = [
  { name: 'Full', match: (_n, w, h) => w === 2048 && h === 1024 },
  { name: 'Banner', match: (n) => /_Banner_/.test(n) },
  { name: 'Cutin', match: (n) => /^T_CutIn_/i.test(n) },
  { name: 'Art', match: (n) => /^T_Demi_/.test(n) },
];

/** Blocklist de noms (verbatim V2) + `^IMG_` (HeroFullArt réutilisé ailleurs). */
const EXCLUDE_PATTERNS: RegExp[] = [
  /#/,
  /^T_FX_/,
  /(?:^T_.+_(d|body|cloud|a))/i,
  /^FX_/,
  /^T_DL/,
  /^LOADING_/,
  /^T_\d+/,
  /^sactx/i,
  /^\d+_/,
  /^GUIDE_/,
  /^T_Scenario_/,
  /^TT_ImageBox_/,
  /(noise|planet|ring|moon|lava|rock)/i,
  /^Tex_/,
  /(star|space|throne|sun|magic|lobby)/i,
  /_UI/,
  /(leaves|ruins|room|package)/i,
  /^T_PopUP/,
  /^Day_/,
  /^T_Recruit_Normal\.png$/,
  /^T_Dialog_Title\.png$/,
  /^T_Event_World_/,
  /^Lightmap-/,
  /^Patch_Download_/,
  /^T_RaidBG_/,
  /^T_MC/,
  /^T_Intelligence/,
  /^T_Intro/,
  /^CLG_/,
  /^CM_/,
  /^IG_/,
  /^T_GuildRaidBG_/,
  /^T_MonadGate_/,
  /^T_ScenarioBG_\d+/,
  /^T_ScenarioBG_Ending/,
  /^T_(Water|Wind|Snow|Hologram|Emblem|Burn|Blood|Agit)/,
  /^T_Event_(Coin|Box)/,
  /^colormap_/,
  /^mask_/,
  /^PVP_/,
  /^S02/,
  /^SDF_/,
  /^T_Chase/,
  /^T_Core/,
  /^T_Light/,
  /^T_Nebula/,
  /^T_Banner_/,
  // HeroFullArt : full-arts perso (IMG_<id>) réutilisés tels quels, pas ré-extraits.
  /^IMG_\d+/,
];

/** Blocklist de CHEMIN (verbatim V2) : textures de modèles 3D. */
const EXCLUDE_PATH_PATTERNS: RegExp[] = [/model[\\/]textures/];

interface FileInfo {
  path: string;
  name: string;
  width: number;
  height: number;
  category: string;
  hash?: string;
}

/**
 * Score de priorité pour choisir le représentant d'un groupe de doublons
 * (verbatim V2) : CG scénario > BG scénario > BG event > CG event ; `_E2`
 * bonifié ; les IMG_ (exclus ici) sont départagés par id décroissant.
 */
function getPriorityScore(filename: string): number {
  let score = 0;
  if (filename.includes('T_ScenarioCG_')) score += 100;
  else if (filename.includes('T_ScenarioBG_')) score += 80;
  else if (filename.includes('T_Event_BG_')) score += 20;
  else if (filename.includes('T_Event_CG')) score += 10;
  if (filename.includes('_E2')) score += 50;
  if (filename.startsWith('IMG_')) {
    const match = filename.match(/IMG_(\d+)/);
    if (match) score -= parseInt(match[1], 10) / 1000;
  }
  return score;
}

/** Tous les fichiers image (png/jpg/webp) sous `dir`, récursif. */
function getAllFiles(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) getAllFiles(full, files);
    else if (/\.(png|jpg|webp)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

function shouldExclude(filePath: string, fileName: string): boolean {
  return (
    EXCLUDE_PATTERNS.some((p) => p.test(fileName)) ||
    EXCLUDE_PATH_PATTERNS.some((p) => p.test(filePath))
  );
}

function getCategory(name: string, w: number, h: number): string | null {
  for (const c of CATEGORIES) if (c.match(name, w, h)) return c.name;
  return null;
}

/** Dimensions d'un PNG par lecture de l'en-tête IHDR (24 octets) — sans décoder. */
function pngDimensions(filePath: string): { width: number; height: number } | null {
  try {
    const buf = Buffer.alloc(24);
    const fd = openSync(filePath, 'r');
    readSync(fd, buf, 0, 24, 0);
    closeSync(fd);
    if (buf.toString('hex', 0, 8) !== '89504e470d0a1a0a') return null;
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  } catch {
    return null;
  }
}

/** Dimensions : en-tête PNG (bon marché) sinon sharp (jpg/webp éventuels). */
async function readDims(filePath: string): Promise<{ width: number; height: number } | null> {
  if (/\.png$/i.test(filePath)) {
    const d = pngDimensions(filePath);
    if (d) return d;
  }
  try {
    const m = await sharp(filePath).metadata();
    if (m.width && m.height) return { width: m.width, height: m.height };
  } catch {
    /* illisible */
  }
  return null;
}

/**
 * Hash perceptuel 16×16 gris (verbatim V2) : moyenne des 256 pixels, bit à 1
 * si > moyenne, empaqueté en hexa. Deux images visuellement proches → même hash.
 */
async function computePerceptualHash(filePath: string): Promise<string | null> {
  try {
    const { data } = await sharp(filePath)
      .resize(16, 16, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    const avg = sum / data.length;
    let bits = '';
    for (let i = 0; i < data.length; i++) bits += data[i] > avg ? '1' : '0';
    let hex = '';
    for (let i = 0; i < bits.length; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
    return hex;
  } catch {
    return null;
  }
}

/** 1) Scan du pool d'images → candidats filtrés + catégorisés. */
async function scanAndFilter(): Promise<FileInfo[]> {
  const all = getAllFiles(SRC_IMAGES);
  const valid: FileInfo[] = [];
  for (const path of all) {
    const name = basename(path);
    if (shouldExclude(path, name)) continue;
    const dims = await readDims(path);
    if (!dims || dims.width < MIN_WIDTH) continue;
    const category = getCategory(name, dims.width, dims.height);
    if (!category) continue;
    valid.push({ path, name, width: dims.width, height: dims.height, category });
  }
  return valid;
}

/** 2) Dédup perceptuelle : marque à écarter tout sauf le meilleur par hash. */
async function detectDuplicates(files: FileInfo[]): Promise<Set<string>> {
  const byHash = new Map<string, FileInfo[]>();
  for (const f of files) {
    const hash = await computePerceptualHash(f.path);
    if (!hash) continue;
    f.hash = hash;
    (byHash.get(hash) ?? byHash.set(hash, []).get(hash)!).push(f);
  }
  const skip = new Set<string>();
  for (const [, group] of byHash) {
    if (group.length < 2) continue;
    group.sort((a, b) => getPriorityScore(b.name) - getPriorityScore(a.name));
    for (const f of group.slice(1)) skip.add(f.path);
  }
  return skip;
}

/**
 * 3) Écriture par entrée retenue : webp (sharp) + png (copie verbatim). Gère la
 * collision de nom dans une catégorie (dims différentes → suffixe `_N`, comme
 * la V2) ; le suffixe fait alors partie du stem lu par le générateur.
 */
async function writeOutputs(files: FileInfo[], skip: Set<string>): Promise<Map<string, number>> {
  for (const c of CATEGORIES) mkdirSync(join(OUT_WP, c.name), { recursive: true });
  const counts = new Map<string, number>();
  const taken = new Map<string, { width: number; height: number }>();
  for (const f of files) {
    if (skip.has(f.path)) continue;
    let destName = f.name;
    const key = () => `${f.category}/${destName}`;
    if (taken.has(key())) {
      const prev = taken.get(key())!;
      if (prev.width === f.width && prev.height === f.height) continue; // vrai doublon exact
      const ext = extname(f.name);
      const base = basename(f.name, ext);
      let i = 1;
      do {
        destName = `${base}_${i}${ext}`;
        i++;
      } while (taken.has(key()));
    }
    const stem = basename(destName, extname(destName));
    const dir = join(OUT_WP, f.category);
    copyFileSync(f.path, join(dir, `${stem}.png`));
    await sharp(f.path)
      .webp({ quality: WEBP_QUALITY })
      .toFile(join(dir, `${stem}.webp`));
    taken.set(key(), { width: f.width, height: f.height });
    counts.set(f.category, (counts.get(f.category) ?? 0) + 1);
  }
  return counts;
}

/** Extraction complète des wallpapers — appelable seul ou depuis l'ombrelle. */
export async function runWallpapers(): Promise<void> {
  if (!existsSync(SRC_IMAGES)) {
    throw new Error(
      `images extraites absentes (${SRC_IMAGES}) — lance d'abord \`pnpm datagen:extract images\`.`,
    );
  }
  console.log('↻ scan des wallpapers depuis le pool d’images extrait...');
  const candidates = await scanAndFilter();
  const skip = await detectDuplicates(candidates);

  // Sortie propre : les webp/png sont dérivés, on repart de zéro (déterministe).
  rmSync(OUT_WP, { recursive: true, force: true });
  const counts = await writeOutputs(candidates, skip);

  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  const detail = CATEGORIES.map((c) => `${c.name}=${counts.get(c.name) ?? 0}`).join(', ');
  console.log(
    `✅ Wallpapers extraits : ${total} (${detail}) — ${skip.size} quasi-doublons écartés → ${OUT_WP}`,
  );
}

if (isMain(import.meta.url)) {
  runWallpapers().catch((e) => {
    console.error(`\n\x1b[31mErreur : ${e?.message ?? e}\x1b[0m`);
    process.exit(1);
  });
}
