/**
 * Tests du générateur character-release (dates de sortie des persos) :
 *   1. CŒURS PURS sur des cas RÉELS de l'archive — les six écritures de date,
 *      le découpage en sections (cellule de tableau, champs collés), la fiche
 *      des deux ères, la maintenance annoncée en intro, l'appariement exclusif
 *      des homonymes. Chaque cas cite la note dont il est tiré.
 *   2. GARDE-FOU sur `data/generated/character-release.json` committé : tout
 *      perso de `characters.json` a une date. C'est CE test qui empêche un
 *      trou de revenir en silence au prochain patch — exactement ce qui était
 *      arrivé aux bannières purgées (cf. data/curated/recruit-banners.json).
 *
 * Tourne SANS `.gamedata`.
 */
import { describe, expect, it } from 'vitest';
import charactersData from '../../data/generated/characters.json';
import releaseData from '../../data/generated/character-release.json';
import curatedData from '../../data/curated/character-release.json';
import {
  cleanLabel,
  composeReleases,
  labelFromHead,
  maintenanceDate,
  matchRoster,
  parseNoteDate,
  plainLines,
  splitSections,
  titleDate,
  type CharacterReleaseFile,
  type ReleaseHit,
  type RosterEntry,
} from './character-release';

const releases = releaseData as CharacterReleaseFile;
const characters = charactersData as Record<string, { name: { en: string } }>;

// ─── 1. Cœurs purs ───────────────────────────────────────────────────────────

describe('parseNoteDate — les six écritures de l’archive', () => {
  it.each([
    ['7/4 after the maintenance ~ 7/18 before the maintenance', '2023-07-03', '2023-07-04'],
    ['12/19/23 after the maintenance ~ 1/2/24', '2023-12-18', '2023-12-19'],
    ['11/21/2023 after the maintenance ~ 2/13/2024', '2023-11-20', '2023-11-21'],
    ['24/10/22 (Tue) after the maintenance', '2024-10-21', '2024-10-22'], // YY/MM/DD
    ['2026/08/12(Wed) after maintenance ~ Ongoing', '2026-08-11', '2026-08-12'],
    ['After maintenance on Oct 23, 2025 (Thu)', '2025-11-02', '2025-10-23'], // mois nommé
    ['December 16, 2025 After the maintenance', '2025-12-15', '2025-12-16'],
  ])('%s → %s', (raw, post, expected) => {
    expect(parseNoteDate(raw, post)).toBe(expected);
  });

  it('résout l’année absente au plus proche du post (bascule de fin d’année)', () => {
    // Note du 2023-12-18, « 1/2 » = janvier 2024, pas janvier 2023.
    expect(parseNoteDate('1/2 after the maintenance', '2023-12-18')).toBe('2024-01-02');
  });

  it('« 24/10/22 » lu en DD/MM donnerait le 24 — c’est YY/MM/DD', () => {
    expect(parseNoteDate('24/10/22 (Tue)', '2024-10-21')).not.toBe('2024-10-24');
  });

  it('rend null sans date lisible', () => {
    expect(parseNoteDate('mid March', '2026-03-10')).toBeNull();
    expect(parseNoteDate(null, '2026-03-10')).toBeNull();
  });
});

describe('splitSections — les pièges du HTML de l’archive', () => {
  it('ne prend pas une cellule de tableau de taux pour un titre de section', () => {
    // Note du 2023-06-19 : la table de taux du Demiurge Recruit coupait la
    // section avant la fiche de Demiurge Stella.
    const secs = splitSections(['4. New Recruit System and Boss', '1.25%', 'All 3★ Heroes']);
    expect(secs).toHaveLength(1);
    expect(secs[0].body).toEqual(['1.25%', 'All 3★ Heroes']);
  });

  it('tolère l’espace avant le point (« 1 . New Hero [Primine] »)', () => {
    expect(splitSections(['1 . New Hero [Primine]'])[0].head).toBe('New Hero [Primine]');
  });

  it('sépare les champs COLLÉS sur une seule ligne', () => {
    // Note du 2024-01-29 (Regina) : trois champs sans séparateur.
    const secs = splitSections([
      '2. New Hero, Regina, Drop Rate Up!',
      '# Battle Type: Mage# Subclass: Wizard# Schedule: 1/30 after the maintenance',
    ]);
    expect(secs[0].body).toEqual([
      '# Battle Type: Mage',
      '# Subclass: Wizard',
      '# Schedule: 1/30 after the maintenance',
    ]);
  });

  it('un sous-point « 1) … » n’ouvre pas de section', () => {
    const secs = splitSections(['1. New Hero [Anarky] Arrives', '1) Unlock Requirement']);
    expect(secs).toHaveLength(1);
  });
});

describe('plainLines — dé-tagage', () => {
  it('garde le numéro et son titre sur la même ligne', () => {
    // Le HTML sépare les deux en <strong> : couper sur toutes les balises
    // laissait « 1. » seul et la section devenait introuvable.
    const lines = plainLines(
      '<p><strong>1.</strong> <strong>New Hero, Aer, Drop Rate Up!</strong></p>',
    );
    expect(lines).toEqual(['1. New Hero, Aer, Drop Rate Up!']);
  });

  it('défait les échappements markdown de l’archive', () => {
    expect(plainLines('<p>\\# Name: Aer</p>')).toEqual(['# Name: Aer']);
  });
});

describe('maintenanceDate — le jour annoncé en intro', () => {
  const intro = (s: string): string[] => [s, '1. New Hero [X] Arrives'];

  it('lit « update scheduled for 02/24(Tue) »', () => {
    expect(
      maintenanceDate(
        intro('We would like to inform you of the in-game update scheduled for 02/24(Tue).'),
        '2026-02-23',
      ),
    ).toBe('2026-02-24');
  });

  it('lit « following the maintenance on Tuesday, June 20 »', () => {
    expect(
      maintenanceDate(
        intro(
          'Players will be able to experience this update in-game following the maintenance on Tuesday, June 20.',
        ),
        '2023-06-19',
      ),
    ).toBe('2023-06-20');
  });

  it('bat le titre quand les deux divergent', () => {
    // Note du 2023-08-14 : titre « 8/15 », intro « August 16 ». La fiche de
    // Sterope dit 8/16 — c’est l’intro qui a raison.
    const lines = intro('…following the maintenance on Wednesday, August 16.');
    expect(maintenanceDate(lines, '2023-08-14')).toBe('2023-08-16');
    expect(titleDate('8/15 (Tue) Update Notice(Added on 8/14)', '2023-08-14')).toBe('2023-08-15');
  });

  it('écarte une date trop lointaine (intro recopiée de la note précédente)', () => {
    // Note du 2025-12-01 intitulée « 12/02 » dont l’intro dit « 11/18 ».
    expect(
      maintenanceDate(intro('…in-game update scheduled for 11/18 (Tue).'), '2025-12-01'),
    ).toBeNull();
  });

  it('ne lit rien après la première section', () => {
    const lines = ['Dear Masters,', '1. New Hero', '# Schedule: 5/6 after the maintenance'];
    expect(maintenanceDate(lines, '2024-04-22')).toBeNull();
  });
});

describe('labelFromHead — les gabarits de titre sans fiche', () => {
  it.each([
    ['New Hero, Rin, Drop Rate Up!', 'Rin'],
    ['New Hero Fatal Drop Rate Up!', 'Fatal'],
    [
      'New Limited Hero [Holy Night’s Blessing Dianne] Drop Rate Up!',
      'Holy Night’s Blessing Dianne',
    ],
    ['New Festival Hero Drop Rate Up - Gnosis Dahlia', 'Gnosis Dahlia'],
    ['New Collaboration Hero, Ryu Lion', 'Ryu Lion'],
    ['New Hero [Anarky] Arrives', 'Anarky'],
  ])('%s → %s', (head, expected) => {
    expect(labelFromHead(head)).toBe(expected);
  });
});

describe('cleanLabel', () => {
  it('retire crochets, deux-points de tête et ponctuation de queue', () => {
    expect(cleanLabel(': [Gnosis Nella],')).toBe('Gnosis Nella');
  });
});

describe('matchRoster — appariement EXCLUSIF', () => {
  const roster: RosterEntry[] = [
    { id: '2000039', label: 'Stella', coreFusion: false },
    { id: '2000053', label: 'Demiurge Stella', coreFusion: false },
    { id: '2000003', label: 'Snow', coreFusion: false },
    { id: '2700003', label: 'Snow', coreFusion: true },
  ];

  it('« Stella » ne matche pas « Demiurge Stella » et réciproquement', () => {
    expect(matchRoster('Stella', false, roster)?.id).toBe('2000039');
    expect(matchRoster('Demiurge Stella', false, roster)?.id).toBe('2000053');
  });

  it('une section Core Fusion vise le 2700xxx, pas l’homonyme de base', () => {
    // Les deux portent le MÊME nom : seul le contexte de la section tranche.
    expect(matchRoster('Snow', true, roster)?.id).toBe('2700003');
    expect(matchRoster('Snow', false, roster)?.id).toBe('2000003');
  });

  it('un nom hors roster ne matche rien (jamais de partiel)', () => {
    expect(matchRoster('Never Stop Soulslayers', false, roster)).toBeUndefined();
  });
});

describe('composeReleases — première date, puis curé par-dessus', () => {
  const roster: RosterEntry[] = [
    { id: '2000060', label: 'Tamara', coreFusion: false },
    { id: '2000106', label: "Summer Knight's Dream Ember", coreFusion: false },
  ];
  const hit = (label: string, date: string): ReleaseHit => ({
    label,
    date,
    source: 'fiche',
    post: date,
    title: '',
    head: '',
    coreFusion: false,
  });

  it('garde la PREMIÈRE date quand une reprise re-cite le perso', () => {
    const { releases } = composeReleases(
      [hit('Tamara', '2024-03-26'), hit('Tamara', '2023-09-12')],
      roster,
      {},
    );
    expect(releases['2000060']).toBe('2023-09-12');
  });

  it('le curé comble ce que la dérivation ignore', () => {
    const { releases, sources } = composeReleases([], roster, { '2000106': '2025-10-01' });
    expect(releases['2000106']).toBe('2025-10-01');
    expect(sources['2000106']).toBe('curé');
  });

  it('le curé écrase la dérivation, et signale une entrée redondante', () => {
    const derived = [hit('Tamara', '2023-09-12')];
    expect(composeReleases(derived, roster, { '2000060': '2023-09-99' }).releases['2000060']).toBe(
      '2023-09-99',
    );
    expect(composeReleases(derived, roster, { '2000060': '2023-09-12' }).redundant).toEqual([
      '2000060',
    ]);
  });

  it('n’émet aucun id hors roster', () => {
    const { releases } = composeReleases([], roster, { '9999999': '2020-01-01' });
    expect(releases['9999999']).toBeUndefined();
  });
});

// ─── 2. Garde-fou sur le fichier committé ────────────────────────────────────

describe('character-release.json committé', () => {
  it('date TOUS les persos de characters.json', () => {
    const missing = Object.keys(characters).filter((id) => !releases[id]);
    expect(missing.map((id) => `${id} ${characters[id].name.en}`)).toEqual([]);
  });

  it('n’émet aucun id inconnu de characters.json', () => {
    expect(Object.keys(releases).filter((id) => !characters[id])).toEqual([]);
  });

  it('toutes les dates sont des jours valides, du lancement global à aujourd’hui', () => {
    for (const [id, date] of Object.entries(releases)) {
      expect(date, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(date)), id).toBe(false);
      // Lancement global le 2023-04-19 : rien ne peut être antérieur.
      expect(date >= '2023-04-19', `${id} ${date}`).toBe(true);
    }
  });

  it('les clés sont triées (diff git stable)', () => {
    const keys = Object.keys(releases);
    expect(keys).toEqual([...keys].sort());
  });

  it('le curé est documenté et ne cite que des persos connus', () => {
    const curated = curatedData as { _doc: string; releases: Record<string, string> };
    expect(curated._doc.length).toBeGreaterThan(80);
    expect(Object.keys(curated.releases).filter((id) => !characters[id])).toEqual([]);
    for (const [id, date] of Object.entries(curated.releases)) {
      expect(releases[id], id).toBe(date); // le curé fait autorité
    }
  });
});
