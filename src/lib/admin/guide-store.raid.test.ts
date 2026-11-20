/**
 * LE STORE ET LES GUILD RAIDS (lot F33) — ce que `saveGuideDraft` et
 * `addGuideVersion` font d'une version à quatre fichiers.
 *
 *   - une version AU GABARIT s'écrit, et seuls les fichiers dont le contenu
 *     change sont touchés (un fichier lu puis réécrit tel quel garde ses
 *     octets, même mis en forme autrement) ;
 *   - une version À L'ANCIEN FORMAT n'est JAMAIS réécrite — ni par un brouillon
 *     qui la rend en lecture, ni par un brouillon qui prétendrait l'éditer ;
 *   - le `pinned` de `config.json` survit, comme pour les autres versionnés ;
 *   - « ＋ version » duplique une version au gabarit, jamais une ancienne, ni
 *     une version vierge.
 *
 * Bac à sable : `process.cwd()` redirigé AVANT l'import du store (cf.
 * `guide-store.pinned.test.ts`) — rien ne s'écrit dans l'arbre du site.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GuideDraft, VersionDraft } from './guide-draft';
import { readRaidVersion, type RaidRawFiles, type RaidTemplateDraft } from './guild-raid-draft';

const CAT = 'guild-raid';
const SLUG = 'raid-de-test';

const root = mkdtempSync(join(tmpdir(), 'guide-store-raid-'));
const versions = join(root, 'src/app/[lang]/guides/_contents', CAT, SLUG, 'versions');
mkdirSync(versions, { recursive: true });
vi.spyOn(process, 'cwd').mockReturnValue(root);

const CONFIG = { subA: 'guild_raid:A', subB: 'guild_raid:B', main: 'guild_raid:M' };
const SUB = {
  recommended: [{ characters: ['Ember'], reason: { en: 'dps' } }],
  team: { slots: [['Ember']] },
};
const MAIN = {
  teams: [
    {
      title: { en: 'Burn' },
      element: 'fire',
      slots: [['Ember'], ['Kuro']],
      geasActive: { bonus: ['1'], malus: ['2'] },
      requirements: { entries: [{ character: 'Ember', stats: { spd: '166' } }] },
      notes: [{ p: { en: 'Sacrifice options' } }],
    },
  ],
};
/** L'ancien format : plus de combat, et un `turnOrder` dans les notes. */
const OLD_MAIN = {
  teams: [
    {
      title: { en: 'Old' },
      slots: [['Ember']],
      notes: [{ turnOrder: [{ character: 'Ember', speed: 166 }] }],
    },
  ],
};

const path = (key: string, file: string) => join(versions, key, file);
const text = (key: string, file: string) => readFileSync(path(key, file), 'utf8');
const json = (key: string, file: string) => JSON.parse(text(key, file)) as Record<string, unknown>;
/** Un fichier posé « à la main » : une mise en forme que `writeJson` ne produit pas. */
const put = (key: string, file: string, data: unknown) => {
  mkdirSync(join(versions, key), { recursive: true });
  writeFileSync(path(key, file), JSON.stringify(data), 'utf8');
};
const seed = (key: string, files: RaidRawFiles) => {
  rmSync(join(versions, key), { recursive: true, force: true });
  for (const [name, data] of Object.entries(files)) if (data) put(key, `${name}.json`, data);
};
const read = (key: string): RaidRawFiles => ({
  config: json(key, 'config.json'),
  subA: existsSync(path(key, 'subA.json')) ? json(key, 'subA.json') : undefined,
  subB: existsSync(path(key, 'subB.json')) ? json(key, 'subB.json') : undefined,
  main: existsSync(path(key, 'main.json')) ? json(key, 'main.json') : undefined,
});

const version = (key: string, more: Partial<VersionDraft> = {}): VersionDraft => ({
  key,
  tipSections: [],
  notes: [],
  recommended: [],
  recoSections: [],
  teams: [],
  videos: [],
  raid: readRaidVersion(read(key)),
  ...more,
});
const draft = (...list: VersionDraft[]): GuideDraft => ({ intro: { en: 'intro' }, versions: list });

afterAll(() => {
  vi.restoreAllMocks();
  rmSync(root, { recursive: true, force: true });
});

const { addGuideVersion, saveGuideDraft } = await import('./guide-store');

describe('saveGuideDraft — une version de guild raid au gabarit', () => {
  beforeEach(() => {
    seed('2026-08', { config: CONFIG, subA: SUB, subB: SUB, main: MAIN });
    seed('2025-07', { config: {}, subA: SUB, main: OLD_MAIN });
  });

  it('relue puis enregistrée telle quelle, aucun de ses fichiers n’est réécrit', async () => {
    const before = ['config.json', 'subA.json', 'subB.json', 'main.json'].map((f) =>
      text('2026-08', f),
    );
    expect(await saveGuideDraft(CAT, SLUG, draft(version('2026-08'), version('2025-07')))).toEqual(
      [],
    );
    expect(
      ['config.json', 'subA.json', 'subB.json', 'main.json'].map((f) => text('2026-08', f)),
    ).toEqual(before);
    expect(existsSync(path('2026-08', 'version.json'))).toBe(false);
  });

  it('retouchée, seul le fichier qui change est réécrit, au format canonique', async () => {
    const v = version('2026-08');
    const raid = v.raid as RaidTemplateDraft;
    raid.teams[0].builds[0].stats = { spd: '170', trans: '6' };
    raid.teams[0].notes.push({ ul: [{ en: 'Liselotte' }, { en: ' ' }] });
    const untouched = ['config.json', 'subA.json', 'subB.json'].map((f) => text('2026-08', f));
    expect(await saveGuideDraft(CAT, SLUG, draft(v))).toEqual([]);
    expect(['config.json', 'subA.json', 'subB.json'].map((f) => text('2026-08', f))).toEqual(
      untouched,
    );
    expect(text('2026-08', 'main.json')).toContain('\n      "title": {');
    expect(json('2026-08', 'main.json')).toEqual({
      teams: [
        {
          ...MAIN.teams[0],
          requirements: { entries: [{ character: 'Ember', stats: { spd: '170', trans: '6' } }] },
          notes: [{ p: { en: 'Sacrifice options' } }, { ul: [{ en: 'Liselotte' }] }],
        },
      ],
    });
  });

  it('un sous-boss vidé perd son fichier, des équipes retirées aussi', async () => {
    const v = version('2026-08');
    const raid = v.raid as RaidTemplateDraft;
    raid.bossB = { notes: [], recommended: [], slots: [] };
    raid.teams = [];
    expect(await saveGuideDraft(CAT, SLUG, draft(v))).toEqual([]);
    expect(existsSync(path('2026-08', 'subB.json'))).toBe(false);
    expect(existsSync(path('2026-08', 'main.json'))).toBe(false);
    expect(existsSync(path('2026-08', 'subA.json'))).toBe(true);
  });

  it('le `pinned` du disque survit à un brouillon qui n’en parle pas ; `[]` dépingle', async () => {
    put('2026-08', 'config.json', { ...CONFIG, pinned: ['4548161@1'] });
    const v = version('2026-08');
    (v.raid as RaidTemplateDraft).main = 'guild_raid:M2';
    expect(await saveGuideDraft(CAT, SLUG, draft(v))).toEqual([]);
    expect(json('2026-08', 'config.json')).toEqual({
      ...CONFIG,
      main: 'guild_raid:M2',
      pinned: ['4548161@1'],
    });
    expect(await saveGuideDraft(CAT, SLUG, draft(version('2026-08', { pinned: [] })))).toEqual([]);
    expect(json('2026-08', 'config.json')).toEqual({ ...CONFIG, main: 'guild_raid:M2' });
  });

  it('la case « Cachée » se pose dans version.json', async () => {
    expect(await saveGuideDraft(CAT, SLUG, draft(version('2026-08', { hidden: true })))).toEqual(
      [],
    );
    expect(json('2026-08', 'version.json')).toEqual({ hidden: true });
  });
});

describe('saveGuideDraft — une version à l’ancien format n’est jamais réécrite', () => {
  beforeEach(() => {
    seed('2026-08', { config: CONFIG, subA: SUB, subB: SUB, main: MAIN });
    seed('2025-07', { config: {}, subA: SUB, main: OLD_MAIN });
  });
  const old = () => ['config.json', 'subA.json', 'main.json'].map((f) => text('2025-07', f));

  it('rendue en lecture par le brouillon, elle garde ses octets', async () => {
    const before = old();
    const v = version('2025-07');
    expect(v.raid).toHaveProperty('legacy');
    expect(await saveGuideDraft(CAT, SLUG, draft(version('2026-08'), v))).toEqual([]);
    expect(old()).toEqual(before);
    expect(existsSync(path('2025-07', 'subB.json'))).toBe(false);
  });

  it('un brouillon qui PRÉTEND l’éditer (au gabarit) n’y écrit rien : le disque fait foi', async () => {
    const before = old();
    const forged = version('2025-07', { raid: readRaidVersion(read('2026-08')) });
    expect(await saveGuideDraft(CAT, SLUG, draft(forged))).toEqual([]);
    expect(old()).toEqual(before);
    expect(existsSync(path('2025-07', 'subB.json'))).toBe(false);
  });

  it('sa case « Cachée » se pose quand même, sans toucher ses quatre fichiers', async () => {
    const before = old();
    expect(await saveGuideDraft(CAT, SLUG, draft(version('2025-07', { hidden: true })))).toEqual(
      [],
    );
    expect(json('2025-07', 'version.json')).toEqual({ hidden: true });
    expect(old()).toEqual(before);
  });
});

describe('addGuideVersion — « ＋ version » d’un guild raid', () => {
  beforeEach(() => {
    seed('2026-08', {
      config: { ...CONFIG, pinned: ['4548161@1'] },
      subA: SUB,
      subB: SUB,
      main: MAIN,
    });
    seed('2025-07', { config: {}, subA: SUB, main: OLD_MAIN });
    rmSync(join(versions, '2026-11'), { recursive: true, force: true });
  });

  it('duplique les quatre fichiers d’une version au gabarit, sans son épinglage', async () => {
    expect(await addGuideVersion(CAT, SLUG, '2026-11', '2026-08')).toEqual([]);
    expect(read('2026-11')).toEqual({ config: CONFIG, subA: SUB, subB: SUB, main: MAIN });
    expect(readRaidVersion(read('2026-11'))).not.toHaveProperty('legacy');
  });

  it('refuse de dupliquer une version à l’ancien format, et une version vierge', async () => {
    expect(await addGuideVersion(CAT, SLUG, '2026-11', '2025-07')).toEqual([
      'Guild raid : version 2025-07 is in the old format, not duplicable.',
    ]);
    expect(await addGuideVersion(CAT, SLUG, '2026-11', '')).toEqual([
      'Guild raid : a new version is duplicated from a template version.',
    ]);
    expect(existsSync(join(versions, '2026-11'))).toBe(false);
  });
});
