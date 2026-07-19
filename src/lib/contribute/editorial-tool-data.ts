/**
 * Données serveur communes aux deux outils publics éditoriaux (pros/cons &
 * synergies) : options de perso, noms, portraits, seed éditorial existant et refs
 * d'autocomplétion. Factorisé pour que les deux pages `/contribute/*` partagent la
 * même construction (server-only : touche le disque via les data layers).
 */
import { characterDisplayName, getAllCharacters, slugForId } from '@/lib/data/characters';
import { loadCuratedCharacters } from '@/lib/data/curated';
import { buildInlineRefs, type InlineRefs } from '@/lib/admin/inline-refs';
import type { CharOption } from '@/components/admin/CharacterPicker';
import type { HeroView } from '@/components/admin/editorial/EditorialFields';
import type { EditorialSeed } from '@/components/admin/editorial/EditorialPublicTool';

export interface EditorialToolData {
  charOptions: CharOption[];
  charNames: Record<string, string>;
  heroViews: Record<string, HeroView>;
  initialCurated: Record<string, EditorialSeed>;
  refs: InlineRefs;
}

export function editorialToolData(): EditorialToolData {
  const chars = getAllCharacters();
  const charOptions = chars.map((c) => ({
    id: c.id,
    name: characterDisplayName(c),
    element: c.element,
    class: c.class,
    rarity: c.rarity,
  }));
  const charNames = Object.fromEntries(chars.map((c) => [c.id, characterDisplayName(c)]));
  const heroViews: Record<string, HeroView> = Object.fromEntries(
    chars.map((c) => {
      const slug = slugForId(c.id);
      return [
        c.id,
        {
          id: c.id,
          name: characterDisplayName(c),
          element: c.element,
          classType: c.class,
          rarity: c.rarity,
          href: slug ? `/characters/${slug}` : undefined,
        },
      ];
    }),
  );

  // Seed éditorial existant (pros/cons + synergies uniquement) pour pré-remplir.
  const initialCurated: Record<string, EditorialSeed> = {};
  for (const [cid, cur] of Object.entries(loadCuratedCharacters())) {
    if (cur.prosCons || cur.synergies) {
      initialCurated[cid] = { prosCons: cur.prosCons, synergies: cur.synergies };
    }
  }

  return { charOptions, charNames, heroViews, initialCurated, refs: buildInlineRefs() };
}
