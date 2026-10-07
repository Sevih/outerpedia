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
 *
 * Et contrat de `saveGearReco` — l'onglet « Gear reco ». Lui écrit et pousse :
 * ses deux écritures (le store, git) sont INJECTÉES, aucun test n'écrit dans
 * `data/curated/` ni ne lance git. Le fichier des recos est LU (roster, listes
 * des sélecteurs, presets, builds réels), jamais à des coordonnées figées — il
 * bouge à chaque enregistrement de l'onglet.
 *
 * Et contrat de `translateNotes` — « Traduire » du même onglet : le traducteur
 * est INJECTÉ, aucun test n'appelle DeepL ni Anthropic.
 *
 * Et contrat de `addComics` — l'onglet « 4-comics » : plusieurs BD et plusieurs
 * langues, UN envoi, UN commit. Même règle : le pool est un répertoire
 * temporaire, la chaîne (webp, R2, repli) et git sont factices.
 */
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { CharacterCurated, GearBuild } from '@contracts';
import { collapseBuild, expandBuild } from '@/lib/admin/gear-preset-resolve';
import { loadGearPresets, loadGearReco } from '@/lib/data/gear-reco';
import {
  NO_TRANSLATE_KEY,
  addComics,
  checkGearBuilds,
  comicLangOf,
  gearRecoState,
  groupComics,
  planRankChanges,
  saveGearReco,
  translateNotes,
  type ComicsDeps,
  type ComicUpload,
  type GearCatalog,
  type GearRecoDeps,
  type Outcome,
  type RankChange,
  type RankDisk,
  type TranslateDeps,
} from './actions';

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

// ------------------------------------------------------------- gear reco -----

const CATALOG: GearCatalog = {
  weapons: new Set(['w1', 'w2']),
  amulets: new Set(['a1']),
  talismans: new Set(['t1', 't2']),
  sets: new Set(['s1', 's2']),
  presets: {
    talismans: { duo: ['t1', 't2'] },
    sets: { four: [{ set: 's1', count: 4 }] },
    substats: { dps: 'ATK>CHC>SPD' },
  },
};

const BUILD: GearBuild = {
  name: 'Speed',
  weapons: [{ id: 'w1', mainStat: 'ATK%' }],
  amulets: [{ id: 'a1', mainStat: 'PEN%/CHD' }],
  talismans: ['$duo'],
  sets: [
    { preset: 'four' },
    {
      pieces: [
        { set: 's1', count: 2 },
        { set: 's2', count: 2 },
      ],
    },
  ],
  substats: '$dps',
  note: { en: 'Plain note.', fr: 'Note simple.', es: 'Nota simple.' },
};

describe('checkGearBuilds — références', () => {
  it('laisse passer un build dont tout existe, presets et pièces', () => {
    expect(checkGearBuilds([BUILD, { name: 'Nu' }], CATALOG)).toEqual([]);
  });

  it('situe chaque référence fautive : build, slot, rang', () => {
    const issues = checkGearBuilds(
      [
        BUILD,
        {
          name: ' ',
          weapons: [{ id: 'w1' }, { id: '' }, { id: 'ghost' }],
          talismans: ['t1', '', '$nope'],
          sets: [{ preset: 'nope' }, { pieces: [] }, { pieces: [{ set: '', count: 2 }] }],
          substats: '$nope',
        },
      ],
      CATALOG,
    );

    expect(issues.map(({ build, slot, index }) => [build, slot, index])).toEqual([
      [1, 'name', undefined],
      [1, 'weapons', 1],
      [1, 'weapons', 2],
      [1, 'talismans', 1],
      [1, 'talismans', 2],
      [1, 'sets', 0],
      [1, 'sets', 1],
      [1, 'sets', 2],
      [1, 'substats', undefined],
    ]);
  });

  it('ne refuse PAS une stat principale hors du pool (le fichier en porte)', () => {
    const odd = { ...BUILD, weapons: [{ id: 'w1', mainStat: 'WHATEVER' }] };
    expect(checkGearBuilds([odd], CATALOG)).toEqual([]);
  });
});

describe('checkGearBuilds — notes', () => {
  const noted = (note: GearBuild['note']): GearBuild[] => [{ ...BUILD, note }];

  it('refuse un tag sans correspondance, dans la langue qui le porte', () => {
    const issues = checkGearBuilds(
      noted({ en: 'Use {I-T/No Such Charm}.', fr: 'Sans balise.' }),
      CATALOG,
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ build: 0, slot: 'note' });
    expect(issues[0].message).toContain('en : {I-T/No Such Charm}');
  });

  it('refuse un type de tag que le rendu ne connaît pas', () => {
    expect(checkGearBuilds(noted({ en: 'Bad {ZZ/x}.' }), CATALOG)).toHaveLength(1);
  });

  it('refuse une note sans anglais, la langue de repli', () => {
    const issues = checkGearBuilds(noted({ fr: 'Seulement en français.' }), CATALOG);
    expect(issues.map((i) => i.slot)).toEqual(['note']);
  });

  it('exige les MÊMES balises partout quand la note est écrite dans toutes les langues', () => {
    const all = {
      en: '{E/fire} team',
      fr: '{E/fire}',
      es: '{E/fire}',
      jp: '{E/fire}',
      kr: '{E/fire}',
    };

    expect(checkGearBuilds(noted({ ...all, zh: '{E/fire}' }), CATALOG)).toEqual([]);
    const issues = checkGearBuilds(noted({ ...all, zh: 'fire' }), CATALOG);
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('zh');
    // Une note partielle n'est pas un bloc pour le test de parité : pas contrôlée.
    expect(checkGearBuilds(noted({ en: '{E/fire}', fr: 'feu' }), CATALOG)).toEqual([]);
  });
});

describe('recos du fichier — lues, jamais écrites', () => {
  const reco = loadGearReco();
  const presets = loadGearPresets();
  const state = gearRecoState();
  const ids = (list: { id: string }[]): Set<string> => new Set(list.map((o) => o.id));
  const catalog: GearCatalog = {
    weapons: ids(state.options.weapons),
    amulets: ids(state.options.amulets),
    talismans: ids(state.options.talismans),
    sets: ids(state.options.sets),
    presets,
  };

  it('le contrôle ne refuse AUCUN build existant (sinon son perso ne s’enregistre plus)', () => {
    const refused = Object.entries(reco).flatMap(([id, builds]) =>
      checkGearBuilds(builds, catalog).map((i) => `${id}[${i.build}] ${i.slot} — ${i.message}`),
    );
    expect(refused).toEqual([]);
  });

  it('déplier puis replier trois builds réels ne perd rien', () => {
    const all = Object.values(reco).flat();
    // Trois formes : tout en presets, plusieurs combos de sets, une note.
    const sample = [
      all.find((b) => b.talismans?.[0]?.startsWith('$') && b.substats?.startsWith('$')),
      all.find((b) => (b.sets?.length ?? 0) > 1),
      all.find((b) => b.note),
      ...all,
    ]
      .filter((b): b is GearBuild => Boolean(b))
      .filter((b, i, list) => list.indexOf(b) === i)
      .slice(0, 3);
    expect(sample).toHaveLength(3);

    for (const disk of sample) {
      const pieces = expandBuild(disk, presets);
      // Déplié : plus aucun `$slug`, que des pièces.
      expect(JSON.stringify([pieces.talismans, pieces.sets, pieces.substats])).not.toContain('$');
      expect(pieces.sets?.every((c) => !c.preset)).toBe(true);

      const back = collapseBuild(pieces, presets);
      // Replié : les MÊMES pièces une fois redépliées (deux presets de même
      // contenu se valent, d'où la comparaison en pièces et non en slugs)…
      expect(expandBuild(back, presets)).toEqual(pieces);
      // …sous forme de presets partout où le disque en citait…
      if (disk.talismans?.[0]?.startsWith('$')) expect(back.talismans?.[0]).toMatch(/^\$/);
      expect(back.sets?.map((c) => Boolean(c.preset))).toEqual(
        disk.sets?.map((c) => Boolean(c.preset)),
      );
      if (disk.substats?.startsWith('$')) expect(back.substats).toBe(disk.substats);
      // …et le reste intact.
      expect([back.name, back.weapons, back.amulets, back.note]).toEqual([
        disk.name,
        disk.weapons,
        disk.amulets,
        disk.note,
      ]);
    }
  });

  it('l’état d’un perso porte ses builds deux fois : en pièces et tels que le disque', () => {
    const id = Object.keys(reco)[0];
    const one = gearRecoState(id);

    expect(one.disk).toEqual(reco[id]);
    expect(one.builds).toEqual(reco[id].map((b) => expandBuild(b, presets)));
    expect(one.roster.find((c) => c.id === id)?.builds).toBe(reco[id].length);
    expect(gearRecoState()).not.toHaveProperty('builds');
  });
});

describe('saveGearReco — écritures injectées', () => {
  const state = gearRecoState();
  const who = state.roster[0];
  // Un build valide tiré des listes réelles, pas d'un build du fichier.
  const valid: GearBuild = {
    name: 'Test',
    weapons: [{ id: state.options.weapons[0].id }],
    talismans: [`$${Object.keys(state.presets.talismans)[0]}`],
    sets: [{ preset: Object.keys(state.presets.sets)[0] }],
    substats: 'ATK>SPD',
    note: { en: 'Plain note.' },
  };

  /** Les deux écritures, factices : elles notent leurs appels et rien d'autre. */
  function deps(over: { errors?: string[]; git?: Outcome } = {}) {
    const calls = {
      upsert: [] as [string, GearBuild[]][],
      git: [] as [string[], string][],
    };
    const fake: GearRecoDeps = {
      upsert: async (id, builds) => {
        calls.upsert.push([id, builds]);
        return over.errors ?? [];
      },
      commitAndPush: (paths, message) => {
        calls.git.push([paths, message]);
        return over.git ?? { ok: true, log: ['git : fait'] };
      },
    };
    return { calls, fake };
  }

  it('succès : UN commit, le seul fichier des recos, le message au nom du perso', async () => {
    const { calls, fake } = deps();
    const out = await saveGearReco(who.id, [valid], fake);

    expect(out).toMatchObject({ ok: true, issues: [], written: true });
    expect(calls.upsert).toEqual([[who.id, [valid]]]);
    expect(calls.git).toEqual([[['data/curated/gear-reco.json'], `chore(gear-reco): ${who.name}`]]);
    expect(out.log.at(-1)).toBe('git : fait');
  });

  it('erreurs de validation du store : AUCUN commit, et l’erreur est située', async () => {
    const { calls, fake } = deps({
      errors: [`gearReco[${who.id}][0].weapons[0].id — attendu string, reçu number`],
    });
    const out = await saveGearReco(who.id, [valid], fake);

    expect(out.ok).toBe(false);
    expect(out.written).toBe(false);
    expect(calls.git).toEqual([]);
    expect(out.issues).toEqual([
      { build: 0, slot: 'weapons', index: 0, message: 'attendu string, reçu number' },
    ]);
    expect(out.log).toEqual(['REFUSÉ — build 1 « Test » · armes 1 : attendu string, reçu number']);
  });

  it('forme invalide : refusée avant le store', async () => {
    const { calls, fake } = deps();
    const out = await saveGearReco(who.id, [{ name: 3 } as unknown as GearBuild], fake);

    expect(out.ok).toBe(false);
    expect(out.issues).toMatchObject([{ build: 0, slot: 'name' }]);
    expect(calls).toEqual({ upsert: [], git: [] });
  });

  it('tag inconnu dans une note : refus AVANT écriture', async () => {
    const { calls, fake } = deps();
    const out = await saveGearReco(
      who.id,
      [valid, { ...valid, name: 'PvP', note: { en: 'Use {I-T/No Such Charm}.' } }],
      fake,
    );

    expect(out.ok).toBe(false);
    expect(calls).toEqual({ upsert: [], git: [] });
    expect(out.issues).toMatchObject([{ build: 1, slot: 'note' }]);
    expect(out.log[0]).toContain('build 2 « PvP » · note');
    expect(out.log[0]).toContain('{I-T/No Such Charm}');
  });

  it('pièce inconnue : refus avant écriture', async () => {
    const { calls, fake } = deps();
    const out = await saveGearReco(who.id, [{ ...valid, weapons: [{ id: '' }] }], fake);

    expect(out.ok).toBe(false);
    expect(calls).toEqual({ upsert: [], git: [] });
  });

  it('perso inconnu : rien n’est écrit', async () => {
    const { calls, fake } = deps();
    const out = await saveGearReco('ghost', [valid], fake);

    expect(out.ok).toBe(false);
    expect(calls).toEqual({ upsert: [], git: [] });
  });

  it('liste vide : le store reçoit `[]` (il retire la clé), puis le commit', async () => {
    const { calls, fake } = deps();
    const out = await saveGearReco(who.id, [], fake);

    expect(out.ok).toBe(true);
    expect(calls.upsert).toEqual([[who.id, []]]);
    expect(calls.git).toHaveLength(1);
    expect(out.log[0]).toContain('recos retirées');
  });

  it('push refusé : `written` dit que le disque porte déjà les builds', async () => {
    const { fake } = deps({ git: { ok: false, log: ['git push a échoué'] } });
    const out = await saveGearReco(who.id, [valid], fake);

    expect(out).toMatchObject({ ok: false, written: true, issues: [] });
    expect(out.log.at(-1)).toBe('git push a échoué');
  });
});

describe('translateNotes — traducteur injecté', () => {
  /** Un faux moteur : chaque texte rendu tel quel derrière le code de sa langue. */
  function deps(over: Partial<TranslateDeps> = {}) {
    const calls: [string[], string[]][] = [];
    const fake: TranslateDeps = {
      autoTranslate: async (texts, targets) => {
        calls.push([texts, targets]);
        return {
          results: texts.map((text) =>
            Object.fromEntries(targets.map((lang) => [lang, `${lang}: ${text}`])),
          ),
          provider: 'deepl',
        };
      },
      hasKey: () => true,
      ...over,
    };
    return { calls, fake };
  }

  it('rend les cinq autres langues du site et relaie le moteur', async () => {
    const { calls, fake } = deps();
    const out = await translateNotes(['Plain note.'], fake);

    expect(calls).toEqual([[['Plain note.'], ['jp', 'kr', 'zh', 'fr', 'es']]]);
    expect(out).toEqual({
      results: [
        {
          jp: 'jp: Plain note.',
          kr: 'kr: Plain note.',
          zh: 'zh: Plain note.',
          fr: 'fr: Plain note.',
          es: 'es: Plain note.',
        },
      ],
      provider: 'deepl',
    });
  });

  it('relaie Haiku quand c’est lui qui a servi', async () => {
    const { fake } = deps({
      autoTranslate: async (texts) => ({ results: texts.map(() => ({})), provider: 'haiku' }),
    });
    expect(await translateNotes(['Plain note.'], fake)).toMatchObject({ provider: 'haiku' });
  });

  it('n’envoie pas les textes vides, et garde les résultats alignés sur l’envoi', async () => {
    const { calls, fake } = deps();
    const out = await translateNotes(['First.', '', '  \n', 'Last.'], fake);

    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toEqual(['First.', 'Last.']);
    expect(out).toMatchObject({
      results: [{ fr: 'fr: First.' }, {}, {}, { fr: 'fr: Last.' }],
    });
  });

  it('rien que du vide : aucun appel', async () => {
    const { calls, fake } = deps();
    expect(await translateNotes(['', ' '], fake)).toEqual({ results: [{}, {}], provider: 'none' });
    expect(calls).toEqual([]);
  });

  it('pas de clé : l’erreur est rendue SANS appeler le moteur', async () => {
    const { calls, fake } = deps({ hasKey: () => false });
    const out = await translateNotes(['Plain note.'], fake);

    expect(out).toEqual({ error: NO_TRANSLATE_KEY });
    expect(NO_TRANSLATE_KEY).toContain('DEEPL_API_KEY');
    expect(NO_TRANSLATE_KEY).toContain('ANTHROPIC_API_KEY');
    expect(calls).toEqual([]);
  });

  it('ne touche pas aux tags inline : ce que le moteur garde revient intact', async () => {
    const { calls, fake } = deps();
    const out = await translateNotes(['Use {I-T/ATK} here.'], fake);

    expect(calls[0][0]).toEqual(['Use {I-T/ATK} here.']);
    expect(out).toMatchObject({ results: [{ fr: 'fr: Use {I-T/ATK} here.' }] });
  });

  it('un moteur qui ne traduit rien (garde IS_DEV) est une erreur, pas un silence', async () => {
    const { fake } = deps({
      autoTranslate: async (texts) => ({ results: texts.map(() => ({})), provider: 'none' }),
    });
    const out = await translateNotes(['Plain note.'], fake);

    expect(out).toHaveProperty('error');
    expect(out).not.toHaveProperty('results');
  });

  it('un refus du moteur est rendu, pas levé', async () => {
    const { fake } = deps({
      autoTranslate: async () => {
        throw new Error('DeepL 403 : forbidden');
      },
    });
    expect(await translateNotes(['Plain note.'], fake)).toEqual({ error: 'DeepL 403 : forbidden' });
  });
});

// ---------------------------------------------------------------- comics -----

const page = (name: string): ComicUpload => ({
  name,
  data: Buffer.from(name).toString('base64'),
});

describe('comicLangOf — la langue que dit le nom', () => {
  it('lit les trois suffixes, en capitales comme en minuscules', () => {
    expect(comicLangOf('outerplane_comic08_EN.png')).toBe('EN');
    expect(comicLangOf('outerplane_comic08_JP.png')).toBe('JP');
    expect(comicLangOf('outerplane_comic08_KR.png')).toBe('KR');
    expect(comicLangOf('outerplane_comic04_en.jpg')).toBe('EN');
    expect(comicLangOf('outerplane_comic04_jp.png')).toBe('JP');
    expect(comicLangOf('outerplane_comic04_kr.webp')).toBe('KR');
  });

  it('rend `null` sans suffixe, ou quand il n’est pas juste avant l’extension', () => {
    expect(comicLangOf('comic01.jpg')).toBeNull();
    expect(comicLangOf('20260710_121053.jpg')).toBeNull();
    expect(comicLangOf('yami_EN_.png')).toBeNull();
    expect(comicLangOf('comic_EN_final.png')).toBeNull();
    expect(comicLangOf('comicEN.png')).toBeNull();
    expect(comicLangOf('comic_FR.png')).toBeNull();
  });
});

describe('groupComics — une ligne par BD, une case par langue', () => {
  it('trois fichiers d’une BD : une ligne à trois cases', () => {
    const [en, jp, kr] = ['c08_EN.png', 'c08_JP.png', 'c08_kr.png'].map(page);

    expect(groupComics([kr, en, jp])).toEqual([{ stem: 'c08', slots: { EN: en, JP: jp, KR: kr } }]);
  });

  it('deux BD mélangées : deux lignes, dans l’ordre d’arrivée', () => {
    const [a, b, c, d, e] = ['c08_EN.png', 'c07_JP.png', 'c08_KR.png', 'c07_EN.png', 'c08_JP.png'];

    expect(groupComics([a, b, c, d, e].map(page))).toEqual([
      { stem: 'c08', slots: { EN: page(a), KR: page(c), JP: page(e) } },
      { stem: 'c07', slots: { JP: page(b), EN: page(d) } },
    ]);
  });

  it('un fichier sans suffixe reste seul, dans la langue par défaut', () => {
    const files = ['c08_EN.png', 'c08.jpg', 'comic01.jpg'].map(page);

    expect(groupComics(files, 'JP')).toEqual([
      { stem: 'c08', slots: { EN: files[0], JP: files[1] } },
      { stem: 'comic01', slots: { JP: files[2] } },
    ]);
    expect(groupComics([page('comic01.jpg')])).toEqual([
      { stem: 'comic01', slots: { EN: page('comic01.jpg') } },
    ]);
  });

  it('une langue donnée à la main passe avant celle du nom', () => {
    const fixed = { ...page('c08_EN.png'), lang: 'KR' as const };

    expect(groupComics([fixed])).toEqual([{ stem: 'c08', slots: { KR: fixed } }]);
  });

  it('deux planches pour la même case : la seconde ouvre une ligne, rien n’est écrasé', () => {
    const [png, jpg] = ['c08_EN.png', 'c08_EN.jpg'].map(page);

    expect(groupComics([png, jpg])).toEqual([
      { stem: 'c08', slots: { EN: png } },
      { stem: 'c08', slots: { EN: jpg } },
    ]);
  });
});

describe('addComics — écritures injectées', () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
  });

  /** Un pool temporaire, et la chaîne factice : elle note ses appels, rien d'autre. */
  function deps(over: Partial<ComicsDeps> = {}) {
    const dir = mkdtempSync(join(tmpdir(), 'quick-comics-'));
    dirs.push(dir);
    const calls = { chain: [] as string[], git: [] as [string[], string][] };
    const fake: ComicsDeps = {
      dir,
      collect: async () => {
        calls.chain.push('collect');
        return { made: 4, skipped: 0 };
      },
      pushEditorial: () => void calls.chain.push('editorial'),
      pushAssets: () => {
        calls.chain.push('assets');
        return { ok: true, error: '' };
      },
      syncSeed: () => {
        calls.chain.push('seed');
        return 'mis à jour';
      },
      commitAndPush: (paths, message) => {
        calls.git.push([paths, message]);
        return { ok: true, log: ['git : fait'] };
      },
      ...over,
    };
    return { dir, calls, fake };
  }

  it('deux langues : chaque fichier dans SON dossier, la chaîne UNE fois, UN commit', async () => {
    const { dir, calls, fake } = deps();
    const out = await addComics(
      [
        {
          lang: 'EN',
          files: [page('outerplane_comic08_EN.png'), page('outerplane_comic07_EN.png')],
        },
        { lang: 'KR', files: [page('outerplane_comic08_KR.png')] },
      ],
      undefined,
      fake,
    );

    expect(out.ok).toBe(true);
    expect(readdirSync(dir).sort()).toEqual(['EN', 'KR']);
    expect(readdirSync(join(dir, 'EN')).sort()).toEqual([
      'outerplane_comic07_EN.png',
      'outerplane_comic08_EN.png',
    ]);
    expect(readdirSync(join(dir, 'KR'))).toEqual(['outerplane_comic08_KR.png']);
    // Le contenu est celui envoyé, décodé.
    expect(readFileSync(join(dir, 'KR', 'outerplane_comic08_KR.png'), 'utf8')).toBe(
      'outerplane_comic08_KR.png',
    );
    expect(calls.chain).toEqual(['collect', 'editorial', 'assets', 'seed']);
    expect(calls.git).toEqual([
      [
        ['data/generated/comics.json', 'datagen/assets/pushed.json'],
        'chore(assets): 4-comics comic08, comic07 (EN, KR)',
      ],
    ]);
    expect(out.log).toEqual([
      'déposé : EN/outerplane_comic08_EN.png',
      'déposé : EN/outerplane_comic07_EN.png',
      'déposé : KR/outerplane_comic08_KR.png',
      'conversion webp : 4 produites, 0 déjà à jour.',
      'originaux sauvegardés sur R2 (editorial:push).',
      'poussé sur R2 — la galerie lit le manifeste à la requête.',
      'repli committé : mis à jour.',
      'git : fait',
    ]);
  });

  it('le message nomme les BD sans suffixe, les langues dans leur ordre, et abrège au-delà de trois', async () => {
    const { calls, fake } = deps();
    await addComics(
      [
        { lang: 'KR', files: ['a_KR.png', 'b.png'].map(page) },
        { lang: 'JP', files: ['a_jp.png', 'c_JP.png', 'd_JP.png', 'e_JP.png'].map(page) },
      ],
      undefined,
      fake,
    );

    expect(calls.git[0][1]).toBe('chore(assets): 4-comics a, b, c et 2 autres (JP, KR)');
  });

  it('nom refusé : AUCUN fichier écrit, pas même ceux d’avant, ni chaîne ni commit', async () => {
    const { dir, calls, fake } = deps();
    const out = await addComics(
      [
        { lang: 'EN', files: [page('ok_EN.png')] },
        { lang: 'JP', files: [page('ok_JP.png'), page('유마님_JP.png')] },
      ],
      undefined,
      fake,
    );

    expect(out).toEqual({ ok: false, log: ['Nom de fichier refusé : 유마님_JP.png'] });
    expect(readdirSync(dir)).toEqual([]);
    expect(calls).toEqual({ chain: [], git: [] });
  });

  it('langue inconnue, envoi vide : rien n’est écrit', async () => {
    const { dir, calls, fake } = deps();
    const unknown = await addComics(
      [
        { lang: 'EN', files: [page('ok_EN.png')] },
        { lang: 'FR' as 'EN', files: [page('ok_FR.png')] },
      ],
      undefined,
      fake,
    );
    const empty = await addComics([{ lang: 'EN', files: [] }], undefined, fake);

    expect(unknown).toEqual({ ok: false, log: ['Langue inconnue : FR'] });
    expect(empty).toEqual({ ok: false, log: ['Aucun fichier.'] });
    expect(readdirSync(dir)).toEqual([]);
    expect(calls).toEqual({ chain: [], git: [] });
  });

  it('un nom à chemin est ramené à son basename, dans le dossier de sa langue', async () => {
    const { dir, fake } = deps();
    await addComics([{ lang: 'JP', files: [page('../../evil_JP.png')] }], undefined, fake);

    expect(readdirSync(join(dir, 'JP'))).toEqual(['evil_JP.png']);
    expect(existsSync(join(dir, '..', 'evil_JP.png'))).toBe(false);
  });

  it('push R2 en échec : les originaux sont déposés, mais ni repli ni commit', async () => {
    const { calls, fake } = deps({ pushAssets: () => ({ ok: false, error: 'R2 muet' }) });
    const out = await addComics([{ lang: 'EN', files: [page('a_EN.png')] }], undefined, fake);

    expect(out.ok).toBe(false);
    expect(out.log.at(-1)).toBe('assets:push a échoué : R2 muet');
    expect(calls).toEqual({ chain: ['collect', 'editorial'], git: [] });
  });
});
