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
import type {
  DungeonMonster,
  DungeonRank,
  DungeonRef,
  EncountersFile,
  Glossaries,
  Monster,
} from '@contracts';
import type { TFunction, TranslationKey } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { getMonster } from '@/lib/data/monsters';
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
 * Les donjons qu'un guide désigne NOMMÉMENT, dans l'ordre où il les a écrits.
 *
 * L'HISTOIRE n'a pas de `group` : ses stages ne portent ni `group` ni
 * `difficulty` dans la donnée du jeu, et rien ne relie le donjon Normal à son
 * jumeau Hard — ni le nom, ni l'arithmétique des ids (S2 5-10 = `120513` en
 * Normal, `121511` en Hard). Le lien est donc DÉCLARÉ par le guide
 * (`meta.dungeons`), du plus facile au plus dur. Il reste opaque au même titre
 * qu'un `group` : il se lit dans `encounters.json`, il ne se fabrique jamais.
 *
 * Un id inconnu (ou un donjon vide) JETTE : un guide qui pointe dans le vide
 * casse le build, il ne rend pas un onglet muet.
 */
export function encountersOfIds(ids: readonly string[]): Encounter[] {
  return ids.map((id) => {
    const ref = DUNGEONS[id];
    if (!ref?.monsters?.length) {
      throw new Error(
        `encountersOfIds : donjon « ${id} » inconnu ou sans monstre — ` +
          `vérifier le champ \`dungeons\` du guide contre data/generated/encounters.json.`,
      );
    }
    return { id, ref, monsters: ref.monsters };
  });
}

/**
 * LA VAGUE DU BOSS — les monstres qu'on vient réellement préparer.
 *
 * Un stage d'histoire s'ouvre sur des vagues d'escorte (les gobelins avant le
 * Grand Calamari) : les documenter noierait le boss sous cinq cartes de piétaille.
 * On garde la DERNIÈRE vague où un boss apparaît — c'est là que se joue le
 * combat, et c'est là que se trouvent les comparses que la V2 câblait à la main
 * dans chaque guide (Sterope aux côtés d'Astei, Maxie et Roxie aux côtés de
 * Hilde). Ils reviennent donc de la donnée, pas d'une liste écrite deux fois.
 *
 * Le boss d'abord, ses renforts ensuite (décision d'affichage : la donnée du jeu
 * liste parfois l'add en premier). `wave` n'est émis que sur les donjons
 * multi-vagues : absent, tout le donjon est la vague du boss.
 */
export function bossWaveMonsters(e: Encounter): DungeonMonster[] {
  const waves = e.monsters.filter((m) => m.role === 'boss').map((m) => m.wave);
  const last = waves[waves.length - 1];
  return e.monsters
    .filter((m) => m.wave === last)
    .sort((a, b) => Number(a.role === 'add') - Number(b.role === 'add'));
}

/**
 * Les monstres qu'un guide DÉSIGNE, dans l'ordre où il les a écrits.
 *
 * La vague du boss (`bossWaveMonsters`) est le bon défaut partout sauf aux
 * marges, et ces marges existent : le stage 9-5 fait combattre Alpha à la vague
 * 2 et Leo à la 3 — c'est bien un combat en deux temps que le guide documente
 * (« Leo & Alpha »), pas une escorte à ignorer. À l'inverse, le 8-5 aligne à
 * côté de Maxwell un clone et un orbe qui n'apprennent rien à personne. Quand la
 * donnée seule ne sait pas trancher, l'auteur tranche — explicitement, dans le
 * meta, et pas dans le composant comme le faisait la V2.
 *
 * Un id absent du donjon est ignoré ICI (un même guide couvre plusieurs donjons
 * aux monstres distincts) ; c'est à l'appelant de vérifier qu'aucun id ne tombe
 * dans le vide sur TOUS ses donjons — sinon la carte disparaîtrait en silence.
 */
export function pickMonsters(e: Encounter, ids: readonly string[]): DungeonMonster[] {
  return ids.flatMap((id) => e.monsters.filter((m) => m.id === id));
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
 * Ce qui NOMME un onglet de rencontre : sa difficulté quand le mode en déclare
 * une (Normal / Hard / Very Hard, League 4…), sinon son MODE — l'histoire ne
 * range pas ses stages par difficulté mais par mode (« Story Normal » /
 * « Story Hard »), et c'est bien la même distinction pour le lecteur.
 */
export function encounterLabel(d: DungeonRef, lang: Lang, t: TFunction): string {
  return difficultyLabel(d, lang, t) ?? modeLabel(d, lang);
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
 * Tous les COMBATS proposables — un `group` distinct et peuplé, étiqueté par son
 * boss (le plus dur) et son mode. Pour un SÉLECTEUR (admin) : on ne fabrique
 * jamais un `group`, on choisit parmi ceux qui existent réellement dans
 * `encounters.json`. Le libellé sert d'ancre de recherche, l'ordre est alphabétique.
 */
export function listGroups(lang: Lang): { group: string; label: string }[] {
  const seen = new Set<string>();
  const out: { group: string; label: string }[] = [];
  for (const d of Object.values(DUNGEONS)) {
    if (!d.group || !d.monsters?.length || seen.has(d.group)) continue;
    seen.add(d.group);
    const encs = encountersOfGroup(d.group);
    const hardest = encs[encs.length - 1];
    const boss = hardest?.monsters.find((m) => m.role === 'boss') ?? hardest?.monsters[0];
    const monster = boss ? getMonster(boss.id) : undefined;
    const name = monster ? lRec(monster.name, lang) || monster.name.en : d.group;
    const mode = hardest ? modeLabel(hardest.ref, lang) : '';
    out.push({ group: d.group, label: mode ? `${name} · ${mode}` : name });
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Tous les DONJONS peuplés, étiquetés par leur nom et leur mode — pour un
 * SÉLECTEUR (admin, guides adventure : `meta.dungeons`). On ne fabrique jamais
 * un id de donjon, on choisit parmi ceux d'`encounters.json`.
 */
export function listDungeons(lang: Lang): { id: string; label: string }[] {
  return Object.entries(DUNGEONS)
    .filter(([, d]) => d.monsters?.length)
    .map(([id, d]) => ({ id, label: `${lRec(d.name, lang) || id} · ${modeLabel(d, lang)}` }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Un COMBATTANT d'une échelle de stages — l'unité de carte des modes à N stages.
 *
 * Le Special Request rejoue le même combat sur 13 stages, mais chaque stage
 * référence des VARIANTS de monstres aux identifiants distincts (la Chimère du
 * stage 13 n'est pas celle du stage 1 : autre id, autre kit aux stages hauts).
 * Rendre une carte par apparition enverrait jusqu'à 52 cartes complètes dans la
 * page. Or beaucoup de variants sont IDENTIQUES en contenu — même nom, même
 * kit, mêmes stats, seuls l'id et le niveau de rencontre changent. On fusionne
 * donc par CONTENU : une carte par combattant réellement distinct (7 à 13 par
 * échelle), qui porte les stages où il apparaît et son contexte de stats à
 * chacun. La fusion se CONSTATE dans la donnée, variant par variant — jamais
 * déduite d'une arithmétique d'ids.
 */
export interface GroupCombatant {
  /** Variant représentatif : celui du stage le plus HAUT où ce contenu apparaît. */
  monsterId: string;
  role: DungeonMonster['role'];
  /**
   * Le boss PRINCIPAL du combat — celui qui porte des barres de vie. C'est sa
   * carte qui ancre les contrôles du mode (glissière de stage, butin) : à
   * chaque stage, exactement un variant principal est visible.
   */
  main: boolean;
  /** Contextes de stats, une entrée par apparition, dans l'ordre des stages. */
  spawns: SpawnContext[];
  /** Index de stage (dans `encountersOfGroup`) → index dans `spawns`. */
  spawnByStage: Record<number, number>;
  /** Stages où il apparaît (indexes croissants) — pilote la visibilité. */
  stageIndexes: number[];
}

/**
 * Ce que la carte REND, et rien d'autre : ni l'id ni les rencontres du monstre
 * (qui varient par définition d'un variant à l'autre), ni son surnom interne
 * (jamais affiché). La stabilité de la sérialisation tient au générateur, qui
 * écrit tous les monstres avec le même ordre de champs.
 */
function contentSignature(monster: Monster): string {
  const rendered: Partial<Monster> = { ...monster };
  delete rendered.id;
  delete rendered.spawns;
  delete rendered.nickname;
  return JSON.stringify(rendered);
}

/** Les combattants distincts d'un combat — boss d'abord (le principal en tête). */
export function groupCombatants(group: string, lang: Lang): GroupCombatant[] {
  const encounters = encountersOfGroup(group);
  // Groupe inconnu = guide qui pointe dans le vide : on casse le build plutôt
  // que de rendre une page sans boss que personne ne remarquerait.
  if (!encounters.length) {
    throw new Error(
      `groupCombatants : aucun donjon pour le combat « ${group} » — ` +
        `vérifier le champ \`group\` du guide contre data/generated/encounters.json.`,
    );
  }

  interface Draft extends GroupCombatant {
    /** Porte des barres de vie quelque part = le boss PRINCIPAL du combat. */
    main: boolean;
    /** (stage, position dans le donjon) de la première apparition — tri stable. */
    first: [number, number];
  }
  const byContent = new Map<string, Draft>();

  encounters.forEach((e, stageIndex) => {
    // SEULE LA VAGUE DU BOSS compte : le Special Request ouvre sur une vague
    // d'escorte (les Spear-Wielders du Masterless Guardian) que le guide n'a
    // pas à documenter — le combat qu'on vient préparer est celui du boss et
    // de ceux qui se battent À CÔTÉ de lui (le core de Sacreed, Mek'Ril).
    // `wave` n'est émis que sur les donjons multi-vagues : absent, tout passe.
    const mainWave = e.monsters.find((m) => m.role === 'boss' && m.hpLines)?.wave;
    e.monsters.forEach((m, slot) => {
      if (m.wave !== mainWave) return;
      const monster = getMonster(m.id);
      if (!monster) {
        throw new Error(
          `groupCombatants : monstre « ${m.id} » absent de data/generated/monsters.json — ` +
            `à extraire/valider via l'admin (Extractor › Monsters).`,
        );
      }
      const key = `${m.role}|${contentSignature(monster)}`;
      let c = byContent.get(key);
      if (!c) {
        c = {
          monsterId: m.id,
          role: m.role,
          spawns: [],
          spawnByStage: {},
          stageIndexes: [],
          main: false,
          first: [stageIndex, slot],
        };
        byContent.set(key, c);
      }
      // Les stages arrivent en ordre croissant : le dernier variant vu est le
      // plus haut — c'est lui qui représente la carte (celui que le guide vise).
      c.monsterId = m.id;
      c.spawnByStage[stageIndex] = c.spawns.length;
      c.spawns.push(...encounterSpawnContexts(e, m, lang));
      c.stageIndexes.push(stageIndex);
      // Un ADD peut porter des barres de vie (le core de Sacreed) : le
      // PRINCIPAL est le boss qui en porte, pas n'importe quel porteur.
      if (m.role === 'boss' && m.hpLines) c.main = true;
    });
  });

  // Boss avant renforts (décision d'affichage), le PRINCIPAL (barres de vie) en
  // tête des boss ; à rôle égal, l'ordre du jeu (stage puis position) tranche.
  return [...byContent.values()]
    .sort(
      (a, b) =>
        Number(a.role === 'add') - Number(b.role === 'add') ||
        Number(b.main) - Number(a.main) ||
        a.first[0] - b.first[0] ||
        a.first[1] - b.first[1],
    )
    .map(({ monsterId, role, main, spawns, spawnByStage, stageIndexes }) => ({
      monsterId,
      role,
      main,
      spawns,
      spawnByStage,
      stageIndexes,
    }));
}

/**
 * Les paliers qui appartiennent À CE MONSTRE.
 *
 * Quand un donjon à échelle de rangs aligne PLUSIEURS boss, l'échelle les
 * ENJAMBE au lieu de se répéter : au world boss, le boss 1 se joue de D à A,
 * et ATTEINDRE S (le seuil de dégâts du palier) le fait transitionner en
 * boss 2, qui porte S→SSS. Donner les sept rangs aux deux cartes mentirait
 * deux fois — chaque boss afficherait des rangs où il n'existe pas.
 *
 * Le découpage se LIT dans la donnée, il ne se décrète pas : le niveau de base
 * de chaque boss est exactement le niveau de son premier palier (vérifié sur
 * les six world boss — 60 = rang D, 90 = rang S en ligue 3). Si les niveaux ne
 * dessinent pas cette partition (autre mode, autre convention), l'échelle
 * entière reste à chacun — le comportement d'avant.
 */
function ranksOfMonster(e: Encounter, m: DungeonMonster): DungeonRank[] | undefined {
  const ranks = e.ref.ranks;
  const bosses = e.monsters.filter((x) => x.role !== 'add');
  if (!ranks?.length || bosses.length < 2 || m.role === 'add') return ranks;

  const starts = bosses.map((b) => ranks.findIndex((r) => r.level === b.level));
  const partitioned = starts.every((s, i) => (i === 0 ? s === 0 : s > starts[i - 1]));
  const k = bosses.findIndex((b) => b.id === m.id);
  if (!partitioned || k < 0) return ranks;
  return ranks.slice(starts[k], k + 1 < starts.length ? starts[k + 1] : undefined);
}

/**
 * Contextes de calcul de stats d'un MONSTRE dans UN donjon donné.
 *
 * Variante « je sais dans quel combat je suis » de `monsterSpawnContexts`, qui
 * lui part du monstre et ramasse TOUTES ses rencontres. Ici le donjon est
 * connu : ses `adv`, ses `bossHp` et SES paliers s'appliquent — ceux du
 * monstre, pas ceux du donjon entier (cf. `ranksOfMonster`).
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
      // `bossHp` (BossMonsterHP du donjon) = les PV du BOSS : ne le coller qu'à
      // lui, jamais aux renforts — sinon l'add affiche les PV du boss (le core
      // « Spare Core » du guild raid montrait 6,2 M de PV comme son boss).
      ...(d.bossHp && m.role !== 'add' ? { bossHp: d.bossHp } : {}),
      ...(m.hpLines ? { hpLines: m.hpLines } : {}),
    },
    ranksOfMonster(e, m),
  );
}
