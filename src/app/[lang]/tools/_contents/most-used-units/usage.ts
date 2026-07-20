import { listGuides, readGuideFile, readGuideVersionFile, type Guide } from '@/lib/data/guides';
import type { GuideCategorySlug } from '@/lib/data/guide-categories';
import type { Character } from '@contracts';
import { findCharacterByName } from '@/lib/data/characters';

/**
 * Catégories comptées (ordre d'affichage des pills et des sections) — celles
 * dont les guides recommandent des persos. `general-guides`, `monad-gate` et
 * `other` sont hors périmètre (parité V2 : pas de reco par perso exploitable).
 */
export const USAGE_CATEGORIES = [
  'world-boss',
  'joint-challenge',
  'guild-raid',
  'adventure',
  'adventure-license',
  'special-request',
  'irregular-extermination',
  'dimensional-singularity',
  'skyward-tower',
] as const satisfies readonly GuideCategorySlug[];

export type UsageCategory = (typeof USAGE_CATEGORIES)[number];

/**
 * Fichiers de données susceptibles de porter des recommandations, toutes
 * familles confondues — lus dans la DERNIÈRE version pour un guide versionné
 * (l'outil mesure la méta COURANTE, parité V2), à la racine sinon. Chaque
 * famille n'en possède qu'un sous-ensemble (`undefined` = absent, ignoré) :
 * recommended/teams (boss plats), content (BossGuide/StoryBossGuide/tours),
 * main/subA/subB (moteur guild-raid).
 */
const DATA_FILES = [
  'recommended.json',
  'teams.json',
  'content.json',
  'main.json',
  'subA.json',
  'subB.json',
];

/**
 * Récolte les NOMS ÉDITORIAUX de persos d'un nœud JSON de guide, par
 * convention STRUCTURELLE et non par famille : partout dans les contenus V3,
 * les persos recommandés vivent dans `characters: string[]` (groupes de reco,
 * étages de tour, équipes DS) ou `slots: string[][]` (compositions d'équipe —
 * boss plats, versions world-boss/joint-challenge, moteur guild-raid). Une
 * collecte par forme couvre les 9 familles sans un extracteur chacune (le
 * pipeline V2 en avait 4) et suit d'elle-même l'ajout d'une section.
 */
function harvestNames(node: unknown, out: Set<string>): void {
  if (Array.isArray(node)) {
    for (const item of node) harvestNames(item, out);
    return;
  }
  if (!node || typeof node !== 'object') return;
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if ((key === 'characters' || key === 'slots') && Array.isArray(value)) {
      for (const v of value.flat()) if (typeof v === 'string' && v) out.add(v);
    } else {
      harvestNames(value, out);
    }
  }
}

/** Usage d'un perso : les guides où il est recommandé, groupés par catégorie. */
export type CharacterUsage = Map<UsageCategory, Guide[]>;

/**
 * Agrège « qui est recommandé où » sur TOUS les guides visibles des catégories
 * comptées. Calculé à la lecture des fichiers de guides (pas d'artefact généré
 * committé comme en V2 — même régime que le reste de l'éditorial, la page ISR
 * absorbe le coût). Un nom inconnu JETTE (build cassé, doctrine bruyante) : ces
 * mêmes noms passent par `resolveGuideCharacter` au rendu du guide, une faute
 * de frappe doit exploser ici aussi, pas disparaître du classement.
 */
export function computeUsage(): Map<Character, CharacterUsage> {
  const result = new Map<Character, CharacterUsage>();
  const counted = new Set<string>(USAGE_CATEGORIES);

  for (const guide of listGuides()) {
    if (guide.hidden || !counted.has(guide.category)) continue;

    const names = new Set<string>();
    const newest = guide.versions[0]?.key;
    for (const file of DATA_FILES) {
      const data = newest
        ? readGuideVersionFile<unknown>(guide, newest, file)
        : readGuideFile<unknown>(guide, file);
      if (data !== undefined) harvestNames(data, names);
    }

    for (const name of names) {
      const character = findCharacterByName(name);
      if (!character) {
        throw new Error(
          `most-used-units : personnage inconnu « ${name} » dans ${guide.category}/${guide.slug}`,
        );
      }
      const usage = result.get(character) ?? new Map<UsageCategory, Guide[]>();
      const list = usage.get(guide.category as UsageCategory) ?? [];
      list.push(guide);
      usage.set(guide.category as UsageCategory, list);
      result.set(character, usage);
    }
  }
  return result;
}
