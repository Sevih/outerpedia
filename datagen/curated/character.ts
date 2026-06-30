/**
 * Couche CURÉE — personnages.
 *
 * Connaissance HUMAINE qui n'existe pas dans les `.bytes` (tiers, rôle, tags,
 * priorité de skills, vidéo…). Stockée séparément de l'extraction
 * (`data/curated/characters.json`, clé = ID perso) pour SURVIVRE à une
 * régénération ; éditée localement via l'admin ; fusionnée à la lecture.
 *
 * Le `seedFromLegacy` importe une fois le travail humain de V2 (oracle
 * `data/legacy`) dans cette structure propre et cohérente (clés normalisées).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { validate, type Schema } from '../extractor/core/validate';

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

/** Référence vidéo curée (riche). */
export interface VideoRef {
  platform: string;
  id: string;
  title?: string;
  author?: string;
}

/** Points forts / faibles curés (texte localisé, placeholders de buff conservés). */
export interface ProsCons {
  pros?: LocalizedText[];
  cons?: LocalizedText[];
}

/** Contenu curé d'un personnage (tout optionnel : on ne stocke que le connu). */
export interface CharacterCurated {
  /** Tier PvE (S, A, B…). */
  rank?: string;
  /** Tier PvP. */
  rankPvp?: string;
  /** Rôle de combat. */
  role?: CuratedRole;
  /** Étiquettes éditoriales (« free », « limited »…). */
  tags?: string[];
  /** Priorité de montée des compétences. */
  skillPriority?: SkillPriority;
  /** Identifiant de vidéo (YouTube). */
  video?: string;
  /** Tier PvE selon le palier de transcendance (transStar → tier). */
  rankByTranscend?: Record<string, string>;
  /** Rôle selon le palier de transcendance (transStar → rôle). */
  roleByTranscend?: Record<string, string>;
  /** Personnage à obtention limitée. */
  limited?: boolean;
  /** Vidéos (liste curée, riche : titre/auteur). */
  videos?: VideoRef[];
  /** Points forts / faibles. */
  prosCons?: ProsCons;
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
    video: { kind: 'string', optional: true },
    rankByTranscend: { kind: 'record', of: { kind: 'string' }, optional: true },
    roleByTranscend: { kind: 'record', of: { kind: 'string' }, optional: true },
    limited: { kind: 'boolean', optional: true },
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
  },
};

/** Retire les clés `undefined`/vides → entrées curées minces (diffs propres). */
function compact(c: CharacterCurated): CharacterCurated {
  const out: CharacterCurated = {};
  if (c.rank) out.rank = c.rank;
  if (c.rankPvp) out.rankPvp = c.rankPvp;
  if (c.role) out.role = c.role;
  if (c.tags?.length) out.tags = c.tags;
  if (c.skillPriority && Object.keys(c.skillPriority).length) out.skillPriority = c.skillPriority;
  if (c.video) out.video = c.video;
  if (c.rankByTranscend && Object.keys(c.rankByTranscend).length)
    out.rankByTranscend = c.rankByTranscend;
  if (c.roleByTranscend && Object.keys(c.roleByTranscend).length)
    out.roleByTranscend = c.roleByTranscend;
  if (c.limited) out.limited = c.limited;
  if (c.videos?.length) out.videos = c.videos;
  if (c.prosCons && (c.prosCons.pros?.length || c.prosCons.cons?.length)) out.prosCons = c.prosCons;
  return out;
}

/** Normalise `skill_priority` V2 ({First:{prio}}) → {first,second,ultimate}. */
function normSkillPriority(sp: unknown): SkillPriority | undefined {
  if (!sp || typeof sp !== 'object') return undefined;
  const src = sp as Record<string, { prio?: number }>;
  const out: SkillPriority = {};
  if (src.First?.prio !== undefined) out.first = src.First.prio;
  if (src.Second?.prio !== undefined) out.second = src.Second.prio;
  if (src.Ultimate?.prio !== undefined) out.ultimate = src.Ultimate.prio;
  return Object.keys(out).length ? out : undefined;
}

/**
 * Importe une fois les champs curés de l'oracle V2 (`data/legacy/character/*`)
 * vers la structure curée propre, clé = ID. Bootstrap : à lancer une seule fois,
 * ensuite l'admin fait foi.
 */
export function seedFromLegacy(
  legacyDir = 'data/legacy/character',
): Record<string, CharacterCurated> {
  const dir = resolve(legacyDir);
  const out: Record<string, CharacterCurated> = {};
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json')) continue;
    const d = JSON.parse(readFileSync(resolve(dir, file), 'utf8')) as Record<string, unknown>;
    const id = String(d.ID);
    const curated = compact({
      rank: (d.rank as string) || undefined,
      rankPvp: (d.rank_pvp as string) || undefined,
      role: (d.role as CuratedRole) || undefined,
      tags: (d.tags as string[]) || undefined,
      skillPriority: normSkillPriority(d.skill_priority),
      video: (d.video as string) || undefined,
      rankByTranscend: (d.rank_by_transcend as Record<string, string>) || undefined,
      roleByTranscend: (d.role_by_transcend as Record<string, string>) || undefined,
      limited: d.limited === true || undefined,
    });
    const issues = validate(curated, characterCuratedSchema, `curated[${id}]`);
    if (issues.length) throw new Error(`${issues[0].path} — ${issues[0].message}`);
    if (Object.keys(curated).length) out[id] = curated;
  }

  // videos + pros-cons : fichiers séparés, clés par SLUG → résoudre en ID.
  const root = resolve(legacyDir, '..'); // data/legacy
  const readJson = (p: string): Record<string, unknown> => {
    try {
      return JSON.parse(readFileSync(p, 'utf8')) as Record<string, unknown>;
    } catch {
      return {};
    }
  };
  const slugToId = readJson(resolve(root, 'generated/characters-slug-to-id.json')) as Record<
    string,
    string
  >;
  const merge = (id: string, patch: Partial<CharacterCurated>): void => {
    const cur = compact({ ...(out[id] ?? {}), ...patch });
    const issues = validate(cur, characterCuratedSchema, `curated[${id}]`);
    if (issues.length) throw new Error(`${issues[0].path} — ${issues[0].message}`);
    out[id] = cur;
  };
  for (const [slug, list] of Object.entries(readJson(resolve(root, 'character-videos.json')))) {
    const id = slugToId[slug];
    if (id) merge(id, { videos: list as VideoRef[] });
  }
  for (const [slug, pc] of Object.entries(readJson(resolve(root, 'pros-cons.json')))) {
    const id = slugToId[slug];
    const p = pc as ProsCons;
    if (id) merge(id, { prosCons: { pros: p.pros, cons: p.cons } });
  }
  return out;
}
