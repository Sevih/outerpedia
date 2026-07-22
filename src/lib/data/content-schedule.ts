/**
 * CALENDRIER DES MODES (world boss / guild raid / joint challenge) —
 * `data/generated/content-schedule.json` : les fenêtres de dates FACTUELLES
 * livrées par les tables du jeu. Seules les saisons livrées avec le patch
 * courant existent : il n'y a pas de « prochaine saison » au-delà.
 *
 * JOINTURE GUIDE → SAISON : par le MONSTRE RÉELLEMENT COMBATTU, jamais par la
 * colonne `boss` de la saison. Les deux ids existent et désignent deux choses
 * différentes :
 *   - `season.boss` (ex. 4548001) = boss CANONIQUE d'affichage de la ligne,
 *     un id logique — la saison 27 porte `boss: 4034005` mais fait combattre
 *     4134045/55/65, même pas la même famille d'ids ;
 *   - `season.monsters` (ex. 4548161 / 4548171 / 4548181) = les entités
 *     spawnées, une par difficulté (normal / hard / very hard), alignées sur
 *     `dungeons`. C'est CE que porte le `bossId` d'un guide.
 * D'où : aucun mapping manuel dans les metas — `season.monsters.includes(bossId)`.
 *
 * Un même boss revient sur PLUSIEURS saisons (EX-78 : 5 saisons JC depuis
 * 2024) — d'où le tri par date et la sélection par fenêtre.
 */
import scheduleData from '@data/generated/content-schedule.json';
import type { LocalizedText } from '@contracts';

/** Mode de contenu — aligné sur les slugs de catégorie de guides. */
export type ContentMode = 'world-boss' | 'guild-raid' | 'joint-challenge';

/** Une saison, forme NORMALISÉE (les 3 tables du jeu ne nomment pas pareil). */
export interface Season {
  mode: ContentMode;
  id: string;
  name: LocalizedText;
  /** Ouverture de la saison (ISO UTC). */
  start: string;
  /**
   * Fin de la période JOUABLE (combat). Distincte de `end` : après elle vient
   * le décompte puis les récompenses. Ne jamais confondre les deux — un boss
   * peut être « en saison » sans être combattable.
   */
  battleEnd: string;
  /**
   * Dernière borne de saison PORTÉE PAR LA TABLE (ISO UTC). Le sens exact varie
   * par mode : WB = fin de la réclamation des récompenses ; GR = fin du
   * règlement (la période de récompenses court ~7 j de plus, borne absente des
   * tables — cf. patch notes) ; JC = fin unique. Jamais `rankingEnd` du guild
   * raid : c'est la date où le CLASSEMENT cesse d'être affiché (~3 mois après),
   * pas une clôture de saison.
   */
  end: string;
}

interface RawWorldBoss {
  id: string;
  name: LocalizedText;
  monsters: string[];
  start: string;
  battleEnd: string;
  end: string;
}
interface RawGuildRaid {
  id: string;
  title: LocalizedText;
  bosses: { monsters: string[] }[];
  start: string;
  battleEnd: string;
  settlementEnd: string;
}
interface RawJointChallenge {
  id: string;
  name: LocalizedText;
  monsters: string[];
  start: string;
  end: string;
}

const raw = scheduleData as unknown as {
  worldBoss: RawWorldBoss[];
  guildRaid: RawGuildRaid[];
  jointChallenge: RawJointChallenge[];
};

/** Fenêtre JOUABLE d'une saison (bornes ISO UTC) — ni règlement, ni récompenses. */
export interface SeasonWindow {
  start: string;
  /** Fin du COMBAT : `battleEnd` (WB/GR) ou `end` (JC, qui ne découpe pas). */
  end: string;
}

/**
 * Fenêtres jouables PAS ENCORE TERMINÉES, par mode — de quoi dire « ce contenu
 * est-il ouvert maintenant ? » sans horloge serveur.
 *
 * Destiné aux outils CLIENTS qui ont déjà leur propre tic d'horloge (le suivi de
 * progression) : on leur envoie les bornes plutôt qu'un booléen calculé au
 * rendu. Un booléen se serait figé dans le cache ISR et aurait menti jusqu'à la
 * purge suivante ; des bornes restent vraies, le client les compare à SON heure.
 *
 * Les tables ne portent que les saisons livrées avec le patch courant : entre
 * deux saisons, le résultat est légitimement vide (le prochain guild raid
 * n'existe encore nulle part). `limit` borne la charge utile.
 */
export function playableWindowsFrom(now: Date, limit = 8): Record<ContentMode, SeasonWindow[]> {
  const t = now.getTime();
  const keep = (windows: SeasonWindow[]): SeasonWindow[] =>
    windows
      .filter((w) => Date.parse(w.end) > t)
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, limit);

  return {
    'world-boss': keep(raw.worldBoss.map((s) => ({ start: s.start, end: s.battleEnd }))),
    'guild-raid': keep(raw.guildRaid.map((s) => ({ start: s.start, end: s.battleEnd }))),
    'joint-challenge': keep(raw.jointChallenge.map((s) => ({ start: s.start, end: s.end }))),
  };
}

/**
 * Toutes les saisons où ce monstre est COMBATTU, de la plus ancienne à la plus
 * récente. `bossId` peut porter un suffixe d'épinglage `@n` (convention datagen) :
 * il est retiré avant comparaison.
 */
export function seasonsForBoss(bossId: string): Season[] {
  const id = bossId.split('@')[0];
  const seasons: Season[] = [];

  for (const s of raw.worldBoss) {
    if (s.monsters.includes(id)) {
      seasons.push({
        mode: 'world-boss',
        id: s.id,
        name: s.name,
        start: s.start,
        battleEnd: s.battleEnd,
        end: s.end,
      });
    }
  }
  for (const s of raw.guildRaid) {
    if (s.bosses.some((b) => b.monsters.includes(id))) {
      seasons.push({
        mode: 'guild-raid',
        id: s.id,
        name: s.title,
        start: s.start,
        battleEnd: s.battleEnd,
        // Dernière borne dure en table : fin du règlement. PAS `rankingEnd`
        // (affichage du classement, ~3 mois après — la saison de juin « durerait »
        // jusqu'en septembre et tout `start ≤ now < end` mentirait).
        end: s.settlementEnd,
      });
    }
  }
  for (const s of raw.jointChallenge) {
    if (s.monsters.includes(id)) {
      seasons.push({
        mode: 'joint-challenge',
        id: s.id,
        name: s.name,
        // Le joint challenge ne découpe PAS ses phases : `end` clôt à la fois
        // le combat et la saison.
        start: s.start,
        battleEnd: s.end,
        end: s.end,
      });
    }
  }
  return seasons.sort((a, b) => a.start.localeCompare(b.start));
}

/** Où en est un boss dans son cycle de saisons, à un instant donné. */
export interface SeasonStanding {
  /**
   * `live` = COMBATTABLE maintenant (`start ≤ now < battleEnd`), pas seulement
   * « dans la fenêtre de saison » : après `battleEnd` viennent le règlement et
   * les récompenses, où le boss n'est plus jouable.
   */
  state: 'live' | 'upcoming' | 'past';
  season: Season;
}

/**
 * Saison à annoncer pour un boss : celle en cours, sinon la prochaine, sinon la
 * dernière connue. Fonction PURE (`now` injecté) — le rendu la nourrit avec
 * l'heure du serveur, les tests avec une date figée.
 *
 * Les tables ne portent que les saisons livrées avec le patch courant : un
 * `upcoming` n'existe que juste après une mise à jour du jeu.
 */
export function seasonStandingAt(seasons: Season[], now: Date): SeasonStanding | undefined {
  const t = now.getTime();
  const live = seasons.find((s) => Date.parse(s.start) <= t && t < Date.parse(s.battleEnd));
  if (live) return { state: 'live', season: live };
  const next = seasons.find((s) => Date.parse(s.start) > t);
  if (next) return { state: 'upcoming', season: next };
  const last = seasons.at(-1);
  return last ? { state: 'past', season: last } : undefined;
}

/** Combattable maintenant d'abord, puis le prochain, puis le passé. */
const STATE_RANK: Record<SeasonStanding['state'], number> = { live: 0, upcoming: 1, past: 2 };

/**
 * Ordre « ACTUALITÉ DU JEU » entre deux boss : le combattable maintenant passe
 * devant, ensuite la saison la plus récente.
 *
 * À opposer au tri par date de mise à jour du guide, qui classe par activité de
 * CELUI QUI ÉCRIT : corriger une coquille dans un guide dont la saison remonte à
 * mars le propulsait devant celui qui tournait le mois dernier. Un lecteur
 * cherche le boss du moment, pas le dernier fichier touché.
 *
 * Renvoie 0 quand les deux sont à égalité — à l'appelant de départager (la date
 * de mise à jour reste un bon dernier recours pour les guides hors calendrier).
 */
export function compareBySeason(a?: SeasonStanding, b?: SeasonStanding): number {
  return (
    STATE_RANK[a?.state ?? 'past'] - STATE_RANK[b?.state ?? 'past'] ||
    (b?.season.start ?? '').localeCompare(a?.season.start ?? '')
  );
}
