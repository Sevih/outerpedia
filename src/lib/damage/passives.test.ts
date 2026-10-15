/**
 * Passifs de BOSS (passives.ts) — rejoués sur les VRAIS artefacts committés,
 * témoin « Starving Devil » (Unidentified Chimera stage 12, monstre 403400261,
 * passif 131113) : le cas qui a motivé le chantier (Sevih 05/08/2026 — « c'est
 * un débuff comme un autre », jamais de stats saisies trafiquées).
 *
 * Attendus dérivés des TABLES (BuffTemplet via buffs.json), jamais recopiés
 * d'un rendu : crit +100 % / crit dmg −85 % sur l'équipe joueuse, réductions
 * élémentaires du boss (−15 % si l'attaquant a l'avantage, +50 % sinon), les
 * WG_DMG_REDUCE en entrées de jauge (§ 11). Les MONTANTS se lisent dans
 * buffs.json (`lv`) : leur valeur du jour est gardée, comme alarme de patch,
 * par datagen/damage/damage-data.test.ts — ici on teste le moteur.
 */
import { describe, expect, it } from 'vitest';
import charactersData from '../../../data/generated/damage/characters.json';
import growthData from '../../../data/generated/damage/growth.json';
import buffsData from '../../../data/generated/damage/buffs.json';
import targetsData from '../../../data/generated/damage/targets.json';
import {
  buildDamageReport,
  type AttackerBuildInput,
  type DamageData,
  type TargetBuildInput,
} from './inputs';
import {
  elementConditionMet,
  passiveAffectsDamageAmount,
  resolveBossPassives,
  staticBossPassives,
  type ElementConditionContext,
} from './passives';
import { Element } from './types';

const data = {
  characters: charactersData,
  growth: growthData,
  buffs: buffsData,
  targets: targetsData,
} as unknown as DamageData;

/** Valeur d'un buff de la table (niveau 1) — l'attendu des tests. */
const lv = (id: string): number => {
  const v = data.buffs.buffs[id]?.find((l) => l.level === 1)?.value;
  expect(v, `${id} absent de buffs.json`).toBeDefined();
  return v!;
};

/** Unidentified Chimera, stage 12 — seul passif : 131113 (Starving Devil). */
const CHIMERA_12 = '403400261';

/** Témoins du roster par élément (le boss est TERRE) : feu = avantage,
 *  eau = désavantage, terre = neutre (EQUAL couvre aussi lumière/ténèbres). */
const FIRE = '2000001';
const WATER = '2000003';
const EARTH = '2000008';

const attacker = (id: string): AttackerBuildInput => ({
  id,
  level: 120,
  affinityTier: 0,
  codexLevel: 0,
  skillLevels: {},
  sheet: { atk: 10000, critical_rate: 500, critical_dmg: 1500 },
});

const target = (): TargetBuildInput => ({
  element: 'earth',
  stats: { hp: 500000, def: 2000 },
  boss: true,
  monsterId: CHIMERA_12,
});

describe('passives — elementConditionMet, la fonction de condition partagée', () => {
  const ctx = (a: Element, d: Element, forced = false): ElementConditionContext => ({
    attackerElement: a,
    defenderElement: d,
    ...(forced ? { forcedSuperiority: true } : {}),
  });
  const met = (cond: string, c: ElementConditionContext, value?: number) =>
    elementConditionMet(cond, value, c, 'defender');

  it('WIN/LOSE/EQUAL — EQUAL est le « ni l’un ni l’autre », pas « même élément »', () => {
    expect(met('ATTACKER_ELEMENT_WIN', ctx(Element.Fire, Element.Earth))).toBe(true);
    expect(met('ATTACKER_ELEMENT_LOSE', ctx(Element.Water, Element.Earth))).toBe(true);
    expect(met('ATTACKER_ELEMENT_EQUAL', ctx(Element.Earth, Element.Earth))).toBe(true);
    // Lumière vs terre : hors du cycle feu>terre>eau → EQUAL, jamais rien.
    expect(met('ATTACKER_ELEMENT_EQUAL', ctx(Element.Light, Element.Earth))).toBe(true);
    expect(met('ATTACKER_ELEMENT_WIN', ctx(Element.Light, Element.Earth))).toBe(false);
    // Condition non élémentaire : pas la sienne — l'appelant décide.
    expect(met('OWNER_HAS_BUFF', ctx(Element.Fire, Element.Earth))).toBeUndefined();
  });

  it('avantage FORCÉ (CheckElementWin) : WIN même pour un attaquant désavantagé', () => {
    // Eau contre terre : désavantage — le buff de supériorité le rend gagnant.
    const c = ctx(Element.Water, Element.Earth, true);
    expect(met('ATTACKER_ELEMENT_WIN', c)).toBe(true);
    expect(met('ATTACKER_ELEMENT_LOSE', c)).toBe(false);
    expect(met('ATTACKER_ELEMENT_EQUAL', c)).toBe(false);
    // TARGET_ELEMENT est une égalité d'élément : le drapeau n'y joue pas.
    expect(met('TARGET_ELEMENT', c, 1)).toBe(true);
  });

  it('infériorité forcée : sans effet sur les conditions (seule la supériorité compte)', () => {
    // Le contexte ne porte pas l'infériorité : un drapeau de plus, ignoré.
    const c = { ...ctx(Element.Fire, Element.Earth), forcedInferiority: true };
    expect(met('ATTACKER_ELEMENT_WIN', c)).toBe(true);
    expect(met('ATTACKER_ELEMENT_LOSE', c)).toBe(false);
  });

  it('TARGET_ELEMENT : égalité STRICTE, ConditionValue absente = 0 = Terre', () => {
    // Ars Nova buff `9` : −450 si l'attaquant est LUMIÈRE (ConditionValue 3).
    // Prouvé in-game 24/08/2026 (Gnosis Beth, fixture gnosisbeth-arsnova) —
    // avec le +300 EQUAL du buff `7`, S1 au raid EXACT.
    expect(met('TARGET_ELEMENT', ctx(Element.Light, Element.Light), 3)).toBe(true);
    expect(met('TARGET_ELEMENT', ctx(Element.Dark, Element.Light), 3)).toBe(false);
    // L'extracteur omet les zéros : absente = CET_EARTH.
    expect(met('TARGET_ELEMENT', ctx(Element.Earth, Element.Light))).toBe(true);
    expect(met('TARGET_ELEMENT', ctx(Element.Fire, Element.Light))).toBe(false);
  });

  it('TARGET_ELEMENT vu du PORTEUR : boss → l’attaquant, équipement → la cible', () => {
    const c = ctx(Element.Fire, Element.Water);
    expect(elementConditionMet('TARGET_ELEMENT', 2, c, 'defender')).toBe(true); // attaquant feu
    expect(elementConditionMet('TARGET_ELEMENT', 2, c, 'attacker')).toBe(false);
    expect(elementConditionMet('TARGET_ELEMENT', 1, c, 'attacker')).toBe(true); // cible eau
    expect(elementConditionMet('TARGET_ELEMENT', 1, c, 'defender')).toBe(false);
  });
});

describe('passives — Ars Nova (raid_2), donnée réelle', () => {
  it('le buff 9 (TARGET_ELEMENT 3) est une entrée évaluable, plus un unresolved', () => {
    const s = staticBossPassives('407600853', data.targets!, data.buffs)!;
    const nine = s.entries.find((e) => e.buffId === '9');
    expect(nine).toMatchObject({
      side: 'defender',
      condition: 'TARGET_ELEMENT',
      conditionValue: 3,
      buff: { type: 'BT_DMG_REDUCE', applyingType: 'OAT_RATE', value: lv('9') }, // −450
    });
    expect(s.unresolved.some((u) => u.buffId === '9')).toBe(false);
  });
});

describe('passives — Starving Devil (Chimera stage 12), donnée réelle', () => {
  it('extraction statique : 8 entrées classées (dont l’enrage et 2 WG), 1 WG signalé', () => {
    const s = staticBossPassives(CHIMERA_12, data.targets!, data.buffs)!;
    expect(s).toBeDefined();
    const byId = (id: string) => s.entries.filter((e) => e.buffId === id);
    // Équipe joueuse (ENEMY_TEAM) : crit forcé + crit dmg −85 %.
    expect(byId('4076007_15_1')[0]).toMatchObject({
      side: 'attacker',
      buff: {
        type: 'BT_STAT',
        stat: 'ST_CRITICAL_RATE',
        applyingType: 'OAT_ADD',
        value: lv('4076007_15_1'), // 1000
      },
    });
    expect(byId('4076007_15_2')[0]).toMatchObject({
      side: 'attacker',
      buff: {
        type: 'BT_STAT',
        stat: 'ST_CRITICAL_DMG_RATE',
        applyingType: 'OAT_ADD',
        value: lv('4076007_15_2'), // −850
      },
    });
    // Boss (ME) : réductions conditionnées à l'élément de l'attaquant.
    expect(byId('1')[0]).toMatchObject({
      side: 'defender',
      condition: 'ATTACKER_ELEMENT_WIN',
      buff: { type: 'BT_DMG_REDUCE', applyingType: 'OAT_RATE', value: lv('1') }, // −150
    });
    expect(byId('2')[0]).toMatchObject({ condition: 'ATTACKER_ELEMENT_LOSE' });
    expect(byId('3')[0]).toMatchObject({ condition: 'ATTACKER_ELEMENT_EQUAL' });
    // ENRAGE (skill SKT_RAGE_ENTER1, 131125) : DMG Reduce +400 ‰ en OAT_ADD
    // sur le boss — canal de STAT défenseur § 16.1, gaté par la coche.
    expect(byId('Common_Rage_Buff_3')[0]).toMatchObject({
      skillId: '131125',
      side: 'defender',
      rage: true,
      buff: {
        type: 'BT_STAT',
        stat: 'ST_DMG_REDUCE_RATE',
        applyingType: 'OAT_ADD',
        value: lv('Common_Rage_Buff_3'), // 400
      },
    });
    // Armures (BT_WG_DMG_REDUCE sous condition élémentaire) : entrées de
    // jauge côté boss, lues par CalcDamageWG (§ 11).
    expect(byId('armor_common_1')[0]).toMatchObject({
      side: 'defender',
      condition: 'ATTACKER_ELEMENT_EQUAL',
      buff: { type: 'BT_WG_DMG_REDUCE', value: lv('armor_common_1') },
    });
    expect(byId('armor_common_2')[0]).toMatchObject({ condition: 'ATTACKER_ELEMENT_LOSE' });
    expect(s.entries).toHaveLength(8);
    // BT_DMG sortants du boss (4/5/6) : jamais calculés — absents, pas signalés.
    expect(byId('4')).toHaveLength(0);
    // Boucliers/WG heal/ATK du skill d'enrage : hors périmètre, absents aussi.
    expect(byId('common_rage_buff_atk_turn')).toHaveLength(0);
    // Le WG_DMG_REDUCE du bouclier de rage (OWNER_HAS_BUFF) : signalé.
    expect(s.unresolved.map((u) => u.buffId)).toEqual(['4076007_15_3_1']);
    expect(s.unresolved[0].reason).toContain('OWNER_HAS_BUFF');
  });

  it('jauge : l’armure du boss mord sur les dégâts de jauge (désavantage seulement)', () => {
    const gauge = (id: string) =>
      buildDamageReport(attacker(id), target(), data).slots.find(
        (sl) => sl.report.weaknessGaugeDamage > 0,
      )?.report.weaknessGaugeDamage;
    // Feu (avantage) : armures inactives ; eau (désavantage) : −500 ‰.
    expect(gauge(FIRE)).toBeDefined();
    expect(gauge(WATER) ?? 0).toBeLessThan(gauge(FIRE)!);
  });

  it('chips : la crit CHANCE ne pèse un montant que si le kit la LIT (2000067)', () => {
    const s = staticBossPassives(CHIMERA_12, data.targets!, data.buffs)!;
    const byId = (id: string) => s.entries.find((e) => e.buffId === id)!;
    // Kit qui ne lit PAS le taux crit : il ne pèse que sur P(crit) § 4 —
    // la chip est tue, le moteur garde l'entrée (test « crit forcé »).
    const plain = new Set(buildDamageReport(attacker(FIRE), target(), data).attackerAmountStats);
    expect(plain.has('ST_CRITICAL_RATE')).toBe(false);
    expect(passiveAffectsDamageAmount(byId('4076007_15_1'), plain)).toBe(false);
    // Crit dmg −85 % : nourrit la branche crit § 7.5 → chip.
    expect(passiveAffectsDamageAmount(byId('4076007_15_2'), plain)).toBe(true);
    // Défenseur : feedRow ne laisse déjà passer que les canaux consommés.
    expect(passiveAffectsDamageAmount(byId('1'), plain)).toBe(true);
    expect(passiveAffectsDamageAmount(byId('Common_Rage_Buff_3'), plain)).toBe(true);
    // 2000067 (2000067_2_6 : +50 % du taux CRIT en dégâts, famille § 9.1) :
    // la lecture ouvre la stat — la chip s'affiche pour lui (Sevih 17/08/2026).
    const reader = new Set(
      buildDamageReport(attacker('2000067'), target(), data).attackerAmountStats,
    );
    expect(reader.has('ST_CRITICAL_RATE')).toBe(true);
    expect(passiveAffectsDamageAmount(byId('4076007_15_1'), reader)).toBe(true);
  });

  it('enrage : inactif par défaut, la coche l’active et la réduction § 16.1 mord', () => {
    const off = buildDamageReport(attacker(FIRE), target(), data);
    const on = buildDamageReport(attacker(FIRE), { ...target(), enraged: true }, data);
    const rageOf = (r: typeof off) =>
      r.bossPassives!.entries.find((e) => e.buffId === 'Common_Rage_Buff_3')!;
    expect(rageOf(off).active).toBe(false);
    expect(rageOf(on).active).toBe(true);
    // DMG Reduce de la cible : 0 → 400 ‰ (§ 16.1, A = 0) — les dégâts chutent.
    const dmg = (r: typeof off) => r.slots[0].report.states[0].expectedDamage;
    expect(dmg(on)).toBeLessThan(dmg(off));
  });

  it('équipe joueuse : les débuffs traversent § 16.1 — crit forcé, crit dmg −850', () => {
    const r = buildDamageReport(attacker(FIRE), target(), data);
    expect(r.combatStats.critical_rate).toBe(500 + lv('4076007_15_1')); // 500 + 1000
    expect(r.combatStats.critical_dmg).toBe(1500 + lv('4076007_15_2')); // 1500 − 850
    // +100 % de taux crit → P(crit) = 1, la branche normale reste émise à
    // P = 0 (normal/crit toujours émis — leurs dégâts ne dépendent pas de P).
    for (const s of r.slots) {
      for (const st of s.report.states) {
        expect(st.branches.map((b) => b.branch)).toEqual(['normal', 'critical']);
        expect(st.branches[0].probability).toBe(0);
        expect(st.branches[1].probability).toBe(1);
      }
    }
  });

  it('réduction § 9.2 du boss selon l’élément : feu −150, eau +500, terre +500', () => {
    const reduceOf = (id: string): number => {
      const r = buildDamageReport(attacker(id), target(), data, { trace: true });
      const step = r.slots[0].report.states[0].branches[0].trace?.find((t) => t.ref === '§ 9.2');
      expect(step).toBeDefined();
      return step!.out;
    };
    expect(reduceOf(FIRE)).toBe(lv('1')); // avantage (−150) : le boss prend PLUS
    expect(reduceOf(WATER)).toBe(lv('2')); // désavantage : −50 %
    expect(reduceOf(EARTH)).toBe(lv('3')); // neutre (EQUAL) : −50 % aussi
  });

  it('le rapport expose bossPassives : entrées évaluées + non-résolus', () => {
    const r = buildDamageReport(attacker(FIRE), target(), data);
    expect(r.bossPassives).toBeDefined();
    const active = r.bossPassives!.entries.filter((e) => e.active).map((e) => e.buffId);
    expect(active.sort()).toEqual(['1', '4076007_15_1', '4076007_15_2']);
    expect(r.bossPassives!.unresolved).toHaveLength(1);
  });

  it('sans monsterId : aucun passif, rien ne bouge', () => {
    const r = buildDamageReport(attacker(FIRE), { ...target(), monsterId: undefined }, data);
    expect(r.bossPassives).toBeUndefined();
    expect(r.combatStats.critical_dmg).toBe(1500);
  });

  it('monsterId sans tables targets : signalé non résolu, jamais tu', () => {
    const bare = { ...data, targets: undefined };
    const r = buildDamageReport(attacker(FIRE), target(), bare);
    expect(r.bossPassives?.entries).toEqual([]);
    expect(r.bossPassives?.unresolved[0].reason).toContain('targets');
    expect(r.combatStats.critical_dmg).toBe(1500);
  });

  it('monstre inconnu des tables : signalé aussi', () => {
    const r = buildDamageReport(attacker(FIRE), { ...target(), monsterId: '999999' }, data);
    expect(r.bossPassives?.entries).toEqual([]);
    expect(r.bossPassives?.unresolved[0].reason).toContain('absent');
  });
});

describe('passives — conditions et cibles sur la donnée réelle (revue du 09/10)', () => {
  /** Monstre dont un passif porte `TARGET_ELEMENT` sans ConditionValue
   *  (= Terre) — le cas de 4004005 et de ses copies. */
  const EARTH_GATED = '4004005';
  const reduceOf = (monsterId: string, a: Element, d: Element, forced = false): number =>
    resolveBossPassives(monsterId, data.targets!, data.buffs, {
      attackerElement: a,
      defenderElement: d,
      ...(forced ? { forcedSuperiority: true } : {}),
    })!
      .entries.filter((e) => e.side === 'defender' && e.active && e.buff.type === 'BT_DMG_REDUCE')
      .reduce((sum, e) => sum + (e.buff.value ?? 0), 0);

  it('4004005 : la ligne « Terre » (ConditionValue absente) vaut contre un attaquant Terre', () => {
    const s = staticBossPassives(EARTH_GATED, data.targets!, data.buffs)!;
    const earth = s.entries.find(
      (e) => e.condition === 'TARGET_ELEMENT' && e.conditionValue === undefined,
    );
    expect(earth).toBeDefined();
    const on = resolveBossPassives(EARTH_GATED, data.targets!, data.buffs, {
      attackerElement: Element.Earth,
      defenderElement: Element.Earth,
    })!.entries.find((e) => e.buffId === earth!.buffId)!;
    expect(on.active).toBe(true);
    // Contre Terre, la réduction est celle de la ligne en plus du reste —
    // la même somme qu'un attaquant Eau, que le boss traite pareil.
    expect(reduceOf(EARTH_GATED, Element.Earth, Element.Earth)).toBe(
      reduceOf(EARTH_GATED, Element.Water, Element.Earth),
    );
    expect(reduceOf(EARTH_GATED, Element.Earth, Element.Earth)).toBeGreaterThan(
      reduceOf(EARTH_GATED, Element.Fire, Element.Earth),
    );
  });

  it('avantage forcé : un attaquant neutre a la réduction d’un attaquant gagnant', () => {
    // 401801 (ténèbres) : lumière/ténèbres neutre, aucun élément ne le bat
    // hors cycle — le drapeau donne la somme du cas WIN.
    const neutral = reduceOf('401801', Element.Water, Element.Dark);
    const forced = reduceOf('401801', Element.Water, Element.Dark, true);
    expect(forced).not.toBe(neutral);
    const win = resolveBossPassives('401801', data.targets!, data.buffs, {
      attackerElement: Element.Water,
      defenderElement: Element.Dark,
      forcedSuperiority: true,
    })!.entries.filter((e) => e.condition === 'ATTACKER_ELEMENT_WIN');
    expect(win.length).toBeGreaterThan(0);
    for (const e of win) expect(e.active).toBe(true);
  });

  it('PASSIVE2 : lignes acceptées ; ENEMY_TEAM_<CLASSE> selon la classe de l’attaquant', () => {
    const s = staticBossPassives('4086025', data.targets!, data.buffs)!;
    const mage = s.entries.find((e) => e.buffId === '4086025_6_4');
    // Ligne PASSIVE2 (CDMG des Mages) : présente, ciblée par classe.
    expect(data.buffs.buffs['4086025_6_4']![0].createType).toBe('PASSIVE2');
    expect(mage).toMatchObject({ side: 'attacker', targetClass: 'CCT_MAGE' });
    const activeFor = (cls: string) =>
      resolveBossPassives('4086025', data.targets!, data.buffs, {
        attackerElement: Element.Fire,
        defenderElement: Element.Dark,
        attackerClass: cls,
      })!.entries.find((e) => e.buffId === '4086025_6_4')!.active;
    expect(activeFor('CCT_ATTACKER')).toBe(false);
    expect(activeFor('CCT_MAGE')).toBe(true);
  });

  it('BT_LIMIT_DMG_TURN et BT_STAT_PREMIUM du boss : signalés, jamais tus', () => {
    // 50000010 : plafond de dégâts par tour (licence_upgrade64).
    const limit = staticBossPassives('50000010', data.targets!, data.buffs)!;
    expect(limit.unresolved.find((u) => u.buffId === 'licence_upgrade64')?.reason).toContain(
      'plafond',
    );
    expect(limit.entries.some((e) => e.buffId === 'licence_upgrade64')).toBe(false);
    // 4244004 : Monad Gate route 3, DEF +1000 % de fiche (skill 165301).
    const premium = staticBossPassives('4244004', data.targets!, data.buffs)!;
    expect(
      premium.unresolved.find((u) => u.buffId === 'monad_gate_new_route_3_1')?.reason,
    ).toContain('fiche');
    expect(premium.entries.some((e) => e.buffId === 'monad_gate_new_route_3_1')).toBe(false);
  });

  it('un BuffID listé deux fois sans IsIDOverlap ne compte qu’une fois', () => {
    // Passif 170057 des raids de guilde : `guild_raid_common_10` deux fois.
    const s = staticBossPassives('440400470', data.targets!, data.buffs)!;
    expect(s.entries.filter((e) => e.buffId === 'guild_raid_common_10')).toHaveLength(1);
  });
});

describe('passives — avantage forcé dans le moteur (même drapeau que le taux du coup)', () => {
  const darkBoss = (monsterId: string): TargetBuildInput => ({
    element: 'dark',
    stats: { hp: 500000, def: 2000 },
    boss: true,
    monsterId,
  });
  const reduceOn = (r: ReturnType<typeof buildDamageReport>, slot: string, burst?: number) =>
    r.slots
      .find((sl) => sl.slot === slot && sl.burst === burst)!
      .report.states[0].branches[0].trace!.find((t) => t.ref === '§ 9.2')!.out;

  it('Ame (eau, neutre vs ténèbres) : le S2 et ses bursts voient l’avantage, le S1 non', () => {
    // 2000019_2_1 : BT_DMG_ELEMENT_SUPERIORITY restreint au S2 et aux bursts.
    const r = buildDamageReport(attacker('2000019'), darkBoss('401801'), data, { trace: true });
    const entries = r.bossPassives!.entries;
    const win = entries.filter((e) => e.condition === 'ATTACKER_ELEMENT_WIN');
    const equal = entries.filter((e) => e.condition === 'ATTACKER_ELEMENT_EQUAL');
    expect(win.length).toBeGreaterThan(0);
    expect(equal.length).toBeGreaterThan(0);
    for (const e of win) {
      expect(e.active).toBe(false);
      expect(e.bySkill?.SKT_SECOND).toBe(true);
      expect(e.bySkill?.SKT_FIRST).toBeUndefined();
    }
    for (const e of equal) expect(e.bySkill?.SKT_SECOND).toBe(false);
    // § 9.2 de la ligne S2 = la somme du cas WIN, celle du S1 = le cas neutre.
    const sum = (list: typeof entries) =>
      list
        .filter((e) => e.side === 'defender' && e.buff.type === 'BT_DMG_REDUCE')
        .reduce((acc, e) => acc + (e.buff.value ?? 0), 0);
    const plain = entries.filter((e) => e.side === 'defender' && e.condition === undefined);
    expect(reduceOn(r, 'S2')).toBe(sum([...plain, ...win]));
    expect(reduceOn(r, 'S1')).toBe(sum([...plain, ...equal]));
    expect(reduceOn(r, 'S2')).not.toBe(reduceOn(r, 'S1'));
    expect(reduceOn(r, 'S2', 1)).toBe(reduceOn(r, 'S2'));
  });

  it('drapeau global (passif de fusion 7072) : la condition WIN du kit s’allume aussi', () => {
    // 2700070 : `core_passive_element_super` (SKT_ALL) + `core_passive_element_dmg`
    // (BT_DMG sous ATTACKER_ELEMENT_WIN), même niveau du passif de fusion.
    const r = buildDamageReport(attacker('2700070'), target(), data);
    const dmg = r.kitPassives!.entries.find((e) => e.buffId === 'core_passive_element_dmg');
    expect(dmg).toBeDefined();
    expect(dmg!.active).toBe(true); // ténèbres vs terre : neutre sans le drapeau
    // Côté boss : la réduction « avantage » du Chimera s'applique (feu = WIN).
    const one = r.bossPassives!.entries.find((e) => e.buffId === '1')!;
    expect(one.active).toBe(true);
    expect(one.bySkill).toBeUndefined();
  });
});
