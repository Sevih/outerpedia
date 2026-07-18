import { describe, expect, it } from 'vitest';
import type { Glossaries, Skill } from '@contracts';
import glossariesData from '@data/generated/glossaries.json';
import skillsData from '@data/generated/skills.json';
import {
  buildBurstViews,
  buildChainView,
  buildStatusMap,
  cardEffects,
  dedupSkills,
  immunityChipEffects,
  mainSkills,
  monsterChipMeta,
  monsterSkillViews,
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
// Deux tooltips du glossaire committé : n'importe lequel produit une chip (la
// résolution ne teste que l'appartenance à l'index). Calculés, pas codés en dur.
const REAL_TOOLTIP = Object.keys(G.effectByTooltip)[0];
const REAL_TOOLTIP2 = Object.keys(G.effectByTooltip)[1];

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

/** Skill de monstre : nom VIDE par défaut (opt-in via `over.name`) — le nom
 * décide si une carte s'affiche. */
const mon = (id: string, type: string, over: Partial<Skill> = {}): Skill =>
  skill({ id, type, name: { en: '', jp: '', kr: '', zh: '' }, ...over });
/** La vue d'un skill donné dans une liste de vues monstre. */
type MView = ReturnType<typeof monsterSkillViews>[number];
const viewOf = (views: MView[], id: string) => views.find((v) => v.skill.id === id);
const refsOf = (v?: MView) => (v?.effects ?? []).map((e) => e.tooltip ?? e.label);

describe('monsterSkillViews — réattribution du câblage', () => {
  it('DUPLIQUE un effet de passif vers son skill déclencheur (caller) ET le garde', () => {
    // Prototype EX-78 / Irregular Queen : le bloc de buffs est câblé sur un
    // passif qui pointe le skill principal via CallerSkillType.
    const trigger = mon('m', 'first', {
      name: NAME,
      desc: { en: 'triggers', jp: '', kr: '', zh: '' },
    });
    const passive = mon('p', 'monster_2', {
      name: NAME,
      effects: [eff({ buff: 'b1', tooltip: REAL_TOOLTIP, type: 'BT_STUN', caller: 'first' })],
    });
    const views = monsterSkillViews([trigger, passive], {});
    expect(refsOf(viewOf(views, 'm'))).toContain(REAL_TOOLTIP); // dupliqué
    expect(refsOf(viewOf(views, 'p'))).toContain(REAL_TOOLTIP); // conservé
  });

  it('IGNORE le caller sur un skill ACTIF (le buff y est réutilisé d’un autre kit)', () => {
    const active = mon('a', 'first', {
      name: NAME,
      effects: [eff({ buff: 'b1', tooltip: REAL_TOOLTIP, type: 'BT_STUN', caller: 'second' })],
    });
    const other = mon('o', 'second', { name: NAME });
    const views = monsterSkillViews([active, other], {});
    expect(refsOf(viewOf(views, 'o'))).toEqual([]); // pas de duplication
    expect(refsOf(viewOf(views, 'a'))).toContain(REAL_TOOLTIP); // reste sur le sien
  });

  it('DÉPLACE un effet vers le seul skill dont la desc nomme son buff', () => {
    const carrier = mon('a', 'monster_1', {
      name: NAME,
      desc: { en: 'does nothing special', jp: '', kr: '', zh: '' },
      effects: [eff({ buff: 'bx', tooltip: REAL_TOOLTIP, type: 'BT_STUN' })],
    });
    const owner = mon('b', 'first', {
      name: NAME,
      desc: { en: 'applies bx to enemies', jp: '', kr: '', zh: '' },
    });
    const views = monsterSkillViews([carrier, owner], {});
    expect(refsOf(viewOf(views, 'a'))).toEqual([]); // parti
    expect(refsOf(viewOf(views, 'b'))).toContain(REAL_TOOLTIP); // arrivé
  });

  it('FUSIONNE les chips d’un rage_finish sans nom/desc dans sa carte rage_enter', () => {
    const enter = mon('e', 'rage_enter1', {
      name: NAME,
      desc: { en: 'enrage begins', jp: '', kr: '', zh: '' },
      effects: [eff({ buff: 'be', tooltip: REAL_TOOLTIP, type: 'BT_STUN' })],
    });
    const finish = mon('f', 'rage_finish1', {
      effects: [eff({ buff: 'bf', tooltip: REAL_TOOLTIP2, type: 'BT_STUN' })],
    });
    const views = monsterSkillViews([enter, finish], {});
    expect(viewOf(views, 'f')).toBeUndefined(); // pas de carte finish
    expect(refsOf(viewOf(views, 'e'))).toEqual(
      expect.arrayContaining([REAL_TOOLTIP, REAL_TOOLTIP2]),
    );
  });

  it('SUPPRIME un rage_finish sans son rage_enter jumeau (câblage mort cloné)', () => {
    const finish = mon('f', 'rage_finish1', {
      name: NAME,
      desc: { en: 'orphan', jp: '', kr: '', zh: '' },
      effects: [eff({ tooltip: REAL_TOOLTIP, type: 'BT_STUN' })],
    });
    expect(monsterSkillViews([finish], {})).toEqual([]);
  });

  it('MASQUE une variante technique (ni nom ni desc, effets déjà portés ailleurs)', () => {
    const documented = mon('d', 'first', {
      name: NAME,
      effects: [eff({ buff: 'bv', tooltip: REAL_TOOLTIP, type: 'BT_STUN' })],
    });
    const variant = mon('v', 'backup_aerial', {
      effects: [eff({ buff: 'bv', tooltip: REAL_TOOLTIP, type: 'BT_STUN' })],
    });
    const views = monsterSkillViews([documented, variant], {});
    expect(viewOf(views, 'v')).toBeUndefined();
    expect(viewOf(views, 'd')).toBeDefined();
  });

  it('ne fait JAMAIS de chip d’un buff WG côté monstre', () => {
    const s = mon('w', 'first', {
      name: NAME,
      effects: [eff({ buff: 'bw', tooltip: REAL_TOOLTIP, type: 'BT_WG_RECOVER' })],
    });
    const views = monsterSkillViews([s], {});
    expect(refsOf(viewOf(views, 'w'))).toEqual([]);
  });

  it('respecte un porteur imposé par la curation (chipOwner)', () => {
    const carrier = mon('a', 'monster_1', {
      name: NAME,
      desc: { en: 'applies bz', jp: '', kr: '', zh: '' },
      effects: [eff({ buff: 'bz', tooltip: REAL_TOOLTIP, type: 'BT_STUN' })],
    });
    const target = mon('b', 'second', { name: NAME });
    // La desc du porteur nomme `bz` (règle c → resterait), mais chipOwner impose 'b'.
    const views = monsterSkillViews([carrier, target], { chipOwner: { bz: ['b'] } });
    expect(refsOf(viewOf(views, 'a'))).toEqual([]);
    expect(refsOf(viewOf(views, 'b'))).toContain(REAL_TOOLTIP);
  });
});

describe('immunityChipEffects', () => {
  const plainType = Object.keys(G.effectByKey.debuff).find(
    (k) => !k.includes('|') && !/\d/.test(k),
  )!;
  const statKey = Object.keys(G.effectByKey.debuff).find((k) => k.startsWith('BT_STAT|'))!;
  const st = statKey.split('|')[1];

  it('résout tooltips, types de mécanique et baisses de stat ; renvoie les réfs mortes', () => {
    const { effects, unresolved } = immunityChipEffects({
      immuneTooltips: [REAL_TOOLTIP],
      buffImmune: [plainType, 'BT_TOTALEMENT_BIDON'],
      statBuffImmune: [st],
    });
    expect(unresolved).toContain('BT_TOTALEMENT_BIDON');
    expect(effects.length).toBeGreaterThan(0);
    expect(effects.every((e) => e.family === 'immunity' && e.category === 'debuff')).toBe(true);
  });

  it('déréférence les déclinaisons numérotées vers la mécanique de base', () => {
    // `BT_COOL2_CHARGE` → base `BT_COOL_CHARGE` si la forme exacte manque : on
    // fabrique une forme numérotée dont le retrait des chiffres redonne un type
    // connu, et on vérifie qu'elle résout quand même (pas dans `unresolved`).
    const numbered = `${plainType.slice(0, 3)}9${plainType.slice(3)}`;
    expect(numbered.replace(/\d+/g, '')).toBe(plainType); // forme bien dérivée
    const { unresolved } = immunityChipEffects({ buffImmune: [numbered] });
    expect(unresolved).not.toContain(numbered);
  });
});

describe('buildChainView', () => {
  it('rend null sans chain_passive', () => {
    expect(buildChainView([skill({ id: 'x', type: 'first' })], 'en')).toBeNull();
  });

  it('répartit les chips strike→chaîne et backup→duo, un niveau par palier', () => {
    const cp = skill({
      id: 'cp',
      type: 'chain_passive',
      name: NAME,
      maxLevel: 2,
      levels: [{ level: 1 }, { level: 2 }],
    });
    const strike = skill({
      id: 'st',
      type: 'strike_1',
      effects: [eff({ buff: 'bc', tooltip: REAL_TOOLTIP, type: 'BT_STUN' })],
    });
    const backup = skill({
      id: 'bk',
      type: 'backup_1',
      effects: [eff({ buff: 'bd', tooltip: REAL_TOOLTIP2, type: 'BT_STUN' })],
    });
    const view = buildChainView([cp, strike, backup], 'en', {})!;
    expect(view).not.toBeNull();
    expect(view.maxLevel).toBe(2);
    expect(view.levels).toHaveLength(2);
    expect(view.chainEffects.map((e) => e.tooltip)).toContain(REAL_TOOLTIP);
    expect(view.dualEffects.map((e) => e.tooltip)).toContain(REAL_TOOLTIP2);
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

/** Refs des chips de carte (tooltip ou label), curation substituable. */
const cardRefs = (skills: Skill[], s: Skill, cur = {}) =>
  (cardEffects(skills, s, cur) ?? []).map((c) => c.tooltip ?? c.label);

describe('cardEffects — composition de la carte perso', () => {
  it('agrège les effets propres du skill', () => {
    const s = skill({ id: 'first1', type: 'first', effects: [eff({ tooltip: REAL_TOOLTIP })] });
    expect(cardRefs([s], s)).toContain(REAL_TOOLTIP);
  });

  it('unit les VARIANTES du même type (formes / copies)', () => {
    const a = skill({ id: 'a', type: 'first', effects: [eff({ tooltip: REAL_TOOLTIP })] });
    const b = skill({ id: 'b', type: 'first', effects: [eff({ tooltip: REAL_TOOLTIP2 })] });
    expect(cardRefs([a, b], a)).toEqual(expect.arrayContaining([REAL_TOOLTIP, REAL_TOOLTIP2]));
  });

  it('un skill BURSTABLE hérite des effets de ses burst_1..3 ; un non-burstable non', () => {
    const burst = skill({ id: 'b1', type: 'burst_1', effects: [eff({ tooltip: REAL_TOOLTIP2 })] });
    const burstable = skill({
      id: 'u',
      type: 'ultimate',
      burstAP: [10],
      effects: [eff({ tooltip: REAL_TOOLTIP })],
    });
    expect(cardRefs([burstable, burst], burstable)).toEqual(
      expect.arrayContaining([REAL_TOOLTIP, REAL_TOOLTIP2]),
    );

    const plain = skill({ id: 'u2', type: 'ultimate', effects: [eff({ tooltip: REAL_TOOLTIP })] });
    expect(cardRefs([plain, burst], plain)).not.toContain(REAL_TOOLTIP2);
  });

  it('un effet de PASSIF rattaché au kit (caller) devient une chip du skill', () => {
    const first = skill({ id: 'f', type: 'first' });
    const passive = skill({
      id: 'p',
      type: 'class_passive',
      effects: [eff({ caller: 'first', tooltip: REAL_TOOLTIP2 })],
    });
    expect(cardRefs([first, passive], first)).toContain(REAL_TOOLTIP2);
  });

  it('curation chipHide masque une chip de LA carte (par cardId)', () => {
    const s = skill({ id: 'first1', type: 'first', effects: [eff({ tooltip: REAL_TOOLTIP })] });
    expect(cardRefs([s], s, { chipHide: { first1: [REAL_TOOLTIP] } })).not.toContain(REAL_TOOLTIP);
  });

  it('curation chipAdd ajoute une réf résoluble ; ignore une réf morte', () => {
    const s = skill({ id: 'first1', type: 'first', effects: [eff({ tooltip: REAL_TOOLTIP })] });
    expect(cardRefs([s], s, { chipAdd: { first1: [REAL_TOOLTIP2] } })).toContain(REAL_TOOLTIP2);
    expect(cardRefs([s], s, { chipAdd: { first1: ['__mort__'] } })).not.toContain('__mort__');
  });

  it('aucune chip → undefined (pas de carte vide)', () => {
    const s = skill({ id: 'x', type: 'first' });
    expect(cardEffects([s], s, {})).toBeUndefined();
  });
});

// Un tooltip RÉEL du glossaire dont l'effet résolu porte une icône ET un vrai nom
// (nom ≠ clé = pas un repli) — requis pour driver `levelTooltipEffects` sur la
// donnée committée. Calculé, jamais codé en dur.
const ICON = (() => {
  for (const t of Object.keys(G.effectByTooltip)) {
    const meta = monsterChipMeta(eff({ tooltip: t }));
    if (meta?.icon && meta.name && meta.name !== t) return { tooltip: t, name: meta.name };
  }
  return undefined;
})();

describe('cardEffects — statuts de NIVEAU (levelTooltipEffects)', () => {
  it.skipIf(!ICON)('un tooltip de niveau à icône devient une chip', () => {
    const s = skill({
      id: 'first1',
      type: 'first',
      levels: [{ level: 1, tooltips: [ICON!.tooltip] }],
    });
    expect(cardRefs([s], s)).toContain(ICON!.tooltip);
  });

  it.skipIf(!ICON)('un statut cité comme CONDITION par la desc n’est PAS une chip', () => {
    const s = skill({
      id: 'first1',
      type: 'first',
      desc: {
        en: `Deals damage. If the caster has ${ICON!.name}, deal more.`,
        jp: '',
        kr: '',
        zh: '',
      },
      levels: [{ level: 1, tooltips: [ICON!.tooltip] }],
    });
    expect(cardRefs([s], s)).not.toContain(ICON!.tooltip);
    expect(cardEffects([s], s, {})).toBeUndefined();
  });
});
