/**
 * `patchGuideMetaFields` ÉLARGI au titre, à la description et à `hidden` (lot
 * F18 : quick édite ces trois champs). Une seule écriture, tout le reste du
 * `meta.json` préservé — y compris l'ordre des clés, que `writeJson` garde —,
 * une valeur vide retire la clé, et un titre sans anglais n'est pas écrit :
 * le scan du site refuse un meta sans `{ en }`, le store ne doit pas fabriquer
 * ce qui casserait le build.
 *
 * Bac à sable, comme `guide-store.pinned.test.ts` : `getGuide` scanne
 * `CONTENTS_DIR`, figé au CHARGEMENT de `src/lib/data/guides.ts` sur
 * `process.cwd()` — la redirection est posée AVANT l'import, en tête de
 * fichier. Un vrai guide (meta.json valide + index.tsx) y est écrit pour que
 * le scan le trouve ; rien n'est écrit dans l'arbre du site.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const CAT = 'special-request'; // catégorie éditable, PLATE (le meta porte `group`)
const SLUG = 'boss-de-test';

const root = mkdtempSync(join(tmpdir(), 'guide-store-meta-'));
const dir = join(root, 'src/app/[lang]/guides/_contents', CAT, SLUG);
mkdirSync(dir, { recursive: true });
vi.spyOn(process, 'cwd').mockReturnValue(root);

const META = {
  title: { en: 'Boss Special Request Guide', fr: 'Guide du boss' },
  description: { en: 'How to beat the boss.' },
  icon: 'CLG_Raid_Weapon_Dark',
  author: 'Sevih',
  updated: '2026-10-04',
  order: 5,
  bossId: '407600962',
  group: 'raid_2:SYS_RAID_2_DUNGEON_D',
};
const readMeta = (): Record<string, unknown> =>
  JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8')) as Record<string, unknown>;

afterAll(() => {
  vi.restoreAllMocks();
  rmSync(root, { recursive: true, force: true });
});

const { patchGuideMetaFields } = await import('./guide-store');

describe('patchGuideMetaFields — titre, description, hidden', () => {
  beforeEach(() => {
    writeFileSync(join(dir, 'meta.json'), `${JSON.stringify(META, null, 2)}\n`, 'utf8');
    writeFileSync(join(dir, 'index.tsx'), 'export default function G() { return null; }\n');
  });

  it('écrit le titre et la description dans toutes leurs langues, le reste intact et dans l’ordre', async () => {
    const title = { en: 'New title', fr: 'Nouveau titre', jp: '新しい' };
    expect(await patchGuideMetaFields(CAT, SLUG, { title, hidden: false })).toBe(true);
    const meta = readMeta();
    expect(meta.title).toEqual(title);
    expect(meta.description).toEqual(META.description);
    expect(meta.group).toBe(META.group);
    expect(meta.updated).toBe(META.updated);
    expect(meta).not.toHaveProperty('hidden');
    expect(Object.keys(meta)).toEqual(Object.keys(META));
  });

  it('`hidden: true` s’écrit, `hidden: false` retire la clé', async () => {
    expect(await patchGuideMetaFields(CAT, SLUG, { hidden: true })).toBe(true);
    expect(readMeta().hidden).toBe(true);
    expect(await patchGuideMetaFields(CAT, SLUG, { hidden: false })).toBe(true);
    expect(readMeta()).not.toHaveProperty('hidden');
  });

  it('plusieurs champs en UNE écriture — le combat et les textes ensemble', async () => {
    expect(
      await patchGuideMetaFields(CAT, SLUG, {
        description: { en: 'Short.' },
        group: 'raid_1:SYS_RAID_1_DUNGEON_A',
        hidden: true,
      }),
    ).toBe(true);
    const meta = readMeta();
    expect(meta.description).toEqual({ en: 'Short.' });
    expect(meta.group).toBe('raid_1:SYS_RAID_1_DUNGEON_A');
    expect(meta.hidden).toBe(true);
    expect(meta.title).toEqual(META.title);
  });

  it('REFUSE un titre ou une description sans anglais : rien n’est écrit', async () => {
    expect(await patchGuideMetaFields(CAT, SLUG, { title: { en: '', fr: 'Sans anglais' } })).toBe(
      false,
    );
    expect(
      await patchGuideMetaFields(CAT, SLUG, {
        description: { en: '   ' } as { en: string },
        hidden: true,
      }),
    ).toBe(false);
    expect(readMeta()).toEqual(META);
  });

  it('un guide inconnu rend false', async () => {
    expect(await patchGuideMetaFields(CAT, 'inconnu', { hidden: true })).toBe(false);
  });
});
