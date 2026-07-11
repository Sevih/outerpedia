import { describe, expect, it } from 'vitest';
import { seasonStandingAt, seasonsForBoss, type Season } from '@/lib/data/content-schedule';

/**
 * La règle de jointure guide → saison. Les deux ids existent et se ressemblent,
 * mais ne désignent PAS la même chose : s'y tromper est silencieux (0 saison
 * trouvée, badge absent, personne ne s'en aperçoit). D'où ces tests.
 */
describe('seasonsForBoss — jointure par le monstre COMBATTU', () => {
  it('joint sur l’entité combattue (bossId d’un guide)', () => {
    // 4548181 = Prototype EX-78 en very hard — ce que porte le guide.
    const seasons = seasonsForBoss('4548181');
    expect(seasons.length).toBeGreaterThan(0);
    expect(seasons.every((s) => s.mode === 'joint-challenge')).toBe(true);
  });

  it('ne joint PAS sur le boss canonique de la saison', () => {
    // 4548001 = la colonne `boss` de la saison : un id LOGIQUE d'affichage,
    // jamais une entité spawnée. Le prendre pour clé de jointure ne rendrait
    // aucune saison — d'où ce garde-fou.
    expect(seasonsForBoss('4548001')).toHaveLength(0);
  });

  it('rend les saisons triées de la plus ancienne à la plus récente', () => {
    const starts = seasonsForBoss('4548181').map((s) => s.start);
    expect(starts).toEqual([...starts].sort());
  });

  it('un même boss revient sur plusieurs saisons (rotation)', () => {
    expect(seasonsForBoss('4548181').length).toBeGreaterThan(1);
  });

  it('battleEnd ne dépasse jamais la fin de saison', () => {
    // 440600105 = boss de guild raid : couvre les trois modes de normalisation.
    for (const id of ['4548181', '4548161', '440600105']) {
      for (const s of seasonsForBoss(id)) {
        expect(s.start < s.battleEnd, `${s.mode} #${s.id}`).toBe(true);
        expect(s.battleEnd <= s.end, `${s.mode} #${s.id}`).toBe(true);
      }
    }
  });

  it('aucune saison ne dure des mois (piège rankingEnd du guild raid)', () => {
    // `rankingEnd` (fin d'AFFICHAGE du classement, ~3 mois après) n'est pas une
    // clôture de saison : la prendre pour `end` ferait « durer » la saison de
    // juin jusqu'en septembre — et tout `start ≤ now < end` mentirait en
    // silence. Invariant : une saison en table tient en ≤ 30 jours.
    const MAX_DAYS = 30;
    for (const id of ['4548181', '440600105']) {
      for (const s of seasonsForBoss(id)) {
        const days = (Date.parse(s.end) - Date.parse(s.start)) / 86_400_000;
        expect(days, `${s.mode} #${s.id} : ${s.start} → ${s.end}`).toBeLessThanOrEqual(MAX_DAYS);
      }
    }
  });

  it('ignore le suffixe d’épinglage `@n` (convention datagen)', () => {
    expect(seasonsForBoss('4548181@2')).toEqual(seasonsForBoss('4548181'));
  });

  it('rend une liste vide pour un id inconnu (pas de badge, pas d’erreur)', () => {
    expect(seasonsForBoss('999999')).toHaveLength(0);
  });
});

/** Deux saisons fictives : les vraies bougeront à chaque patch, pas ces dates. */
const SEASONS: Season[] = [
  {
    mode: 'joint-challenge',
    id: '1',
    name: { en: 'Ancienne' },
    start: '2026-01-06T00:00:00Z',
    battleEnd: '2026-01-13T00:00:00Z',
    end: '2026-01-13T00:00:00Z',
  },
  {
    mode: 'joint-challenge',
    id: '2',
    name: { en: 'Récente' },
    start: '2026-06-02T00:00:00Z',
    battleEnd: '2026-06-09T00:00:00Z',
    end: '2026-06-16T00:00:00Z',
  },
];
const at = (iso: string) => seasonStandingAt(SEASONS, new Date(iso));

describe('seasonStandingAt — saison à annoncer à un instant donné', () => {
  it('« en cours » pendant la période de COMBAT', () => {
    expect(at('2026-06-05T12:00:00Z')).toMatchObject({ state: 'live', season: { id: '2' } });
  });

  /**
   * LE piège du domaine : entre `battleEnd` et `end` la saison n'est pas finie
   * (règlement, récompenses) mais le boss n'est PLUS COMBATTABLE. Réduire
   * « jouable » à `start ≤ now < end` afficherait « en cours » une semaine de
   * trop.
   */
  it('n’est PLUS « en cours » après battleEnd, même avant la fin de saison', () => {
    const standing = at('2026-06-12T00:00:00Z'); // battleEnd < now < end
    expect(standing?.state).not.toBe('live');
  });

  it('annonce la prochaine saison quand aucune n’est ouverte', () => {
    expect(at('2026-03-01T00:00:00Z')).toMatchObject({ state: 'upcoming', season: { id: '2' } });
  });

  it('retombe sur la dernière saison connue quand tout est passé', () => {
    expect(at('2026-12-01T00:00:00Z')).toMatchObject({ state: 'past', season: { id: '2' } });
  });

  it('est « en cours » dès la seconde d’ouverture, plus à celle de fin', () => {
    expect(at('2026-06-02T00:00:00Z')?.state).toBe('live');
    expect(at('2026-06-09T00:00:00Z')?.state).not.toBe('live');
  });

  it('rend `undefined` sans aucune saison (boss jamais programmé)', () => {
    expect(seasonStandingAt([], new Date('2026-06-05T00:00:00Z'))).toBeUndefined();
  });
});
