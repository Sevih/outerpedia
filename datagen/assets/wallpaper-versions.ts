/**
 * VERSIONS ARCHIVÉES d'un wallpaper — quand le jeu REMPLACE un asset EN PLACE.
 *
 * La rétention de catalogue (`promote`, `RETAIN_CATALOGS`) couvre un asset que
 * le jeu RETIRE : le fichier reste sur R2, l'entrée est retenue. Elle ne peut
 * rien contre un asset que le jeu REMPLACE sous le même nom : le push renvoie
 * le nouveau contenu sous la même clé, R2 n'a pas de versionnage, et l'ancien
 * visuel n'existe plus nulle part. Vécu le 22/09/2026 : refonte complète de
 * 2000035 (full-art `IMG_2000035`, cutin `T_CutIn_2000035`, plus son skin
 * 2010035) — l'ancien art n'a survécu que dans une extraction Android du 25/08.
 *
 * Règle : l'ancienne version devient un fichier À PART, suffixé `@<n>` (n = 1
 * pour la plus ancienne), rangé dans le pool ÉDITORIAL
 * (`.editorial/wallpapers/<cat>/<stem>@<n>.{png,webp}`) — le seul pool DURABLE
 * du projet (miroir R2 `editorial/`, cf. editorial.ts), que `collect-wallpapers`
 * collecte déjà. Le générateur en fait une entrée `retired` du catalogue :
 * l'onglet « Archivés » de `/wallpapers` la sert comme n'importe quel asset
 * retiré. Le stem archivé garde le nom du jeu + suffixe (`T_CutIn_2000035@1`),
 * donc les règles par préfixe (Full:Events/Scenario) et le filtre perso
 * (`isUnreleasedCharacterAsset`, id lu en tête) s'appliquent inchangés.
 *
 * DÉTECTION (`collect-wallpapers`) : au moment de recopier un fichier du pool
 * jeu vers le staging, la copie DÉJÀ en staging est la version publiée. Si elle
 * diffère VISUELLEMENT du pool (`looksDifferent`), elle part en archive avant
 * d'être écrasée. Visuellement, pas au sha1 : un ré-encodage (autre version de
 * sharp, d'AssetStudio, migration Windows → Fedora du 28/08) change l'octet sans
 * changer l'image — les pushs du 08/09 et du 22/09 ont ainsi remplacé ~1 800
 * clés dont 7 seulement portaient un vrai changement. Corollaire : la détection
 * suppose un staging qui reflète R2 (`pnpm assets:pull` sur une machine neuve).
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import sharp from 'sharp';

/** Pool éditorial des wallpapers (versions archivées + faits main Outerpedia). */
export const EDITORIAL_WALLPAPERS = resolve('.editorial/wallpapers');

const VERSION_RE = /^(.+)@(\d+)$/;

/** `T_CutIn_2000035@1` → vrai ; `T_CutIn_2000035` → faux. */
export function isArchivedVersion(stem: string): boolean {
  return VERSION_RE.test(stem);
}

/** Décompose un stem archivé : `{ base, n }`, ou `null` s'il ne l'est pas. */
export function parseVersion(stem: string): { base: string; n: number } | null {
  const m = VERSION_RE.exec(stem);
  return m ? { base: m[1], n: Number(m[2]) } : null;
}

/** Prochain numéro libre pour `base` dans `.editorial/wallpapers/<cat>` (1 si aucun). */
export function nextVersion(category: string, base: string, root = EDITORIAL_WALLPAPERS): number {
  const dir = join(root, category);
  if (!existsSync(dir)) return 1;
  let max = 0;
  for (const f of readdirSync(dir)) {
    const v = parseVersion(f.replace(/\.[^.]+$/, ''));
    if (v && v.base === base && v.n > max) max = v.n;
  }
  return max + 1;
}

/**
 * Seuil de différence VISUELLE : écart moyen par canal (0–255) sur une réduction
 * 64×64, RGB PRÉMULTIPLIÉ par l'alpha. Prémultiplié parce que sous un pixel
 * transparent le png du jeu garde une couleur arbitraire que l'encodage webp
 * efface : comparés bruts, les 222 full-arts perso « différaient » tous (MAD 7 à
 * 90 sur le RGB, ~1 sur l'alpha — mesuré le 25/09/2026, 222 archives parasites).
 * Prémultiplié, mesuré sur tout le pool : le bruit d'encodage plafonne à 0,5
 * entre textures Android (ETC/ASTC) et Steam (DXT), à 5,2 entre le webp q90
 * publié et son png source (bords semi-transparents des full-arts). Les vrais
 * changements du 22/09 vont de 9,5 (un perso retouché en arrière-plan d'un fond
 * d'événement) à 45 (refonte du cutin). Le seuil se place entre les deux.
 */
export const MAD_THRESHOLD = 7;

/**
 * Écart visuel entre deux images (formats libres) : dimensions différentes → `Infinity`.
 *
 * sharp reçoit le CONTENU, jamais le chemin : ouvert par chemin, un webp reste
 * tenu par le cache de libvips jusqu'à la fin du processus — sous Windows, il
 * ne peut alors plus être réécrit ni supprimé (EPERM/UNKNOWN ; Linux, lui,
 * laisse faire). Or l'appelant compare justement la version publiée AVANT de
 * l'écraser.
 */
export async function visualDistance(a: string, b: string): Promise<number> {
  const [da, db] = await Promise.all([readFile(a), readFile(b)]);
  const [ma, mb] = await Promise.all([sharp(da).metadata(), sharp(db).metadata()]);
  if (ma.width !== mb.width || ma.height !== mb.height) return Infinity;
  const [A, B] = await Promise.all(
    [da, db].map((d) => sharp(d).resize(64, 64, { fit: 'fill' }).ensureAlpha().raw().toBuffer()),
  );
  let sum = 0;
  for (let i = 0; i < A.length; i += 4) {
    const aa = A[i + 3] / 255;
    const ab = B[i + 3] / 255;
    for (let c = 0; c < 3; c++) sum += Math.abs(A[i + c] * aa - B[i + c] * ab);
    sum += Math.abs(A[i + 3] - B[i + 3]);
  }
  return sum / A.length;
}

/** Les deux images diffèrent-elles VISUELLEMENT (au-delà du bruit d'encodage) ? */
export async function looksDifferent(a: string, b: string): Promise<boolean> {
  return (await visualDistance(a, b)) >= MAD_THRESHOLD;
}

/**
 * Archive des fichiers (même stem, extensions libres) comme version `<base>@<n>`
 * de la catégorie, dans le pool éditorial. Retourne le stem archivé.
 */
export function archiveSuperseded(
  category: string,
  base: string,
  files: string[],
  root = EDITORIAL_WALLPAPERS,
): string {
  const stem = `${base}@${nextVersion(category, base, root)}`;
  const dir = join(root, category);
  mkdirSync(dir, { recursive: true });
  for (const f of files) copyFileSync(f, join(dir, `${stem}${extname(f).toLowerCase()}`));
  return stem;
}
