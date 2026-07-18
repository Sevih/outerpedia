import { describe, expect, it } from 'vitest';
import type { Glossaries, Skill } from '@contracts';
import glossariesData from '@data/generated/glossaries.json';
import skillsData from '@data/generated/skills.json';
import {
  buildBurstViews,
  buildStatusMap,
  dedupSkills,
  mainSkills,
  monsterChipMeta,
  toClientEffects,
} from '@/lib/skill-view';

/**
 * Verrous du module de vue « kit de skills » — 741 lignes de règles fines
 * (câblage, transcendance, chips) chacune justifiée par un cas réel en
 * commentaire mais aucune verrouillée jusqu'ici. On teste les règles DÉTERMINISTES
 * en synthétique et on ANCRE les cas positifs sur le glossaire committé (une clé
 * tooltip réelle) — la suite tourne donc sans `.gamedata`.
 */
const G = glossariesData as unknown as Glossaries;
const SKILLS = skillsData as unknown as Record<string, Skill>;
// Un tooltip du glossaire committé : n'importe lequel produit une chip (la
// résolution ne teste que l'appartenance à l'index). Calculé, pas codé en dur.
const REAL_TOOLTIP = Object.keys(G.effectByTooltip)[0];

type Effect = NonNullable<Skill['effects']>[number];
const NAME = { en: 'x', jp: '', kr: '', zh: '' };

function eff(partial: Partial<Effect>): Effect {
  return { family: 'stat', category: 'buff', type: 'BT_STAT', target: 'me', ...partial } as Effect;
}
function skill(partial: Partial<Skill> & { id: string }): Skill {
  return {
    name: NAME,
    type: 'first',
    subType: 'active',
    offensive: true,
    maxLevel: 1,
    levels: [{ level: 1 }],
    ...partial,
  } as Skill;
}
/** Ids des chips produites (tooltip ou label) — comparaison stable. */
const chipRefs = (s: Skill) => (toClientEffects(s) ?? []).map((c) => c.tooltip ?? c.label);

describe('dedupSkills', () => {
  it('garde la 1re occurrence de chaque id, dans l’ordre', () => {
    const out = dedupSkills([skill({ id: 'a' }), skill({ id: 'b' }), skill({ id: 'a' })]);
    expect(out.map((s) => s.id)).toEqual(['a', 'b']);
  });
});

describe('mainSkills', () => {
  it('rend first/second/ultimate dans l’ordre, en gardant la variante la plus complète', () => {
    const skills = [
      skill({ id: 'f1', type: 'first', levels: [{ level: 1 }] }),
      skill({ id: 'f2', type: 'first', levels: [{ level: 1 }, { level: 2 }] }),
      skill({ id: 's', type: 'second' }),
      skill({ id: 'u', type: 'ultimate' }),
    ];
    const out = mainSkills(skills);
    expect(out.map((s) => s.id)).toEqual(['f2', 's', 'u']);
  });

  it('filtre les types absents (pas de trou dans la liste)', () => {
    const out = mainSkills([skill({ id: 'f', type: 'first' })]);
    expect(out.map((s) => s.type)).toEqual(['first']);
  });
});

describe('toClientEffects — règles de câblage (ce qui n’est PAS une chip)', () => {
  it('exclut les enfants de groupe aléatoire (`choice`)', () => {
    const s = skill({ id: 'x', effects: [eff({ tooltip: REAL_TOOLTIP, choice: true })] });
    expect(chipRefs(s)).toEqual([]);
  });

  it('exclut les buffs arbitrés non-chips (Ais/Astei/Ember)', () => {
    const s = skill({
      id: 'x',
      effects: [eff({ tooltip: REAL_TOOLTIP, buff: '2000096_chain_1_1' })],
    });
    expect(chipRefs(s)).toEqual([]);
  });

  it('exclut les BT_STAT à label seul (magnitude de stat, pas un statut nommé)', () => {
    const s = skill({
      id: 'x',
      effects: [eff({ type: 'BT_STAT', label: 'SYS_BUFF_ADDITIVE_TURN' })],
    });
    expect(chipRefs(s)).toEqual([]);
  });

  it('exclut le label de magnitude générique SYS_BUFF_DMG', () => {
    const s = skill({ id: 'x', effects: [eff({ type: 'BT_DMG_TEST', label: 'SYS_BUFF_DMG' })] });
    expect(chipRefs(s)).toEqual([]);
  });

  it('exclut les dégâts fixes (reverse heal) ciblés sur soi/allié — coût en HP', () => {
    const s = skill({ id: 'x', effects: [eff({ type: 'BT_REVERSE_HEAL', target: 'me' })] });
    expect(chipRefs(s)).toEqual([]);
  });

  it('exclut un tooltip irrésoluble (réf morte)', () => {
    const s = skill({ id: 'x', effects: [eff({ tooltip: '__inexistant__' })] });
    expect(chipRefs(s)).toEqual([]);
  });

  it('PRODUIT une chip pour un tooltip résoluble du glossaire', () => {
    const s = skill({ id: 'x', effects: [eff({ tooltip: REAL_TOOLTIP })] });
    expect(chipRefs(s)).toEqual([REAL_TOOLTIP]);
  });
});

describe('toClientEffects — upgrades de transcendance', () => {
  const transcend = (extra: Partial<Effect>, vars?: Record<string, unknown>) =>
    skill({
      id: 'x',
      levels: [{ level: 1, ...(vars ? { vars } : {}) }] as Skill['levels'],
      effects: [eff({ tooltip: REAL_TOOLTIP, buff: 'trancendent_1', ...extra })],
    });

  it('cantonne un palier autonome (buff `trancendent_*` hors niveau 1, sans caller)', () => {
    expect(chipRefs(transcend({}))).toEqual([]);
  });

  it('GARDE l’effet quand il est rattaché à un skill (`caller`) — il décrit ce skill', () => {
    expect(chipRefs(transcend({ caller: 'first' }))).toEqual([REAL_TOOLTIP]);
  });

  it('GARDE l’effet accordé DÈS le niveau 1 (présent dans les vars) — kit de base', () => {
    expect(chipRefs(transcend({}, { trancendent_1: { v: '5' } }))).toEqual([REAL_TOOLTIP]);
  });
});

describe('monsterChipMeta', () => {
  it('ne produit rien pour les effets WG (jauge, pas un statut)', () => {
    expect(monsterChipMeta(eff({ type: 'BT_WG_ATTACK' }))).toBeNull();
  });

  it('résout nom + nature pour un tooltip du glossaire', () => {
    const meta = monsterChipMeta(eff({ tooltip: REAL_TOOLTIP, category: 'debuff' }));
    expect(meta).not.toBeNull();
    expect(typeof meta!.name).toBe('string');
    expect(meta!.isDebuff).toBe(true);
  });
});

describe('buildBurstViews', () => {
  it('numérote 1..3, hérite le coût AP du skill burstable, prend la variante la plus complète', () => {
    const skills = [
      skill({ id: 'main', type: 'first', burstAP: [3, 4, 5] }),
      skill({ id: 'b1', type: 'burst_1', desc: NAME }),
      skill({ id: 'b2a', type: 'burst_2', desc: NAME, levels: [{ level: 1 }] }),
      skill({ id: 'b2b', type: 'burst_2', desc: NAME, levels: [{ level: 1 }, { level: 2 }] }),
      skill({ id: 'b3', type: 'burst_3', desc: NAME }),
    ];
    const views = buildBurstViews(skills, 'en');
    expect(views.map((v) => v.level)).toEqual([1, 2, 3]);
    expect(views.map((v) => v.cost)).toEqual([3, 4, 5]);
    // burst_2 : la variante à 2 niveaux l’emporte sur celle à 1.
    expect(views[1].vars).toBeUndefined(); // dernier niveau sans vars dans le fixture
  });
});

describe('smoke — tourne sur la donnée committée', () => {
  const sample = Object.values(SKILLS).slice(0, 400);

  it('toClientEffects ne jette sur aucun skill réel', () => {
    expect(() => sample.forEach((s) => toClientEffects(s))).not.toThrow();
  });

  it('buildStatusMap rend une map (statuts nommés) sans jeter', () => {
    const map = buildStatusMap(sample, 'en');
    expect(map).toBeTypeOf('object');
    // Au moins un statut résolu sur 400 skills réels — sinon le pont est cassé.
    expect(Object.keys(map).length).toBeGreaterThan(0);
  });
});
