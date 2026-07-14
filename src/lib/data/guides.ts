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
  GUIDE_TIERS,
  categoryRequires,
  isGuideCategory,
  isGuideTier,
  type GuideCategorySlug,
  type GuideTierKey,
} from '@/lib/data/guide-categories';

const CONTENTS_DIR = resolve(process.cwd(), 'src/app/[lang]/guides/_contents');

/** `meta.json` d'un guide (validé au scan — champs inconnus refusés). */
export interface GuideMeta {
  title: LocalizedText & { en: string };
  description: LocalizedText & { en: string };
  /** Sprite du jeu (namespace `images/ui/guides/`). */
  icon: string;
  author: string;
  /**
   * Date ISO `YYYY-MM-DD` de dernière mise à jour — MAINTENUE AUTOMATIQUEMENT
   * par le stamp au commit (`scripts/stamp-guides.ts`) : bumpée quand un fichier
   * pertinent du guide change (dernière version + fichiers partagés ; les
   * archives de versions ne comptent pas). Optionnelle : pour un guide
   * versionné, la date se dérive du dossier `versions/` le plus récent tant
   * qu'aucun stamp explicite n'existe. Résolue par `guideUpdatedDate`.
   */
  updated?: string;
  /**
   * Tri dans la catégorie (croissant ; absent = après les ordonnés).
   *
   * `adventure` lui donne un SENS en plus, et il est obligatoire pour elle :
   * `saison × 100 + épisode` (304 = S3, ép. 4). C'est la SEULE source de la
   * saison et de l'épisode AFFICHÉS — `encounters.season` découpe l'histoire en
   * blocs qui ne sont pas les saisons du jeu (la S2 y vaut 2 pour les épisodes
   * 1-5 et 3 pour les 6-10). Changer un `order` d'adventure déplace donc une
   * carte de section, ce n'est pas qu'un tri.
   */
  order?: number;
  /** Monstre lié (og:image, futur affichage) — id V3, jamais un chemin. */
  bossId?: string;
  /**
   * Le COMBAT que le guide traite (`DungeonRef.group`) — pour un mode PERMANENT
   * (Special Request…), où il n'y a pas de saison qui le porterait dans un
   * `versions/<clé>/config.json`. Opaque : il se lit dans
   * `data/generated/encounters.json`, il ne se fabrique jamais. Un group inconnu
   * casse le build au rendu (`BossEncounters`/`groupCombatants` jettent).
   */
  group?: string;
  /**
   * Les DONJONS que le guide couvre, du plus facile au plus dur — pour un mode
   * où le jeu ne relie RIEN entre eux. Les stages d'histoire (`adventure`, où
   * ce champ est obligatoire) n'ont ni `group` ni `difficulty` dans la donnée :
   * le Normal et le Hard d'un même stage sont deux donjons distincts, peuplés de
   * monstres distincts (Hilde 4500277 en Normal, 4500283 en Hard). Le lien doit
   * donc être DÉCLARÉ, là où les autres modes le lisent (`group`).
   *
   * Ids OPAQUES, lus dans `data/generated/encounters.json` — jamais fabriqués
   * par arithmétique (S2-5-10 = 120513 + 121511 : aucune règle ne les relie).
   * La vue en dérive tout le reste : mode (Normal/Hard), zone, nom du stage.
   */
  dungeons?: string[];
  /**
   * Palier pédagogique (`general-guides` uniquement, où il est OBLIGATOIRE —
   * cf. `requires` de la catégorie). Remplace la map `TIER_BY_SLUG` que la V2
   * tenait à la main dans son composant de liste.
   */
  tier?: GuideTierKey;
  /**
   * Position (%) du pin du guide sur l'ART de sa catégorie (`art` de
   * guide-categories) — la vue CARTE d'irregular-extermination, où elle est
   * obligatoire (cf. `requires`). `mobileTop` décale verticalement quand le
   * cadrage mobile l'exige (le libellé du pin passe alors sous la vignette).
   */
  mapPos?: { top: number; left: number; mobileTop?: number };
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
  'mapPos',
  'ogImage',
  'hidden',
  'tier',
  'group',
  'dungeons',
]);
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/**
 * Le slug est un SEGMENT D'URL, et une URL V2 ne se renomme pas.
 *
 * Les stages d'histoire sont publiés depuis toujours en majuscules
 * (`/guides/adventure/S3-4-10`) : la casse fait partie du contrat, la briser
 * coûterait 20 redirections pour rien. On tolère donc EXACTEMENT cette forme —
 * pas la casse en général : tout nouveau slug reste en kebab-case minuscule, et
 * un `S3-4-10` inventé dans une autre catégorie n'aurait aucune raison d'exister.
 */
const LEGACY_STAGE_SLUG_RE = /^S\d+-\d+-\d+$/;
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
  // `updated` optionnel (dérivé de la version la plus récente sinon) ; validé
  // seulement s'il est présent. La résolvabilité d'une date est vérifiée au
  // scan (un guide plat sans `updated` ni version → erreur).
  if (m.updated !== undefined && (typeof m.updated !== 'string' || !DATE_RE.test(m.updated))) {
    issues.push(`${at} : « updated » doit être une date ISO YYYY-MM-DD`);
    ok = false;
  }
  if (m.order !== undefined && typeof m.order !== 'number') {
    issues.push(`${at} : « order » doit être un nombre`);
    ok = false;
  }
  if (m.group !== undefined && (typeof m.group !== 'string' || !m.group)) {
    issues.push(`${at} : « group » doit être une chaîne non vide (DungeonRef.group)`);
    ok = false;
  }
  if (m.dungeons !== undefined) {
    const d = m.dungeons;
    if (!Array.isArray(d) || !d.length || d.some((id) => typeof id !== 'string' || !id)) {
      issues.push(
        `${at} : « dungeons » doit être un tableau NON VIDE d'ids de donjons` +
          ` (data/generated/encounters.json), du plus facile au plus dur`,
      );
      ok = false;
    }
  }
  if (m.mapPos !== undefined) {
    const p = m.mapPos as Record<string, unknown> | null;
    const pct = (v: unknown) => typeof v === 'number' && v >= 0 && v <= 100;
    const known = ['top', 'left', 'mobileTop'];
    if (
      !p ||
      typeof p !== 'object' ||
      Array.isArray(p) ||
      !pct(p.top) ||
      !pct(p.left) ||
      (p.mobileTop !== undefined && !pct(p.mobileTop)) ||
      Object.keys(p).some((k) => !known.includes(k))
    ) {
      issues.push(`${at} : « mapPos » attendu { top, left, mobileTop? } en pourcentages (0-100)`);
      ok = false;
    }
  }
  if (m.tier !== undefined && (typeof m.tier !== 'string' || !isGuideTier(m.tier))) {
    issues.push(
      `${at} : « tier » inconnu — attendu l'un de ${Object.keys(GUIDE_TIERS).join(', ')}` +
        ` (déclarés dans guide-categories.ts)`,
    );
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
      if (!SLUG_RE.test(slug) && !LEGACY_STAGE_SLUG_RE.test(slug)) {
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
      // Champs exigés par la VUE de la catégorie (ex. `tier` pour general-guides).
      // Sans ça, un guide non classé disparaîtrait de la page sans un bruit —
      // c'est exactement le trou de la V2 (map `TIER_BY_SLUG` dans le composant).
      for (const field of categoryRequires(category)) {
        if (meta[field] === undefined) {
          issues.push(
            `${at}/meta.json : « ${field} » est requis dans la catégorie « ${category} »` +
              ` (sa vue en dépend — cf. requires dans guide-categories.ts)`,
          );
        }
      }
      const versions = scanVersions(guideDir, at, issues);
      // Une date DOIT être résolvable : `updated` explicite, ou (guide versionné)
      // dérivée du dossier de version le plus récent. Un guide plat sans date
      // est une erreur — le stamp au commit la remplit, mais un contenu committé
      // ne doit jamais partir sans date (SEO/tri).
      if (!meta.updated && versions.length === 0) {
        issues.push(
          `${at}/meta.json : « updated » requis (guide sans version, aucune date à dériver)`,
        );
      }
      guides.push({ ...meta, category, slug, versions });
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

/**
 * Date de dernière mise à jour RÉSOLUE (ISO `YYYY-MM-DD`) : `updated` explicite
 * (maintenu par le stamp), sinon dérivée du dossier `versions/` le plus récent
 * (`YYYY-MM` → `YYYY-MM-01`). Le scan garantit qu'au moins l'une existe.
 */
export function guideUpdatedDate(guide: Pick<Guide, 'updated' | 'versions'>): string {
  if (guide.updated) return guide.updated;
  const newest = guide.versions[0]?.key;
  return newest ? `${newest}-01` : '';
}

/** Guides VISIBLES d'une catégorie, triés (order croissant, puis plus récent). */
export function listGuidesByCategory(category: GuideCategorySlug): Guide[] {
  return allGuides()
    .filter((g) => g.category === category && !g.hidden)
    .sort(
      (a, b) =>
        (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) ||
        guideUpdatedDate(b).localeCompare(guideUpdatedDate(a)) ||
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

/**
 * Lit un fichier de données à la RACINE d'un guide
 * (`_contents/<cat>/<slug>/<fichier>`). `undefined` si absent.
 *
 * Pendant de `readGuideVersionFile` : c'est ce qui permet à un rendu PARTAGÉ
 * (VersionedBossGuide…) d'aller chercher lui-même le contenu du guide qu'il rend,
 * sans que chaque `index.tsx` ait à l'importer et à le lui passer.
 */
export function readGuideFile<T>(
  guide: Pick<Guide, 'category' | 'slug'>,
  file: string,
): T | undefined {
  const p = resolve(CONTENTS_DIR, guide.category, guide.slug, file);
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
