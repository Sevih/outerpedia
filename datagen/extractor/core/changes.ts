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
