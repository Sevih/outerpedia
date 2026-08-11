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
import { listGuides, readGuideVersionFile } from '@/lib/data/guides';
import { encountersOfGroup } from '@/lib/data/encounters';
import { applyRepin, planRepin, type RepinPlan } from './repin-guides';

const guides = listGuides();
/**
 * Une version RÉELLEMENT épinglée du contenu, s'il en existe une — avec son
 * combat et l'id vivant qu'elle fige. C'est de la donnée éditoriale : zéro
 * version épinglée est un état légitime, d'où la garde dans le test qui s'en
 * sert (un `expect` de plancher rougirait le jour où Sevih dépingle tout).
 */
const pinnedCase = guides
  .filter((g) => g.versions.length)
  .flatMap((g) =>
    g.versions.map((v) => {
      const cfg = readGuideVersionFile<{ group?: string; pinned?: string[] }>(
        g,
        v.key,
        'config.json',
      );
      return { g, key: v.key, group: cfg?.group, pinned: cfg?.pinned ?? [] };
    }),
  )
  .find((c) => c.group && c.pinned.length);
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

  it('le `meta.bossId` d’un guide VERSIONNÉ n’est JAMAIS épinglé', () => {
    // Payé pour de vrai le 12/08 : versionner le boss d'Annihilator a épinglé son
    // `meta.bossId`, alors que sur un guide versionné ce champ ne désigne pas le
    // boss d'une version — il porte le portrait, le H1, l'og:image et la jointure
    // saison, c'est-à-dire l'entité COURANTE. Le figer aurait montré l'ancien
    // boss jusque sur la version la plus récente du guide. Le pin d'un guide
    // versionné vit dans le `config.json` de sa version (décision arbitrée).
    const versioned = guides.filter((g) => g.versions.length && g.bossId);
    expect(
      versioned.length,
      'aucun guide versionné à bossId : le test ne garde rien',
    ).toBeGreaterThan(0);
    for (const g of versioned) {
      const plan = planRepin(g.bossId!, `${g.bossId}@1`);
      const name = `${g.category}/${g.slug}`;
      expect(plan.edits.some((e) => e.guide === name && e.field === 'meta.bossId')).toBe(false);
      // …et ce n'est pas un oubli silencieux : le plan le DIT.
      expect(plan.kept.some((k) => k.guide === name)).toBe(true);
    }
  });

  it('un guide PLAT, lui, voit bien son `meta.bossId` épinglé', () => {
    // La contre-épreuve : sans elle, la règle ci-dessus serait satisfaite par un
    // plan qui n'épingle plus rien du tout.
    const flat = guides.find((g) => !g.versions.length && g.bossId)!;
    expect(flat, 'aucun guide plat à bossId').toBeTruthy();
    const plan = planRepin(flat.bossId!, `${flat.bossId}@1`);
    const name = `${flat.category}/${flat.slug}`;
    expect(plan.edits.some((e) => e.guide === name && e.field === 'meta.bossId')).toBe(true);
  });

  it('une version DÉJÀ figée sur ce monstre n’est pas re-planifiée', () => {
    // L'empilement voulu : versionner une DEUXIÈME fois ne doit toucher que les
    // versions restées en live. Sans ce filtre, chaque tour ferait sauter toutes
    // les vieilles versions sur la dernière archive — elles finiraient par
    // montrer le même boss, et les états intermédiaires, pourtant écrits sur le
    // disque, ne seraient plus lus par personne.
    if (!pinnedCase) return; // aucun contenu épinglé aujourd'hui : rien à garder
    const id = pinnedCase.pinned[0].split('@')[0];
    const plan = planRepin(id, `${id}@9`);
    const name = `${pinnedCase.g.category}/${pinnedCase.g.slug}`;
    const mine = (arr: { guide: string; version?: string }[]) =>
      arr.filter((x) => x.guide === name && x.version === pinnedCase.key);
    expect(mine(plan.pending)).toEqual([]);
    // …et ce n'est pas un silence : le plan DIT qu'il la laisse.
    expect(mine(plan.kept).length).toBe(1);
  });

  it('CONTRE-ÉPREUVE : un monstre du MÊME combat, lui, est bien planifié', () => {
    // Sans elle, un filtre trop large (« cette version porte un pin, on n'y
    // touche plus ») passerait le test précédent tout en rendant impossible
    // d'épingler le deuxième boss d'une rencontre. La liste est CREUSE : le
    // filtre se fait par MONSTRE, pas par version.
    if (!pinnedCase?.group) return;
    const frozen = new Set(pinnedCase.pinned.map((k) => k.split('@')[0]));
    const other = encountersOfGroup(pinnedCase.group)
      .flatMap((e) => e.monsters.map((m) => m.id))
      .find((mid) => !frozen.has(mid));
    if (!other) return; // combat dont TOUS les monstres sont figés
    const plan = planRepin(other, `${other}@1`);
    const name = `${pinnedCase.g.category}/${pinnedCase.g.slug}`;
    expect(plan.pending.some((p) => p.guide === name && p.version === pinnedCase.key)).toBe(true);
  });

  it('un id inconnu ne planifie rien du tout', () => {
    const plan = planRepin('id-qui-nexiste-pas', 'id-qui-nexiste-pas@1');
    expect(plan.edits).toEqual([]);
    expect(plan.pending).toEqual([]);
    expect(plan.kept).toEqual([]);
  });

  it('le plan reporte l’id et la clé qu’on lui a donnés', () => {
    const plan = planRepin('X', 'X@3');
    expect([plan.id, plan.key]).toEqual(['X', 'X@3']);
  });
});

/**
 * L'APPLICATION — le seul geste de cette affaire qui écrit dans le contenu
 * éditorial. L'écriture est substituée par un journal : la vérifier pour de vrai
 * demanderait un faux arbre de guides complet, et le seul autre choix serait de
 * ne pas vérifier le groupage du tout.
 */
describe('applyRepin — ce que « Versionner » écrit', () => {
  /** Journal des écritures : un appel = un `meta.json` réécrit. */
  function journal(ok = true) {
    const calls: Array<{ category: string; slug: string; fields: Record<string, unknown> }> = [];
    const write = async (category: string, slug: string, fields: Record<string, unknown>) => {
      calls.push({ category, slug, fields });
      return ok;
    };
    return { calls, write: write as never };
  }

  it('deux éditions sur le MÊME guide ne font qu’UNE écriture', async () => {
    // Le cas réel `adventure/S1-8-5` : même monstre dans `bossId` ET `monsters`.
    // Écrire édition par édition ferait relire un état mis en cache, et la
    // seconde écriture perdrait la première.
    const id = direct.bossId!;
    const plan = planRepin(id, `${id}@1`);
    const twoFields = plan.edits.filter((e) => e.field === 'meta.monsters');
    if (!twoFields.length) return; // aucun guide à double référence dans la donnée
    const { calls, write } = journal();
    await applyRepin(plan, write);
    const perGuide = new Map<string, number>();
    for (const c of calls)
      perGuide.set(`${c.category}/${c.slug}`, (perGuide.get(`${c.category}/${c.slug}`) ?? 0) + 1);
    expect([...perGuide.values()].every((n) => n === 1)).toBe(true);
    // …et le guide à double référence porte bien SES DEUX champs d'un coup.
    const target = twoFields[0].guide;
    const call = calls.find((c) => `${c.category}/${c.slug}` === target)!;
    expect(Object.keys(call.fields).sort()).toEqual(['bossId', 'monsters']);
  });

  it('écrit les valeurs dans la FORME du champ, pas en texte', async () => {
    // `meta.monsters` est une LISTE. Un « a, b » recollé produirait un JSON faux
    // — silencieusement, et dans le contenu.
    const id = direct.bossId!;
    const { calls, write } = journal();
    await applyRepin(planRepin(id, `${id}@1`), write);
    for (const c of calls) {
      if ('bossId' in c.fields) expect(typeof c.fields.bossId).toBe('string');
      if ('monsters' in c.fields) expect(Array.isArray(c.fields.monsters)).toBe(true);
    }
  });

  it('un guide qu’on ne sait pas écrire est RAPPORTÉ, pas oublié', async () => {
    const plan: RepinPlan = {
      id: 'X',
      key: 'X@1',
      edits: [
        {
          guide: 'categorie/inconnue',
          file: 'categorie/inconnue/meta.json',
          field: 'meta.bossId',
          before: 'X',
          after: 'X@1',
        },
      ],
      pending: [],
      kept: [],
    };
    const { write } = journal(false);
    const res = await applyRepin(plan, write);
    expect(res.skipped).toEqual(['categorie/inconnue']);
    expect(res.applied).toEqual([]);
    expect(res.files).toEqual([]);
  });

  it('les références indirectes ressortent telles quelles', async () => {
    // Elles ne sont PAS appliquées (aucun id à réécrire) : les taire ferait
    // croire le ré-épinglage complet alors qu'il ne l'est pas.
    const plan = planRepin('X', 'X@1');
    const withPending = {
      ...plan,
      pending: [{ guide: 'a/b', origin: 'meta.group' as const, group: 'g' }],
    };
    const { write } = journal();
    expect((await applyRepin(withPending, write)).pending).toEqual(withPending.pending);
  });

  it('un plan vide n’écrit rien', async () => {
    const { calls, write } = journal();
    const res = await applyRepin(planRepin('id-qui-nexiste-pas', 'id-qui-nexiste-pas@1'), write);
    expect(calls).toEqual([]);
    expect(res.files).toEqual([]);
  });

  it('une référence de VERSION est épinglée dans son `config.json`', async () => {
    // Le cas majoritaire, et le seul qui compte pour joint challenge / world
    // boss / guild raid : le guide ne nomme aucun monstre, donc le pin ne peut
    // aller que là. Sans cette écriture, versionner un boss de mode versionné ne
    // change RIEN à l'écran — l'archive existe et personne ne la lit.
    if (!viaGroup) return; // aucun guide versionné à combat peuplé
    const id = encountersOfGroup(viaGroup.group)[0].monsters[0].id;
    const plan = planRepin(id, `${id}@1`);
    const pins: string[] = [];
    const pin = async (c: string, s: string, v: string, key: string) => {
      pins.push(`${c}/${s}@${v}=${key}`);
      return true;
    };
    const { write } = journal();
    const res = await applyRepin(plan, write, pin as never);
    expect(pins.length).toBeGreaterThan(0);
    expect(pins.every((p) => p.endsWith(`=${id}@1`))).toBe(true);
    // …et ce qui a été épinglé ne reste PAS en attente.
    expect(res.pinnedVersions.length).toBe(pins.length);
    expect(res.pending.some((p) => p.origin === 'version.config')).toBe(false);
  });

  it('ce qu’on ne sait pas épingler RESTE en attente', async () => {
    // Un guide PLAT qui désigne un combat n'a pas de version où poser le pin —
    // et il suit le live par nature. Le dire plutôt que le perdre.
    const plan: RepinPlan = {
      id: 'X',
      key: 'X@1',
      edits: [],
      pending: [{ guide: 'a/b', origin: 'meta.group', group: 'g' }],
      kept: [],
    };
    const { write } = journal();
    const res = await applyRepin(plan, write, (async () => true) as never);
    expect(res.pinnedVersions).toEqual([]);
    expect(res.pending).toEqual(plan.pending);
  });
});
