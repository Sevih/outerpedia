import { describe, expect, it } from 'vitest';
import encountersData from '@data/generated/encounters.json';
import type { DungeonRef } from '@contracts';
import { makeT } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import en from '@/i18n/locales/en';
import jp from '@/i18n/locales/jp';
import kr from '@/i18n/locales/kr';
import zh from '@/i18n/locales/zh';
import fr from '@/i18n/locales/fr';
import {
  difficultyLabel,
  encounterSpawnContexts,
  encountersOfGroup,
  groupCombatants,
  hardestDifficultyLabel,
} from '@/lib/data/encounters';
import { getMonster } from '@/lib/data/monsters';
import { lootDetails, pursuitLoot, resolveRewardTable, stageLoot } from '@/lib/data/rewards';
import { monsterPanelStats, orderedStats } from '@/lib/monster-stats';

/**
 * Un guide désigne un COMBAT (`group`), et les difficultés en découlent. Trois
 * choses doivent tenir pour que ça vaille mieux qu'un `bossId` écrit à la main :
 * l'ordre, les libellés dans les CINQ langues (le jeu n'en parle que quatre), et
 * la stabilité de la grille de stats quand on change d'onglet.
 */
const MSG = { en, jp, kr, zh, fr } as Record<Lang, typeof en>;
const LANGS: Lang[] = ['en', 'jp', 'kr', 'zh', 'fr'];

const GROUPS = [
  ...new Set(
    Object.values(encountersData as Record<string, { group?: string }>)
      .map((d) => d.group)
      .filter(Boolean) as string[],
  ),
];

/** Le combat des guides Joint Challenge portés — Annihilator. */
const JC_ANNIHILATOR = 'event_boss:SYS_EVENT_BOSS_DUNGEON_0001';

describe('encountersOfGroup — un combat, ses difficultés', () => {
  it('la donnée porte bien des combats', () => {
    expect(GROUPS.length).toBeGreaterThan(20);
  });

  it("les trois difficultés d'un Joint Challenge, dans l'ordre du jeu", () => {
    const encs = encountersOfGroup(JC_ANNIHILATOR);
    expect(encs.map((e) => e.ref.difficulty?.key)).toEqual(['normal', 'hard', 'very_hard']);
    // Un monstre DIFFÉRENT par difficulté — c'est tout l'enjeu : un `bossId`
    // unique n'en retenait qu'un, et les deux autres n'existaient nulle part.
    const ids = encs.flatMap((e) => e.monsters.map((m) => m.id));
    expect(new Set(ids).size).toBe(3);
    expect(encs.map((e) => e.monsters[0].level)).toEqual([25, 80, 120]);
  });

  it('trie sur `difficulty.order`, jamais sur les identifiants', () => {
    for (const g of GROUPS) {
      const orders = encountersOfGroup(g).map((e) => e.ref.difficulty?.order ?? 0);
      expect(
        [...orders].sort((a, b) => a - b),
        `combat ${g}`,
      ).toEqual(orders);
    }
  });

  it('ne rend que des donjons PEUPLÉS (un donjon sans monstre n’est pas une rencontre)', () => {
    for (const g of GROUPS) {
      for (const e of encountersOfGroup(g)) expect(e.monsters.length).toBeGreaterThan(0);
    }
  });
});

describe('difficultyLabel — le jeu ne parle pas français', () => {
  it('résout toute difficulté dans les 5 langues, sans jamais laisser fuir une clé', () => {
    // On n'exige un libellé que là où il s'AFFICHE : un combat à plusieurs
    // rencontres, dont `BossEncounters` pose les onglets. Un combat SOLITAIRE
    // n'a pas de difficulté — pas parce qu'elle manquerait, mais parce qu'il n'y
    // a rien à départager : l'Adventure License tient son échelle dans les RANGS
    // d'un donjon unique (la glissière de la carte de boss), pas dans des donjons
    // frères. Lui inventer un « Normal » serait un libellé qui ne veut rien dire,
    // et l'onglet ne serait de toute façon jamais rendu.
    for (const g of GROUPS) {
      const encounters = encountersOfGroup(g);
      if (encounters.length < 2) continue;
      for (const e of encounters) {
        for (const lang of LANGS) {
          const label = difficultyLabel(e.ref, lang, makeT(MSG[lang]));
          expect(label, `${e.id} [${lang}]`).toBeTruthy();
          expect(label, `${e.id} [${lang}]`).not.toMatch(/^guides\.difficulty\./);
          expect(label, `${e.id} [${lang}]`).not.toMatch(/^(stage|league)_\d+$/);
        }
      }
    }
  });

  it('le vocabulaire du JEU prime dans les langues que le jeu parle', () => {
    const [, , vh] = encountersOfGroup(JC_ANNIHILATOR);
    expect(difficultyLabel(vh.ref, 'en', makeT(MSG.en))).toBe('Very Hard');
    expect(difficultyLabel(vh.ref, 'fr', makeT(MSG.fr))).toBe('Très difficile');
  });

  it('`stage_N` est un GABARIT — le guild raid monte à 10, pas à 3', () => {
    const gr = encountersOfGroup('guild_raid:SYS_TITLE_GUILD_RAID_SEASON2_MAIN');
    const keys = gr.map((e) => e.ref.difficulty?.key);
    expect(keys).toContain('stage_10');
    const last = gr[gr.length - 1];
    expect(difficultyLabel(last.ref, 'fr', makeT(MSG.fr))).toBe('Étape 10');
    expect(difficultyLabel(last.ref, 'en', makeT(MSG.en))).toBe('Stage 10');
  });

  it('la difficulté la plus dure est celle que le guide cible', () => {
    expect(hardestDifficultyLabel(JC_ANNIHILATOR, 'fr', makeT(MSG.fr))).toBe('Très difficile');
  });
});

/**
 * ADVENTURE LICENSE — une échelle de STAGES, pas de grades.
 *
 * Trois pièges, tous invisibles à l'écran s'ils passent :
 *  - le stage est la colonne `Level` du jeu, pas le rang de la ligne : un boss
 *    n'entre en rotation qu'à partir d'un certain stage (Anubis au 8) et ses
 *    stats sont celles de CE stage ;
 *  - la table redéclare le même stage sous chaque palier de licence qui le
 *    contient (68 doublons sur 243 lignes) — sans dédup, Masterless afficherait
 *    15 paliers pour 10 stages ;
 *  - un stage n'est pas un grade : lui donner un `name` le ferait passer pour
 *    tel, et le badge (`CM_Event_Rank_<name>`) serait une image morte.
 */
describe('adventure license — des stages numérotés, dédupliqués, croissants', () => {
  const AL = Object.values(encountersData as Record<string, DungeonRef>).filter(
    (d) => d.mode === 'adventure_mission' || d.mode === 'adventure_challenge',
  );

  it('tout palier porte un STAGE et aucun nom de grade (pas de badge à inventer)', () => {
    expect(AL).toHaveLength(29);
    for (const d of AL) {
      expect(d.ranks?.length, d.name.en).toBeGreaterThan(0);
      for (const r of d.ranks!) {
        expect(r.stage, d.name.en).toBeGreaterThan(0);
        expect(r.name, d.name.en).toBeUndefined();
      }
    }
  });

  it('les stages sont uniques et croissants, et ne commencent pas tous à 1', () => {
    for (const d of AL) {
      const stages = d.ranks!.map((r) => r.stage!);
      expect(new Set(stages).size, `${d.name.en} : doublons`).toBe(stages.length);
      expect(stages, `${d.name.en} : ordre`).toEqual([...stages].sort((a, b) => a - b));
    }
    // Anubis (70600018) n'existe qu'en fin d'échelle : 8, 9, 10.
    const anubis = (encountersData as Record<string, DungeonRef>)['70600018'];
    expect(anubis.ranks!.map((r) => r.stage)).toEqual([8, 9, 10]);
    // Masterless (70600000), lui, est là dès le premier stage.
    const masterless = (encountersData as Record<string, DungeonRef>)['70600000'];
    expect(masterless.ranks!.map((r) => r.stage)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('le stage fixe le niveau du boss — plus le stage est haut, plus il est fort', () => {
    for (const d of AL) {
      const levels = d.ranks!.map((r) => r.level!);
      expect(levels, `${d.name.en} : niveaux`).toEqual([...levels].sort((a, b) => a - b));
    }
  });
});

describe('world boss — quatre ligues, une échelle de rangs qui ENJAMBE les boss', () => {
  const WB_GROUPS = GROUPS.filter((g) => g.startsWith('world_boss:'));

  it('six combats, quatre ligues chacun, les hautes alignent DEUX boss', () => {
    expect(WB_GROUPS).toHaveLength(6);
    for (const g of WB_GROUPS) {
      const encs = encountersOfGroup(g);
      expect(
        encs.map((e) => e.ref.difficulty?.key),
        g,
      ).toEqual(['league_1', 'league_2', 'league_3', 'league_4']);
      // Ligues 3 et 4 : deux boss DISTINCTS dans le même combat — le boss 1 se
      // joue jusqu'au rang A, atteindre S le fait TRANSITIONNER en boss 2. La
      // V2 codait ces ids à la main (`boss1Ids`/`boss2Ids`), ici ils
      // descendent du donjon.
      expect(
        encs.map((e) => e.monsters.length),
        g,
      ).toEqual([1, 1, 2, 2]);
      const ids = encs.flatMap((e) => e.monsters.map((m) => m.id));
      expect(new Set(ids).size, g).toBe(6);
    }
  });

  it("l'échelle D→SSS se PARTAGE entre les boss successifs, sans trou ni doublon", () => {
    // Le boss 1 n'existe pas au rang S, le boss 2 n'existe pas au rang D :
    // chaque carte ne doit porter QUE ses propres rangs, et leur réunion doit
    // couvrir l'échelle entière. Le découpage se lit au niveau de base du boss
    // (= niveau de son premier palier) — si ce test casse, soit la convention
    // du jeu a changé, soit chaque boss réaffiche l'échelle des autres.
    for (const g of WB_GROUPS) {
      for (const e of encountersOfGroup(g)) {
        const perMonster = e.monsters.map((m) => encounterSpawnContexts(e, m, 'en'));
        // Réunion = l'échelle du donjon, dans l'ordre, sans chevauchement.
        const together = perMonster.flat().map((c) => c.rank);
        expect(together, e.id).toEqual(e.ref.ranks?.map((r) => r.name));
        // Chaque boss démarre son segment À SON niveau de base.
        e.monsters.forEach((m, i) => {
          expect(perMonster[i][0].level, `${e.id} boss ${m.id}`).toBe(m.level);
        });
      }
    }
  });

  it('mode à SCORE : chaque palier porte une barre, jamais des PV de boss', () => {
    // Même piège que la Singularity (750 000 « PV » à SSS++) : `ranks[].hp`
    // d'un mode à score est la LARGEUR de la tranche de dégâts. Si ce test
    // casse, c'est que des PV inventés repartent à l'écran.
    for (const g of WB_GROUPS) {
      for (const e of encountersOfGroup(g)) {
        for (const m of e.monsters) {
          for (const c of encounterSpawnContexts(e, m, 'en')) {
            expect(c.bossHp, `${e.id} rang ${c.rank}`).toBeUndefined();
            expect(c.bar, `${e.id} rang ${c.rank}`).toBeGreaterThan(0);
            expect(c.damage, `${e.id} rang ${c.rank}`).toBeDefined();
            // L'adv du PALIER remplace celui du donjon (contrat extracteur).
            expect(c.adv, `${e.id} rang ${c.rank}`).toBeDefined();
          }
        }
      }
    }
  });
});

describe('special request — dix échelles de treize stages', () => {
  /** Les dix combats des guides Special Request portés (5 échelles × 2 modes). */
  const SR_GROUPS = GROUPS.filter((g) => g.startsWith('raid_1:') || g.startsWith('raid_2:'));

  it('cinq échelles par mode, treize stages chacune, clés en gabarit `stage_N`', () => {
    expect(SR_GROUPS.filter((g) => g.startsWith('raid_1:'))).toHaveLength(5);
    expect(SR_GROUPS.filter((g) => g.startsWith('raid_2:'))).toHaveLength(5);
    for (const g of SR_GROUPS) {
      const keys = encountersOfGroup(g).map((e) => e.ref.difficulty?.key);
      expect(keys, g).toEqual(Array.from({ length: 13 }, (_, i) => `stage_${i + 1}`));
    }
  });

  /** Les monstres de la VAGUE DU BOSS — ceux que `groupCombatants` retient. */
  const bossWave = (e: ReturnType<typeof encountersOfGroup>[number]) => {
    const mainWave = e.monsters.find((m) => m.role === 'boss' && m.hpLines)?.wave;
    return e.monsters.filter((m) => m.wave === mainWave);
  };

  describe('groupCombatants — la fusion des variants par contenu, vague du boss seule', () => {
    it('couvre chaque apparition de la vague du boss, exactement une fois', () => {
      for (const g of SR_GROUPS) {
        const encounters = encountersOfGroup(g);
        const combatants = groupCombatants(g, 'en');
        // Autant d'apparitions distribuées que la vague du boss en compte —
        // l'escorte d'ouverture (Spear-Wielders…) reste hors du guide…
        const appearances = encounters.reduce((n, e) => n + bossWave(e).length, 0);
        const covered = combatants.reduce((n, c) => n + c.stageIndexes.length, 0);
        expect(covered, g).toBe(appearances);
        // …et chaque stage reçoit son compte exact de cartes visibles.
        encounters.forEach((e, i) => {
          const visible = combatants.filter((c) => c.stageIndexes.includes(i));
          expect(visible.length, `${g} stage ${i + 1}`).toBe(bossWave(e).length);
        });
      }
    });

    it('fusionne réellement (sinon ce serait une carte par apparition)', () => {
      for (const g of SR_GROUPS) {
        const encounters = encountersOfGroup(g);
        const appearances = encounters.reduce((n, e) => n + bossWave(e).length, 0);
        // Strictement moins de cartes que d'apparitions : la fusion mord sur
        // chaque échelle (le gain exact dépend de combien le kit du boss
        // change en montant).
        expect(groupCombatants(g, 'en').length, g).toBeLessThan(appearances);
      }
    });

    it('un boss ouvre la page, les renforts ferment, le variant du stage max est représenté', () => {
      for (const g of SR_GROUPS) {
        const encounters = encountersOfGroup(g);
        const combatants = groupCombatants(g, 'en');
        expect(combatants[0].role, g).toBe('boss');
        // Boss puis adds — jamais entrelacés (décision d'affichage).
        const roles = combatants.map((c) => c.role).join(',');
        expect(roles, g).not.toMatch(/add.*boss/);
        // Le boss PRINCIPAL du stage le plus haut (celui que le guide vise) a
        // sa carte, et elle est bien visible à ce stage.
        const top = encounters[encounters.length - 1];
        const main = top.monsters.find((m) => m.role === 'boss' && m.hpLines);
        const card = combatants.find((c) => c.monsterId === main?.id);
        expect(card, `${g} : variant du stage max sans carte`).toBeDefined();
        expect(card!.stageIndexes, g).toContain(encounters.length - 1);
      }
    });

    it('le mode suiveur pointe, à chaque stage, un contexte au niveau du donjon', () => {
      for (const g of SR_GROUPS) {
        const encounters = encountersOfGroup(g);
        for (const c of groupCombatants(g, 'en')) {
          expect(Object.keys(c.spawnByStage), `${g} ${c.monsterId}`).toHaveLength(
            c.stageIndexes.length,
          );
          for (const i of c.stageIndexes) {
            const ctx = c.spawns[c.spawnByStage[i]];
            expect(ctx, `${g} ${c.monsterId} stage ${i + 1}`).toBeDefined();
            const levels = encounters[i].monsters.map((m) => m.level);
            expect(levels, `${g} ${c.monsterId} stage ${i + 1}`).toContain(ctx.level);
          }
        }
      }
    });

    it('un combat inconnu JETTE (guide qui pointe dans le vide)', () => {
      expect(() => groupCombatants('raid_1:N_EXISTE_PAS', 'en')).toThrow(/aucun donjon/);
    });
  });

  describe('le butin vient du glossaire, jamais d’une liste en dur', () => {
    it('chaque stage a sa table, résolue de bout en bout (monnaies, exp, items, équipement)', () => {
      for (const g of SR_GROUPS) {
        for (const e of encountersOfGroup(g)) {
          expect(e.ref.reward, e.id).toBeDefined();
          // `resolveRewardTable` est STRICT : une ligne irrésoluble jette. La
          // parcourir toute est le test — y compris or/exp, que les tables SR
          // portent toutes.
          const rows = resolveRewardTable(e.ref.reward!, 'en');
          expect(rows.length, e.id).toBeGreaterThan(3);
          for (const r of rows) {
            expect(r.name, `${e.id} : ligne sans nom`).toBeTruthy();
            expect(r.grade, `${e.id} : ${r.name} sans grade`).toBeTruthy();
          }
        }
      }
    });

    it('le butin LÉGENDAIRE du stage max : des sets (Ecology) ou des familles (Identification)', () => {
      for (const g of SR_GROUPS) {
        const ladder = encountersOfGroup(g);
        const top = ladder[ladder.length - 1];
        const loot = stageLoot(top.ref.reward!, 'en');
        if (g.startsWith('raid_1:')) {
          // L'Ecology Study droppe des pièces d'armure : leur SET est la raison
          // d'y farmer — et rien d'autre ne doit remonter.
          expect(loot.sets.length, g).toBeGreaterThan(0);
          expect(loot.gear, g).toHaveLength(0);
        } else {
          // L'Identification droppe cinq armes et cinq accessoires nommés.
          expect(loot.gear.length, g).toBe(10);
          expect(loot.sets, g).toHaveLength(0);
        }
      }
    });
  });
});

describe('poursuite irregular — quatre combats permanents, du butin par issue', () => {
  /** Les quatre combats des guides Irregular Extermination portés. */
  const CHASE_GROUPS = GROUPS.filter((g) => g.startsWith('irregular_chase:'));

  it("quatre poursuites, trois difficultés chacune, dans l'ordre du jeu", () => {
    expect(CHASE_GROUPS).toHaveLength(4);
    for (const g of CHASE_GROUPS) {
      const keys = encountersOfGroup(g).map((e) => e.ref.difficulty?.key);
      expect(keys, g).toEqual(['normal', 'hard', 'very_hard']);
    }
  });

  it('chaque difficulté porte UN boss à barres de PV multiples et ses PV réels', () => {
    for (const g of CHASE_GROUPS) {
      for (const e of encountersOfGroup(g)) {
        expect(e.monsters, e.id).toHaveLength(1);
        expect(e.monsters[0].role, e.id).toBe('boss');
        expect(e.monsters[0].hpLines, e.id).toBeGreaterThan(1);
        expect(e.ref.bossHp, e.id).toBeGreaterThan(0);
      }
    }
  });

  /**
   * La spécificité du mode : le butin dépend de l'ISSUE (victoire/défaite), pas
   * seulement de la difficulté. Les trois tables de chaque donjon se résolvent
   * de bout en bout — dont les MONNAIES par id numérique (`kind: 'asset'`), qui
   * passent par le glossaire `assetTypes` (lu de l'enum du client) : les
   * Irregular Cells de la poursuite n'existent nulle part ailleurs.
   */
  it('victoire, défaite, butin par combat : les trois tables se résolvent de bout en bout', () => {
    for (const g of CHASE_GROUPS) {
      for (const e of encountersOfGroup(g)) {
        for (const [field, id] of [
          ['rewardWin', e.ref.rewardWin],
          ['rewardLose', e.ref.rewardLose],
          ['reward', e.ref.reward],
        ] as const) {
          expect(id, `${e.id} : ${field}`).toBeDefined();
          const rows = resolveRewardTable(id!, 'en');
          expect(rows.length, `${e.id} : ${field}`).toBeGreaterThan(0);
          for (const r of rows) {
            expect(r.name, `${e.id} ${field} : ligne sans nom`).toBeTruthy();
            expect(r.grade, `${e.id} ${field} : ${r.name} sans grade`).toBeTruthy();
          }
        }
      }
    }
  });

  /**
   * Ce que la carte du boss affiche (cf. `pursuitLoot`, comme le Special
   * Request affiche `stageLoot`) : la monnaie du mode — dont la QUANTITÉ monte
   * avec la difficulté, c'est tout l'intérêt de la montrer par onglet — et les
   * variantes d'équipement du pool, qui n'arrivent qu'en haut d'échelle.
   */
  it('la monnaie du mode monte avec la difficulté ; l’équipement ne tombe qu’en Very Hard', () => {
    for (const g of CHASE_GROUPS) {
      const encounters = encountersOfGroup(g);
      const loots = encounters.map((e) => pursuitLoot(e.ref.rewardWin!, 'en'));

      for (const [i, loot] of loots.entries()) {
        // La monnaie d'échange du mode, nommée par le jeu (jamais par nous).
        expect(
          loot.currencies.some((c) => c.name.startsWith('Irregular Cell Type ')),
          `${encounters[i].id} : monnaie du mode absente de la victoire`,
        ).toBe(true);
      }

      // Strictement croissante : Normal < Hard < Very Hard.
      const amounts = loots.map((l) => Math.max(...l.currencies.map((c) => c.max)));
      expect(amounts, `${g} : quantités de cellules`).toEqual([...amounts].sort((a, b) => a - b));
      expect(new Set(amounts).size, `${g} : quantités de cellules identiques`).toBe(amounts.length);

      // L'équipement n'est PAS un butin de tous les jours : seul le Very Hard
      // le droppe (c'est ce qui fait monter le joueur). La V2 le listait à la
      // main dans sa vue de catégorie, sans dire d'où il tombait.
      const gearCount = loots.map((l) => l.weapons.length + l.amulets.length);
      expect(gearCount.slice(0, -1), `${g} : gear hors Very Hard`).toEqual([0, 0]);
      expect(gearCount[gearCount.length - 1], `${g} : pas de gear en Very Hard`).toBeGreaterThan(0);
    }
  });

  it('le libellé du butin existe dans les cinq langues', () => {
    for (const lang of LANGS) {
      const t = makeT(MSG[lang]);
      for (const key of ['guides.rewards.title', 'guides.rewards.details'] as const) {
        expect(t(key), `${key} [${lang}]`).not.toBe(key);
      }
    }
  });
});

/**
 * Le DÉTAIL derrière « Details » — les MiniCards du pool, les mêmes que dans un
 * build de perso (`resolveLootGear`). Ce qu'elles promettent doit tenir : une
 * tuile, un grade, des mains possibles, un lien détail. Une carte muette (nom
 * seul, sans stats ni passif) serait un panneau qui ne dit rien de plus que la
 * ligne d'icônes qu'il déplie.
 */
describe('lootDetails — le pool d’un donjon, en cartes d’équipement', () => {
  const CHASE_GROUPS = GROUPS.filter((g) => g.startsWith('irregular_chase:'));
  const SR_GROUPS = GROUPS.filter((g) => g.startsWith('raid_1:') || g.startsWith('raid_2:'));

  it('la poursuite détaille ses variantes PAR CLASSE (le jeu en droppe cinq, pas une)', () => {
    for (const g of CHASE_GROUPS) {
      const encs = encountersOfGroup(g);
      const top = encs[encs.length - 1];
      const d = lootDetails(top.ref.rewardWin!, 'en');

      // Cinq armes, cinq amulettes : une par classe, chacune sa tuile.
      expect(d.weapons.length, `${g} : armes`).toBe(5);
      expect(d.amulets.length, `${g} : amulettes`).toBe(5);
      expect(new Set(d.weapons.map((w) => w.classType)).size, `${g} : classes d'armes`).toBe(5);
      expect(new Set(d.weapons.map((w) => w.icon)).size, `${g} : tuiles d'armes`).toBe(5);

      for (const item of [...d.weapons, ...d.amulets]) {
        expect(item.grade, `${g} : ${item.name} sans grade`).toBe('unique');
        expect(item.slug, `${g} : ${item.name} sans lien détail`).toBeTruthy();
        expect(item.mainStat, `${g} : ${item.name} sans main stat`).toBeTruthy();
        // Le passif de SA classe (les variantes en portent chacune un).
        expect(item.effectTexts?.length, `${g} : ${item.name} sans passif`).toBeGreaterThan(0);
      }
    }

    // Les difficultés basses ne droppent pas d'équipement : le bouton ne
    // s'affiche pas, plutôt qu'un panneau vide.
    for (const g of CHASE_GROUPS) {
      const [normal] = encountersOfGroup(g);
      const d = lootDetails(normal.ref.rewardWin!, 'en');
      expect(
        d.weapons.length + d.amulets.length + d.talismans.length + d.sets.length,
        `${g} : Normal ne devrait rien détailler`,
      ).toBe(0);
    }
  });

  it('le Special Request détaille ses sets (Ecology) ou ses familles uniques (Identification)', () => {
    for (const g of SR_GROUPS) {
      const encs = encountersOfGroup(g);
      const top = encs[encs.length - 1];
      const d = lootDetails(top.ref.reward!, 'en');
      const count = d.weapons.length + d.amulets.length + d.talismans.length + d.sets.length;
      expect(count, `${g} : rien à détailler au stage max`).toBeGreaterThan(0);

      for (const { piece, effect } of d.sets) {
        expect(piece.pieceIcons?.length, `${g} : ${piece.name} sans tuiles`).toBe(4);
        expect(
          effect.effect2 ?? effect.effect4,
          `${g} : ${effect.name} sans bonus de set`,
        ).toBeTruthy();
      }
      for (const item of [...d.weapons, ...d.amulets, ...d.talismans]) {
        expect(item.grade, `${g} : ${item.name} sans grade`).toBe('unique');
        expect(item.slug, `${g} : ${item.name} sans lien détail`).toBeTruthy();
      }
    }
  });
});

describe('la grille de stats ne change pas de forme sous le clic', () => {
  /**
   * Changer d'onglet change le MONSTRE — et tous les monstres ne remplissent pas
   * les mêmes colonnes (`MonsterTemplet` en a onze, jamais toutes). Le Very Hard
   * d'un Joint Challenge porte `DamageBoost` là où le Normal ne l'a pas : sans
   * remplissage, la grille passait de 11 à 12 cases en cliquant, et le lecteur
   * perdait la ligne qu'il comparait. `monsterPanelStats` la fige.
   *
   * Un boss et son ADD (le Spare Core du guild raid) restent libres de différer :
   * ils s'affichent ENSEMBLE, l'un sous l'autre, pas l'un à la place de l'autre.
   */
  it('toutes les difficultés d’un combat présentent les mêmes lignes', () => {
    for (const g of GROUPS) {
      const shapes = new Map<string, Set<string>>();
      for (const e of encountersOfGroup(g)) {
        for (const m of e.monsters.filter((x) => x.role !== 'add')) {
          const monster = getMonster(m.id);
          if (!monster) continue;
          const rows = orderedStats(monsterPanelStats(monster.stats))
            .map(([s]) => s)
            .join(',');
          if (!shapes.has(rows)) shapes.set(rows, new Set());
          shapes.get(rows)!.add(monster.name.en);
        }
      }
      expect(shapes.size, `combat ${g} : ${[...shapes.keys()].length} grilles distinctes`).toBe(1);
    }
  });
});
