/**
 * L'ÉPINGLAGE D'UNE VERSION SURVIT AUX GESTES D'ÉDITION.
 *
 * `pinned` est la seule clé de `config.json` que l'éditeur ne connaît pas : elle
 * est posée par « Versionner », personne ne la saisit, et rien à l'écran ne la
 * montre. Deux gestes ordinaires l'emportaient donc en silence, et c'est
 * exactement le genre de perte qu'on ne voit qu'au moment où le boss change :
 *
 *   SAUVEGARDER — `fromVersionDraft` RECONSTRUIT `config.json` depuis le seul
 *   brouillon. Corriger une faute dans les conseils réécrivait donc le fichier
 *   sans le pin : l'archive restait sur le disque, le guide repassait au live,
 *   et rien ne le disait.
 *
 *   DUPLIQUER une version — la copie emportait le pin de la source. La nouvelle
 *   version, créée précisément pour décrire le combat TEL QU'IL EST, naissait en
 *   montrant le boss d'avant.
 *
 * Bac à sable : ce store fige `CONTENTS_DIR` au CHARGEMENT du module (contrairement
 * à `loadDataJson`, qui résout son chemin à chaque appel). La redirection de
 * `process.cwd()` doit donc être posée AVANT l'import, en tête de fichier et
 * PAS dans un `beforeAll` — les hooks ne courent qu'après la collecte, et le
 * store aurait déjà mémorisé le vrai `_contents`. Écrire dans l'arbre du site
 * depuis un test est précisément ce que met en garde `guide-store.test.ts`.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GuideDraft } from './guide-draft';

const CAT = 'joint-challenge'; // catégorie réellement VERSIONNÉE (cf. GUIDE_SPECS)
const SLUG = 'boss-de-test';
const GROUP = 'event_boss:TEST_0001';
const PINS = ['4548161@1', '4548171@1'];

const root = mkdtempSync(join(tmpdir(), 'guide-store-pinned-'));
const versions = join(root, 'src/app/[lang]/guides/_contents', CAT, SLUG, 'versions');
mkdirSync(versions, { recursive: true });
vi.spyOn(process, 'cwd').mockReturnValue(root);

/** Le `config.json` d'une version, tel qu'il est sur le disque. */
const readConfig = (key: string): Record<string, unknown> =>
  JSON.parse(readFileSync(join(versions, key, 'config.json'), 'utf8')) as Record<string, unknown>;

const writeConfig = (key: string, cfg: unknown) => {
  mkdirSync(join(versions, key), { recursive: true });
  writeFileSync(join(versions, key, 'config.json'), JSON.stringify(cfg, null, 2), 'utf8');
};

/** Brouillon minimal mais VALIDE : une version, un combat, un conseil. */
const draft = (key: string): GuideDraft => ({
  intro: { en: 'intro' },
  versions: [
    {
      key,
      group: GROUP,
      tipSections: [{ tips: [{ en: 'un conseil' }] }],
      notes: [],
      recommended: [],
      recoSections: [],
      teams: [],
      videos: [],
    },
  ],
});

afterAll(() => {
  vi.restoreAllMocks();
  rmSync(root, { recursive: true, force: true });
});

const { addGuideVersion, saveGuideDraft } = await import('./guide-store');

describe('sauvegarder un guide — le pin SURVIT', () => {
  beforeEach(() => {
    writeConfig('2026-03', { group: GROUP, pinned: PINS });
  });

  it('réécrire la version garde son `pinned`', async () => {
    expect(await saveGuideDraft(CAT, SLUG, draft('2026-03'))).toEqual([]);
    const cfg = readConfig('2026-03');
    expect(cfg.pinned).toEqual(PINS);
    // …et la sauvegarde a bien FAIT son travail par ailleurs.
    expect(cfg.group).toBe(GROUP);
    expect(existsSync(join(versions, '2026-03/tips.json'))).toBe(true);
  });

  it('CONTRE-ÉPREUVE : une version SANS pin n’en reçoit pas', async () => {
    // Un report inconditionnel (ou un `pinned: []` posé d'office) satisferait le
    // cas précédent tout en écrivant une clé vide dans les 16 guides versionnés.
    writeConfig('2025-10', { group: GROUP });
    expect(await saveGuideDraft(CAT, SLUG, draft('2025-10'))).toEqual([]);
    expect(readConfig('2025-10')).not.toHaveProperty('pinned');
  });
});

describe('dupliquer une version — le pin RESTE derrière', () => {
  beforeEach(() => {
    writeConfig('2026-03', { group: GROUP, pinned: PINS, videos: [{ id: 'abc' }] });
    rmSync(join(versions, '2026-08'), { recursive: true, force: true });
  });

  it('la nouvelle version n’hérite PAS de l’épinglage', async () => {
    expect(await addGuideVersion(CAT, SLUG, '2026-08', '2026-03')).toEqual([]);
    expect(readConfig('2026-08')).not.toHaveProperty('pinned');
  });

  it('mais hérite bien du RESTE — la duplication sert de base', async () => {
    // Sans ce cas, vider tout le `config.json` passerait pour un correctif.
    await addGuideVersion(CAT, SLUG, '2026-08', '2026-03');
    const cfg = readConfig('2026-08');
    expect(cfg.group).toBe(GROUP);
    expect(cfg.videos).toEqual([{ id: 'abc' }]);
  });

  it('la version SOURCE garde le sien', async () => {
    await addGuideVersion(CAT, SLUG, '2026-08', '2026-03');
    expect(readConfig('2026-03').pinned).toEqual(PINS);
  });
});
