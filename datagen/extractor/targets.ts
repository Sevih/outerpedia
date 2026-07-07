/**
 * Registre des CIBLES générées — le pont entre un fichier `data/generated/*` et
 * la façon de le RECONSTRUIRE à neuf (pour la revue de maintenance).
 *
 * L'orchestrateur (`build.ts`) écrit ces fichiers ; la revue, elle, a besoin de
 * reproduire le même contenu EN MÉMOIRE pour le confronter au committé. Une cible
 * = un fichier + un `build()` pur. Ajouter une entité = ajouter une ligne ici.
 */
import { buildCharacters } from './specs/character';

export interface GeneratedTarget {
  /** Identifiant CLI/route : `character`, `weapon`… */
  id: string;
  /** Libellé humain pour l'UI. */
  label: string;
  /** Chemin RELATIF dans `data/generated/`. */
  file: string;
  /** Reconstruit la donnée fraîche (clé d'entité → objet), comme `build.ts`. */
  build(): Record<string, unknown>;
}

export const TARGETS: GeneratedTarget[] = [
  {
    id: 'character',
    label: 'Personnages',
    file: 'characters.json',
    build: () => buildCharacters().characters as unknown as Record<string, unknown>,
  },
];

export function getTarget(id: string): GeneratedTarget | undefined {
  return TARGETS.find((t) => t.id === id);
}
