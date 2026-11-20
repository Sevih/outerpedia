import { describe, expect, it } from 'vitest';
import {
  bossesByDay,
  isSingularityBattleDay,
  singularityAppearancesAt,
  singularityBattleDays,
  singularityCycleWeeks,
  singularityExBuffOf,
  singularityExBuffTarget,
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

/**
 * LE NOMBRE DE GROUPES VIENT AUSSI DES TABLES (six au 2026-07-16) : l'id
 * attendu `k` semaines après l'ancre se lit dans le cycle, jamais en dur.
 */
const GROUP_IDS = singularityGroups().map((g) => g.id);
const ANCHOR_GROUP = 3;
const groupAfter = (k: number) => {
  const n = GROUP_IDS.length;
  return GROUP_IDS[(((GROUP_IDS.indexOf(ANCHOR_GROUP) + k) % n) + n) % n];
};

describe('singularityStateAt — semaine et boss du jour', () => {
  it('l’ancre est un mercredi et ouvre le groupe 3 sur son premier boss', () => {
    const s = at('2026-05-20');
    expect(new Date('2026-05-20T00:00:00Z').getUTCDay()).toBe(3); // 3 = mercredi
    expect(s.week.group.id).toBe(ANCHOR_GROUP);
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
      expect(s.week.group.id, iso).toBe(groupAfter(1)); // le groupe d'après
    }
  });

  it('la semaine suivante fait tourner le groupe', () => {
    expect(at('2026-05-27').week.group.id).toBe(groupAfter(1));
    expect(at('2026-06-03').week.group.id).toBe(groupAfter(2));
    expect(at('2026-06-10').week.group.id).toBe(groupAfter(3));
    expect(groupAfter(1)).not.toBe(ANCHOR_GROUP);
  });

  it('le cycle boucle sur tous les groupes', () => {
    const n = GROUP_IDS.length;
    expect(n).toBeGreaterThan(1);
    expect(GROUP_IDS).toContain(ANCHOR_GROUP);
    // n semaines après l'ancre → retour au groupe de l'ancre.
    expect(at(day(7 * n)).week.group.id).toBe(ANCHOR_GROUP);
  });

  /**
   * Une date ANTÉRIEURE à l'ancre donne un index de semaine négatif. En JS,
   * `-1 % 6` vaut `-1` (le signe est conservé) : sans renormalisation, l'index
   * sortirait du tableau et la page planterait — ou pire, choisirait au hasard.
   */
  it('reste correct AVANT l’ancre (index de semaine négatif)', () => {
    expect(at('2026-05-13').week.group.id).toBe(groupAfter(-1)); // la semaine d'avant
    expect(at('2026-05-06').week.group.id).toBe(groupAfter(-2));
    expect(at('2026-04-29').week.group.id).toBe(groupAfter(-3)); // on reboucle par le bas
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

  it('au premier jour de récompense, l’échéance est l’ouverture — à PLUS de 24 h dès deux jours de récompense', () => {
    const midi = new Date(`${REWARD[0]}T12:00:00Z`);
    const restant = singularityStateAt(midi).nextChange - midi.getTime();
    // Il reste tous les jours de récompense, moins la demi-journée écoulée.
    expect(restant).toBe(REWARD.length * 86_400_000 - 12 * 3_600_000);
    // Deux jours de récompense au 2026-10-06 : l'échéance n'est alors pas minuit.
    if (REWARD.length >= 2) expect(restant).toBeGreaterThan(24 * 3_600_000);
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

/**
 * EX Buff (patch du 20/11/2026) : il dépend du CRÉNEAU (semaine × jour), pas du
 * boss. Ancré sur un constat en jeu de Sevih : le vendredi 20/11/2026 (groupe 5),
 * Abomination Hunter Belial, EX Buff Water.
 */
describe('singularityAppearancesAt — les prochaines apparitions d’un boss, avec leur EX Buff', () => {
  const BELIAL = '60000001';
  const VERDANDI = '60000011';
  const noon = (iso: string) => new Date(`${iso}T12:00:00Z`);
  const DAY_MS = 86_400_000;
  const N = singularityCycleWeeks();
  /** Créneaux du monstre dans un cycle : (groupe, jour) via la règle `bossesByDay`. */
  const slotsOf = (monster: string) =>
    singularityGroups().flatMap((g) =>
      bossesByDay(g.bosses, BATTLE)
        .filter((b) => b.monsters[0] === monster)
        .map((b) => ({ group: g.id, exBuff: b.exBuff })),
    );

  it('le cycle fait autant de semaines que de groupes (12 au 20/11/2026)', () => {
    expect(N).toBe(GROUP_IDS.length);
  });

  it('vendredi 20/11/2026 : Belial aujourd’hui, groupe 5, EX Buff Water (constaté en jeu)', () => {
    const now = noon('2026-11-20');
    const s = singularityStateAt(now);
    expect(s.week.group.id).toBe(5);
    expect(s.today?.monsters[0]).toBe(BELIAL);
    const buff = singularityExBuffOf(s.today!);
    expect(buff?.desc.en).toBe("All Water allies' Damage +200%");
    expect(buff?.value).toBe(2000);
    expect(singularityExBuffTarget(buff!)).toEqual({ kind: 'element', id: 'water' });

    const first = singularityAppearancesAt(BELIAL, now)[0];
    expect(first).toMatchObject({ date: '2026-11-20', state: 'today' });
    expect(first.group.id).toBe(5);
    expect(first.exBuff).toBe(buff);
  });

  it('en phase de récompense : aucune apparition le jour même, toutes à venir et un jour de combat', () => {
    const now = noon('2026-11-23'); // lundi : récompense (semaine ouverte le 18/11)
    expect(singularityStateAt(now).betweenWeeks).toBe(true);
    const list = singularityAppearancesAt(BELIAL, now);
    expect(list.length).toBeGreaterThan(0);
    for (const a of list) {
      expect(a.state, a.date).toBe('upcoming');
      expect(a.date > '2026-11-24', a.date).toBe(true); // rien avant le mercredi 25/11
      expect(isSingularityBattleDay(Date.parse(`${a.date}T12:00:00Z`)), a.date).toBe(true);
    }
  });

  it('un boss présent dans plusieurs groupes apparaît une fois par créneau, sur un cycle exact', () => {
    const now = noon('2026-11-20');
    const list = singularityAppearancesAt(BELIAL, now);
    const slots = slotsOf(BELIAL);
    expect(new Set(slots.map((s) => s.group)).size).toBeGreaterThanOrEqual(2);
    expect(list).toHaveLength(slots.length);
    // Un groupe différent à chaque apparition (un groupe ne porte Belial qu'une fois).
    expect(new Set(list.map((a) => a.group.id)).size).toBe(list.length);
    // Fenêtre [aujourd'hui, aujourd'hui + 7 × N) et dates croissantes.
    const end = new Date(Date.parse('2026-11-20') + 7 * N * DAY_MS).toISOString().slice(0, 10);
    for (const a of list) expect(a.date >= '2026-11-20' && a.date < end, a.date).toBe(true);
    expect([...list].map((a) => a.date).sort()).toEqual(list.map((a) => a.date));
    // L'EX Buff est celui du créneau.
    for (const a of list) expect(a.exBuff).toBe(singularityExBuffOf(a.boss));
  });

  it('le buff suit le créneau, pas le boss : Verdandi donne Striker (groupe 5) et Ranger (groupe 6)', () => {
    const list = singularityAppearancesAt(VERDANDI, noon('2026-11-20'));
    const byGroup = new Map(
      list.map((a) => [a.group.id, a.exBuff && singularityExBuffTarget(a.exBuff)]),
    );
    expect(byGroup.get(5)).toEqual({ kind: 'class', id: 'striker' });
    expect(byGroup.get(6)).toEqual({ kind: 'class', id: 'ranger' });
  });

  it('sur un cycle, tous boss confondus : chaque jour de combat exactement une fois', () => {
    const now = noon('2026-11-20');
    const monsters = new Set(
      singularityGroups().flatMap((g) => g.bosses.map((b) => b.monsters[0])),
    );
    const dates = [...monsters].flatMap((m) => singularityAppearancesAt(m, now).map((a) => a.date));
    expect(dates).toHaveLength(N * BATTLE);
    expect(new Set(dates).size).toBe(dates.length);
  });

  it('un monstre hors rotation n’a aucune apparition', () => {
    expect(singularityAppearancesAt('0', noon('2026-11-20'))).toEqual([]);
  });
});

describe('EX Buff — résolution et cible', () => {
  const buff = (option: string) => ({ rank: 'EX', desc: { en: '' }, option, value: 2000 });

  it('sans `exBuff` dans la donnée (d’avant patch), aucun buff', () => {
    expect(singularityExBuffOf({ order: 0, dungeon: '1', monsters: ['1'] })).toBeUndefined();
  });

  it('lit la cible dans l’option du jeu : élément, ou classe nommée par son rôle', () => {
    expect(singularityExBuffTarget(buff('singularity_passive_ex_up_fire'))).toEqual({
      kind: 'element',
      id: 'fire',
    });
    expect(singularityExBuffTarget(buff('singularity_passive_ex_up_speed'))).toEqual({
      kind: 'class',
      id: 'ranger',
    });
    expect(singularityExBuffTarget(buff('singularity_passive_ex_up_attack'))).toEqual({
      kind: 'class',
      id: 'striker',
    });
    expect(singularityExBuffTarget(buff('singularity_passive_ex_up_mage'))).toEqual({
      kind: 'class',
      id: 'mage',
    });
  });

  it('option inconnue : pas de cible inventée', () => {
    expect(singularityExBuffTarget(buff('singularity_passive_ex_up_zzz'))).toBeUndefined();
    expect(singularityExBuffTarget(buff('autre_chose'))).toBeUndefined();
  });
});
