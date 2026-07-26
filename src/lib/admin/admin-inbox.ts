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
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

const EMPTY: DiffBuckets = { new: 0, diff: 0, typo: 0, removed: 0 };

/**
 * Diff « jeu ↔ site » par entité, MÉMOÏSÉ À LA REQUÊTE (`cache()`).
 *
 * Le moteur coûte ~1,3 s : le layout (badges) et la home (inbox) le lançaient
 * chacun pour leur compte, soit ~2,6 s par chargement de `/admin`. Un seul appel
 * par requête les sert tous les deux.
 *
 * Monstres restreints au périmètre SITE (`actionableDiff`) : sans ça le compte
 * intègre du bruit d'extraction que rien ne peut traiter. Tolérant à l'échec —
 * une extraction cassée ne doit pas faire tomber la coquille admin.
 */
export const entityBuckets = cache((): Map<string, DiffBuckets> => {
  const out = new Map<string, DiffBuckets>();
  try {
    for (const r of reviewAll()) out.set(r.id, reviewBuckets(actionableDiff(r.id, r.diff)));
  } catch {
    /* extraction indisponible */
  }
  return out;
});

/** Buckets d'une entité (jamais undefined — tout à zéro si inconnue). */
export const bucketsOf = (id: string): DiffBuckets => entityBuckets().get(id) ?? EMPTY;

/** Total « à traiter » d'un bucket : le typo, cosmétique, en est exclu. */
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
 *   4 — `typo` seul : cosmétique, jamais urgent.
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
  for (const e of EXTRACTOR_ENTITIES) {
    const b = bucketsOf(e.id);
    const act = actionableCount(b);
    if (!act && !b.typo) continue;
    const parts: string[] = [];
    if (b.new) parts.push(`${b.new} new`);
    if (b.diff) parts.push(`${b.diff} diff`);
    if (b.removed) parts.push(`${b.removed} removed`);
    if (b.typo) parts.push(`${b.typo} typo`);
    const severe = b.diff > 0 || b.removed > 0;
    items.push({
      key: `extract:${e.id}`,
      label: e.label,
      detail: parts.join(' · '),
      href: e.href,
      tone: act === 0 ? 'muted' : severe ? 'danger' : 'warn',
      rank: act === 0 ? 4 : severe ? 1 : 2,
      count: act || b.typo,
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
