/**
 * Lecture DISQUE des JSON de `data/` — pour les modules SERVEUR dont le
 * fichier est réécrit par l'admin en cours de session.
 *
 * Un `import` statique de ces JSON les fait entrer dans le graphe de modules :
 * chaque « Enregistrer » de l'admin (qui réécrit monsters.json — 5,8 Mo — et
 * monster-skills.json — 8,7 Mo) déclenchait alors une recompilation Turbopack
 * de toutes les routes concernées, 10 à 40 s de « Compiling… » entre deux
 * monstres. Lu au filesystem, le fichier est invisible du bundler : le save est
 * instantané et la requête suivante voit la donnée fraîche.
 *
 * Cache par mtime, re-stat au plus toutes les 200 ms : les boucles chaudes
 * (une résolution de chip par effet de skill) ne paient qu'un accès Map, et la
 * fraîcheur reste largement sous le temps d'un aller-retour humain. En prod le
 * fichier ne change jamais : un seul parse par process.
 *
 * RÉSERVÉ AU SERVEUR (node:fs) : un module du graphe client ne peut pas
 * l'importer — le build le refuse, c'est le garde-fou.
 */
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const STAT_TTL_MS = 200;

interface Entry {
  mtimeMs: number;
  checkedAt: number;
  data: unknown;
}
const cache = new Map<string, Entry>();

/** JSON de `data/<rel>` (ex. `generated/monsters.json`), cache par mtime. */
export function loadDataJson<T>(rel: string): T {
  const now = Date.now();
  const hit = cache.get(rel);
  if (hit && now - hit.checkedAt < STAT_TTL_MS) return hit.data as T;
  const { mtimeMs } = statSync(resolve(process.cwd(), 'data', rel));
  if (hit && hit.mtimeMs === mtimeMs) {
    hit.checkedAt = now;
    return hit.data as T;
  }
  const data = JSON.parse(readFileSync(resolve(process.cwd(), 'data', rel), 'utf8')) as T;
  cache.set(rel, { mtimeMs, checkedAt: now, data });
  return data;
}
