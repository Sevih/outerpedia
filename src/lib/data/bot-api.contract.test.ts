/**
 * CONTRAT ÉCRIT de l'API du bot Discord : `fixtures/bot-api/*.json` porte un
 * extrait réel de chaque route `/api/bot/*`, et ce test vérifie que la FORME
 * du payload complet (chemin de champ → types rencontrés, présent partout ou
 * pas) est celle de son extrait. Un champ ajouté, retiré, renommé ou retypé
 * fait échouer ; une valeur qui bouge (nom, nombre d'entrées) non.
 *
 * Régénérer les extraits après un changement VOULU du contrat :
 *
 *   BOT_API_FIXTURES=write pnpm exec vitest run src/lib/data/bot-api.contract.test.ts
 *
 * puis recopier ces fichiers dans `test/fixtures/bot-api/` d'outerbot, dont
 * les tests lisent les mêmes extraits.
 */
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { writeJson } from '@datagen/lib/json';
import { makeT } from '@/i18n';
import en from '@/i18n/locales/en';
import {
  buildBotChangelog,
  buildBotCharacters,
  buildBotCoupons,
  buildBotGuides,
  buildBotItems,
  type BotItem,
} from '@/lib/data/bot-api';
import type { CouponVM } from '@/lib/home';
import characters from './fixtures/bot-api/characters.json';
import guides from './fixtures/bot-api/guides.json';
import items from './fixtures/bot-api/items.json';
import coupons from './fixtures/bot-api/coupons.json';
import changelog from './fixtures/bot-api/changelog.json';

// Les coupons actifs viennent de R2 : deux codes figés à la place, aucun appel réseau.
vi.mock('@/lib/home', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/home')>()),
  getActiveCoupons: async () => ({
    codes: [
      {
        code: 'OUTER2026',
        start: '2026-10-01',
        end: '2026-10-31',
        rewards: [
          { item: { name: 'Gold' }, qty: '100000' },
          { item: { name: 'Stamina' }, qty: '300' },
        ],
      },
      {
        code: 'HALLOWEEN26',
        start: '2026-10-25',
        end: '2026-11-02',
        rewards: [{ item: { name: 'Ether' }, qty: '500' }],
      },
    ] as unknown as CouponVM[],
    activeCount: 2,
  }),
}));

const WRITE = process.env.BOT_API_FIXTURES === 'write';
const FIXTURES = resolve(process.cwd(), 'src/lib/data/fixtures/bot-api');

/** Forme d'un payload : chemin de champ → types JS rencontrés, présent dans chaque objet ou pas. */
type Shape = Record<string, { types: string[]; always?: boolean }>;

const typeOf = (v: unknown): string =>
  v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v;

/**
 * Parcourt une liste d'objets frères : chaque clé note ses types et si TOUS
 * l'ont ; un objet se descend en `a.b`, les éléments d'un tableau en `a[]`
 * (types des éléments seulement — leur nombre est une valeur, pas la forme).
 */
function walk(objects: Record<string, unknown>[], prefix: string, out: Shape): void {
  const keys = [...new Set(objects.flatMap((o) => Object.keys(o)))];
  for (const key of keys) {
    const values = objects.filter((o) => key in o).map((o) => o[key]);
    const path = `${prefix}${key}`;
    out[path] = {
      types: [...new Set(values.map(typeOf))].sort(),
      always: values.length === objects.length,
    };
    descend(values, path, out);
  }
}

function descend(values: unknown[], path: string, out: Shape): void {
  const objects = values.filter((v) => typeOf(v) === 'object') as Record<string, unknown>[];
  if (objects.length) walk(objects, `${path}.`, out);
  const elements = values.filter(Array.isArray).flat();
  if (elements.length) {
    out[`${path}[]`] = { types: [...new Set(elements.map(typeOf))].sort() };
    descend(elements, `${path}[]`, out);
  }
}

function shapeOf(payload: unknown[]): Shape {
  const out: Shape = {};
  walk(payload as Record<string, unknown>[], '', out);
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}

/** Les couples (chemin, type) et (chemin, absent quelque part) qu'une forme couvre. */
const marks = (shape: Shape): Set<string> =>
  new Set(
    Object.entries(shape).flatMap(([path, s]) => [
      ...s.types.map((t) => `${path}:${t}`),
      ...(s.always === false ? [`${path}:?`] : []),
    ]),
  );

/**
 * L'extrait : les entrées `required` d'abord, puis, dans l'ordre du payload,
 * chaque entrée qui apporte un type ou une absence pas encore couverts. Il
 * s'arrête quand sa forme est celle du payload complet, et garde l'ordre du
 * payload.
 */
function extract<T>(payload: T[], required: (T | undefined)[] = []): T[] {
  const picked = new Set(required.filter((x): x is T => x !== undefined));
  let covered = marks(shapeOf([...picked]));
  for (const entry of payload) {
    if (picked.has(entry)) continue;
    const next = marks(shapeOf([...picked, entry]));
    if (next.size > covered.size) {
      picked.add(entry);
      covered = next;
    }
  }
  return payload.filter((e) => picked.has(e));
}

/** Items : un de chaque type, une variante multi-classes (`Nom [Classe]`), un EE. */
const itemsRequired = (all: BotItem[]): (BotItem | undefined)[] => [
  ...(['weapon', 'amulet', 'set', 'talisman', 'ee'] as const).map((type) =>
    all.find((i) => i.type === type),
  ),
  all.find((i) => i.type !== 'ee' && / \[[A-Z][a-z]+\]$/.test(i.name)),
];

interface Route {
  name: string;
  fixture: unknown[];
  build: () => unknown[] | Promise<unknown[]>;
  /** L'extrait à écrire, tiré du payload complet. */
  pick: (all: unknown[]) => unknown[];
}

const ROUTES: Route[] = [
  {
    name: 'characters',
    fixture: characters,
    build: buildBotCharacters,
    pick: (all) => extract(all),
  },
  { name: 'guides', fixture: guides, build: buildBotGuides, pick: (all) => extract(all) },
  {
    name: 'items',
    fixture: items,
    build: () => buildBotItems(makeT(en)),
    pick: (all) => extract(all as BotItem[], itemsRequired(all as BotItem[])),
  },
  // Les deux codes figés, tous deux.
  { name: 'coupons', fixture: coupons, build: buildBotCoupons, pick: (all) => all },
  { name: 'changelog', fixture: changelog, build: buildBotChangelog, pick: (all) => extract(all) },
];

describe('/api/bot/* — la forme de chaque payload est celle de son extrait', () => {
  for (const route of ROUTES) {
    it(route.name, async () => {
      const payload = await route.build();
      if (WRITE) {
        await writeJson(resolve(FIXTURES, `${route.name}.json`), route.pick(payload));
        return;
      }
      expect(shapeOf(payload)).toEqual(shapeOf(route.fixture));
    });
  }

  // En écriture, les extraits importés sont ceux d'AVANT : rien à en dire.
  it.skipIf(WRITE)(
    'l’extrait des items couvre chaque type, une variante multi-classes et un EE',
    () => {
      const fixture = items as BotItem[];
      expect(new Set(fixture.map((i) => i.type))).toEqual(
        new Set(['weapon', 'amulet', 'set', 'talisman', 'ee']),
      );
      expect(itemsRequired(fixture).every(Boolean)).toBe(true);
    },
  );

  it.skipIf(WRITE)('l’extrait du journal a une entrée avec vignette et une sans', () => {
    expect(changelog.some((e) => 'thumb' in e)).toBe(true);
    expect(changelog.some((e) => !('thumb' in e))).toBe(true);
  });

  it('un champ renommé, retiré, ajouté ou retypé change la forme ; une valeur non', async () => {
    const payload = (await buildBotCoupons()) as unknown as Record<string, unknown>[];
    const reference = shapeOf(payload);
    const edit = (f: (c: Record<string, unknown>) => void) =>
      shapeOf(
        structuredClone(payload).map((c) => {
          f(c);
          return c;
        }),
      );
    // Renommé (au premier niveau, puis dans `rewards[]`).
    expect(
      edit((c) => {
        c.redeemURL = c.redeemUrl;
        delete c.redeemUrl;
      }),
    ).not.toEqual(reference);
    expect(
      edit((c) => {
        for (const r of c.rewards as Record<string, unknown>[]) {
          r.label = r.name;
          delete r.name;
        }
      }),
    ).not.toEqual(reference);
    // Retiré partout, puis d'une seule entrée (le champ devient optionnel).
    expect(edit((c) => delete c.href)).not.toEqual(reference);
    const once = structuredClone(payload);
    delete once[0].href;
    expect(shapeOf(once)).not.toEqual(reference);
    // Ajouté.
    expect(edit((c) => (c.url = '/coupons'))).not.toEqual(reference);
    // Retypé.
    expect(edit((c) => (c.end = Date.parse(String(c.end))))).not.toEqual(reference);
    // Une valeur qui bouge, une entrée en moins : même forme.
    expect(edit((c) => (c.code = 'NEWCODE'))).toEqual(reference);
    expect(shapeOf(payload.slice(0, 1))).toEqual(reference);
  });
});
