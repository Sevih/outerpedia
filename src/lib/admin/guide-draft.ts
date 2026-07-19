/**
 * MODÈLE NORMALISÉ d'un guide de boss VERSIONNÉ, pour l'éditeur admin — et ses
 * adaptateurs PURS (aucun accès disque : le store lit/écrit, ici on ne fait que
 * projeter la donnée dans un sens ou dans l'autre).
 *
 * Le rendu (`VersionedBossGuide`) accepte deux formes de chaque fichier de
 * contenu : une COURTE (`{ tactical }`, `[...]`, `{ slots }`) et une SECTIONNÉE
 * (`{ sections: [...] }`). Le Joint Challenge — la catégorie pilote — n'écrit QUE
 * la forme courte, sans titres de section. L'éditeur travaille donc sur ce
 * modèle plat ; à la lecture, une éventuelle forme sectionnée est APLATIE (par
 * sécurité, jamais rencontrée en joint-challenge), à l'écriture on ré-émet
 * toujours la forme courte. Le diff est relu avant commit : tout aplatissement
 * inattendu se verrait.
 */
import type { LocalizedText } from '@contracts';
import type { VideoItem } from '@/components/ui/MultiVideoEmbed';

export type LText = LocalizedText & { en: string };

/** Un groupe de persos recommandés + sa raison (forme partagée reco). */
export interface RecoGroupDraft {
  characters: string[];
  reason?: LText;
}

/** Une section de conseils : un titre optionnel + ses conseils. */
export interface TipSectionDraft {
  title?: LText;
  tips: LText[];
}

/** Une version datée, projetée à plat pour l'édition. */
export interface VersionDraft {
  /** Clé = dossier `versions/YYYY-MM`. */
  key: string;
  /** Override de libellé (`version.json`) — lecture seule dans le pilote. */
  labelOverride?: LocalizedText;
  /** Le COMBAT que la version rejoue (`DungeonRef.group`) — « le monstre ». */
  group?: string;
  /** Conseils, en sections titrées (une seule sans titre = forme courte). */
  tipSections: TipSectionDraft[];
  /** Paragraphes libres (`config.notes`) — rendus entre conseils et persos. */
  notes: LText[];
  /** Persos recommandés (forme courte : tableau de groupes). */
  recommended: RecoGroupDraft[];
  /** Une équipe : slots d'options interchangeables (`teams.slots`). */
  teamSlots: string[][];
  /** Note de l'équipe. */
  teamNote?: LText;
  /** Vidéos de la version (`config.videos`). */
  videos: VideoItem[];
}

/** Un guide complet : intro partagée + versions (plus récente d'abord). */
export interface GuideDraft {
  intro: LText;
  versions: VersionDraft[];
}

/* --- Formes brutes des fichiers (ce que lit/écrit le rendu) --- */

interface TipsSection {
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
  sections?: TipsSection[];
}
interface RecommendedGroup {
  characters: string[];
  reason?: LText;
}
interface RecommendedSection {
  title?: LText;
  groups: RecommendedGroup[];
}
export type RawRecommended = RecommendedGroup[] | { sections: RecommendedSection[] };
interface TeamSection {
  title?: LText;
  slots: string[][];
  note?: LText;
}
export interface RawTeams {
  slots?: string[][];
  note?: LText;
  sections?: TeamSection[];
}

/* --- Lecture : fichiers bruts → VersionDraft (forme sectionnée aplatie) --- */

const hasText = (t?: LText): boolean =>
  t ? Object.values(t).some((x) => typeof x === 'string' && x.trim()) : false;

/** Sections de conseils : forme sectionnée telle quelle, sinon `tactical` = une section. */
const readTipSections = (raw: RawTips | undefined): TipSectionDraft[] => {
  if (raw?.sections)
    return raw.sections.map((s) => ({ ...(s.title ? { title: s.title } : {}), tips: s.tips }));
  if (raw?.tactical?.length) return [{ tips: raw.tactical }];
  return [];
};

const flatRecommended = (raw: RawRecommended | undefined): RecoGroupDraft[] =>
  raw === undefined ? [] : Array.isArray(raw) ? raw : raw.sections.flatMap((s) => s.groups);

const firstTeam = (raw: RawTeams | undefined): { slots: string[][]; note?: LText } => {
  const s = raw?.sections?.[0];
  if (s) return { slots: s.slots, ...(s.note ? { note: s.note } : {}) };
  return { slots: raw?.slots ?? [], ...(raw?.note ? { note: raw.note } : {}) };
};

export interface RawVersionFiles {
  config?: RawConfig;
  tips?: RawTips;
  recommended?: RawRecommended;
  teams?: RawTeams;
}

/** Projette les fichiers bruts d'une version dans le modèle plat éditable. */
export function toVersionDraft(
  key: string,
  files: RawVersionFiles,
  labelOverride?: LocalizedText,
): VersionDraft {
  const team = firstTeam(files.teams);
  return {
    key,
    ...(labelOverride ? { labelOverride } : {}),
    ...(files.config?.group ? { group: files.config.group } : {}),
    tipSections: readTipSections(files.tips),
    notes: files.config?.notes ?? [],
    recommended: flatRecommended(files.recommended),
    teamSlots: team.slots,
    ...(team.note ? { teamNote: team.note } : {}),
    videos: files.config?.videos ?? [],
  };
}

/* --- Écriture : VersionDraft → contenu des fichiers (null = supprimer) --- */

/**
 * Contenu à écrire pour chaque fichier d'une version — `null` = le fichier ne
 * doit pas exister (une version n'a que les fichiers qu'elle a : un `tips.json`
 * vide afficherait une section de conseils vide plutôt que rien).
 */
export interface VersionFilePayload {
  'config.json': RawConfig | null;
  'tips.json': RawTips | null;
  'recommended.json': RawRecommended | null;
  'teams.json': RawTeams | null;
}

const clean = <T extends LText>(list: T[]): T[] =>
  list.filter((t) => Object.values(t).some((v) => typeof v === 'string' && v.trim()));

/** Retire les persos vides d'un groupe/slot. */
const cleanNames = (names: string[]): string[] => names.map((n) => n.trim()).filter(Boolean);

export function fromVersionDraft(v: VersionDraft): VersionFilePayload {
  const notes = clean(v.notes);
  const config: RawConfig = {
    ...(v.group ? { group: v.group } : {}),
    ...(notes.length ? { notes } : {}),
    ...(v.videos.length ? { videos: v.videos } : {}),
  };
  // Sections vidées retirées ; une seule section SANS titre → forme courte
  // (`{ tactical }`, ce qu'écrit le joint-challenge), sinon forme sectionnée.
  const sections = v.tipSections
    .map((s) => ({ ...(hasText(s.title) ? { title: s.title! } : {}), tips: clean(s.tips) }))
    .filter((s) => s.tips.length);
  const tipsFile: RawTips | null =
    sections.length === 0
      ? null
      : sections.length === 1 && !sections[0].title
        ? { tactical: sections[0].tips }
        : { sections };

  const recommended = v.recommended
    .map((g) => ({
      characters: cleanNames(g.characters),
      ...(g.reason ? { reason: g.reason } : {}),
    }))
    .filter((g) => g.characters.length);
  const slots = v.teamSlots.map(cleanNames).filter((s) => s.length);

  return {
    'config.json': Object.keys(config).length ? config : null,
    'tips.json': tipsFile,
    'recommended.json': recommended.length ? recommended : null,
    'teams.json': slots.length ? { slots, ...(v.teamNote ? { note: v.teamNote } : {}) } : null,
  };
}
