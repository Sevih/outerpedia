/**
 * Contrat de la MÉMOÏSATION du diff par entité — `entityBuckets` d'`admin-inbox`.
 *
 * Hors Next (quick, sous tsx), `cache()` de React ne retient rien : chaque
 * `bucketsOf` relançait le moteur de revue, dix fois par tableau de bord (2 à
 * 3 s). Le mémo de module tient sur une EMPREINTE des fichiers que le moteur
 * lit ; ce fichier verrouille ses promesses :
 *   - même empreinte → UN calcul, la même `Map` ;
 *   - un fichier d'entrée qui bouge (committé, curé, table, icônes d'effets ;
 *     réécrit, seulement touché, ajouté ou retiré) → un calcul de plus ;
 *   - l'instantané des codes promo, que le tableau de bord réécrit en le lisant,
 *     n'en est pas ;
 *   - ni un calcul trop proche d'une écriture ni un échec ne sont retenus.
 *   - le « hors site » des monstres (`offSiteOf`) sort du même calcul : à
 *     empreinte égale, aucune revue de plus.
 * Et que `buildInbox` rend ce qu'il rendait, pour UN calcul — chaque item
 * adressé à QUICK (`tab`), plus à l'admin (lot C14).
 *
 * Moteur FACTICE et compté (`reviewAll`) : le vrai ouvre les tables du jeu. Les
 * fichiers, eux, sont de vrais fichiers dans un tmp (`sandbox()`), parce que
 * l'empreinte est faite de vrais `statSync`. L'horloge est avancée d'une minute :
 * tout ce que le test écrit est « ancien » pour le module, sauf quand un cas
 * veut justement une écriture récente.
 */
import { rmSync, utimesSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { sandbox } from './store-fixture';
import type { DiffBuckets } from './review-store';

const engine = vi.hoisted(() => ({ reviewAll: vi.fn(), tags: vi.fn(), site: vi.fn() }));
// Le faux diff d'une cible EST déjà ses buckets : les deux passes le rendent tel
// quel — sauf quand un cas pose un périmètre (`engine.site`, le diff gardé).
vi.mock('@/lib/admin/review-store', () => ({
  reviewAll: engine.reviewAll,
  reviewBuckets: (diff: unknown) => diff,
}));
vi.mock('@/lib/admin/monster-review', () => ({
  actionableDiff: (id: string, diff: unknown) => engine.site(id, diff) ?? diff,
}));
vi.mock('@/lib/admin/tag-control', () => ({ collectTagOccurrences: engine.tags }));

const box = sandbox('inbox-');

/** Une provenance de tag, au format de `collectTagOccurrences` : un texte de la fiche d'un perso. */
const PROS = 'curated pros-cons · Valentine (2000012).pros[1].en';

const COMMITTED = 'data/generated/characters.json';
const EQUIPMENT = 'data/generated/equipment/weapon.json';
const CURATED = 'data/curated/items.json';
const TABLE = '.gamedata/parsed/TextSystem.json';
const EFFECT_ICONS = 'data/editorial/effect-icons.json';
const INPUTS = [COMMITTED, EQUIPMENT, CURATED, TABLE, EFFECT_ICONS];

const buckets = (over: Partial<DiffBuckets> = {}): DiffBuckets => ({
  new: 0,
  diff: 0,
  minor: 0,
  typo: 0,
  removed: 0,
  ...over,
});

/** Ce que le faux moteur rend : une revue par entité donnée. */
const engineReturns = (byId: Record<string, DiffBuckets>) =>
  engine.reviewAll.mockImplementation(() =>
    Object.entries(byId).map(([id, diff]) => ({ id, diff })),
  );

/** L'heure RÉELLE, celle des mtime que le disque pose — l'horloge du test est en avance. */
const diskNow = () => vi.getRealSystemTime();

/** Pose le mtime d'un fichier `seconds` après l'heure réelle, sans toucher à ses octets. */
const touch = (rel: string, seconds: number) => {
  const at = (diskNow() + seconds * 1000) / 1000;
  utimesSync(join(box.root, rel), at, at);
};

/** Module FRAIS : le mémo est un état de module, un cas ne doit pas hériter du précédent. */
const load = async () => {
  vi.resetModules();
  return import('./admin-inbox');
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  for (const rel of INPUTS) box.putRaw(rel, '{}');
  rmSync(join(box.root, '.assets-staging'), { recursive: true, force: true });
  vi.setSystemTime(diskNow() + 60_000);
  engine.reviewAll.mockReset();
  engine.tags.mockReset().mockReturnValue([]);
  engine.site.mockReset();
  engineReturns({ character: buckets({ new: 1 }) });
});

afterAll(() => {
  vi.useRealTimers();
  box.dispose();
});

describe('entityBuckets — mémoïsé sur l’empreinte des fichiers lus', () => {
  it('même empreinte : un seul calcul, la même Map', async () => {
    const { entityBuckets, bucketsOf } = await load();
    const first = entityBuckets();
    expect(entityBuckets()).toBe(first);
    expect(bucketsOf('character')).toEqual(buckets({ new: 1 }));
    expect(bucketsOf('inconnue')).toEqual(buckets());
    expect(engine.reviewAll).toHaveBeenCalledTimes(1);
  });

  it('un committé réécrit (une promotion) : un second calcul, le nouveau diff', async () => {
    const { entityBuckets, bucketsOf } = await load();
    entityBuckets();
    engineReturns({ character: buckets() });
    box.putRaw(COMMITTED, '{"2000001":{}}');
    expect(bucketsOf('character')).toEqual(buckets());
    entityBuckets();
    expect(engine.reviewAll).toHaveBeenCalledTimes(2);
  });

  it.each(INPUTS)(
    '%s seulement touché (mêmes octets, mtime neuf) : un second calcul',
    async (rel) => {
      const { entityBuckets } = await load();
      entityBuckets();
      touch(rel, 10);
      entityBuckets();
      entityBuckets();
      expect(engine.reviewAll).toHaveBeenCalledTimes(2);
    },
  );

  it('un fichier ajouté, puis retiré : un calcul chacun', async () => {
    const { entityBuckets } = await load();
    entityBuckets();
    box.putRaw('data/curated/effects.json', '{}');
    entityBuckets();
    expect(engine.reviewAll).toHaveBeenCalledTimes(2);
    rmSync(join(box.root, 'data/curated/effects.json'));
    entityBuckets();
    entityBuckets();
    expect(engine.reviewAll).toHaveBeenCalledTimes(3);
  });

  it('l’instantané des codes promo, réécrit par chaque lecture du tableau de bord, ne compte pas', async () => {
    box.putRaw('data/curated/coupons.json', '[]');
    const { entityBuckets } = await load();
    const first = entityBuckets();
    box.putRaw('data/curated/coupons.json', '[{"code":"OUTER2026"}]');
    expect(entityBuckets()).toBe(first);
    expect(engine.reviewAll).toHaveBeenCalledTimes(1);
  });

  it('un calcul parti moins de 2 s après une écriture est servi, pas retenu', async () => {
    const { entityBuckets } = await load();
    // Écrit il y a une seconde à l'horloge du module : les caches du moteur
    // (`tablesStamp`/`fileStamp`, re-stat toutes les 2 s) peuvent dater d'avant.
    touch(CURATED, 59);
    expect(entityBuckets().get('character')).toEqual(buckets({ new: 1 }));
    entityBuckets();
    expect(engine.reviewAll).toHaveBeenCalledTimes(2);

    vi.setSystemTime(Date.now() + 1500);
    const settled = entityBuckets();
    expect(entityBuckets()).toBe(settled);
    expect(engine.reviewAll).toHaveBeenCalledTimes(3);
  });

  it('un échec du moteur rend une Map vide et n’est pas retenu', async () => {
    const { entityBuckets, bucketsOf } = await load();
    engine.reviewAll.mockImplementation(() => {
      throw new Error('extraction indisponible');
    });
    expect(entityBuckets().size).toBe(0);
    expect(bucketsOf('character')).toEqual(buckets());
    expect(engine.reviewAll).toHaveBeenCalledTimes(2);

    engineReturns({ character: buckets({ diff: 2 }) });
    expect(bucketsOf('character')).toEqual(buckets({ diff: 2 }));
    entityBuckets();
    expect(engine.reviewAll).toHaveBeenCalledTimes(3);
  });
});

describe('offSiteOf — le hors-site des monstres, de la même revue que les buckets', () => {
  /** Un diff à la forme du moteur : les clés ajoutées, modifiées, retirées. */
  const diffOf = (added: string[], changed: string[], removed: string[]) => ({
    added,
    changed: changed.map((key) => ({ key })),
    removed,
  });
  /** Le périmètre du site, pour les monstres seuls : le diff restreint à ces clés. */
  const siteKeeps = (...keys: string[]) =>
    engine.site.mockImplementation((id: string, diff: ReturnType<typeof diffOf>) =>
      id === 'monster'
        ? diffOf(
            diff.added.filter((k) => keys.includes(k)),
            diff.changed.map((c) => c.key).filter((k) => keys.includes(k)),
            diff.removed.filter((k) => keys.includes(k)),
          )
        : undefined,
    );
  const monsters = () =>
    engine.reviewAll.mockImplementation(() => [
      { id: 'character', diff: diffOf(['2000003'], [], []) },
      { id: 'monster', diff: diffOf(['400103', '55300019'], ['400101', '55300006'], ['55300018']) },
    ]);

  it('ce que le périmètre écarte, compté une fois : aucune revue sur un second appel à empreinte égale', async () => {
    monsters();
    siteKeeps('400101', '400103');
    const { offSiteOf, bucketsOf, entityBuckets } = await load();
    expect(offSiteOf('monster')).toBe(3);
    // Les buckets sont ceux du diff GARDÉ, du même calcul.
    expect(bucketsOf('monster')).toEqual(diffOf(['400103'], ['400101'], []));
    expect(engine.reviewAll).toHaveBeenCalledTimes(1);
    // La vue d'ensemble de quick, une seconde fois : onze buckets et le hors-site.
    for (let i = 0; i < 11; i++) entityBuckets();
    expect(offSiteOf('monster')).toBe(3);
    expect(engine.reviewAll).toHaveBeenCalledTimes(1);
    // Une cible sans périmètre, une cible inconnue : zéro.
    expect(offSiteOf('character')).toBe(0);
    expect(offSiteOf('inconnue')).toBe(0);
    expect(engine.reviewAll).toHaveBeenCalledTimes(1);
  });

  it('un fichier d’entrée qui bouge : une revue de plus, le nouveau compte', async () => {
    monsters();
    siteKeeps('400101', '400103');
    const { offSiteOf } = await load();
    expect(offSiteOf('monster')).toBe(3);
    siteKeeps('400101', '400103', '55300006');
    box.putRaw(CURATED, '{"a":1}');
    expect(offSiteOf('monster')).toBe(2);
    expect(offSiteOf('monster')).toBe(2);
    expect(engine.reviewAll).toHaveBeenCalledTimes(2);
  });

  it('tout le diff au site, ou un périmètre qui ne se calcule pas (le diff rendu intact) : zéro', async () => {
    monsters();
    const { offSiteOf } = await load();
    siteKeeps('400101', '400103', '55300006', '55300018', '55300019');
    expect(offSiteOf('monster')).toBe(0);
    engine.site.mockReset();
    box.putRaw(CURATED, '{"b":1}');
    expect(offSiteOf('monster')).toBe(0);
    expect(engine.reviewAll).toHaveBeenCalledTimes(2);
  });

  it('une extraction qui ne se lit pas : zéro, pas retenu — l’appel suivant réessaie', async () => {
    const { offSiteOf } = await load();
    engine.reviewAll.mockImplementation(() => {
      throw new Error('extraction indisponible');
    });
    expect(offSiteOf('monster')).toBe(0);
    expect(engine.reviewAll).toHaveBeenCalledTimes(1);
    monsters();
    siteKeeps('400101');
    expect(offSiteOf('monster')).toBe(4);
    expect(offSiteOf('monster')).toBe(4);
    expect(engine.reviewAll).toHaveBeenCalledTimes(2);
  });
});

describe('buildInbox — ce qu’il rend, pour un seul calcul', () => {
  it('tags, entités et assets, triés par urgence puis par volume', async () => {
    engineReturns({
      character: buckets({ new: 1 }),
      effect: buckets({ diff: 2, removed: 1, minor: 3 }),
      weapon: buckets({ minor: 1, typo: 2 }),
      monster: buckets({ new: 4 }),
      item: buckets(),
    });
    // Deux tags morts du même perso, dans deux textes : sa fiche, au sous-onglet du premier.
    engine.tags.mockReturnValue([
      { ok: false, source: PROS },
      { ok: true, source: 'gear-presets.json.substats.dps' },
      { ok: false, source: 'synergies · Valentine (2000012)[0]' },
    ]);
    box.putRaw(
      '.assets-staging/manifest-report.json',
      JSON.stringify({ total: 900, missingCount: 5, generatedAt: '2026-10-08' }),
    );
    const { buildInbox } = await load();

    const expected = [
      {
        key: 'tags',
        label: 'Dead inline tags',
        detail: '2 tag(s) resolve to nothing',
        tab: 'character/2000012/pros-cons',
        tone: 'danger',
        rank: 0,
        count: 2,
      },
      {
        key: 'extract:effect',
        label: 'Effect',
        detail: '2 diff · 1 removed · 3 minor',
        tab: 'extractor/effect',
        tone: 'danger',
        rank: 1,
        count: 3,
      },
      {
        key: 'extract:monster',
        label: 'Monster',
        detail: '4 new',
        tab: 'extractor/monster',
        tone: 'warn',
        rank: 2,
        count: 4,
      },
      {
        key: 'extract:character',
        label: 'Character',
        detail: '1 new',
        tab: 'extractor/character',
        tone: 'warn',
        rank: 2,
        count: 1,
      },
      {
        key: 'assets',
        label: 'Assets',
        detail: '5 missing from the pool',
        tab: 'gamedata',
        tone: 'warn',
        rank: 3,
        count: 5,
      },
      {
        key: 'extract:weapon',
        label: 'Weapons',
        detail: '1 minor · 2 typo',
        tab: 'extractor/weapon',
        tone: 'muted',
        rank: 4,
        count: 3,
      },
    ];
    expect(buildInbox()).toEqual(expected);
    // Dix entités lues, un calcul — et aucun de plus au tableau de bord suivant.
    expect(buildInbox()).toEqual(expected);
    expect(engine.reviewAll).toHaveBeenCalledTimes(1);
  });

  it('rien à signaler : tableau vide', async () => {
    engineReturns({ character: buckets(), item: buckets() });
    const { buildInbox } = await load();
    expect(buildInbox()).toEqual([]);
  });

  it('les tags morts : la fiche d’UN perso, sinon aucune adresse et un détail qui nomme les provenances', async () => {
    engineReturns({});
    const { buildInbox } = await load();
    const tagsOf = (sources: string[]) => {
      engine.tags.mockReturnValue(sources.map((source) => ({ ok: false, source })));
      const [tags] = buildInbox();
      return [tags.tab, tags.detail];
    };
    // Un perso : sa fiche, au sous-onglet qui porte le texte ; le détail ne dit que le compte.
    expect(tagsOf([PROS])).toEqual(['character/2000012/pros-cons', '1 tag(s) resolve to nothing']);
    expect(tagsOf(['gear-reco.json.2000008[0].note.en'])).toEqual([
      'character/2000008/gear',
      '1 tag(s) resolve to nothing',
    ]);
    // Deux persos, un guide, un preset : quick ne les réunit nulle part.
    const MARIAN = 'synergies · Marian (2000014)[0]';
    const GUIDE = 'guides · adventure/S1-9-5 · content.json.tips[0].en';
    expect(tagsOf([PROS, MARIAN])).toEqual([
      null,
      `2 tag(s) resolve to nothing — ${PROS} ; ${MARIAN}`,
    ]);
    expect(tagsOf(['gear-presets.json.substats.dps'])).toEqual([
      null,
      '1 tag(s) resolve to nothing — gear-presets.json.substats.dps',
    ]);
    // Une provenance n'est nommée qu'une fois, trois au plus, le reste compté.
    expect(tagsOf([PROS, PROS, GUIDE, MARIAN, 'gear-presets.json.substats.dps', 'a', 'b'])).toEqual(
      [null, `7 tag(s) resolve to nothing — ${PROS} ; ${GUIDE} ; ${MARIAN} ; +3 more`],
    );
  });

  it('chaque item est adressé à quick : une cible d’Extraction par entité, plus aucune adresse de l’admin', async () => {
    const { EXTRACTOR_ENTITIES, buildInbox } = await load();
    expect(EXTRACTOR_ENTITIES.map((e) => e.tab)).toEqual(
      EXTRACTOR_ENTITIES.map((e) => `extractor/${e.id}`),
    );
    engineReturns(Object.fromEntries(EXTRACTOR_ENTITIES.map((e) => [e.id, buckets({ new: 1 })])));
    engine.tags.mockReturnValue([{ ok: false, source: PROS }]);
    box.putRaw(
      '.assets-staging/manifest-report.json',
      JSON.stringify({ total: 900, missingCount: 5, generatedAt: '2026-10-08' }),
    );
    const inbox = buildInbox();
    expect(inbox).toHaveLength(EXTRACTOR_ENTITIES.length + 2);
    // Le premier segment de chaque adresse est une section de quick.
    expect([...new Set(inbox.map((i) => i.tab?.split('/')[0]))].sort()).toEqual([
      'character',
      'extractor',
      'gamedata',
    ]);
    expect(JSON.stringify(inbox)).not.toContain('admin');
    expect(inbox.every((i) => !('href' in i))).toBe(true);
  });
});

describe('adminExtractorMenu — les cibles que le menu de l’admin propose encore', () => {
  it('écarte les cibles portées dans quick ; l’inbox et les buckets gardent les dix', async () => {
    engineReturns({ effect: buckets({ diff: 1 }), armor: buckets({ new: 1 }), item: buckets() });
    const { EXTRACTOR_ENTITIES, EXTRACTOR_IN_QUICK, adminExtractorMenu, bucketsOf, buildInbox } =
      await load();
    expect([...EXTRACTOR_IN_QUICK].sort()).toEqual([
      'amulet',
      'armor',
      'character',
      'ee',
      'effect',
      'item',
      'monster',
      'set',
      'talisman',
      'weapon',
    ]);
    expect(EXTRACTOR_ENTITIES.map((e) => e.id)).toEqual([
      'character',
      'effect',
      'ee',
      'weapon',
      'amulet',
      'armor',
      'talisman',
      'set',
      'monster',
      'item',
    ]);
    // Le menu : plus aucune — les dix cibles sont dans quick (F22), le groupe en sort.
    expect(adminExtractorMenu()).toEqual([]);
    // L'inbox et `bucketsOf` ne filtrent pas : une cible portée reste comptée.
    expect(buildInbox().map((i) => i.key)).toEqual(['extract:effect', 'extract:armor']);
    expect(bucketsOf('effect')).toEqual(buckets({ diff: 1 }));
  });
});
