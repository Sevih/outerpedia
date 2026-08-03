/**
 * Les options d'équipement de l'admin ne mentent pas sur la classe.
 *
 * Bug du 26/07 (signalé par Sevih) : les familles multi-classes — Briareos,
 * Gorgon, 5 objets DISTINCTS en jeu, un par classe — ne donnaient qu'UNE option,
 * portant l'id de TÊTE (le striker) tout en annonçant les 5 classes. Elle passait
 * donc le filtre de classe de l'éditeur, et choisir « Briareos's Ambition » sur un
 * mage enregistrait l'accessoire du striker.
 *
 * L'invariant gardé ici est celui qui manquait : si l'objet pointé par une option
 * est réservé à une classe, l'option doit annoncer CETTE classe et elle seule.
 * Testé sur la donnée COMMITTÉE, seule capable d'attraper une nouvelle famille
 * multi-classes ajoutée par un patch.
 */
import { describe, expect, it } from 'vitest';
import weaponData from '@data/generated/equipment/weapon.json';
import accessoryData from '@data/generated/equipment/accessory.json';
import talismanData from '@data/generated/equipment/talisman.json';
import { gearSelectOptions, type GearOption } from './gear-options';

const table = {
  ...(weaponData as Record<string, { classLimit?: string | null; name?: { en?: string } }>),
  ...(accessoryData as Record<string, { classLimit?: string | null; name?: { en?: string } }>),
  ...(talismanData as Record<string, { classLimit?: string | null; name?: { en?: string } }>),
};

const options = gearSelectOptions();
const classed: [string, GearOption[]][] = [
  ['weapons', options.weapons],
  ['amulets', options.amulets],
  ['talismans', options.talismans],
];

describe('options d’équipement (admin)', () => {
  it('aucune liste ne tourne à vide', () => {
    // Sans ça les invariants ci-dessous passeraient sur des listes vides.
    const empty = [...classed, ['sets', options.sets] as const]
      .filter(([, l]) => l.length === 0)
      .map(([n]) => n);
    expect(empty).toEqual([]);
  });

  it('une option réservée à une classe l’annonce, et elle SEULE', () => {
    // LE test du bug : l'option 1793 pointait l'accessoire striker en annonçant
    // les cinq classes, donc le filtre de l'éditeur la laissait passer partout.
    const liars = classed.flatMap(([slot, list]) =>
      list
        .filter((o) => {
          const real = table[o.id]?.classLimit;
          if (!real) return false; // objet libre : rien à vérifier
          return o.classLimits?.length !== 1 || o.classLimits[0] !== real;
        })
        .map((o) => `${slot} · ${o.label} (id ${o.id} = ${table[o.id]?.classLimit})`),
    );
    expect(liars).toEqual([]);
  });

  it('deux options d’un même slot ne portent jamais le même libellé', () => {
    // Cinq lignes identiques dans un select : c'est ce qui rendait le bug
    // invisible à l'œil — on ne pouvait pas savoir laquelle on prenait.
    const dups = classed.flatMap(([slot, list]) => {
      const seen = new Set<string>();
      return list
        .filter((o) => (seen.has(o.label) ? true : (seen.add(o.label), false)))
        .map((o) => `${slot} · ${o.label}`);
    });
    expect(dups).toEqual([]);
  });

  it('Briareos et Gorgon donnent bien une option PAR classe', () => {
    const CLASSES = ['striker', 'defender', 'ranger', 'mage', 'healer'];
    for (const name of ["Briareos's Ambition", "Gorgon's Vanity"]) {
      const found = options.amulets.filter((o) => o.label.startsWith(name));
      expect(found.map((o) => o.classLimits?.[0]).sort(), name).toEqual([...CLASSES].sort());
      // Et chaque option pointe un objet RÉELLEMENT de cette classe.
      for (const o of found) expect(table[o.id]?.classLimit, o.label).toBe(o.classLimits?.[0]);
    }
    for (const name of ["Briareos's Recklessness", "Gorgon's Wrath"]) {
      const found = options.weapons.filter((o) => o.label.startsWith(name));
      expect(found.map((o) => o.classLimits?.[0]).sort(), name).toEqual([...CLASSES].sort());
    }
  });

  it('les options d’une famille ordinaire restent uniques', () => {
    // Le découpage ne doit toucher QUE les familles multi-classes.
    const perName = new Map<string, number>();
    for (const o of options.amulets) {
      const base = o.label.replace(/ \[[a-z]+\]$/, '');
      perName.set(base, (perName.get(base) ?? 0) + 1);
    }
    const split = [...perName].filter(([, n]) => n > 1).map(([n]) => n);
    expect(split.sort()).toEqual(["Briareos's Ambition", "Gorgon's Vanity"]);
  });
});
