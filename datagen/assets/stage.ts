/**
 * STAGING des assets : résout des demandes de manifest contre les images
 * EXTRAITES DU JEU, convertit en webp et dépose dans `.assets-staging/` (clés
 * bucket). Réutilisé par la CLI globale (`assets:collect`) ET par l'intégration
 * par entité dans l'admin.
 *
 * Idempotent : une cible déjà présente n'est pas refaite.
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';
import { makeFaceIcon } from './face-icon';
import type { AssetRequest } from './manifest';
import { findImage, type ImageIndex } from './source';

export const STAGING_DIR = resolve('.assets-staging');
const V2_POOL = () => resolve(process.env.V2_IMAGES_DIR ?? '../outerpedia-v2/public/images');
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

export interface StageResult {
  staged: number;
  present: number;
  missing: Array<{ key: string; reason: string }>;
}

/** Résout et dépose une liste de demandes. */
export async function stageAssets(
  requests: AssetRequest[],
  index: ImageIndex,
): Promise<StageResult> {
  const result: StageResult = { staged: 0, present: 0, missing: [] };

  for (const req of requests) {
    const dest = resolve(STAGING_DIR, req.key);
    if (existsSync(dest)) {
      result.present++;
      continue;
    }

    try {
      if (req.kind === 'editorial') {
        const src = editorialSource(req.source);
        if (!src) {
          result.missing.push({ key: req.key, reason: `éditorial absent du pool : ${req.source}` });
          continue;
        }
        mkdirSync(dirname(dest), { recursive: true });
        copyFileSync(src, dest);
        result.staged++;
        continue;
      }

      if (req.kind === 'face-icon') {
        const portrait = findImage(index, [`CT_${req.id}`]);
        if (!portrait) {
          result.missing.push({ key: req.key, reason: `portrait CT_${req.id} introuvable` });
          continue;
        }
        const buf = await makeFaceIcon(req.id, portrait, req.key.endsWith('.png') ? 'png' : 'webp');
        if (!buf) {
          result.missing.push({ key: req.key, reason: `layout FaceIcon absent pour ${req.id}` });
          continue;
        }
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, buf);
        result.staged++;
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
            mkdirSync(dirname(dest), { recursive: true });
            copyFileSync(fb, dest);
            result.staged++;
            continue;
          }
        }
        result.missing.push({ key: req.key, reason: `sprite introuvable : ${req.candidates[0]}` });
        continue;
      }
      mkdirSync(dirname(dest), { recursive: true });
      // PNG : variantes og:image (aperçus Discord/OG) ; webp partout ailleurs.
      if (req.key.endsWith('.png')) await sharp(src).png().toFile(dest);
      else await sharp(src).webp({ quality: 90 }).toFile(dest);
      result.staged++;
    } catch (e) {
      result.missing.push({ key: req.key, reason: `erreur : ${(e as Error).message}` });
    }
  }

  return result;
}
