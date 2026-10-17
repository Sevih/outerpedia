import { describe, expect, it } from 'vitest';
import {
  fillSkillPlaceholders,
  fillValuePlaceholders,
  skillPlaceholderIds,
  unsignedValueIds,
  type SkillBuffVars,
} from './placeholders';
import { fillPlaceholders as fillDatagen } from './buff';

const vars: Record<string, SkillBuffVars> = { x: { c: '70%', v: '-50', t: '2' } };
const varsOf = (id: string) => vars[id];

describe('fillSkillPlaceholders', () => {
  it('crochet insensible à la casse, comme le client : [buff_v_x] = [Buff_V_x]', () => {
    expect(fillSkillPlaceholders('[buff_v_x]', varsOf)).toBe(
      fillSkillPlaceholders('[Buff_V_x]', varsOf),
    );
    expect(fillSkillPlaceholders('[buff_c_x] [BUFF_T_x]', varsOf)).toBe('70% 2');
  });

  it('valeur absente → ?', () => {
    expect(fillSkillPlaceholders('[Buff_V_inconnu]', varsOf)).toBe('?');
  });

  it('un « - » écrit par le gabarit n’est pas doublé par une valeur négative', () => {
    expect(fillSkillPlaceholders('抵抗-[buff_v_x]', varsOf)).toBe('抵抗-50');
    expect(fillSkillPlaceholders('抵抗-<color=#28d9ed>[buff_v_x]</color>', varsOf)).toBe(
      '抵抗-<color=#28d9ed>50</color>',
    );
    expect(fillSkillPlaceholders('[buff_v_x] boss', varsOf)).toBe('-50 boss');
  });
});

describe('skillPlaceholderIds', () => {
  it('relève les ids dans toutes les langues données, toutes casses', () => {
    const ids = skillPlaceholderIds(['[Buff_C_a] et [Buff_T_a]', undefined, 'JP : [buff_v_b]']);
    expect([...ids].sort()).toEqual(['a', 'b']);
  });
});

describe('unsignedValueIds — signe de [Buff_V] (décision du 17/10)', () => {
  it('« by » juste devant le placeholder → valeur absolue', () => {
    const t =
      "decreases all enemies' <color=#28d9ed>AP</color> by <color=#28d9ed>[Buff_V_a]</color>.";
    expect(unsignedValueIds([t])).toEqual(new Set(['a']));
  });

  it('sans « by » → signe gardé', () => {
    expect(unsignedValueIds(['[buff_v_a] boss Resilience'])).toEqual(new Set());
    expect(unsignedValueIds(['Core Overdrive: [Buff_V_a] Chain Points'])).toEqual(new Set());
  });

  it('« increase(s) / raise(s) … by » → signe gardé (le retirer inverserait le sens)', () => {
    const t =
      'Increases the cooldown of <color=#28d9ed>X</color> by <color=#28d9ed>[Buff_V_a] turn(s)</color>';
    expect(unsignedValueIds([t])).toEqual(new Set());
    expect(unsignedValueIds(['Raises SPD by [Buff_V_a]'])).toEqual(new Set());
  });

  it('le verbe compté est le dernier de la phrase : « increases X and reduces Y by » → absolu', () => {
    expect(unsignedValueIds(['Increases ATK and reduces DEF by [Buff_V_a]'])).toEqual(
      new Set(['a']),
    );
    expect(unsignedValueIds(['Reduces DEF.\\nIncreases ATK by [Buff_V_a]'])).toEqual(new Set());
  });

  it('[Buff_C] / [Buff_T] ne comptent pas ; un id cité sans « by » ailleurs garde son signe', () => {
    expect(unsignedValueIds(['reduces CD by [Buff_T_a]'])).toEqual(new Set());
    expect(unsignedValueIds(['reduces AP by [Buff_V_a]. [Buff_V_a] AP'])).toEqual(new Set());
  });
});

describe('fillValuePlaceholders', () => {
  const v = {
    value: '2%',
    rate: '50%',
    turn: '1',
    value2: '3',
    turn2: '2',
    value4: '4',
    value5: '5',
  };
  const tpl =
    '[Value] [+Value] [-Value] [Rate] [RATE] [Turn] [+Turn] [-Turn] [Value2] [+Value2] [Turn2] [Value4] [Value5]';

  it('la copie du datagen (sans couleur par défaut) délègue au module', () => {
    expect(fillDatagen(tpl, v)).toBe(fillValuePlaceholders(tpl, v, false));
    expect(fillDatagen(tpl, v, true)).toBe(fillValuePlaceholders(tpl, v, true));
    expect(fillValuePlaceholders('[+Turn] [-Value]', v, false)).toBe('1 -2%');
  });
});
