/**
 * Écriture des GUIDES versionnés — réservée à l'ADMIN local (dev-only).
 *
 * Un guide n'est pas un JSON curé centralisé mais un ARBRE de petits fichiers
 * (`strings.json` + `versions/YYYY-MM/{config,tips,recommended,teams}.json`).
 * Le store lit cet arbre dans le modèle plat (`guide-draft`), le réécrit au
 * format canonique (`writeJson` → diffs stables), et sait créer une nouvelle
 * version en dupliquant une version existante « pour servir de base ».
 *
 * Validité des références (group, noms de persos) : garantie par CONSTRUCTION
 * côté éditeur (sélecteurs sur la donnée réelle) ; le build la revérifie au rendu
 * (un tag/perso/group inconnu jette). On ne re-valide donc pas ici.
 */
import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeJson } from '@datagen/lib/json';
import { getGuide, readGuideFile, readGuideVersionFile } from '@/lib/data/guides';
import {
  fromVersionDraft,
  toVersionDraft,
  type GuideDraft,
  type RawConfig,
  type RawRecommended,
  type RawTeams,
  type RawTips,
} from '@/lib/admin/guide-draft';

const CONTENTS_DIR = resolve(process.cwd(), 'src/app/[lang]/guides/_contents');
const VERSION_KEY_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const VERSION_FILES = ['config.json', 'tips.json', 'recommended.json', 'teams.json'] as const;

const guideDir = (category: string, slug: string) => resolve(CONTENTS_DIR, category, slug);

interface GuideStrings {
  intro: { en: string } & Record<string, string>;
}

/** Lit un guide versionné dans le modèle plat éditable (versions plus récente d'abord). */
export function loadGuideDraft(category: string, slug: string): GuideDraft {
  const guide = getGuide(category, slug);
  if (!guide) throw new Error(`Guide inconnu : ${category}/${slug}`);
  const strings = readGuideFile<GuideStrings>(guide, 'strings.json');
  const versions = guide.versions.map((v) =>
    toVersionDraft(
      v.key,
      {
        config: readGuideVersionFile<RawConfig>(guide, v.key, 'config.json'),
        tips: readGuideVersionFile<RawTips>(guide, v.key, 'tips.json'),
        recommended: readGuideVersionFile<RawRecommended>(guide, v.key, 'recommended.json'),
        teams: readGuideVersionFile<RawTeams>(guide, v.key, 'teams.json'),
      },
      v.label,
    ),
  );
  return { intro: strings?.intro ?? { en: '' }, versions };
}

/** Valide puis écrit un guide. Renvoie les écarts bloquants (vide = OK). */
export async function saveGuideDraft(
  category: string,
  slug: string,
  draft: GuideDraft,
): Promise<string[]> {
  const errors: string[] = [];
  if (!draft.intro.en?.trim()) errors.push('L’intro du guide (EN) est requise.');
  for (const v of draft.versions) {
    if (!VERSION_KEY_RE.test(v.key))
      errors.push(`Clé de version invalide : « ${v.key} » (YYYY-MM).`);
  }
  if (errors.length) return errors;

  const base = guideDir(category, slug);
  if (!existsSync(base)) return [`Dossier de guide absent : ${category}/${slug}`];

  await writeJson(resolve(base, 'strings.json'), { intro: draft.intro });
  for (const v of draft.versions) {
    const vdir = resolve(base, 'versions', v.key);
    mkdirSync(vdir, { recursive: true });
    const payload = fromVersionDraft(v);
    for (const file of VERSION_FILES) {
      const p = resolve(vdir, file);
      const data = payload[file];
      if (data === null) rmSync(p, { force: true });
      else await writeJson(p, data);
    }
  }
  return [];
}

/**
 * Crée une nouvelle version en DUPLIQUANT une version existante (fichiers copiés
 * tels quels, `version.json` inclus). Le scan la découvre au prochain rendu (dev
 * re-scanne à chaque requête). Renvoie les écarts bloquants (vide = OK).
 */
export function addGuideVersion(
  category: string,
  slug: string,
  newKey: string,
  fromKey: string,
): string[] {
  if (!VERSION_KEY_RE.test(newKey))
    return [`Clé de version attendue au format YYYY-MM (reçu « ${newKey} »).`];
  const base = guideDir(category, slug);
  const dst = resolve(base, 'versions', newKey);
  if (existsSync(dst)) return [`La version ${newKey} existe déjà.`];
  const srcDir = resolve(base, 'versions', fromKey);
  if (!existsSync(srcDir)) return [`Version source introuvable : ${fromKey}.`];

  mkdirSync(dst, { recursive: true });
  for (const file of [...VERSION_FILES, 'version.json']) {
    const sp = resolve(srcDir, file);
    if (existsSync(sp)) copyFileSync(sp, resolve(dst, file));
  }
  return [];
}
