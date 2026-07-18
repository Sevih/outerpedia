/**
 * Props de la revue d'extraction (diff jeu ↔ site) pour une entité d'équipement,
 * prêtes pour `<ExtractorReview>`. Résout un nom lisible par entité (via les
 * familles/vues d'équipement) — les entités du fichier généré sont keyées par id
 * numérique.
 */
import type { NamedReviewEntity } from '@/components/admin/ExtractorReview';
import {
  reviewBuckets,
  reviewEntities,
  reviewTarget,
  type DiffBuckets,
} from '@/lib/admin/review-store';
import {
  getAmuletFamilies,
  getEEViews,
  getSetViews,
  getTalismanFamilies,
  getWeaponFamilies,
  type GearFamily,
} from '@/lib/data/equipment';

export type EquipmentKind = 'ee' | 'weapon' | 'amulet' | 'talisman' | 'set' | 'armor';

function nameById(kind: EquipmentKind): Map<string, string> {
  const m = new Map<string, string>();
  const fromFamilies = (fams: GearFamily[]) => {
    // Une famille couvre plusieurs ids (paliers d'étoiles) : tous prennent son nom.
    for (const f of fams) for (const id of f.ids) m.set(id, f.name.en);
  };
  switch (kind) {
    case 'weapon':
      fromFamilies(getWeaponFamilies());
      break;
    case 'amulet':
      fromFamilies(getAmuletFamilies());
      break;
    case 'talisman':
      fromFamilies(getTalismanFamilies());
      break;
    case 'ee':
      for (const e of getEEViews()) m.set(e.itemId, e.name.en);
      break;
    case 'set':
      for (const s of getSetViews('en')) m.set(s.id, s.name.en);
      break;
    case 'armor':
      // Pièces d'armure de base : pas de famille curée → l'id fait le libellé.
      break;
  }
  return m;
}

export function equipmentReviewProps(kind: EquipmentKind): {
  id: string;
  file: string;
  entities: NamedReviewEntity[];
  buckets: DiffBuckets;
} {
  const review = reviewTarget(kind);
  const names = nameById(kind);
  const entities: NamedReviewEntity[] = reviewEntities(review.diff).map((e) => ({
    ...e,
    name: names.get(e.key) ?? e.key,
  }));
  return { id: kind, file: review.file, entities, buckets: reviewBuckets(review.diff) };
}
