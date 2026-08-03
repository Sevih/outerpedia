/**
 * GARDE DE SORTIE commune aux extracteurs damage : le roster VALIDÉ du wiki.
 *
 * Les tables locales peuvent porter un patch NON PROMU (persos pas encore
 * sortis) — les artefacts damage étant committés et publics, on n'émet que ce
 * qui se rattache à un perso présent dans `data/generated/characters.json`
 * (preuve d'intégration, même philosophie que `lib/released.ts` : on ne filtre
 * QUE sur une preuve, jamais sur une absence de donnée).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Ids du roster validé, ou `null` si le fichier est illisible (→ pas de
 *  filtre, mais l'avertissement le signale). Mémoïsé : les extracteurs d'un
 *  même run partagent la lecture. */
let cache: Set<string> | null | undefined;

export function integratedIds(): Set<string> | null {
  if (cache !== undefined) return cache;
  try {
    const chars = JSON.parse(
      readFileSync(resolve('data/generated/characters.json'), 'utf8'),
    ) as Record<string, unknown>;
    cache = new Set(Object.keys(chars));
  } catch {
    console.warn(
      '⚠ data/generated/characters.json illisible — sortie SANS filtre de roster ' +
        '(risque d’émettre un perso non intégré).',
    );
    cache = null;
  }
  return cache;
}
