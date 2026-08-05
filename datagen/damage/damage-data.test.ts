/**
 * Invariants des artefacts DAMAGE committés (`data/generated/damage/*.json`) —
 * modèle damage-scaling : le fichier dérive de jointures silencieuses
 * (SkillID CSV, groupes d'éveil, archive → stats) ; une jointure cassée
 * produirait des kits vides ou des canaux de croissance à zéro sans autre
 * symptôme, et le moteur calculerait faux en silence.
 *
 * Tourne SANS `.gamedata` (rien n'appelle les builders ; `chainOf` est pur).
 */
import { describe, expect, it } from 'vitest';
import charactersData from '../../data/generated/damage/characters.json';
import growthData from '../../data/generated/damage/growth.json';
import equipmentData from '../../data/generated/damage/equipment.json';
import targetsData from '../../data/generated/damage/targets.json';
import buffsData from '../../data/generated/damage/buffs.json';
import configData from '../../data/generated/damage/config.json';
import { chainOf, type DamageCharactersData } from './characters';
import type { DamageGrowthData } from './growth';
import type { DamageEquipmentData } from './equipment';
import type { DamageTargetsData } from './targets';
import type { DamageBuffsData } from './buffs';
import type { DamageConfigData } from './config';
import {
  MISSED_DAMAGE_RATE_PERMILLE,
  PVP_HEAL_PENALTY_REDUCE_RATE_PERMILLE,
} from '../../src/lib/damage/types';

const { characters, skills } = charactersData as unknown as DamageCharactersData & {
  resVersion: string;
};
const growth = growthData as unknown as DamageGrowthData & { resVersion: string };
const equipment = equipmentData as unknown as DamageEquipmentData & { resVersion: string };
const targetsFile = targetsData as unknown as DamageTargetsData & { resVersion: string };
const buffsFile = buffsData as unknown as DamageBuffsData & { resVersion: string };

describe('chainOf — dérivation de la clé de chaîne', () => {
  it('sépare l’index de hit final', () => {
    expect(chainOf('2000055_Skill_2_2')).toEqual({ chain: '2000055_Skill_2', hit: 2 });
    expect(chainOf('2000055_Skill_2_Burst_3_1')).toEqual({
      chain: '2000055_Skill_2_Burst_3',
      hit: 1,
    });
  });
  it('ne mange jamais le numéro de skill ni un ID sans index', () => {
    expect(chainOf('2000001_Skill_5')).toEqual({ chain: '2000001_Skill_5', hit: 1 });
    expect(chainOf('2000065_SKIP_A')).toEqual({ chain: '2000065_SKIP_A', hit: 1 });
  });
});

describe('damage/characters.json — forme', () => {
  it('versionné, et le roster est celui du wiki (≥ 100 persos, jamais le templet brut)', () => {
    expect((charactersData as { resVersion: string }).resVersion).toMatch(/^\d+\.\d+/);
    const n = Object.keys(characters).length;
    expect(n).toBeGreaterThanOrEqual(100);
    // 253 lignes CT_PC au templet 1.4.9 : un roster qui s'en approche signale
    // que le filtre d'intégration (persos non sortis) a sauté.
    expect(n).toBeLessThan(200);
  });

  it('chaque perso a une identité complète et les stats de combat de base', () => {
    const bad: string[] = [];
    for (const [id, c] of Object.entries(characters)) {
      if (!c.element || !c.class || !c.race || !c.basicStar) bad.push(`${id} : identité`);
      for (const stat of ['HP', 'Atk', 'Def', 'Speed'])
        if (!c.baseStats[stat]) bad.push(`${id} : baseStats.${stat} absent`);
      if (!c.skills.length) bad.push(`${id} : aucun skill`);
    }
    expect(bad).toEqual([]);
  });

  it('toutes les références de slots résolvent dans la map skills', () => {
    const bad: string[] = [];
    for (const [id, c] of Object.entries(characters))
      for (const { slot, id: sid } of c.skills)
        if (!skills[sid]) bad.push(`${id} slot ${slot} → ${sid} absent`);
    expect(bad).toEqual([]);
  });

  it('un skill offensif a des hits OU est marqué hitsUnresolved — jamais ni l’un ni l’autre', () => {
    const bad: string[] = [];
    for (const s of Object.values(skills)) {
      const offensive = s.levels.some((l) => l.damageFactor > 0);
      if (offensive && !s.hits.length && !s.hitsUnresolved) bad.push(`${s.id} : silencieux`);
      if (s.hitsUnresolved && s.hits.length) bad.push(`${s.id} : flag incohérent`);
    }
    expect(bad).toEqual([]);
  });

  it('les hits sont triés par (chain, hit) et portent l’ID brut', () => {
    const bad: string[] = [];
    for (const s of Object.values(skills)) {
      for (let i = 1; i < s.hits.length; i++) {
        const a = s.hits[i - 1];
        const b = s.hits[i];
        const ordered = a.chain < b.chain || (a.chain === b.chain && a.hit <= b.hit);
        if (!ordered) bad.push(`${s.id} : ${a.id} avant ${b.id}`);
      }
      for (const h of s.hits) if (!h.id || h.hit < 1) bad.push(`${s.id} : hit invalide ${h.id}`);
    }
    expect(bad).toEqual([]);
  });
});

describe('damage/characters.json — témoins vérifiés sur les tables (27/07-03/08/2026)', () => {
  it('Aer (2000055) : S2 et ses états burst par slots, chaînes distinctes', () => {
    const aer = characters['2000055'];
    expect(aer).toBeDefined();
    const slotMap = new Map(aer.skills.map((s) => [s.slot, s.id]));
    expect(slotMap.get(2)).toBe('5502');
    expect(slotMap.get(21)).toBe('5521'); // burst 3
    // La chaîne du S2 sert AUSSI les bursts 1/2 (jointure SkillID CSV).
    expect(skills['5519'].hits.map((h) => h.id)).toEqual(skills['5502'].hits.map((h) => h.id));
    expect(skills['5502'].hits.map((h) => h.damageFactor)).toEqual([200, 100, 400]);
    // Le burst 3 a SA chaîne (multi-hit 3× puis coup final).
    expect(skills['5521'].hits.map((h) => h.damageFactor)).toEqual([150, 550]);
    expect(skills['5521'].hits[0].multiHit).toBe(true);
    expect(skills['5521'].hits[0].maxHitCount).toBe(3);
  });

  it('les facteurs de skill sont en ‰ plausibles (jointure LevelTemplet vivante)', () => {
    // S2 d'Aer niveau 1 : 1900 ‰ (vérifié table). Un 0 généralisé = jointure morte.
    expect(skills['5502'].levels[0].damageFactor).toBe(1900);
    const withFactor = Object.values(skills).filter((s) =>
      s.levels.some((l) => l.damageFactor > 0),
    );
    expect(withFactor.length).toBeGreaterThan(300);
  });
});

describe('damage/growth.json — canaux de CalcFinalStat', () => {
  it('archive (Codex) : 11 paliers denses, taux ‰ non décroissants sur ATK/DEF/HP', () => {
    expect(growth.archive.map((t) => t.level)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    for (let i = 1; i < growth.archive.length; i++) {
      const prev = growth.archive[i - 1];
      const cur = growth.archive[i];
      expect(cur.atkRate).toBeGreaterThanOrEqual(prev.atkRate);
      expect(cur.defRate).toBeGreaterThanOrEqual(prev.defRate);
      expect(cur.hpRate).toBeGreaterThanOrEqual(prev.hpRate);
      expect(cur.completeCount).toBeGreaterThan(prev.completeCount);
    }
  });

  it('transcendance : courbes génériques par étoile de base présentes, taux ‰', () => {
    const generic = growth.transcend.filter((t) => !t.characterId);
    expect(generic.length).toBeGreaterThanOrEqual(20);
    for (const star of [1, 2, 3]) expect(generic.some((t) => t.basicStar === star)).toBe(true);
    for (const t of growth.transcend) {
      expect(t.transStar).toBeGreaterThan(0);
      expect(Math.max(t.hpRate, t.atkRate, t.defRate)).toBeLessThan(1000); // ‰, pas des %
    }
  });

  it('post-100 : chaque (étoile, élément) a ses 3 steps, modificateur ‰ croissant', () => {
    const byKey = new Map<string, number[]>();
    for (const m of growth.maxLevelSteps) {
      const k = `${m.basicStar}|${m.element}`;
      byKey.set(k, [...(byKey.get(k) ?? []), m.modifierAfter100]);
    }
    for (const [k, mods] of byKey) {
      expect(mods, k).toHaveLength(3);
      expect(
        [...mods].sort((a, b) => a - b),
        k,
      ).toEqual(mods);
    }
  });

  it('buff de guilde : 10 niveaux, MAX_HP 8→15, modes stables (spec § 16.2)', () => {
    expect(growth.guildMaxHp.map((t) => t.level)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    // Témoins re-vérifiés sur BuffSystemTemplet (04/08/2026).
    expect(growth.guildMaxHp.map((t) => t.maxHpValue)).toEqual([
      8, 8, 8, 10, 10, 10, 12, 13, 14, 15,
    ]);
    const modes = growth.guildMaxHp[0].modes;
    expect(modes).toContain('DM_NORMAL');
    expect(modes).toContain('DM_RAID_1');
    expect(modes).toContain('DM_TOWER');
    expect(modes).not.toContain('DM_WORLD_BOSS');
    expect(modes).not.toContain('DM_TOWER_HARD');
    // Les 10 niveaux partagent la MÊME liste de modes (1.4.9) — un écart
    // signalerait un patch à re-vérifier.
    for (const t of growth.guildMaxHp) {
      expect(t.modes, `Lv ${t.level}`).toEqual(modes);
      expect(t.ignoreModes, `Lv ${t.level}`).toBeUndefined();
    }
  });

  it('buff de titre MAX_HP : la seule ligne 1.4.9 est « Premium Body » +5 %', () => {
    // Un patch qui en ajoute doit CASSER ce test (revue § 16.2, jamais absorbé).
    expect(growth.titleMaxHp).toHaveLength(1);
    const t = growth.titleMaxHp[0];
    expect(t).toMatchObject({
      group: 65,
      title: 'SYS_BUFF_USERNICKNAME_LICENSE_04',
      maxHpValue: 5,
    });
    expect(t.modes).toEqual([
      'DM_NORMAL',
      'DM_RAID_1',
      'DM_RAID_2',
      'DM_ADVENTURE_MISSION',
      'DM_ADVENTURE_CHALLENGE',
    ]);
    expect(t.ignoreModes).toBeUndefined();
  });

  it('éveil : chaque nœud a des niveaux, IOT_STAT complet, IOT_BUFF référencé', () => {
    const bad: string[] = [];
    for (const n of growth.awakening) {
      if (!n.levels.length) bad.push(`${n.id} : sans niveaux`);
      for (const l of n.levels) {
        if (l.optionType === 'IOT_STAT' && (!l.stat || !l.applyingType || !l.value))
          bad.push(`${n.id} lv${l.level} : IOT_STAT incomplet`);
        if (l.optionType === 'IOT_BUFF' && !l.buffId && !l.buffValue)
          bad.push(`${n.id} lv${l.level} : IOT_BUFF sans référence`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('équipement : références de groupes résolues (3 groupes morts connus tolérés)', () => {
    const unresolvedOpt = new Set<string>();
    const unresolvedSpe = new Set<string>();
    for (const p of Object.values(equipment.pieces)) {
      for (const g of [...p.mainOptionGroups, ...p.subOptionGroups])
        if (!equipment.optionGroups[g]) unresolvedOpt.add(g);
      for (const g of [...p.uniqueOptionGroups, ...p.setOptionGroups])
        if (!equipment.specialGroups[g] && !equipment.optionGroups[g]) unresolvedSpe.add(g);
      // NB : `breakLimitGroup` n'est PAS une clé d'ItemBreakLimitTemplet (24
      // lignes résolues par (étoile, grade)) — pas de jointure à vérifier ici.
    }
    // Groupes ABSENTS des tables du jeu (réfs mortes, mesuré 03/08/2026) —
    // une CROISSANCE de cette liste signale une résolution cassée.
    expect([...unresolvedOpt].sort()).toEqual(['12004', '12010', '1504']);
    expect([...unresolvedSpe]).toEqual([]);
  });

  it('équipement : EE du roster complets (option principale buff + unique lvl 1 et 10)', () => {
    const ees = Object.values(equipment.pieces).filter((p) => p.subType === 'ITS_EQUIP_EXCLUSIVE');
    expect(ees.length).toBeGreaterThanOrEqual(100);
    const bad: string[] = [];
    for (const ee of ees) {
      if (!ee.characterLimit || !characters[ee.characterLimit]) bad.push(`${ee.id} : hors roster`);
      const main = equipment.optionGroups[ee.mainOptionGroups[0] ?? ''];
      if (!main?.some((o) => o.optionType === 'IOT_BUFF' && o.buffId))
        bad.push(`${ee.id} : option principale sans buff`);
      // Le +10 AJOUTE (`_ADD`, IsAdd=true) ou REMPLACE (`_CHANGE`, IsAdd=false)
      // l'effet de base — les deux motifs existent, seule la présence compte.
      const unique = ee.uniqueOptionGroups.flatMap((g) => equipment.specialGroups[g] ?? []);
      if (!unique.some((u) => u.level === 1) || !unique.some((u) => u.level === 10))
        bad.push(`${ee.id} : effet unique lvl1/lvl10 incomplet`);
    }
    expect(bad).toEqual([]);
  });

  it('équipement : enchant 0..10 par sous-type, break limits à 4 facteurs, sets à 2 niveaux', () => {
    const bySub = new Map<string, number[]>();
    for (const e of equipment.enchant)
      bySub.set(e.subType, [...(bySub.get(e.subType) ?? []), e.level]);
    expect(bySub.size).toBe(8); // 6 pièces + EE + talisman
    for (const b of equipment.breakLimits) expect(b.factors).toHaveLength(4);
    // Témoin : le set ATK (groupe 1) — niveau 1 pour 0..3 break, niveau 2 à 4.
    const atkSet = equipment.specialGroups['1'];
    expect(atkSet[0].breakLimitCounts).toEqual([0, 1, 2, 3]);
    expect(atkSet[0].twoPiece).toEqual({
      optionType: 'IOT_STAT',
      stat: 'ST_ATK',
      applyingType: 'OAT_RATE',
      value: 300,
    });
    expect(atkSet[1].breakLimitCounts).toEqual([4]);
    // Témoin : facteur d'enchant arme = 0.4 par niveau (float brut du templet).
    expect(
      equipment.enchant.find((e) => e.subType === 'ITS_EQUIP_WEAPON' && e.level === 10)?.factor,
    ).toBe(0.4);
  });

  it('équipement : les artefacts référencent des buffs, les talismans un unique', () => {
    // Un effet par artefact : buffs référencés, OU effet direct ABT_* — un seul
    // artefact sans rien (id 2020, mesuré 03/08/2026).
    const empty = equipment.artifacts.filter((a) => !a.buffIds.length && !a.buffType);
    expect(empty.map((a) => a.id)).toEqual(['2020']);
    const talismans = Object.values(equipment.pieces).filter(
      (p) => p.subType === 'ITS_EQUIP_OOPARTS',
    );
    expect(talismans.length).toBeGreaterThan(50);
    expect(talismans.every((t) => t.uniqueOptionGroups.length > 0)).toBe(true);
  });

  it('buffs : toute ref des artefacts émis résout (CSV éclatés), zéro ref morte', () => {
    expect(buffsFile.unresolved).toEqual([]);
    const refs = new Set<string>();
    const add = (v?: string): void => {
      for (const b of (v ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean))
        if (b !== '0') refs.add(b);
    };
    for (const s of Object.values(skills))
      for (const l of s.levels) for (const b of l.buffIds) add(b);
    for (const s of Object.values(targetsFile.skills))
      for (const l of s.levels) for (const b of l.buffIds) add(b);
    for (const t of Object.values(targetsFile.targets))
      for (const b of t.rage?.breakBuffIds ?? []) add(b);
    for (const b of targetsFile.rankBuffIds) add(b);
    for (const n of growth.awakening) for (const l of n.levels) add(l.buffId);
    for (const m of growth.monad) add(m.effect.buffId);
    for (const g of Object.values(equipment.optionGroups)) for (const o of g) add(o.buffId);
    for (const g of Object.values(equipment.specialGroups))
      for (const s of g) {
        for (const b of s.buffIds ?? []) add(b);
        add(s.twoPiece?.buffId);
        add(s.fourPiece?.buffId);
      }
    for (const a of equipment.artifacts) for (const b of a.buffIds) add(b);
    const missing = [...refs].filter((r) => !buffsFile.buffs[r]);
    expect(missing).toEqual([]);
    expect(Object.keys(buffsFile.buffs).length).toBeGreaterThan(2000);
  });

  it('groupes spéciaux : les BuffID CSV sont ÉCLATÉS (bug vu le 05/08/2026)', () => {
    for (const [gid, rows] of Object.entries(equipment.specialGroups))
      for (const s of rows) for (const b of s.buffIds ?? []) expect(b, gid).not.toContain(',');
    // Témoin : l'option unique d'Absolute Music porte DEUX buffs sur sa ligne.
    expect(equipment.specialGroups['2025'][0].buffIds).toEqual([
      'BID_ITEM_UO_ACC_25',
      'BID_ITEM_UO_ACC_25_2',
    ]);
  });

  it('buffs : niveaux triés et typés ; l’option principale d’EE a ses 11 niveaux', () => {
    for (const [id, levels] of Object.entries(buffsFile.buffs)) {
      expect(levels.length, id).toBeGreaterThan(0);
      for (let i = 1; i < levels.length; i++)
        expect(levels[i].level, id).toBeGreaterThanOrEqual(levels[i - 1].level);
      for (const l of levels) expect(l.type, id).toBeTruthy();
    }
    // Résolution « niveau enchant + 1 » (spec § 17.5) : 11 niveaux (enchant 0..10).
    expect(buffsFile.buffs['BID_CEQUIP_MAIN_DMG_FIRE'].map((l) => l.level)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ]);
  });

  it('buffs : l’affinité (Trust) sort les plats vérifiés au binaire (27/07/2026)', () => {
    expect(buffsFile.trust).toHaveLength(15);
    const witness = (id: string): { stat?: string; applyingType?: string; value?: number } => {
      const l = buffsFile.buffs[id][0];
      return { stat: l.stat, applyingType: l.applyingType, value: l.value };
    };
    expect(witness('trust_level_ATK_1')).toEqual({
      stat: 'ST_ATK',
      applyingType: 'OAT_ADD',
      value: 60,
    });
    expect(witness('trust_level_DEF_1')).toEqual({
      stat: 'ST_DEF',
      applyingType: 'OAT_ADD',
      value: 40,
    });
    expect(witness('trust_level_HP_1')).toEqual({
      stat: 'ST_HP',
      applyingType: 'OAT_ADD',
      value: 300,
    });
  });

  it('config : le GARDE-FOU des constantes du moteur tient (spec § 7 du mapping)', () => {
    const config = (configData as { config: DamageConfigData }).config;
    // Une divergence ici après un patch = constante du moteur à REVOIR
    // (types.ts + spec § 17.6), jamais une valeur à deviner.
    expect(config.MISSED_DAMAGE_RATE).toBe(MISSED_DAMAGE_RATE_PERMILLE);
    expect(config.PVP_HEAL_PENALTY_REDUCE_RATE).toBe(PVP_HEAL_PENALTY_REDUCE_RATE_PERMILLE);
    // Mécanisme PvP § 17.6 (extrait du binaire 1.4.9).
    expect(config.PVP_ATK_PENALTY_START_TURN).toBe(10);
    expect(config.PVP_ATK_PENALTY_LOOP_TURN).toBe(5);
    expect(config.PVP_ATK_PENALTY_DMG_RATE).toBe(100);
    expect(config.PVP_ATK_PENALTY_DMG_ADD_RATE).toBe(30);
    expect(config.PVP_HEAL_PENALTY_REDUCE_ADD_RATE).toBe(250);
    expect(config.MAX_CHARACTER_LEVEL).toBe(120);
    expect([
      config.CHECK_AVOID_VALUE_1,
      config.CHECK_AVOID_VALUE_2,
      config.CHECK_AVOID_VALUE_3,
      config.CHECK_AVOID_VALUE_4,
    ]).toEqual([1000, 1, 100, 1]);
  });

  it('monad : les nœuds ciblés portent un perso du roster et un effet', () => {
    const bad: string[] = [];
    for (const m of growth.monad) {
      if (!m.effect.optionType) bad.push(`${m.id} : sans effet`);
      if (m.characterId && !characters[m.characterId])
        bad.push(`${m.id} : perso ${m.characterId} hors roster`);
    }
    expect(bad).toEqual([]);
  });
});

describe('damage/targets.json — cibles de preset (boss des rencontres vivantes)', () => {
  it('versionné, et la garde de sortie tient (boss des presets, jamais le templet brut)', () => {
    expect((targetsData as { resVersion: string }).resVersion).toMatch(/^\d+\.\d+/);
    const n = Object.keys(targetsFile.targets).length;
    expect(n).toBeGreaterThanOrEqual(1000);
    // 4492 lignes au templet 1.10.804 : un compte qui s'en approche signale que
    // le filtre « boss d'encounters.json » a sauté.
    expect(n).toBeLessThan(3000);
  });

  it('chaque cible a une identité, les stats de combat de base et un kit résolu', () => {
    const bad: string[] = [];
    for (const [id, t] of Object.entries(targetsFile.targets)) {
      if (!t.element || !t.class || !t.race) bad.push(`${id} : identité`);
      for (const stat of ['HP', 'Atk'])
        if (!t.baseStats[stat]) bad.push(`${id} : baseStats.${stat} absent`);
      for (const { slot, id: sid } of t.skills)
        if (!targetsFile.skills[sid]) bad.push(`${id} slot ${slot} → ${sid} absent`);
    }
    expect(bad).toEqual([]);
  });

  it('les skills de monstre sont des niveaux SANS hits (le rapport ne calcule jamais la cible)', () => {
    for (const s of Object.values(targetsFile.skills)) {
      expect('hits' in s, s.id).toBe(false);
      for (let i = 1; i < s.levels.length; i++)
        expect(s.levels[i].level, s.id).toBeGreaterThanOrEqual(s.levels[i - 1].level);
    }
  });

  it('les immunités sont massivement présentes (colonne vivante, pas un champ mort)', () => {
    const withImmune = Object.values(targetsFile.targets).filter((t) => t.buffImmune?.length);
    expect(withImmune.length).toBeGreaterThan(500);
    for (const t of withImmune) for (const b of t.buffImmune ?? []) expect(b, t.id).toMatch(/^BT_/);
  });

  it('témoin Vera (400101) : stats plates du templet, immunités, break', () => {
    const vera = targetsFile.targets['400101'];
    expect(vera).toBeDefined();
    expect(vera.element).toBe('CET_DARK');
    // Boss à stats PLATES (min = max) : l'interpolation de niveau est neutre.
    expect(vera.baseStats.HP).toEqual({ min: 91080, max: 91080 });
    expect(vera.baseStats.CriticalDMGRate).toEqual({ min: 1500, max: 1500 });
    expect(vera.buffImmune).toContain('BT_STUN');
    // Le break vit dans RageTemplet même sans enrage (trigger NONE).
    expect(vera.rage?.breakBuffIds).toEqual(['BID_BREAK_1', 'BID_BREAK_2', 'BID_BREAK_3']);
  });

  it('témoin enrage (401201) : déclencheur HP_RATE en ‰ avec durée', () => {
    const rage = targetsFile.targets['401201']?.rage;
    expect(rage?.trigger).toBe('HP_RATE');
    expect(rage?.steps).toEqual([{ value: 500, duration: 5 }]);
  });

  it('les buffs de break universels sont dans la fermeture avec leur effet vérifié', () => {
    // BID_BREAK_1 : −200 ‰ de DMG_REDUCE pendant le break — une cible break
    // prend plus de dégâts ; c'est l'entrée du conditionnel « vs break ».
    const b1 = buffsFile.buffs['BID_BREAK_1'][0];
    expect(b1.type).toBe('BT_DMG_REDUCE');
    expect(b1.applyingType).toBe('OAT_RATE');
    expect(b1.value).toBe(-200);
    expect(b1.createType).toBe('ON_BREAK');
    expect(buffsFile.buffs['BID_BREAK_2'][0].stat).toBe('ST_AVOID');
    expect(buffsFile.buffs['BID_BREAK_3'][0].stat).toBe('ST_BUFF_RESIST');
  });

  it('les PASSIFS de monstre sont TOUS mono-niveau (hypothèse de passives.ts)', () => {
    // La lib applique le niveau UNIQUE d'un passif (650/650 en 1.4.9) : un
    // patch qui introduit un passif multi-niveaux doit CASSER ce test — il
    // faudra alors prouver au binaire quel niveau s'applique.
    const multi = Object.values(targetsFile.skills).filter(
      (s) => s.subType === 'PASSIVE' && s.levels.length !== 1,
    );
    expect(multi.map((s) => s.id)).toEqual([]);
  });

  it('témoin « Starving Devil » (Chimera stage 12) : le passif et ses buffs sont extraits', () => {
    // Le cas qui a motivé les passifs de boss (Sevih 05/08/2026). Attendus
    // dérivés de BuffTemplet — un patch qui les change doit se voir ICI.
    const chimera = targetsFile.targets['403400261'];
    expect(chimera?.skills.map((s) => s.id)).toContain('131113');
    const passive = targetsFile.skills['131113'];
    expect(passive.subType).toBe('PASSIVE');
    const buffIds = passive.levels[0].buffIds;
    for (const id of ['1', '2', '3', '4076007_15_1', '4076007_15_2']) {
      expect(buffIds, id).toContain(id);
      expect(buffsFile.buffs[id], id).toBeDefined();
    }
    // Équipe joueuse : crit +100 % (forcé) et crit dmg −85 %, permanents.
    expect(buffsFile.buffs['4076007_15_1'][0]).toMatchObject({
      type: 'BT_STAT',
      targetType: 'ENEMY_TEAM',
      stat: 'ST_CRITICAL_RATE',
      applyingType: 'OAT_ADD',
      value: 1000,
      createType: 'PASSIVE',
    });
    expect(buffsFile.buffs['4076007_15_2'][0]).toMatchObject({
      stat: 'ST_CRITICAL_DMG_RATE',
      value: -850,
    });
    // Boss : réductions conditionnées à l'élément de l'attaquant (§ 6).
    expect(buffsFile.buffs['1'][0]).toMatchObject({
      type: 'BT_DMG_REDUCE',
      targetType: 'ME',
      value: -150,
      conditionType: 'ATTACKER_ELEMENT_WIN',
    });
    expect(buffsFile.buffs['2'][0]).toMatchObject({
      value: 500,
      conditionType: 'ATTACKER_ELEMENT_LOSE',
    });
  });

  it('les buffs de palier (rangs guilde/singularity) sont collectés et résolus', () => {
    // `CCustomBossLevelTemplet.BuffList` → CreateBuff au changement de palier
    // (vérifié binaire 03/08/2026) — les passifs de rang sont de vrais buffs.
    expect(targetsFile.rankBuffIds.length).toBeGreaterThanOrEqual(40);
    expect(targetsFile.rankBuffIds).toContain('guild_boss_fire_1');
    for (const b of targetsFile.rankBuffIds) expect(buffsFile.buffs[b], b).toBeDefined();
  });
});
