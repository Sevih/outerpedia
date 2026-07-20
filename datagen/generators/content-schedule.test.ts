/**
 * Tests du générateur content-schedule — les DEUX registres actés :
 *
 *   1. CŒUR PUR en synthétique : `isoUtc` (normalisation des dates de table
 *      vers l'ISO UTC) — le tri des saisons (localeCompare) et le statut « en
 *      saison » (SeasonBadge, côté client) reposent ENTIÈREMENT dessus.
 *
 *   2. INVARIANTS sur `data/generated/content-schedule.json` committé : dates
 *      bien formées et ordonnées, saisons triées, références croisées vers
 *      encounters/monsters — la jointure guide↔saison (gravée côté src dans
 *      content-schedule.test.ts) suppose que `monsters` liste des entités
 *      réelles ; si le générateur dérive, la jointure rate en silence.
 *
 * Tourne SANS `.gamedata` (rien n'appelle buildContentSchedule).
 */
import { describe, expect, it } from 'vitest';
import scheduleData from '../../data/generated/content-schedule.json';
import encountersData from '../../data/generated/encounters.json';
import monstersData from '../../data/generated/monsters.json';
import { isoUtc, type ContentScheduleData } from './content-schedule';
import type { DungeonRef } from './encounters';

const schedule = scheduleData as unknown as ContentScheduleData;
// encounters.json committé = le dict `dungeons` d'EncountersData (éclaté au build).
const dungeons = encountersData as unknown as Record<string, DungeonRef>;
const monsterIds = new Set(Object.keys(monstersData as Record<string, unknown>));

// ─── 1. Cœur pur ─────────────────────────────────────────────────────────────

describe('isoUtc — normalisation des dates de table', () => {
  it('« AAAA-MM-JJ H:MM:SS » → ISO UTC, heure PADDÉE (sinon le localeCompare ment)', () => {
    expect(isoUtc('2026-07-02 0:00:00')).toBe('2026-07-02T00:00:00Z');
    expect(isoUtc('2026-07-02 14:30:05')).toBe('2026-07-02T14:30:05Z');
  });

  it('format inattendu → rendu tel quel (signalé, jamais de throw)', () => {
    expect(isoUtc('2026/07/02')).toBe('2026/07/02');
    expect(isoUtc(undefined)).toBe('');
  });
});

// ─── 2. Invariants sur la donnée committée ───────────────────────────────────

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const allSeasons = [...schedule.worldBoss, ...schedule.guildRaid, ...schedule.jointChallenge];

describe('content-schedule.json — invariants structurels', () => {
  it('chaque liste est triée par date de début (contrat « saisons triées »)', () => {
    for (const [mode, list] of Object.entries(schedule)) {
      const starts = list.map((s: { start: string }) => s.start);
      expect(
        [...starts].sort((a, b) => a.localeCompare(b)),
        mode,
      ).toEqual(starts);
    }
  });

  it('toutes les bornes sont en ISO UTC et ordonnées dans la saison', () => {
    const bad: string[] = [];
    for (const s of schedule.worldBoss) {
      const bounds = [s.start, s.battleEnd, s.tallyEnd, s.end].filter(
        (v): v is string => v != null,
      );
      for (const b of bounds) if (!ISO.test(b)) bad.push(`wb ${s.id} : ${b}`);
      for (let i = 1; i < bounds.length; i++)
        if (bounds[i - 1] > bounds[i]) bad.push(`wb ${s.id} : ${bounds[i - 1]} > ${bounds[i]}`);
    }
    for (const s of schedule.guildRaid) {
      const bounds = [s.start, s.phaseEnd, s.battleEnd, s.settlementEnd].filter(
        (v): v is string => v != null,
      );
      for (const b of bounds) if (!ISO.test(b)) bad.push(`gr ${s.id} : ${b}`);
      for (let i = 1; i < bounds.length; i++)
        if (bounds[i - 1] > bounds[i]) bad.push(`gr ${s.id} : ${bounds[i - 1]} > ${bounds[i]}`);
    }
    for (const s of schedule.jointChallenge) {
      for (const b of [s.start, s.end]) if (!ISO.test(b)) bad.push(`jc ${s.id} : ${b}`);
      if (s.start > s.end) bad.push(`jc ${s.id} : start > end`);
    }
    expect(bad).toEqual([]);
  });

  it('les donjons des saisons SERVIES par le site existent dans encounters.json', () => {
    // Encounters ne garde que le PRÉSENT : ligues World Boss mortes purgées
    // (deadWbDungeons) et guild raid limité à la saison COURANTE (grCurrent).
    // L'invariant porte donc sur ce que les pages consomment : tous les
    // joint challenges (tous extraits), et la DERNIÈRE saison de guild raid.
    const orphans: string[] = [];
    for (const s of schedule.jointChallenge) {
      for (const d of s.dungeons) if (!dungeons[d]) orphans.push(`jc ${s.id} → ${d}`);
    }
    const grCurrent = schedule.guildRaid.at(-1);
    expect(grCurrent).toBeDefined();
    for (const b of grCurrent!.bosses) {
      for (const d of b.dungeons) if (!dungeons[d]) orphans.push(`gr ${grCurrent!.id} → ${d}`);
    }
    expect(orphans).toEqual([]);
  });

  it('chaque monstre de saison existe dans monsters.json (la JOINTURE en dépend)', () => {
    const orphans: string[] = [];
    for (const s of schedule.worldBoss) {
      for (const m of s.monsters) if (!monsterIds.has(m)) orphans.push(`wb ${s.id} → ${m}`);
    }
    for (const s of schedule.jointChallenge) {
      for (const m of s.monsters) if (!monsterIds.has(m)) orphans.push(`jc ${s.id} → ${m}`);
    }
    for (const s of schedule.guildRaid) {
      for (const b of s.bosses) {
        for (const m of b.monsters) if (!monsterIds.has(m)) orphans.push(`gr ${s.id} → ${m}`);
      }
    }
    expect(orphans).toEqual([]);
  });

  it('le boss CANONIQUE (affichage) de la DERNIÈRE saison existe dans monsters.json', () => {
    // Les boss d'affichage des VIEILLES saisons peuvent être purgés de
    // monsters.json (extraction à la demande) — c'est la saison courante que
    // le site affiche (SeasonBadge, cartes) : elle, doit résoudre.
    const orphans: string[] = [];
    for (const [mode, list] of [
      ['wb', schedule.worldBoss],
      ['jc', schedule.jointChallenge],
    ] as const) {
      const s = list.at(-1);
      if (s?.boss && !monsterIds.has(s.boss)) orphans.push(`${mode} ${s.id} → ${s.boss}`);
    }
    expect(orphans).toEqual([]);
  });

  it('aucune saison sans identité ni fenêtre', () => {
    for (const s of allSeasons) {
      expect(s.id).toBeTruthy();
      expect(s.start).toBeTruthy();
    }
  });
});
