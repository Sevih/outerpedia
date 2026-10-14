/**
 * Une LIGNE des listes de l'extracteur de l'ancien panneau admin — le type
 * seul, descendu du composant `ExtractorSidebar` le 13/10 (lot C14). Son
 * dernier lecteur, `monster-rows.ts`, est supprimé (lot A51) : plus aucun
 * importeur, ni quick ni le site.
 */
export interface ExtractorRow {
  /** Clé de route (`basePath/<id>`) — encodée à l'affichage. */
  id: string;
  name: string;
  /** Ligne secondaire, après l'id (mode de jeu, grade…). */
  meta?: string;
  /** Troisième ligne (stage/zone, détail de contexte). */
  sub?: string;
  /** URL d'icône (FI_/MT_/sprite d'équipement) — masquée si 404. */
  icon?: string;
  /** Fond de slot derrière l'icône (rareté d'item, hiérarchie de monstre). */
  iconFrame?: string;
  /** Icône posée en RETRAIT du cadre (slots à bordure intégrée, GD_Slot_Bg_*). */
  iconInset?: boolean;
  /** Surimpressions du portrait (géométrie CharacterPortrait) : élément en
   * haut à droite, classe à droite au milieu, badge (BOSS) en haut à gauche. */
  elementIcon?: string;
  classIcon?: string;
  badgeIcon?: string;
  /** Étoiles (rareté), si pertinent. */
  stars?: number;
  /** `minor` : retouche mineure ou typo seule (s'applique sans ré-intégrer). */
  status?: 'new' | 'diff' | 'minor' | 'ok';
  /** Compteur d'écarts (diff extraction, anomalies…), affiché sur le badge. */
  count?: number;
  /** Petit glyphe accent après le statut (ex. « ✎ » = entité curée). */
  marker?: string;
  /** Marqueurs booléens filtrables par `toggles` (« site »…). */
  flags?: string[];
  /** Étiquettes filtrables par `tagFilter` (slugs de mode de jeu…). */
  tags?: string[];
}
