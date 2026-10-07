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
 * Et contrat de `composeSetCombos` (`ui/gear-sets.mjs`, que la page charge
 * aussi) — le picker de sets du même onglet : un set principal et des
 * secondaires deviennent les combos du build.
 *
 * Et contrat de `itemTile` (`ui/gear-view.mjs`, idem) — la tuile d'item du même
 * onglet : le cadre de rareté, les étoiles, l'icône d'effet et celle de classe.
 *
 * Et contrat de l'APERÇU du même onglet : les refus de `previewGearBuilds` et
 * `previewHtml` (`ui/gear-view.mjs`), qui fait d'un build résolu ce que la fiche
 * perso montrera. La résolution elle-même est dans `gear-preview.test.ts` : elle
 * exige la garde `IS_DEV` de l'admin, fausse ici.
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
  previewGearBuilds,
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
import { composeSetCombos, splitSetCombos } from './ui/gear-sets.mjs';
import {
  gameText,
  gradeColor,
  groupCombos,
  itemName,
  itemTile,
  noteHtml,
  previewHtml,
  setGrid,
  setRow,
  shownPieces,
} from './ui/gear-view.mjs';

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

  it('les listes portent leur icône : c’est l’image des tuiles des pickers', () => {
    for (const slot of ['weapons', 'amulets', 'talismans', 'sets'] as const) {
      expect(state.options[slot].length, slot).toBeGreaterThan(0);
      expect(
        state.options[slot].filter((o) => !o.icon).map((o) => o.label),
        slot,
      ).toEqual([]);
    }
  });

  it('une pièce porte ce que sa tuile montre : grade, étoiles, icône d’effet', () => {
    const { weapons, amulets, talismans } = state.options;
    for (const o of [...weapons, ...amulets, ...talismans]) {
      expect(['normal', 'magic', 'rare', 'unique'], o.label).toContain(o.grade);
      expect(o.star, o.label).toBeGreaterThan(0);
    }

    // Une arme unique 6★ à passif : l'icône d'effet de son premier palier.
    const sword = weapons.find((o) => o.label === 'Surefire Greatsword');
    expect(sword).toMatchObject({ grade: 'unique', star: 6, classLimits: ['striker'] });
    expect(sword?.overlayIcon).toMatch(/^TI_Icon_UO_Weapon_/);
    expect(sword?.mode).toBeUndefined();
    // Sans passif : pas d'icône d'effet.
    const steel = weapons.find((o) => o.label === 'Steel Sword');
    expect(steel).toMatchObject({ grade: 'rare', star: 6 });
    expect(steel?.overlayIcon).toBeUndefined();
    // Une variante de classe porte SON passif, sous son id à elle.
    const briareos = weapons.filter((o) => /^Briareos's Recklessness \[/.test(o.label));
    expect(briareos).toHaveLength(5);
    expect(new Set(briareos.map((o) => o.id)).size).toBe(5);
    for (const o of briareos) {
      expect(o.classLimits, o.label).toHaveLength(1);
      expect(o.overlayIcon, o.label).toBeTruthy();
    }
  });

  it('un talisman dit son type de points', () => {
    const { talismans } = state.options;
    expect(talismans.filter((o) => o.mode !== 'AP' && o.mode !== 'CP')).toEqual([]);
    const ap = talismans.find((o) => o.mode === 'AP');
    expect(ap).toMatchObject({ grade: 'unique', star: 6 });
    expect(ap?.overlayIcon).toMatch(/^TI_Icon_UO_Talisman_/);
    expect(talismans.some((o) => o.mode === 'CP')).toBe(true);
  });

  it('un set porte son icône, ses quatre pièces et ses bonus — Revenge et Patience sans 2 pièces', () => {
    const { sets } = state.options;
    for (const o of sets) {
      expect(o.setIcon, o.label).toMatch(/^TI_Icon_Set_/);
      expect(o.setIcon, o.label).toBe(o.icon);
      expect(o.pieceIcons, o.label).toHaveLength(4);
      // helmet, armor, gloves, shoes : l'ordre des tuiles d'un combo.
      for (const [i, part] of ['Helmet', 'Armor', 'Gloves', 'Shoes'].entries())
        expect(o.pieceIcons?.[i], o.label).toContain(part);
      expect(o.has2P, o.label).toBe(Boolean(o.p2));
    }

    // Le bonus 2 pièces de Speed n'existe qu'au dernier palier : c'est lui qui est servi.
    const speed = sets.find((o) => o.label === 'Speed Set');
    expect(speed).toMatchObject({ has2P: true });
    expect(speed?.p2).toMatch(/^Speed \+\d+%$/);
    expect(speed?.p4).toMatch(/^Speed \+\d+%$/);

    const alone = sets.filter((o) => !o.has2P).map((o) => o.label);
    expect(alone).toEqual(['Patience Set', 'Revenge Set']);
    for (const o of sets.filter((x) => !x.has2P)) {
      expect(o.p2, o.label).toBeUndefined();
      expect(o.p4, o.label).toContain('proportional to missing Health');
    }
  });

  it('l’état porte les icônes de stat : les puces de l’aperçu', () => {
    expect(state.statIcons['ATK%']).toBe(state.statIcons.ATK);
    for (const sprite of Object.values(state.statIcons)) expect(sprite).toMatch(/^CM_Stat_Icon_/);
  });
});

describe('previewGearBuilds — les refus de l’aperçu', () => {
  it('une forme fausse est RENDUE, jamais levée : la route en fait un 400', async () => {
    for (const bad of [undefined, null, 'x', {}, [{}], [null], [{ name: 'x', weapons: 'y' }]]) {
      const out = await previewGearBuilds(bad, 'en');
      expect(out, JSON.stringify(bad)).toEqual({ error: expect.any(String) });
    }
    expect(await previewGearBuilds([{ weapons: [] }], 'en')).toEqual({
      error: expect.stringMatching(/^build 1 · nom : /),
    });
    expect(await previewGearBuilds([{ name: 'x' }, { name: 'y', sets: 3 }], 'en')).toEqual({
      error: expect.stringMatching(/^build 2 · sets : /),
    });
  });

  it('coupé par la garde IS_DEV (ici, sous vitest) : une erreur, pas zéro build en silence', async () => {
    expect(await previewGearBuilds([{ name: 'x' }], 'en')).toEqual({
      error: expect.stringContaining('IS_DEV'),
    });
  });
});

describe('itemTile — la tuile d’item de gear-view', () => {
  const env = {
    imgBase: 'https://img.test',
    esc: (v: unknown) =>
      String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'),
  };
  const count = (html: string, needle: string) => html.split(needle).length - 1;

  it('unique 6★ à effet, d’une seule classe : son cadre, six étoiles, les deux overlays', () => {
    const html = itemTile(
      env,
      {
        icon: 'TI_Equipment_Weapon_06',
        grade: 'unique',
        star: 6,
        overlayIcon: 'TI_Icon_UO_Weapon_11',
        classLimits: ['striker'],
      },
      64,
    );
    expect(html).toContain('style="width:64px;height:64px"');
    expect(html).toContain('src="https://img.test/images/ui/bg/TI_Slot_Unique.webp"');
    expect(html).toContain('src="https://img.test/images/equipment/TI_Equipment_Weapon_06.webp"');
    expect(count(html, 'images/ui/star/CM_icon_star_y.webp')).toBe(6);
    // 18 % de 64 px, arrondi ; chevauchement de 30 %, sauf la première.
    expect(count(html, 'width="12" height="12"')).toBe(6);
    expect(count(html, 'margin-left:-3.6px')).toBe(5);
    expect(html).toContain(
      'class="gv-fx" src="https://img.test/images/equipment/TI_Icon_UO_Weapon_11.webp"',
    );
    expect(html).toContain(
      'class="gv-cls" src="https://img.test/images/ui/class/IG_Turn_Class_Striker.webp"',
    );
    expect(count(html, '<img')).toBe(10);
  });

  it('normale sans passif : ni overlay, ni étoile en trop', () => {
    const html = itemTile(env, { icon: 'TI_Equipment_Weapon_01', grade: 'normal', star: 1 }, 44);
    expect(html).toContain('images/ui/bg/TI_Slot_Normal.webp');
    expect(count(html, 'CM_icon_star_y')).toBe(1);
    // 18 % de 44 px : 8 px, le plancher.
    expect(html).toContain('width="8" height="8"');
    expect(html).not.toContain('margin-left');
    expect(html).not.toContain('gv-fx');
    expect(html).not.toContain('gv-cls');
    expect(count(html, '<img')).toBe(3);
  });

  it('pas d’icône de classe sur une pièce libre ou ouverte à plusieurs classes', () => {
    const tile = (classLimits: string[]) =>
      itemTile(env, { icon: 'x', grade: 'rare', star: 6, classLimits }, 64);
    expect(tile([])).not.toContain('gv-cls');
    expect(tile(['striker', 'mage'])).not.toContain('gv-cls');
    expect(tile(['healer'])).toContain('IG_Turn_Class_Healer.webp');
    expect(tile([])).toContain('TI_Slot_Rare.webp');
  });

  it('une pièce inconnue : sa place vide, à la taille ; un grade inconnu : le cadre normal', () => {
    for (const none of [undefined, {}, { grade: 'unique', star: 6 }]) {
      const html = itemTile(env, none, 44);
      expect(html).toContain('class="gv-tile none" style="width:44px;height:44px"');
      expect(html).not.toContain('<img');
    }
    expect(itemTile(env, { icon: 'x', grade: 'mythic' }, 44)).toContain('TI_Slot_Normal.webp');
    expect(itemTile(env, { icon: 'x', grade: 'unique' }, 44)).not.toContain('gv-stars');
  });

  it('échappe ce qu’il pose dans le HTML', () => {
    const html = itemTile({ ...env, imgBase: 'https://a"b' }, { icon: '"><i>' }, 44);
    expect(html).not.toContain('"><i>');
    expect(html).toContain('https://a&quot;b/images/equipment/&quot;>&lt;i>.webp');
    expect(itemName(env, '<b>Sword</b>', 'unique')).toBe(
      '<span class="gv-name" style="color:var(--item-legendary)">&lt;b>Sword&lt;/b></span>',
    );
  });

  it('le nom prend le jeton de son grade (`GRADE_TEXT` du site)', () => {
    expect(['normal', 'magic', 'rare', 'unique', 'mythic', undefined].map(gradeColor)).toEqual([
      'var(--item-normal)',
      'var(--item-superior)',
      'var(--item-epic)',
      'var(--item-legendary)',
      '',
      '',
    ]);
    expect(itemName(env, 'Sword', undefined, 'g-n')).toBe('<span class="g-n">Sword</span>');
  });

  it('un set : quatre pièces en cadre unique, l’icône du set sur chacune', () => {
    const set = {
      setIcon: 'TI_Icon_Set_Enchant_15',
      pieceIcons: ['Helmet_06', 'Armor_06', 'Gloves_06', 'Shoes_06'],
    };
    const grid = setGrid(env, set);
    expect(grid.startsWith('<span class="gv-set">')).toBe(true);
    expect(count(grid, 'TI_Slot_Unique.webp')).toBe(4);
    expect(
      count(
        grid,
        'class="gv-fx" src="https://img.test/images/equipment/TI_Icon_Set_Enchant_15.webp"',
      ),
    ).toBe(4);
    expect(count(grid, 'width:34px;height:34px')).toBe(4);
    expect(grid).not.toContain('gv-stars');
    const order = set.pieceIcons.map((icon) => grid.indexOf(`equipment/${icon}.webp`));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(order.every((at) => at > 0)).toBe(true);

    // Dans un combo : helmet + armor pour le premier set, gloves + shoes ensuite ;
    // joué à 4, les quatre.
    expect([shownPieces(4, 0), shownPieces(2, 0), shownPieces(2, 1), shownPieces(2, 2)]).toEqual([
      [0, 1, 2, 3],
      [0, 1],
      [2, 3],
      [2, 3],
    ]);
    const head = setRow(env, set, { count: 2, idx: 0 });
    expect(count(head, 'width:32px;height:32px')).toBe(2);
    expect(head).toContain('Helmet_06');
    expect(head).toContain('Armor_06');
    expect(head).not.toContain('Gloves_06');
    const tail = setRow(env, set, { count: 2, idx: 1 });
    expect(tail).toContain('Gloves_06');
    expect(tail).toContain('Shoes_06');
    expect(tail).not.toContain('Helmet_06');
    expect(count(setRow(env, set, { count: 4, idx: 0 }), 'TI_Slot_Unique.webp')).toBe(4);
    // Un set que les listes ne connaissent pas : une place vide.
    expect(setRow(env, undefined, { count: 2, idx: 0 })).toBe(
      `<span class="gv-row">${itemTile(env, undefined, 32)}</span>`,
    );
  });
});

describe('previewHtml — l’aperçu d’un build de gear-view', () => {
  const env = {
    imgBase: 'https://img.test',
    esc: (v: unknown) =>
      String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'),
  };
  const count = (html: string, needle: string) => html.split(needle).length - 1;
  const labels = {
    weapon: 'Weapon',
    amulet: 'Accessory',
    talisman: 'Talisman',
    set: 'Armor Set',
    substatPrio: 'Substat Priority',
    note: 'Notes',
    piece2: '2 pieces',
    piece4: '4 pieces',
  };
  const statIcons = { 'ATK%': 'CM_Stat_Icon_ATK', CHD: 'CM_Stat_Icon_CRITICAL_DMG' };
  const empty = {
    weapons: [],
    amulets: [],
    talismans: [],
    sets: [],
    setEffects: [],
    noteSegments: [],
  };
  const set = (id: string, name: string, n: number) => ({
    id,
    name,
    icon: `Enchant_${id}`,
    pieceIcons: ['Helmet', 'Armor', 'Gloves', 'Shoes'],
    count: n,
  });

  it('une balise morte (`unknown`) sort dans un élément rouge, son texte échappé', () => {
    expect(noteHtml(env, [{ t: 'unknown', s: '{B/<nope>}' }])).toBe(
      '<span class="pv-unknown">{B/&lt;nope>}</span>',
    );
    // Un type de segment que le module ne connaît pas : rouge aussi, jamais muet.
    expect(noteHtml(env, [{ t: 'later' }])).toBe('<span class="pv-unknown">{later}</span>');
  });

  it('le texte tel quel, un `br` en `<br>`', () => {
    expect(noteHtml(env, [{ t: 'text', s: 'a <b> & c' }, { t: 'br' }, { t: 'text', s: 'd' }])).toBe(
      'a &lt;b> &amp; c<br>d',
    );
    expect(noteHtml(env, [])).toBe('');
  });

  it('un `item` : son cadre, son icône et son nom dans la classe du grade ; la desc en `title`', () => {
    // Tel que le site le rend : avec le lien que l'aperçu ne pose pas.
    const segment = {
      t: 'item',
      name: 'Surefire Greatsword',
      iconSrc: '/images/equipment/TI_Equipment_Weapon_06.webp',
      grade: 'unique',
      color: 'text-item-legendary',
      href: '/equipment/surefire-greatsword',
      desc: 'Deals <color=#28d9ed>2%</color> more\\nto "one" target',
    };
    const html = noteHtml(env, [segment]);
    expect(html.startsWith('<span class="pv-seg text-item-legendary" title="')).toBe(true);
    expect(html).toContain('title="Deals 2% more\nto &quot;one&quot; target"');
    expect(html).toContain('src="https://img.test/images/ui/bg/TI_Slot_Unique.webp"');
    // Une adresse relative du site passe sous `imgBase`.
    expect(html).toContain('src="https://img.test/images/equipment/TI_Equipment_Weapon_06.webp"');
    expect(html).toContain('<span class="pv-u">Surefire Greatsword</span>');
    // Rien de cliquable dans l'aperçu.
    expect(html).not.toContain('href');
    expect(html).not.toContain('<a');
  });

  it('`icon`, `effect`, `stat` : icône + libellé dans la couleur du site', () => {
    const fire = noteHtml(env, [
      { t: 'icon', label: 'Fire', color: 'text-fire', icon: 'https://cdn.test/f.webp' },
    ]);
    expect(fire).toBe(
      '<span class="pv-seg text-fire"><img class="pv-ico" src="https://cdn.test/f.webp" alt="" width="18" height="18" />Fire</span>',
    );
    // Sans icône (un perso, un lien) : le libellé, souligné comme sur le site.
    expect(noteHtml(env, [{ t: 'icon', label: 'Aer', color: 'text-buff', underline: true }])).toBe(
      '<span class="pv-seg text-buff"><span class="pv-u">Aer</span></span>',
    );

    const stun = noteHtml(env, [
      { t: 'effect', label: 'Stunned', color: 'text-debuff', icon: 'IG_Stun', isDebuff: true },
    ]);
    expect(stun).toContain('<span class="pv-seg text-debuff">');
    expect(stun).toContain(
      '<span class="pv-fx debuff"><img src="https://img.test/images/ui/effect/IG_Stun.webp" alt="" /></span>',
    );
    expect(
      noteHtml(env, [{ t: 'effect', label: 'Up', color: 'text-buff', icon: 'x', isDebuff: false }]),
    ).toContain('class="pv-fx buff"');

    const atk = noteHtml(env, [
      { t: 'stat', name: 'Attack', iconSrc: '/images/ui/stat/CM_Stat_Icon_ATK.webp' },
    ]);
    expect(atk).toContain('<span class="pv-seg text-stat">');
    expect(atk).toContain('src="https://img.test/images/ui/stat/CM_Stat_Icon_ATK.webp"');

    // Une classe de couleur qui n'en est pas une n'entre pas dans le HTML.
    expect(noteHtml(env, [{ t: 'icon', label: 'x', color: 'a" onclick="b' }])).toBe(
      '<span class="pv-seg">x</span>',
    );
  });

  it('un texte du jeu : `<color=#…>` en span coloré, `\\n` littéraux en sauts de ligne', () => {
    expect(gameText(env, 'a <color=#ff0000>x</color> b')).toBe(
      'a <span style="color:#ff0000">x</span> b',
    );
    expect(gameText(env, 'a\\nb\n<Color=#28d9ed>c\\nd</Color> <e>')).toBe(
      'a<br>b<br><span style="color:#28d9ed">c<br>d</span> &lt;e>',
    );
    // Une couleur qui n'est pas un `#hex` reste du texte.
    expect(gameText(env, '<color=red>x</color>')).toBe('&lt;color=red>x&lt;/color>');
  });

  it('une pièce : sa tuile de 44 px, son nom au grade, ses stats en puces', () => {
    const html = previewHtml(
      env,
      {
        ...empty,
        weapons: [
          {
            id: '4',
            name: 'Surefire Greatsword',
            icon: 'TI_Equipment_Weapon_06',
            grade: 'unique',
            star: 6,
            overlayIcon: 'TI_Icon_UO_Weapon_11',
            classType: 'striker',
            mainStat: 'ATK%/CHD/WG',
          },
        ],
      },
      labels,
      statIcons,
    );
    expect(html.startsWith('<div class="pv-row"><span class="pv-lbl">Weapon</span>')).toBe(true);
    expect(html).toContain('class="gv-tile" style="width:44px;height:44px"');
    expect(html).toContain('images/ui/bg/TI_Slot_Unique.webp');
    expect(html).toContain('images/ui/class/IG_Turn_Class_Striker.webp');
    expect(count(html, 'CM_icon_star_y')).toBe(6);
    expect(html).toContain(
      '<span class="pv-name" style="color:var(--item-legendary)">Surefire Greatsword</span>',
    );
    expect(count(html, 'class="pv-chip"')).toBe(3);
    expect(html).toContain(
      '<img src="https://img.test/images/ui/stat/CM_Stat_Icon_ATK.webp" alt="" width="14" height="14" />ATK%',
    );
    // Une stat sans icône (la WG) : son abréviation seule.
    expect(html).toContain('<span class="pv-chip">WG</span>');
    // Que la rangée des armes : rien d'autre n'a de contenu.
    expect(count(html, 'class="pv-row')).toBe(1);
  });

  it('une pièce `unresolved` : son id en rouge, sans tuile', () => {
    const html = previewHtml(
      env,
      {
        ...empty,
        amulets: [{ id: 'nope', name: 'nope', mainStat: 'PEN%', unresolved: true }],
        talismans: [{ id: '$zz', name: '', unresolved: true }],
      },
      labels,
      statIcons,
    );
    expect(html).toContain('<span class="pv-lbl">Accessory</span>');
    expect(html).toContain('<p class="pv-bad">nope</p>');
    expect(html).toContain('<p class="pv-bad">$zz</p>');
    expect(html).not.toContain('gv-tile');
    expect(html).not.toContain('pv-chip');
  });

  it('les combos en lignes, comme la fiche : un set partagé regroupe ses seconds', () => {
    const [pen, spd, atk, crit] = [
      set('p', 'Penetration Set', 2),
      set('s', 'Speed Set', 2),
      set('a', 'Attack Set', 2),
      set('c', 'Critical Strike Set', 4),
    ];
    // Le set le plus partagé passe en tête, même cité second ; un 4 pièces fait sa ligne.
    const lines = groupCombos([[spd, pen], [pen, atk], [crit], []]);
    expect(lines.map((l) => [l.head.id, l.tails.map((t) => t.id)])).toEqual([
      ['p', ['s', 'a']],
      ['c', []],
    ]);

    const html = previewHtml(
      env,
      {
        ...empty,
        sets: [[spd, pen], [pen, atk], [crit]],
        setEffects: [
          { id: 'p', name: 'Penetration Set', maxCount: 2, effect2: 'Pen +11%', effect4: 'no' },
          {
            id: 'c',
            name: 'Critical Strike Set',
            maxCount: 4,
            effect2: 'Crit +<color=#ff0000>x</color>',
            effect4: 'Crit DMG\\n+33%',
          },
        ],
      },
      labels,
      statIcons,
    );
    expect(html).toContain('<div class="pv-row pv-sets"><span class="pv-lbl">Armor Set</span>');
    expect(count(html, 'class="pv-combo"')).toBe(2);
    // Ligne 1 : helmet + armor du premier set, gloves + shoes UNE fois, sans
    // l'icône d'un set en overlay (deux seconds), leurs noms avec la leur.
    const [, first, second] = html.split('class="pv-combo"');
    expect(count(first, 'width:32px;height:32px')).toBe(4);
    expect(count(first, 'equipment/Enchant_p.webp')).toBe(2);
    expect(first).not.toContain('equipment/Enchant_s.webp');
    expect(first).toContain('images/ui/effect/Enchant_s.webp');
    expect(first).toContain('images/ui/effect/Enchant_a.webp');
    expect(first).not.toContain('4 pieces');
    // Ligne 2 : les quatre pièces, « · 4 pieces ».
    expect(count(second.split('pv-legend')[0], 'width:32px;height:32px')).toBe(4);
    expect(second).toContain('<span class="pv-dim">· 4 pieces</span>');
    // La légende : le 4 pièces seulement pour le set joué à 4 ; un bonus coloré.
    expect(html).toContain('<span class="pv-count text-buff">2 pieces</span> Pen +11%');
    expect(html).not.toContain('>no<');
    expect(html).toContain('Crit +<span style="color:#ff0000">x</span>');
    expect(html).toContain('<span class="pv-count text-buff">4 pieces</span> Crit DMG<br>+33%');
  });

  it('un build tout en 2 pièces : la légende sans le préfixe « 2 pieces »', () => {
    const html = previewHtml(
      env,
      {
        ...empty,
        sets: [[set('p', 'Penetration Set', 2), set('s', 'Speed Set', 2)]],
        setEffects: [{ id: 'p', name: 'Penetration Set', maxCount: 2, effect2: 'Pen +11%' }],
      },
      labels,
      statIcons,
    );
    expect(html).toContain('<p>Pen +11%</p>');
    expect(html).not.toContain('pv-count');
    // Un seul second set : ses tuiles gardent son icône, son nom n'en a pas.
    expect(count(html, 'equipment/Enchant_s.webp')).toBe(2);
    expect(html).not.toContain('images/ui/effect/');
  });

  it('les substats en texte, la note en segments ; un build vide ne rend rien', () => {
    const html = previewHtml(
      env,
      { ...empty, substats: 'ATK>CHC', noteSegments: [{ t: 'unknown', s: '{B/nope}' }] },
      labels,
      statIcons,
    );
    expect(html).toBe(
      '<div class="pv-row"><span class="pv-lbl">Substat Priority</span><div class="pv-cell"><span class="pv-sub">ATK>CHC</span></div></div>' +
        '<div class="pv-row"><span class="pv-lbl">Notes</span><div class="pv-cell"><p class="pv-note"><span class="pv-unknown">{B/nope}</span></p></div></div>',
    );
    expect(previewHtml(env, empty, labels, statIcons)).toBe('');
  });
});

describe('composeSetCombos — le mix du picker de sets', () => {
  it('principal seul : un combo, ses 4 pièces', () => {
    expect(composeSetCombos('speed', [])).toEqual({
      combos: [[{ set: 'speed', count: 4 }]],
      error: '',
    });
  });

  it('principal et deux secondaires : deux combos 2 + 2, dans l’ordre des secondaires', () => {
    expect(composeSetCombos('speed', ['pen', 'atk'])).toEqual({
      combos: [
        [
          { set: 'speed', count: 2 },
          { set: 'pen', count: 2 },
        ],
        [
          { set: 'speed', count: 2 },
          { set: 'atk', count: 2 },
        ],
      ],
      error: '',
    });
    // Un secondaire cité deux fois ne fait pas deux combos.
    expect(composeSetCombos('speed', ['pen', 'pen']).combos).toHaveLength(1);
  });

  it('refuse un secondaire qui est le principal, et un mix sans principal', () => {
    const twice = composeSetCombos('speed', ['pen', 'speed']);
    expect(twice.combos).toEqual([]);
    expect(twice.error).toContain('principal');
    expect(composeSetCombos('', ['pen'])).toEqual({ combos: [], error: 'pas de set principal' });
  });

  it('se relit : les combos composés redonnent le principal et les secondaires', () => {
    for (const [main, secondaries] of [
      ['speed', []],
      ['speed', ['pen']],
      ['speed', ['pen', 'atk', 'crit']],
    ] as const)
      expect(splitSetCombos(composeSetCombos(main, secondaries).combos)).toEqual({
        main,
        secondaries: [...secondaries],
      });
  });

  it('ne lit pas comme un mix ce qui n’en est pas un', () => {
    const none = { main: '', secondaries: [] };
    const two = (a: string, b: string) => [
      { set: a, count: 2 },
      { set: b, count: 2 },
    ];
    expect(splitSetCombos([])).toEqual(none);
    expect(splitSetCombos([[]])).toEqual(none);
    expect(splitSetCombos([[{ set: 'speed', count: 2 }]])).toEqual(none);
    // Deux combos sans set commun, puis un 4 pièces à côté d'un 2 + 2.
    expect(splitSetCombos([two('speed', 'pen'), two('atk', 'crit')])).toEqual(none);
    expect(splitSetCombos([[{ set: 'speed', count: 4 }], two('speed', 'pen')])).toEqual(none);
    // Le set commun n'est pas forcément cité en premier.
    expect(splitSetCombos([two('pen', 'speed'), two('speed', 'atk')])).toEqual({
      main: 'speed',
      secondaries: ['pen', 'atk'],
    });
  });

  it('un preset de sets du fichier, relu puis recomposé, est replié sous un preset', () => {
    const presets = loadGearPresets();
    const key = (pieces: { set: string; count: number }[]) =>
      pieces
        .map((p) => `${p.set}:${p.count}`)
        .sort()
        .join('|');
    const mixes = Object.entries(presets.sets)
      .map(([slug, pieces]) => ({ slug, pieces, ...splitSetCombos([pieces]) }))
      .filter((m) => m.main);
    expect(mixes.length).toBeGreaterThan(0);

    for (const { slug, pieces, main, secondaries } of mixes) {
      const { combos } = composeSetCombos(main, secondaries);
      expect(combos.map(key), slug).toEqual([key(pieces)]);
      // Le store le range sous un preset de même contenu (pas forcément ce slug :
      // deux presets peuvent se valoir).
      const back = collapseBuild({ name: slug, sets: [{ pieces: combos[0] }] }, presets);
      expect(key(presets.sets[back.sets?.[0].preset ?? ''] ?? []), slug).toBe(key(pieces));
    }
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
