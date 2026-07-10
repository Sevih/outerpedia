/**
 * Data layer des GUIDES — un guide = UN dossier, zéro registre manuel.
 *
 * `src/app/[lang]/guides/_contents/<category>/<slug>/` contient :
 *   - `meta.json`     : métadonnées (titre/description localisés, icône, auteur…) ;
 *   - `index.tsx`     : le contenu (Server Component, importé dynamiquement) ;
 *   - `versions/YYYY-MM/` (optionnel) : versions datées AUTO-DÉCOUVERTES — la
 *     plus récente est le défaut, le libellé se dérive de la date (override
 *     possible via `version.json`).
 *
 * Le registre est le SCAN de ce dossier : `_index.json` et sa double
 * comptabilité V2 n'existent plus. La validation est BRUYANTE : un meta.json
 * invalide, un slug orphelin ou un dossier de version mal nommé font échouer
 * le build au lieu d'un notFound() silencieux. Clé = (category, slug) — deux
 * catégories peuvent porter le même slug.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type { LocalizedText } from '@contracts';
import { LANGUAGES, type Lang } from '@/lib/i18n/config';
import {
  GUIDE_CATEGORIES,
  isGuideCategory,
  type GuideCategorySlug,
} from '@/lib/data/guide-categories';

const CONTENTS_DIR = resolve(process.cwd(), 'src/app/[lang]/guides/_contents');

/** `meta.json` d'un guide (validé au scan — champs inconnus refusés). */
export interface GuideMeta {
  title: LocalizedText & { en: string };
  description: LocalizedText & { en: string };
  /** Sprite du jeu (namespace `images/ui/guides/`). */
  icon: string;
  author: string;
  /** Date ISO `YYYY-MM-DD` de dernière mise à jour éditoriale. */
  updated: string;
  /** Tri dans la catégorie (croissant ; absent = après les ordonnés). */
  order?: number;
  /** Monstre lié (og:image, futur affichage) — id V3, jamais un chemin. */
  bossId?: string;
  /** og:image explicite (chemin `/images/...`, PNG/JPG par convention). */
  ogImage?: string;
  /** Exclu des listes/compteurs mais accessible en URL directe (comme V2). */
  hidden?: boolean;
}

/** Une version datée d'un guide (dossier `versions/YYYY-MM/`). */
export interface GuideVersion {
  /** Clé = nom du dossier (`2026-03`) — sert aussi d'ancre `#version=`. */
  key: string;
  /** Libellé override (`version.json`) ; sinon dérivé de la date. */
  label?: LocalizedText;
}

export interface Guide extends GuideMeta {
  category: GuideCategorySlug;
  slug: string;
  /** Versions découvertes, la plus récente d'abord. `[]` si non versionné. */
  versions: GuideVersion[];
}

const META_KEYS = new Set([
  'title',
  'description',
  'icon',
  'author',
  'updated',
  'order',
  'bossId',
  'ogImage',
  'hidden',
]);
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const VERSION_DIR_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function readJson(path: string, issues: string[]): unknown {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    issues.push(`${path} : JSON invalide (${e instanceof Error ? e.message : e})`);
    return null;
  }
}

/** Valide un meta.json ; alimente `issues` (chemin inclus) et rend le meta typé. */
function parseMeta(raw: unknown, at: string, issues: string[]): GuideMeta | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    issues.push(`${at} : doit être un objet`);
    return null;
  }
  const m = raw as Record<string, unknown>;
  for (const k of Object.keys(m)) {
    if (!META_KEYS.has(k)) issues.push(`${at} : champ inconnu « ${k} »`);
  }
  const text = (k: 'title' | 'description'): boolean => {
    const v = m[k] as Record<string, unknown> | undefined;
    if (!v || typeof v !== 'object' || typeof v.en !== 'string' || !v.en) {
      issues.push(`${at} : « ${k} » doit être un objet localisé avec au moins { en }`);
      return false;
    }
    return true;
  };
  let ok = text('title') && text('description');
  for (const k of ['icon', 'author'] as const) {
    if (typeof m[k] !== 'string' || !m[k]) {
      issues.push(`${at} : « ${k} » (string) est requis`);
      ok = false;
    }
  }
  if (typeof m.updated !== 'string' || !DATE_RE.test(m.updated)) {
    issues.push(`${at} : « updated » doit être une date ISO YYYY-MM-DD`);
    ok = false;
  }
  if (m.order !== undefined && typeof m.order !== 'number') {
    issues.push(`${at} : « order » doit être un nombre`);
    ok = false;
  }
  return ok ? (m as unknown as GuideMeta) : null;
}

/** Découvre les versions datées d'un guide (la plus récente d'abord). */
function scanVersions(guideDir: string, at: string, issues: string[]): GuideVersion[] {
  const dir = resolve(guideDir, 'versions');
  if (!existsSync(dir)) return [];
  const versions: GuideVersion[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      issues.push(`${at}/versions : « ${entry.name} » n'est pas un dossier de version`);
      continue;
    }
    if (!VERSION_DIR_RE.test(entry.name)) {
      issues.push(`${at}/versions/${entry.name} : nom attendu YYYY-MM (tri chronologique)`);
      continue;
    }
    let label: LocalizedText | undefined;
    const vjson = resolve(dir, entry.name, 'version.json');
    if (existsSync(vjson)) {
      const raw = readJson(vjson, issues) as { label?: LocalizedText } | null;
      if (raw?.label && typeof raw.label === 'object') label = raw.label;
    }
    versions.push({ key: entry.name, ...(label ? { label } : {}) });
  }
  // Clés ISO YYYY-MM : le tri lexical inverse = ordre chronologique inverse.
  return versions.sort((a, b) => b.key.localeCompare(a.key));
}

function scan(): Guide[] {
  const issues: string[] = [];
  const guides: Guide[] = [];

  if (!existsSync(CONTENTS_DIR)) {
    throw new Error(`Guides : dossier de contenus absent (${CONTENTS_DIR})`);
  }
  for (const catEntry of readdirSync(CONTENTS_DIR, { withFileTypes: true })) {
    if (!catEntry.isDirectory()) continue;
    const category = catEntry.name;
    if (!isGuideCategory(category)) {
      issues.push(
        `_contents/${category} : catégorie non déclarée dans guide-categories.ts` +
          ` (catégories connues : ${Object.keys(GUIDE_CATEGORIES).join(', ')})`,
      );
      continue;
    }
    const catDir = resolve(CONTENTS_DIR, category);
    for (const slugEntry of readdirSync(catDir, { withFileTypes: true })) {
      if (!slugEntry.isDirectory()) continue;
      const slug = slugEntry.name;
      const at = `_contents/${category}/${slug}`;
      if (!SLUG_RE.test(slug)) {
        issues.push(`${at} : slug non kebab-case`);
        continue;
      }
      const guideDir = resolve(catDir, slug);
      const metaPath = resolve(guideDir, 'meta.json');
      if (!existsSync(metaPath)) {
        issues.push(`${at} : meta.json manquant`);
        continue;
      }
      if (!existsSync(resolve(guideDir, 'index.tsx'))) {
        issues.push(`${at} : index.tsx manquant (le meta existe mais pas le contenu)`);
        continue;
      }
      const meta = parseMeta(readJson(metaPath, issues), `${at}/meta.json`, issues);
      if (!meta) continue;
      guides.push({ ...meta, category, slug, versions: scanVersions(guideDir, at, issues) });
    }
  }
  if (issues.length) {
    throw new Error(`Guides : contenu invalide —\n  - ${issues.join('\n  - ')}`);
  }
  return guides;
}

// Scan caché en prod (contenu figé au build) ; relu à chaque appel en dev pour
// voir immédiatement un guide ajouté/modifié (même choix que data/curated).
let cache: Guide[] | undefined;
function allGuides(): Guide[] {
  if (process.env.NODE_ENV !== 'production') return scan();
  return (cache ??= scan());
}

/** Tous les guides (y compris `hidden`). */
export function listGuides(): Guide[] {
  return allGuides();
}

/** Guides VISIBLES d'une catégorie, triés (order croissant, puis plus récent). */
export function listGuidesByCategory(category: GuideCategorySlug): Guide[] {
  return allGuides()
    .filter((g) => g.category === category && !g.hidden)
    .sort(
      (a, b) =>
        (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) ||
        b.updated.localeCompare(a.updated) ||
        a.slug.localeCompare(b.slug),
    );
}

/** Compteur de guides visibles par catégorie. */
export function countGuides(category: GuideCategorySlug): number {
  return allGuides().filter((g) => g.category === category && !g.hidden).length;
}

/** Un guide par (catégorie, slug) — `undefined` si inconnu. */
export function getGuide(category: string, slug: string): Guide | undefined {
  if (!isGuideCategory(category)) return undefined;
  return allGuides().find((g) => g.category === category && g.slug === slug);
}

/** Paramètres SSG de toutes les pages détail (guides cachés inclus). */
export function listGuideParams(): Array<{ category: GuideCategorySlug; slug: string }> {
  return allGuides().map((g) => ({ category: g.category, slug: g.slug }));
}

/**
 * Lit un fichier de données d'une VERSION d'un guide
 * (`_contents/<cat>/<slug>/versions/<clé>/<fichier>`). `undefined` si absent —
 * chaque guide décide quels fichiers sont obligatoires pour lui.
 */
export function readGuideVersionFile<T>(
  guide: Pick<Guide, 'category' | 'slug'>,
  versionKey: string,
  file: string,
): T | undefined {
  const p = resolve(CONTENTS_DIR, guide.category, guide.slug, 'versions', versionKey, file);
  if (!existsSync(p)) return undefined;
  return JSON.parse(readFileSync(p, 'utf8')) as T;
}

/** Props reçues par le composant de contenu d'un guide (`index.tsx`). */
export interface GuideContentProps {
  lang: Lang;
  /** L'enregistrement du guide (meta + versions découvertes). */
  guide: Guide;
}

/** Date éditoriale formatée pour l'affichage (`2026-03-24` → « Mar 24, 2026 »). */
export function formatGuideDate(iso: string, lang: Lang): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(LANGUAGES[lang].htmlLang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Libellé d'une version : override du `version.json` s'il existe, sinon dérivé
 * de la clé (`2026-03` → « March 2026 » / « mars 2026 » / « 2026年3月 »…).
 */
export function guideVersionLabel(version: GuideVersion, lang: Lang): string {
  const override = version.label?.[lang] ?? version.label?.en;
  if (override) return override;
  const [y, m] = version.key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(LANGUAGES[lang].htmlLang, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
