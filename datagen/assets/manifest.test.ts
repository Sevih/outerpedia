/**
 * Visage d'une APPARENCE — le cœur pur de la collecte d'assets perso.
 *
 * Règle du jeu (vérifiée dans les bundles) : une FORME DE COMBAT n'a pas de
 * visage à elle. Ni `CT_2000130`/`CT_2000120` (formes des bases) ni
 * `CT_2010130`/`CT_2010120` (formes des skins) n'existent — seul `IG_Turn_`
 * est livré par forme. Réclamer `CT_<forme>` produit un « manquant » éternel.
 *
 * Tourne SANS `.gamedata` : la résolution reçoit ses deux tables en fonctions.
 */
import { describe, expect, it } from 'vitest';
import { resolveAppearanceFace } from './manifest';

/** `FaceIconID` par id (CharacterTemplet) — les cas réels du jeu. */
const FACE = new Map<string, string>([
  // Demiurge Luna : le jeu ENCODE l'emprunt (la forme pointe le visage du skin).
  ['2010119', '2010119'],
  ['2010120', '2010119'],
  // Demiurge Saeran : la forme s'auto-référence… sans qu'aucun sprite existe.
  ['2010129', '2010129'],
  ['2010130', '2010130'],
]);
/** Cible de transformation → unité dont elle sort (CharacterChangeTemplet). */
const FORM_SOURCE = new Map<string, string>([
  ['2010120', '2010119'], // réciproque côté jeu, on n'en garde qu'un sens
  ['2010119', '2010120'],
  ['2010130', '2010129'], // ON_DIE, à sens unique
]);

const faceOf = (id: string) => FACE.get(id);
const sourceOf = (id: string) => FORM_SOURCE.get(id);
const face = (app: string) => resolveAppearanceFace(app, faceOf, sourceOf);

describe('resolveAppearanceFace', () => {
  it('emprunt DÉCLARÉ par la table : on le suit tel quel (Demiurge Luna)', () => {
    expect(face('2010120')).toBe('2010119');
  });

  it('forme qui s’auto-référence : le visage vient de l’unité dont elle sort (Saeran)', () => {
    expect(face('2010130')).toBe('2010129');
  });

  it('skin ordinaire : son propre visage, aucun détour', () => {
    expect(face('2010119')).toBe('2010119');
    expect(face('2010129')).toBe('2010129');
  });

  it('transformation RÉCIPROQUE : un seul saut, jamais de boucle', () => {
    // 2010119 ↔ 2010120 se déclarent forme l'un de l'autre ; comme 2010119
    // porte son propre visage, la résolution s'arrête avant de remonter.
    expect(face('2010119')).toBe('2010119');
    // Et si les deux s'auto-référençaient, le saut unique borne quand même.
    const selfBoth = (id: string) =>
      resolveAppearanceFace(
        id,
        (x) => x,
        (x) => (x === 'A' ? 'B' : 'A'),
      );
    expect(selfBoth('A')).toBe('B');
  });

  it('id inconnu des deux tables : convention `_<id>` préservée', () => {
    expect(face('2010004')).toBe('2010004');
  });
});
