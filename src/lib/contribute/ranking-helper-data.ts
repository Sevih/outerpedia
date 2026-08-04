import {
  characterDisplayName,
  characterSearchNames,
  getCharacterListItems,
  slugForId,
} from '@/lib/data/characters';
import { characterTags, loadCuratedCharacters } from '@/lib/data/curated';
import { loadSearchAliases } from '@/lib/data/search-aliases';
import { getEEViews, resolvePassives } from '@/lib/data/equipment';
import eeEffectsData from '@data/generated/ee-effects.json';
import type { EeEffectsData } from '@datagen/generators/ee-effects';

/**
 * Données de l'outil de contribution « ranking helper » (`/contribute/
 * ranking-helper`) : pour DISCUTER le rang d'un perso il faut sa fiche
 * condensée (rôle, tags, EE) ET ses homologues dans chaque classement — tout
 * est déjà public ailleurs (tier lists, fiches), l'outil ne fait que le
 * JOINDRE en une seule vue. Textes en ANGLAIS seul, comme tout `/contribute`
 * (la langue de travail des contributeurs).
 *
 * Le vocabulaire « effets similaires » des modes EE vient du fichier GÉNÉRÉ
 * `ee-effects.json` (générateur dédié, décision Sevih 04/08 : les clés se
 * dérivent des effets BRUTS des fichiers du jeu, pas des chips curées de la
 * carte EE) — l'app est un lecteur bête, la logique et ses tests vivent dans
 * `datagen/generators/ee-effects.ts`.
 */

const EE_EFFECTS = eeEffectsData as EeEffectsData;

export interface RankingHelperEE {
  name: string;
  /** Paliers résolus : niv. 1 puis niv. 10 (remplace ou s'ajoute). */
  passives: Array<{ level: number; isAdd: boolean; text: string }>;
  /**
   * Effets comparables (clé normalisée + libellé, depuis `ee-effects.json`) :
   * en mode EE, les homologues sont les porteurs d'un EE partageant au moins
   * une clé ACTIVE.
   */
  chips: Array<{ ref: string; name: string; isDebuff: boolean }>;
}

export interface RankingHelperRow {
  id: string;
  slug: string;
  /** Nom AFFICHABLE complet (préfixe « Demiurge »/« Core Fusion » inclus). */
  name: string;
  searchNames: string[];
  element: string;
  class: string;
  subClass?: string;
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
      searchNames: characterSearchNames(c, aliases[c.id]),
      element: c.element,
      class: c.class,
      subClass: c.subClass,
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
              chips: (EE_EFFECTS[c.id] ?? []).map((e) => ({
                ref: e.key,
                name: e.label,
                isDebuff: e.isDebuff,
              })),
            },
          }
        : {}),
    };
  });
}
