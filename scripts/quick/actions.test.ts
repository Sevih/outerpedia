/**
 * Contrat de `planRankChanges` — l'onglet « Rangs » de `pnpm quick`.
 *
 * L'enregistrement POUSSE sur `main` : ce qui se perdrait ici partirait en prod
 * avec le commit. Deux pertes possibles, invisibles à l'écran de l'onglet :
 *   - les champs que l'onglet ne montre pas (`tags`, `skillPriority`, `videos`,
 *     `prosCons`, `synergies`, les chips des EE), écrasés par une entrée
 *     reconstruite au lieu d'être reprise ;
 *   - le réglage d'un autre, posé sur le disque depuis le chargement de la page.
 *
 * La fonction est pure : aucun disque ici, l'état est passé en argument.
 */
import { describe, expect, it } from 'vitest';
import type { CharacterCurated } from '@contracts';
import { planRankChanges, type RankChange, type RankDisk } from './actions';

const DIANNE: CharacterCurated = {
  rank: 'S',
  rankPvp: 'A',
  role: 'dps',
  tags: ['free'],
  skillPriority: { first: 3, second: 1, ultimate: 2 },
  rankByTranscend: { '3': 'A', '4': 'A', '6': 'S', '9': 'S' },
  roleByTranscend: { '9': 'dps' },
  videos: [{ platform: 'youtube', id: 'zvgoCGKtIfo', title: 't', author: 'a' }],
  prosCons: { pros: [{ en: 'strong' }], cons: [] },
  synergies: [{ heroes: ['2000001'] }],
};

const disk = (over: Partial<RankDisk> = {}): RankDisk => ({
  curated: { dianne: DIANNE, bare: { rank: 'B', role: 'support' } },
  ee: {
    dianne: { rank: 'A', rank10: 'S', chipHide: ['x'], chipAdd: ['y'], source: { label: 'z' } },
  },
  roster: new Set(['dianne', 'bare', 'fresh', 'no-ee']),
  eeOwners: new Set(['dianne', 'bare', 'fresh']),
  ...over,
});

const change = (
  id: string,
  field: RankChange['field'],
  from: string,
  to: string,
  step?: string,
): RankChange => ({ id, field, from, to, ...(step ? { step } : {}) });

describe('planRankChanges — champs simples', () => {
  it('ne change que le champ réglé et PRÉSERVE tout le reste de l’entrée', () => {
    const plan = planRankChanges(disk(), [change('dianne', 'rank', 'S', 'A')]);

    expect(plan.refused).toEqual([]);
    expect(plan.characters).toEqual({ dianne: { ...DIANNE, rank: 'A' } });
    // Rien côté EE, rien pour les persos non modifiés.
    expect(plan.ee).toEqual({});
  });

  it('cumule plusieurs cellules du même perso dans une seule entrée', () => {
    const plan = planRankChanges(disk(), [
      change('dianne', 'rank', 'S', 'B'),
      change('dianne', 'rankPvp', 'A', 'S'),
      change('dianne', 'role', 'dps', 'sustain'),
    ]);

    expect(plan.characters.dianne).toEqual({
      ...DIANNE,
      rank: 'B',
      rankPvp: 'S',
      role: 'sustain',
    });
    expect(plan.applied).toHaveLength(3);
  });

  it('un rang VIDÉ retire le champ', () => {
    const plan = planRankChanges(disk(), [change('dianne', 'rankPvp', 'A', '')]);

    expect(plan.characters.dianne).not.toHaveProperty('rankPvp');
    expect(plan.characters.dianne.rank).toBe('S');
  });

  it('un champ AJOUTÉ prend sa place dans l’entrée, pas la queue', () => {
    const plan = planRankChanges(disk(), [change('bare', 'rankPvp', '', 'C')]);

    expect(Object.keys(plan.characters.bare)).toEqual(['rank', 'rankPvp', 'role']);
  });

  it('crée l’entrée d’un perso qui n’en avait pas', () => {
    const plan = planRankChanges(disk(), [change('fresh', 'rank', '', 'C')]);

    expect(plan.characters).toEqual({ fresh: { rank: 'C' } });
  });

  it('une entrée vidée de son dernier champ sort VIDE (le store supprime la clé)', () => {
    const plan = planRankChanges(disk(), [
      change('bare', 'rank', 'B', ''),
      change('bare', 'role', 'support', ''),
    ]);

    expect(plan.characters.bare).toEqual({});
  });
});

describe('planRankChanges — refus', () => {
  it('REFUSE la cellule dont le disque ne porte plus la valeur chargée', () => {
    const plan = planRankChanges(disk(), [
      change('dianne', 'rank', 'A', 'B'),
      change('dianne', 'role', 'dps', 'support'),
    ]);

    // La cellule en conflit est écartée et le dit ; sa voisine passe.
    expect(plan.refused).toHaveLength(1);
    expect(plan.refused[0].change.field).toBe('rank');
    expect(plan.refused[0].reason).toContain('« S »');
    expect(plan.characters.dianne).toEqual({ ...DIANNE, role: 'support' });
  });

  it('ne refuse ni n’écrit quand le disque porte DÉJÀ la valeur voulue', () => {
    const plan = planRankChanges(disk(), [change('dianne', 'rank', 'B', 'S')]);

    expect(plan).toEqual({ characters: {}, ee: {}, applied: [], refused: [] });
  });

  it('refuse une valeur hors liste, un perso et une colonne inconnus', () => {
    const plan = planRankChanges(disk(), [
      change('dianne', 'rank', 'S', 'SS'),
      change('dianne', 'eeRank', 'A', 'E'),
      change('dianne', 'role', 'dps', 'tank'),
      change('ghost', 'rank', '', 'S'),
      change('dianne', 'tags' as RankChange['field'], '', 'S'),
    ]);

    expect(plan.refused).toHaveLength(5);
    expect(plan.characters).toEqual({});
    expect(plan.ee).toEqual({});
  });
});

describe('planRankChanges — EE', () => {
  it('reprend les chips du disque dans le patch (le store les effacerait sinon)', () => {
    const plan = planRankChanges(disk(), [change('dianne', 'eeRank', 'A', 'B')]);

    expect(plan.ee).toEqual({
      dianne: { rank: 'B', rank10: 'S', chipHide: ['x'], chipAdd: ['y'] },
    });
    expect(plan.characters).toEqual({});
  });

  it('vide un rang d’EE sans toucher à l’autre', () => {
    const plan = planRankChanges(disk(), [change('dianne', 'eeRank10', 'S', '')]);

    expect(plan.ee.dianne).toMatchObject({ rank: 'A', rank10: '' });
  });

  it('crée l’entrée d’un EE encore jamais noté', () => {
    const plan = planRankChanges(disk(), [
      change('fresh', 'eeRank', '', 'C'),
      change('fresh', 'eeRank10', '', 'B'),
    ]);

    expect(plan.ee.fresh).toMatchObject({ rank: 'C', rank10: 'B' });
  });

  it('REFUSE un rang d’EE pour un perso qui n’a pas d’EE', () => {
    const plan = planRankChanges(disk(), [change('no-ee', 'eeRank', '', 'S')]);

    expect(plan.ee).toEqual({});
    expect(plan.refused[0].reason).toContain('EE');
  });
});

describe('planRankChanges — tables par transcendance', () => {
  it('AJOUTE un palier à une table existante', () => {
    const plan = planRankChanges(disk(), [change('dianne', 'roleByTranscend', '', 'support', '3')]);

    expect(plan.characters.dianne.roleByTranscend).toEqual({ '3': 'support', '9': 'dps' });
    // L'autre table n'a pas bougé.
    expect(plan.characters.dianne.rankByTranscend).toEqual(DIANNE.rankByTranscend);
  });

  it('CHANGE un palier', () => {
    const plan = planRankChanges(disk(), [change('dianne', 'rankByTranscend', 'S', 'A', '6')]);

    expect(plan.characters.dianne.rankByTranscend).toEqual({
      '3': 'A',
      '4': 'A',
      '6': 'A',
      '9': 'S',
    });
  });

  it('VIDE un palier : la clé part, l’escalier hérite du palier du dessous', () => {
    const plan = planRankChanges(disk(), [change('dianne', 'rankByTranscend', 'A', '', '4')]);

    expect(plan.characters.dianne.rankByTranscend).toEqual({ '3': 'A', '6': 'S', '9': 'S' });
  });

  it('la DERNIÈRE entrée retirée supprime le champ', () => {
    const plan = planRankChanges(disk(), [change('dianne', 'roleByTranscend', 'dps', '', '9')]);

    expect(plan.characters.dianne).not.toHaveProperty('roleByTranscend');
    expect(plan.characters.dianne.rankByTranscend).toEqual(DIANNE.rankByTranscend);
  });

  it('crée la table à sa place quand le perso n’en avait pas', () => {
    const plan = planRankChanges(disk(), [change('bare', 'rankByTranscend', '', 'C', '3')]);

    expect(plan.characters.bare).toEqual({
      rank: 'B',
      role: 'support',
      rankByTranscend: { '3': 'C' },
    });
  });

  it('CONSERVE une clé héritée hors des paliers pleins', () => {
    const legacy = { ...DIANNE, rankByTranscend: { '5': 'B', '9': 'S' } };
    const plan = planRankChanges(disk({ curated: { dianne: legacy } }), [
      change('dianne', 'rankByTranscend', 'S', 'A', '9'),
      change('dianne', 'rankByTranscend', '', 'C', '3'),
    ]);

    expect(plan.characters.dianne.rankByTranscend).toEqual({ '3': 'C', '5': 'B', '9': 'A' });
  });

  it('REFUSE un palier qui ne se cure pas, même s’il existe sur le disque', () => {
    const legacy = { ...DIANNE, rankByTranscend: { '5': 'B' } };
    const plan = planRankChanges(disk({ curated: { dianne: legacy } }), [
      change('dianne', 'rankByTranscend', 'B', 'A', '5'),
      change('dianne', 'rankByTranscend', '', 'A'),
    ]);

    expect(plan.refused).toHaveLength(2);
    expect(plan.characters).toEqual({});
  });

  it('un palier en CONFLIT est refusé seul, ses voisins passent', () => {
    const plan = planRankChanges(disk(), [
      change('dianne', 'rankByTranscend', 'B', 'C', '3'),
      change('dianne', 'rankByTranscend', 'A', 'B', '4'),
    ]);

    expect(plan.refused.map((r) => r.change.step)).toEqual(['3']);
    expect(plan.characters.dianne.rankByTranscend).toEqual({
      '3': 'A',
      '4': 'B',
      '6': 'S',
      '9': 'S',
    });
  });

  it('ne modifie pas l’état du disque qu’on lui passe', () => {
    const d = disk();
    const before = structuredClone({ curated: d.curated, ee: d.ee });
    planRankChanges(d, [
      change('dianne', 'rank', 'S', 'A'),
      change('dianne', 'rankByTranscend', 'A', '', '3'),
      change('dianne', 'eeRank', 'A', 'B'),
    ]);

    expect({ curated: d.curated, ee: d.ee }).toEqual(before);
  });
});
