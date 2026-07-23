/**
 * Invariants du générateur monster-skills sur `data/generated/monster-skills.json`
 * committé. Le générateur n'est qu'un wrapper du CŒUR D'ASSEMBLAGE partagé
 * `assembleSkill` (variante `monster`), DÉJÀ couvert en synthétique par
 * skills.test.ts (« variante monster : pas de repli de desc ni de gains de
 * jauge ») → ici, seulement les invariants de forme sur la sortie servie.
 *
 * Tourne SANS `.gamedata` (rien n'appelle buildMonsterSkills).
 */
import { describe, expect, it } from 'vitest';
import monsterSkillsData from '../../data/generated/monster-skills.json';
import type { Skill } from './skills';

const skills = monsterSkillsData as unknown as Record<string, Skill>;
const entries = Object.entries(skills);

describe('monster-skills.json — invariants de forme', () => {
  it('catalogue non vide, chaque entrée bien formée', () => {
    expect(entries.length).toBeGreaterThan(0);
    const bad: string[] = [];
    for (const [id, s] of entries) {
      if (s.id !== id) bad.push(`${id} : id interne ${s.id}`);
      // `type` peut être VIDE côté monstre (une ligne sans SkillType — les
      // monstres n'en déclarent pas toujours, ≠ persos où tous ont un SKT_*) ;
      // on exige seulement qu'il soit en minuscule (slug), pas qu'il soit peuplé.
      if (s.type !== s.type.toLowerCase()) bad.push(`${id} : type « ${s.type} »`);
      if (!(s.subType === 'active' || s.subType === 'passive' || s.subType === null))
        bad.push(`${id} : subType « ${s.subType} »`);
      if (typeof s.offensive !== 'boolean') bad.push(`${id} : offensive non booléen`);
      if (!(s.maxLevel >= 1)) bad.push(`${id} : maxLevel ${s.maxLevel}`);
    }
    expect(bad).toEqual([]);
  });

  it('niveaux : uniques, croissants, dans [1, maxLevel]', () => {
    const bad: string[] = [];
    for (const [id, s] of entries) {
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
    for (const [id, s] of entries) {
      const expected =
        s.levels.some((l) => (l.damageFactor ?? 0) > 0) || s.type === 'chain_passive';
      if (s.offensive !== expected) bad.push(`${id} : ${s.offensive} ≠ ${expected}`);
    }
    expect(bad).toEqual([]);
  });
});
