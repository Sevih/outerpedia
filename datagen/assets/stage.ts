/**
 * STAGING des assets : résout des demandes de manifest contre les images
 * EXTRAITES DU JEU, convertit en webp et dépose dans `.assets-staging/` (clés
 * bucket). Réutilisé par la CLI globale (`assets:collect`) ET par l'intégration
 * par entité dans l'admin.
 *
 * Incrémental : une cible n'est REFAITE que si ses sources ont changé.
 *
 * « Changé » ne peut PAS se juger sur la date seule : AssetStudio réécrit les
 * ~14 000 images à chaque `datagen:extract`, ce qui périmerait tout le staging
 * sans qu'un pixel ait bougé (et relancerait 4 600 conversions sharp). Ni sur la
 * simple existence de la cible, comme avant : une image corrigée en gardant son
 * nom n'était alors jamais reconstruite, et la correction n'atteignait même pas
 * le push. On tient donc un état (`.assets-staging/.stage-state.json`), sur le
 * modèle du stat-cache de git :
 *   - `sig`  = taille+mtime des sources → chemin RAPIDE, aucune lecture disque ;
 *   - `hash` = empreinte du CONTENU des sources (+ recette de conversion) →
 *     arbitre quand la `sig` a bougé, et absout une ré-extraction à l'identique.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';
import { v2ImagesDir } from '../lib/env';
import { FACE_ICON_LAYOUT, makeFaceIcon } from './face-icon';
import type { AssetRequest } from './manifest';
import { findImage, type ImageIndex } from './source';

export const STAGING_DIR = resolve('.assets-staging');
// Racine machine-dépendante → V2_DIR/.env.local (cf. datagen/lib/env).
const V2_POOL = () => v2ImagesDir();
/**
 * Pool éditorial de la V3 — assets qui n'existent PAS dans le jeu et que le
 * wiki produit lui-même (icône corrigée d'un effet que les tables affublent du
 * sprite d'un autre…). Mêmes chemins relatifs que le pool V2, mais VERSIONNÉ
 * dans le repo : la V2 est la prod, on n'y écrit pas, et un asset qui ne vit
 * que sur une machine finit par manquer à la collecte suivante.
 *
 * Consulté AVANT la V2 : la V3 corrige, la V2 n'est qu'un héritage.
 * Fichier SOURCE, jamais servi — `assets:collect` le dépose dans le staging,
 * `assets:push` l'envoie au R2 (le build CI ne le lit pas et l'image Docker ne
 * l'embarque pas : elle ne copie que .next + public).
 */
const V3_EDITORIAL = () => resolve('data/editorial');

/** Premier pool contenant `rel` (V3 d'abord, V2 en héritage) — undefined sinon. */
function editorialSource(rel: string): string | undefined {
  for (const pool of [V3_EDITORIAL(), V2_POOL()]) {
    const p = resolve(pool, rel);
    if (existsSync(p)) return p;
  }
  return undefined;
}

// --- état de fraîcheur ----------------------------------------------------------

interface StageEntry {
  /** `taille:mtime` de chaque source, jointes par `|`. */
  sig: string;
  /** sha1 du contenu des sources + de la recette. */
  hash: string;
}
const STATE_FILE = resolve(STAGING_DIR, '.stage-state.json');
let stateCache: Record<string, StageEntry> | null = null;

function state(): Record<string, StageEntry> {
  if (!stateCache) {
    try {
      stateCache = JSON.parse(readFileSync(STATE_FILE, 'utf8')) as Record<string, StageEntry>;
    } catch {
      stateCache = {}; // absent ou illisible : on repart d'un état vide (cf. `check`)
    }
  }
  return stateCache;
}

/** Grave l'état sur disque. Appelé en fin de `stageAssets` — jamais aux appelants d'y penser. */
function saveState(): void {
  if (!stateCache) return;
  const sorted = Object.fromEntries(
    Object.entries(stateCache).sort(([a], [b]) => a.localeCompare(b)),
  );
  mkdirSync(STAGING_DIR, { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(sorted, null, 2) + '\n');
}

/** Signature taille+mtime : comparable sans rien lire. */
function sigOf(sources: string[]): string {
  return sources
    .map((s) => {
      const st = statSync(s);
      return `${st.size}:${Math.floor(st.mtimeMs)}`;
    })
    .join('|');
}

/** Empreinte du CONTENU des sources, salée par la recette (change de format → refait). */
function hashOf(sources: string[], recipe: string): string {
  const h = createHash('sha1').update(recipe);
  for (const s of sources) h.update(readFileSync(s));
  return h.digest('hex');
}

interface Freshness {
  /** La cible est à jour : rien à refaire. */
  fresh: boolean;
  /** À appeler UNIQUEMENT après une production réussie (sinon un échec sharp
   *  graverait « à jour » sur une cible restée vieille). */
  commit: () => void;
}

function check(key: string, dest: string, sources: string[], recipe: string): Freshness {
  const noop = () => {};
  if (!existsSync(dest)) {
    // Pas de cible : à produire, et on ne peut pas encore graver l'état.
    const sig = sigOf(sources);
    const hash = hashOf(sources, recipe);
    return { fresh: false, commit: () => void (state()[key] = { sig, hash }) };
  }

  const prev = state()[key];
  const sig = sigOf(sources);
  if (prev?.sig === sig) return { fresh: true, commit: noop }; // chemin rapide : zéro lecture

  const hash = hashOf(sources, recipe);
  // Cible présente mais inconnue de l'état (staging antérieur à ce mécanisme) :
  // on l'ADOPTE au lieu de reconstruire les 4 600 fichiers d'un coup. Le premier
  // run enregistre, les suivants détectent les vraies modifications.
  const fresh = prev ? prev.hash === hash : true;
  const commit = () => void (state()[key] = { sig, hash });
  if (fresh) commit(); // ré-extraction à l'identique : on rafraîchit juste la `sig`
  return { fresh, commit };
}

// --- staging --------------------------------------------------------------------

export interface StageResult {
  /** Produites (cible absente). */
  staged: number;
  /** REFAITES (cible présente mais périmée — une source a changé). */
  restaged: number;
  /** Déjà à jour. */
  present: number;
  missing: Array<{ key: string; reason: string }>;
}

/** Résout et dépose une liste de demandes. */
export async function stageAssets(
  requests: AssetRequest[],
  index: ImageIndex,
): Promise<StageResult> {
  const result: StageResult = { staged: 0, restaged: 0, present: 0, missing: [] };

  for (const req of requests) {
    const dest = resolve(STAGING_DIR, req.key);
    // Cible déjà là ET périmée = correction d'un asset existant, pas un ajout.
    const existed = existsSync(dest);
    const produced = () => (existed ? result.restaged++ : result.staged++);

    try {
      if (req.kind === 'editorial') {
        const src = editorialSource(req.source);
        if (!src) {
          result.missing.push({ key: req.key, reason: `éditorial absent du pool : ${req.source}` });
          continue;
        }
        // Copie verbatim — SAUF quand la clé demande du PNG depuis une source
        // qui n'en est pas (variantes og:image d'icônes du pool webp) : les
        // aperçus Discord/OG digèrent mal le WebP, on convertit comme pour les
        // sprites extraits (branche `image` plus bas).
        const toPng = req.key.endsWith('.png') && !req.source.endsWith('.png');
        const { fresh, commit } = check(req.key, dest, [src], toPng ? 'png' : 'copy');
        if (fresh) {
          result.present++;
          continue;
        }
        mkdirSync(dirname(dest), { recursive: true });
        if (toPng) await sharp(src).png().toFile(dest);
        else copyFileSync(src, dest);
        commit();
        produced();
        continue;
      }

      if (req.kind === 'face-icon') {
        const portrait = findImage(index, [`CT_${req.id}`]);
        if (!portrait) {
          result.missing.push({ key: req.key, reason: `portrait CT_${req.id} introuvable` });
          continue;
        }
        const format = req.key.endsWith('.png') ? 'png' : 'webp';
        // Le layout est une source à part entière : un cadrage corrigé doit refaire l'icône.
        const { fresh, commit } = check(
          req.key,
          dest,
          [portrait, FACE_ICON_LAYOUT],
          `face-icon:${format}`,
        );
        if (fresh) {
          result.present++;
          continue;
        }
        const buf = await makeFaceIcon(req.id, portrait, format);
        if (!buf) {
          result.missing.push({ key: req.key, reason: `layout FaceIcon absent pour ${req.id}` });
          continue;
        }
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, buf);
        commit();
        produced();
        continue;
      }

      const src = findImage(index, req.candidates);
      if (!src) {
        // Repli éditorial : sprite absent de l'extraction mais existant comme
        // asset wiki (pool V3 d'abord, pool V2 en héritage — icônes
        // retravaillées/composées à la main).
        if (req.editorialFallback) {
          const fb = editorialSource(req.editorialFallback);
          if (fb) {
            const { fresh, commit } = check(req.key, dest, [fb], 'copy');
            if (fresh) {
              result.present++;
              continue;
            }
            mkdirSync(dirname(dest), { recursive: true });
            copyFileSync(fb, dest);
            commit();
            produced();
            continue;
          }
        }
        result.missing.push({ key: req.key, reason: `sprite introuvable : ${req.candidates[0]}` });
        continue;
      }

      // PNG : variantes og:image (aperçus Discord/OG) ; webp partout ailleurs.
      const png = req.key.endsWith('.png');
      const { fresh, commit } = check(req.key, dest, [src], png ? 'png' : 'webp:90');
      if (fresh) {
        result.present++;
        continue;
      }
      mkdirSync(dirname(dest), { recursive: true });
      if (png) await sharp(src).png().toFile(dest);
      else await sharp(src).webp({ quality: 90 }).toFile(dest);
      commit();
      produced();
    } catch (e) {
      result.missing.push({ key: req.key, reason: `erreur : ${(e as Error).message}` });
    }
  }

  saveState();
  return result;
}
