/**
 * Sérialisation des read-merge-write des stores curés (audit F7).
 *
 * LE PROBLÈME, mesuré et non supposé. Un store fait `readAll()` → modifier →
 * `await writeJson()`. Or `writeJson` formate AVANT d'écrire (`await formatJson`,
 * qui passe par prettier) : il y a donc un point de suspension ENTRE la lecture
 * et l'écriture, dans lequel une autre requête du même processus peut se glisser.
 *
 *   A: readAll()            → { }
 *   A: await formatJson(…)  → rend la main
 *   B: readAll()            → { }   ← A n'a pas encore écrit
 *   B: await formatJson(…)
 *   A: write                → { stella }
 *   B: write                → { tamamo }   ← l'écriture de A est PERDUE
 *
 * Reproduit avant correction : deux `upsertCharacterCurated` concurrents sur deux
 * persos DIFFÉRENTS ne laissaient qu'une seule entrée dans le fichier. Le geste
 * est banal — deux onglets d'admin ouverts sur deux entités qui partagent le même
 * curé, et un enregistrement dans chacun.
 *
 * ⚠ À ne pas confondre avec le sujet de F1 (temporaire unique). Là, l'entrelacement
 * intra-processus était IMPOSSIBLE — `writeFileSync` puis `renameSync` sont
 * synchrones et rien ne les sépare. Ici l'`await` existe vraiment, d'où un bug
 * réel là où l'autre était théorique.
 *
 * LA PORTÉE. Une file d'attente par fichier, en mémoire du processus. Ça couvre le
 * cas réel (les deux onglets parlent au MÊME serveur dev). Ça ne couvre PAS deux
 * processus (serveur dev + CLI datagen sur le même curé) : il faudrait un verrou
 * sur disque, hors de proportion pour un outil local mono-utilisateur — et F1
 * garantit déjà qu'aucun des deux ne laisse de fichier tronqué.
 *
 * CE QUE ÇA NE FAIT PAS. Les stores qui REMPLACENT le fichier entier (changelog,
 * events, coupons/bannières, presets) ne sont pas concernés : l'éditeur y envoie
 * la liste complète qu'il a chargée, donc le dernier enregistrement écrase
 * l'autre par construction. Un verrou n'y changerait rien — il faudrait une
 * détection de version côté UI, ce qui est un autre sujet.
 */

/** Dernière opération en cours par fichier — la file est la chaîne de promesses. */
const chains = new Map<string, Promise<unknown>>();

/**
 * Exécute `fn` en exclusion mutuelle sur `key` (chemin du fichier curé) : tant
 * qu'une opération sur ce fichier n'est pas terminée, la suivante attend.
 *
 * Les erreurs sont propagées à l'appelant MAIS ne cassent pas la file : un
 * enregistrement qui échoue ne doit pas bloquer les suivants (`catch` sur la
 * chaîne mémorisée, jamais sur la promesse rendue).
 */
export function withStoreLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const previous = chains.get(key) ?? Promise.resolve();
  // `then(fn, fn)` : on enchaîne que le précédent ait réussi ou échoué.
  const current = previous.then(fn, fn);
  chains.set(
    key,
    current.catch(() => {}),
  );
  return current;
}
