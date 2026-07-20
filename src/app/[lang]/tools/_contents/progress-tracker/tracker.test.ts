/**
 * Tests de la logique pure du progress tracker : resets calés sur le serveur
 * du jeu (UTC), synchro réglages ⇄ progression, cycles spéciaux (couloir
 * infini, tour céleste very hard, fabrication précise) et interprétation du
 * schéma V2 — le contrat de migration est NON NÉGOCIABLE, il est épinglé ici.
 */
import { describe, expect, it } from 'vitest';
import {
  PROGRESS_SPEC,
  SETTINGS_SPEC,
  EMPTY_PROGRESS,
  activeTaskIds,
  checkAndResetProgress,
  coerceProgress,
  createDefaultSettings,
  exportState,
  formatTimeUntil,
  getNextPreciseCraftTime,
  getNextRecurringTaskReset,
  getNextReset,
  getNextVHTUnlockTime,
  getStats,
  getTaskMaxCount,
  getVHTUnlockedPhase,
  importState,
  isPreciseCraftAvailable,
  normalizeSettings,
  reconcileProgress,
  syncProgressWithSettings,
  withCategoryToggled,
  withPreciseCraftDays,
  withPreciseCraftToggled,
  withSweepToggled,
  withTaskCount,
  type UserSettings,
} from './tracker';

const DAY = 86_400_000;
// Mercredi 15/07/2026 10:00 UTC (jour du mois 15 → phase VHT 3, singularité ouverte)
const WED = Date.UTC(2026, 6, 15, 10);
// Dimanche 12/07/2026 10:00 UTC (singularité fermée)
const SUN = Date.UTC(2026, 6, 12, 10);
// Lundi 13/07/2026 01:00 UTC (juste après le reset hebdo)
const MON = Date.UTC(2026, 6, 13, 1);

function settingsWith(patch: Partial<UserSettings>): UserSettings {
  return { ...createDefaultSettings(), ...patch };
}

describe('specs de storage (contrat de migration V2 → V3)', () => {
  it('clés, versions et clés héritées EXACTES du contrat', () => {
    expect(PROGRESS_SPEC.key).toBe('outerpedia:progress-tracker');
    expect(PROGRESS_SPEC.version).toBe(1);
    expect(PROGRESS_SPEC.legacyKeys).toEqual(['outerplane:progress']);
    expect(SETTINGS_SPEC.key).toBe('outerpedia:progress-tracker:settings');
    expect(SETTINGS_SPEC.version).toBe(1);
    expect(SETTINGS_SPEC.legacyKeys).toEqual(['outerplane:settings']);
  });
});

describe('réglages', () => {
  it('défauts : permanents + boutique/atelier activés, événementiels non', () => {
    const s = createDefaultSettings();
    expect(s.enabledTasks.daily).toContain('story-hard');
    expect(s.enabledTasks.daily).toContain('shop-daily-free-gift');
    expect(s.enabledTasks.weekly).toContain('craft-weekly-blue-stardust');
    expect(s.enabledTasks.daily).not.toContain('joint-challenge');
    expect(s.adventureLicenseCombatsPerStage).toBe(2);
    expect(s.displayMode).toBe('tabs');
  });

  it('normalizeSettings : ids obsolètes écartés, permanents forcés, ordre des définitions', () => {
    const s = normalizeSettings({
      enabledTasks: {
        // désordre volontaire + id obsolète + permanent manquant (story-hard)
        daily: ['ark-raid', 'vieux-contenu-disparu', 'free-recruit-custom'],
        weekly: ['arena-battle'],
        monthly: ['skyward-tower-100'],
      },
      adventureLicenseCombatsPerStage: 99,
    });
    expect(s.enabledTasks.daily).not.toContain('vieux-contenu-disparu');
    expect(s.enabledTasks.daily).toContain('story-hard');
    // ordre canonique : free-recruit-custom (1re définition) avant ark-raid
    expect(s.enabledTasks.daily.indexOf('free-recruit-custom')).toBeLessThan(
      s.enabledTasks.daily.indexOf('ark-raid'),
    );
    // les entrées boutique désactivées RESTENT désactivées
    expect(s.enabledTasks.daily).not.toContain('shop-daily-free-gift');
    expect(s.adventureLicenseCombatsPerStage).toBe(2);
    // idempotence
    expect(normalizeSettings(s)).toEqual(s);
  });

  it('getTaskMaxCount : modulé par les packs et le réglage licence', () => {
    const base = createDefaultSettings();
    expect(getTaskMaxCount('terminus-isle', 'daily', base)).toBe(1);
    expect(
      getTaskMaxCount('terminus-isle', 'daily', settingsWith({ hasTerminusSupportPack: true })),
    ).toBe(2);
    expect(getTaskMaxCount('ark-raid', 'daily', base)).toBe(3);
    expect(
      getTaskMaxCount(
        'hypnotic-frog-hall',
        'daily',
        settingsWith({ hasVeronicaPremiumPack: true }),
      ),
    ).toBe(4);
    expect(getTaskMaxCount('adventure-license', 'weekly', base)).toBe(6);
    expect(
      getTaskMaxCount(
        'adventure-license',
        'weekly',
        settingsWith({ adventureLicenseCombatsPerStage: 4 }),
      ),
    ).toBe(12);
    expect(getTaskMaxCount('story-hard', 'daily', base)).toBe(30);
  });
});

describe('disponibilité calendaire', () => {
  it('tour élémentaire masquée une fois terminée', () => {
    const done = settingsWith({ hasCompletedElementalTower: true });
    expect(activeTaskIds('daily', createDefaultSettings(), WED)).toContain('elemental-tower');
    expect(activeTaskIds('daily', done, WED)).not.toContain('elemental-tower');
  });

  it('singularité dimensionnelle : mercredi → samedi seulement', () => {
    const s = createDefaultSettings();
    expect(activeTaskIds('daily', s, WED)).toContain('dimensional-singularity');
    expect(activeTaskIds('daily', s, SUN)).not.toContain('dimensional-singularity');
  });
});

describe('synchro réglages ⇄ progression', () => {
  it('peuple les tâches actives à zéro depuis une progression vierge', () => {
    const p = reconcileProgress(EMPTY_PROGRESS, createDefaultSettings(), WED);
    expect(p.daily['story-hard']).toEqual({ count: 0, lastUpdated: WED });
    expect(p.weekly['arena-battle']).toBeDefined();
    expect(p.monthly['skyward-tower-vhard-20']).toBeDefined();
    expect(p.lastDailyReset).toBe(WED);
  });

  it('re-borne le count quand un pack est désactivé', () => {
    const veronica = settingsWith({ hasVeronicaPremiumPack: true });
    let p = reconcileProgress(EMPTY_PROGRESS, veronica, WED);
    p = withTaskCount(p, 'daily', 'ark-raid', 4, veronica, WED);
    const synced = syncProgressWithSettings(p, createDefaultSettings(), WED);
    expect(synced.daily['ark-raid'].count).toBe(3);
  });

  it('écarte une tâche désactivée, la ré-ajoute à zéro si réactivée', () => {
    const s = createDefaultSettings();
    let p = reconcileProgress(EMPTY_PROGRESS, s, WED);
    p = withTaskCount(p, 'daily', 'shop-fp-stamina', 4, s, WED);
    const disabled = settingsWith({
      enabledTasks: {
        ...s.enabledTasks,
        daily: s.enabledTasks.daily.filter((id) => id !== 'shop-fp-stamina'),
      },
    });
    const without = syncProgressWithSettings(p, disabled, WED);
    expect(without.daily['shop-fp-stamina']).toBeUndefined();
    const backAgain = syncProgressWithSettings(without, s, WED);
    expect(backAgain.daily['shop-fp-stamina'].count).toBe(0);
  });
});

describe('resets', () => {
  const s = createDefaultSettings();

  it('quotidien à 00:00 UTC : dû le lendemain, pas le jour même', () => {
    let p = reconcileProgress(EMPTY_PROGRESS, s, WED);
    p = withTaskCount(p, 'daily', 'story-hard', 12, s, WED);
    // Même jour, une heure plus tard : rien ne bouge.
    expect(checkAndResetProgress(p, s, WED + 3_600_000).daily['story-hard'].count).toBe(12);
    // Lendemain : remise à zéro.
    const next = checkAndResetProgress(p, s, WED + DAY);
    expect(next.daily['story-hard'].count).toBe(0);
    expect(next.lastDailyReset).toBe(WED + DAY);
  });

  it('récurrente (couloir infini) : retombe 3 jours UTC après complétion, pas avant', () => {
    let p = reconcileProgress(EMPTY_PROGRESS, s, WED);
    p = withTaskCount(p, 'daily', 'infinite-corridor', 1, s, WED);
    expect(getNextRecurringTaskReset(p, 'infinite-corridor', s)).toBe(Date.UTC(2026, 6, 18));
    // Lendemain : le reset quotidien passe mais la récurrente tient.
    const day1 = checkAndResetProgress(p, s, WED + DAY);
    expect(day1.daily['infinite-corridor'].count).toBe(1);
    // Trois jours après (18/07 10:00) : elle retombe.
    const day3 = checkAndResetProgress(day1, s, WED + 3 * DAY);
    expect(day3.daily['infinite-corridor'].count).toBe(0);
  });

  it('hebdo au lundi 00:00 UTC', () => {
    let p = reconcileProgress(EMPTY_PROGRESS, s, SUN);
    p = withTaskCount(p, 'weekly', 'arena-battle', 30, s, SUN);
    const monday = checkAndResetProgress(p, s, MON);
    expect(monday.weekly['arena-battle'].count).toBe(0);
    // Mardi → mercredi de la même semaine : pas de nouveau reset hebdo.
    const tue = withTaskCount(monday, 'weekly', 'arena-battle', 7, s, MON + DAY);
    expect(checkAndResetProgress(tue, s, MON + 2 * DAY).weekly['arena-battle'].count).toBe(7);
  });

  it('mensuel au 1er 00:00 UTC', () => {
    const endOfJune = Date.UTC(2026, 5, 30, 22);
    let p = reconcileProgress(EMPTY_PROGRESS, s, endOfJune);
    p = withTaskCount(p, 'monthly', 'skyward-tower-100', 1, s, endOfJune);
    const july = checkAndResetProgress(p, s, Date.UTC(2026, 6, 1, 2));
    expect(july.monthly['skyward-tower-100'].count).toBe(0);
  });

  it('reconcileProgress est idempotente à instant figé', () => {
    const p = reconcileProgress(EMPTY_PROGRESS, s, WED);
    expect(reconcileProgress(p, s, WED)).toEqual(p);
  });

  it('prochains resets', () => {
    expect(getNextReset('daily', WED)).toBe(Date.UTC(2026, 6, 16));
    expect(getNextReset('weekly', WED)).toBe(Date.UTC(2026, 6, 20)); // lundi suivant
    expect(getNextReset('monthly', WED)).toBe(Date.UTC(2026, 7, 1));
  });
});

describe('tour céleste very hard (déblocage progressif)', () => {
  it('phases débloquées les 1/8/15/22 du mois', () => {
    expect(getVHTUnlockedPhase(Date.UTC(2026, 6, 1))).toBe(1);
    expect(getVHTUnlockedPhase(Date.UTC(2026, 6, 7, 23))).toBe(1);
    expect(getVHTUnlockedPhase(Date.UTC(2026, 6, 8))).toBe(2);
    expect(getVHTUnlockedPhase(WED)).toBe(3);
    expect(getVHTUnlockedPhase(Date.UTC(2026, 6, 22))).toBe(4);
  });

  it('prochain déblocage (null quand tout est ouvert)', () => {
    expect(getNextVHTUnlockTime(Date.UTC(2026, 6, 10))).toBe(Date.UTC(2026, 6, 15));
    expect(getNextVHTUnlockTime(WED)).toBe(Date.UTC(2026, 6, 22));
    expect(getNextVHTUnlockTime(Date.UTC(2026, 6, 25))).toBeNull();
  });
});

describe('fabrication précise (30 jours glissants)', () => {
  const s = createDefaultSettings();
  const base = reconcileProgress(EMPTY_PROGRESS, s, WED);

  it('bascule, indisponible 30 jours, puis à nouveau disponible', () => {
    expect(isPreciseCraftAvailable(base, WED)).toBe(true);
    const crafted = withPreciseCraftToggled(base, WED);
    expect(crafted.preciseCraft.completedAt).toBe(WED);
    expect(isPreciseCraftAvailable(crafted, WED + 29 * DAY)).toBe(false);
    expect(getNextPreciseCraftTime(crafted, WED)).toBe(WED + 30 * DAY);
    expect(isPreciseCraftAvailable(crafted, WED + 30 * DAY)).toBe(true);
    expect(withPreciseCraftToggled(crafted, WED).preciseCraft.completedAt).toBeNull();
  });

  it('saisie manuelle « disponible dans N jours »', () => {
    const inFive = withPreciseCraftDays(base, 5, WED);
    expect(getNextPreciseCraftTime(inFive, WED)).toBe(WED + 5 * DAY);
    expect(withPreciseCraftDays(base, 0, WED).preciseCraft.completedAt).toBeNull();
  });
});

describe('mutations groupées et stats', () => {
  const s = createDefaultSettings();
  const base = reconcileProgress(EMPTY_PROGRESS, s, WED);

  it('withTaskCount borne entre 0 et le max effectif', () => {
    expect(withTaskCount(base, 'daily', 'story-hard', 99, s, WED).daily['story-hard'].count).toBe(
      30,
    );
    expect(withTaskCount(base, 'daily', 'story-hard', -3, s, WED).daily['story-hard'].count).toBe(
      0,
    );
    expect(withTaskCount(base, 'daily', 'inconnu', 1, s, WED)).toBe(base);
  });

  it('sweep : tout compléter, puis tout remettre à zéro', () => {
    const swept = withSweepToggled(base, s, WED);
    expect(swept.daily['story-hard'].count).toBe(30);
    expect(swept.daily['ark-raid'].count).toBe(3);
    // hors périmètre du sweep
    expect(swept.daily['free-recruit-custom'].count).toBe(0);
    const back = withSweepToggled(swept, s, WED);
    expect(back.daily['story-hard'].count).toBe(0);
  });

  it('bascule boutique par cycle', () => {
    const bought = withCategoryToggled(base, 'daily', 'shop', s, WED);
    expect(bought.daily['shop-fp-stamina'].count).toBe(4);
    expect(bought.daily['story-hard'].count).toBe(0);
  });

  it('stats : la fabrication précise compte dans le mensuel', () => {
    const stats = getStats(base, s, WED);
    expect(stats.monthly.total).toBe(Object.keys(base.monthly).length + 1);
    expect(stats.monthly.completed).toBe(0);
    const crafted = withPreciseCraftToggled(base, WED);
    expect(getStats(crafted, s, WED).monthly.completed).toBe(1);
    const swept = withSweepToggled(base, s, WED);
    expect(getStats(swept, s, WED).daily.completed).toBe(7);
  });

  it('formatTimeUntil', () => {
    expect(formatTimeUntil(WED + 2 * DAY + 4 * 3_600_000 + 12 * 60_000, WED)).toBe('2d 4h 12m');
    expect(formatTimeUntil(WED + 90 * 60_000, WED)).toBe('1h 30m');
    expect(formatTimeUntil(WED - 1, WED)).toBe('0h 0m');
  });
});

describe('interprétation du schéma V2 et import/export', () => {
  it('coerceProgress lit une progression V2 réelle', () => {
    const v2 = {
      daily: {
        'story-hard': {
          id: 'story-hard',
          completed: false,
          count: 12,
          maxCount: 30,
          lastUpdated: WED,
        },
        // vieux schéma « case cochée » sans count : la complétion est préservée
        'free-recruit-custom': {
          id: 'free-recruit-custom',
          completed: true,
          maxCount: 1,
          lastUpdated: WED,
        },
      },
      weekly: {
        'arena-battle': {
          id: 'arena-battle',
          completed: true,
          count: 30,
          maxCount: 30,
          lastUpdated: WED,
        },
      },
      monthly: {},
      preciseCraft: { completedAt: WED },
      lastDailyReset: WED,
      lastWeeklyReset: WED,
      lastMonthlyReset: WED,
      version: 1,
    };
    const p = coerceProgress(v2)!;
    expect(p.daily['story-hard']).toEqual({ count: 12, lastUpdated: WED });
    expect(p.daily['free-recruit-custom'].count).toBe(1);
    expect(p.weekly['arena-battle'].count).toBe(30);
    expect(p.preciseCraft.completedAt).toBe(WED);
    expect(p.lastDailyReset).toBe(WED);
  });

  it('coerceProgress refuse une forme sans daily/weekly', () => {
    expect(coerceProgress({ foo: 1 })).toBeUndefined();
    expect(coerceProgress('rien')).toBeUndefined();
  });

  it('export V3 → import : aller-retour complet', () => {
    const s = settingsWith({ hasVeronicaPremiumPack: true });
    const p = withTaskCount(
      reconcileProgress(EMPTY_PROGRESS, s, WED),
      'daily',
      'ark-raid',
      4,
      s,
      WED,
    );
    const imported = importState(exportState(p, s))!;
    expect(imported.progress).toEqual(p);
    expect(imported.settings).toEqual(s);
  });

  it('import d’un export V2 (progression brute, sans réglages)', () => {
    const raw = JSON.stringify({
      daily: { 'story-hard': { completed: false, count: 3, maxCount: 30, lastUpdated: WED } },
      weekly: {},
      lastDailyReset: WED,
      lastWeeklyReset: WED,
      version: 1,
    });
    const imported = importState(raw)!;
    expect(imported.progress.daily['story-hard'].count).toBe(3);
    expect(imported.settings).toBeNull();
    expect(importState('{pas du json')).toBeNull();
  });
});
