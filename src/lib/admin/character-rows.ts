import { characterDisplayName, getCharacterListItems } from '@/lib/data/characters';
import { loadCuratedCharacters } from '@/lib/data/curated';
import { extractedCharacter, reviewTarget } from '@/lib/admin/review-store';
import { img } from '@/lib/images';
import type { ExtractorRow } from '@/components/admin/ExtractorSidebar';

export interface SidebarRow {
  id: string;
  name: string;
  element: string;
  class: string;
  rarity: number;
  status: 'new' | 'diff' | 'ok';
  diffCount: number;
  curated: boolean;
}

/**
 * Lignes de la sidebar persos (statuts calculés committé ↔ extraction fraîche).
 * Partagé par les layouts Extractor et Editor. Un perso `new` = extrait mais
 * pas encore intégré (ex. Lambda, non « sorti » — intégrable via sa fiche).
 */
export function buildCharacterRows(): SidebarRow[] {
  const items = getCharacterListItems();
  const curated = loadCuratedCharacters();
  const review = reviewTarget('character');
  const diffCounts = new Map(review.diff.changed.map((c) => [c.key, c.fields.length]));

  return [
    // Nouveaux : extraits, pas encore committés (ex. Lambda, non « sorti »).
    // Nom/élément/classe résolus depuis l'extraction fraîche pour un affichage
    // lisible (« Lambda » plutôt que l'id brut).
    ...review.diff.added.map((id) => {
      const fresh = extractedCharacter(id);
      return {
        id,
        name: fresh ? characterDisplayName(fresh) : id,
        element: fresh?.element ?? '',
        class: fresh?.class ?? '',
        rarity: fresh?.rarity ?? 0,
        status: 'new' as const,
        diffCount: 0,
        curated: false,
      };
    }),
    ...items.map((c) => ({
      id: c.id,
      name: characterDisplayName(c),
      element: c.element,
      class: c.class,
      rarity: c.rarity,
      status: (diffCounts.has(c.id) ? 'diff' : 'ok') as SidebarRow['status'],
      diffCount: diffCounts.get(c.id) ?? 0,
      curated: Boolean(curated[c.id] && Object.keys(curated[c.id]).length),
    })),
  ];
}

/**
 * Lignes perso au format GÉNÉRIQUE `ExtractorRow` (pour `ExtractorSidebar`) :
 * face `FI_<id>`, élément/classe en surimpression du portrait, rareté en
 * étoiles, ✎ = perso curé. Remplace l'ex-`CharactersSidebar` spécialisée.
 */
export function characterExtractorRows(): ExtractorRow[] {
  return buildCharacterRows().map((r): ExtractorRow => ({
    id: r.id,
    name: r.name,
    icon: img.face(r.id),
    elementIcon: r.element ? img.element(r.element) : undefined,
    classIcon: r.class ? img.klass(r.class) : undefined,
    stars: r.rarity || undefined,
    status: r.status,
    count: r.diffCount,
    marker: r.curated ? '✎' : undefined,
  }));
}
