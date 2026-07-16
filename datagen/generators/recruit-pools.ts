/**
 * Générateur — POOLS DE RECRUTEMENT (`recruit-pools.json`).
 *
 * Sert le guide « Free Heroes & Start Banner » : la section « pas encore
 * disponible dans la Custom Banner » se dérive du POOL RÉEL du Custom Recruit
 * au lieu d'une liste éditoriale maintenue par exclusion (le trou de la V2 :
 * un perso oublié des listes passait silencieusement pour « pas encore là »).
 *
 *   RecruitGroupTemplet        (RecruitType = CUSTOM)       → GroupID
 *     → RecruitGradeRecipeTemplet (GroupID, RecipeType CHARACTER) → GradeGroupID
 *       → RecruitRecipeTemplet    (GradeGroupID)            → CharacterID
 *
 * Le pool contient TOUS les grades recrutables (2★ inclus) : c'est au
 * consommateur de croiser avec la rareté/les tags des persos. Un CharacterID
 * du pool inconnu de CharacterTemplet casse la génération (table désynchronisée).
 */
import { isMain } from '../lib/is-main';
import { loadTable } from '../lib/tables';

/** `data/generated/recruit-pools.json` */
export interface RecruitPoolsData {
  /** Ids de persos recrutables au Custom Recruit (tous grades confondus). */
  custom: string[];
}

export function buildRecruitPools(): RecruitPoolsData {
  // Plusieurs groupes CUSTOM possibles au fil des patchs : on prend l'union.
  const customGroups = new Set(
    loadTable('RecruitGroupTemplet')
      .filter((g) => g.RecruitType === 'CUSTOM')
      .map((g) => g.ID),
  );
  if (customGroups.size === 0) {
    throw new Error('recruit-pools : aucun groupe CUSTOM dans RecruitGroupTemplet');
  }
  const gradeGroups = new Set(
    loadTable('RecruitGradeRecipeTemplet')
      .filter((r) => customGroups.has(r.GroupID) && r.RecipeType === 'CHARACTER')
      .map((r) => r.ID),
  );
  const custom = new Set(
    loadTable('RecruitRecipeTemplet')
      .filter((r) => gradeGroups.has(r.GradeGroupID))
      .map((r) => r.CharacterID),
  );

  const known = new Set(loadTable('CharacterTemplet').map((c) => c.ID));
  const unknown = [...custom].filter((id) => !known.has(id));
  if (unknown.length) {
    throw new Error(
      `recruit-pools : CharacterID inconnus dans le pool custom — ${unknown.join(', ')}`,
    );
  }

  // Tri stable pour des diffs propres.
  return { custom: [...custom].sort((a, b) => a.localeCompare(b)) };
}

// Exécution directe.
if (isMain(import.meta.url)) {
  console.log(JSON.stringify(buildRecruitPools(), null, 2));
}
