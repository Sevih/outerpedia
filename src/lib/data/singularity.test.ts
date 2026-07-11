import { describe, expect, it } from 'vitest';
import {
  singularityBattleDays,
  singularityGroups,
  singularityStateAt,
} from '@/lib/data/singularity';

/**
 * La rotation est un calcul silencieux : une erreur d'un jour ou d'un groupe
 * n'a AUCUN symptôme visible — la page affiche simplement le mauvais boss, tous
 * les jours, et personne ne s'en aperçoit. D'où ces tests, ancrés sur la donnée
 * curée (le groupe 3 a ouvert sa semaine le mercredi 2026-05-20, constaté en jeu).
 */
const at = (iso: string) => singularityStateAt(new Date(`${iso}T12:00:00Z`));

describe('singularityStateAt — semaine et boss du jour', () => {
  it('l’ancre est un mercredi et ouvre le groupe 3 sur son premier boss', () => {
    const s = at('2026-05-20');
    expect(new Date('2026-05-20T00:00:00Z').getUTCDay()).toBe(3); // 3 = mercredi
    expect(s.week.group.id).toBe(3);
    expect(s.week.start).toBe('2026-05-20');
    expect(s.today?.order).toBe(0);
    expect(s.betweenWeeks).toBe(false);
  });

  it('avance d’un boss par jour de combat (mer→sam)', () => {
    expect(at('2026-05-20').today?.order).toBe(0); // mercredi
    expect(at('2026-05-21').today?.order).toBe(1); // jeudi
    expect(at('2026-05-22').today?.order).toBe(2); // vendredi
    expect(at('2026-05-23').today?.order).toBe(3); // samedi
  });

  it('déroule exactement `battleDays` jours de combat', () => {
    expect(at('2026-05-20').week.days).toHaveLength(singularityBattleDays());
    expect(singularityBattleDays()).toBe(4);
  });

  /**
   * Le trou de la V2 : sa section « actif » disparaissait du dimanche au mardi.
   * Ici, la phase de récompense n'annule pas l'affichage — elle bascule sur la
   * semaine À VENIR, qui est la seule information encore utile.
   */
  it('en phase de récompense (dim→mar) : aucun boss du jour, et on montre la semaine suivante', () => {
    for (const [iso, jour] of [
      ['2026-05-24', 'dimanche'],
      ['2026-05-25', 'lundi'],
      ['2026-05-26', 'mardi'],
    ] as const) {
      const s = at(iso);
      expect(s.betweenWeeks, jour).toBe(true);
      expect(s.today, jour).toBeUndefined();
      expect(s.week.start, jour).toBe('2026-05-27'); // le mercredi suivant
      expect(s.week.group.id, jour).toBe(4); // le groupe d'après
    }
  });

  it('la semaine suivante fait tourner le groupe', () => {
    expect(at('2026-05-27').week.group.id).toBe(4);
    expect(at('2026-06-03').week.group.id).toBe(5);
    expect(at('2026-06-10').week.group.id).toBe(6);
  });

  it('le cycle boucle sur les 6 groupes', () => {
    const n = singularityGroups().length;
    expect(n).toBe(6);
    // 6 semaines après l'ancre → retour au groupe de l'ancre.
    expect(at('2026-07-01').week.group.id).toBe(3);
  });

  /**
   * Une date ANTÉRIEURE à l'ancre donne un index de semaine négatif. En JS,
   * `-1 % 6` vaut `-1` (le signe est conservé) : sans renormalisation, l'index
   * sortirait du tableau et la page planterait — ou pire, choisirait au hasard.
   */
  it('reste correct AVANT l’ancre (index de semaine négatif)', () => {
    expect(at('2026-05-13').week.group.id).toBe(2); // la semaine d'avant
    expect(at('2026-05-06').week.group.id).toBe(1);
    expect(at('2026-04-29').week.group.id).toBe(6); // on reboucle par le bas
    expect(at('2026-04-01').week.group).toBeDefined(); // 7 semaines avant : pas de crash
  });

  it('bascule à 00:00 UTC, pas à une autre heure', () => {
    const veille = singularityStateAt(new Date('2026-05-20T23:59:59Z'));
    const lendemain = singularityStateAt(new Date('2026-05-21T00:00:00Z'));
    expect(veille.today?.order).toBe(0);
    expect(lendemain.today?.order).toBe(1);
  });

  it('marque le jour courant, et lui seul', () => {
    const s = at('2026-05-22'); // vendredi = 3e jour
    expect(s.week.days.map((d) => d.state)).toEqual(['past', 'past', 'today', 'upcoming']);
  });

  it('chaque jour porte un boss réel (donjon + monstre existants)', () => {
    for (const d of at('2026-05-20').week.days) {
      expect(d.boss.dungeon).toMatch(/^\d+$/);
      expect(d.boss.monsters.length).toBeGreaterThan(0);
      expect(d.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
