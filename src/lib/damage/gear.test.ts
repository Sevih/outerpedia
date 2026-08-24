/**
 * Passifs d'ÉQUIPEMENT (gear.ts) — rejoués sur les VRAIS artefacts committés,
 * témoins du scénario qui a motivé le chantier (Sevih 05/08/2026, H.Dianne vs
 * Chimera : « brancher les moteurs » avant de chasser les deltas) :
 *   - EE « Earnest Love » (2000093) : Lv10 = +100 % aux BOSS (PASSIVE), main
 *     « dégâts vs élément » = +17..23 % contre la cible que le porteur BAT
 *     (condition TARGET_ELEMENT, BuffConditionValue = CET de la CIBLE,
 *     absent = 0 = terre — preuve en tête de gear.ts) ;
 *   - Rampaging Caracal : proc de MARKING en SKILL_FINISH — jamais simulé,
 *     signalé `dynamic` (l'état se représente par la chip « cible marquée ») ;
 *   - Absolute Music : +dégâts aux boss pour les ALLIÉS du porteur
 *     (MY_TEAM_WITHOUT_ME) — ne profite JAMAIS au porteur, affiché inactif ;
 *   - Rogue's Charm +10 : BT_DMG_TARGET_BREAK +10 % (§ 9.1, cible en break) ;
 *   - set Revenge 4P : ATK jusqu'à +160 % selon les PV PERDUS (§ 14 BT 31).
 *
 * Attendus dérivés des TABLES (BuffTemplet via buffs.json), jamais recopiés
 * d'un rendu.
 */
import { describe, expect, it } from 'vitest';
import charactersData from '../../../data/generated/damage/characters.json';
import growthData from '../../../data/generated/damage/growth.json';
import buffsData from '../../../data/generated/damage/buffs.json';
import equipmentData from '../../../data/generated/damage/equipment.json';
import {
  conditionBuffRef,
  gearConditionMet,
  resolveGearPassives,
  resolveKitPassives,
  resolveQuirkPassives,
  uniquePassiveLevel,
  type KitCharacter,
  type KitSkill,
} from './gear';
import {
  buildDamageReport,
  type AttackerBuildInput,
  type DamageData,
  type TargetBuildInput,
} from './inputs';
import { sheetToCombatStat } from './sheet';
import { Element } from './types';

const data = {
  characters: charactersData,
  growth: growthData,
  buffs: buffsData,
  equipment: equipmentData,
} as unknown as DamageData;

const equipment = data.equipment!;
const buffs = data.buffs;

/** H.Dianne — feu, EE « Earnest Love » (pièce 2000093). */
const DIANNE = '2000093';

const attacker = (gear: AttackerBuildInput['gear'], hpPct = 100): AttackerBuildInput => ({
  id: DIANNE,
  level: 120,
  affinityTier: 0,
  codexLevel: 0,
  skillLevels: {},
  // Les PV font partie de la fiche : le contexte des familles « PV perdus »
  // (§ 14) vient d'eux — sans PV saisis, elles contribuent 0.
  sheet: { atk: 10000, hp: 40000, critical_rate: 500, critical_dmg: 1500 },
  hpPct,
  gear,
});

const target = (broken = false): TargetBuildInput => ({
  element: 'earth',
  stats: { hp: 500000, def: 2000 },
  boss: true,
  broken,
});

describe('gear — conditions', () => {
  it('TARGET_ELEMENT : BuffConditionValue = CET de la CIBLE, absent = terre', () => {
    expect(gearConditionMet('TARGET_ELEMENT', undefined, Element.Fire, Element.Earth)).toBe(true);
    expect(gearConditionMet('TARGET_ELEMENT', 0, Element.Fire, Element.Earth)).toBe(true);
    expect(gearConditionMet('TARGET_ELEMENT', 2, Element.Water, Element.Fire)).toBe(true);
    expect(gearConditionMet('TARGET_ELEMENT', 2, Element.Water, Element.Earth)).toBe(false);
    // Élémentaires ATTACKER_* : même relation que passives.ts (§ 6).
    expect(gearConditionMet('ATTACKER_ELEMENT_WIN', undefined, Element.Fire, Element.Earth)).toBe(
      true,
    );
    // Non évaluable (§ 12.1) : undefined — l'appelant signale, jamais deviné.
    expect(gearConditionMet('OWNER_HAS_BUFF', undefined, Element.Fire, Element.Earth)).toBe(
      undefined,
    );
  });
});

describe('gear — EE « Earnest Love » (H.Dianne), donnée réelle', () => {
  it('à +10 : +100 % aux boss (Lv10 ADD) + main « vs terre » niveau 11 (+23 %)', () => {
    const info = resolveGearPassives(
      DIANNE,
      { ee: { enchant: 10 } },
      equipment,
      buffs,
      Element.Fire,
      Element.Earth,
    );
    const boss = info.entries.find((e) => e.buffId === 'BID_CEQUIP_2000093_ADD');
    expect(boss).toMatchObject({
      source: 'ee',
      side: 'attacker',
      active: true,
      buff: { type: 'BT_DMG_TO_BOSS', applyingType: 'OAT_RATE', value: 1000 },
    });
    const main = info.entries.find((e) => e.buffId === 'BID_CEQUIP_MAIN_DMG_FIRE');
    expect(main).toMatchObject({
      condition: 'TARGET_ELEMENT',
      conditionElement: Element.Earth,
      active: true,
      buff: { type: 'BT_DMG', value: 230 }, // niveau enchant + 1 = 11
    });
  });

  it('à +0 : pas de Lv10, main au niveau 1 (+17 %) ; vs eau la main est inactive', () => {
    const zero = resolveGearPassives(
      DIANNE,
      { ee: { enchant: 0 } },
      equipment,
      buffs,
      Element.Fire,
      Element.Earth,
    );
    expect(zero.entries.some((e) => e.buffId === 'BID_CEQUIP_2000093_ADD')).toBe(false);
    expect(zero.entries.find((e) => e.buffId === 'BID_CEQUIP_MAIN_DMG_FIRE')?.buff.value).toBe(170);
    const vsWater = resolveGearPassives(
      DIANNE,
      { ee: { enchant: 10 } },
      equipment,
      buffs,
      Element.Fire,
      Element.Water,
    );
    expect(vsWater.entries.find((e) => e.buffId === 'BID_CEQUIP_MAIN_DMG_FIRE')?.active).toBe(
      false,
    );
  });

  it('perso sans EE : rien — état normal, pas un « non résolu »', () => {
    const info = resolveGearPassives(
      '2000001',
      { ee: { enchant: 10 } },
      equipment,
      buffs,
      Element.Fire,
      Element.Earth,
    );
    expect(info.entries.filter((e) => e.source === 'ee')).toEqual([]);
    expect(info.unresolved.filter((u) => u.source === 'ee')).toEqual([]);
  });
});

describe('gear — arme, accessoire, talisman, sets (donnée réelle)', () => {
  it('Rampaging Caracal (groupe 1008) : proc MARKING signalé dynamic, jamais simulé', () => {
    const info = resolveGearPassives(
      DIANNE,
      { weapon: { groups: ['1008'], tier: 4 } },
      equipment,
      buffs,
      Element.Fire,
      Element.Earth,
    );
    expect(info.entries).toEqual([]);
    expect(info.dynamic).toMatchObject([
      { source: 'weapon', buffId: 'BID_ITEM_UO_WEAPON_08', createType: 'SKILL_FINISH' },
    ]);
    expect(info.dynamic[0].buff.type).toBe('BT_MARKING');
  });

  it('Absolute Music (groupe 2025) : MY_TEAM_WITHOUT_ME → allies, jamais actif', () => {
    const info = resolveGearPassives(
      DIANNE,
      { amulet: { groups: ['2025'], tier: 4 } },
      equipment,
      buffs,
      Element.Fire,
      Element.Earth,
    );
    const e = info.entries.find((x) => x.buffId === 'BID_ITEM_UO_ACC_25');
    // Niveau = breakthrough + 1 = 5 → +20 % aux boss… pour les ALLIÉS.
    expect(e).toMatchObject({
      side: 'allies',
      active: false,
      buff: { type: 'BT_DMG_TO_BOSS', value: 200 },
    });
    // BID_ITEM_UO_ACC_25_2 est BT_NONE (placeholder) : ignoré en silence.
    expect(info.entries.some((x) => x.buffId === 'BID_ITEM_UO_ACC_25_2')).toBe(false);
  });

  it("Rogue's Charm +10 (groupe 3025) : +10 % sur cible en BREAK via § 9.1", () => {
    const info = resolveGearPassives(
      DIANNE,
      { roguesCharm: { groups: ['3025'] } },
      equipment,
      buffs,
      Element.Fire,
      Element.Earth,
    );
    expect(info.entries).toMatchObject([
      { source: 'talisman', active: true, buff: { type: 'BT_DMG_TARGET_BREAK', value: 100 } },
    ]);
    // Le Lv1 (charge de CP en SKILL_FINISH) ne pèse pas sur le hit : silencieux.
    expect(info.dynamic).toEqual([]);

    // Bout en bout : la cible en break prend +10 % (§ 9.1) — sinon 0.
    const gear = { roguesCharm: { groups: ['3025'] } };
    const dmg = (broken: boolean): number =>
      buildDamageReport(attacker(gear), target(broken), data).slots[0].report.states[0].branches[0]
        .totalDamage;
    expect(dmg(true)).toBeGreaterThan(dmg(false));
  });

  it('set Revenge 4P : ATK scalé par les PV PERDUS (§ 14 BT 31) — via § 16.1', () => {
    const gear = { sets: [{ groupId: '15', enchanted: false, pieces: 4 as const }] };
    // À 100 % PV : rien ; à 25 % PV : +160 % × 0,75 = +120 % d'ATK.
    const full = buildDamageReport(attacker(gear, 100), target(), data);
    const hurt = buildDamageReport(attacker(gear, 25), target(), data);
    expect(full.combatStats.atk).toBe(10000);
    expect(hurt.combatStats.atk).toBe(
      sheetToCombatStat({
        sheetValue: 10000,
        baseValue: 0,
        archiveRatePermille: 0,
        buffValue: 0,
        buffValueRate: 1200,
      }),
    );
    // 2 pièces seulement : le 4P ne s'applique pas.
    const two = buildDamageReport(
      attacker({ sets: [{ groupId: '15', enchanted: false, pieces: 2 }] }, 25),
      target(),
      data,
    );
    expect(two.combatStats.atk).toBe(10000);
  });
});

describe('gear — intégration buildDamageReport', () => {
  it('l’EE +10 traverse § 9.1 : boss +100 % et main vs terre +23 % dans le taux du hit', () => {
    const withEe = buildDamageReport(attacker({ ee: { enchant: 10 } }), target(), data);
    const bare = buildDamageReport(attacker({}), target(), data);
    expect(withEe.gearPassives?.entries.filter((e) => e.active)).toHaveLength(2);
    expect(withEe.slots[0].report.states[0].branches[0].totalDamage).toBeGreaterThan(
      bare.slots[0].report.states[0].branches[0].totalDamage,
    );
  });

  it('gear présent sans tables equipment : signalé non résolu, jamais tu', () => {
    const bare = { ...data, equipment: undefined };
    const r = buildDamageReport(attacker({ ee: { enchant: 10 } }), target(), bare);
    expect(r.gearPassives?.entries).toEqual([]);
    expect(r.gearPassives?.unresolved[0].reason).toContain('equipment');
  });

  it('sans gear : rien ne bouge (pas de gearPassives)', () => {
    const r = buildDamageReport({ ...attacker({}), gear: undefined }, target(), data);
    expect(r.gearPassives).toBeUndefined();
  });
});

describe('kit — passifs du perso (H.Dianne, donnée réelle)', () => {
  it('palier du passif UNIQUE par transcendance (growth.transcend.skillLevel)', () => {
    const g = data.growth.transcend;
    expect(uniquePassiveLevel(g, 3, 9)).toBe(4);
    expect(uniquePassiveLevel(g, 3, 5)).toBe(2);
    expect(uniquePassiveLevel(g, 3, 3)).toBe(1);
    expect(uniquePassiveLevel(g, 3, 2)).toBe(0);
  });

  it('BT_STAT_PREMIUM (transcendance) : déjà dans la fiche AFFICHÉE — jamais recompté', () => {
    const r = buildDamageReport({ ...attacker({}), gear: undefined }, target(), data);
    // Aucune entrée premium (pierce/dmg boost de transcendance), stats intactes.
    expect(r.kitPassives?.entries.map((e) => e.buffId)).not.toContain('trancendent_8_pierce_30');
    expect(r.combatStats.atk).toBe(10000);
    // Le passif « un buff aléatoire par tour » (groupe 103) est SIGNALÉ
    // dynamique — c'est ce que représentent les chips atk/chd/crit/spd.
    expect(r.kitPassives?.dynamic.map((d) => d.buffId)).toContain('2000093_passive');
  });

  it('la transcendance BASSE recule le palier du passif unique (transcendIndex)', () => {
    const low = buildDamageReport(
      { ...attacker({}), gear: undefined, transcendIndex: 0 },
      target(),
      data,
    );
    // À T0 (transStar 3, niveau 1) le kit ne porte AUCUN buff de palier 8.
    expect(low.kitPassives?.dynamic.map((d) => d.buffId)).not.toContain('2000093_trancendent');
  });
});

describe('quirks — nœuds d’éveil du compte (donnée réelle)', () => {
  it('nœud boss 231 lv3 : +9 % aux boss (§ 9.1) ; portée élémentaire respectée', () => {
    const r = buildDamageReport(
      { ...attacker({}), gear: undefined, quirks: { '231': 3, '1': 10 } },
      target(),
      data,
    );
    // 231 (PVE, AAT_NONE) : Awakening_Boss_Dmg_3 = BT_DMG_TO_BOSS +90‰, actif.
    expect(r.quirkPassives?.entries).toMatchObject([
      {
        source: 'quirk',
        sourceId: '231',
        active: true,
        buff: { type: 'BT_DMG_TO_BOSS', value: 90 },
      },
    ]);
    // 1 = arbre élémentaire TERRE (applyTypeValue 0) : Dianne est FEU → écarté.
    expect(r.quirkPassives?.entries.some((e) => e.sourceId === '1')).toBe(false);
    // Et il pèse sur le calcul (cible boss).
    const bare = buildDamageReport({ ...attacker({}), gear: undefined }, target(), data);
    expect(r.slots[0].report.states[0].branches[0].totalDamage).toBeGreaterThan(
      bare.slots[0].report.states[0].branches[0].totalDamage,
    );
  });

  it('arbre élémentaire FEU (nœud 41) : s’applique à Dianne, niveau = la ligne saisie', () => {
    const r = buildDamageReport(
      { ...attacker({}), gear: undefined, quirks: { '41': 10 } },
      target(),
      data,
    );
    const e = r.quirkPassives?.entries.find((x) => x.sourceId === '41');
    expect(e?.active).toBe(true);
    // Nœud inconnu : signalé, jamais tu.
    const bad = buildDamageReport(
      { ...attacker({}), gear: undefined, quirks: { '999999': 1 } },
      target(),
      data,
    );
    expect(bad.quirkPassives?.unresolved[0].reason).toContain('absent');
  });

  it('gates prouvés par les captures Valentine (06/08) : licence et chain', () => {
    const quirks = { '251': 10, '232': 1 };
    // Contenu NORMAL : l'arbre licence (+100 % boss) ne s'applique PAS ; le
    // nœud « Chain Damage » est réservé aux chain attacks (SKT_STRIKE_*) —
    // hors des lignes du rapport, signalé.
    const normal = buildDamageReport(
      { ...attacker({}), gear: undefined, quirks },
      { ...target(), mode: 'normal' },
      data,
    );
    expect(normal.quirkPassives?.entries).toEqual([]);
    expect(
      normal.quirkPassives?.unresolved.some(
        (u) => u.buffId === 'Awakening_Chain_Dmg_1' && u.reason.includes('SKT_STRIKE'),
      ),
    ).toBe(true);
    // Contenu Adventure License : l'arbre licence s'applique.
    const licence = buildDamageReport(
      { ...attacker({}), gear: undefined, quirks },
      { ...target(), mode: 'adventure_mission' },
      data,
    );
    expect(licence.quirkPassives?.entries).toMatchObject([
      { sourceId: '251', active: true, buff: { type: 'BT_DMG_TO_BOSS', value: 1000 } },
    ]);
    // Cible MANUELLE (mode inconnu) : l'arbre licence est SIGNALÉ, jamais deviné.
    const manual = buildDamageReport({ ...attacker({}), gear: undefined, quirks }, target(), data);
    expect(manual.quirkPassives?.unresolved.some((u) => u.reason.includes('licence'))).toBe(true);
  });
});

describe('débuffs passifs ENEMY_* du kit — POSÉS in-game (mesure EE on/off 24/08/2026)', () => {
  it('le trans_8 de Gnosis Beth (BT_2000092_ENHANCE ENEMY_TEAM) : entrée défenseur active', () => {
    // Mesure discriminante du 24/08/2026 : sans EE le tick fait × 1,5
    // (l'ENHANCE du trans_8 seul), avec EE × 2,0 (les deux se somment) —
    // les débuffs passifs ENEMY_* sont bien posés et lus par le tick.
    const beth = data.characters.characters['2000092'] as unknown as KitCharacter;
    const kit = resolveKitPassives(
      beth,
      9,
      data.characters.skills as unknown as Record<string, KitSkill>,
      data.growth.transcend,
      buffs,
      Element.Light,
      Element.Light,
    );
    expect(kit.entries.find((x) => x.buffId === 'trancendent_8_2000092_2')).toMatchObject({
      side: 'defender',
      active: true,
      buff: { type: 'BT_2000092_ENHANCE', value: 500 },
    });
    expect(kit.unresolved.some((u) => u.buffId === 'trancendent_8_2000092_2')).toBe(false);
  });
});

describe('buffs restreints par slot — Noa (donnée réelle, fixture 10/08/2026)', () => {
  /** Noa — terre, +3 % PV cible sur le S2 (2000022_2_2), EE à décompte (§ 7). */
  const NOA = '2000022';
  const noaChar = data.characters.characters[NOA] as unknown as KitCharacter;
  const noaSkills = data.characters.skills as unknown as Record<string, KitSkill>;

  it('kit ACTIF : 2000022_2_2 collecté au niveau de skill saisi, gaté SKT_SECOND', () => {
    const kit = resolveKitPassives(
      noaChar,
      3,
      noaSkills,
      data.growth.transcend,
      buffs,
      Element.Earth,
      Element.Earth,
      { S2: 5 },
    );
    const e = kit.entries.find((x) => x.buffId === '2000022_2_2');
    // Niveau 5 → ligne 5 (30 ‰ des PV max de la CIBLE) ; porte son lanceur.
    expect(e).toMatchObject({
      side: 'attacker',
      active: true,
      callers: ['SKT_SECOND'],
      buff: { type: 'BT_DMG_TARGET_STAT', stat: 'ST_HP', value: 30 },
    });
    // Niveau 1 → ligne 1 (10 ‰) : la sélection suit le NIVEAU SAISI.
    const low = resolveKitPassives(
      noaChar,
      3,
      noaSkills,
      data.growth.transcend,
      buffs,
      Element.Earth,
      Element.Earth,
      { S2: 1 },
    );
    expect(low.entries.find((x) => x.buffId === '2000022_2_2')?.buff.value).toBe(10);
    // Le 3 % PV du S3 (2000022_3_3) : condition OWNER_RESOURCE (5 énergies) —
    // état de combat, jamais évalué par le moteur : entrée `stateful`,
    // INACTIVE par défaut.
    expect(kit.entries.find((x) => x.buffId === '2000022_3_3')).toMatchObject({
      stateful: true,
      active: false,
      condition: 'OWNER_RESOURCE',
      callers: ['SKT_ULTIMATE'],
    });
    // Déclarée remplie (z `cs`) : l'entrée s'active, au niveau de skill saisi.
    const met = resolveKitPassives(
      noaChar,
      3,
      noaSkills,
      data.growth.transcend,
      buffs,
      Element.Earth,
      Element.Earth,
      { S3: 5 },
      new Set(['2000022_3_3']),
    );
    expect(met.entries.find((x) => x.buffId === '2000022_3_3')).toMatchObject({
      stateful: true,
      active: true,
      buff: { type: 'BT_DMG_TARGET_STAT', stat: 'ST_HP', value: 30 },
    });
  });

  it('bursts : leur niveau vient du slot du BURSTABLE, plus jamais du S2', () => {
    // Synthétique (aucun buff de burst à VALEUR par palier chez un burst-S1
    // en donnée réelle) : S1 burstable, buff de burst 100 ‰ → 500 ‰ au
    // palier 5. Avant la revue du 18/08/2026, ACTIVE_SLOT_OF lisait
    // skillLevels['S2'] pour tous les bursts — faux pour 74/125 persos.
    const char: KitCharacter = {
      id: 'X',
      basicStar: 3,
      skills: [
        { slot: 1, id: 'x1' },
        { slot: 19, id: 'x19' },
      ],
    };
    const kitSkills: Record<string, KitSkill> = {
      x1: { id: 'x1', type: 'SKT_FIRST', burstAP: [80, 120], levels: [{ level: 1, buffIds: [] }] },
      // Niveaux DENSES (1..5) comme la donnée réelle : le clamp du moteur
      // borne par `levels.length`.
      x19: {
        id: 'x19',
        type: 'SKT_BURST_1',
        levels: [1, 2, 3, 4, 5].map((level) => ({ level, buffIds: ['xb'] })),
      },
    };
    const kitBuffs = {
      buffs: {
        xb: [
          {
            level: 1,
            type: 'BT_DMG',
            targetType: 'ME',
            applyingType: 'OAT_RATE',
            value: 100,
            createType: 'PASSIVE',
            callerSkillType: 'SKT_BURST_1',
          },
          {
            level: 5,
            type: 'BT_DMG',
            targetType: 'ME',
            applyingType: 'OAT_RATE',
            value: 500,
            createType: 'PASSIVE',
            callerSkillType: 'SKT_BURST_1',
          },
        ],
      },
    };
    const at = (skillLevels: Partial<Record<'S1' | 'S2' | 'S3', number>>) =>
      resolveKitPassives(
        char,
        3,
        kitSkills,
        data.growth.transcend,
        kitBuffs,
        Element.Fire,
        Element.Earth,
        skillLevels,
      ).entries.find((e) => e.buffId === 'xb')?.buff.value;
    // S1 saisi pilote le burst — le S2 n'y change rien.
    expect(at({ S1: 5, S2: 1 })).toBe(500);
    expect(at({ S1: 1, S2: 5 })).toBe(100);
  });

  it('procs SKILL_START : lanceurs = skills ACTIFS référents, ou CSV pour un porteur passif ; TARGET_IS_BOSS évalué ; premium MY_TEAM signalé', () => {
    // Synthétique compact du modèle PROUVÉ par les captures du 18/08/2026
    // (Rhona/Caren) : un proc porté par des skills actifs pèse sur EUX
    // (Caren 2000089_3_1 : S3/B2/B3, pas S1/B1) ; porté par un passif seul,
    // son CSV `CallerSkillType` décide (Rhona 2000008_passive_3).
    const char: KitCharacter = {
      id: 'X',
      basicStar: 3,
      skills: [
        { slot: 1, id: 'a1' },
        { slot: 3, id: 'a3' },
        { slot: 9, id: 'p1' },
      ],
    };
    const kitSkills: Record<string, KitSkill> = {
      a1: { id: 'a1', type: 'SKT_FIRST', levels: [{ level: 1, buffIds: ['proc_actif'] }] },
      a3: {
        id: 'a3',
        type: 'SKT_ULTIMATE',
        levels: [{ level: 1, buffIds: ['proc_actif', 'proc_finish', 'premium_team'] }],
      },
      p1: { id: 'p1', type: 'SKT_CLASS_PASSIVE', levels: [{ level: 1, buffIds: ['proc_passif'] }] },
    };
    const kitBuffs = {
      buffs: {
        proc_actif: [
          {
            level: 1,
            type: 'BT_STAT',
            stat: 'ST_PIERCE_POWER_RATE',
            applyingType: 'OAT_ADD',
            value: 300,
            targetType: 'ME',
            createType: 'SKILL_START',
            // Le CSV dit « tous » : les RÉFÉRENTS actifs priment (mesuré).
            callerSkillType: 'SKT_ALL',
          },
        ],
        proc_passif: [
          {
            level: 1,
            type: 'BT_STAT',
            stat: 'ST_PIERCE_POWER_RATE',
            applyingType: 'OAT_ADD',
            value: 300,
            targetType: 'ME',
            createType: 'SKILL_START',
            callerSkillType: 'SKT_SECOND',
            conditionType: 'TARGET_IS_BOSS',
          },
        ],
        proc_finish: [
          {
            level: 1,
            type: 'BT_DMG',
            value: 300,
            targetType: 'ME',
            createType: 'SKILL_FINISH',
            callerSkillType: 'SKT_ALL',
          },
        ],
        premium_team: [
          {
            level: 1,
            type: 'BT_STAT_PREMIUM',
            stat: 'ST_DEF',
            applyingType: 'OAT_RATE',
            value: 100,
            targetType: 'MY_TEAM',
            createType: 'PASSIVE',
            callerSkillType: 'SKT_ALL',
          },
        ],
      },
    };
    const resolve = (targetIsBoss: boolean) =>
      resolveKitPassives(
        char,
        3,
        kitSkills,
        data.growth.transcend,
        kitBuffs,
        Element.Fire,
        Element.Earth,
        {},
        undefined,
        targetIsBoss,
      );
    const vsBoss = resolve(true);
    // Porté par S1 ET S3 (actifs) : lanceurs = les référents, pas le CSV.
    expect(vsBoss.entries.find((e) => e.buffId === 'proc_actif')).toMatchObject({
      proc: true,
      active: true,
      callers: ['SKT_FIRST', 'SKT_ULTIMATE'],
    });
    // Porté par le passif seul : le CSV décide ; TARGET_IS_BOSS évalué.
    expect(vsBoss.entries.find((e) => e.buffId === 'proc_passif')).toMatchObject({
      proc: true,
      active: true,
      callers: ['SKT_SECOND'],
      condition: 'TARGET_IS_BOSS',
    });
    expect(resolve(false).entries.find((e) => e.buffId === 'proc_passif')).toMatchObject({
      active: false,
    });
    // SKILL_FINISH : toujours un proc non simulé (dynamic).
    expect(vsBoss.entries.find((e) => e.buffId === 'proc_finish')).toBeUndefined();
    expect(vsBoss.dynamic.find((d) => d.buffId === 'proc_finish')).toBeDefined();
    // Premium (ME ou MY_TEAM du porteur) : déjà dans la fiche — jamais une
    // entrée de buff, mais son TAUX est collecté pour la défactorisation
    // sheet.ts (prouvé 18/08/2026 : fiche nue de Caren 2314 exacte).
    expect(vsBoss.entries.find((e) => e.buffId === 'premium_team')).toBeUndefined();
    expect(vsBoss.unresolved.find((u) => u.buffId === 'premium_team')).toBeUndefined();
    expect(vsBoss.premium.find((p) => p.buffId === 'premium_team')).toMatchObject({
      stat: 'ST_DEF',
      valueRate: 100,
    });
  });

  it('conditionBuffRef : référence de buff nommable, sentinelles et autres exclus', () => {
    expect(conditionBuffRef('TARGET_HAS_BUFF', 1)).toBe('1');
    expect(conditionBuffRef('OWNER_HAS_NOT_BUFF', 4089001)).toBe('4089001');
    expect(conditionBuffRef('CASTER_ENEMY_TEAM_HAS_BUFF', 4089002)).toBe('4089002');
    // Sentinelles de catégorie (« n'importe quel buff/débuff ») : le gabarit
    // générique est le bon libellé — jamais « #9996 ».
    expect(conditionBuffRef('OWNER_HAS_BUFF', 9996)).toBeUndefined();
    expect(conditionBuffRef('OWNER_HAS_BUFF', 9999)).toBeUndefined();
    // Conditions d'un autre genre, ou valeur absente.
    expect(conditionBuffRef('CASTER_HPRATE_OVER', 500)).toBeUndefined();
    expect(conditionBuffRef('TARGET_HAS_BUFF', undefined)).toBeUndefined();
    expect(conditionBuffRef(undefined, 1)).toBeUndefined();
  });

  it('EE +0 : BID_CEQUIP_2000022 (150 ‰ × décompte) gaté SKT_ULTIMATE', () => {
    const info = resolveGearPassives(
      NOA,
      { ee: { enchant: 0 } },
      equipment,
      buffs,
      Element.Earth,
      Element.Earth,
    );
    expect(info.entries.find((e) => e.buffId === 'BID_CEQUIP_2000022')).toMatchObject({
      source: 'ee',
      active: true,
      callers: ['SKT_ULTIMATE'],
      buff: { type: 'BT_DMG_ENEMY_TEAM_DECREASE', value: 150 },
    });
    // La main « dégâts vs élément » vise l'EAU (BuffConditionValue 1) —
    // inactive contre une cible terre (cohérent avec le Δ 0 de la fixture).
    expect(info.entries.find((e) => e.buffId === 'BID_CEQUIP_MAIN_DMG_EARTH')).toMatchObject({
      condition: 'TARGET_ELEMENT',
      conditionElement: Element.Water,
      active: false,
    });
  });

  it('application PAR SLOT : le taux du S2 porte le +3 % PV cible, pas le S1', () => {
    const noa: AttackerBuildInput = {
      id: NOA,
      level: 100,
      affinityTier: 0,
      codexLevel: 0,
      skillLevels: { S1: 5, S2: 5, S3: 5 },
      sheet: { atk: 2034, critical_dmg: 1880 },
      gear: { ee: { enchant: 0 } },
    };
    // Stats de la fixture Noa vs Rhona (spawn 100210) — Δ 0 prouvé.
    const rhona: TargetBuildInput = {
      element: 'earth',
      stats: { hp: 11876, def: 429, dmgRed: 33 },
      boss: true,
    };
    const r = buildDamageReport(noa, rhona, data, { targetsHit: 1 });
    const rateOf = (slot: string) =>
      r.slots.find((s) => s.slot === slot && s.burst === undefined)?.report.states[0].branches[0]
        .damageRate;
    // S2 − S1 = getStatValuePermille(11876, 30) = 356 ‰ (le buff ne pèse QUE
    // sur son lanceur) ; S3 − S1 = 150 × (4 − 1) = 450 ‰ (EE, décompte § 7).
    expect(rateOf('S2')! - rateOf('S1')!).toBe(356);
    expect(rateOf('S3')! - rateOf('S1')!).toBe(450);
    // Mécanique perso déclarée remplie (5 Kaizer Energy, z `cs`) : le 3 % PV
    // du 3_3 s'ajoute au S3 — 450 + 356 = 806 ‰. EN ATTENTE d'une capture en
    // jeu à 5 énergies pour devenir une ligne de fixture dorée.
    const full = buildDamageReport({ ...noa, metConditions: ['2000022_3_3'] }, rhona, data, {
      targetsHit: 1,
    });
    const fullS3 = full.slots.find((s) => s.slot === 'S3' && s.burst === undefined)?.report
      .states[0].branches[0].damageRate;
    expect(fullS3! - rateOf('S1')!).toBe(806);
  });
});

describe('quirks — nœuds MAÎTRES de classe BT_STAT_PREMIUM (mesuré 24/08/2026)', () => {
  // Le tick du Bleed de Francesca bufflé ATK +30 % (fixture
  // francesca-dot-scrapmetal-atkbuff) exige la défactorisation par le nœud
  // 101 : « déjà dans la fiche » ne veut PAS dire « à ignorer » pour un taux
  // premium — même leçon que Caren 18/08, côté quirks.
  const awakening = data.growth.awakening;

  it('nœud 101 (Striker) : ST_ATK +15 ‰/niveau collecté en TAUX premium pour un Attacker', () => {
    const info = resolveQuirkPassives(
      { '101': 10 },
      awakening,
      { element: Element.Dark, class: 'CCT_ATTACKER', subClass: 'ATTACKER' },
      buffs,
      Element.Earth,
    );
    expect(info.premium).toContainEqual(
      expect.objectContaining({ source: 'quirk', sourceId: '101', stat: 'ST_ATK', valueRate: 150 }),
    );
  });

  it('gate de classe : le même nœud ne donne RIEN à un Ranger', () => {
    const info = resolveQuirkPassives(
      { '101': 10 },
      awakening,
      { element: Element.Light, class: 'CCT_RANGER', subClass: 'TACTICIAN' },
      buffs,
      Element.Earth,
    );
    expect(info.premium.some((p) => p.stat === 'ST_ATK')).toBe(false);
  });

  it('nœud 141 (Ranger, ST_BUFF_CHANCE OAT_ADD) : premium PLAT — transparent, jamais collecté', () => {
    // Un premium OAT_ADD vit dans la fiche ET dans l'assiette que les buffs
    // multiplient (§ 3 : buffVal s'ajoute à sub AVANT ×buffRate) — la
    // défactorisation ne concerne que les TAUX ; le déclarer ne change rien.
    const info = resolveQuirkPassives(
      { '141': 10 },
      awakening,
      { element: Element.Light, class: 'CCT_RANGER', subClass: 'TACTICIAN' },
      buffs,
      Element.Earth,
    );
    expect(info.premium.some((p) => p.stat === 'ST_BUFF_CHANCE')).toBe(false);
  });
});
