/**
 * DIMENSIONAL SINGULARITY — rotation hebdomadaire des boss.
 *
 * Le mode tourne par SEMAINES : un groupe de 4 boss par semaine, cyclant sur
 * les 6 groupes. La semaine ouvre le mercredi ; les 4 jours suivants sont des
 * jours de COMBAT (un boss par jour, dans l'ordre `order` — confirmé en jeu),
 * puis viennent 3 jours de RÉCOMPENSE (dim→mar) où plus aucun boss n'est
 * combattable.
 *
 * ⚠️ La V2 affichait autre chose : ses 3 premiers boss étaient donnés comme
 * disponibles du mercredi au vendredi et le 4e le samedi seulement
 * (`slice(0, 3)` + `dayInfo[3]`). C'est faux, et ses propres textes se
 * contredisaient (« the target boss changes daily »). Ne pas le reproduire.
 *
 * CE QUE LES TABLES NE DISENT PAS : quel groupe tourne quelle semaine. L'ancre
 * calendaire (« le groupe G a démarré tel mercredi ») est de la donnée CURÉE,
 * constatée en jeu, portée par `schedule.anchor`. Tout le reste se calcule.
 *
 * Le calcul est PUR (`now` injecté) : les pages le nourrissent avec l'heure du
 * serveur, les tests avec une date figée. Toute page qui l'appelle périme donc
 * chaque jour à 00:00 UTC → elle DOIT être purgée par `/api/revalidate`.
 */
import singularityData from '@data/generated/singularity.json';
import type { LocalizedText } from '@contracts';

/** Un combat de boss dans un groupe (position `order` = jour de la semaine). */
export interface SingularityBoss {
  order: number;
  /** DungeonID (réf `encounters.json` : nom du combat, paliers E…SSS). */
  dungeon: string;
  /** Entités spawnées (ids `monsters.json`). */
  monsters: string[];
  thumbnail?: string;
  banner?: string;
}

/** Un groupe de rotation = une semaine de contenu. */
export interface SingularityGroup {
  id: number;
  name: LocalizedText;
  desc: LocalizedText;
  bosses: SingularityBoss[];
}

interface Schedule {
  /** Jour d'ouverture (`wed`). */
  startDow: string;
  /** Jours de COMBAT (4) — un boss par jour. */
  battleDays: number;
  /** Jours de RÉCOMPENSE (3) — aucun boss combattable. */
  rewardDays: number;
  /** Ancre curée : ce groupe a ouvert sa semaine à cette date. */
  anchor: { date: string; group: number };
}

const raw = singularityData as unknown as {
  schedule: Schedule;
  groups: SingularityGroup[];
};

const DAY_MS = 86_400_000;

/** Groupes dans l'ordre de rotation (id croissant). */
const GROUPS = [...raw.groups].sort((a, b) => a.id - b.id);
const SCHEDULE = raw.schedule;

/** Numéro de jour UTC (minuit = frontière — le jeu bascule à 00:00 UTC). */
function utcDay(ms: number): number {
  return Math.floor(ms / DAY_MS);
}

const ANCHOR_DAY = utcDay(Date.parse(`${SCHEDULE.anchor.date}T00:00:00Z`));
const ANCHOR_INDEX = GROUPS.findIndex((g) => g.id === SCHEDULE.anchor.group);
if (ANCHOR_INDEX < 0) {
  throw new Error(
    `Singularity : l'ancre désigne le groupe ${SCHEDULE.anchor.group}, absent de la rotation` +
      ` (groupes : ${GROUPS.map((g) => g.id).join(', ')})`,
  );
}

/** Un jour d'une semaine de rotation. */
export interface SingularityDay {
  /** Date ISO `YYYY-MM-DD` (UTC). */
  date: string;
  boss: SingularityBoss;
  /** Position relative à aujourd'hui. */
  state: 'past' | 'today' | 'upcoming';
}

/** Une semaine de rotation, déroulée. */
export interface SingularityWeek {
  group: SingularityGroup;
  /** Mercredi d'ouverture, ISO `YYYY-MM-DD`. */
  start: string;
  /** Les jours de COMBAT (un boss chacun). */
  days: SingularityDay[];
}

/** État du mode à un instant donné. */
export interface SingularityState {
  /**
   * Semaine AFFICHÉE : celle en cours pendant les jours de combat, sinon la
   * PROCHAINE. (La V2 faisait disparaître sa section du dimanche au mardi —
   * la page devenait muette trois jours sur sept.)
   */
  week: SingularityWeek;
  /** Boss combattable aujourd'hui, `undefined` en phase de récompense. */
  today?: SingularityBoss;
  /**
   * `true` en phase de récompense (dim→mar) : aucun boss n'est combattable et
   * `week` est donc la semaine À VENIR, pas celle en cours.
   */
  betweenWeeks: boolean;
  /**
   * Instant (epoch ms, UTC) du PROCHAIN CHANGEMENT réel — la seule échéance
   * qu'un compte à rebours ait le droit d'afficher.
   *
   * En jours de combat, c'est le minuit UTC suivant : le boss du jour change.
   * En phase de récompense, NON — rien ne se passe au minuit suivant, et un
   * compte à rebours vers minuit y racontait une échéance qui n'existe pas.
   * C'est l'OUVERTURE de la rotation (le mercredi), parfois trois jours plus loin.
   */
  nextChange: number;
}

/** Date ISO (UTC) d'un numéro de jour. */
function isoOfDay(day: number): string {
  return new Date(day * DAY_MS).toISOString().slice(0, 10);
}

/** Groupe qui tourne la semaine `weekIndex` après l'ancre (cyclique). */
function groupAtWeek(weekIndex: number): SingularityGroup {
  const n = GROUPS.length;
  // `%` de JS garde le signe : on renormalise pour les semaines ANTÉRIEURES à
  // l'ancre (weekIndex négatif), sinon l'index sortirait du tableau.
  const i = (((ANCHOR_INDEX + weekIndex) % n) + n) % n;
  return GROUPS[i];
}

/** Déroule une semaine de rotation (ses jours de combat), vue depuis `today`. */
function buildWeek(weekIndex: number, todayDay: number): SingularityWeek {
  const start = ANCHOR_DAY + weekIndex * 7;
  const group = groupAtWeek(weekIndex);
  const bosses = [...group.bosses].sort((a, b) => a.order - b.order);

  const days: SingularityDay[] = bosses.slice(0, SCHEDULE.battleDays).map((boss, i) => {
    const day = start + i;
    return {
      date: isoOfDay(day),
      boss,
      state: day === todayDay ? 'today' : day < todayDay ? 'past' : 'upcoming',
    };
  });
  return { group, start: isoOfDay(start), days };
}

/**
 * État du mode à l'instant `now`. Pure — c'est l'appelant qui décide de
 * l'instant (serveur au rendu, date figée dans les tests).
 */
export function singularityStateAt(now: Date): SingularityState {
  const today = utcDay(now.getTime());
  const daysSinceAnchor = today - ANCHOR_DAY;
  // `Math.floor` (pas une division tronquée) : pour une date ANTÉRIEURE à
  // l'ancre, -1/7 doit donner -1, pas 0.
  const weekIndex = Math.floor(daysSinceAnchor / 7);
  const dayInWeek = daysSinceAnchor - weekIndex * 7; // 0..6

  const inBattle = dayInWeek < SCHEDULE.battleDays;
  // En phase de récompense, on montre la semaine SUIVANTE : c'est la seule
  // information encore utile au joueur.
  const shownWeek = inBattle ? weekIndex : weekIndex + 1;
  const week = buildWeek(shownWeek, today);

  // En combat : minuit UTC (le boss du jour tourne). En récompense : l'ouverture
  // de la semaine affichée — pas minuit, où il ne se passe rien.
  const nextChangeDay = inBattle ? today + 1 : ANCHOR_DAY + shownWeek * 7;

  return {
    week,
    today: inBattle ? week.days[dayInWeek]?.boss : undefined,
    betweenWeeks: !inBattle,
    nextChange: nextChangeDay * DAY_MS,
  };
}

/** Tous les groupes de la rotation (bibliothèque des boss). */
export function singularityGroups(): SingularityGroup[] {
  return GROUPS;
}

/** Nombre de jours de combat par semaine (4). */
export function singularityBattleDays(): number {
  return SCHEDULE.battleDays;
}
