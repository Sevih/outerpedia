/**
 * Couche CURÉE — VOCABULAIRE des étiquettes de personnage
 * (`data/curated/tags.json`, clé = slug du tag).
 *
 * Séparation nette :
 *   - l'EXTRACTION *classe* (quel perso porte quel tag → `Character.tags`,
 *     dérivé des tables : bannière de recrutement, buffs de pénétration, lignée) ;
 *   - ce fichier *définit* (ce que le tag VEUT DIRE → libellé, description).
 *
 * Pourquoi curé et pas extrait : le jeu ne fournit AUCUN texte pour ces
 * catégories — ni `TextSystem`, ni `TextCharacter` n'ont d'entrée pour
 * « Premium », « Collab » ou « Ignore DEF ». Le ruban de bannière n'est qu'un
 * enum (`PREMIUM`, `OUTER_FES`…) et le badge n'est qu'une image. Le sens est
 * donc entièrement éditorial.
 *
 * Le vocabulaire est FERMÉ et lié à l'extraction par un test BLOQUANT
 * (`tags.test.ts`) : tout tag produit par l'extraction doit avoir sa définition
 * ici, et réciproquement — sauf `free`, seul tag purement humain (aucun marqueur
 * d'obtention gratuite dans les tables, cf. `CharacterCurated.tags`).
 */
import { validate, type Schema } from '../extractor/core/validate';
import type { LocalizedText } from './character';

/**
 * Nature d'une étiquette — dit OÙ elle s'affiche et ce qu'elle répond :
 *   - `recruit`  : comment on OBTIENT le perso (badge de carte, exclusifs entre eux) ;
 *   - `mechanic` : ce que le perso FAIT (filtre de liste) ;
 *   - `lineage`  : ce que le perso EST (core-fusion → icône dédiée).
 */
export type TagKind = 'recruit' | 'mechanic' | 'lineage';

/**
 * FAMILLE d'étiquettes — ce que le joueur nomme d'un seul mot là où le jeu
 * distingue plusieurs bannières.
 *
 * `limited` en est le seul cas, et LA source de la confusion qu'il règle : le
 * jeu a trois bannières qui ne reviennent pas (Festival `OUTER_FES`, Seasonal,
 * Collab), le joueur n'a qu'un mot pour les trois. Tant que le groupe n'était
 * écrit nulle part, chaque outil recopiait sa propre liste
 * `['limited', 'seasonal', 'collab']` — où le premier élément portait le nom
 * du tout. Le groupe se déclare ICI, une fois ; les listes en dur ont disparu.
 *
 * Un tag SANS groupe se suffit à lui-même (`premium` s'achète, `free` s'offre).
 */
export type TagGroup = 'limited';

/** Définition d'une étiquette (le sens ; la classification vit dans l'extraction). */
export interface TagDef {
  kind: TagKind;
  /**
   * Famille à laquelle l'étiquette appartient, si elle en a une — ce que le
   * joueur nomme d'un mot (`limited` = festival + seasonal + collab).
   */
  group?: TagGroup;
  /** Libellé affiché. */
  name: LocalizedText;
  /** Ce que le tag promet au lecteur — la phrase qui lève l'ambiguïté. */
  desc?: LocalizedText;
  /** Ordre canonique (badge de carte : le plus petit `sort` présent gagne). */
  sort: number;
}

/** Vocabulaire complet : slug → définition. */
export type TagGlossary = Record<string, TagDef>;

export const tagDefSchema: Schema = {
  kind: 'object',
  fields: {
    kind: { kind: 'string', enum: ['recruit', 'mechanic', 'lineage'] },
    group: { kind: 'string', enum: ['limited'], optional: true },
    name: { kind: 'record', of: { kind: 'string' } },
    desc: { kind: 'record', of: { kind: 'string' }, optional: true },
    sort: { kind: 'number', int: true, min: 0 },
  },
};

/** Valide une définition de tag — branché dans le test BLOQUANT (tags.test.ts) :
 * une définition committée mal formée (kind hors enum, `sort` manquant…) fait
 * échouer la suite, pas seulement une définition orpheline. */
export function validateTagDef(def: unknown, path = 'tag'): string[] {
  return validate(def, tagDefSchema, path).map((e) => `${e.path} : ${e.message}`);
}
