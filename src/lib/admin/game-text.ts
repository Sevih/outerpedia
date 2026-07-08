/**
 * Résolution d'une clé de texte du jeu vers son dict localisé (ADMIN local).
 * Cherche dans les tables `Text*` pertinentes — sert le « récupérer par clé »
 * de l'éditeur d'items (pull direct du nom/desc au lieu de tout saisir).
 */
import { loadTextIndex } from '@datagen/lib/text';
import type { LangDict } from '@contracts';

const TABLES = ['TextSystem', 'TextItem', 'TextCharacter', 'TextSkill'];

let cache: Map<string, LangDict>[] | null = null;

export function resolveGameText(key: string): LangDict | null {
  const k = key.trim();
  if (!k) return null;
  if (!cache)
    cache = TABLES.map((t) => {
      try {
        return loadTextIndex(t);
      } catch {
        return new Map<string, LangDict>();
      }
    });
  for (const idx of cache) {
    const d = idx.get(k);
    if (d && (d.en || d.jp || d.kr || d.zh)) return d;
  }
  return null;
}
