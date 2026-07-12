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

/** Définition d'une étiquette (le sens ; la classification vit dans l'extraction). */
export interface TagDef {
  kind: TagKind;
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
    name: { kind: 'record', of: { kind: 'string' } },
    desc: { kind: 'record', of: { kind: 'string' }, optional: true },
    sort: { kind: 'number', int: true, min: 0 },
  },
};

/** Valide une définition de tag (admin + test bloquant). */
export function validateTagDef(def: unknown, path = 'tag'): string[] {
  return validate(def, tagDefSchema, path).map((e) => `${e.path} : ${e.message}`);
}
