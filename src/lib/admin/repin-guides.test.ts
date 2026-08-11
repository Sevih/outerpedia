/**
 * Plan de ré-épinglage après « Versionner » un boss (étape 2/3).
 *
 * Le plan n'écrit rien : il dit ce que le geste FERAIT. Ces tests gardent les
 * deux natures de référence, qui ne se traitent pas pareil — un guide qui NOMME
 * le monstre (`meta.bossId`) est éditable tout de suite, un guide qui l'atteint
 * par un COMBAT (`meta.group`, config de version) ne l'est pas.
 *
 * Les ids sont DÉRIVÉS de la donnée committée, jamais écrits en dur : un id figé
 * ici casserait à la première ré-extraction, comme le comptage figé de
 * `tags.test.ts` (corrigé le 26/07).
 */
import { describe, expect, it } from 'vitest';
import { listGuides } from '@/lib/data/guides';
import { encountersOfGroup } from '@/lib/data/encounters';
import { planRepin } from './repin-guides';

const guides = listGuides();
/** Premier guide qui NOMME son boss — référence directe. */
const direct = guides.find((g) => g.bossId)!;
/** Premier guide VERSIONNÉ dont une version désigne un combat peuplé. */
const viaGroup = guides
  .filter((g) => g.versions.length)
  .flatMap((g) => (g.group ? [{ g, group: g.group }] : []))
  .find(({ group }) => encountersOfGroup(group).some((e) => e.monsters.length));

describe('planRepin — ce que « Versionner » ferait', () => {
  it('la donnée de test n’est pas vide', () => {
    // Sans ça, tout ce qui suit passerait en ne testant rien.
    expect(direct?.bossId).toBeTruthy();
    expect(guides.some((g) => g.versions.length)).toBe(true);
  });

  it('un guide qui NOMME le monstre donne une édition directe', () => {
    const id = direct.bossId!;
    const mine = planRepin(id, `${id}@1`).edits.filter(
      (e) => e.guide === `${direct.category}/${direct.slug}`,
    );
    const boss = mine.find((e) => e.field === 'meta.bossId');
    expect(boss?.before).toBe(id);
    expect(boss?.after).toBe(`${id}@1`);
    expect(boss?.file).toBe(`${direct.category}/${direct.slug}/meta.json`);
  });

  it('un guide peut donner PLUSIEURS éditions, une par champ — jamais deux fois le même', () => {
    // Cas réel : `adventure/S1-8-5` porte le même id dans `bossId` ET dans
    // `monsters`. Deux éditions, deux champs, MÊME fichier — l'application
    // devra donc grouper par fichier plutôt qu'écrire une fois par édition.
    const id = direct.bossId!;
    const edits = planRepin(id, `${id}@1`).edits;
    const seen = edits.map((e) => `${e.guide}·${e.field}`);
    expect(new Set(seen).size).toBe(seen.length);
  });

  it('une référence DÉJÀ épinglée n’est pas re-planifiée', () => {
    // C'est ce qui fait que le geste se maintient seul : on ne ré-épingle que ce
    // qui est encore en live. Un `<id>@<k>` n'est plus une référence vivante.
    const id = direct.bossId!;
    expect(planRepin(`${id}@1`, `${id}@2`).edits).toEqual([]);
  });

  it('un monstre atteint par un COMBAT est rapporté, pas édité', () => {
    // Le rendu résout ces monstres depuis `encounters.json` : il n'y a aucun id
    // à réécrire dans le guide, donc le pin devra vivre dans une liste à part.
    if (!viaGroup) return; // aucun guide versionné à combat peuplé : rien à garder
    const id = encountersOfGroup(viaGroup.group)[0].monsters[0].id;
    const plan = planRepin(id, `${id}@1`);
    const name = `${viaGroup.g.category}/${viaGroup.g.slug}`;
    expect(plan.pending.some((p) => p.guide === name)).toBe(true);
    expect(plan.edits.some((e) => e.guide === name)).toBe(false);
  });

  it('un id inconnu ne planifie rien du tout', () => {
    const plan = planRepin('id-qui-nexiste-pas', 'id-qui-nexiste-pas@1');
    expect(plan.edits).toEqual([]);
    expect(plan.pending).toEqual([]);
  });

  it('le plan reporte l’id et la clé qu’on lui a donnés', () => {
    const plan = planRepin('X', 'X@3');
    expect([plan.id, plan.key]).toEqual(['X', 'X@3']);
  });
});
