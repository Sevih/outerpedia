/**
 * DIMENSIONAL SINGULARITY — rotation hebdomadaire des boss.
 *
 * Le mode tourne par SEMAINES : un groupe de boss par semaine, cyclant sur les
 * groupes. La semaine ouvre le mercredi ; viennent `battleDays` jours de
 * COMBAT (un boss par jour, dans l'ordre `order` — confirmé en jeu), puis
 * `rewardDays` jours de RÉCOMPENSE où plus aucun boss n'est combattable.
 *
 * LES DEUX DURÉES VIENNENT DES TABLES DU JEU (`schedule`, cf. le générateur) et
 * rien ici ne les suppose : 4 + 3 jusqu'au patch du 06/10/2026, 5 + 2 ensuite
 * (mer→dim, puis lun→mar). Un groupe peut porter MOINS de boss que de jours de
 * combat — cf. `bossesByDay`.
 *
 * ⚠️ On affichait autre chose avant : les 3 premiers boss étaient donnés comme
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
  /** Buff EX du créneau (réf `singularityExBuffs()`) — absent d'une donnée d'avant le 20/11/2026. */
  exBuff?: string;
}

/**
 * Buff EX (patch du 20/11/2026) : au palier `rank`, les alliés d'un élément ou
 * d'une classe désignés par le boss gagnent un bonus de dégâts. Cf. le
 * générateur (`SingularityExBuff`).
 */
export interface SingularityExBuff {
  rank: string;
  desc: LocalizedText;
  option: string;
  /** Per-mille (2000 = +200 %). */
  value?: number;
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
  /** Jours de COMBAT — un boss par jour. */
  battleDays: number;
  /** Jours de RÉCOMPENSE — aucun boss combattable. */
  rewardDays: number;
  /** Ancre curée : ce groupe a ouvert sa semaine à cette date. */
  anchor: { date: string; group: number };
}

const raw = singularityData as unknown as {
  schedule: Schedule;
  groups: SingularityGroup[];
  exBuffs?: Record<string, SingularityExBuff>;
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
   * PROCHAINE. (La section disparaissait du dimanche au mardi —
   * la page devenait muette trois jours sur sept.)
   */
  week: SingularityWeek;
  /** Boss combattable aujourd'hui, `undefined` en phase de récompense. */
  today?: SingularityBoss;
  /**
   * `true` en phase de récompense : aucun boss n'est combattable et
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

/**
 * Le boss de CHAQUE jour de combat, dans l'ordre `order` — toujours
 * `battleDays` entrées, pour qu'aucun jour de combat ne reste sans boss.
 *
 * Quand le groupe porte moins de boss que la semaine n'a de jours de combat,
 * deux règles s'opposent. La note du patch du 06/10/2026 fait tenir le DERNIER
 * les jours restants, en passant de 4 à 5 jours : « Earth on Wednesday, Water
 * on Thursday, Fire on Friday, and Light or Dark on Saturday and Sunday » — le
 * boss lumière/ténèbres, déjà le dernier, fait le samedi ET le dimanche. Le
 * client, lui, prend le boss « jour modulo nombre de boss du groupe »
 * (`CTempletManager.GetSingularityDungeonGroupTemplet`) : il reboucle sur le
 * PREMIER. Le site suit la note, par décision de Sevih (15/10/2026). Les deux
 * règles donnent la même chose tant que chaque groupe a un boss par jour de
 * combat (5 pour 5 au 15/10) ; sinon le build l'annonce (`singularityWarnings`,
 * `datagen/generators/singularity.ts`), et c'est là qu'une capture en jeu
 * tranche.
 */
export function bossesByDay(bosses: SingularityBoss[], battleDays: number): SingularityBoss[] {
  const ordered = [...bosses].sort((a, b) => a.order - b.order);
  if (!ordered.length) return [];
  return Array.from({ length: battleDays }, (_, i) => ordered[Math.min(i, ordered.length - 1)]);
}

/**
 * `now` tombe-t-il un jour de COMBAT ? Même horloge que `singularityStateAt`
 * (jours UTC comptés depuis l'ancre), sans dérouler la semaine — c'est ce que
 * lit le suivi de progression pour montrer ou cacher la tâche du jour.
 */
export function isSingularityBattleDay(now: number): boolean {
  const sinceAnchor = utcDay(now) - ANCHOR_DAY;
  const dayInWeek = ((sinceAnchor % 7) + 7) % 7;
  return dayInWeek < SCHEDULE.battleDays;
}

/** Déroule une semaine de rotation (ses jours de combat), vue depuis `today`. */
function buildWeek(weekIndex: number, todayDay: number): SingularityWeek {
  const start = ANCHOR_DAY + weekIndex * 7;
  const group = groupAtWeek(weekIndex);
  const days: SingularityDay[] = bossesByDay(group.bosses, SCHEDULE.battleDays).map((boss, i) => {
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

/** Buffs EX par id de créneau — vide tant que la donnée générée ne les porte pas. */
export function singularityExBuffs(): Record<string, SingularityExBuff> {
  return raw.exBuffs ?? {};
}

/** Buff EX d'un créneau, résolu — `undefined` sans buff dans la donnée (donnée d'avant patch). */
export function singularityExBuffOf(boss: SingularityBoss): SingularityExBuff | undefined {
  return boss.exBuff ? singularityExBuffs()[boss.exBuff] : undefined;
}

/** Ce que vise un buff EX : un élément ou une classe (slugs de `img.element` / `img.klass`). */
export type SingularityExBuffTarget = { kind: 'element' | 'class'; id: string };

const EX_BUFF_ELEMENTS = new Set(['fire', 'water', 'earth', 'light', 'dark']);
/**
 * Suffixe d'option du jeu → classe. Le jeu nomme les classes par leur RÔLE
 * (`speed` = Ranger, `attack` = Striker — cf. les `desc` six langues) ; un nom
 * de classe direct est accepté tel quel.
 */
const EX_BUFF_CLASSES: Record<string, string> = {
  speed: 'ranger',
  attack: 'striker',
  mage: 'mage',
  ranger: 'ranger',
  striker: 'striker',
  defender: 'defender',
  healer: 'healer',
};

/**
 * Cible d'un buff EX, lue dans son option (`singularity_passive_ex_up_<cible>`).
 * `undefined` pour une option inconnue : la vue retombe alors sur la seule `desc`
 * du jeu, sans icône inventée.
 */
export function singularityExBuffTarget(
  buff: SingularityExBuff,
): SingularityExBuffTarget | undefined {
  const suffix = /_ex_up_([a-z]+)$/.exec(buff.option)?.[1];
  if (!suffix) return undefined;
  if (EX_BUFF_ELEMENTS.has(suffix)) return { kind: 'element', id: suffix };
  const klass = EX_BUFF_CLASSES[suffix];
  return klass ? { kind: 'class', id: klass } : undefined;
}

/**
 * Les cibles d'EX Buff connues, dans l'ordre d'affichage : les éléments puis les
 * classes, dans l'ordre de `sys.element.*` / `sys.class.*`. C'est le vocabulaire
 * du champ `ex` d'une vidéo de guide (cf. `SingularityVideoItem`) : la CIBLE, pas
 * l'id de groupe du buff (`"1"`…`"8"`), qu'un patch peut renuméroter.
 */
export const SINGULARITY_EX_TARGETS: readonly string[] = [
  'fire',
  'water',
  'earth',
  'light',
  'dark',
  'defender',
  'striker',
  'ranger',
  'mage',
  'healer',
];

/** `value` est-il une cible d'EX Buff connue ? */
export function isSingularityExTarget(value: unknown): value is string {
  return typeof value === 'string' && SINGULARITY_EX_TARGETS.includes(value);
}

/** Une combinaison boss × EX Buff : la cible (sa clé, `target.id`) et le buff du jeu. */
export interface SingularityExCombo {
  target: SingularityExBuffTarget;
  buff: SingularityExBuff;
}

/**
 * Les combinaisons boss × EX Buff du monstre `monsterId` (le `bossId` d'un
 * guide), DÉRIVÉES des groupes : chaque créneau dont le boss (`monsters[0]`) est
 * ce monstre apporte la cible de son buff, une fois par cible.
 *
 * Ordre : celui de la CIBLE (`SINGULARITY_EX_TARGETS`, éléments puis classes),
 * pas celui d'apparition dans le cycle — l'ordre du cycle dépend de l'ancre et
 * des groupes, qu'un patch déplace ; celui de la cible ne bouge pas, et la
 * galerie d'un boss garde ses cartes à leur place d'une semaine à l'autre.
 * Un buff sans cible connue (`singularityExBuffTarget` → `undefined`) ne donne
 * pas de combinaison. Vide sans `exBuff` dans la donnée ou hors rotation.
 */
export function singularityExCombos(monsterId: string): SingularityExCombo[] {
  const byTarget = new Map<string, SingularityExCombo>();
  for (const group of GROUPS)
    for (const boss of group.bosses) {
      if (boss.monsters[0] !== monsterId) continue;
      const buff = singularityExBuffOf(boss);
      const target = buff && singularityExBuffTarget(buff);
      if (buff && target && !byTarget.has(target.id)) byTarget.set(target.id, { target, buff });
    }
  const rank = (id: string) => {
    const i = SINGULARITY_EX_TARGETS.indexOf(id);
    return i < 0 ? SINGULARITY_EX_TARGETS.length : i;
  };
  return [...byTarget.values()].sort((a, b) => rank(a.target.id) - rank(b.target.id));
}

/** La combinaison ACTIVE d'un boss : celle de son jour dans la semaine affichée. */
export interface SingularityActiveCombo extends SingularityExCombo {
  /** Date ISO `YYYY-MM-DD` (UTC) du jour de combat. */
  date: string;
  state: SingularityDay['state'];
  /** `true` en phase de récompense : la semaine est la PROCHAINE (cf. `SingularityState`). */
  betweenWeeks: boolean;
}

/**
 * La combinaison active du monstre `monsterId` à l'instant `now` : celle de son
 * jour dans la semaine que donne `singularityStateAt(now)` (la semaine en
 * cours, ou la suivante pendant les jours de récompense). Un boss présent deux
 * fois dans la semaine (un groupe à moins de boss que de jours, cf.
 * `bossesByDay`) : son jour d'aujourd'hui, sinon le premier à venir, sinon le
 * dernier passé. `undefined` quand le boss n'est pas de la semaine ou que son
 * créneau n'a pas de buff à cible connue. Pure : `now` injecté.
 */
export function singularityActiveComboAt(
  monsterId: string,
  now: Date,
): SingularityActiveCombo | undefined {
  const state = singularityStateAt(now);
  const days = state.week.days.filter((d) => d.boss.monsters[0] === monsterId);
  const day =
    days.find((d) => d.state === 'today') ??
    days.find((d) => d.state === 'upcoming') ??
    days[days.length - 1];
  if (!day) return undefined;
  const buff = singularityExBuffOf(day.boss);
  const target = buff && singularityExBuffTarget(buff);
  if (!buff || !target) return undefined;
  return { target, buff, date: day.date, state: day.state, betweenWeeks: state.betweenWeeks };
}

/** Une apparition à venir d'un boss dans la rotation. */
export interface SingularityAppearance {
  /** Date ISO `YYYY-MM-DD` (UTC) du jour de combat. */
  date: string;
  group: SingularityGroup;
  boss: SingularityBoss;
  /** Buff EX du créneau — absent d'une donnée d'avant le 20/11/2026. */
  exBuff?: SingularityExBuff;
  state: 'today' | 'upcoming';
}

/** Longueur d'un cycle complet de rotation, en semaines (= nombre de groupes). */
export function singularityCycleWeeks(): number {
  return GROUPS.length;
}

/**
 * Les PROCHAINES apparitions du monstre `monsterId` (le `bossId` d'un guide)
 * sur un cycle complet de rotation, à partir du jour de `now` inclus.
 *
 * Même horloge que `singularityStateAt` (jours UTC comptés depuis l'ancre, un
 * boss par jour de combat via `bossesByDay`). La fenêtre fait exactement
 * `7 × nombre de groupes` jours : chaque créneau (semaine du cycle × jour) y
 * tombe UNE fois — un boss présent dans deux groupes apparaît donc deux fois.
 * Un jour de combat déjà passé de la semaine en cours n'y figure pas : il
 * reviendra au cycle suivant, hors fenêtre. Pure : `now` injecté.
 */
export function singularityAppearancesAt(monsterId: string, now: Date): SingularityAppearance[] {
  const today = utcDay(now.getTime());
  const end = today + 7 * GROUPS.length;
  const firstWeek = Math.floor((today - ANCHOR_DAY) / 7);
  const out: SingularityAppearance[] = [];
  for (let w = firstWeek; ANCHOR_DAY + w * 7 < end; w++) {
    const week = buildWeek(w, today);
    week.days.forEach((d, i) => {
      const day = ANCHOR_DAY + w * 7 + i;
      if (day < today || day >= end || d.boss.monsters[0] !== monsterId) return;
      out.push({
        date: d.date,
        group: week.group,
        boss: d.boss,
        exBuff: singularityExBuffOf(d.boss),
        state: day === today ? 'today' : 'upcoming',
      });
    });
  }
  return out;
}

/** Nombre de jours de combat par semaine (lu dans les tables du jeu). */
export function singularityBattleDays(): number {
  return SCHEDULE.battleDays;
}
