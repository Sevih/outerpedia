/**
 * Moteur de DIFF générique entre deux jeux d'entités (clé → objet).
 *
 * Sert la revue de maintenance : « qu'est-ce qui changerait si je régénère ? ».
 * On confronte la donnée committée (`data/generated/*`) à une extraction fraîche,
 * et on produit un diff STRUCTURÉ (par entité, par champ) — pas un diff de texte.
 *
 * 100 % PUR (aucune I/O) → testable, réutilisable pour TOUTE entité (perso,
 * équipement…). Répond au défaut d'avant : « un diff inline ré-écrit par route ».
 */
import { GAME_LANGS } from '../../lib/lang';

const LANGS: ReadonlySet<string> = new Set(GAME_LANGS);

/** Une feuille qui a changé : chemin pointé (`profile.height`, `skills[2].desc.en`). */
export interface FieldDiff {
  path: string;
  existing: unknown;
  extracted: unknown;
}

/** Une entité présente des deux côtés mais dont au moins un champ diffère. */
export interface EntityDiff {
  key: string;
  fields: FieldDiff[];
}

/** Bilan complet : ajouts / retraits / modifs, + nb d'entités inchangées. */
export interface RecordDiff {
  /** Clés présentes seulement dans l'extraction (entités nouvelles). */
  added: string[];
  /** Clés présentes seulement dans le committé (entités disparues). */
  removed: string[];
  /** Entités modifiées, avec le détail champ par champ. */
  changed: EntityDiff[];
  /** Nombre d'entités identiques (présentes des deux côtés, sans écart). */
  unchanged: number;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Sérialisation STABLE (clés d'objet triées) → égalité indépendante de l'ordre. */
function stable(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stable).join(',')}]`;
  if (isPlainObject(v)) {
    return `{${Object.keys(v)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stable(v[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(v ?? null);
}

/**
 * Clés d'alignement d'une liste : l'`id` scalaire de CHAQUE élément, s'ils sont
 * tous des objets à `id` unique — sinon `undefined` (alignement par index).
 */
function listIds(v: unknown[]): string[] | undefined {
  const ids: string[] = [];
  for (const e of v) {
    if (!isPlainObject(e)) return undefined;
    const id = e.id;
    if (typeof id !== 'string' && typeof id !== 'number') return undefined;
    ids.push(String(id));
  }
  return new Set(ids).size === ids.length ? ids : undefined;
}

/** Accumule les feuilles divergentes entre deux valeurs, chemin compris. */
function walk(a: unknown, b: unknown, path: string, out: FieldDiff[]): void {
  if (stable(a) === stable(b)) return;

  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
    for (const k of keys) walk(a[k], b[k], path ? `${path}.${k}` : k, out);
    return;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    // Liste d'objets IDENTIFIÉS (costumes d'un perso, passifs d'un équipement) :
    // alignée par `id`, pas par index — un élément inséré ou déplacé se lit
    // comme UN ajout (`costumes[#109]`) ou UN champ `sort`, pas comme une
    // cascade de champs décalés sur tous les suivants (illisible, et
    // inclassable en retouche mineure). Les listes de scalaires et les objets
    // sans `id` unique restent par index.
    const ia = listIds(a);
    const ib = listIds(b);
    if (ia && ib) {
      const byA = new Map(ia.map((id, i) => [id, a[i]]));
      const byB = new Map(ib.map((id, i) => [id, b[i]]));
      for (const id of new Set([...ia, ...ib]))
        walk(byA.get(id), byB.get(id), `${path}[#${id}]`, out);
      return;
    }
    const n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) walk(a[i], b[i], `${path}[${i}]`, out);
    return;
  }

  out.push({ path, existing: a, extracted: b });
}

/** Diff champ par champ entre deux entités (clé déjà appariée). */
export function diffEntity(existing: unknown, extracted: unknown): FieldDiff[] {
  const out: FieldDiff[] = [];
  walk(existing, extracted, '', out);
  return out;
}

/**
 * Normalisation TYPOGRAPHIQUE (portée telle quelle) : deux valeurs qui ne diffèrent
 * QUE par du blanc ou des variantes de ponctuation sont ramenées à la même
 * chaîne. Sert à séparer une vraie modif d'une coquille cosmétique — guillemets
 * courbes ↔ droits, ponctuation pleine largeur/CJK ↔ ASCII, points de
 * suspension, espaces. Fréquent sur les textes localisés (effets en/jp/kr/zh),
 * d'où l'intérêt de ne PAS les compter comme de vrais écarts.
 */
export function normalizeTypo(v: unknown): string {
  return JSON.stringify(v ?? null)
    .replace(/\s+/g, '')
    .replace(/[，,]/g, ',')
    .replace(/[：:]/g, ':')
    .replace(/[（(]/g, '(')
    .replace(/[）)]/g, ')')
    .replace(/[！!]/g, '!')
    .replace(/[‘’']/g, "'")
    .replace(/[、､]/g, '、')
    .replace(/[。｡]/g, '。')
    .replace(/[~～]/g, '~')
    .replace(/\.\.\./g, '…')
    .replace(/…/g, '...')
    .replace(/[？?]/g, '?')
    .replace(/[％%]/g, '%')
    .replace(/[；;]/g, ';')
    .replace(/[＋+]/g, '+');
}

/** Un champ ne diffère que typographiquement (coquille, pas un vrai changement). */
export function isTypoField(f: FieldDiff): boolean {
  return normalizeTypo(f.existing) === normalizeTypo(f.extracted);
}

/** Une entité modifiée dont TOUS les champs sont typo (coquille pure). */
export function isTypoEntity(e: EntityDiff): boolean {
  return e.fields.length > 0 && e.fields.every(isTypoField);
}

// --- retouches MINEURES ------------------------------------------------------------
//
// Troisième classe d'écart, à côté de typo (retours de Sevih, patch du
// 06/10/2026) : une entité dont TOUS les champs changés sont mineurs n'a pas à
// être ré-intégrée — la revue l'applique d'un geste (`acceptMinor`). Est mineur :
//   - un champ typo (règle `isTypoField`, inchangée) ;
//   - un champ de TEXTE (cf. `TEXT_KEYS`) REFORMULÉ : mêmes suites de chiffres,
//     dans l'ordre, langue par langue — une description dont un pourcentage
//     change dit un équilibrage, même si la table des valeurs n'est pas dans
//     l'entité, donc un vrai écart ;
//   - sous `costumes` d'un perso : un costume AJOUTÉ, son ordre (`sort`), son
//     texte (`name`) ; et l'apparence (`appearances[n]`) qui n'est que le modèle
//     d'un costume ajouté dans le même écart. Un costume RETIRÉ reste un vrai
//     écart (le jeu retire rarement, et un visuel disparaît).
// Rien d'autre n'est mineur : stats, valeurs de compétence, buffs, équipement
// exclusif, éléments, classes, tags, dates, ids, provenance d'un costume
// (`source`), apparition d'un full art (`art`) — en cas de doute, pas mineur.

/**
 * Clés de TEXTE des entités générées — les seuls champs dont une reformulation
 * est une retouche mineure. Liste tenue à la main, à UN endroit, relevée sur
 * les specs (`specs/character.ts`, `specs/monster.ts`) et les cibles de
 * `targets.ts` (effets, équipement, items) au 06/10/2026 :
 *   - `name`     : nom d'un perso, d'un monstre, d'un effet, d'un équipement,
 *                  d'un item, d'un set — et d'un COSTUME (`costumes[].name`) ;
 *   - `nickname` : titre/épithète (perso, monstre) ;
 *   - `desc`     : description (effet, item, bonus de set `tiers[].2p.desc`) ;
 *   - `story`    : lore d'archive (`profile.story`).
 * Volontairement ABSENTS : `voiceActor` (un nom de doubleur n'est pas un texte
 * du jeu), `immuneTooltips` (des RÉFS d'ids de glossaire, pas des infobulles),
 * et toute clé dont la valeur ressemble à du texte sans en être (`icon`,
 * `source`, `grade`, `element`, `birthday`, `value: "30%"`…).
 */
export const TEXT_KEYS: ReadonlySet<string> = new Set(['name', 'nickname', 'desc', 'story']);

/** Segments d'un chemin de feuille : `costumes[#17].name.en` → costumes, #17, name, en. */
function segmentsOf(path: string): string[] {
  return path.split(/[.[\]]+/).filter(Boolean);
}

/**
 * Clé de texte visée par un chemin (`name.en` → `name`, `profile.story` →
 * `story`), ou `undefined` si la feuille n'est pas sous une clé de `TEXT_KEYS`.
 */
function textKeyOf(segments: string[]): string | undefined {
  const last = segments.at(-1);
  const key =
    last !== undefined && LANGS.has(last) && segments.length >= 2 ? segments.at(-2) : last;
  return key !== undefined && TEXT_KEYS.has(key) ? key : undefined;
}

/**
 * Suites de chiffres d'un texte, dans l'ordre — `%`, `.` et `,` intérieurs
 * compris (`1,000`, `12.5%`, `50%`). Pleine largeur (jp/zh : `５０％`) ramenée
 * à l'ASCII par NFKC.
 */
export function numberSequence(text: string): string[] {
  return text.normalize('NFKC').match(/\d+(?:[.,]\d+)*%?/g) ?? [];
}

/**
 * Textes d'une valeur de champ texte, par langue — une chaîne nue sous la clé
 * `''`, un dictionnaire de langues par langue, rien pour un champ absent ;
 * `undefined` si la valeur n'a aucune de ces formes (ce n'est pas du texte).
 */
function textsOf(v: unknown): Map<string, string> | undefined {
  if (v === undefined || v === null) return new Map();
  if (typeof v === 'string') return new Map([['', v]]);
  if (isPlainObject(v) && Object.keys(v).every((k) => LANGS.has(k) && typeof v[k] === 'string'))
    return new Map(Object.entries(v) as [string, string][]);
  return undefined;
}

/** Un champ de texte REFORMULÉ : mêmes suites de chiffres, langue par langue. */
export function isRewordField(f: FieldDiff): boolean {
  if (!textKeyOf(segmentsOf(f.path))) return false;
  const before = textsOf(f.existing);
  const after = textsOf(f.extracted);
  if (!before || !after) return false;
  for (const lang of new Set([...before.keys(), ...after.keys()])) {
    const a = numberSequence(before.get(lang) ?? '').join(' ');
    const b = numberSequence(after.get(lang) ?? '').join(' ');
    if (a !== b) return false;
  }
  return true;
}

/** Modèles (`model`, `fusionModel`) des costumes AJOUTÉS par un écart d'entité. */
function addedCostumeModels(fields: FieldDiff[]): Set<string> {
  const models = new Set<string>();
  for (const f of fields) {
    const seg = segmentsOf(f.path);
    if (seg.length !== 2 || seg[0] !== 'costumes' || f.existing !== undefined) continue;
    if (!isPlainObject(f.extracted)) continue;
    for (const k of ['model', 'fusionModel']) {
      const m = f.extracted[k];
      if (typeof m === 'string' && m) models.add(m);
    }
  }
  return models;
}

/**
 * Un champ est une retouche MINEURE (cf. en-tête de section). `newModels` =
 * modèles des costumes ajoutés dans le même écart (cf. `addedCostumeModels`),
 * pour reconnaître l'apparence qui les accompagne.
 */
export function isMinorField(f: FieldDiff, newModels: ReadonlySet<string> = new Set()): boolean {
  if (isTypoField(f)) return true;
  const seg = segmentsOf(f.path);
  if (seg[0] === 'costumes') {
    // `costumes` : premiers costumes d'un perso qui n'en avait pas (liste
    // ajoutée) ; `costumes[#id]` : un costume ajouté — jamais un retiré.
    if (seg.length === 1) return f.existing === undefined && Array.isArray(f.extracted);
    if (seg.length === 2) return f.existing === undefined && isPlainObject(f.extracted);
    // Champ D'UN costume : son ordre ou son texte — toujours mineur ; tout autre
    // champ (`icon`, `source`, `grade`, `model`, `art`…) reste un vrai écart.
    if (seg[2] === 'sort') return true;
    return textKeyOf(seg) !== undefined;
  }
  // L'apparence d'un costume ajouté : son modèle APPENDU aux `appearances`
  // (`appearances[3]`), ou la liste entière quand c'est la première (perso qui
  // n'avait pas de skin) — chaque entrée doit être le modèle d'un costume ajouté.
  if (seg[0] === 'appearances' && f.existing === undefined) {
    if (seg.length === 2) return typeof f.extracted === 'string' && newModels.has(f.extracted);
    if (seg.length === 1)
      return (
        Array.isArray(f.extracted) &&
        f.extracted.length > 0 &&
        f.extracted.every((a) => typeof a === 'string' && newModels.has(a))
      );
    return false;
  }
  return isRewordField(f);
}

/**
 * Une entité modifiée dont TOUS les champs sont mineurs (typo compris —
 * `isTypoEntity` reste pour la compatibilité, celle-ci l'englobe).
 */
export function isMinorEntity(e: EntityDiff): boolean {
  if (!e.fields.length) return false;
  const newModels = addedCostumeModels(e.fields);
  return e.fields.every((f) => isMinorField(f, newModels));
}

/** Répartition d'un diff pour les badges : nouveau / vrai écart / mineur / typo / disparu. */
export interface DiffBuckets {
  /** Entités dans le jeu, pas encore sur le site (`added`). */
  new: number;
  /** Entités modifiées avec au moins un VRAI champ changé. */
  diff: number;
  /** Entités modifiées dont tous les champs sont des retouches mineures (hors typo pur). */
  minor: number;
  /** Entités modifiées dont tous les champs ne sont que typographiques. */
  typo: number;
  /** Entités disparues du jeu mais encore committées (`removed`). */
  removed: number;
}

/** Classe un `RecordDiff` en compteurs new / diff / minor / typo / removed. */
export function diffBuckets(diff: RecordDiff): DiffBuckets {
  let typo = 0;
  let minor = 0;
  let real = 0;
  for (const e of diff.changed) {
    if (isTypoEntity(e)) typo++;
    else if (isMinorEntity(e)) minor++;
    else real++;
  }
  return { new: diff.added.length, diff: real, minor, typo, removed: diff.removed.length };
}

/**
 * Diff complet entre deux dictionnaires d'entités (clé → objet).
 * `changed` est trié par clé pour une revue déterministe.
 */
export function diffRecords(
  existing: Record<string, unknown>,
  extracted: Record<string, unknown>,
): RecordDiff {
  const added: string[] = [];
  const removed: string[] = [];
  const changed: EntityDiff[] = [];
  let unchanged = 0;

  for (const key of Object.keys(extracted)) {
    if (!(key in existing)) added.push(key);
  }
  for (const key of Object.keys(existing)) {
    if (!(key in extracted)) {
      removed.push(key);
      continue;
    }
    const fields = diffEntity(existing[key], extracted[key]);
    if (fields.length) changed.push({ key, fields });
    else unchanged++;
  }

  added.sort();
  removed.sort();
  changed.sort((a, b) => a.key.localeCompare(b.key));
  return { added, removed, changed, unchanged };
}
