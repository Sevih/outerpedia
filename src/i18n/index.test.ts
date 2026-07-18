import { describe, expect, it } from 'vitest';
import { makeT, type Messages } from '@/i18n';

// `makeT` prend un dictionnaire déjà chargé — on le teste en pur, sans I/O.
const t = (dict: Record<string, string>) => makeT(dict as Messages);

describe('makeT', () => {
  it('interpole les variables `{name}`', () => {
    const f = t({ greet: 'Bonjour {name}' } as never);
    expect(f('greet' as never, { name: 'Sevih' })).toBe('Bonjour Sevih');
  });

  it('renvoie la clé brute quand la traduction manque', () => {
    const f = t({} as never);
    expect(f('page.missing' as never)).toBe('page.missing');
  });

  it('laisse `{k}` littéral quand la variable n’est pas fournie', () => {
    const f = t({ x: 'a {b} c' } as never);
    expect(f('x' as never, {})).toBe('a {b} c');
  });

  it('résout les pluriels ICU : `one` quand count === 1, `#` = le nombre', () => {
    const f = t({ n: '{count, plural, one {# unité} other {# unités}}' } as never);
    expect(f('n' as never, { count: 1 })).toBe('1 unité');
    expect(f('n' as never, { count: 5 })).toBe('5 unités');
    expect(f('n' as never, { count: 0 })).toBe('0 unités');
  });

  it('combine pluriel et interpolation dans la même chaîne', () => {
    const f = t({ n: '{who} a {count, plural, one {# point} other {# points}}' } as never);
    expect(f('n' as never, { who: 'Ai', count: 2 })).toBe('Ai a 2 points');
  });
});
