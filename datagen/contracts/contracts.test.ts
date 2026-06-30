import { describe, expect, it } from 'vitest';
import charactersData from '../../data/generated/characters.json';
import glossariesData from '../../data/generated/glossaries.json';
import type { CharactersFile, Glossaries } from './index';

// Pattern de consommation côté app : un import JSON élargit les littéraux d'union
// (`'percent'` → `string`), donc on CASTE une fois vers le contrat (la justesse
// est garantie en amont par les générateurs typés). C'est ce que fera le module
// d'accès data de l'app (un seul cast par fichier, consommateurs 100 % typés).
const characters = charactersData as CharactersFile;
const glossaries = glossariesData as Glossaries;

describe('contrats ↔ data/generated', () => {
  it('characters.json conforme à CharactersFile', () => {
    const k = characters['2000001'];
    expect(k.name.en).toBe('K');
    expect(k.element).toBe('fire');
    expect(k.class).toBe('defender');
    expect(k.ee).toBe('2000001');
    expect(k.stats.hp.max).toBeGreaterThan(0);
  });

  it('glossaries.json conforme + fusion correcte', () => {
    expect(glossaries.classes.attacker.en).toBe('Striker'); // mismatch enum→label géré
    expect(glossaries.elements.fire.en).toBe('Fire');
    expect(glossaries.statusEffects['1'].name.en).toBe('Burned');
    expect(glossaries.statScales.critical_dmg).toBe('percent');
  });
});
