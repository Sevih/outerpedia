/**
 * Ordres canoniques de l'équipement — source UNIQUE (ces constantes vivaient en
 * 3 copies `GRADE_RANK`/`GRADE_ORDER` et 2 copies `PIECE_ORDER`, à ré-aligner à
 * la main si le jeu ajoutait un grade ou une pièce).
 */

/** Rang d'un grade d'équipement (normal < magic < rare < unique). */
export const GRADE_RANK: Record<string, number> = { normal: 0, magic: 1, rare: 2, unique: 3 };

/** Ordre fixe des pièces d'armure. */
export const PIECE_ORDER = ['helmet', 'armor', 'gloves', 'shoes'] as const;
