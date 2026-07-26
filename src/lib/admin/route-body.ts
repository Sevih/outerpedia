/**
 * LECTURE DU CORPS des routes d'écriture admin (audit F3) — garde de FORME à la
 * frontière HTTP, avant que la donnée n'atteigne un store.
 *
 * Les routes faisaient `(await req.json()) as T`, un cast qui ne vérifie RIEN.
 * Deux conséquences, toutes deux constatées :
 *
 *  1. **JSON malformé → 500 avec stack.** `req.json()` rejette, personne ne
 *     rattrape. Bruit en dev, et un message inutilisable côté client.
 *  2. **Payload du mauvais TYPE → suppression SILENCIEUSE de la curation.** Le
 *     plus coûteux, et invisible au type-check. Les stores « compactent » l'entrée
 *     reçue (ne garder que les champs connus, non vides) puis appliquent la règle
 *     « compact vide ⇒ l'entrée n'a plus de curation ⇒ on la SUPPRIME ». Une
 *     chaîne, un nombre ou un tableau n'ont aucun champ connu → compact vide →
 *     l'override curé de l'entité est effacé, et la route répond `{ ok: true }`.
 *     Vérifié sur `upsertEffectCurated` : payloads `"bonjour"`, `42`, `true`,
 *     `["a"]` renvoient tous zéro erreur ; `null` lève (500).
 *
 * D'où une garde en DEUX temps ici : parse rattrapé, puis CONTENEUR exigé (objet
 * ou tableau selon la route). La validation par CHAMP reste chez les stores —
 * c'est leur métier, ils la font déjà, et elle dépend de l'entité.
 */
import { NextResponse } from 'next/server';

/** Corps lu : soit la donnée typée, soit la réponse 400 à renvoyer telle quelle. */
export type BodyResult<T> = { ok: true; body: T } | { ok: false; res: NextResponse };

const refuse = (reason: string): { ok: false; res: NextResponse } => ({
  ok: false,
  res: NextResponse.json({ ok: false, errors: [reason] }, { status: 400 }),
});

/** Parse rattrapé — `undefined` si le corps n'est pas du JSON lisible. */
async function parse(req: Request): Promise<{ value: unknown } | undefined> {
  try {
    return { value: await req.json() };
  } catch {
    return undefined;
  }
}

/**
 * Corps qui doit être un OBJET (dictionnaire de champs curés).
 * Refuse `null`, un tableau et tout scalaire — les trois se compactaient en
 * « vide » côté store, donc en SUPPRESSION de l'entrée.
 */
export async function jsonObjectBody<T>(req: Request): Promise<BodyResult<T>> {
  const parsed = await parse(req);
  if (!parsed) return refuse('corps JSON invalide.');
  const { value } = parsed;
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    return refuse('objet JSON attendu.');
  return { ok: true, body: value as T };
}

/** Corps qui doit être un TABLEAU (listes curées : bannières, coupons, builds…). */
export async function jsonArrayBody<T>(req: Request): Promise<BodyResult<T[]>> {
  const parsed = await parse(req);
  if (!parsed) return refuse('corps JSON invalide.');
  if (!Array.isArray(parsed.value)) return refuse('tableau JSON attendu.');
  return { ok: true, body: parsed.value as T[] };
}

/**
 * Corps OPTIONNEL d'une route d'ACTION (« valider la cible », « versionner ») :
 * il ne porte pas de donnée à écrire, seulement des options. Absent, illisible ou
 * non-objet ⇒ `{}` (les options prennent leur défaut), JAMAIS un 400 : poster
 * sans corps est ici un usage normal.
 *
 * À NE PAS employer pour une route qui écrit de la donnée curée — là, un payload
 * douteux doit être REFUSÉ, pas silencieusement vidé (cf. `jsonObjectBody`).
 * Remplace le `req.json().catch(() => ({}))` de ces routes, qui laissait passer
 * un `null` littéral (JSON valide, non rattrapé) → `body.x` levait un 500.
 */
export async function optionalJsonObject<T extends object>(req: Request): Promise<Partial<T>> {
  const parsed = await parse(req);
  const v = parsed?.value;
  return v !== null && typeof v === 'object' && !Array.isArray(v) ? (v as Partial<T>) : {};
}
