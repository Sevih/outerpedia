/**
 * Tests des cœurs d'INTÉGRATION PAR ENTITÉ (`integrate.ts`) — les écritures
 * ciblées dans le committé (`data/generated`), déclenchées par l'admin. C'est
 * destructif par nature (merge dans des fichiers validés), d'où les invariants :
 *   - l'entité et SES skills atterrissent dans les bons fichiers ;
 *   - le RESTE du fichier est préservé (contenu ET ordre des clés → diff git
 *     limité à l'entité intégrée) ;
 *   - re-intégrer la même entité est idempotent (octet à octet).
 *
 * On teste `integrateCharacterData` / `integrateMonsterData` sur un dossier
 * temporaire injecté — les wrappers publics ne font qu'y brancher l'extraction
 * fraîche (qui exige un `.gamedata/parsed` complet, hors de portée d'un test
 * unitaire) et le staging d'images.
 */
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeJson } from '../lib/json';
import { integrateCharacterData, integrateMonsterData } from './integrate';
import type { Character } from './specs/character';
import type { Monster } from './specs/monster';

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'integrate-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

const read = (rel: string): Record<string, unknown> =>
  JSON.parse(readFileSync(join(dir, rel), 'utf8')) as Record<string, unknown>;
const bytes = (rel: string): string => readFileSync(join(dir, rel), 'utf8');

/** Fixture minimale : seuls `id`/`name`/`skills` (+ slug) sont exercés ici. */
const char = (id: string, en: string, skills: string[]): Character =>
  ({ id, name: { en }, skills }) as unknown as Character;

describe('integrateCharacterData', () => {
  /** État committé de départ : un autre perso déjà validé, avec ses skills. */
  async function seed(): Promise<void> {
    await writeJson(join(dir, 'characters.json'), {
      existing_hero: { id: 'existing_hero', name: { en: 'Iota' }, skills: ['sk_e1'] },
    });
    await writeJson(join(dir, 'skills.json'), { sk_e1: { power: 1 } });
  }

  it('écrit l’entité + SES skills au bon endroit, en préservant le reste', async () => {
    await seed();
    const files = await integrateCharacterData(
      dir,
      char('new_hero', 'Stella', ['sk_n1', 'sk_n2']),
      {
        sk_n1: { power: 10 },
        sk_n2: { power: 20 },
        sk_other: { power: 99 }, // skill frais d'un AUTRE perso : ne doit pas entrer
      },
    );

    expect(files).toEqual(['characters.json', 'skills.json', 'characters-slug-to-id.json']);
    const characters = read('characters.json');
    // Le perso existant est intact, le nouveau APPENDU en fin (diff git minimal).
    expect(characters.existing_hero).toEqual({
      id: 'existing_hero',
      name: { en: 'Iota' },
      skills: ['sk_e1'],
    });
    expect(Object.keys(characters)).toEqual(['existing_hero', 'new_hero']);

    const skills = read('skills.json');
    expect(skills.sk_e1).toEqual({ power: 1 }); // préservé
    expect(skills.sk_n1).toEqual({ power: 10 });
    expect(skills.sk_n2).toEqual({ power: 20 });
    expect(skills.sk_other).toBeUndefined(); // seuls SES skills entrent

    // Slugs régénérés depuis le committé à jour (tous les persos).
    expect(read('characters-slug-to-id.json')).toEqual({
      iota: 'existing_hero',
      stella: 'new_hero',
    });
  });

  it('ignore un skill référencé mais absent de l’extraction fraîche', async () => {
    await seed();
    await integrateCharacterData(dir, char('new_hero', 'Stella', ['sk_n1', 'sk_missing']), {
      sk_n1: { power: 10 },
    });
    expect(read('skills.json').sk_missing).toBeUndefined();
  });

  it('est idempotent : ré-intégrer produit les mêmes octets (format canonique)', async () => {
    await seed();
    const c = char('new_hero', 'Stella', ['sk_n1']);
    const freshSkills = { sk_n1: { power: 10 } };
    await integrateCharacterData(dir, c, freshSkills);
    const snap = ['characters.json', 'skills.json', 'characters-slug-to-id.json'].map(bytes);
    await integrateCharacterData(dir, c, freshSkills);
    expect(['characters.json', 'skills.json', 'characters-slug-to-id.json'].map(bytes)).toEqual(
      snap,
    );
  });
});

describe('integrateMonsterData', () => {
  const monster = (over: Partial<Monster> = {}): Monster =>
    ({ id: 'boss_x', name: { en: 'X' }, skills: ['msk_1'], ...over }) as unknown as Monster;

  it('écrit monstre + skills + donjons des spawns, en préservant le reste', async () => {
    await writeJson(join(dir, 'monsters.json'), { boss_old: { id: 'boss_old' } });
    await writeJson(join(dir, 'monster-skills.json'), { msk_old: { v: 1 } });
    await writeJson(join(dir, 'encounters.json'), { dg_old: { mode: 'raid' } });

    const files = await integrateMonsterData(
      dir,
      monster({ spawns: [{ dungeon: 'dg_new' }, { dungeon: 'dg_unknown' }] } as Partial<Monster>),
      { msk_1: { v: 2 }, msk_other: { v: 9 } },
      () => ({ dg_new: { mode: 'jc' } }),
    );

    expect(files).toEqual(['monsters.json', 'monster-skills.json', 'encounters.json']);
    expect(Object.keys(read('monsters.json'))).toEqual(['boss_old', 'boss_x']);
    const skills = read('monster-skills.json');
    expect(skills.msk_old).toEqual({ v: 1 }); // préservé
    expect(skills.msk_1).toEqual({ v: 2 });
    expect(skills.msk_other).toBeUndefined();
    const enc = read('encounters.json');
    expect(enc.dg_old).toEqual({ mode: 'raid' }); // préservé
    expect(enc.dg_new).toEqual({ mode: 'jc' });
    expect(enc.dg_unknown).toBeUndefined(); // spawn vers un donjon inconnu du frais : ignoré
  });

  it('fonctionne sur dossier vierge (1re intégration) et reste idempotent', async () => {
    const m = monster();
    const freshSkills = { msk_1: { v: 2 } };
    await integrateMonsterData(dir, m, freshSkills, () => ({}));
    const snap = ['monsters.json', 'monster-skills.json'].map(bytes);
    await integrateMonsterData(dir, m, freshSkills, () => ({}));
    expect(['monsters.json', 'monster-skills.json'].map(bytes)).toEqual(snap);
  });

  it('sans spawns : ne touche pas encounters.json et ne construit pas les donjons', async () => {
    let built = false;
    const files = await integrateMonsterData(dir, monster(), { msk_1: { v: 2 } }, () => {
      built = true;
      return {};
    });
    expect(files).toEqual(['monsters.json', 'monster-skills.json']);
    // Paresse préservée : pas de spawn → pas de buildEncounters, pas de fichier.
    expect(built).toBe(false);
    expect(existsSync(join(dir, 'encounters.json'))).toBe(false);
  });
});
