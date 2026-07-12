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

/** Retire les clés `undefined`/vides → entrées curées minces (diffs propres). */
function compact(c: CharacterCurated): CharacterCurated {
  const out: CharacterCurated = {};
  if (c.rank) out.rank = c.rank;
  if (c.rankPvp) out.rankPvp = c.rankPvp;
  if (c.role) out.role = c.role;
  if (c.tags?.length) out.tags = c.tags;
  if (c.skillPriority && Object.keys(c.skillPriority).length) out.skillPriority = c.skillPriority;
  if (c.rankByTranscend && Object.keys(c.rankByTranscend).length)
    out.rankByTranscend = c.rankByTranscend;
  if (c.roleByTranscend && Object.keys(c.roleByTranscend).length)
    out.roleByTranscend = c.roleByTranscend;
  if (c.videos?.length) out.videos = c.videos;
  if (c.prosCons && (c.prosCons.pros?.length || c.prosCons.cons?.length)) out.prosCons = c.prosCons;
  if (c.synergies?.length) out.synergies = c.synergies;
  return out;
}

/**
 * Étiquettes que l'oracle V2 mélangeait mais que l'extraction sait maintenant
 * dériver (bannière, buffs de pénétration, lignée) : le seed les IGNORE, sinon
 * elles seraient figées en curé et divergeraient à la première régénération.
 * Ne reste que l'humain — `free`.
 */
const DERIVED_TAGS = new Set([
  'premium',
  'limited',
  'seasonal',
  'collab',
  'ignore-defense',
  'core-fusion',
]);
const isHumanTag = (t: string): boolean => !DERIVED_TAGS.has(t);

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
  const YT_ID = /^[A-Za-z0-9_-]{11}$/;
  const dir = resolve(legacyDir);
  const out: Record<string, CharacterCurated> = {};
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json')) continue;
    const d = JSON.parse(readFileSync(resolve(dir, file), 'utf8')) as Record<string, unknown>;
    const id = String(d.ID);
    // L'ancien champ `video` (id seul) devient une entrée de `videos` (non
    // enrichie ici : le seed est hors-ligne ; l'admin enrichit ensuite).
    const legacyVideo = typeof d.video === 'string' && YT_ID.test(d.video) ? d.video : undefined;
    const curated = compact({
      rank: (d.rank as string) || undefined,
      rankPvp: (d.rank_pvp as string) || undefined,
      role: (d.role as CuratedRole) || undefined,
      // Seuls les tags HUMAINS sont repris : le reste du vocabulaire est
      // (re)dérivé du jeu par l'extraction — le seeder ne doit pas le figer.
      tags: ((d.tags as string[]) ?? []).filter(isHumanTag),
      skillPriority: normSkillPriority(d.skill_priority),
      rankByTranscend: (d.rank_by_transcend as Record<string, string>) || undefined,
      roleByTranscend: (d.role_by_transcend as Record<string, string>) || undefined,
      videos: legacyVideo ? [{ platform: 'youtube', id: legacyVideo }] : undefined,
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
    if (!id) continue;
    // Append + dédup par id (peut déjà y avoir l'ancien `video` legacy).
    const seen = new Set((out[id]?.videos ?? []).map((v) => v.id));
    const fresh = (list as VideoRef[]).filter((v) => !seen.has(v.id));
    merge(id, { videos: [...(out[id]?.videos ?? []), ...fresh] });
  }
  for (const [slug, pc] of Object.entries(readJson(resolve(root, 'pros-cons.json')))) {
    const id = slugToId[slug];
    const p = pc as ProsCons;
    if (id) merge(id, { prosCons: { pros: p.pros, cons: p.cons } });
  }
  // partners.json V2 → synergies : slugs → ids (les réfs `{tag}` restent telles
  // quelles), langues identiques à l'anglais dédupliquées (repli `en`).
  // Les slugs V2 gardaient les apostrophes en `-s-` (« knight-s-dream ») ; V3
  // les colle (« knights-dream ») → repli de normalisation.
  const idOfSlug = (s: string): string | undefined =>
    slugToId[s] ?? slugToId[s.replace(/-s-/g, 's-')];
  for (const [slug, entry] of Object.entries(readJson(resolve(root, 'partners.json')))) {
    const id = idOfSlug(slug);
    if (!id) continue;
    const groups = (entry as { partner?: { hero: string[]; reason?: LocalizedText }[] }).partner;
    if (!groups?.length) continue;
    const synergies: SynergyGroup[] = groups.map((g) => {
      const heroes = g.hero.map((h) => (h.startsWith('{') ? h : (idOfSlug(h) ?? h)));
      const reason: LocalizedText = {};
      if (g.reason?.en) reason.en = g.reason.en;
      for (const l of ['jp', 'kr', 'zh', 'fr'] as const) {
        const v = g.reason?.[l];
        if (v && v !== g.reason?.en) reason[l] = v;
      }
      return Object.keys(reason).length ? { heroes, reason } : { heroes };
    });
    merge(id, { synergies });
  }
  return out;
}
