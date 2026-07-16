/**
 * Accès aux POOLS DE RECRUTEMENT (`data/generated/recruit-pools.json`).
 * Donnée générée → import statique figé (même choix que characters.ts).
 */
import type { RecruitPoolsData } from '@contracts';
import recruitPools from '@data/generated/recruit-pools.json';

const POOLS = recruitPools as RecruitPoolsData;

let customSet: Set<string> | undefined;

/** Le perso (id) est-il recrutable au Custom Recruit ? */
export function isInCustomRecruitPool(id: string): boolean {
  return (customSet ??= new Set(POOLS.custom)).has(id);
}
