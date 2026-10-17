import { describe, expect, it } from 'vitest';
import type { MonsterSkillsFile, SkillsFile } from '@contracts';
import { resolveSkillText, splitChainDual } from '@/lib/skills';
import { getSkills } from '@/lib/data/skills';
import { loadDataJson } from '@/lib/data/disk';

const H = (t: string) => `<color=#ffd732>${t}</color>`;

describe('splitChainDual', () => {
  it('coupe sur le deux-points ASCII (EN/KR)', () => {
    const r = splitChainDual(`${H('Chain')}: A. ${H('Dual Attack')}: B.`);
    expect(r.chain).toBe(`${H('Chain')}: A.`);
    expect(r.dual).toBe(`${H('Dual Attack')}: B.`);
  });

  it('coupe aussi sur le deux-points pleine largeur （：） de JP/ZH', () => {
    const r = splitChainDual(`${H('チェーン効果')}：A。\n\n${H('デュアルアタック')}：B。`);
    expect(r.chain).toBe(`${H('チェーン効果')}：A。`);
    expect(r.dual).toBe(`${H('デュアルアタック')}：B。`);
  });

  it('une seule section → tout est chain', () => {
    expect(splitChainDual(`${H('Chain')}: A.`)).toEqual({ chain: `${H('Chain')}: A.`, dual: '' });
  });
});

describe('resolveSkillText — sur la donnée réelle', () => {
  /** Descs rendues de chaque niveau, toutes langues : [skill, niveau, langue, gabarit, vars]. */
  const rendered = (file: SkillsFile | MonsterSkillsFile) =>
    Object.entries(file).flatMap(([id, s]) =>
      s.levels.flatMap((lv) =>
        Object.entries(lv.desc ?? s.desc ?? {}).map(([lang, t]) => ({
          where: `${id} lv${lv.level} ${lang}`,
          template: t ?? '',
          vars: lv.vars ?? {},
        })),
      ),
    );

  it('skills de monstres : aucun placeholder bien formé ne reste brut, quelle que soit sa casse', () => {
    const monsters = loadDataJson<MonsterSkillsFile>('generated/monster-skills.json');
    const raw = rendered(monsters)
      .filter((r) => /\[buff_[cvt]_/i.test(r.template))
      .filter((r) => /\[buff_[cvt]_[^\]<\s]+\]/i.test(resolveSkillText(r.template, r.vars)))
      .map((r) => r.where);
    expect(raw).toEqual([]);
  });

  it('skills de persos : chaque placeholder cité, toutes langues, a sa valeur au niveau', () => {
    const missing = rendered(getSkills()).flatMap((r) =>
      [...r.template.matchAll(/\[buff_([cvt])_(.+?)\]/gi)]
        .filter(([, k, id]) => !r.vars[id]?.[k.toLowerCase() as 'c' | 'v' | 't'])
        .map(([m]) => `${r.where} ${m}`),
    );
    expect(missing).toEqual([]);
  });
});
