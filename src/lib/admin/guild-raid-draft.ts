/**
 * LE FORMAT ÉDITABLE D'UNE VERSION DE GUILD RAID — le gabarit de
 * `guild-raid/dignity-of-the-golden-kingdom/versions/2026-08/`, et lui seul.
 *
 * Une version de guild raid tient en quatre fichiers (`config.json`,
 * `subA.json`, `subB.json`, `main.json`, cf. `GuildRaidGuide.tsx`). Ce module
 * PUR (aucun accès disque) porte :
 *   - le PRÉDICAT « version au gabarit » (`raidTemplateIssues`) : ses trois
 *     combats, aucun `turnOrder`, et uniquement les champs et les blocs du
 *     gabarit — builds en `requirements`, notes en `p` / `ul`, `element` ou
 *     `icon` par équipe, `author` des vidéos ;
 *   - le CONVERTISSEUR brouillon ↔ fichiers (`toRaidDraft`, `fromRaidDraft`),
 *     à la manière de `toVersionDraft` / `fromVersionDraft` ;
 *   - le CONTRÔLE d'un brouillon venu de la page (`cleanRaidVersion`) : ses
 *     écarts SITUÉS (onglet, rang, champ), que quick rend en `GuideRefusal`.
 *
 * C'est le SEUL format que quick écrit. Une version qui ne passe pas le
 * prédicat est « à l'ancien format » : elle se lit (`RaidLegacyDraft`), elle
 * ne s'édite pas, et le store ne la réécrit jamais.
 *
 * Ordre des clés à l'écriture : celui du gabarit (`title`, `element` / `icon`,
 * `slots`, `geasActive`, `requirements`, `notes`, `video`). Deux tables à clés
 * libres gardent l'ordre de ce qui a été lu — `stats` et `equipment` d'un
 * build : leur ordre n'a pas de sens au rendu (`STAT_ROWS`, `EQUIP_ROWS` le
 * fixent) et les réordonner réécrirait un fichier que personne n'a touché.
 */
import type { LocalizedText } from '@contracts';
import type { VideoItem } from '@/components/ui/MultiVideoEmbed';
import { hasText } from './review-shape';

type LText = LocalizedText & { en: string };

/** Les quatre fichiers d'une version de guild raid, dans l'ordre d'écriture. */
export const RAID_FILES = ['config.json', 'subA.json', 'subB.json', 'main.json'] as const;
export type RaidFile = (typeof RAID_FILES)[number];

/** Postes d'une équipe : la contrainte du jeu. */
export const RAID_MAX_SLOTS = 4;
/** Les stats d'un build, dans l'ordre du rendu (`spd` en pivot, puis `STAT_ROWS`). */
export const RAID_STAT_KEYS = ['spd', 'eff', 'atk', 'def', 'hp', 'chc', 'chd', 'trans'] as const;
/** L'équipement d'un build, dans l'ordre du rendu (`EQUIP_ROWS`). */
export const RAID_EQUIP_KEYS = ['weapon', 'amulet', 'talisman', 'set', 'ee'] as const;
/** Les éléments qu'un badge d'équipe peut porter (`img.element`). */
export const RAID_ELEMENTS = ['fire', 'water', 'earth', 'light', 'dark'] as const;

const LANG_KEYS = ['en', 'jp', 'kr', 'zh', 'fr', 'es'];
const VIDEO_KEYS = ['platform', 'id', 'title', 'author', 'label'];

/* --- Le brouillon --- */

export interface RaidRecoDraft {
  characters: string[];
  reason?: LText;
}

/** L'éditorial d'un sous-boss de phase 1. */
export interface RaidSubBossDraft {
  notes: LText[];
  recommended: RaidRecoDraft[];
  /** Postes de l'équipe suggérée : les alternatives de chaque poste. */
  slots: string[][];
  teamNote?: LText;
  video?: VideoItem;
}

/** Une note d'équipe de phase 2 : un paragraphe, ou une liste à puces. */
export type RaidNoteDraft = { p: LText } | { ul: LText[] };

/** Le build d'un perso (`requirements.entries[]`). */
export interface RaidBuildDraft {
  character: string;
  stats?: Record<string, string>;
  prio?: string[];
  equipment?: Record<string, string[]>;
  notes?: LText[];
}

/** Une équipe de phase 2. */
export interface RaidTeamDraft {
  title: LText;
  element?: string;
  icon?: string;
  slots: string[][];
  /** Geas actifs, tels que le fichier les range : `bonus` les aides, `malus` les handicaps. */
  geas: { bonus: string[]; malus: string[] };
  builds: RaidBuildDraft[];
  /** La note de pied du bloc de builds (`requirements.note`). */
  buildsNote?: LText;
  notes: RaidNoteDraft[];
  video?: VideoItem;
}

/** Une version AU GABARIT, éditable. */
export interface RaidTemplateDraft {
  /** Les trois combats de `config.json`. */
  subA?: string;
  subB?: string;
  main?: string;
  bossA: RaidSubBossDraft;
  bossB: RaidSubBossDraft;
  teams: RaidTeamDraft[];
}

/** Les fichiers d'une version, tels que lus (un absent : `undefined`). */
export interface RaidRawFiles {
  config?: unknown;
  subA?: unknown;
  subB?: unknown;
  main?: unknown;
}

/** Une version À L'ANCIEN FORMAT : ses écarts au gabarit, ses fichiers en lecture. */
export interface RaidLegacyDraft {
  legacy: string[];
  files: RaidRawFiles;
}

export type RaidVersionDraft = RaidTemplateDraft | RaidLegacyDraft;

export const isRaidLegacy = (raid: RaidVersionDraft): raid is RaidLegacyDraft => 'legacy' in raid;

/* --- Le prédicat « version au gabarit » --- */

const isRecord = (v: unknown): v is Record<string, unknown> =>
  Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const isStrings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((s) => typeof s === 'string');
const isLText = (v: unknown): v is LText =>
  isRecord(v) &&
  typeof v.en === 'string' &&
  Object.entries(v).every(([k, s]) => LANG_KEYS.includes(k) && typeof s === 'string');

/**
 * Les ÉCARTS d'une version au gabarit — vide : elle est au gabarit, quick
 * l'édite. Chaque écart nomme le fichier et l'endroit ; l'écran les montre
 * dans le bandeau « ancien format ».
 */
export function raidTemplateIssues(files: RaidRawFiles): string[] {
  const out: string[] = [];
  const only = (at: string, o: Record<string, unknown>, keys: readonly string[]): void => {
    for (const k of Object.keys(o)) if (!keys.includes(k)) out.push(`${at} : champ « ${k} »`);
  };
  const text = (at: string, v: unknown): void => {
    if (!isLText(v)) out.push(`${at} : un texte localisé attendu`);
  };
  const texts = (at: string, v: unknown): void => {
    if (!Array.isArray(v)) out.push(`${at} : une liste de textes attendue`);
    else v.forEach((t, i) => text(`${at}[${i}]`, t));
  };
  const slots = (at: string, v: unknown): void => {
    if (!Array.isArray(v) || !v.every(isStrings)) out.push(`${at} : des postes attendus`);
  };
  const video = (at: string, v: unknown): void => {
    if (!isRecord(v) || typeof v.id !== 'string')
      return void out.push(`${at} : une vidéo attendue`);
    only(at, v, VIDEO_KEYS);
  };

  // config.json : les trois combats, et l'épinglage que « Versionner » pose.
  const cfg = files.config;
  if (!isRecord(cfg)) out.push('config.json : absent');
  else {
    only('config.json', cfg, ['subA', 'subB', 'main', 'pinned']);
    for (const k of ['subA', 'subB', 'main'] as const)
      if (typeof cfg[k] !== 'string' || !cfg[k])
        out.push(`config.json : sans combat « ${k} » (saison archivée)`);
    if (cfg.pinned !== undefined && !isStrings(cfg.pinned))
      out.push('config.json : pinned inattendu');
  }

  // subA.json · subB.json : notes, persos recommandés, équipe, vidéo.
  for (const name of ['subA', 'subB'] as const) {
    const sub = files[name];
    const at = `${name}.json`;
    if (sub === undefined) continue;
    if (!isRecord(sub)) {
      out.push(`${at} : forme inattendue`);
      continue;
    }
    only(at, sub, ['notes', 'recommended', 'team', 'video']);
    if (sub.notes !== undefined) texts(`${at} notes`, sub.notes);
    if (sub.recommended !== undefined) {
      if (!Array.isArray(sub.recommended)) out.push(`${at} recommended : une liste attendue`);
      else
        sub.recommended.forEach((g, i) => {
          const gat = `${at} recommended[${i}]`;
          if (!isRecord(g) || !isStrings(g.characters))
            return void out.push(`${gat} : des persos attendus`);
          only(gat, g, ['characters', 'reason']);
          if (g.reason !== undefined) text(`${gat} reason`, g.reason);
        });
    }
    if (sub.team !== undefined) {
      if (!isRecord(sub.team)) out.push(`${at} team : forme inattendue`);
      else {
        only(`${at} team`, sub.team, ['slots', 'note']);
        slots(`${at} team`, sub.team.slots);
        if (sub.team.note !== undefined) text(`${at} team note`, sub.team.note);
      }
    }
    if (sub.video !== undefined) video(`${at} video`, sub.video);
  }

  // main.json : les équipes de phase 2.
  const main = files.main;
  if (main !== undefined) {
    if (!isRecord(main)) out.push('main.json : forme inattendue');
    else {
      only('main.json', main, ['teams']);
      const teams = main.teams ?? [];
      if (!Array.isArray(teams)) out.push('main.json teams : une liste attendue');
      else teams.forEach((t, i) => teamIssues(t, `main.json équipe ${i + 1}`));
    }
  }
  return out;

  function teamIssues(t: unknown, at: string): void {
    if (!isRecord(t)) return void out.push(`${at} : forme inattendue`);
    only(at, t, [
      'title',
      'element',
      'icon',
      'slots',
      'geasActive',
      'requirements',
      'notes',
      'video',
    ]);
    text(`${at} title`, t.title);
    for (const k of ['element', 'icon'] as const)
      if (t[k] !== undefined && typeof t[k] !== 'string') out.push(`${at} : ${k} inattendu`);
    slots(at, t.slots);
    if (t.geasActive !== undefined) {
      if (!isRecord(t.geasActive)) out.push(`${at} geasActive : forme inattendue`);
      else {
        only(`${at} geasActive`, t.geasActive, ['bonus', 'malus']);
        for (const k of ['bonus', 'malus'] as const)
          if (t.geasActive[k] !== undefined && !isStrings(t.geasActive[k]))
            out.push(`${at} geasActive.${k} : des ids attendus`);
      }
    }
    if (t.requirements !== undefined) {
      const r = t.requirements;
      if (!isRecord(r) || !Array.isArray(r.entries))
        out.push(`${at} requirements : des builds attendus`);
      else {
        only(`${at} requirements`, r, ['entries', 'note']);
        if (r.note !== undefined) text(`${at} requirements note`, r.note);
        r.entries.forEach((e, i) => buildIssues(e, `${at} build ${i + 1}`));
      }
    }
    if (t.notes !== undefined) {
      if (!Array.isArray(t.notes)) out.push(`${at} notes : une liste attendue`);
      else
        t.notes.forEach((b, i) => {
          const bat = `${at} note ${i + 1}`;
          if (!isRecord(b)) return void out.push(`${bat} : forme inattendue`);
          if ('turnOrder' in b) return void out.push(`${bat} : bloc turnOrder`);
          const keys = Object.keys(b);
          if (keys.length === 1 && keys[0] === 'p') text(bat, b.p);
          else if (keys.length === 1 && keys[0] === 'ul') texts(bat, b.ul);
          else out.push(`${bat} : ni « p » ni « ul » (${keys.join(', ')})`);
        });
    }
    if (t.video !== undefined) video(`${at} video`, t.video);
  }

  function buildIssues(e: unknown, at: string): void {
    if (!isRecord(e) || typeof e.character !== 'string')
      return void out.push(`${at} : un perso attendu`);
    only(at, e, ['character', 'stats', 'prio', 'equipment', 'notes']);
    if (e.stats !== undefined) {
      if (!isRecord(e.stats)) out.push(`${at} stats : forme inattendue`);
      else
        for (const [k, s] of Object.entries(e.stats))
          if (!(RAID_STAT_KEYS as readonly string[]).includes(k) || typeof s !== 'string')
            out.push(`${at} stats : « ${k} » inattendu`);
    }
    if (e.prio !== undefined && !isStrings(e.prio)) out.push(`${at} prio : des chaînes attendues`);
    if (e.equipment !== undefined) {
      if (!isRecord(e.equipment)) out.push(`${at} equipment : forme inattendue`);
      else
        for (const [k, list] of Object.entries(e.equipment))
          if (!(RAID_EQUIP_KEYS as readonly string[]).includes(k) || !isStrings(list))
            out.push(`${at} equipment : « ${k} » inattendu`);
    }
    if (e.notes !== undefined) texts(`${at} notes`, e.notes);
  }
}

/** Une version est-elle au gabarit ? */
export const isRaidTemplate = (files: RaidRawFiles): boolean =>
  raidTemplateIssues(files).length === 0;

/* --- Fichiers → brouillon --- */

interface RawSub {
  notes?: LText[];
  recommended?: RaidRecoDraft[];
  team?: { slots: string[][]; note?: LText };
  video?: VideoItem;
}
interface RawBuild {
  character: string;
  stats?: Record<string, string>;
  prio?: string[];
  equipment?: Record<string, string[]>;
  notes?: LText[];
}
interface RawTeam {
  title: LText;
  element?: string;
  icon?: string;
  slots: string[][];
  geasActive?: { bonus?: string[]; malus?: string[] };
  requirements?: { entries: RawBuild[]; note?: LText };
  notes?: RaidNoteDraft[];
  video?: VideoItem;
}
interface RawRaidConfig {
  subA?: string;
  subB?: string;
  main?: string;
  pinned?: string[];
}

const readSub = (raw: RawSub | undefined): RaidSubBossDraft => ({
  notes: raw?.notes ?? [],
  recommended: raw?.recommended ?? [],
  slots: raw?.team?.slots ?? [],
  ...(raw?.team?.note ? { teamNote: raw.team.note } : {}),
  ...(raw?.video ? { video: raw.video } : {}),
});

/**
 * Projette une version AU GABARIT dans le brouillon. À n'appeler que sur des
 * fichiers qui passent `raidTemplateIssues` — `readRaidVersion` fait le tri.
 */
export function toRaidDraft(files: RaidRawFiles): RaidTemplateDraft {
  const cfg = (files.config ?? {}) as RawRaidConfig;
  const main = (files.main ?? {}) as { teams?: RawTeam[] };
  return {
    ...(cfg.subA ? { subA: cfg.subA } : {}),
    ...(cfg.subB ? { subB: cfg.subB } : {}),
    ...(cfg.main ? { main: cfg.main } : {}),
    bossA: readSub(files.subA as RawSub | undefined),
    bossB: readSub(files.subB as RawSub | undefined),
    teams: (main.teams ?? []).map((t) => ({
      title: t.title,
      ...(t.element ? { element: t.element } : {}),
      ...(t.icon ? { icon: t.icon } : {}),
      slots: t.slots,
      geas: { bonus: t.geasActive?.bonus ?? [], malus: t.geasActive?.malus ?? [] },
      builds: t.requirements?.entries ?? [],
      ...(t.requirements?.note ? { buildsNote: t.requirements.note } : {}),
      notes: t.notes ?? [],
      ...(t.video ? { video: t.video } : {}),
    })),
  };
}

/** Une version lue : au gabarit, son brouillon ; sinon ses écarts et ses fichiers, en lecture. */
export function readRaidVersion(files: RaidRawFiles): RaidVersionDraft {
  const legacy = raidTemplateIssues(files);
  return legacy.length ? { legacy, files } : toRaidDraft(files);
}

/* --- Brouillon → fichiers (réécriture canonique) --- */

const cleanTexts = (list: LText[] | undefined): LText[] => (list ?? []).filter(hasText);
const cleanNames = (names: string[]): string[] => names.map((n) => n.trim()).filter(Boolean);
const cleanSlots = (slots: string[][]): string[][] => slots.map(cleanNames).filter((s) => s.length);
/**
 * Des chaînes libres (un token d'équipement, une priorité) : les vides tombent,
 * les autres passent TELLES QUELLES — pas de `trim`, une espace de fin de
 * saisie n'est pas une raison de réécrire un fichier que personne n'a touché.
 */
const cleanLines = (list: string[] | undefined): string[] => (list ?? []).filter((s) => s.trim());

const writeSub = (b: RaidSubBossDraft): RawSub | null => {
  const notes = cleanTexts(b.notes);
  const recommended = b.recommended
    .map((g) => ({
      characters: cleanNames(g.characters),
      ...(hasText(g.reason) ? { reason: g.reason! } : {}),
    }))
    .filter((g) => g.characters.length || g.reason);
  const slots = cleanSlots(b.slots);
  const out: RawSub = {
    ...(notes.length ? { notes } : {}),
    ...(recommended.length ? { recommended } : {}),
    ...(slots.length || hasText(b.teamNote)
      ? { team: { slots, ...(hasText(b.teamNote) ? { note: b.teamNote! } : {}) } }
      : {}),
    ...(b.video ? { video: b.video } : {}),
  };
  return Object.keys(out).length ? out : null;
};

const writeBuild = (e: RaidBuildDraft): RawBuild => {
  const stats = Object.fromEntries(Object.entries(e.stats ?? {}).filter(([, s]) => s.trim()));
  const equipment = Object.fromEntries(
    Object.entries(e.equipment ?? {})
      .map(([k, list]) => [k, cleanLines(list)] as const)
      .filter(([, list]) => list.length),
  );
  const prio = cleanLines(e.prio);
  const notes = cleanTexts(e.notes);
  return {
    character: e.character.trim(),
    ...(Object.keys(stats).length ? { stats } : {}),
    ...(prio.length ? { prio } : {}),
    ...(Object.keys(equipment).length ? { equipment } : {}),
    ...(notes.length ? { notes } : {}),
  };
};

const writeNote = (b: RaidNoteDraft): RaidNoteDraft | null => {
  if ('ul' in b) {
    const ul = cleanTexts(b.ul);
    return ul.length ? { ul } : null;
  }
  return hasText(b.p) ? { p: b.p } : null;
};

const writeTeam = (t: RaidTeamDraft): RawTeam => {
  const entries = t.builds.filter((e) => e.character.trim()).map(writeBuild);
  const notes = t.notes.map(writeNote).filter((b): b is RaidNoteDraft => b !== null);
  const { bonus, malus } = t.geas;
  return {
    title: t.title,
    // Un seul badge : l'élément prime, comme au rendu.
    ...(t.element ? { element: t.element } : t.icon ? { icon: t.icon } : {}),
    slots: cleanSlots(t.slots),
    ...(bonus.length || malus.length ? { geasActive: { bonus, malus } } : {}),
    ...(entries.length
      ? { requirements: { entries, ...(hasText(t.buildsNote) ? { note: t.buildsNote! } : {}) } }
      : {}),
    ...(notes.length ? { notes } : {}),
    ...(t.video ? { video: t.video } : {}),
  };
};

/** Les quatre fichiers d'une version (`null` = pas de fichier). */
export interface RaidFilePayload {
  'config.json': RawRaidConfig | null;
  'subA.json': RawSub | null;
  'subB.json': RawSub | null;
  'main.json': { teams: RawTeam[] } | null;
}

/**
 * Les fichiers d'une version au gabarit, au format canonique. `pinned` :
 * l'épinglage à écrire dans `config.json` (le store décide lequel — celui du
 * brouillon, ou celui du disque quand le brouillon n'en parle pas).
 */
export function fromRaidDraft(raid: RaidTemplateDraft, pinned?: string[]): RaidFilePayload {
  const config: RawRaidConfig = {
    ...(raid.subA ? { subA: raid.subA } : {}),
    ...(raid.subB ? { subB: raid.subB } : {}),
    ...(raid.main ? { main: raid.main } : {}),
    ...(pinned?.length ? { pinned: [...pinned].sort() } : {}),
  };
  return {
    'config.json': Object.keys(config).length ? config : null,
    'subA.json': writeSub(raid.bossA),
    'subB.json': writeSub(raid.bossB),
    'main.json': raid.teams.length ? { teams: raid.teams.map(writeTeam) } : null,
  };
}

/** Les vidéos d'une version (sous-boss, puis équipes) — ce que le cache des métadonnées suit. */
export function raidVideos(raid: RaidVersionDraft | undefined): VideoItem[] {
  if (!raid || isRaidLegacy(raid)) return [];
  return [raid.bossA.video, raid.bossB.video, ...raid.teams.map((t) => t.video)].filter(
    (v): v is VideoItem => Boolean(v),
  );
}

/* --- Le contrôle d'un brouillon venu de la page --- */

/** Un écart SITUÉ : l'onglet de la page (`battle`, `phase1`, `phase2`), le rang, le champ. */
export interface RaidIssue {
  tab: 'battle' | 'phase1' | 'phase2';
  index?: number;
  field?: string;
  reason: string;
}

/** Ce que le contrôle demande à l'appelant : la donnée réelle, injectée. */
export interface RaidCheckContext {
  /**
   * Un texte localisé venu de la page : nettoyé (absent s'il est vide), et la
   * raison de son refus s'il en a une — le texte est rendu MÊME refusé, pour
   * que la version rebâtie reste comparable à celle du disque.
   */
  text: (raw: unknown) => { text?: LText; issue?: string };
  /** Les tags inline d'une chaîne nue (stat, équipement, priorité) : ses écarts. */
  token: (value: string) => string[];
  /** Les noms d'affichage anglais du roster. */
  names: ReadonlySet<string>;
  /** Les combats de guild raid que la donnée connaît. */
  groups: ReadonlySet<string>;
  /** Les geas déblocables d'un sous-boss (ids) ; vide pour un combat sans table. */
  geas: (group: string) => readonly string[];
  /** Une vidéo est-elle d'une plateforme que le site rend ? */
  platform: (value: unknown) => boolean;
}

/**
 * Une version de guild raid venue de la page, rebâtie sur les SEULES clés du
 * gabarit et contrôlée. Chaque écart est rendu situé ; la version rebâtie est
 * rendue même avec des écarts (l'appelant la compare au disque : une version
 * que la page n'a pas touchée ne se refuse pas), `null` seulement pour une
 * forme illisible. Couvre : un tag inconnu (textes et tokens), un perso hors du
 * roster, un combat inconnu, un geas hors du pool déblocable des deux
 * sous-boss de la version, un poste vide, plus de quatre postes, une équipe
 * sans titre, un `turnOrder` qui réapparaîtrait, un badge inconnu.
 */
export function cleanRaidVersion(
  raw: unknown,
  ctx: RaidCheckContext,
): { raid: RaidTemplateDraft | null; issues: RaidIssue[] } {
  const issues: RaidIssue[] = [];
  const refuse = (issue: RaidIssue): void => void issues.push(issue);
  if (!isRecord(raw)) {
    refuse({ tab: 'phase2', reason: 'guild raid : forme inattendue' });
    return { raid: null, issues };
  }
  type Where = Omit<RaidIssue, 'reason'>;
  const text = (value: unknown, where: Where): LText | undefined => {
    const out = ctx.text(value);
    if (out.issue) refuse({ ...where, reason: out.issue });
    return out.text;
  };
  const texts = (value: unknown, where: Where): LText[] => {
    if (value === undefined) return [];
    if (!Array.isArray(value)) {
      refuse({ ...where, reason: 'une liste de textes attendue' });
      return [];
    }
    return value.flatMap((t) => {
      const out = text(t, where);
      return out ? [out] : [];
    });
  };
  const heroes = (value: unknown, where: Where): string[] => {
    if (!isStrings(value)) {
      refuse({ ...where, reason: 'une liste de noms attendue' });
      return [];
    }
    const out = cleanNames(value);
    const stray = out.filter((n) => !ctx.names.has(n));
    if (stray.length)
      refuse({ ...where, reason: `hors du roster : ${stray.map((n) => `« ${n} »`).join(', ')}` });
    return out;
  };
  /** Les postes d'une équipe : aucun vide, quatre au plus. */
  const slots = (value: unknown, where: Where): string[][] => {
    if (value === undefined) return [];
    if (!Array.isArray(value)) {
      refuse({ ...where, reason: 'des postes attendus' });
      return [];
    }
    if (value.length > RAID_MAX_SLOTS)
      refuse({ ...where, field: 'slots', reason: `plus de ${RAID_MAX_SLOTS} postes` });
    return value.map((slot, i) => {
      const names = heroes(slot, { ...where, field: 'slots' });
      if (!names.length) refuse({ ...where, field: 'slots', reason: `poste ${i + 1} vide` });
      return names;
    });
  };
  const video = (value: unknown, where: Where): VideoItem | undefined => {
    if (value === undefined || value === null) return undefined;
    if (!isRecord(value) || typeof value.id !== 'string') {
      refuse({ ...where, field: 'video', reason: 'vidéo : un id attendu' });
      return undefined;
    }
    if (!ctx.platform(value.platform)) {
      refuse({
        ...where,
        field: 'video',
        reason: `vidéo : « ${String(value.platform)} » n'est pas une plateforme connue`,
      });
      return undefined;
    }
    return Object.fromEntries(
      VIDEO_KEYS.filter((k) => typeof value[k] === 'string').map((k) => [k, value[k]]),
    ) as unknown as VideoItem;
  };
  const tokens = (value: unknown, where: Where, what: string): string[] => {
    if (value === undefined) return [];
    if (!isStrings(value)) {
      refuse({ ...where, reason: `${what} : des chaînes attendues` });
      return [];
    }
    const out = cleanLines(value);
    for (const s of out)
      for (const bad of ctx.token(s)) refuse({ ...where, reason: `${what} : ${bad}` });
    return out;
  };

  // Combat : les trois `group`, choisis parmi les combats de guild raid.
  const groups: Partial<Record<'subA' | 'subB' | 'main', string>> = {};
  for (const key of ['subA', 'subB', 'main'] as const) {
    const g = raw[key];
    if (g === undefined || g === '') continue;
    if (typeof g !== 'string' || !ctx.groups.has(g))
      refuse({ tab: 'battle', field: key, reason: `combat inconnu : « ${String(g)} »` });
    else groups[key] = g;
  }

  // Phase 1 : les deux sous-boss.
  const boss = (value: unknown, index: number): RaidSubBossDraft => {
    const b = isRecord(value) ? value : {};
    const where: Where = { tab: 'phase1', index };
    const teamNote = text(b.teamNote, { ...where, field: 'teamNote' });
    const vid = video(b.video, where);
    return {
      notes: texts(b.notes, { ...where, field: 'notes' }),
      recommended: (Array.isArray(b.recommended) ? b.recommended : []).flatMap((g) => {
        const r = isRecord(g) ? g : {};
        const reason = text(r.reason, { ...where, field: 'recommended' });
        const characters = heroes(r.characters ?? [], { ...where, field: 'recommended' });
        return characters.length || reason ? [{ characters, ...(reason ? { reason } : {}) }] : [];
      }),
      slots: slots(b.slots, where),
      ...(teamNote ? { teamNote } : {}),
      ...(vid ? { video: vid } : {}),
    };
  };
  const bossA = boss(raw.bossA, 0);
  const bossB = boss(raw.bossB, 1);

  // Phase 2 : les équipes. Le pool de geas est celui des deux sous-boss de la version.
  const pool = new Set([
    ...(groups.subA ? ctx.geas(groups.subA) : []),
    ...(groups.subB ? ctx.geas(groups.subB) : []),
  ]);
  const teams = (Array.isArray(raw.teams) ? raw.teams : []).map((value, index): RaidTeamDraft => {
    const t = isRecord(value) ? value : {};
    const where: Where = { tab: 'phase2', index };
    const titled = ctx.text(t.title);
    const title = titled.text;
    if (titled.issue) refuse({ ...where, field: 'title', reason: titled.issue });
    else if (!title?.en?.trim()) refuse({ ...where, field: 'title', reason: 'équipe sans titre' });
    const element = typeof t.element === 'string' && t.element ? t.element : undefined;
    const icon = typeof t.icon === 'string' && t.icon.trim() ? t.icon.trim() : undefined;
    if (element && !(RAID_ELEMENTS as readonly string[]).includes(element))
      refuse({ ...where, field: 'badge', reason: `élément inconnu : « ${element} »` });
    if (!element && icon && !/^[A-Za-z0-9_]+$/.test(icon))
      refuse({ ...where, field: 'badge', reason: `icône inattendue : « ${icon} »` });

    const geasRaw = isRecord(t.geas) ? t.geas : {};
    const geas = { bonus: [] as string[], malus: [] as string[] };
    for (const side of ['bonus', 'malus'] as const) {
      const ids = geasRaw[side] ?? [];
      if (!isStrings(ids)) {
        refuse({ ...where, field: 'geas', reason: 'geas : des ids attendus' });
        continue;
      }
      for (const id of ids) {
        geas[side].push(id);
        if (!pool.has(id))
          refuse({
            ...where,
            field: 'geas',
            reason: `geas ${id} hors du pool déblocable des sous-boss de la version`,
          });
      }
    }

    const builds = (Array.isArray(t.builds) ? t.builds : []).flatMap((value, bi) => {
      const e = isRecord(value) ? value : {};
      const at: Where = { ...where, field: `build.${bi}` };
      const character = typeof e.character === 'string' ? e.character.trim() : '';
      if (!character) {
        refuse({ ...at, reason: 'build sans perso' });
        return [];
      }
      if (!ctx.names.has(character)) refuse({ ...at, reason: `hors du roster : « ${character} »` });
      const stats: Record<string, string> = {};
      for (const [k, s] of Object.entries(isRecord(e.stats) ? e.stats : {})) {
        if (!(RAID_STAT_KEYS as readonly string[]).includes(k) || typeof s !== 'string') {
          refuse({ ...at, reason: `stat inconnue : « ${k} »` });
          continue;
        }
        if (!s.trim()) continue;
        stats[k] = s;
        for (const bad of ctx.token(s)) refuse({ ...at, reason: `${k} : ${bad}` });
      }
      const equipment: Record<string, string[]> = {};
      for (const [k, list] of Object.entries(isRecord(e.equipment) ? e.equipment : {})) {
        if (!(RAID_EQUIP_KEYS as readonly string[]).includes(k)) {
          refuse({ ...at, reason: `équipement inconnu : « ${k} »` });
          continue;
        }
        const lines = tokens(list, at, k);
        if (lines.length) equipment[k] = lines;
      }
      const prio = tokens(e.prio, at, 'prio');
      const notes = texts(e.notes, at);
      const build: RaidBuildDraft = {
        character,
        ...(Object.keys(stats).length ? { stats } : {}),
        ...(prio.length ? { prio } : {}),
        ...(Object.keys(equipment).length ? { equipment } : {}),
        ...(notes.length ? { notes } : {}),
      };
      return [build];
    });

    const notes = (Array.isArray(t.notes) ? t.notes : []).flatMap((value, ni): RaidNoteDraft[] => {
      const b = isRecord(value) ? value : {};
      const at: Where = { ...where, field: `note.${ni}` };
      if ('turnOrder' in b) {
        refuse({ ...at, reason: 'bloc turnOrder : l’ordre de jeu se lit dans les builds' });
        return [];
      }
      if ('ul' in b) {
        const ul = texts(b.ul, at);
        return ul.length ? [{ ul }] : [];
      }
      const p = text(b.p, at);
      return p ? [{ p }] : [];
    });

    const buildsNote = text(t.buildsNote, { ...where, field: 'buildsNote' });
    const vid = video(t.video, where);
    return {
      title: title ?? { en: '' },
      ...(element ? { element } : icon ? { icon } : {}),
      slots: slots(t.slots, where),
      geas,
      builds,
      ...(buildsNote ? { buildsNote } : {}),
      notes,
      ...(vid ? { video: vid } : {}),
    };
  });

  return { raid: { ...groups, bossA, bossB, teams }, issues };
}
