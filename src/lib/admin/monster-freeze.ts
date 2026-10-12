/**
 * FIGER un monstre et RÉ-ÉPINGLER ses guides en UN geste — quick, section
 * « Extraction », lot F22 : ce que l'écran montre AVANT de figer, et ce que le
 * geste doit savoir pour refuser ou re-dater.
 *
 * Le moteur ne bouge pas : l'archive est `versionMonster`
 * (`datagen/extractor/version-monster.ts`), le ré-épinglage `planRepin` /
 * `applyRepin` (`repin-guides.ts`). Ce module est ce qui manquait autour d'eux
 * pour que le geste soit LISIBLE avant d'être joué :
 *
 *   - le PLAN complet (`freezePlanOf`) : la clé à venir, l'état de HEAD, les
 *     guides touchés rangés par ce qui leur arrive, les motifs en français,
 *     les guides qui seront re-datés, le message du commit, et `was` — la
 *     signature de ce plan, que le geste renvoie et qui le fait refuser si le
 *     plan recalculé n'est plus celui que l'écran a montré ;
 *   - l'INDEX INVERSE des pins (`pinIndex`) : par clé `<id>@<n>`, qui l'épingle
 *     — une archive que personne n'épingle est « orpheline » ;
 *   - le refus « working tree sale » (`monsterDirtyFiles`) : l'archive fige
 *     HEAD, pas le disque — un monstre dont l'état diffère de HEAD ne se fige
 *     pas d'ici.
 *
 * Aucun disque ni git ici : l'appelant passe ce qu'il a lu.
 */
import { createHash } from 'node:crypto';
import {
  archivePrefixes,
  GUIDES_CONTENTS_SUBDIR,
  hasRelevantChange,
} from '@/lib/admin/guide-stamp';
import type { RepinEdit, RepinKept, RepinPlan, RepinResult } from '@/lib/admin/repin-guides';

/** Ce que le versionnage lit d'un monstre dans `data/generated/` — et donc ce qui doit être à HEAD. */
export const MONSTER_FILES = {
  monsters: 'data/generated/monsters.json',
  skills: 'data/generated/monster-skills.json',
  encounters: 'data/generated/encounters.json',
} as const;

/** Un guide, réduit à ce que ce module en lit (le scan du site en donne plus). */
export interface FreezeGuide {
  category: string;
  slug: string;
  bossId?: string;
  monsters?: string[];
  /** Ses versions, la plus récente d'abord ; `[]` pour un guide plat. */
  versions: { key: string }[];
}

const guideName = (g: Pick<FreezeGuide, 'category' | 'slug'>): string => `${g.category}/${g.slug}`;
const guideBase = (name: string): string => `${GUIDES_CONTENTS_SUBDIR}/${name}/`;

/** La clé que le prochain figeage créera : max existant + 1 (l'archive est append-only). */
export function nextArchive(
  id: string,
  archives: readonly { version: number }[],
): { key: string; version: number } {
  const version = archives.reduce((max, a) => Math.max(max, a.version), 0) + 1;
  return { key: `${id}@${version}`, version };
}

/**
 * Le motif d'un `kept`, en français. `repin-guides.ts` le porte en anglais
 * (il part tel quel dans le compte-rendu de l'admin) ; il y a un motif par
 * CHAMP, c'est donc le champ qu'on traduit — un motif nouveau, inconnu d'ici,
 * est rendu tel quel plutôt que tu.
 */
export function keptReason(k: Pick<RepinKept, 'field' | 'reason'>): string {
  if (k.field === 'meta.bossId')
    return 'guide versionné : son bossId porte le portrait et le titre, il suit l’entité courante — jamais épinglé';
  if (k.field === 'version.pinned')
    return 'version déjà figée sur ce monstre : elle garde l’archive où elle est épinglée';
  return k.reason;
}

/** Une valeur d'édition, lisible : une liste est jointe (le disque, lui, garde la liste). */
const shown = (v: string | string[]): string => (Array.isArray(v) ? v.join(', ') : v);

/** Une édition directe, telle que l'écran la montre. */
export interface FreezeEdit {
  guide: string;
  field: RepinEdit['field'];
  before: string;
  after: string;
}

/** Une version de guide dont le `config.json` reçoit la clé d'archive. */
export interface FreezePin {
  guide: string;
  version: string;
  /** Le combat qui amène le monstre. */
  group: string;
}

/** Une référence laissée en live à dessein, et pourquoi. */
export interface FreezeKept {
  guide: string;
  field: RepinKept['field'];
  version?: string;
  why: string;
}

/** Un guide PLAT qui atteint le monstre par un combat : rien d'automatique, un lien vers Guides. */
export interface FreezePending {
  guide: string;
  group: string;
  /** Le chemin de `sections.go` : `guides/<catégorie>/<slug>`. */
  go: string;
}

/** L'état que l'archive figera : le commit de HEAD, sa date, la version du jeu qu'il porte. */
export interface FreezeHead {
  ref: string;
  committedAt: string;
  gameVersion?: string;
}

const editView = (e: RepinEdit): FreezeEdit => ({
  guide: e.guide,
  field: e.field,
  before: shown(e.before),
  after: shown(e.after),
});

const keptView = (k: RepinKept): FreezeKept => ({
  guide: k.guide,
  field: k.field,
  ...(k.version ? { version: k.version } : {}),
  why: keptReason(k),
});

const pendingView = (p: RepinPlan['pending'][number]): FreezePending => ({
  guide: p.guide,
  group: p.group,
  go: `guides/${p.guide}`,
});

/** Les références indirectes d'un plan qu'`applyRepin` SAIT épingler : un combat dans une version. */
const isPin = (
  p: RepinPlan['pending'][number],
): p is RepinPlan['pending'][number] & {
  version: string;
} => p.origin === 'version.config' && Boolean(p.version);

/**
 * Les fichiers qu'un plan ferait écrire, relatifs au dépôt : le `meta.json`
 * d'une édition directe, le `config.json` d'une version épinglée.
 */
export function plannedFiles(plan: Pick<RepinPlan, 'edits' | 'pending'>): string[] {
  return [
    ...new Set([
      ...plan.edits.map((e) => `${GUIDES_CONTENTS_SUBDIR}/${e.file}`),
      ...plan.pending
        .filter(isPin)
        .map((p) => `${guideBase(p.guide)}versions/${p.version}/config.json`),
    ]),
  ];
}

/** `<catégorie>/<slug>@<version>` d'un `RepinResult.pinnedVersions`, découpé. */
function splitPinned(entry: string): { guide: string; version: string } {
  const at = entry.lastIndexOf('@');
  return { guide: entry.slice(0, at), version: entry.slice(at + 1) };
}

/** Les fichiers qu'`applyRepin` a VRAIMENT écrits, relatifs au dépôt. */
export function writtenFiles(result: Pick<RepinResult, 'files' | 'pinnedVersions'>): string[] {
  return [
    ...new Set([
      ...result.files.map((f) => `${GUIDES_CONTENTS_SUBDIR}/${f}`),
      ...result.pinnedVersions.map((entry) => {
        const { guide, version } = splitPinned(entry);
        return `${guideBase(guide)}versions/${version}/config.json`;
      }),
    ]),
  ];
}

/**
 * Les guides à RE-DATER pour ces fichiers écrits : la règle de
 * `guide-stamp.ts`, celle du hook et de « Guides » — un `meta.json` ou le
 * `config.json` de la version la plus RÉCENTE qui bouge re-date le guide ; une
 * archive de version (`versions/<plus ancienne>/`) non. Rend les noms
 * `<catégorie>/<slug>`, dans l'ordre des guides reçus.
 */
export function guidesToStamp(files: readonly string[], guides: readonly FreezeGuide[]): string[] {
  const out: string[] = [];
  for (const g of guides) {
    const name = guideName(g);
    const base = guideBase(name);
    const keys = g.versions.map((v) => v.key);
    if (hasRelevantChange(base, files, archivePrefixes(base, keys))) out.push(name);
  }
  return out;
}

/** Qui épingle une archive : un guide, par quel champ, et pour quelle version. */
export interface PinRef {
  guide: string;
  field: 'version.pinned' | 'meta.bossId' | 'meta.monsters';
  /** La version du guide, pour `version.pinned`. */
  version?: string;
}

/**
 * L'INDEX INVERSE des pins : par clé `<id>@<n>`, les guides qui l'épinglent —
 * le `pinned` du `config.json` de chaque version, et les références DIRECTES
 * d'un guide plat (`meta.bossId`, `meta.monsters` réécrits en `<id>@<n>` par
 * le ré-épinglage : elles lisent l'archive tout autant). Une clé absente de
 * l'index est une archive « orpheline ».
 */
export function pinIndex(
  guides: readonly FreezeGuide[],
  config: (guide: FreezeGuide, version: string) => { pinned?: unknown } | undefined,
): Map<string, PinRef[]> {
  const index = new Map<string, PinRef[]>();
  const add = (key: string, ref: PinRef): void => {
    const list = index.get(key);
    if (list) list.push(ref);
    else index.set(key, [ref]);
  };
  const isKey = (v: unknown): v is string => typeof v === 'string' && /^[^@]+@\d+$/.test(v);
  for (const g of guides) {
    const guide = guideName(g);
    if (isKey(g.bossId)) add(g.bossId, { guide, field: 'meta.bossId' });
    for (const m of g.monsters ?? []) if (isKey(m)) add(m, { guide, field: 'meta.monsters' });
    for (const v of g.versions) {
      const pinned = config(g, v.key)?.pinned;
      if (!Array.isArray(pinned)) continue;
      for (const key of pinned)
        if (isKey(key)) add(key, { guide, field: 'version.pinned', version: v.key });
    }
  }
  return index;
}

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => Boolean(v) && typeof v === 'object';
const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
const strings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

/**
 * Les fichiers de `data/generated/` où CE monstre diffère de HEAD : son entrée
 * de `monsters.json`, ses skills dans `monster-skills.json`, les donjons de ses
 * spawns dans `encounters.json`. `dirty` est ce que `git status` dit modifié
 * parmi ces trois fichiers ; un fichier propre n'est pas relu de HEAD. Les
 * skills et les donjons sont ceux des DEUX états : un skill retiré du kit sur
 * le disque est un changement du monstre.
 *
 * Non vide : le geste refuse. L'archive fige HEAD, et ce que l'écran montre
 * (la fiche, le diff) ne dit pas lequel des deux états on s'apprête à figer.
 */
export function monsterDirtyFiles(
  id: string,
  dirty: readonly string[],
  read: {
    /** Le JSON d'un fichier à HEAD ; `undefined` s'il n'y est pas. */
    head: (file: string) => Json | undefined;
    /** Le JSON d'un fichier sur le disque ; `undefined` s'il manque. */
    disk: (file: string) => Json | undefined;
  },
): string[] {
  const touched = new Set(dirty);
  if (!touched.size) return [];
  const at = (file: string): { head: Json; disk: Json } => {
    const disk = read.disk(file) ?? {};
    return { head: touched.has(file) ? (read.head(file) ?? {}) : disk, disk };
  };
  const out: string[] = [];
  const monsters = at(MONSTER_FILES.monsters);
  const before = monsters.head[id];
  const after = monsters.disk[id];
  if (!same(before, after)) out.push(MONSTER_FILES.monsters);
  const both = (pick: (m: Json) => string[]): string[] => [
    ...new Set([
      ...(isObject(before) ? pick(before) : []),
      ...(isObject(after) ? pick(after) : []),
    ]),
  ];
  if (touched.has(MONSTER_FILES.skills)) {
    const skills = at(MONSTER_FILES.skills);
    if (both((m) => strings(m.skills)).some((sid) => !same(skills.head[sid], skills.disk[sid])))
      out.push(MONSTER_FILES.skills);
  }
  if (touched.has(MONSTER_FILES.encounters)) {
    const dungeons = at(MONSTER_FILES.encounters);
    const ids = both((m) =>
      (Array.isArray(m.spawns) ? m.spawns : []).flatMap((s) =>
        isObject(s) && typeof s.dungeon === 'string' ? [s.dungeon] : [],
      ),
    );
    if (ids.some((d) => !same(dungeons.head[d], dungeons.disk[d])))
      out.push(MONSTER_FILES.encounters);
  }
  return out;
}

/** Le message du commit d'un figeage : `<k>` guides distincts ré-épinglés. */
export const freezeCommitMessage = (name: string, id: string, version: number, k: number): string =>
  `chore(monsters): ${name} (${id}) fige en v${version}, ${k} guide${k > 1 ? 's' : ''} re-epingle${k > 1 ? 's' : ''}`;

/** Le PLAN d'un figeage, tel que l'écran le montre avant « Figer ». */
export interface FreezePlan {
  id: string;
  name: string;
  /** La clé qui sera créée, `<id>@<n+1>`, et son numéro. */
  key: string;
  version: number;
  /** Le fichier d'archive qui sera écrit. */
  file: string;
  head: FreezeHead;
  /** `meta.bossId` d'un guide plat, `meta.monsters` : réécrits en `<id>@<n>`. */
  edits: FreezeEdit[];
  /** Les versions de guides qui recevront la clé dans leur `pinned`. */
  pins: FreezePin[];
  /** Laissés en live à dessein, avec le motif. */
  kept: FreezeKept[];
  /** Guides plats à `meta.group` : rien d'automatique. */
  pending: FreezePending[];
  /** Les guides dont `meta.updated` passera à aujourd'hui. */
  stamps: string[];
  /** Le nombre de guides distincts ré-épinglés (`edits` et `pins`). */
  guides: number;
  commit: string;
  /** Les fichiers où le monstre diffère de HEAD : non vide, le geste refuse. */
  dirty: string[];
  /** La signature de ce plan : le geste la renvoie, et refuse si elle a bougé. */
  was: string;
}

/**
 * Le plan d'un figeage, d'après ce que l'appelant a lu : les archives qui
 * existent (la clé à venir), HEAD, le plan de ré-épinglage calculé POUR cette
 * clé, les guides (la règle de datation), et les fichiers sales du monstre.
 *
 * `was` signe ce que l'écran montre et qui décide de ce qui sera écrit : la
 * clé, le commit figé, les guides touchés, gardés et en attente. Un guide
 * épinglé à la main, une archive posée par la CLI ou un commit passé entre la
 * lecture et « Figer » la changent — le geste refuse et l'écran relit.
 */
export function freezePlanOf(input: {
  id: string;
  name: string;
  archives: readonly { version: number }[];
  head: FreezeHead;
  repin: RepinPlan;
  guides: readonly FreezeGuide[];
  dirty: readonly string[];
}): FreezePlan {
  const { id, name, head, repin } = input;
  const { key, version } = nextArchive(id, input.archives);
  const edits = repin.edits.map(editView);
  const pins = repin.pending
    .filter(isPin)
    .map((p): FreezePin => ({ guide: p.guide, version: p.version, group: p.group }));
  const kept = repin.kept.map(keptView);
  const pending = repin.pending.filter((p) => !isPin(p)).map(pendingView);
  const guides = new Set([...edits.map((e) => e.guide), ...pins.map((p) => p.guide)]).size;
  const was = createHash('sha1')
    .update(JSON.stringify({ key, ref: head.ref, edits, pins, kept, pending }))
    .digest('hex')
    .slice(0, 16);
  return {
    id,
    name,
    key,
    version,
    file: `data/generated/monster-archive/${key}.json`,
    head,
    edits,
    pins,
    kept,
    pending,
    stamps: guidesToStamp(plannedFiles(repin), input.guides),
    guides,
    commit: freezeCommitMessage(name, id, version, guides),
    dirty: [...input.dirty],
    was,
  };
}

/** Ce que le figeage a fait, tel que l'écran le rapporte. */
export interface FreezeReport {
  key: string;
  version: number;
  /** Le fichier d'archive écrit. */
  file: string;
  /** Le nombre de skills figés avec l'entité. */
  skills: number;
  edits: FreezeEdit[];
  pinned: { guide: string; version: string }[];
  kept: FreezeKept[];
  pending: FreezePending[];
  /** Guides du plan qu'`applyRepin` n'a pas su écrire. */
  skipped: string[];
  /** Guides re-datés. */
  stamped: string[];
}

/** Le rapport d'un figeage, d'après l'archive écrite et ce qu'`applyRepin` a rendu. */
export function freezeReportOf(
  archive: { key: string; version: number; file: string; skills: number },
  result: RepinResult,
  stamped: readonly string[],
): FreezeReport {
  return {
    key: archive.key,
    version: archive.version,
    file: archive.file,
    skills: archive.skills,
    edits: result.applied.map(editView),
    pinned: result.pinnedVersions.map(splitPinned),
    kept: result.kept.map(keptView),
    pending: result.pending.map(pendingView),
    skipped: [...result.skipped],
    stamped: [...stamped],
  };
}
