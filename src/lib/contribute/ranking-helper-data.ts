import {
  characterDisplayName,
  characterNamePrefix,
  characterSearchNames,
  getCharacterListItems,
  slugForId,
} from '@/lib/data/characters';
import { characterTags, loadCuratedCharacters } from '@/lib/data/curated';
import { loadSearchAliases } from '@/lib/data/search-aliases';
import { getEEViews, resolvePassives } from '@/lib/data/equipment';

/**
 * Données de l'outil de contribution « ranking helper » (`/contribute/
 * ranking-helper`) : pour DISCUTER le rang d'un perso il faut sa fiche
 * condensée (rôle, tags, EE) ET ses homologues dans chaque classement — tout
 * est déjà public ailleurs (tier lists, fiches), l'outil ne fait que le
 * JOINDRE en une seule vue. Textes en ANGLAIS seul, comme tout `/contribute`
 * (la langue de travail des contributeurs).
 */

export interface RankingHelperEE {
  name: string;
  /** Paliers résolus : niv. 1 puis niv. 10 (remplace ou s'ajoute). */
  passives: Array<{ level: number; isAdd: boolean; text: string }>;
}

export interface RankingHelperRow {
  id: string;
  slug: string;
  name: string;
  prefix?: string;
  searchNames: string[];
  element: string;
  class: string;
  rarity: number;
  role?: string;
  tags: string[];
  ranks: { pve?: string; pvp?: string; eeBase?: string; eePlus10?: string };
  ee?: RankingHelperEE;
}

export function rankingHelperRows(): RankingHelperRow[] {
  const curated = loadCuratedCharacters();
  const aliases = loadSearchAliases();
  const eeByCharacter = new Map(getEEViews().map((v) => [v.characterId, v]));

  return getCharacterListItems().map((c) => {
    const cu = curated[c.id] ?? {};
    const ee = eeByCharacter.get(c.id);
    return {
      id: c.id,
      slug: slugForId(c.id) ?? c.id,
      name: characterDisplayName(c, 'en'),
      prefix: characterNamePrefix(c, 'en') ?? undefined,
      searchNames: characterSearchNames(c, aliases[c.id]),
      element: c.element,
      class: c.class,
      rarity: c.rarity,
      role: cu.role,
      tags: characterTags(c, curated),
      ranks: {
        pve: cu.rank,
        pvp: cu.rankPvp,
        eeBase: ee?.rank,
        eePlus10: ee?.rank10,
      },
      ...(ee
        ? {
            ee: {
              name: ee.name.en ?? '',
              passives: resolvePassives(ee.passives, 'en').map((p) => ({
                level: p.level,
                isAdd: p.isAdd,
                // `first`/`last` = valeurs reforge min/max : la discussion de
                // ranking se fait au max, comme les tooltips du site.
                text: p.last ?? p.first,
              })),
            },
          }
        : {}),
    };
  });
}
