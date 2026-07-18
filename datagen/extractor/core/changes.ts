/**
 * Moteur de DIFF générique entre deux jeux d'entités (clé → objet).
 *
 * Sert la revue de maintenance : « qu'est-ce qui changerait si je régénère ? ».
 * On confronte la donnée committée (`data/generated/*`) à une extraction fraîche,
 * et on produit un diff STRUCTURÉ (par entité, par champ) — pas un diff de texte.
 *
 * 100 % PUR (aucune I/O) → testable, réutilisable pour TOUTE entité (perso,
 * équipement…). Répond au défaut V2 « un diff inline ré-écrit par route ».
 */

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

/** Accumule les feuilles divergentes entre deux valeurs, chemin compris. */
function walk(a: unknown, b: unknown, path: string, out: FieldDiff[]): void {
  if (stable(a) === stable(b)) return;

  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
    for (const k of keys) walk(a[k], b[k], path ? `${path}.${k}` : k, out);
    return;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
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
 * Normalisation TYPOGRAPHIQUE (portée de la V2) : deux valeurs qui ne diffèrent
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

/** Répartition d'un diff pour les badges : nouveau / vrai écart / typo / disparu. */
export interface DiffBuckets {
  /** Entités dans le jeu, pas encore sur le site (`added`). */
  new: number;
  /** Entités modifiées avec au moins un VRAI champ changé. */
  diff: number;
  /** Entités modifiées dont tous les champs ne sont que typographiques. */
  typo: number;
  /** Entités disparues du jeu mais encore committées (`removed`). */
  removed: number;
}

/** Classe un `RecordDiff` en compteurs new / diff / typo / removed. */
export function diffBuckets(diff: RecordDiff): DiffBuckets {
  let typo = 0;
  let real = 0;
  for (const e of diff.changed) {
    if (isTypoEntity(e)) typo++;
    else real++;
  }
  return { new: diff.added.length, diff: real, typo, removed: diff.removed.length };
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
