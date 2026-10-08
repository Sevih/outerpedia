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
 * Et que `buildInbox` rend ce qu'il rendait, pour UN calcul.
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

const engine = vi.hoisted(() => ({ reviewAll: vi.fn(), tags: vi.fn() }));
// Le faux diff d'une cible EST déjà ses buckets : les deux passes le rendent tel quel.
vi.mock('@/lib/admin/review-store', () => ({
  reviewAll: engine.reviewAll,
  reviewBuckets: (diff: unknown) => diff,
}));
vi.mock('@/lib/admin/monster-review', () => ({
  actionableDiff: (_id: string, diff: unknown) => diff,
}));
vi.mock('@/lib/admin/tag-control', () => ({ collectTagOccurrences: engine.tags }));

const box = sandbox('inbox-');

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

describe('buildInbox — ce qu’il rend, pour un seul calcul', () => {
  it('tags, entités et assets, triés par urgence puis par volume', async () => {
    engineReturns({
      character: buckets({ new: 1 }),
      effect: buckets({ diff: 2, removed: 1, minor: 3 }),
      weapon: buckets({ minor: 1, typo: 2 }),
      monster: buckets({ new: 4 }),
      item: buckets(),
    });
    engine.tags.mockReturnValue([{ ok: false }, { ok: true }, { ok: false }]);
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
        href: '/admin/tags',
        tone: 'danger',
        rank: 0,
        count: 2,
      },
      {
        key: 'extract:effect',
        label: 'Effect',
        detail: '2 diff · 1 removed · 3 minor',
        href: '/admin/extractor/effects',
        tone: 'danger',
        rank: 1,
        count: 3,
      },
      {
        key: 'extract:monster',
        label: 'Monster',
        detail: '4 new',
        href: '/admin/extractor/monsters',
        tone: 'warn',
        rank: 2,
        count: 4,
      },
      {
        key: 'extract:character',
        label: 'Character',
        detail: '1 new',
        href: '/admin/extractor/characters',
        tone: 'warn',
        rank: 2,
        count: 1,
      },
      {
        key: 'assets',
        label: 'Assets',
        detail: '5 missing from the pool',
        href: '/admin/tools/gamedata',
        tone: 'warn',
        rank: 3,
        count: 5,
      },
      {
        key: 'extract:weapon',
        label: 'Weapons',
        detail: '1 minor · 2 typo',
        href: '/admin/extractor/weapons',
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
});
