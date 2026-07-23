/**
 * Tests du générateur skills — les DEUX registres actés (TODO 17/07) :
 *
 *   1. CŒURS PURS en synthétique : `slugTeam`/`subTypeOf` (petits résolveurs
 *      d'enum aux pièges réels — CSV, NONE) et le CŒUR D'ASSEMBLAGE partagé
 *      `assembleSkill` isolé avec des maps de buffs VIDES (le cas « sans effet »
 *      exerce desc/maxLevel/offensive/target/range/subType/tri des niveaux, sans
 *      dépendre du graphe de buffs). Aucune table requise.
 *
 *   2. INVARIANTS RÉFÉRENTIELS sur `data/generated/` committé (modèle
 *      encounters.test.ts) : forme des niveaux, cohérence du flag `offensive`,
 *      des bursts, et surtout — chaque skill référencé par un personnage doit
 *      exister dans le catalogue. Une dérive du générateur n'a AUCUN symptôme
 *      visible sinon (fiche perso qui rend un skill vide).
 *
 * La suite tourne SANS `.gamedata` (contrainte CI) : rien ici n'appelle
 * `buildSkills()` ni `loadTable`.
 */
import { describe, expect, it } from 'vitest';
import skillsData from '../../data/generated/skills.json';
import charactersData from '../../data/generated/characters.json';
import type { LangDict } from '../lib/lang';
import type { Row } from '../lib/tables';
import { assembleSkill, slugTeam, subTypeOf, type Skill } from './skills';

// ─── 1. Cœurs purs (synthétique) ─────────────────────────────────────────────

describe('slugTeam — cible/portée en slug', () => {
  it('minuscule le 1er token, ÉCLATE le CSV (plusieurs cibles → la première)', () => {
    expect(slugTeam('ENEMY_TEAM, ALLY')).toBe('enemy_team');
    expect(slugTeam('SELF')).toBe('self');
  });

  it('NONE / vide / absent → undefined (pas de slug « none »)', () => {
    expect(slugTeam('NONE')).toBeUndefined();
    expect(slugTeam('')).toBeUndefined();
    expect(slugTeam(undefined)).toBeUndefined();
  });
});

describe('subTypeOf — ACTIVE/PASSIVE → slug', () => {
  it('mappe les deux valeurs connues', () => {
    expect(subTypeOf('ACTIVE')).toBe('active');
    expect(subTypeOf('PASSIVE')).toBe('passive');
  });

  it('tout le reste → null (pas un slug bidon)', () => {
    expect(subTypeOf('NONE')).toBeNull();
    expect(subTypeOf('')).toBeNull();
    expect(subTypeOf(undefined)).toBeNull();
  });
});

describe('assembleSkill — cœur d’assemblage (buffs vides)', () => {
  // Maps vides : `expandBuffIds` ne rend rien → ni effets ni vars, on isole
  // desc/niveaux/target/range/type/subType/offensive.
  const noBuffs = new Map() as Parameters<typeof assembleSkill>[2];
  const noGroups = new Map() as Parameters<typeof assembleSkill>[3];
  const dict = (en: string): LangDict => ({ en, jp: '', kr: '', zh: '' });

  it('skill offensif : type/subType/cible/portée/icône + niveaux TRIÉS', () => {
    const tskill = new Map<string, LangDict>([
      ['SK1_Name', dict('Fireball')],
      ['SK1_Desc', dict('Deal damage to an enemy.')],
    ]);
    const s: Row = {
      ID: 'SK1',
      NameID: 'SK1_Name',
      DescID: 'SK1_Desc',
      SkillType: 'SKT_FIRST',
      SkillSubType: 'ACTIVE',
      TargetTeamType: 'ENEMY_TEAM',
      RangeType: 'SINGLE',
      IconName: 'ic_sk1',
    };
    // Lignes de niveau DÉLIBÉRÉMENT en désordre — le cœur doit trier.
    const lvls: Row[] = [
      { SkillLevel: '2', DamageFactor: '120', Cool: '3' },
      { SkillLevel: '1', DamageFactor: '100', Cool: '3', StartCool: '1' },
    ];
    const { skill, shapes } = assembleSkill(s, lvls, noBuffs, noGroups, tskill, 'character');

    expect(skill.id).toBe('SK1');
    expect(skill.name.en).toBe('Fireball');
    expect(skill.type).toBe('first');
    expect(skill.subType).toBe('active');
    expect(skill.offensive).toBe(true); // damageFactor > 0
    expect(skill.target).toBe('enemy_team');
    expect(skill.range).toBe('single');
    expect(skill.icon).toBe('ic_sk1');
    expect(skill.maxLevel).toBe(2);
    expect(skill.desc?.en).toBe('Deal damage to an enemy.');
    expect(skill.levels.map((l) => l.level)).toEqual([1, 2]);
    expect(skill.levels[0]).toMatchObject({ level: 1, damageFactor: 100, cool: 3, startCool: 1 });
    expect(shapes).toEqual([]); // aucun buff en entrée
  });

  it('chain_passive est offensif même SANS damageFactor (attaque en chaîne)', () => {
    const tskill = new Map<string, LangDict>([['N', dict('Chain')]]);
    const s: Row = { ID: 'C1', NameID: 'N', SkillType: 'SKT_CHAIN_PASSIVE' };
    const { skill } = assembleSkill(
      s,
      [{ SkillLevel: '1' }],
      noBuffs,
      noGroups,
      tskill,
      'character',
    );
    expect(skill.type).toBe('chain_passive');
    expect(skill.offensive).toBe(true);
  });

  it('passif unique (persos) : desc REPLIÉE sur le DescID du niveau 1', () => {
    // Pas de DescID sur le skill → la desc vit sur la ligne de niveau
    // (SE_DESC_SKILL08_* du passif de transcendance). Variante `character`.
    const tskill = new Map<string, LangDict>([
      ['N', dict('Passive')],
      ['LV_Desc', dict('+4% Ally Team Critical Damage.')],
    ]);
    const s: Row = {
      ID: 'P1',
      NameID: 'N',
      SkillType: 'SKT_UNIQUE_PASSIVE',
      SkillSubType: 'PASSIVE',
    };
    const { skill } = assembleSkill(
      s,
      [{ SkillLevel: '1', DescID: 'LV_Desc' }],
      noBuffs,
      noGroups,
      tskill,
      'character',
    );
    expect(skill.subType).toBe('passive');
    expect(skill.offensive).toBe(false);
    expect(skill.desc?.en).toBe('+4% Ally Team Critical Damage.');
    // La desc PROPRE au niveau est aussi émise (chaque palier a son texte).
    expect(skill.levels[0].desc?.en).toBe('+4% Ally Team Critical Damage.');
  });

  it('variante `monster` : PAS de repli de desc ni de gains de jauge', () => {
    // Le discriminant : un monstre n'a ni DescID de niveau ni GainAP/GainCP.
    const tskill = new Map<string, LangDict>([
      ['N', dict('Bite')],
      ['LV_Desc', dict('should be ignored')],
    ]);
    const s: Row = { ID: 'M1', NameID: 'N', SkillType: 'SKT_FIRST' };
    const { skill } = assembleSkill(
      s,
      [{ SkillLevel: '1', DescID: 'LV_Desc', GainAP: '20' }],
      noBuffs,
      noGroups,
      tskill,
      'monster',
    );
    expect(skill.desc).toBeUndefined(); // pas de repli sur le DescID de niveau
    expect(skill.levels[0].desc).toBeUndefined();
    expect(skill.levels[0].gainAP).toBeUndefined(); // gains de jauge = persos seulement
  });

  it('cible/portée NONE ou absente → champs omis (pas de slug « none »)', () => {
    const tskill = new Map<string, LangDict>([['N', dict('X')]]);
    const s: Row = { ID: 'S', NameID: 'N', SkillType: 'SKT_FIRST', TargetTeamType: 'NONE' };
    const { skill } = assembleSkill(
      s,
      [{ SkillLevel: '1' }],
      noBuffs,
      noGroups,
      tskill,
      'character',
    );
    expect(skill.target).toBeUndefined();
    expect(skill.range).toBeUndefined();
    expect(skill.subType).toBeNull();
  });
});

// ─── 2. Invariants sur la donnée committée ───────────────────────────────────

// Au BUILD, le catalogue est déballé : skills.json committé = Record<id, Skill>
// directement (pas l'enveloppe `{ skills }` du staging).
const skills = skillsData as unknown as Record<string, Skill>;
const characters = charactersData as unknown as Record<string, { skills: string[] }>;
const skillIds = new Set(Object.keys(skills));
const skillEntries = Object.entries(skills);

describe('skills.json — invariants structurels', () => {
  it('catalogue non vide, chaque entrée bien formée', () => {
    expect(skillEntries.length).toBeGreaterThan(0);
    const bad: string[] = [];
    for (const [id, s] of skillEntries) {
      if (s.id !== id) bad.push(`${id} : id interne ${s.id}`);
      if (!s.type || s.type !== s.type.toLowerCase()) bad.push(`${id} : type « ${s.type} »`);
      if (!(s.subType === 'active' || s.subType === 'passive' || s.subType === null))
        bad.push(`${id} : subType « ${s.subType} »`);
      if (typeof s.offensive !== 'boolean') bad.push(`${id} : offensive non booléen`);
      if (!(s.maxLevel >= 1)) bad.push(`${id} : maxLevel ${s.maxLevel}`);
      // NB : `levels` peut être VIDE sur un skill orphelin (ligne morte que le
      // jeu embarque, sans nom ni niveau — le générateur ne drope rien) ; la
      // non-vacuité est exigée SEULEMENT des skills rendus, cf. l'invariant
      // référentiel plus bas.
    }
    expect(bad).toEqual([]);
  });

  it('niveaux : uniques, strictement croissants, dans [1, maxLevel]', () => {
    const bad: string[] = [];
    for (const [id, s] of skillEntries) {
      let prev = 0;
      for (const lv of s.levels) {
        if (lv.level <= prev || lv.level < 1 || lv.level > s.maxLevel) {
          bad.push(`${id} : niveau ${lv.level} (prev ${prev}, max ${s.maxLevel})`);
          break;
        }
        prev = lv.level;
      }
    }
    expect(bad).toEqual([]);
  });

  it('`offensive` = (un niveau inflige des dégâts) OU chain_passive', () => {
    const bad: string[] = [];
    for (const [id, s] of skillEntries) {
      const expected =
        s.levels.some((l) => (l.damageFactor ?? 0) > 0) || s.type === 'chain_passive';
      if (s.offensive !== expected) bad.push(`${id} : ${s.offensive} ≠ ${expected}`);
    }
    expect(bad).toEqual([]);
  });

  it('bursts : burstAP a ≥ 2 paliers et son 1er = requireAP', () => {
    const bad: string[] = [];
    for (const [id, s] of skillEntries) {
      if (!s.burstAP) continue;
      if (s.burstAP.length < 2) bad.push(`${id} : burstAP ${s.burstAP.length} palier(s)`);
      if (s.burstAP[0] !== s.requireAP)
        bad.push(`${id} : burstAP[0] ${s.burstAP[0]} ≠ AP ${s.requireAP}`);
    }
    expect(bad).toEqual([]);
  });

  it('effets : chaque forme porte une famille et une catégorie', () => {
    const bad: string[] = [];
    for (const [id, s] of skillEntries) {
      for (const e of s.effects ?? []) {
        if (!e.family || !e.category)
          bad.push(`${id} : effet ${e.buff ?? '?'} sans famille/catégorie`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('skills.json ↔ characters.json — invariant référentiel', () => {
  const referenced = new Set(Object.values(characters).flatMap((c) => c.skills ?? []));

  it('chaque skill référencé par un perso existe dans le catalogue', () => {
    const orphans: string[] = [];
    for (const [cid, c] of Object.entries(characters)) {
      for (const sid of c.skills ?? []) {
        if (!skillIds.has(sid)) orphans.push(`${cid} → ${sid}`);
      }
    }
    expect(orphans).toEqual([]);
  });

  it('tout skill RENDU (référencé par un perso) porte au moins un niveau', () => {
    // Contraste avec les orphelins : un skill affiché sur une fiche sans niveau
    // rendrait des valeurs vides. La non-vacuité ne vaut que pour ceux-là.
    const empty: string[] = [];
    for (const sid of referenced) {
      if (skills[sid] && !skills[sid].levels?.length) empty.push(sid);
    }
    expect(empty).toEqual([]);
  });
});
