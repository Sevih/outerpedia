import { describe, expect, it } from 'vitest';
import { splitChainDual } from '@/lib/skills';

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
