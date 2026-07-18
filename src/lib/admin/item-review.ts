/**
 * Props de la revue d'extraction (diff jeu ↔ site) pour le CATALOGUE D'ITEMS,
 * prêtes pour `<ExtractorReview>`. Résout un nom lisible par entité — le
 * catalogue porte `name.en` directement, on couvre l'union committé ∪ frais
 * (un item DISPARU n'est plus dans le frais ; un item NOUVEAU pas encore dans le
 * committé).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { NamedReviewEntity } from '@/components/admin/ExtractorReview';
import {
  reviewBuckets,
  reviewEntities,
  reviewTarget,
  targetBuild,
  type DiffBuckets,
} from '@/lib/admin/review-store';

type NamedEntry = { name?: { en?: string } };

function committedNames(): Record<string, NamedEntry> {
  try {
    return JSON.parse(readFileSync(resolve('data/generated/items.json'), 'utf8')) as Record<
      string,
      NamedEntry
    >;
  } catch {
    return {};
  }
}

export function itemReviewProps(): {
  id: string;
  file: string;
  entities: NamedReviewEntity[];
  buckets: DiffBuckets;
} {
  const review = reviewTarget('item');
  // `targetBuild` juste après `reviewTarget` : la mémoïsation du catalogue le
  // rend gratuit. Le committé complète les seuls ids DISPARUS (absents du frais).
  const fresh = targetBuild('item') as Record<string, NamedEntry>;
  const committed = committedNames();
  const nameOf = (key: string): string => fresh[key]?.name?.en ?? committed[key]?.name?.en ?? key;

  const entities: NamedReviewEntity[] = reviewEntities(review.diff).map((e) => ({
    ...e,
    name: nameOf(e.key),
  }));
  return { id: 'item', file: review.file, entities, buckets: reviewBuckets(review.diff) };
}
