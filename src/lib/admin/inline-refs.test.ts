/**
 * Unicité des listes d'autocomplétion de l'éditeur assisté.
 *
 * `InlineTextField` keye ses options par `value` : un doublon y produit un
 * avertissement React « two children with the same key » et, pire, des entrées
 * dupliquées ou omises. C'est arrivé le 26/07 en dev sur `BT_AP_CHARGE`, une clé
 * revendiquée par le glossaire (des DEUX côtés) et par trois effets curés — la
 * dédup se faisait par apparence, ce qui garantissait l'unicité de la signature
 * mais pas celle de la clé.
 *
 * Deux niveaux : le cœur pur (`effectRefsFromKeys`) et l'invariant sur la DONNÉE
 * RÉELLE, qui est le seul à pouvoir attraper une clé nouvellement partagée.
 */
import { describe, expect, it } from 'vitest';
import { buildInlineRefs, effectRefsFromKeys, type InlineRefs } from './inline-refs';

/** Deux effets qui n'ont RIEN en commun : apparences distinctes. */
const look = (en: string, icon = `${en}.png`, desc = `desc de ${en}`) => ({
  name: { en },
  icon,
  desc: { en: desc },
});

describe('effectRefsFromKeys — une entrée par apparence, une seule par clé', () => {
  it('une clé réclamée deux fois ne sort qu’UNE fois (le bug du 26/07)', () => {
    // Le cas réel : `BT_AP_CHARGE` vue plusieurs fois, chaque source apportant
    // son apparence. Avant le correctif, les deux survivaient avec la MÊME
    // `value` — d'où le doublon de clé React.
    let n = 0;
    const refs = effectRefsFromKeys(['BT_AP_CHARGE', 'BT_AP_CHARGE'], () =>
      look(`Apparence ${++n}`),
    );
    expect(refs).toHaveLength(1);
    expect(refs[0].value).toBe('BT_AP_CHARGE');
  });

  it('les `value` sont uniques même quand toutes les apparences diffèrent', () => {
    let n = 0;
    const keys = ['A', 'A', 'B', 'B', 'B', 'C'];
    const refs = effectRefsFromKeys(keys, () => look(`Effet ${++n}`));
    expect(refs.map((r) => r.value).sort()).toEqual(['A', 'B', 'C']);
  });

  it('des variantes à apparence IDENTIQUE fondent sur la clé la plus courte', () => {
    const refs = effectRefsFromKeys(['BT_SHIELD_IR', 'BT_SHIELD'], () => look('Shield'));
    expect(refs).toEqual([{ value: 'BT_SHIELD', label: 'Shield' }]);
  });

  it('à longueur égale, la plus petite alphabétiquement gagne (déterminisme)', () => {
    const refs = effectRefsFromKeys(['BT_ZZZ', 'BT_AAA'], () => look('Same'));
    expect(refs[0].value).toBe('BT_AAA');
    // L'ordre d'entrée ne doit rien changer.
    expect(effectRefsFromKeys(['BT_AAA', 'BT_ZZZ'], () => look('Same'))[0].value).toBe('BT_AAA');
  });

  it('deux homonymes à DESCRIPTION différente restent deux effets distincts', () => {
    const refs = effectRefsFromKeys(['K1', 'K2'], (k) =>
      look('Poison', 'poison.png', k === 'K1' ? 'dégâts sur la durée' : 'réduit les soins'),
    );
    expect(refs).toHaveLength(2);
  });

  it('l’étiquette vient de ce que la clé RÉSOUT, pas de la clé', () => {
    const refs = effectRefsFromKeys(['BT_AP_CHARGE'], () => look('Charge AP'));
    expect(refs[0]).toEqual({ value: 'BT_AP_CHARGE', label: 'Charge AP' });
  });

  it('une clé qui ne résout pas garde la clé pour étiquette', () => {
    expect(effectRefsFromKeys(['BT_ORPHAN'], () => undefined)).toEqual([
      { value: 'BT_ORPHAN', label: 'BT_ORPHAN' },
    ]);
  });

  it('trie par étiquette', () => {
    const refs = effectRefsFromKeys(['K1', 'K2', 'K3'], (k) =>
      look({ K1: 'Zeal', K2: 'Alacrity', K3: 'Might' }[k] ?? k),
    );
    expect(refs.map((r) => r.label)).toEqual(['Alacrity', 'Might', 'Zeal']);
  });
});

describe('buildInlineRefs — invariant sur la donnée réelle', () => {
  // Une seule construction : elle lit le glossaire, les persos, les items et les
  // guides sur disque.
  const refs = buildInlineRefs();
  const lists = Object.entries(refs) as [keyof InlineRefs, { value: string }[]][];

  it('les listes ne tournent pas à vide', () => {
    // Sans ça, le test d'unicité passerait sur des listes vides.
    const empty = lists.filter(([, l]) => l.length === 0).map(([name]) => name);
    expect(empty).toEqual([]);
  });

  it('aucune liste ne propose deux fois la même `value`', () => {
    // C'est l'invariant dont dépendent les clés React d'`InlineTextField`.
    const dups = lists.flatMap(([name, list]) => {
      const seen = new Set<string>();
      return list
        .filter((r) => (seen.has(r.value) ? true : (seen.add(r.value), false)))
        .map((r) => `${name}: ${r.value}`);
    });
    expect(dups).toEqual([]);
  });
});
