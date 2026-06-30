/**
 * Registre des specs d'extraction.
 *
 * Une seule liste : la CLI, les routes admin et l'orchestrateur la consultent
 * pour découvrir les entités disponibles. Ajouter une entité = ajouter sa spec
 * ici, rien d'autre.
 */
import type { ExtractorSpec } from '../core/spec';
import { characterSpec } from './character';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- registre hétérogène (chaque spec a son TOut)
export const SPECS: Record<string, ExtractorSpec<any, any>> = {
  [characterSpec.id]: characterSpec,
};

/** Récupère une spec par id, ou `undefined`. */
export function getSpec(id: string): ExtractorSpec<unknown, unknown> | undefined {
  return SPECS[id];
}

/** Liste des ids d'entités extractibles. */
export function specIds(): string[] {
  return Object.keys(SPECS);
}
