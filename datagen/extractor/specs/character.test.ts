/**
 * Tests des PRÉDICATS PURS de la spec personnage — le siège du bug NPC de la
 * session (audit X1). On les teste hors du moteur : ils prennent des `Row`
 * bruts, aucune table à charger.
 *
 *   - `isInnatePierce` : LA distinction du tag `ignore-defense` — « perce sans
 *     condition » ≠ « touche à la pénétration ». Trois formes du jeu à ne pas
 *     confondre (buff durable, dégâts conditionnés, pénétration innée) ;
 *   - `ownIdentity` / `isRealCharacterRow` : la sélection des entités RÉELLES —
 *     ce qui écarte skins, formes de combat et clones NPC (K niv. 99) dont
 *     l'héritage de kit fantôme était le bug de la session ;
 *   - `extractStats` : le cœur de stats partagé avec la spec monstre (valeurs
 *     BRUTES, stats de cœur toujours émises).
 */
import { describe, expect, it } from 'vitest';
import type { Row } from '../../lib/tables';
import {
  extractStats,
  formIdsFrom,
  isInnatePierce,
  isRealCharacterRow,
  ownIdentity,
} from './character';

/** Ligne de buff minimale : seuls les champs lus par `isInnatePierce`. */
const buff = (over: Partial<Row>): Row => ({
  StatType: 'ST_PIERCE_POWER_RATE',
  Value: '100',
  TargetType: 'ME',
  Type: 'BT_BUFF',
  ...over,
});

describe('isInnatePierce', () => {
  it('form 3 — pénétration INNÉE le temps du skill (ON_SKILL_FINISH) → vrai', () => {
    expect(isInnatePierce(buff({ BuffRemoveType: 'ON_SKILL_FINISH' }))).toBe(true);
    expect(isInnatePierce(buff({ BuffRemoveType: 'ON_SKILL_CHAIN_FINISH' }))).toBe(true);
  });

  it('form 3 — passif permanent (BuffRemoveType absent = NONE) → vrai', () => {
    expect(isInnatePierce(buff({}))).toBe(true);
  });

  it('cible MY_TEAM (inclut le lanceur) → vrai ; ME → vrai', () => {
    expect(isInnatePierce(buff({ TargetType: 'MY_TEAM' }))).toBe(true);
    expect(isInnatePierce(buff({ TargetType: 'ME' }))).toBe(true);
  });

  it('la variante PLATE (ST_PIERCE_POWER, sans _RATE) compte aussi', () => {
    expect(isInnatePierce(buff({ StatType: 'ST_PIERCE_POWER', Value: '10' }))).toBe(true);
  });

  it('form 1 — buff DURABLE « Increased Penetration » (ON_TURN_END) → faux', () => {
    // Beth S1, Maxie, Tamara… : sans le buff, ils ne percent pas → pas taggés.
    expect(isInnatePierce(buff({ BuffRemoveType: 'ON_TURN_END' }))).toBe(false);
  });

  it('form 2 — dégâts CONDITIONNÉS au buff (BT_DMG) → faux', () => {
    // La ligne porte ST_PIERCE_POWER_RATE mais ne l'APPLIQUE pas (Beth S2/S3).
    expect(isInnatePierce(buff({ Type: 'BT_DMG' }))).toBe(false);
  });

  it('valeur NÉGATIVE sur ENEMY_TEAM (réduit la pén. adverse) → faux', () => {
    // Domine, Anarky : l'exact INVERSE d'un ignore-DEF.
    expect(isInnatePierce(buff({ Value: '-100', TargetType: 'ENEMY_TEAM' }))).toBe(false);
  });

  it('MY_TEAM_WITHOUT_ME (n’inclut pas le lanceur) → faux', () => {
    expect(isInnatePierce(buff({ TargetType: 'MY_TEAM_WITHOUT_ME' }))).toBe(false);
  });

  it('valeur nulle → faux ; stat hors pénétration → faux', () => {
    expect(isInnatePierce(buff({ Value: '0' }))).toBe(false);
    expect(isInnatePierce(buff({ StatType: 'ST_ATK' }))).toBe(false);
  });
});

describe('ownIdentity', () => {
  it('base à identité PROPRE (NameID = <ID>_Name) → vrai', () => {
    expect(ownIdentity({ ID: '2000005', NameID: '2000005_Name' })).toBe(true);
  });

  it('skin qui EMPRUNTE le NameID de sa base → faux', () => {
    expect(ownIdentity({ ID: '2010005', NameID: '2000005_Name' })).toBe(false);
  });
});

describe('isRealCharacterRow — sélection des entités réelles', () => {
  const NONE = new Set<string>();
  const base = (over: Partial<Row>): Row => ({
    ID: '2000001',
    Type: 'CT_PC',
    NameID: '2000001_Name',
    ...over,
  });

  it('base jouable à identité propre → gardée', () => {
    expect(isRealCharacterRow(base({}), NONE, NONE)).toBe(true);
  });

  it('skin (identité empruntée, pas une fusion) → écarté', () => {
    const skin = base({ ID: '2010005', NameID: '2000005_Name' });
    expect(isRealCharacterRow(skin, NONE, NONE)).toBe(false);
  });

  it('FORME de combat (identité propre mais dans formIds) → écartée', () => {
    // Demiurge Luna 2000120 : ses skills rejoignent la fiche de la base.
    const form = base({ ID: '2000120', NameID: '2000120_Name' });
    expect(isRealCharacterRow(form, new Set(['2000120']), NONE)).toBe(false);
  });

  it('core-fusion (identité EMPRUNTÉE mais dans fusionIds) → gardée par le OR', () => {
    const fusion = base({ ID: '2000200', NameID: '2000001_Name' });
    expect(isRealCharacterRow(fusion, NONE, NONE)).toBe(false); // sans fusionIds : vue comme skin
    expect(isRealCharacterRow(fusion, NONE, new Set(['2000200']))).toBe(true);
  });

  it('clone NPC (K niv. 99, Type ≠ CT_PC) → écarté', () => {
    // NPCCharacterTemplet n'entre même pas ici, mais la 1re porte le garantit.
    const npc = base({ ID: '2600001', Type: 'CT_NPC', NameID: '2600001_Name' });
    expect(isRealCharacterRow(npc, NONE, NONE)).toBe(false);
  });
});

describe('formIdsFrom — cibles de change SANS identité propre', () => {
  // La régression du 2026-08-12 : la MAJ a rendu le change-forme de D.Luna
  // ALLER-RETOUR (119→120 ET 120→119). La base, cible du « retour », se faisait
  // écarter comme forme → Luna disparaissait de l'extrait (« 1 removed »).
  const base = { ID: '2000119', Type: 'CT_PC', NameID: '2000119_Name' };
  const form = { ID: '2000120', Type: 'CT_PC', NameID: '2000119_Name' }; // emprunte
  const byId = new Map([
    ['2000119', base],
    ['2000120', form],
  ]);

  it('cycle aller-retour : la FORME (identité empruntée) est écartée, pas la BASE', () => {
    const formIds = formIdsFrom(
      [
        { ID: '2000119', ChangeCharacterID: '2000120' },
        { ID: '2000120', ChangeCharacterID: '2000119' }, // le « retour » de la MAJ
      ],
      byId,
    );
    expect(formIds.has('2000120')).toBe(true);
    expect(formIds.has('2000119')).toBe(false); // la base cyclée n'est PAS une forme
    expect(isRealCharacterRow(base, formIds, new Set())).toBe(true); // Luna reste
    expect(isRealCharacterRow(form, formIds, new Set())).toBe(false);
  });

  it('changement à sens unique (Saeran ON_DIE) : la cible est une forme', () => {
    const saeranForm = { ID: '2000130', Type: 'CT_PC', NameID: '2000129_Name' };
    const formIds = formIdsFrom(
      [{ ID: '2000129', ChangeCharacterID: '2000130' }],
      new Map([['2000130', saeranForm]]),
    );
    expect(formIds.has('2000130')).toBe(true);
  });

  it('cible absente de CharacterTemplet → traitée comme forme (prudence)', () => {
    const formIds = formIdsFrom([{ ID: '1', ChangeCharacterID: '999' }], new Map());
    expect(formIds.has('999')).toBe(true);
  });
});

describe('extractStats', () => {
  it('émet TOUJOURS les stats de cœur (hp/atk/def/speed), même à 0', () => {
    const out = extractStats({}); // aucune colonne
    expect(out).toEqual({
      hp: { min: 0, max: 0 },
      atk: { min: 0, max: 0 },
      def: { min: 0, max: 0 },
      speed: { min: 0, max: 0 },
    });
  });

  it('OMET une stat hors cœur entièrement nulle', () => {
    const out = extractStats({ CriticalRate_Min: '0', CriticalRate_Max: '0' });
    expect(out.critical_rate).toBeUndefined();
  });

  it('garde une stat hors cœur si min OU max est non nul', () => {
    const out = extractStats({ Vampiric_Min: '0', Vampiric_Max: '300' });
    expect(out.vampiric).toEqual({ min: 0, max: 300 });
  });

  it('valeurs BRUTES : aucune échelle appliquée (le per-mille reste per-mille)', () => {
    const out = extractStats({
      HP_Min: '100',
      HP_Max: '9999',
      CriticalRate_Min: '500',
      CriticalRate_Max: '1200',
    });
    expect(out.hp).toEqual({ min: 100, max: 9999 });
    expect(out.critical_rate).toEqual({ min: 500, max: 1200 }); // PAS ÷10
  });
});
