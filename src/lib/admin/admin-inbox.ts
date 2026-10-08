/**
 * INBOX de l'accueil admin : ce qui DEMANDE UNE ACTION, trié par urgence.
 *
 * Remplace la matrice entité × fonction de la home, qui redisait les badges de
 * la sidebar (mêmes chiffres, mêmes liens) en dix lignes dont neuf « ✓ ». Ici on
 * n'affiche QUE ce qui cloche, tous signaux confondus — extraction, tags morts,
 * assets — pour que « rien à l'écran » signifie « rien à faire ».
 *
 * Ce module est aussi la SOURCE UNIQUE de la liste des entités d'extraction
 * (sidebar ET inbox la lisaient chacune de leur côté) et le point de mémoïsation
 * du moteur de revue.
 */
import { cache } from 'react';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { listTableNames, tablePath } from '@datagen/lib/tables';
import { reviewAll, reviewBuckets, type DiffBuckets } from '@/lib/admin/review-store';
import { actionableDiff } from '@/lib/admin/monster-review';
import { collectTagOccurrences } from '@/lib/admin/tag-control';

/** Une entité du moteur d'extraction : id de revue, libellé, page dédiée. */
export interface ExtractorEntity {
  id: string;
  label: string;
  href: string;
}

/**
 * Les entités d'extraction, DANS l'ordre d'affichage — le Monstre et l'Item
 * ferment la liste (décision Sevih). Lue par la sidebar comme par l'inbox : deux
 * copies dérivaient déjà (la home plaçait le Monstre en 3e).
 */
export const EXTRACTOR_ENTITIES: readonly ExtractorEntity[] = [
  { id: 'character', label: 'Character', href: '/admin/extractor/characters' },
  { id: 'effect', label: 'Effect', href: '/admin/extractor/effects' },
  { id: 'ee', label: 'EE', href: '/admin/extractor/ee' },
  { id: 'weapon', label: 'Weapons', href: '/admin/extractor/weapons' },
  { id: 'amulet', label: 'Amulet', href: '/admin/extractor/amulets' },
  { id: 'armor', label: 'Armor', href: '/admin/extractor/armors' },
  { id: 'talisman', label: 'Talisman', href: '/admin/extractor/talismans' },
  { id: 'set', label: 'Sets', href: '/admin/extractor/sets' },
  { id: 'monster', label: 'Monster', href: '/admin/extractor/monsters' },
  { id: 'item', label: 'Item', href: '/admin/extractor/items' },
];

const EMPTY: DiffBuckets = { new: 0, diff: 0, minor: 0, typo: 0, removed: 0 };

/**
 * Ce que le diff LIT, hors tables du jeu : le committé de chaque cible
 * (`data/generated/`, l'équipement dans son sous-dossier), les curés que
 * l'extraction fraîche et le périmètre « site » des monstres consultent, et les
 * icônes d'effets versionnées. Par DOSSIER plutôt que fichier par fichier : une
 * cible ou un curé de plus y entre sans qu'on y pense, et un fichier voisin qui
 * bouge ne coûte qu'un recalcul — l'inverse, un curé oublié, figerait un badge.
 */
const INPUT_DIRS = ['data/generated', 'data/generated/equipment', 'data/curated'];
const INPUT_FILES = ['data/editorial/effect-icons.json'];
/**
 * Hors empreinte : l'instantané des codes promo, que chaque LECTURE de la liste
 * vivante réécrit (`loadCouponsForEdit`) — celle du tableau de bord de quick
 * comprise, qui périmerait son propre mémo à chaque appel. Le diff ne le lit pas.
 */
const NOT_INPUTS: ReadonlySet<string> = new Set(['data/curated/coupons.json']);

/**
 * EMPREINTE des entrées du diff (`chemin:taille:mtime`, l'idée de `tablesStamp`
 * étendue à la taille) et date de la plus récente. Que des `statSync`, aucune
 * lecture : ~300 fichiers, toutes les tables parsées comprises, en moins d'une
 * milliseconde. Un fichier ajouté ou retiré change la liste, donc l'empreinte.
 *
 * Deux entrées n'y sont PAS, comme dans les caches du moteur : le pool d'images
 * extraites (7 000 dossiers — un refresh qui le change réécrit aussi les tables)
 * et les `meta.json` des guides, que `siteMonsterIds` ne stampe pas non plus.
 */
function inputsStamp(): { stamp: string; newest: number } {
  const cwd = process.cwd();
  const paths = INPUT_FILES.map((f) => resolve(cwd, f));
  for (const dir of INPUT_DIRS) {
    try {
      for (const f of readdirSync(resolve(cwd, dir)))
        if (f.endsWith('.json') && !NOT_INPUTS.has(`${dir}/${f}`)) paths.push(resolve(cwd, dir, f));
    } catch {
      /* dossier absent : rien à lire, rien dans l'empreinte */
    }
  }
  for (const t of listTableNames()) paths.push(tablePath(t));

  let newest = 0;
  const stamp = paths
    .sort()
    .map((p) => {
      try {
        const s = statSync(p);
        newest = Math.max(newest, s.mtimeMs);
        return `${p}:${s.size}:${s.mtimeMs}`;
      } catch {
        return `${p}:absent`;
      }
    })
    .join('|');
  return { stamp, newest };
}

/**
 * Délai de re-stat de `tablesStamp`/`fileStamp` (`datagen/lib/tables.ts`), sur
 * lesquels les builds du moteur sont eux-mêmes mémoïsés : dans les 2 s qui
 * suivent une écriture, ils peuvent encore servir l'extraction d'AVANT.
 */
const ENGINE_STAMP_TTL_MS = 2000;

let bucketsMemo: { stamp: string; buckets: Map<string, DiffBuckets> } | undefined;

/**
 * Diff « jeu ↔ site » par entité, MÉMOÏSÉ AU MODULE sur l'empreinte de ses
 * entrées : même empreinte, même `Map` (en LECTURE SEULE) ; un fichier qui bouge
 * — promotion, build, curé édité — et on recalcule. Pas de TTL : l'empreinte
 * est le seul signal juste.
 *
 * `cache()` de React ne mémoïse qu'en rendu serveur : hors Next (quick, sous
 * tsx) c'est un passe-plat, et chaque `bucketsOf` relançait le moteur (~0,2 s
 * l'un, dix entités). Ce mémo-ci vaut des deux côtés.
 *
 * Un calcul parti moins de `ENGINE_STAMP_TTL_MS` après la dernière écriture
 * est servi mais PAS retenu : le moteur a pu lire ses propres caches pas encore
 * rafraîchis, et le garder figerait un diff périmé sous la nouvelle empreinte.
 * Un échec non plus — l'appel suivant réessaie.
 *
 * Monstres restreints au périmètre SITE (`actionableDiff`) : sans ça le compte
 * intègre du bruit d'extraction que rien ne peut traiter. Tolérant à l'échec —
 * une extraction cassée ne doit pas faire tomber la coquille admin.
 */
function memoizedBuckets(): Map<string, DiffBuckets> {
  const { stamp, newest } = inputsStamp();
  if (bucketsMemo?.stamp === stamp) return bucketsMemo.buckets;
  const settled = Date.now() - newest >= ENGINE_STAMP_TTL_MS;
  const buckets = new Map<string, DiffBuckets>();
  try {
    for (const r of reviewAll()) buckets.set(r.id, reviewBuckets(actionableDiff(r.id, r.diff)));
    bucketsMemo = settled ? { stamp, buckets } : undefined;
  } catch {
    /* extraction indisponible */
  }
  return buckets;
}

/**
 * Le même, MÉMOÏSÉ EN PLUS À LA REQUÊTE dans Next (`cache()`) : le layout
 * (badges) et la home (inbox) partagent un appel, sans même refaire l'empreinte.
 */
export const entityBuckets = cache(memoizedBuckets);

/** Buckets d'une entité (jamais undefined — tout à zéro si inconnue). */
export const bucketsOf = (id: string): DiffBuckets => entityBuckets().get(id) ?? EMPTY;

/**
 * Total « à traiter » d'un bucket : le typo (cosmétique) et le mineur (texte
 * reformulé, costume ajouté — s'applique d'un geste, sans arbitrage) en sont
 * exclus.
 */
export const actionableCount = (b: DiffBuckets): number => b.new + b.diff + b.removed;

export type InboxTone = 'danger' | 'warn' | 'muted';

/** Une entrée d'inbox : un travail identifié, chiffré, cliquable. */
export interface InboxItem {
  key: string;
  label: string;
  /** Ce qu'il y a à faire, en clair (« 2 new · 1 diff »). */
  detail: string;
  href: string;
  tone: InboxTone;
  /** Rang d'urgence (croissant) — ordre de tri principal. */
  rank: number;
  /** Volume, pour départager à rang égal. */
  count: number;
}

/** Rapport de collecte d'assets (écrit par `pnpm assets:collect`), si présent. */
export function readAssetsReport(): {
  total: number;
  missingCount: number;
  generatedAt: string;
} | null {
  try {
    return JSON.parse(
      readFileSync(resolve(process.cwd(), '.assets-staging/manifest-report.json'), 'utf8'),
    ) as { total: number; missingCount: number; generatedAt: string };
  } catch {
    return null;
  }
}

/**
 * Construit l'inbox, la plus urgente d'abord. Barème :
 *   0 — tag éditorial mort : casse le rendu ET bloque la suite de tests ;
 *   1 — entité `diff`/`removed` : le site sert une donnée fausse ou disparue ;
 *   2 — entité `new` : du contenu du jeu manque au site ;
 *   3 — asset manquant du pool : une image ne sera pas servie ;
 *   4 — `minor`/`typo` seuls : retouches à appliquer d'un geste, jamais urgent.
 * Rien à signaler → tableau vide (la page affiche l'état « rien à traiter »).
 */
export function buildInbox(): InboxItem[] {
  const items: InboxItem[] = [];

  // Tags éditoriaux morts. Balayage complet mais bon marché (~120 ms) : il lit
  // des JSON déjà en cache disque, là où le moteur de revue ouvre les tables du
  // jeu. Normalement zéro — `tag-control.test.ts` le rend bloquant — donc une
  // ligne ici signale une régression que le prochain test refusera.
  try {
    const broken = collectTagOccurrences().filter((o) => !o.ok).length;
    if (broken > 0)
      items.push({
        key: 'tags',
        label: 'Dead inline tags',
        detail: `${broken} tag(s) resolve to nothing`,
        href: '/admin/tags',
        tone: 'danger',
        rank: 0,
        count: broken,
      });
  } catch {
    /* contrôle indisponible */
  }

  // Extraction, une ligne par entité concernée (les entités saines sont tues).
  // Les buckets en UN appel : hors Next, `bucketsOf` referait l'empreinte par entité.
  const buckets = entityBuckets();
  for (const e of EXTRACTOR_ENTITIES) {
    const b = buckets.get(e.id) ?? EMPTY;
    const act = actionableCount(b);
    const soft = b.minor + b.typo;
    if (!act && !soft) continue;
    const parts: string[] = [];
    if (b.new) parts.push(`${b.new} new`);
    if (b.diff) parts.push(`${b.diff} diff`);
    if (b.removed) parts.push(`${b.removed} removed`);
    if (b.minor) parts.push(`${b.minor} minor`);
    if (b.typo) parts.push(`${b.typo} typo`);
    const severe = b.diff > 0 || b.removed > 0;
    items.push({
      key: `extract:${e.id}`,
      label: e.label,
      detail: parts.join(' · '),
      href: e.href,
      tone: act === 0 ? 'muted' : severe ? 'danger' : 'warn',
      rank: act === 0 ? 4 : severe ? 1 : 2,
      count: act || soft,
    });
  }

  // Assets : seul le manque est actionnable (le total vit dans « Coverage »).
  const assets = readAssetsReport();
  if (assets && assets.missingCount > 0)
    items.push({
      key: 'assets',
      label: 'Assets',
      detail: `${assets.missingCount} missing from the pool`,
      href: '/admin/tools/gamedata',
      tone: 'warn',
      rank: 3,
      count: assets.missingCount,
    });

  return items.sort((a, b) => a.rank - b.rank || b.count - a.count);
}
