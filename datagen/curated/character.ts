/**
 * Couche CURÉE — personnages.
 *
 * Connaissance HUMAINE qui n'existe pas dans les `.bytes` (tiers, rôle, tags,
 * priorité de skills, vidéo…). Stockée séparément de l'extraction
 * (`data/curated/characters.json`, clé = ID perso) pour SURVIVRE à une
 * régénération ; éditée localement via l'admin ; fusionnée à la lecture.
 */
import type { Schema } from '../extractor/core/validate';

/** Rôle de combat (classification humaine). */
export type CuratedRole = 'dps' | 'support' | 'sustain';

/** Priorité de montée des compétences (ordre conseillé). */
export interface SkillPriority {
  first?: number;
  second?: number;
  ultimate?: number;
}

/** Texte curé localisé (langues de jeu + fr communautaire), partiel. */
export type LocalizedText = Partial<Record<'en' | 'jp' | 'kr' | 'zh' | 'fr', string>>;

/** Référence vidéo curée (riche). `title`/`author`/`uploadDate` sont fetchés
 * depuis YouTube ; la miniature se dérive de l'id (pas stockée). */
export interface VideoRef {
  platform: string;
  id: string;
  title?: string;
  author?: string;
  /** Date de publication ISO (JSON-LD VideoObject / SEO). */
  uploadDate?: string;
}

/** Points forts / faibles curés (texte localisé, placeholders de buff conservés). */
export interface ProsCons {
  pros?: LocalizedText[];
  cons?: LocalizedText[];
}

/**
 * Un groupe de synergie : partenaires (IDS de persos — format V3, plus de
 * slugs) + raison partagée (tags inline `{B/…}` résolus par parse-text).
 * Format SIMPLIFIÉ vs V2 (`partner[].hero[]` + LangMap dupliquée ×4) : les
 * langues identiques à l'anglais ne sont plus stockées (repli `en`).
 */
export interface SynergyGroup {
  heroes: string[];
  reason?: LocalizedText;
}

/** Contenu curé d'un personnage (tout optionnel : on ne stocke que le connu). */
export interface CharacterCurated {
  /** Tier PvE (S, A, B…). */
  rank?: string;
  /** Tier PvP. */
  rankPvp?: string;
  /** Rôle de combat. */
  role?: CuratedRole;
  /**
   * Étiquettes purement HUMAINES — aujourd'hui `free` seul.
   *
   * Tout le reste du vocabulaire (premium/limited/seasonal/collab, ignore-defense,
   * core-fusion) est DÉRIVÉ DU JEU par l'extraction (`Character.tags`) : ne pas
   * le recopier ici, il serait dupliqué et divergerait à la première régénération.
   * `free` n'a aucun marqueur dans les tables (les persos offerts sont malgré
   * tout présents dans les pools de tirage) → il reste curé.
   * Le vocabulaire et son sens vivent dans `data/curated/tags.json`.
   */
  tags?: string[];
  /** Priorité de montée des compétences. */
  skillPriority?: SkillPriority;
  /** Tier PvE selon le palier de transcendance (transStar → tier). */
  rankByTranscend?: Record<string, string>;
  /** Rôle selon le palier de transcendance (transStar → rôle). */
  roleByTranscend?: Record<string, string>;
  /** Vidéos (liste curée, riche : titre/auteur). */
  videos?: VideoRef[];
  /** Points forts / faibles. */
  prosCons?: ProsCons;
  /** Groupes de synergie (partenaires conseillés + raison). */
  synergies?: SynergyGroup[];
}

export const characterCuratedSchema: Schema = {
  kind: 'object',
  fields: {
    rank: { kind: 'string', optional: true },
    rankPvp: { kind: 'string', optional: true },
    role: { kind: 'string', enum: ['dps', 'support', 'sustain'], optional: true },
    tags: { kind: 'array', of: { kind: 'string' }, optional: true },
    skillPriority: {
      kind: 'object',
      optional: true,
      fields: {
        first: { kind: 'number', int: true, optional: true },
        second: { kind: 'number', int: true, optional: true },
        ultimate: { kind: 'number', int: true, optional: true },
      },
    },
    rankByTranscend: { kind: 'record', of: { kind: 'string' }, optional: true },
    roleByTranscend: { kind: 'record', of: { kind: 'string' }, optional: true },
    videos: {
      kind: 'array',
      optional: true,
      of: {
        kind: 'object',
        fields: {
          platform: { kind: 'string' },
          id: { kind: 'string' },
          title: { kind: 'string', optional: true },
          author: { kind: 'string', optional: true },
          uploadDate: { kind: 'string', optional: true },
        },
      },
    },
    prosCons: {
      kind: 'object',
      optional: true,
      fields: {
        pros: { kind: 'array', optional: true, of: { kind: 'record', of: { kind: 'string' } } },
        cons: { kind: 'array', optional: true, of: { kind: 'record', of: { kind: 'string' } } },
      },
    },
    synergies: {
      kind: 'array',
      optional: true,
      of: {
        kind: 'object',
        fields: {
          heroes: { kind: 'array', of: { kind: 'string' } },
          reason: { kind: 'record', of: { kind: 'string' }, optional: true },
        },
      },
    },
  },
};
