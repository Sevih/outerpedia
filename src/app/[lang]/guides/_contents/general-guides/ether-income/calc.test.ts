import { describe, expect, it } from 'vitest';
import type { ReactElement } from 'react';
import { getT } from '@/i18n';
import { singularityBattleDays } from '@/lib/data/singularity';
import { LANGS, type Lang } from '@/lib/i18n/config';
import {
  etherProjection,
  etherTotals,
  monthlyFromWeekly,
  type EtherRow,
  type EtherTotals,
} from './calc';
import type { CalculatorModel, SourceRow } from './Calculator';
import EtherIncomeGuide from './index';

/** Le modèle que le serveur passe au calculateur (rendu réel du guide). */
async function serverModel(lang: Lang = 'en'): Promise<CalculatorModel> {
  const el = (await EtherIncomeGuide({ lang })) as ReactElement<{
    children: ReactElement<{ model?: CalculatorModel }>[];
  }>;
  const model = el.props.children.map((c) => c.props.model).find(Boolean);
  if (!model) throw new Error('modèle du calculateur introuvable');
  return model;
}

/** Montant effectif d'une ligne avec les paliers PAR DÉFAUT (comme le composant). */
function defaultAmountOf(model: CalculatorModel): (s: SourceRow) => number {
  const league = model.worldBoss.leagues[model.worldBoss.defaultLeagueIdx];
  const picked = {
    arena: model.arena.options[model.arena.defaultIdx],
    guildRaid: model.guildRaid.options[model.guildRaid.defaultIdx],
    worldBoss: league?.options[league.defaultIdx],
    singularity: model.singularity.options[model.singularity.defaultIdx],
  };
  return (s) => (s.ranked ? (picked[s.ranked]?.ether ?? s.amount) : s.amount);
}

describe('etherTotals — un mois de 30 jours partout', () => {
  it('l’hebdo passe au mois par × 30 / 7, arrondi comme le quotidien', () => {
    const rows: Record<'daily' | 'weekly' | 'monthly', (EtherRow & { amount: number })[]> = {
      daily: [{ amount: 10 }],
      weekly: [{ amount: 100 }],
      monthly: [],
    };
    const totals = etherTotals(rows, (s) => s.amount);
    expect(monthlyFromWeekly(100)).toBe(429); // 3000 / 7 = 428,57
    expect(totals.monthlyTotal).toBe(Math.round((70 * 30) / 7) + 429);
  });

  it('sur le modèle réel, le total mensuel gagne weeklySpike × 2/7 par rapport aux 4 semaines', async () => {
    const model = await serverModel();
    const totals = etherTotals(model, defaultAmountOf(model));
    const fourWeeks =
      Math.round((totals.weeklyFromDaily * 30) / 7) + totals.weeklySpike * 4 + totals.monthlySpike;
    // weeklySpike = 1 025 avec les paliers par défaut (Diamond III : 400) :
    // 1 025 × 2/7 = 292,86 → 293, l'écart annoncé par la revue.
    expect(totals.weeklySpike).toBe(1025);
    expect(totals.monthlyTotal - fourWeeks).toBe(Math.round((totals.weeklySpike * 2) / 7));
    expect(totals.monthlyTotal - fourWeeks).toBe(293);
  });

  it('la Singularity compte ses jours de combat des tables (singularityBattleDays)', async () => {
    const model = await serverModel();
    const row = model.daily.find((s) => s.ranked === 'singularity');
    expect(row?.daysPerWeek).toBe(singularityBattleDays());
  });
});

describe('etherProjection — en jours UTC, le jour en cours compté', () => {
  const totals: EtherTotals = {
    dailyBase: 0,
    weeklyFromDaily: 700,
    weeklySpike: 1000,
    monthlySpike: 3000,
    weeklyTotal: 1700,
    monthlyTotal: 0,
  };
  const at = (iso: string) => Date.parse(iso);

  it('cible = aujourd’hui : 1 jour, à toute heure UTC de la journée', () => {
    expect(etherProjection(totals, '2026-10-17', 0, at('2026-10-17T00:00:00Z')).days).toBe(1);
    expect(etherProjection(totals, '2026-10-17', 0, at('2026-10-17T23:30:00Z')).days).toBe(1);
  });

  it('bascule à 00:00 UTC : à 23:30 UTC la veille, la cible du lendemain compte 2 jours', () => {
    expect(etherProjection(totals, '2026-10-18', 0, at('2026-10-17T23:30:00Z')).days).toBe(2);
    expect(etherProjection(totals, '2026-10-18', 0, at('2026-10-18T00:30:00Z')).days).toBe(1);
  });

  it('une date passée donne 0 jour, le stock seul', () => {
    const p = etherProjection(totals, '2026-10-16', 500, at('2026-10-17T12:00:00Z'));
    expect(p.days).toBe(0);
    expect(p.total).toBe(500);
  });

  it('30 jours : 4 semaines pleines, 1 mois, le quotidien au prorata', () => {
    const p = etherProjection(totals, '2026-11-15', 100, at('2026-10-17T08:00:00Z'));
    expect(p).toEqual({
      days: 30,
      weeks: 4,
      months: 1,
      fromDaily: 3000,
      fromWeekly: 4000,
      fromMonthly: 3000,
      total: 10100,
    });
  });
});

describe('World Boss — la tâche dit « récompense du jour », le guide le nom seul', () => {
  const TASK: Record<Lang, string> = {
    en: 'World Boss (daily reward)',
    fr: 'World Boss (récompense du jour)',
    es: 'Jefe Mundial (recompensa diaria)',
    jp: 'ワールドボス (日次報酬)',
    kr: '월드 보스 (일일 보상)',
    zh: '世界首领 (每日奖励)',
  };
  const MODE: Record<Lang, string> = {
    en: 'World Boss',
    fr: 'World Boss',
    es: 'Jefe Mundial',
    jp: 'ワールドボス',
    kr: '월드 보스',
    zh: '世界首领',
  };

  it.each(LANGS)('%s : libellé de la tâche du suivi', async (lang) => {
    const t = await getT(lang);
    expect(t('progress.task.world-boss')).toBe(TASK[lang]);
  });

  it.each(LANGS)('%s : le calculateur d’Ether garde le nom du mode', async (lang) => {
    const model = await serverModel(lang);
    expect(model.labels.worldBoss).toBe(MODE[lang]);
  });
});
