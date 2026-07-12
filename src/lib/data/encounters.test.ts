import { describe, expect, it } from 'vitest';
import encountersData from '@data/generated/encounters.json';
import { makeT } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import en from '@/i18n/locales/en';
import jp from '@/i18n/locales/jp';
import kr from '@/i18n/locales/kr';
import zh from '@/i18n/locales/zh';
import fr from '@/i18n/locales/fr';
import { difficultyLabel, encountersOfGroup, hardestDifficultyLabel } from '@/lib/data/encounters';
import { getMonster } from '@/lib/data/monsters';
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
    for (const g of GROUPS) {
      for (const e of encountersOfGroup(g)) {
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
