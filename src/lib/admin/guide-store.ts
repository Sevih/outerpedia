/**
 * Écriture des GUIDES de la famille éditable — réservée à l'ADMIN local (dev-only).
 *
 * Un guide n'est pas un JSON curé centralisé mais un ARBRE de petits fichiers.
 * Deux stockages, choisis par le `CatSpec` de la catégorie :
 *   - VERSIONNÉ (joint-challenge) : `strings.json` + `versions/YYYY-MM/*.json` ;
 *   - PLAT (special-request, irregular…) : `strings/tips/recommended/teams/videos.json`
 *     à la racine, et « le monstre » dans `meta.json` (`meta.group`).
 * Le store réécrit au format canonique (`writeJson` → diffs stables) et sait
 * créer une nouvelle version en dupliquant une version existante.
 *
 * Validité des références : garantie par CONSTRUCTION côté éditeur (sélecteurs
 * sur la donnée réelle) ; le build la revérifie au rendu.
 */
import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { writeJson } from '@datagen/lib/json';
import { getGuide, readGuideFile, readGuideVersionFile } from '@/lib/data/guides';
import {
  fromContentDraft,
  fromFlatDraft,
  fromVersionDraft,
  guideSpec,
  toContentDraft,
  toFlatDraft,
  toVersionDraft,
  type GuideDraft,
  type RawConfig,
  type RawContent,
  type RawRecommended,
  type RawTeams,
  type RawTips,
} from '@/lib/admin/guide-draft';
import type { VideoItem } from '@/components/ui/MultiVideoEmbed';

const CONTENTS_DIR = resolve(process.cwd(), 'src/app/[lang]/guides/_contents');
const VERSION_KEY_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const VERSION_FILES = ['config.json', 'tips.json', 'recommended.json', 'teams.json'] as const;

/**
 * Dossier d'un guide, CONFINÉ sous `CONTENTS_DIR` — `null` si le couple
 * catégorie/slug s'en échappe.
 *
 * `resolve()` normalise les `..` : un `slug` forgé (jamais validé, il vient de
 * l'URL) désignait donc n'importe quel dossier du disque, où l'on se serait fait
 * écrire un `strings.json`. La `category`, elle, est déjà en liste blanche
 * (`guideSpec`). Confinement rendu STRUCTUREL — impossible d'oublier la garde à
 * un futur appel, puisqu'il faut traiter le `null`. Même idiome que la route
 * d'images (`src/app/images/[...path]/route.dev.ts`).
 */
const guideDir = (category: string, slug: string): string | null => {
  const full = resolve(CONTENTS_DIR, category, slug);
  return full.startsWith(CONTENTS_DIR + sep) ? full : null;
};

/** Erreur commune d'un chemin de guide hors périmètre. */
const outsideError = (category: string, slug: string): string[] => [
  `Invalid guide path : ${category}/${slug}`,
];

interface GuideStrings {
  intro?: { en: string } & Record<string, string>;
}

/** Écrit un fichier JSON, ou le SUPPRIME si `data` est `null`. */
async function writeOrRemove(path: string, data: unknown): Promise<void> {
  if (data === null) rmSync(path, { force: true });
  else await writeJson(path, data);
}

/** Lit un guide (versionné ou plat) dans le modèle plat éditable. */
export function loadGuideDraft(category: string, slug: string): GuideDraft {
  const guide = getGuide(category, slug);
  if (!guide) throw new Error(`Unknown guide : ${category}/${slug}`);
  const spec = guideSpec(category);
  if (!spec) throw new Error(`Non-editable category : ${category}`);

  if (spec.versioned) {
    const strings = readGuideFile<GuideStrings>(guide, 'strings.json');
    const versions = guide.versions.map((v) =>
      toVersionDraft(
        spec,
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

  if (spec.contentFile) {
    // content.json mono-fichier ; « le monstre » vient de meta (dungeons/bossId).
    return toContentDraft(
      spec,
      { dungeons: guide.dungeons, bossId: guide.bossId },
      readGuideFile<RawContent>(guide, 'content.json'),
    );
  }

  // Guide plat : « le monstre » vient de meta (`group`) ; contenu à la racine.
  return toFlatDraft(spec, guide.group, {
    strings: readGuideFile<GuideStrings>(guide, 'strings.json'),
    tips: readGuideFile<RawTips>(guide, 'tips.json'),
    recommended: readGuideFile<RawRecommended>(guide, 'recommended.json'),
    teams: readGuideFile<RawTeams>(guide, 'teams.json'),
    videos: readGuideFile<VideoItem[]>(guide, 'videos.json'),
  });
}

/** Fusionne un champ dans `meta.json` (préserve tout le reste ; vide supprime). */
async function patchGuideMeta(
  category: string,
  slug: string,
  key: 'group' | 'bossId' | 'dungeons',
  value: string | string[] | undefined,
): Promise<void> {
  const guide = getGuide(category, slug);
  if (!guide) return;
  const meta = (readGuideFile<Record<string, unknown>>(guide, 'meta.json') ?? {}) as Record<
    string,
    unknown
  >;
  const empty = value === undefined || (Array.isArray(value) && value.length === 0);
  if (empty) delete meta[key];
  else meta[key] = value;
  const dir = guideDir(category, slug);
  if (!dir) return; // hors périmètre (le guide existe pourtant : `getGuide` a répondu)
  await writeJson(resolve(dir, 'meta.json'), meta);
}

/** Valide puis écrit un guide. Renvoie les écarts bloquants (vide = OK). */
export async function saveGuideDraft(
  category: string,
  slug: string,
  draft: GuideDraft,
): Promise<string[]> {
  const spec = guideSpec(category);
  if (!spec) return [`Non-editable category : ${category}`];

  const errors: string[] = [];
  if (spec.introRequired && !draft.intro.en?.trim())
    errors.push('The guide intro (EN) is required.');
  const base = guideDir(category, slug);
  if (!base) return outsideError(category, slug);
  if (!existsSync(base)) return [`Guide folder missing : ${category}/${slug}`];

  if (spec.versioned) {
    for (const v of draft.versions) {
      if (!VERSION_KEY_RE.test(v.key)) errors.push(`Invalid version key : “${v.key}” (YYYY-MM).`);
    }
    if (errors.length) return errors;

    await writeJson(resolve(base, 'strings.json'), { intro: draft.intro });
    for (const v of draft.versions) {
      const vdir = resolve(base, 'versions', v.key);
      mkdirSync(vdir, { recursive: true });
      const payload = fromVersionDraft(spec, v);
      for (const file of VERSION_FILES) await writeOrRemove(resolve(vdir, file), payload[file]);
    }
    return [];
  }

  if (spec.contentFile) {
    const cv = draft.versions[0];
    if (spec.monster === 'dungeons-meta' && !cv?.dungeons?.length)
      errors.push('At least one dungeon is required.');
    if (spec.monster === 'bossId-meta' && !cv?.bossId) errors.push('A boss (monster) is required.');
    if (errors.length) return errors;

    if (spec.monster === 'dungeons-meta')
      await patchGuideMeta(category, slug, 'dungeons', cv.dungeons);
    if (spec.monster === 'bossId-meta') await patchGuideMeta(category, slug, 'bossId', cv.bossId);
    await writeJson(resolve(base, 'content.json'), fromContentDraft(spec, draft));
    return [];
  }

  // Guide plat.
  const v = draft.versions[0];
  if (spec.monster === 'group-meta' && !v?.group)
    errors.push('A battle (monster) is required for this guide.');
  if (errors.length) return errors;

  if (spec.monster === 'group-meta') await patchGuideMeta(category, slug, 'group', v.group);

  const payload = fromFlatDraft(spec, draft);
  for (const [file, data] of Object.entries(payload))
    await writeOrRemove(resolve(base, file), data);
  return [];
}

/**
 * Crée une nouvelle version (VERSIONNÉ). `fromKey` renseigné → duplique cette
 * version « pour servir de base » ; vide → version VIERGE (première version d'un
 * guide qui n'en a pas encore, ex. world-boss). Renvoie les écarts (vide = OK).
 */
export function addGuideVersion(
  category: string,
  slug: string,
  newKey: string,
  fromKey: string,
): string[] {
  // Catégorie en LISTE BLANCHE, comme `saveGuideDraft` : sans elle, le
  // `mkdirSync` plus bas créait un dossier parasite pour n'importe quelle
  // catégorie inventée — que le scanner de guides parcourt ensuite. Et cette
  // route n'a de sens que pour une catégorie VERSIONNÉE.
  const spec = guideSpec(category);
  if (!spec) return [`Non-editable category : ${category}`];
  if (!spec.versioned) return [`Category ${category} is not versioned.`];
  if (!VERSION_KEY_RE.test(newKey))
    return [`Version key expected in YYYY-MM format (received “${newKey}”).`];
  // `fromKey` est une clé de version comme `newKey` : même validation. Elle ne
  // servait qu'en lecture (dossier source à copier), mais non validée elle
  // désignait un dossier arbitraire dont on recopiait les `*.json` dans le guide.
  if (fromKey && !VERSION_KEY_RE.test(fromKey))
    return [`Source version key expected in YYYY-MM format (received “${fromKey}”).`];
  const base = guideDir(category, slug);
  if (!base) return outsideError(category, slug);
  const dst = resolve(base, 'versions', newKey);
  if (existsSync(dst)) return [`Version ${newKey} already exists.`];

  // Source vérifiée AVANT de créer la cible : sinon un `fromKey` introuvable
  // laissait derrière lui un dossier de version vide, que le scanner voit.
  const srcDir = fromKey ? resolve(base, 'versions', fromKey) : null;
  if (srcDir && !existsSync(srcDir)) return [`Source version not found : ${fromKey}.`];

  mkdirSync(dst, { recursive: true });
  if (srcDir) {
    for (const file of [...VERSION_FILES, 'version.json']) {
      const sp = resolve(srcDir, file);
      if (existsSync(sp)) copyFileSync(sp, resolve(dst, file));
    }
  }
  return [];
}
