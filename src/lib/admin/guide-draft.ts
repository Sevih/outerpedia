/**
 * MODÈLE NORMALISÉ des guides de boss de la FAMILLE éditable, et ses adaptateurs
 * PURS (aucun accès disque — le store lit/écrit, ici on ne fait que projeter).
 *
 * Une seule forme éditable (`GuideDraft`) pour des stockages DIVERGENTS, décrits
 * par un `CatSpec` par catégorie :
 *   - versionné (joint-challenge) vs plat (special-request, irregular…) ;
 *   - monstre porté par `config.group` (versionné) ou `meta.group` (plat) ;
 *   - équipes en `slots` (une équipe), `buckets` (par plage de stages) ou
 *     `named` (équipes nommées, titre `SectionTitle` + note multi-paragraphes).
 *
 * Les références (group, noms de persos) sont garanties par CONSTRUCTION côté
 * éditeur (sélecteurs sur la donnée réelle) et revérifiées au rendu (build).
 */
import type { LocalizedText } from '@contracts';
import type { SectionTitle } from '@/lib/data/guide-sections';
import type { VideoItem } from '@/components/ui/MultiVideoEmbed';

export type LText = LocalizedText & { en: string };

/* --- Spec de catégorie --- */

export type MonsterKind = 'group-config' | 'group-meta' | 'dungeons-meta' | 'bossId-meta';
export type TeamKind = 'slots' | 'buckets' | 'named' | 'none';

export interface CatSpec {
  /** Versions datées (`versions/YYYY-MM/`) vs guide plat (fichiers à la racine). */
  versioned: boolean;
  /**
   * Stockage `content.json` mono-fichier (adventure, dimensional-singularity) —
   * `contentShape` en donne la forme. Exclusif de `versioned`.
   */
  contentFile?: boolean;
  contentShape?: 'story' | 'boss';
  /** Où se lit/écrit « le monstre ». */
  monster: MonsterKind;
  /** Forme des équipes. */
  teams: TeamKind;
  /** Persos recommandés EN SECTIONS titrées (dimensional-singularity). */
  recoSections?: boolean;
  videos: boolean;
  /** Paragraphes libres (`config.notes` versionné, ou `note` unique adventure). */
  notes: boolean;
  /** Sections de conseils titrées. */
  tipTitles: boolean;
  /** L'intro est-elle obligatoire (le rendu jette sinon) ? */
  introRequired: boolean;
}

export const GUIDE_SPECS: Record<string, CatSpec> = {
  'joint-challenge': {
    versioned: true,
    monster: 'group-config',
    teams: 'slots',
    videos: true,
    notes: true,
    tipTitles: true,
    introRequired: true,
  },
  'special-request': {
    versioned: false,
    monster: 'group-meta',
    teams: 'buckets',
    videos: true,
    notes: false,
    tipTitles: false,
    introRequired: true,
  },
  'irregular-extermination': {
    versioned: false,
    monster: 'group-meta',
    teams: 'named',
    videos: true,
    notes: false,
    tipTitles: false,
    introRequired: false,
  },
  'adventure-license': {
    versioned: false,
    monster: 'group-meta',
    teams: 'named',
    videos: true,
    notes: false,
    tipTitles: false,
    introRequired: false,
  },
  adventure: {
    versioned: false,
    contentFile: true,
    contentShape: 'story',
    monster: 'dungeons-meta',
    teams: 'none',
    videos: false,
    notes: true, // `content.note` — une note unique « à savoir avant le combat »
    tipTitles: false,
    introRequired: true,
  },
  'dimensional-singularity': {
    versioned: false,
    contentFile: true,
    contentShape: 'boss',
    monster: 'bossId-meta',
    teams: 'none', // les « équipes » de dim = persos recommandés EN SECTIONS
    recoSections: true,
    videos: true,
    notes: false,
    tipTitles: true,
    introRequired: true,
  },
};

export const guideSpec = (category: string): CatSpec | undefined => GUIDE_SPECS[category];
export const isEditableGuideCategory = (category: string): boolean => category in GUIDE_SPECS;

/* --- Modèle éditable --- */

export interface RecoGroupDraft {
  characters: string[];
  reason?: LText;
}

export interface TipSectionDraft {
  title?: LText;
  /** Titre non libre (preset/perso/élément/effet) préservé tel quel (dim). */
  rawTitle?: SectionTitle;
  tips: LText[];
}

/** Une section de persos recommandés titrée (dimensional-singularity). */
export interface RecoSectionDraft {
  title?: LText;
  rawTitle?: SectionTitle;
  groups: RecoGroupDraft[];
}

/**
 * Une équipe, superset des trois formes : `slots` (joint), plage de stages
 * (`buckets`), titre + note multi-paragraphes (`named`).
 */
export interface TeamDraft {
  /** `buckets` : plage de stages couverte [premier, dernier]. */
  stages?: [number, number];
  /** `named` : titre non libre (preset/perso/élément/effet) préservé tel quel. */
  rawTitle?: SectionTitle;
  /** `named` : titre libre éditable (prime sur `rawTitle` s'il est renseigné). */
  title?: LText;
  slots: string[][];
  /** Note simple (joint, special-request). */
  note?: LText;
  /** Note multi-paragraphes (`named`). */
  notes?: LText[];
}

export interface VersionDraft {
  /** Clé `versions/YYYY-MM` ; `''` pour un guide plat (version unique implicite). */
  key: string;
  labelOverride?: LocalizedText;
  /** Le combat désigné : `group` (group-*), ids de donjons ou id de boss. */
  group?: string;
  dungeons?: string[];
  bossId?: string;
  tipSections: TipSectionDraft[];
  notes: LText[];
  recommended: RecoGroupDraft[];
  /** Persos recommandés EN SECTIONS titrées (dimensional-singularity). */
  recoSections: RecoSectionDraft[];
  teams: TeamDraft[];
  videos: VideoItem[];
}

export interface GuideDraft {
  intro: LText;
  versions: VersionDraft[];
}

/* --- Formes brutes des fichiers (ce que lit/écrit le rendu) --- */

interface TipsSectionRaw {
  title?: LText;
  tips: LText[];
}
export interface RawConfig {
  group?: string;
  notes?: LText[];
  videos?: VideoItem[];
}
export interface RawTips {
  tactical?: LText[];
  sections?: TipsSectionRaw[];
}
interface RecommendedGroupRaw {
  characters: string[];
  reason?: LText;
}
interface RecommendedSectionRaw {
  title?: LText;
  groups: RecommendedGroupRaw[];
}
export type RawRecommended = RecommendedGroupRaw[] | { sections: RecommendedSectionRaw[] };

interface SlotsTeamRaw {
  slots?: string[][];
  note?: LText;
  sections?: { title?: LText; slots: string[][]; note?: LText }[];
}
interface BucketTeamRaw {
  buckets: { stages: [number, number]; slots: string[][]; note?: LText }[];
}
type NamedTeamRaw = { title?: SectionTitle; slots: string[][]; note?: LText[] }[];
/** `teams.json` — forme selon la catégorie. */
export type RawTeams = SlotsTeamRaw | BucketTeamRaw | NamedTeamRaw;

/* --- Helpers partagés --- */

export const hasText = (t?: LText): boolean =>
  t ? Object.values(t).some((x) => typeof x === 'string' && x.trim()) : false;

const clean = <T extends LText>(list: T[]): T[] => list.filter(hasText);
const cleanNames = (names: string[]): string[] => names.map((n) => n.trim()).filter(Boolean);

const readTipSections = (raw: RawTips | undefined): TipSectionDraft[] => {
  if (raw && 'sections' in raw && raw.sections)
    return raw.sections.map((s) => ({ ...(s.title ? { title: s.title } : {}), tips: s.tips }));
  if (raw?.tactical?.length) return [{ tips: raw.tactical }];
  return [];
};

const readRecommended = (raw: RawRecommended | undefined): RecoGroupDraft[] =>
  raw === undefined ? [] : Array.isArray(raw) ? raw : raw.sections.flatMap((s) => s.groups);

const writeTipsFile = (sections: TipSectionDraft[]): RawTips | null => {
  const kept = sections
    .map((s) => ({ ...(hasText(s.title) ? { title: s.title! } : {}), tips: clean(s.tips) }))
    .filter((s) => s.tips.length);
  if (kept.length === 0) return null;
  if (kept.length === 1 && !kept[0].title) return { tactical: kept[0].tips };
  return { sections: kept };
};

const writeRecommended = (reco: RecoGroupDraft[]): RecommendedGroupRaw[] | null => {
  const kept = reco
    .map((g) => ({
      characters: cleanNames(g.characters),
      ...(g.reason ? { reason: g.reason } : {}),
    }))
    .filter((g) => g.characters.length);
  return kept.length ? kept : null;
};

/* --- Équipes : lecture/écriture par forme --- */

const readTeams = (kind: TeamKind, raw: RawTeams | undefined): TeamDraft[] => {
  if (!raw) return [];
  if (kind === 'buckets') {
    return (raw as BucketTeamRaw).buckets.map((b) => ({
      stages: b.stages,
      slots: b.slots,
      ...(b.note ? { note: b.note } : {}),
    }));
  }
  if (kind === 'named') {
    return (raw as NamedTeamRaw).map((t) => ({
      ...(t.title && 'title' in t.title
        ? { title: t.title.title }
        : t.title
          ? { rawTitle: t.title }
          : {}),
      slots: t.slots,
      ...(t.note?.length ? { notes: t.note } : {}),
    }));
  }
  // slots (joint) : une équipe (forme courte ou 1re section).
  const r = raw as SlotsTeamRaw;
  const s = r.sections?.[0];
  if (s) return [{ slots: s.slots, ...(s.note ? { note: s.note } : {}) }];
  return r.slots ? [{ slots: r.slots, ...(r.note ? { note: r.note } : {}) }] : [];
};

/** Écrit `teams.json` selon la forme ; `null` = pas de fichier. */
const writeTeams = (kind: TeamKind, teams: TeamDraft[]): RawTeams | null => {
  const kept = teams
    .map((t) => ({ ...t, slots: t.slots.map(cleanNames).filter((s) => s.length) }))
    .filter((t) => t.slots.length);
  if (!kept.length) return null;
  if (kind === 'buckets') {
    return {
      buckets: kept.map((t) => ({
        stages: t.stages ?? [1, 1],
        slots: t.slots,
        ...(hasText(t.note) ? { note: t.note! } : {}),
      })),
    };
  }
  if (kind === 'named') {
    return kept.map((t) => ({
      ...(hasText(t.title)
        ? { title: { title: t.title! } as SectionTitle }
        : t.rawTitle
          ? { title: t.rawTitle }
          : {}),
      slots: t.slots,
      ...(t.notes && clean(t.notes).length ? { note: clean(t.notes) } : {}),
    }));
  }
  const t = kept[0];
  return { slots: t.slots, ...(hasText(t.note) ? { note: t.note! } : {}) };
};

/* --- Adaptateur VERSIONNÉ (joint-challenge) --- */

export interface RawVersionFiles {
  config?: RawConfig;
  tips?: RawTips;
  recommended?: RawRecommended;
  teams?: RawTeams;
}

export function toVersionDraft(
  key: string,
  files: RawVersionFiles,
  labelOverride?: LocalizedText,
): VersionDraft {
  return {
    key,
    ...(labelOverride ? { labelOverride } : {}),
    ...(files.config?.group ? { group: files.config.group } : {}),
    tipSections: readTipSections(files.tips),
    notes: files.config?.notes ?? [],
    recommended: readRecommended(files.recommended),
    recoSections: [],
    teams: readTeams('slots', files.teams),
    videos: files.config?.videos ?? [],
  };
}

export interface VersionFilePayload {
  'config.json': RawConfig | null;
  'tips.json': RawTips | null;
  'recommended.json': RawRecommended | null;
  'teams.json': RawTeams | null;
}

export function fromVersionDraft(v: VersionDraft): VersionFilePayload {
  const notes = clean(v.notes);
  const config: RawConfig = {
    ...(v.group ? { group: v.group } : {}),
    ...(notes.length ? { notes } : {}),
    ...(v.videos.length ? { videos: v.videos } : {}),
  };
  return {
    'config.json': Object.keys(config).length ? config : null,
    'tips.json': writeTipsFile(v.tipSections),
    'recommended.json': writeRecommended(v.recommended),
    'teams.json': writeTeams('slots', v.teams),
  };
}

/* --- Adaptateur PLAT (special-request, irregular, adventure-license) --- */

export interface FlatFiles {
  strings?: { intro?: LText };
  tips?: RawTips;
  recommended?: RawRecommended;
  teams?: RawTeams;
  videos?: VideoItem[];
}

/** Fichiers d'un guide plat (`null` = supprimer). `strings`/`videos` gérés à part. */
export interface FlatFilePayload {
  'strings.json': { intro: LText } | null;
  'tips.json': RawTips | null;
  'recommended.json': RawRecommended | null;
  'teams.json': RawTeams | null;
  'videos.json': VideoItem[] | null;
}

/** Projette un guide PLAT dans le modèle (une version unique, `key: ''`). */
export function toFlatDraft(
  spec: CatSpec,
  group: string | undefined,
  files: FlatFiles,
): GuideDraft {
  return {
    intro: files.strings?.intro ?? { en: '' },
    versions: [
      {
        key: '',
        ...(group ? { group } : {}),
        tipSections: readTipSections(files.tips),
        notes: [],
        recommended: readRecommended(files.recommended),
        recoSections: [],
        teams: readTeams(spec.teams, files.teams),
        videos: files.videos ?? [],
      },
    ],
  };
}

export function fromFlatDraft(spec: CatSpec, draft: GuideDraft): FlatFilePayload {
  const v = draft.versions[0];
  return {
    'strings.json': hasText(draft.intro) ? { intro: draft.intro } : null,
    'tips.json': writeTipsFile(v.tipSections),
    'recommended.json': writeRecommended(v.recommended),
    'teams.json': writeTeams(spec.teams, v.teams),
    'videos.json': v.videos.length ? v.videos : null,
  };
}

/* --- Adaptateur CONTENT.JSON (adventure = story, dim-singularity = boss) --- */

const readSectionTitle = (st?: SectionTitle): { title?: LText; rawTitle?: SectionTitle } =>
  st && 'title' in st ? { title: st.title } : st ? { rawTitle: st } : {};

/** Titre à écrire : libre s'il est saisi, sinon le titre préservé, sinon un repli. */
const writeSectionTitle = (
  title: LText | undefined,
  rawTitle: SectionTitle | undefined,
  fallback: SectionTitle,
): SectionTitle => (hasText(title) ? { title: title! } : (rawTitle ?? fallback));

const TIPS_TITLE_FALLBACK: SectionTitle = { preset: 'tactical' };
const TEAM_TITLE_FALLBACK: SectionTitle = { preset: 'general' };

interface StoryContent {
  intro: LText;
  note?: LText;
  tips?: LText[];
  recommended?: RecommendedGroupRaw[];
}
type DimTipsSection = SectionTitle & { items: LText[] };
type DimTeamSection = SectionTitle & { groups: RecommendedGroupRaw[] };
interface DimContent {
  intro: LText;
  tips?: DimTipsSection[];
  teams?: DimTeamSection[];
  videos?: VideoItem[];
}
export type RawContent = StoryContent | DimContent;

/** Le monstre d'un guide `content.json` (dans `meta.json`). */
export interface ContentMonster {
  dungeons?: string[];
  bossId?: string;
}

const emptyVersion = (extra: Partial<VersionDraft>): VersionDraft => ({
  key: '',
  tipSections: [],
  notes: [],
  recommended: [],
  recoSections: [],
  teams: [],
  videos: [],
  ...extra,
});

export function toContentDraft(
  spec: CatSpec,
  monster: ContentMonster,
  content: RawContent | undefined,
): GuideDraft {
  if (spec.contentShape === 'boss') {
    const c = (content ?? { intro: { en: '' } }) as DimContent;
    return {
      intro: c.intro ?? { en: '' },
      versions: [
        emptyVersion({
          ...(monster.bossId ? { bossId: monster.bossId } : {}),
          tipSections: (c.tips ?? []).map((s) => ({ ...readSectionTitle(s), tips: s.items })),
          recoSections: (c.teams ?? []).map((s) => ({ ...readSectionTitle(s), groups: s.groups })),
          videos: c.videos ?? [],
        }),
      ],
    };
  }
  const c = (content ?? { intro: { en: '' } }) as StoryContent;
  return {
    intro: c.intro ?? { en: '' },
    versions: [
      emptyVersion({
        ...(monster.dungeons?.length ? { dungeons: monster.dungeons } : {}),
        tipSections: c.tips?.length ? [{ tips: c.tips }] : [],
        notes: c.note ? [c.note] : [],
        recommended: c.recommended ?? [],
      }),
    ],
  };
}

export function fromContentDraft(spec: CatSpec, draft: GuideDraft): RawContent {
  const v = draft.versions[0];
  if (spec.contentShape === 'boss') {
    const tips = v.tipSections
      .map((s) => ({
        ...writeSectionTitle(s.title, s.rawTitle, TIPS_TITLE_FALLBACK),
        items: clean(s.tips),
      }))
      .filter((s) => s.items.length) as DimTipsSection[];
    const teams = v.recoSections
      .map((s) => ({
        ...writeSectionTitle(s.title, s.rawTitle, TEAM_TITLE_FALLBACK),
        groups: writeRecommended(s.groups) ?? [],
      }))
      .filter((s) => s.groups.length) as DimTeamSection[];
    const out: DimContent = {
      intro: draft.intro,
      ...(tips.length ? { tips } : {}),
      ...(teams.length ? { teams } : {}),
      ...(v.videos.length ? { videos: v.videos } : {}),
    };
    return out;
  }
  const tips = clean(v.tipSections.flatMap((s) => s.tips));
  const note = v.notes.find(hasText);
  const recommended = writeRecommended(v.recommended);
  const out: StoryContent = {
    intro: draft.intro,
    ...(note ? { note } : {}),
    ...(tips.length ? { tips } : {}),
    ...(recommended ? { recommended } : {}),
  };
  return out;
}
