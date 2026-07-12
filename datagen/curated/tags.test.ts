/**
 * Test BLOQUANT du système d'étiquettes.
 *
 * Il garde la donnée COMMITTÉE (`data/generated` + `data/curated`), pas
 * l'extracteur : `.gamedata/` est gitignoré, la génération est une étape locale
 * et manuelle. Ce qui doit rester vrai, c'est ce qu'on livre.
 *
 * Deux garanties :
 *   1. VOCABULAIRE — tout tag porté par un perso a une définition dans
 *      `data/curated/tags.json`, et réciproquement. Un slug inventé côté
 *      extraction (ou une définition orpheline) fait sonner le pipeline.
 *   2. DÉTECTION — les cas qui ont réellement piégé les deux implémentations
 *      précédentes sont épinglés nommément. Ces personnages sont la mémoire des
 *      bugs : Delta (pénétration cachée derrière une indirection `BT_GROUP`),
 *      Aer (pénétration portée par l'EE seul), Vlada (pénétration débloquée à la
 *      transcendance seulement), Francesca (buff de pénétration NOMMÉ, que
 *      l'heuristique « effet sans tooltip » ratait).
 */
import { describe, expect, it } from 'vitest';
import charactersData from '../../data/generated/characters.json';
import curatedData from '../../data/curated/characters.json';
import tagsData from '../../data/curated/tags.json';
import type { CharactersFile, CharacterCurated, TagGlossary } from '../contracts';

const characters = charactersData as CharactersFile;
const curated = curatedData as Record<string, CharacterCurated>;
const glossary = tagsData as unknown as TagGlossary;

const all = Object.values(characters);
const withTag = (tag: string) => all.filter((c) => (c.tags ?? []).includes(tag));
const byId = (id: string) => characters[id];

/** Le seul tag que l'extraction ne peut PAS dériver (aucun marqueur en table). */
const HUMAN_ONLY = 'free';

describe('vocabulaire des tags', () => {
  it('tout tag porté par un perso est défini dans data/curated/tags.json', () => {
    const used = new Set([
      ...all.flatMap((c) => c.tags ?? []),
      ...Object.values(curated).flatMap((c) => c.tags ?? []),
    ]);
    const undefinedTags = [...used].filter((t) => !glossary[t]);
    expect(undefinedTags).toEqual([]);
  });

  it('toute définition est effectivement portée par au moins un perso', () => {
    const used = new Set([
      ...all.flatMap((c) => c.tags ?? []),
      ...Object.values(curated).flatMap((c) => c.tags ?? []),
    ]);
    const orphans = Object.keys(glossary).filter((t) => !used.has(t));
    expect(orphans).toEqual([]);
  });

  it('chaque définition a un libellé anglais et un ordre unique', () => {
    const sorts = Object.values(glossary).map((d) => d.sort);
    expect(new Set(sorts).size).toBe(sorts.length);
    for (const [slug, def] of Object.entries(glossary)) {
      expect(def.name.en, `${slug} sans libellé EN`).toBeTruthy();
    }
  });

  it('la couche curée ne contient QUE des tags humains', () => {
    // Un tag dérivable recopié en curé divergerait à la première régénération.
    const leaked = Object.entries(curated)
      .flatMap(([id, c]) => (c.tags ?? []).map((t) => `${id}:${t}`))
      .filter((e) => !e.endsWith(`:${HUMAN_ONLY}`));
    expect(leaked).toEqual([]);
  });
});

describe('détection des tags d’acquisition (RecruitGroupTemplet)', () => {
  it('les catégories de bannière sont mutuellement exclusives', () => {
    const recruitTags = ['premium', 'limited', 'seasonal', 'collab'];
    for (const c of all) {
      const hits = (c.tags ?? []).filter((t) => recruitTags.includes(t));
      expect(hits.length, `${c.name.en} : ${hits.join('+')}`).toBeLessThanOrEqual(1);
    }
  });

  it('les effectifs par catégorie sont ceux du jeu', () => {
    expect(withTag('premium')).toHaveLength(11);
    expect(withTag('limited')).toHaveLength(4);
    expect(withTag('seasonal')).toHaveLength(5);
    expect(withTag('collab')).toHaveLength(3);
  });

  it('les trois personnages de collaboration sont taggés collab', () => {
    // Ils n'ont pas de ruban propre : détectés via l'image de bannière
    // « Collabo » / l'effet de vignette du roster.
    for (const id of ['2000095', '2000096', '2000097']) {
      expect(byId(id).tags, byId(id).name.en).toContain('collab');
    }
  });
});

describe('détection de ignore-defense (pénétration INNÉE)', () => {
  it('46 personnages percent la DEF par eux-mêmes', () => {
    expect(withTag('ignore-defense')).toHaveLength(46);
  });

  it('tout perso taggé porte au moins une provenance, et inversement', () => {
    for (const c of all) {
      const tagged = (c.tags ?? []).includes('ignore-defense');
      expect(Boolean(c.ignoreDefense?.length), c.name.en).toBe(tagged);
    }
  });

  // --- LA distinction : un BUFF de pénétration n'est PAS de l'inné ----------
  // Le perso gagne le statut « Increased Penetration » (ON_TURN_END) : il ne
  // perce que TANT QU'IL L'A. Le tag promet l'inconditionnel — ces persos n'y
  // ont pas droit. C'est l'erreur que faisaient les deux détecteurs précédents.

  it('Maxie, Tamara, Ember, Fortuna : buff de pénétration ⇒ PAS taggés', () => {
    for (const id of ['2000081', '2000060', '2000106', '2000107']) {
      expect(byId(id).ignoreDefense, byId(id).name.en).toBeUndefined();
      expect(byId(id).tags ?? [], byId(id).name.en).not.toContain('ignore-defense');
    }
  });

  it('Beth : taggée par sa CHAÎNE seule, pas par son S1/S2/S3', () => {
    // S1 = buff de pénétration (ON_TURN_END, statut nommé) → ne compte pas.
    // S2/S3 = BT_DMG conditionnés à CE buff (OWNER_HAS_BUFF) : la stat pierce
    // est là, mais rien ne l'APPLIQUE → ne comptent pas.
    // Chaîne (ON_SKILL_CHAIN_FINISH) = la frappe perce elle-même → compte.
    expect(byId('2000025').ignoreDefense).toEqual(['kit']);
  });

  it('Francesca : son buff de kit ne compte pas, son EE oui', () => {
    // `2000015_2_4` est ON_TURN_END (un buff) ; seul `BID_CEQUIP_2000015_ADD`
    // (ON_SKILL_FINISH) est une pénétration innée.
    expect(byId('2000015').ignoreDefense).toEqual(['ee']);
  });

  // --- Les formes que les règles précédentes ne SAVAIENT PAS voir -----------

  it('Delta : pénétration cachée derrière une indirection BT_GROUP', () => {
    // `2000099_child`, atteignable seulement en expansant le groupe. Une
    // traversée qui s'arrête aux buffs câblés sur le skill le rate.
    expect(byId('2000099').ignoreDefense).toEqual(['kit']);
  });

  it('Aer : pénétration portée par le seul équipement exclusif', () => {
    // Invisible pour toute règle qui ne regarde que les skills.
    expect(byId('2000055').ignoreDefense).toEqual(['ee']);
  });

  it('Vlada, Epsilon, Dianne : pénétration débloquée à la transcendance', () => {
    // Buffs `trancendent_8_*` : ne suivent pas la convention `<id>_*` — l'un
    // d'eux (`trancendent_8_pierce_30`, Dianne) est même PARTAGÉ entre persos.
    expect(byId('2000075').ignoreDefense).toEqual(['transcend']);
    expect(byId('2700070').ignoreDefense).toEqual(['transcend']);
    expect(byId('2000093').ignoreDefense).toEqual(['transcend']);
  });

  it('un debuff anti-pénétration ne fabrique pas de provenance', () => {
    // Domine et Anarky posent un ST_PIERCE_POWER_RATE NÉGATIF sur ENEMY_TEAM
    // (ils RÉDUISENT la pénétration adverse). Ils restent taggés — ils percent
    // aussi par ailleurs — mais jamais À CAUSE de ce debuff.
    expect(byId('2000112').ignoreDefense).toEqual(['kit']);
    expect(byId('2000116').ignoreDefense).toEqual(['kit', 'ee']);
  });
});

describe('détection de core-fusion (lignée)', () => {
  it('core-fusion ⇔ le perso dérive d’une base', () => {
    for (const c of all) {
      expect((c.tags ?? []).includes('core-fusion'), c.name.en).toBe(Boolean(c.originalCharacter));
    }
  });
});
