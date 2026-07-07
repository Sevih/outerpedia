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
        const src = resolve(V2_POOL(), req.source);
        if (!existsSync(src)) {
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
        // asset wiki V2 (icônes retravaillées/composées à la main).
        if (req.editorialFallback) {
          const fb = resolve(V2_POOL(), req.editorialFallback);
          if (existsSync(fb)) {
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
