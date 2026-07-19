/**
 * Accès au DOMAINE RECRUTEMENT (`data/generated/recruit.json`) : pool du
 * Custom Recruit, taux/coûts par type de bannière, apparitions bannière des
 * persos limited. Donnée générée → import statique figé (même choix que
 * characters.ts).
 */
import type { RecruitBanner, RecruitData, RecruitKind, RecruitKindInfo } from '@contracts';
import recruitData from '@data/generated/recruit.json';

const RECRUIT = recruitData as unknown as RecruitData;

let customSet: Set<string> | undefined;

/** Le perso (id) est-il recrutable au Custom Recruit ? */
export function isInCustomRecruitPool(id: string): boolean {
  return (customSet ??= new Set(RECRUIT.customPool)).has(id);
}

/** Fiche taux/coûts d'un type de bannière — inconnu = bug de données, on jette. */
export function getRecruitKind(kind: RecruitKind): RecruitKindInfo {
  const info = RECRUIT.kinds.find((k) => k.kind === kind);
  if (!info) throw new Error(`recruit : type de bannière inconnu « ${kind} »`);
  return info;
}

/**
 * Apparitions bannière d'un perso (chronologiques). La première est sa
 * RELEASE, la dernière son dernier passage — les selections (`*-selection`)
 * sont des reruns groupés « choisis un ancien limited ».
 */
export function bannersOf(characterId: string): RecruitBanner[] {
  return RECRUIT.banners.filter((b) => b.characterId === characterId);
}

/**
 * Bannières ACTIVES à la date `today` (`YYYY-MM-DD`, UTC) — `start <= today <=
 * end`. Alimente la section « bannières actives » de l'accueil.
 */
export function activeBanners(today: string): RecruitBanner[] {
  return RECRUIT.banners.filter((b) => b.start <= today && b.end >= today);
}
