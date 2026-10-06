/**
 * Staging RESTREINT aux persos intégrés modifiés (`stage-characters.ts`) : la
 * même étape 5 que l'intégration, mais pour quelques ids seulement — jamais
 * toute la collecte. Index et dépôt injectés : ni `.gamedata`, ni écriture
 * dans `.assets-staging/`. Les fixtures n'ont pas d'`appearances` : leur
 * résolution de visage lit les tables du jeu, hors de portée ici.
 */
import { describe, expect, it } from 'vitest';
import type { AssetRequest } from './manifest';
import { changedIntegratedIds, stageCharacterAssets } from './stage-characters';

const char = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  name: { en: id },
  skills: [`sk_${id}`],
  ...over,
});

/** Dépôt factice : capture les demandes, ne produit rien. */
function fakeStage() {
  const calls: AssetRequest[][] = [];
  const stage = async (requests: AssetRequest[]) => {
    calls.push(requests);
    return { staged: requests.length, restaged: 0, present: 0, missing: [] };
  };
  return { calls, deps: { index: () => new Map<string, string>(), stage } };
}

describe('changedIntegratedIds', () => {
  it('ne rend que les ids présents des DEUX côtés dont l’entrée change', () => {
    const committed = { a: char('a'), b: char('b'), gone: char('gone') };
    const fresh = { a: char('a', { rarity: 3 }), b: char('b'), brandNew: char('brandNew') };
    // `brandNew` (non intégré) et `gone` (disparu) ne sont jamais stagés.
    expect(changedIntegratedIds(committed, fresh)).toEqual(['a']);
  });
});

describe('stageCharacterAssets', () => {
  it('stage les SEULS ids demandés, full art d’un costume compris', async () => {
    const characters = {
      a: char('a', {
        costumes: [{ id: '1', model: '2010001', name: { en: 'Skin' }, sort: 1, art: true }],
      }),
      b: char('b'),
    };
    const skills = { sk_a: { icon: 'Skill_A' }, sk_b: { icon: 'Skill_B' } };
    const { calls, deps } = fakeStage();

    const result = await stageCharacterAssets(['a'], characters, skills, deps);

    expect(calls).toHaveLength(1);
    const keys = calls[0].map((r) => r.key);
    // Les images du perso `a`, son icône de skill et le full art de son costume…
    expect(keys).toContain('images/characters/portrait/CT_a.webp');
    expect(keys).toContain('images/characters/skills/Skill_A.webp');
    expect(keys).toContain('images/characters/full/IMG_2010001.webp');
    // … et RIEN du perso `b`, pourtant dans le fichier.
    expect(keys.some((k) => k.includes('_b.') || k.includes('Skill_B'))).toBe(false);
    expect(result.staged).toBe(keys.length);
  });

  it('ignore un id inconnu du committé (garde perso) et ne stage rien sans demande', async () => {
    const { calls, deps } = fakeStage();
    const result = await stageCharacterAssets(['unknown'], { a: char('a') }, {}, deps);
    expect(calls).toHaveLength(0);
    expect(result).toEqual({ staged: 0, restaged: 0, present: 0, missing: [] });
  });

  it('déduplique les demandes par clé entre deux persos', async () => {
    const { calls, deps } = fakeStage();
    // Deux persos qui référencent le même skill → une seule demande d'icône.
    const characters = {
      a: char('a', { skills: ['shared'] }),
      b: char('b', { skills: ['shared'] }),
    };
    await stageCharacterAssets(['a', 'b'], characters, { shared: { icon: 'Skill_Shared' } }, deps);
    const keys = calls[0].map((r) => r.key);
    expect(keys.filter((k) => k === 'images/characters/skills/Skill_Shared.webp')).toHaveLength(1);
  });
});
