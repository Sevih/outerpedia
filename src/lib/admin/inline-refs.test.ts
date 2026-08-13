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
import { checkText, resolveInlineSegments } from '@/lib/parse-text';
import { getT } from '@/i18n';
import { gearDisplayNames, getAmuletFamilies, getWeaponFamilies } from '@/lib/data/equipment';

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

  /**
   * LE CONTRAT CROISÉ : ce que le picker propose, le résolveur doit l'accepter.
   * Deux listes tenues séparément dérivent — et la dérive est invisible, puisque
   * le bouton « +item » n'a aucune raison de savoir ce que `checkText` sait.
   */
  it('chaque `value` proposée est une référence que `checkText` valide', () => {
    const tag: Partial<Record<keyof InlineRefs, string>> = {
      effectBuff: 'B',
      effectDebuff: 'D',
      stat: 'S',
      element: 'E',
      klass: 'C',
      character: 'P',
      characterEE: 'EE',
      weapon: 'I-W',
      amulet: 'I-A',
      talisman: 'I-T',
      set: 'AS',
      item: 'I-I',
      guide: 'L',
    };
    const bad = lists.flatMap(([name, list]) =>
      list
        .flatMap((r) => checkText(`{${tag[name]}/${r.value}}`))
        .filter((c) => !c.ok)
        .map((c) => `${name}: {${c.type}/${c.value}} — ${c.reason}`),
    );
    expect(bad).toEqual([]);
  });
});

/**
 * VARIANTES DE CLASSE — Briareos et Gorgon sont CINQ objets par famille, un par
 * classe, chacun sa tuile, son passif, ses mains et sa page détail. Le picker
 * n'en proposait qu'un : les quatre autres étaient inatteignables depuis
 * l'éditeur, et le nom nu inséré rendait le striker à leur place — un rendu faux
 * en silence, ce qui est pire qu'une référence manquante.
 */
describe('équipement à variantes de classe — une entrée par objet réel', () => {
  const refs = buildInlineRefs();
  // Le TYPE de tag vient du slot, pas d'une devinette : `{I-W/…}` et `{I-A/…}`
  // ont chacun leur index, et se tromper de type rend « référence inconnue » —
  // ce qui ferait passer le test suivant pour la mauvaise raison.
  const kinds = [
    { type: 'I-W' as const, list: refs.weapon, families: getWeaponFamilies() },
    { type: 'I-A' as const, list: refs.amulet, families: getAmuletFamilies() },
  ].map((k) => ({ ...k, varied: k.families.filter((f) => f.classPassives?.length) }));

  it('la donnée en contient (sinon tout ce qui suit ne teste rien)', () => {
    expect(kinds.every((k) => k.varied.length > 0)).toBe(true);
  });

  it('chaque variante est proposable, et pas seulement le nom nu', () => {
    for (const { list, varied, type } of kinds) {
      const proposed = new Set(list.map((r) => r.value));
      const missing = varied.flatMap((f) =>
        gearDisplayNames(f)
          .map(({ name }) => name.en)
          .filter((n) => !proposed.has(n)),
      );
      expect(missing, `${type} : variantes absentes du picker`).toEqual([]);
    }
  });

  it('deux variantes ne rendent PAS la même chose', async () => {
    // LA contre-épreuve. Proposer cinq noms qui pointent tous le striker
    // satisferait le cas précédent tout en gardant le bug intact : ce qui compte
    // est que le tag résolve vers la tuile, le passif et la PAGE de sa classe.
    const ctx = { lang: 'en' as const, t: await getT('en') };
    for (const { type, varied } of kinds) {
      for (const f of varied) {
        const rendered = gearDisplayNames(f).map(({ name }) => {
          const [seg] = resolveInlineSegments(`{${type}/${name.en}}`, ctx);
          return seg?.t === 'item' ? `${seg.iconSrc}|${seg.href}|${seg.desc ?? ''}` : 'NON-ITEM';
        });
        expect(rendered, `${f.name.en} : une variante ne résout pas`).not.toContain('NON-ITEM');
        expect(new Set(rendered).size, `${f.name.en} : variantes confondues`).toBe(rendered.length);
      }
    }
  });

  it('le nom NU reste résolvable — le contenu déjà publié ne casse pas', () => {
    // Il n'est plus PROPOSÉ (ces familles sont cinq objets, pas six), mais des
    // textes l'utilisent déjà : il continue de rendre la tête de famille.
    for (const { type, varied } of kinds) {
      for (const f of varied) {
        const [check] = checkText(`{${type}/${f.name.en}}`);
        expect(check.ok, `${f.name.en} : nom nu cassé`).toBe(true);
      }
    }
  });
});
