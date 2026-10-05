import { describe, expect, it } from 'vitest';
import {
  bossesByDay,
  isSingularityBattleDay,
  singularityBattleDays,
  singularityGroups,
  singularityStateAt,
  type SingularityBoss,
} from '@/lib/data/singularity';

/**
 * La rotation est un calcul silencieux : une erreur d'un jour ou d'un groupe
 * n'a AUCUN symptôme visible — la page affiche simplement le mauvais boss, tous
 * les jours, et personne ne s'en aperçoit. D'où ces tests, ancrés sur la donnée
 * curée (le groupe 3 a ouvert sa semaine le mercredi 2026-05-20, constaté en jeu).
 */
const at = (iso: string) => singularityStateAt(new Date(`${iso}T12:00:00Z`));

/**
 * LE NOMBRE DE JOURS DE COMBAT VIENT DES TABLES DU JEU, et il change : 4
 * jusqu'au patch du 06/10/2026, 5 ensuite. Aucune attente ci-dessous ne l'écrit
 * en dur — un test qui disait « 4 » aurait bloqué le patch qui livre « 5 ».
 */
const ANCHOR = '2026-05-20';
const BATTLE = singularityBattleDays();
/** Le `i`-ème jour de la semaine de l'ancre (0 = le mercredi d'ouverture). */
const day = (i: number) =>
  new Date(Date.parse(`${ANCHOR}T00:00:00Z`) + i * 86_400_000).toISOString().slice(0, 10);
/** Les jours de RÉCOMPENSE de cette semaine-là. */
const REWARD = Array.from({ length: 7 - BATTLE }, (_, i) => day(BATTLE + i));

describe('singularityStateAt — semaine et boss du jour', () => {
  it('l’ancre est un mercredi et ouvre le groupe 3 sur son premier boss', () => {
    const s = at('2026-05-20');
    expect(new Date('2026-05-20T00:00:00Z').getUTCDay()).toBe(3); // 3 = mercredi
    expect(s.week.group.id).toBe(3);
    expect(s.week.start).toBe('2026-05-20');
    expect(s.today?.order).toBe(0);
    expect(s.betweenWeeks).toBe(false);
  });

  it('avance d’un boss par jour de combat, sans en laisser un seul sans boss', () => {
    const bosses = at(ANCHOR).week.group.bosses.length;
    for (let i = 0; i < BATTLE; i++) {
      // Le dernier boss tient les jours que le groupe ne couvre pas (`bossesByDay`).
      expect(at(day(i)).today?.order, day(i)).toBe(Math.min(i, bosses - 1));
    }
  });

  it('déroule exactement `battleDays` jours de combat', () => {
    expect(at(ANCHOR).week.days).toHaveLength(BATTLE);
    expect(BATTLE).toBeGreaterThan(0);
    expect(BATTLE).toBeLessThan(7);
  });

  /**
   * Le trou d'avant : la section « actif » disparaissait du dimanche au mardi.
   * Ici, la phase de récompense n'annule pas l'affichage — elle bascule sur la
   * semaine À VENIR, qui est la seule information encore utile.
   */
  it('en phase de récompense : aucun boss du jour, et on montre la semaine suivante', () => {
    expect(REWARD.length).toBeGreaterThan(0);
    for (const iso of REWARD) {
      const s = at(iso);
      expect(s.betweenWeeks, iso).toBe(true);
      expect(s.today, iso).toBeUndefined();
      expect(s.week.start, iso).toBe('2026-05-27'); // le mercredi suivant
      expect(s.week.group.id, iso).toBe(4); // le groupe d'après
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
    expect(s.week.days.map((d) => d.state)).toEqual([
      'past',
      'past',
      'today',
      ...Array.from({ length: BATTLE - 3 }, () => 'upcoming'),
    ]);
  });

  it('chaque jour porte un boss réel (donjon + monstre existants)', () => {
    for (const d of at('2026-05-20').week.days) {
      expect(d.boss.dungeon).toMatch(/^\d+$/);
      expect(d.boss.monsters.length).toBeGreaterThan(0);
      expect(d.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

/**
 * `nextChange` est ce que le compte à rebours de la page affiche. Il visait le
 * prochain minuit UTC EN DUR — vrai en jours de combat (le boss du jour tourne),
 * FAUX en phase de récompense, où il ne se passe rien à minuit : la page
 * annonçait « prochaine rotation » et décomptait vers une échéance imaginaire.
 * L'erreur est indolore (des chiffres défilent, ils ont l'air justes), donc elle
 * se grave ici.
 */
describe('singularityStateAt — nextChange, la seule échéance qu’on ait le droit d’afficher', () => {
  const ms = (iso: string) => Date.parse(`${iso}T00:00:00Z`);

  it('en jours de combat : le minuit UTC suivant (le boss du jour change)', () => {
    expect(at('2026-05-20').nextChange).toBe(ms('2026-05-21'));
    expect(at('2026-05-22').nextChange).toBe(ms('2026-05-23'));
  });

  it('le DERNIER jour de combat vise minuit aussi — c’est la bascule vers la phase de récompense', () => {
    expect(at(day(BATTLE - 1)).nextChange).toBe(ms(day(BATTLE)));
  });

  it('en phase de récompense : l’OUVERTURE de la rotation, pas minuit', () => {
    for (const iso of REWARD) {
      const s = at(iso);
      expect(s.betweenWeeks, iso).toBe(true);
      // Le mercredi d'ouverture — celui-là même que la vue annonce.
      expect(s.nextChange, iso).toBe(ms('2026-05-27'));
      expect(s.nextChange, iso).toBe(ms(s.week.start));
    }
  });

  it('au premier jour de récompense, l’échéance est à PLUS de 24 h (donc pas minuit)', () => {
    const midi = new Date(`${REWARD[0]}T12:00:00Z`);
    const restant = singularityStateAt(midi).nextChange - midi.getTime();
    expect(restant).toBeGreaterThan(24 * 3_600_000);
  });

  it('est toujours dans le FUTUR, tous les jours de la semaine', () => {
    for (let i = 0; i < 14; i++) {
      const now = new Date(Date.UTC(2026, 4, 20 + i, 12));
      expect(singularityStateAt(now).nextChange, now.toISOString()).toBeGreaterThan(now.getTime());
    }
  });
});

describe('bossesByDay — un boss par jour de combat, quel que soit leur nombre', () => {
  const boss = (order: number): SingularityBoss => ({
    order,
    dungeon: String(100 + order),
    monsters: [String(order)],
  });
  const four = [boss(2), boss(0), boss(3), boss(1)];

  it('autant de boss que de jours : un chacun, dans l’ordre `order`', () => {
    expect(bossesByDay(four, 4).map((b) => b.order)).toEqual([0, 1, 2, 3]);
  });

  it('un jour de plus que de boss : le DERNIER tient aussi le jour ajouté (sam + dim)', () => {
    expect(bossesByDay(four, 5).map((b) => b.order)).toEqual([0, 1, 2, 3, 3]);
  });

  it('cinq boss pour cinq jours : chacun le sien, la règle ne joue plus', () => {
    expect(bossesByDay([...four, boss(4)], 5).map((b) => b.order)).toEqual([0, 1, 2, 3, 4]);
  });

  it('plus de boss que de jours : seuls les premiers tournent', () => {
    expect(bossesByDay(four, 3).map((b) => b.order)).toEqual([0, 1, 2]);
  });

  it('groupe vide : aucun jour, pas de boss inventé', () => {
    expect(bossesByDay([], 5)).toEqual([]);
  });
});

describe('isSingularityBattleDay — la même horloge que la page', () => {
  it('dit « combat » exactement les jours où `singularityStateAt` a un boss du jour', () => {
    // Trois semaines à cheval sur l'ancre, à midi et aux deux bords du jour UTC.
    for (let i = -7; i < 14; i++) {
      for (const hour of [0, 12, 23]) {
        const now = Date.parse(`${day(i)}T00:00:00Z`) + hour * 3_600_000;
        expect(isSingularityBattleDay(now), `${day(i)} ${hour}h`).toBe(
          singularityStateAt(new Date(now)).today !== undefined,
        );
      }
    }
  });
});
