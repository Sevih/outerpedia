/**
 * Parallélisme BORNÉ pour les passes datagen (lectures sharp, I/O par fichier).
 * Pas de dépendance externe (le repo n'en a aucune pour ça) : un mini-pool suffit.
 */

/**
 * Applique `fn` à chaque élément avec au plus `limit` exécutions EN VOL, et
 * renvoie les résultats DANS L'ORDRE des entrées — le tri/dédup en aval en dépend,
 * donc l'ordre ne doit JAMAIS suivre l'ordre d'achèvement.
 *
 * `limit` ≤ 0 est ramené à 1 (jamais de pool vide). Comme `Promise.all`, la
 * PREMIÈRE erreur rejette la promesse globale ; les tâches déjà en vol finissent
 * mais leurs résultats sont abandonnés (aucune nouvelle n'est lancée).
 */
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const n = items.length;
  const results = new Array<R>(n);
  const cap = Math.max(1, Math.min(Math.floor(limit) || 1, n || 1));
  let next = 0;

  // Chaque worker tire le prochain indice libre tant qu'il en reste : le pool ne
  // dépasse jamais `cap` promesses concurrentes, quel que soit le nombre d'items.
  async function worker(): Promise<void> {
    while (next < n) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: cap }, () => worker()));
  return results;
}
