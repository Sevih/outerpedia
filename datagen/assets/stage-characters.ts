/**
 * Staging des images de PERSOS DÉJÀ INTÉGRÉS dont l'entrée vient de changer —
 * l'étape 5 de l'intégration (`characterAssetRequests` → `stageAssets`), rejouée
 * pour QUELQUES ids seulement, jamais toute la collecte.
 *
 * Branché aux trois écritures de `characters.json` qui ne passent pas par
 * l'intégration : la validation d'une cible et l'application des retouches
 * mineures (revue admin, `extractor/review.ts`), et `promote --apply` (CLI,
 * `promote.ts`). Cas vécu le 06/10/2026 : un costume ajouté par le jeu passait
 * « Valider toute l'extraction » sans que son full art ni le visage de son
 * apparence existent — il fallait ré-intégrer le perso pour les voir.
 *
 * GARDE PERSO : l'appelant ne passe que des ids déjà dans le committé ; ici on
 * ignore en plus tout id absent de `characters` — un perso non intégré n'est
 * jamais stagé par ce chemin. Incrémental comme la collecte : une image déjà à
 * jour est comptée `present`, pas refaite.
 *
 * `deps` injectables (index d'images, staging) : testable sans `.gamedata` ni
 * écriture dans `.assets-staging/`.
 */
import { characterAssetRequests, skillIconsOf, type AssetRequest } from './manifest';
import { buildImageIndex, type ImageIndex } from './source';
import { stageAssets, type StageResult } from './stage';
import { diffRecords } from '../extractor/core/changes';

type Dict = Record<string, unknown>;

export interface StageCharactersDeps {
  /** Index des images extraites du jeu (défaut : `buildImageIndex`). */
  index?: () => ImageIndex;
  /** Dépôt des demandes dans le staging (défaut : `stageAssets`). */
  stage?: (requests: AssetRequest[], index: ImageIndex) => Promise<StageResult>;
}

/** Bilan vide — rien à stager (aucun id, ou aucun connu de `characters`). */
export const emptyStage = (): StageResult => ({ staged: 0, restaged: 0, present: 0, missing: [] });

/**
 * Ids présents des deux côtés dont l'entrée diffère : les persos INTÉGRÉS que
 * l'écriture de `fresh` par-dessus `committed` modifie (les nouveaux, non
 * intégrés, n'y sont jamais). Même moteur que la revue (`diffRecords`).
 */
export function changedIntegratedIds(committed: Dict, fresh: Dict): string[] {
  return diffRecords(committed, fresh).changed.map((e) => e.key);
}

/**
 * Met en place les images manquantes des persos `ids` (lus dans `characters`,
 * icônes de skills résolues dans `skills`). Les demandes sont dédupliquées par
 * clé, comme dans le manifest global (deux persos peuvent partager un visage).
 */
export async function stageCharacterAssets(
  ids: Iterable<string>,
  characters: Dict,
  skills: Record<string, Dict>,
  deps: StageCharactersDeps = {},
): Promise<StageResult> {
  const requests: AssetRequest[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    const c = characters[id];
    if (!c || typeof c !== 'object' || Array.isArray(c)) continue;
    const char = c as Dict;
    for (const r of characterAssetRequests(char, skillIconsOf(char, skills))) {
      if (seen.has(r.key)) continue;
      seen.add(r.key);
      requests.push(r);
    }
  }
  if (!requests.length) return emptyStage();
  const index = (deps.index ?? buildImageIndex)();
  return (deps.stage ?? stageAssets)(requests, index);
}
