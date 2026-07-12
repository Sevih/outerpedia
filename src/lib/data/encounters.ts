/**
 * LES RENCONTRES — la brique que les guides de boss désignent désormais.
 *
 * Un guide ne pointe plus un MONSTRE mais un COMBAT (`group`). C'est le
 * renversement qui compte : « Annihilator » n'est pas un monstre, c'est trois
 * donjons — Normal (Lv25), Hard (Lv80), Very Hard (Lv120) — chacun peuplé d'un
 * monstre DIFFÉRENT. Le portage V2 ne retenait que le Very Hard parce qu'il
 * n'avait qu'un `bossId` à offrir ; les deux autres difficultés n'existaient
 * nulle part. En désignant le groupe, elles reviennent gratuitement, avec leur
 * ordre, leurs niveaux, leurs monstres et leurs récompenses.
 *
 * Le `group` est OPAQUE et stable (`event_boss:SYS_EVENT_BOSS_DUNGEON_0001`,
 * `world_boss:4086001`, `guild_raid:SYS_TITLE_GUILD_RAID_SEASON2_MAIN`) : il ne
 * se déduit d'aucune arithmétique d'identifiant, on ne fait que le lire.
 */
import encountersData from '@data/generated/encounters.json';
import glossariesData from '@data/generated/glossaries.json';
import type { DungeonMonster, DungeonRef, EncountersFile, Glossaries } from '@contracts';
import type { TFunction, TranslationKey } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { expandRankContexts, type SpawnContext } from '@/lib/monster-stats';

const DUNGEONS = encountersData as unknown as EncountersFile;
const G = glossariesData as unknown as Glossaries;

/**
 * Un donjon PEUPLÉ — l'unité de « une difficulté / une étape ».
 *
 * `DungeonRef.monsters` est typé optionnel (les archives d'avant l'extraction
 * n'en ont pas). Un donjon sans monstre n'est pas une rencontre : on le retire
 * ICI, une fois, plutôt que de laisser chaque appelant se défendre — sinon le
 * repli mou (`?? []`) finit par rendre un onglet de difficulté parfaitement vide
 * que personne ne remarque.
 */
export interface Encounter {
  id: string;
  ref: DungeonRef;
  monsters: DungeonMonster[];
}

export function getEncounter(id: string): DungeonRef | undefined {
  return DUNGEONS[id];
}

/**
 * Les donjons d'un même combat, du plus facile au plus dur.
 *
 * L'ordre vient de `difficulty.order` (donnée du jeu), jamais de l'ordre des
 * clés du JSON ni du tri des identifiants.
 */
export function encountersOfGroup(group: string): Encounter[] {
  return Object.entries(DUNGEONS)
    .filter(([, d]) => d.group === group && d.monsters?.length)
    .map(([id, ref]) => ({ id, ref, monsters: ref.monsters! }))
    .sort((a, b) => (a.ref.difficulty?.order ?? 0) - (b.ref.difficulty?.order ?? 0));
}

/**
 * Libellé d'une difficulté.
 *
 * Le jeu ne parle QUE en/jp/kr/zh : il n'existe pas, et il n'existera jamais,
 * de libellé français dans la donnée. D'où la règle — le texte OFFICIEL du jeu
 * quand il existe et qu'on le rend dans une langue du jeu ; sinon nos locales,
 * accrochées à la CLÉ stable (`very_hard`, `stage_2`, `league_4`).
 *
 * `stage_N` est un GABARIT, pas une énumération : le guild raid va jusqu'à 3
 * étapes en boss principal et 5 en secondaire, et rien ne dit qu'il s'arrêtera
 * là. On lit le numéro, on ne déclare pas cinq clés en dur.
 */
export function difficultyLabel(d: DungeonRef, lang: Lang, t: TFunction): string | undefined {
  const diff = d.difficulty;
  if (!diff) return undefined;

  const stage = /^stage_(\d+)$/.exec(diff.key);
  if (stage) return t('guides.difficulty.stage', { n: stage[1] });

  // Le vocabulaire du jeu prime dans les langues que le jeu parle.
  if (lang !== 'fr' && diff.name) {
    const official = lRec(diff.name, lang);
    if (official) return official;
  }

  // `makeT` renvoie la CLÉ quand le message manque : c'est notre détecteur. Une
  // difficulté qu'on n'a pas encore traduite retombe sur le nom du jeu — jamais
  // sur une clé crue à l'écran.
  const key = `guides.difficulty.${diff.key}` as TranslationKey;
  const label = t(key);
  if (label !== key) return label;
  return diff.name ? lRec(diff.name, lang) || diff.name.en : diff.key;
}

/**
 * La difficulté la plus DURE d'un combat — celle pour laquelle un guide est
 * écrit. Sert au bandeau qui l'annonce au lecteur : les conseils ne valent que
 * pour un des trois onglets, et le taire serait un mensonge par omission.
 */
export function hardestDifficultyLabel(
  group: string,
  lang: Lang,
  t: TFunction,
): string | undefined {
  const encounters = encountersOfGroup(group);
  const last = encounters[encounters.length - 1];
  return last ? difficultyLabel(last.ref, lang, t) : undefined;
}

/** Nom du mode (« Joint Challenge », « World Boss »…), tel que le jeu le nomme. */
export function modeLabel(d: DungeonRef, lang: Lang): string {
  return G.modes?.[d.mode] ? lRec(G.modes[d.mode], lang) : d.mode;
}

/**
 * Contextes de calcul de stats d'un MONSTRE dans UN donjon donné.
 *
 * Variante « je sais dans quel combat je suis » de `monsterSpawnContexts`, qui
 * lui part du monstre et ramasse TOUTES ses rencontres. Ici le donjon est
 * connu : ses `adv`, ses `bossHp` et ses paliers s'appliquent, et rien d'autre.
 */
export function encounterSpawnContexts(
  e: Encounter,
  m: DungeonMonster,
  lang: Lang,
): SpawnContext[] {
  const d = e.ref;
  return expandRankContexts(
    {
      level: m.level,
      label: `${modeLabel(d, lang)} · ${lRec(d.name, lang) || d.name.en}`,
      ...(d.adv ? { adv: d.adv } : {}),
      ...(d.bossHp ? { bossHp: d.bossHp } : {}),
      ...(m.hpLines ? { hpLines: m.hpLines } : {}),
    },
    d.ranks,
  );
}
