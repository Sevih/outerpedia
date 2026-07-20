/**
 * Générateur des RENCONTRES (où affronte-t-on chaque monstre ?).
 *
 * RÉPARTITION DES SORTIES : la localisation par monstre (`monsters` :
 * spawns/summonedBy/linkedTo) est EMBARQUÉE sur chaque entité par la spec
 * monstre (déplacer un boss = diff d'entité → revue/enregistrement/versionnage
 * unitaires) ; `dungeons` devient `encounters.json` (dictionnaire des stages
 * référencés, à rétention comme monsters.json) ; `modes` rejoint
 * `glossaries.modes` (transverse, comme éléments/classes).
 *
 * Chaîne de jointure UNIVERSELLE (vaut pour tous les modes — vérifiée sur
 * guild raid / story / joint challenge, cf. investigation 2026-07-10) :
 *
 *   DungeonTemplet.SpawnID_Pos0..2  (= GroupID — CSV possible, courant dans
 *     les tours : « 401010011, 401010012 »)
 *     → DungeonSpawnTemplet.ID0..ID3 (ids de monstres, CSV possible)
 *       + Level0..3 (LE niveau réel du monstre — jamais RecommandLevel)
 *   DungeonTemplet.DungeonMode (type de contenu) · NameID (titre du stage,
 *   difficulté incluse) · AreaID → AreaTemplet.NameID (région/chapitre)
 *
 * Les tables par mode (EventBossDungeonTemplet, GuildRaidTemplet…) ne portent
 * que des métadonnées (dates, PV surchargés) — leurs `BossID` sont des ids
 * « logiques », PAS les monstres spawnés : on passe toujours par le spawn.
 *
 * INVOCATIONS : aucune clé invocateur → invoqué dans les tables (vérifié :
 * pas de BT_SUMMON, aucun id de monstre dans BuffTemplet/MonsterSkill*). Le
 * lien n'existe QUE dans le texte des skills (« summons an Ice Revenant ») →
 * heuristique : un monstre SANS spawn est rattaché aux propriétaires des
 * skills dont la desc EN contient son nom (nom complet, puis nom sans le
 * premier mot — « Deformed Inferior Core » ↔ « summons an Inferior Core »).
 * Sa localisation affichable = celle de ses invocateurs.
 */
import type { LangDict } from '../lib/lang';
import { loadBuffIndex, skillBuffVars } from '../lib/buff';
import { readCuratedJson } from '../lib/json';
import { statSlug } from '../lib/effects';
import { slugEnum } from '../lib/enums';
import { loadTextIndex, resolveText } from '../lib/text';
import {
  bool,
  fileStamp,
  groupBy,
  indexBy,
  loadTable,
  num,
  splitCsv,
  tablesStamp,
  type Row,
} from '../lib/tables';

/**
 * Empreinte de fraîcheur du domaine encounters : la sentinelle `TextSystem`
 * détecte un refresh (qui réécrit toutes les tables d'un coup), et
 * `mode-titles.json` est stampé à part — la curation s'édite SEULE (admin),
 * sans refresh. Sans ça, l'invalidation mtime de loadTable est à moitié
 * efficace : les tables rechargent mais les memos dérivés serviraient
 * l'ancien monde jusqu'au redémarrage.
 */
function encountersStamp(): string {
  return tablesStamp(['TextSystem']) + '|' + fileStamp('data/curated/mode-titles.json');
}

/**
 * Modificateurs de stats du DONJON (per-mille SIGNÉS, colonnes
 * `DungeonTemplet.SpawnAdvantageRate_*`) : appliqués aux stats interpolées des
 * spawns — `stat × (1000 + adv) / 1000` (arrondi bas). Vérifié in-game (joint
 * challenge very hard : ATK 10754 × (1000−535)/1000 = 5000 exact). Portés par
 * ~90 % des donjons — c'est la norme, pas l'exception.
 */
export interface DungeonAdv {
  atk?: number;
  def?: number;
  hp?: number;
  spd?: number;
}

/**
 * Tranche de DÉGÂTS d'un palier — les modes à SCORE (singularity, world boss,
 * guild dungeon, event challenge) définissent le rang par les dégâts infligés.
 * `max` absent = dernier rang, tranche OUVERTE (« 4 250 001 et plus »).
 */
export interface RankDamage {
  min?: number;
  max?: number;
}

/**
 * Un passif de PALIER résolu (`OptionID` → buff de BuffTemplet) — glossaire
 * `rankOptions` : le SITE affiche les rangs sans lire les tables du jeu.
 */
export interface RankOption {
  /** Type de mécanique du buff (clé du jeu, `BT_*`). */
  type: string;
  /** Nom localisé du statut (tooltip du buff), quand il en a un. */
  name?: LangDict;
  /** Réf tooltip (`BuffToolTipTemplet`) — résoluble en chip (glossaire d'effets). */
  tooltip?: string;
  /** Stat visée (slug), pour les buffs de stat sans tooltip. */
  stat?: string;
  /** Valeur brute (per-mille pour les taux). */
  value?: number;
  irremovable?: boolean;
}

/**
 * Un PALIER de rencontre d'un mode à progression (guild dungeon, world boss,
 * singularity/Monad Gate, event challenge, adventure, exploration) : ces modes
 * REDÉFINISSENT la rencontre par rang/palier — niveau du boss, PV, advantage
 * rates propres (REMPLACENT ceux du donjon) et passifs additionnels.
 */
export interface DungeonRank {
  /** Nom du rang quand le jeu en a un (« D »…« SSS », « E+ »…). */
  name?: string;
  /**
   * STAGE numéroté du palier (Adventure License : « Mission Stage 1-10 »).
   *
   * Ce n'est PAS un `name` : un grade se lit sur un badge (`CM_Event_Rank_D`),
   * un stage se DIT (« Stage 8 ») — il n'a pas de sprite, et lui en fabriquer un
   * depuis son numéro donnerait une image morte. Il ne se déduit pas non plus du
   * rang de la ligne : un boss n'entre en rotation qu'à partir d'un certain stage
   * (le premier palier d'Anubis est le stage 8, pas le stage 1).
   */
  stage?: number;
  /** Niveau RÉEL du boss à ce palier (remplace celui du spawn). */
  level?: number;
  /** Niveau de TRANSCENDANCE du boss (colonne TransLevel — barème à part). */
  transLevel?: number;
  /**
   * PV de la BARRE du palier — PAS les PV totaux du boss : dans les modes à
   * score, la barre = la LARGEUR INCLUSIVE de la tranche (`MaxDamage −
   * MinDamage + 1` : la colonne MaxHP stocke largeur−1, vérifié in-game rang E
   * d'Urd dark = 100 000 ; dernier rang ouvert du world boss : barre
   * arbitraire). Vider la barre = franchir la tranche = rang suivant.
   * (Adventure émet ici de VRAIS PV de boss — colonne BossHP, sans tranche.)
   */
  hp?: number;
  /** Tranche de dégâts du palier (modes à SCORE : le rang = dégâts infligés). */
  damage?: RankDamage;
  /** Advantage rates PROPRES au palier — remplacent ceux du donjon. */
  adv?: DungeonAdv;
  /** Passifs ADDITIONNELS du boss (`OptionID` — résolus dans `rankOptions`). */
  options?: string[];
}

/**
 * Un monstre d'une rencontre, DANS L'ORDRE DU JEU (groupes de spawn dans
 * l'ordre du donjon — chaîne des world boss incluse — puis waves) : le premier
 * `boss` est le combat mis en avant ; deux `boss` successifs = enchaînement de
 * phases (world boss very hard/extreme : tuer le premier fait apparaître le
 * second).
 */
export interface DungeonMonster {
  id: string;
  /** Niveau RÉEL à cette rencontre (DungeonSpawnTemplet.LevelN). */
  level: number;
  /** Barres de vie (HPLineCount), si > 1. */
  hpLines?: number;
  /**
   * Catégorie du monstre (MonsterTemplet.Type) : `boss` pour toute catégorie
   * boss/élite (CT_BOSS/CT_AREA_BOSS/CT_SEASON_BOSS/CT_NAMED_MONSTER), `add`
   * pour les mobs de base (CT_MONSTER) — guild raid : Planet Purification
   * Unit = boss, Spare Core = add.
   */
  role: 'boss' | 'add';
  /**
   * VAGUE d'engagement (1-based) : rang du groupe de spawn du monstre dans la
   * séquence du donjon — `SpawnID_Pos0 → Pos1 → Pos2` (CSV dans l'ordre au
   * sein d'une position), puis la chaîne `ChangeSpawnGroupID` (world boss :
   * tuer un boss fait apparaître le suivant). C'est l'ordre où le jeu envoie
   * les groupes : au Special Request « Masterless Guardian », les
   * Spear-Wielders (vague 1) précèdent le boss (vague 2). ÉMIS SEULEMENT si
   * le donjon a plusieurs groupes — absent = combat en une vague. Un monstre
   * répété à même niveau sur plusieurs vagues porte sa PREMIÈRE vague (la
   * dédup garde la première occurrence).
   */
  wave?: number;
}

/**
 * Difficulté STRUCTURÉE d'un donjon. `key` est une clé STABLE non traduite
 * (le site peut y accrocher ses propres libellés — le jeu ne fournit jamais
 * de français), portée par mode :
 *   - world_boss : `league_1..4` (WorldBossLeagueTemplet.Level), name = nom
 *     de la ligue (« Normal/Hard/Very Hard/Extreme League ») ;
 *   - event_boss (joint challenge) : `normal`/`hard`/`very_hard` (suffixe de
 *     la CLÉ TextSystem du nom du donjon — SYS_EVENT_BOSS_DUNGEON_0001_HARD),
 *     name = libellé générique du jeu (clés curées `difficulties`) ;
 *   - guild_raid_main/sub_boss : `stage_<N>` (GuildRaidGradeTemplet.Grade —
 *     GABARIT, pas une énumération : 10 stages en main, 5 en sub au format
 *     actuel) ;
 *   - irregular_chase : `normal`/`hard`/`very_hard` (DungeonDifficult 1..3,
 *     correspondance curée — vérifiée sur les titres « (Normal) »…) ;
 *   - raid_1/raid_2 (Special Request) : `stage_1..13` (chiffres de la clé
 *     du nom — SYS_RAID_1_DUNGEON_E01), 5 échelles de boss par mode ;
 *   - story/tours/adventure : PAS de champ — la difficulté EST le mode
 *     (normal vs normal_hard, tower/_hard/_very_hard).
 */
export interface DungeonDifficulty {
  key: string;
  /** Ordre croissant d'affichage (1 = plus facile). */
  order: number;
  /** Libellé localisé du jeu, quand il en a un. */
  name?: LangDict;
}

/** Une ligne de butin d'une table de récompense (`RewardGroupTemplet`). */
export interface RewardEntry {
  /** Nature (slug de RIT_* : item/character/asset/piece/ticket/costume/…). */
  kind: string;
  id: string;
  min: number;
  max: number;
  /** Tirage ALÉATOIRE dans le groupe (RandomGroupID) ; absent = garanti. */
  random?: boolean;
}

/**
 * Table de récompense résolue (`RewardTemplet` + groupes) — glossaire
 * `rewardTables`, référencée par `DungeonRef.reward[Win|Lose]`. AUCUN taux de
 * chance dans les tables du client : la pondération des groupes aléatoires est
 * côté serveur.
 */
export interface RewardTable {
  crystal?: number;
  credit?: { min: number; max: number };
  charExp?: number;
  accountExp?: number;
  entries?: RewardEntry[];
}

/**
 * Un GEAS du guild raid (`GuildRaidGeisTemplet` — phase 2 du raid, contenu
 * pas encore ouvert in-game) : contrainte ou aide activable sur la rencontre,
 * contre un ajustement de points. Glossaire `geas` (les 107 sortent, le jeu
 * n'en câble que 103), référencé par `DungeonRef.geasRewards`.
 */
export interface GuildRaidGeas {
  /**
   * Description du jeu (NameID = DescID dans la table), placeholders
   * `[buff_c/v/t_<id>]` RÉSOLUS (valeurs niveau 1 — les buffs geis n'ont pas
   * de niveaux).
   */
  desc: LangDict;
  /** Icône (`GD_Geis_*`). */
  icon?: string;
  /**
   * true = geas FAVORABLE aux joueurs (facilite le combat, points en moins) ;
   * false = handicap (points en plus). `IsPositive` de la table.
   */
  positive: boolean;
  /** Palier d'intensité (1..3). */
  grade: number;
  /**
   * Mécanique (slug de GeisType) : `buff_boss` (buffe/débuffe le boss),
   * `buff_character` (buffe des héros), `boss_change`, `sealed_element` /
   * `sealed_class` (interdit des éléments/classes de héros).
   */
  type: string;
  /**
   * Ajustement de points (`GuildRaidPointIncrease`, per-mille signé présumé :
   * +400 = +40 % — sémantique à confirmer à l'ouverture du contenu).
   */
  points: number;
  /** Valeurs BRUTES selon `type` : ids BuffTemplet, `CET_*`, classes, ids. */
  values?: string[];
}

/** Un donjon/stage où spawne au moins un monstre. */
export interface DungeonRef {
  /** Mode de contenu (slug de DungeonMode : normal/guild_raid_main_boss/…). */
  mode: string;
  /** Titre localisé du stage (difficulté incluse : « … (Stage 1) », « … Hard »). */
  name: LangDict;
  /** Région/chapitre (AreaTemplet), si résolue. */
  area?: LangDict;
  /** Monstres de la rencontre, dans l'ordre du jeu (cf. `DungeonMonster`). */
  monsters?: DungeonMonster[];
  /** Difficulté structurée, sur les modes où elle ne vit pas dans `mode`. */
  difficulty?: DungeonDifficulty;
  /**
   * Identifiant OPAQUE de combat : les donjons partageant le même `group`
   * sont LE MÊME COMBAT à des difficultés/paliers différents. Stable —
   * `world_boss:<BossID>`, `event_boss:<base de clé TextSystem>`,
   * `guild_raid:<base>`, `irregular_chase:<GroupID>`.
   */
  group?: string;
  /** Tours : numéro d'étage (suffixe de la clé TextSystem du nom). */
  floor?: number;
  /** Tours élémentaires : élément de la tour (fire/water/earth/light/dark). */
  element?: string;
  /** Butin répétable (`DungeonTemplet.RewardID`) — réf `rewardTables`. */
  reward?: string;
  /** Poursuite (irregular_chase) : butin de victoire/défaite. */
  rewardWin?: string;
  rewardLose?: string;
  /**
   * Guild raid (sub-boss) : geas OBTENUS en récompense de ce donjon
   * (`GuildRaidGradeTemplet.BossGeisReward`, 2 par grade) — réfs vers le
   * glossaire `geas`. Contenu phase 2, pas encore ouvert in-game.
   */
  geasRewards?: string[];
  /** STORY (`normal`/`normal_hard`) : saison et épisode (AreaTemplet). */
  season?: number;
  episode?: number;
  /** Modificateurs de stats du donjon (cf. `DungeonAdv`). */
  adv?: DungeonAdv;
  /**
   * PV RÉELS du boss dans ce donjon. Sources : `EventBossDungeonTemplet.
   * BossMonsterHP` (CSV aligné au CSV `DungeonID` — joint challenge :
   * 2 000 000 en very hard), `GuildRaidGradeTemplet.BossMonsterHP` (guild raid
   * saisonnier : un donjon PAR grade), `EventDungeonTemplet.BossHP` (challenge
   * d'événement). Remplace les PV interpolés du templet. Saison la plus
   * récente en cas de réutilisation du donjon.
   */
  bossHp?: number;
  /** Paliers de rencontre des modes à progression (cf. `DungeonRank`). */
  ranks?: DungeonRank[];
}

/** Une apparition d'un monstre dans un donjon. */
export interface MonsterSpawn {
  /** Réf vers `dungeons`. */
  dungeon: string;
  /** Niveau RÉEL du monstre à cette rencontre (DungeonSpawnTemplet.LevelN). */
  level: number;
  /** Barres de vie (HPLineCount), si > 1. */
  hpLines?: number;
}

export interface MonsterEncounters {
  spawns: MonsterSpawn[];
  /** Monstres dont un skill invoque CELUI-CI (heuristique texte, cf. en-tête). */
  summonedBy?: string[];
  /**
   * Partenaires de rencontre STRUCTURELS d'un monstre sans spawn : les skills
   * des adds/variantes référencent l'id du boss canonique via `BuffToolTip`
   * (entrées « marqueur » de BuffToolTipTemplet, directes ou via
   * ToolTipGroupTemplet) — dans les deux sens. Localisation via ces partenaires.
   */
  linkedTo?: string[];
}

export interface EncountersData {
  /** Libellés localisés des modes de contenu (slug → titre), quand connus. */
  modes: Record<string, LangDict>;
  /** Passifs de palier résolus (`OptionID` → buff) — rejoint `glossaries`. */
  rankOptions: Record<string, RankOption>;
  /**
   * QUIRKS de compte réduisant les stats des BOSS (arbre Challenge du système
   * Gift) : slug de stat → per-mille SIGNÉ total, tous nœuds pris. L'écran
   * d'info du jeu les applique aux stats affichées (constat Sevih) — le site
   * fait pareil (`stat × (1000 + mod) / 1000`, arrondi bas).
   */
  bossQuirkMods: Record<string, number>;
  /**
   * Tables de récompense résolues, RÉFÉRENCÉES par les donjons
   * (`DungeonRef.reward`/`rewardWin`/`rewardLose`) — mutualisées : des
   * centaines de donjons partagent les mêmes tables.
   */
  rewardTables: Record<string, RewardTable>;
  /** Geas du guild raid (réfs `DungeonRef.geasRewards`, cf. `GuildRaidGeas`). */
  geas: Record<string, GuildRaidGeas>;
  dungeons: Record<string, DungeonRef>;
  monsters: Record<string, MonsterEncounters>;
}

// --- résolution des TITRES de mode (aucune clé par mode en dur) ----------------
//
// Deux sources STRUCTURELLES, dans l'ordre :
//   1. Conventions de nommage des clés TextSystem (`SYS_<X>_TITLE`,
//      `SYS_PVE_<X>`, `SYS_<X>_DUNGEON`, …), comparées en forme NORMALISÉE
//      (sans `_`) — attrape `SIDESTORY` ↔ `SYS_SIDE_STORY_TITLE` — avec repli
//      préfixe (≤ 4 caractères restants : `TOWER_ELEMENT` ↔ `TOWER_ELEMENTAL`).
//      Les bases candidates = le mode privé de ses tokens QUALIFICATIFS de fin
//      (MAIN/SUB/BOSS/HARD/…) puis les troncatures successives — un titre sur
//      base non qualifiée gagne (GUILD_RAID_SUB_BOSS → « Guild Raid », pas le
//      nom du boss de saison).
//   2. `ContentLockTemplet` (ContentType → TextID) par recoupement de tokens —
//      couvre les contenus sans clé conventionnelle (MONAD_BATTLE → MONADGATE,
//      CHAR_PIECE → PIECE_DUNGEON, IVANEZ_DUNGEON → IVANEZ_FESTIVAL…).

/** Qualificatifs de fin (difficulté/rôle) — pas des noms de contenu. */
const MODE_QUALIFIERS = new Set([
  'MAIN',
  'SUB',
  'BOSS',
  'HARD',
  'VERY',
  'NORMAL',
  'SPOT',
  'MISSION',
  'REALTIME',
]);
/** Tokens trop génériques pour identifier un contenu (repli ContentLock). */
const MODE_STOP_TOKENS = new Set([...MODE_QUALIFIERS, 'DUNGEON', 'BATTLE', 'EVENT']);

const normKey = (k: string): string => k.replace(/_/g, '').toUpperCase();

/** Nb de tokens qualificatifs en FIN de base (pénalité de rang). */
function trailingQualifiers(tokens: string[]): number {
  let n = 0;
  for (let i = tokens.length - 1; i >= 0 && MODE_QUALIFIERS.has(tokens[i]); i--) n++;
  return n;
}

/** Un titre de ContentLock candidat au repli (clé TextSystem incluse). */
interface ContentTitle {
  norm: string;
  tokens: string[];
  text: LangDict;
  key: string;
}

/** Titre localisé d'un mode `DM_X` (+ sa clé TextSystem), ou `undefined`
 * (le slug reste affichable). */
function resolveModeTitle(
  rawMode: string,
  tsys: Map<string, LangDict>,
  keysByNorm: Map<string, string>,
  contentTitles: ContentTitle[],
): { key: string; text: LangDict } | undefined {
  const tokens = rawMode.replace(/^DM_/, '').split('_');

  // 1) Conventions : toutes les troncatures de fin, tous les motifs, puis choix
  // par (priorité du motif, base non qualifiée d'abord, base la plus longue).
  const hits: Array<{
    prio: number;
    penalty: number;
    len: number;
    key: string;
    base: string;
    isTitle: boolean;
  }> = [];
  for (let cut = 0; cut < tokens.length; cut++) {
    const base = tokens.slice(0, tokens.length - cut);
    const b = base.join('_');
    const patterns = [
      `SYS_${b}_TITLE`,
      `SYS_PVE_${b}`,
      `SYS_${b}_DUNGEON`,
      `SYS_${b}`,
      `SYS_MENU_${b}`,
      `SYS_${b}_CONTENTS_NAME`,
      `SYS_CONTENT_POPUP_NAME_${b}`,
      `SYS_${b}_NAME`,
    ];
    patterns.forEach((p, prio) => {
      const n = normKey(p);
      let key = keysByNorm.get(n);
      // Repli PRÉFIXE très serré (ELEMENT ↔ ELEMENTAL) : reste ≤ 2 caractères
      // et base LONGUE (≥ 10) — sinon SYS_WORLD attrape SYS_WORLD_MAP et
      // SYS_EVENT_DUNGEON attrape SYS_EVENT_DUNGEON_INFO.
      if (!key && n.length >= 10) {
        for (const [nk, real] of keysByNorm) {
          if (nk.startsWith(n) && nk.length - n.length <= 2) {
            key = real;
            break;
          }
        }
      }
      if (key)
        hits.push({
          prio,
          penalty: trailingQualifiers(base),
          len: b.length,
          key,
          base: b,
          isTitle: p.endsWith('_TITLE'),
        });
    });
  }
  hits.sort((a, b) => a.prio - b.prio || a.penalty - b.penalty || b.len - a.len);
  if (hits.length) {
    const best = hits[0];
    const title = resolveText(tsys, best.key);
    if (title.en) {
      // `_TITLE` est parfois une BANNIÈRE qui rallonge le nom nu
      // (SYS_EVENT_TITLE = « Event Shop Available » vs SYS_EVENT = « Event ») :
      // si la clé nue de la même base existe et préfixe le titre, elle gagne.
      if (best.isTitle) {
        const plainKey = keysByNorm.get(normKey(`SYS_${best.base}`));
        const plain = plainKey ? resolveText(tsys, plainKey) : undefined;
        if (plain?.en && title.en.startsWith(plain.en) && title.en !== plain.en)
          return { key: plainKey!, text: plain };
      }
      return { key: best.key, text: title };
    }
  }

  // 2) ContentLockTemplet : meilleur recoupement de tokens distinctifs.
  let best: { score: number; text: LangDict; key: string } | undefined;
  for (const c of contentTitles) {
    let score = 0;
    for (const t of tokens) {
      if (MODE_STOP_TOKENS.has(t)) continue;
      if (c.tokens.includes(t) || (t.length >= 5 && c.norm.includes(t))) score += t.length;
    }
    if (score > 0 && (!best || score > best.score)) best = { score, text: c.text, key: c.key };
  }
  return best ? { key: best.key, text: best.text } : undefined;
}

/**
 * Groupes de spawn d'un donjon (colonnes `SpawnID_Pos0..2`). Chaque position
 * peut porter un CSV de GroupID (« 401010011, 401010012 » — 95 donjons, dont
 * 30 étages de tours) : toujours passer par ici, jamais lire les colonnes
 * brutes, sinon ces groupes sont silencieusement perdus.
 */
export function spawnGroupIds(d: Row): string[] {
  return [d.SpawnID_Pos0, d.SpawnID_Pos1, d.SpawnID_Pos2].flatMap((v) => splitCsv(v));
}

/**
 * Monstres d'un GROUPE de spawn (lignes `DungeonSpawnTemplet` du groupe) :
 * colonnes `ID0..ID3` (CSV possible), dédupliqués dans l'ordre des tables.
 * Toujours passer par ici, jamais lire `ID0` seul — les monstres des slots
 * 1..3 seraient silencieusement perdus (bug historique de sources.ts).
 */
export function spawnUnits(rows: Row[]): string[] {
  const out: string[] = [];
  for (const w of rows) {
    for (let i = 0; i < 4; i++) {
      for (const mid of splitCsv(w[`ID${i}`] ?? '')) if (!out.includes(mid)) out.push(mid);
    }
  }
  return out;
}

/** Remplit le placeholder `{0}` d'un titre, dans toutes les langues. */
function fillPlaceholder(dict: LangDict, v: number | string): LangDict {
  const out = { ...dict };
  for (const lang of Object.keys(out) as Array<keyof LangDict>) {
    out[lang] = (out[lang] ?? '').replaceAll('{0}', String(v));
  }
  return out;
}

/**
 * Retire le segment parenthésé d'un `{0}` jamais rempli — donjons annexes du
 * guild raid (70501011/12 : entraînement) SANS ligne de grade : le jeu n'a
 * aucun numéro à y mettre, « Guardian… (Stage {0}) » → « Guardian… ».
 */
function stripUnfilledPlaceholder(dict: LangDict): LangDict {
  const out = { ...dict };
  for (const lang of Object.keys(out) as Array<keyof LangDict>) {
    out[lang] = (out[lang] ?? '').replace(/\s*[(（][^()（）]*\{0\}[^()（）]*[)）]/g, '').trim();
  }
  return out;
}

/** Contexte de résolution des TITRES de mode (index TextSystem normalisé,
 * titres ContentLock, curation mode-titles.json) — partagé entre le glossaire
 * `modes` de buildEncounters et `modeTitleKey` (sources.ts). */
interface ModeTitleContext {
  tsys: Map<string, LangDict>;
  keysByNorm: Map<string, string>;
  contentTitles: ContentTitle[];
  /** Slug de mode → clé TextSystem curée (décision humaine prioritaire). */
  curatedTitles: Record<string, string>;
  /** Modes ignorés à l'extraction (décision humaine, `_docIgnore`). */
  ignoredModes: Set<string>;
  /** Libellés génériques de difficulté (slug → clé TextSystem). */
  difficultyNames: Record<string, string>;
  /** Ordre de la poursuite → slug de difficulté (correspondance curée). */
  chaseDifficulties: Record<string, string>;
}

let titleCtxCache: { ctx: ModeTitleContext; stamp: string } | undefined;

function titleContext(): ModeTitleContext {
  const stamp = encountersStamp();
  if (titleCtxCache && titleCtxCache.stamp === stamp) return titleCtxCache.ctx;
  const tsys = loadTextIndex('TextSystem');

  // Index des clés TextSystem en forme normalisée + titres de ContentLock
  // (débarrassés d'éventuels crochets décoratifs : « [Monad Gate] »).
  const keysByNorm = new Map<string, string>();
  for (const k of tsys.keys()) if (!keysByNorm.has(normKey(k))) keysByNorm.set(normKey(k), k);
  const stripBrackets = (t: LangDict): LangDict => {
    const out = { ...t };
    for (const lang of Object.keys(out) as Array<keyof LangDict>) {
      const m = /^\[(.+)\]$/.exec(out[lang] ?? '');
      if (m) out[lang] = m[1];
    }
    return out;
  };
  const contentTitles: ContentTitle[] = [];
  for (const c of loadTable('ContentLockTemplet')) {
    if (!c.ContentType || !c.TextID || c.TextID === '0') continue;
    const text = resolveText(tsys, c.TextID);
    if (!text.en) continue;
    contentTitles.push({
      norm: normKey(c.ContentType),
      tokens: c.ContentType.split('_'),
      text: stripBrackets(text),
      key: c.TextID,
    });
  }

  // Titres CURÉS (slug → clé TextSystem, cf. data/curated/mode-titles.json) :
  // prioritaires — décision humaine pour les échecs du résolveur automatique
  // (rien ne relie DM_MONAD_BATTLE_2 à « Dimensional Singularity » dans les
  // tables). Les textes restent ceux du jeu (clé, jamais de texte main).
  const curatedTitles: Record<string, string> = {};
  // Modes IGNORÉS (décision humaine, cf. _docIgnore du fichier curé) : leurs
  // donjons/spawns ne sortent pas — ni rencontres, ni mode dans la sidebar.
  const ignoredModes = new Set<string>();
  // Libellés génériques de difficulté (slug → clé TextSystem) + correspondance
  // ordre → slug de la poursuite (aucune clé structurelle, décision curée).
  const difficultyNames: Record<string, string> = {};
  const chaseDifficulties: Record<string, string> = {};
  // Absent = pas de décisions curées ; JSON cassé = throw nommé (readCuratedJson).
  const curated = readCuratedJson<{
    titles?: Record<string, string>;
    ignore?: string[];
    difficulties?: Record<string, string>;
    chaseDifficulties?: Record<string, string>;
  }>('data/curated/mode-titles.json');
  if (curated) {
    Object.assign(curatedTitles, curated.titles ?? {});
    for (const m of curated.ignore ?? []) ignoredModes.add(m);
    Object.assign(difficultyNames, curated.difficulties ?? {});
    Object.assign(chaseDifficulties, curated.chaseDifficulties ?? {});
  }

  titleCtxCache = {
    ctx: {
      tsys,
      keysByNorm,
      contentTitles,
      curatedTitles,
      ignoredModes,
      difficultyNames,
      chaseDifficulties,
    },
    stamp,
  };
  return titleCtxCache.ctx;
}

/**
 * Clé TextSystem du TITRE d'un mode `DM_X` — même règle que le glossaire
 * `modes` (curation prioritaire, résolveur structurel ensuite), mais expose la
 * CLÉ : sources.ts étiquette les boss par clé de titre, résolue par bosses.ts.
 * Les modes IGNORÉS par la curation ne sortent pas d'encounters → pas de
 * titre non plus ici (ex. `ivanez_dungeon`, one-off mort).
 */
export function modeTitleKey(rawMode: string): string | undefined {
  const ctx = titleContext();
  const slug = slugEnum(rawMode);
  if (ctx.ignoredModes.has(slug)) return undefined;
  const curatedKey = ctx.curatedTitles[slug];
  if (curatedKey && resolveText(ctx.tsys, curatedKey).en) return curatedKey;
  return resolveModeTitle(rawMode, ctx.tsys, ctx.keysByNorm, ctx.contentTitles)?.key;
}

/**
 * Mémoïsé : appelé par la spec monstre (chaque monstre embarque ses spawns),
 * l'orchestrateur (dictionnaires modes/donjons) et l'admin — même processus,
 * mêmes tables (elles-mêmes cachées par `loadTable`).
 */
let cache: { data: EncountersData; stamp: string } | undefined;
// Signature des lacunes de butin au dernier signalement : un rebuild du cache
// (fréquent dans l'admin) ne re-signale que si la LISTE a changé.
let lastRewardGapsSig: string | undefined;

export function buildEncounters(): EncountersData {
  const stamp = encountersStamp();
  if (cache && cache.stamp === stamp) return cache.data;
  const tsys = loadTextIndex('TextSystem');
  const tchar = loadTextIndex('TextCharacter');
  const tskill = loadTextIndex('TextSkill');
  const spawnsByGroup = groupBy(loadTable('DungeonSpawnTemplet'), 'GroupID');
  const areaById = indexBy(loadTable('AreaTemplet'));

  // Ligues des WORLD BOSS : chaque ligne (une par donjon d'une ROTATION —
  // `WorldBossID` → `WorldBossTemplet`, planning daté) liste la SÉQUENCE des
  // groupes de spawn de son donjon (`ChangeSpawnGroupID` — tuer un boss fait
  // apparaître le suivant), alors que le donjon ne référence que le PREMIER
  // (SpawnID_Pos0), et porte le NOM DE LIGUE (seule « difficulté » des WB —
  // les donjons d'une rotation partagent le même nom). Les systèmes de ligue
  // se succèdent (Beginner/Junior/Senior legacy → Normal/Hard/Very Hard/
  // Extreme actuel) en réutilisant PARFOIS les mêmes donjons (Ragnakeus),
  // parfois non (Venion 552000xx → 552001xx) : la DERNIÈRE rotation de
  // chaque boss fait foi — ses donjons prennent sa chaîne et ses noms de
  // ligue, les donjons des rotations antérieures qui n'y figurent plus sont
  // du contenu MORT (exclus, comme les modes ignorés). Les donjons WB hors
  // de toute ligue (event Ragnakeus 2024, 554xxxxx) restent tels quels.
  const leagueRows = [...loadTable('WorldBossLeagueTemplet')].sort((a, b) => num(a.ID) - num(b.ID));
  const wbBossOf = new Map<string, string>();
  for (const r of loadTable('WorldBossTemplet')) if (r.ID && r.BossID) wbBossOf.set(r.ID, r.BossID);
  const wbCurrent = new Map<string, { rot: number; dungeons: Set<string> }>();
  for (const r of leagueRows) {
    if (!r.DungeonID) continue;
    const boss = wbBossOf.get(r.WorldBossID ?? '') ?? r.WorldBossID ?? '';
    const rot = num(r.WorldBossID);
    const cur = wbCurrent.get(boss);
    if (!cur || rot > cur.rot) wbCurrent.set(boss, { rot, dungeons: new Set([r.DungeonID]) });
    else if (rot === cur.rot) cur.dungeons.add(r.DungeonID);
  }
  const currentWbDungeons = new Set<string>();
  const wbBossByDungeon = new Map<string, string>();
  for (const [boss, c] of wbCurrent) {
    for (const d of c.dungeons) {
      currentWbDungeons.add(d);
      wbBossByDungeon.set(d, boss);
    }
  }
  const deadWbDungeons = new Set<string>();
  const wbLeague = new Map<string, { chain: string[]; league?: string; level: number }>();
  for (const r of leagueRows) {
    if (!r.DungeonID) continue;
    if (!currentWbDungeons.has(r.DungeonID)) {
      deadWbDungeons.add(r.DungeonID);
      continue;
    }
    // Lignes croissantes → la rotation la plus récente l'emporte.
    wbLeague.set(r.DungeonID, {
      chain: splitCsv(r.ChangeSpawnGroupID ?? ''),
      level: num(r.Level),
      ...(r.LeagueName ? { league: r.LeagueName } : {}),
    });
  }

  // Donjons du GUILD RAID : deux causes de contenu mort, exclues comme les
  // rotations WB. (1) Les copies PRACTICE — mêmes NameID, jamais référencées
  // par GuildRaidGradeTemplet (70101004-006, Gornolf/Guardian ×10…). (2) Les
  // ÉCHELLES REFONDUES : les boss des saisons 1-3 ont eu une échelle 2023
  // (main 3 stages Lv50-100) PUIS une refonte 2025 (10 stages Lv125-200,
  // nouvelle famille d'ids) sous le MÊME NameID — deux « Stage 1 » pour le
  // même combat. Seul le set de donjons de la DERNIÈRE saison (StartDate de
  // GuildRaidTemplet) référençant un combat (base du NameID) fait foi.
  const grRaidDates = new Map<string, string>();
  for (const r of loadTable('GuildRaidTemplet')) if (r.ID) grRaidDates.set(r.ID, r.StartDate ?? '');
  const grNameId = new Map<string, string>();
  for (const d of loadTable('DungeonTemplet'))
    if ((d.DungeonMode ?? '').startsWith('DM_GUILD_RAID') && d.NameID) grNameId.set(d.ID, d.NameID);
  const grLatest = new Map<string, { date: string; dungeons: Set<string> }>();
  for (const r of loadTable('GuildRaidGradeTemplet')) {
    if (!r.BossDungeonID) continue;
    const base = (grNameId.get(r.BossDungeonID) ?? '').replace(/_\d+$/, '');
    const date = grRaidDates.get(r.GuildRaidID ?? '') ?? '';
    const cur = grLatest.get(base);
    if (!cur || date > cur.date) grLatest.set(base, { date, dungeons: new Set([r.BossDungeonID]) });
    else if (date === cur.date) cur.dungeons.add(r.BossDungeonID);
  }
  const grCurrent = new Set<string>();
  for (const e of grLatest.values()) for (const d of e.dungeons) grCurrent.add(d);

  const modes: Record<string, LangDict> = {};
  const dungeons: Record<string, DungeonRef> = {};
  const monsters: Record<string, MonsterEncounters> = {};

  // Contexte de titres partagé (index normalisé, ContentLock, curation) —
  // cf. `titleContext` : la même règle sert aussi `modeTitleKey` (sources.ts).
  const {
    keysByNorm,
    contentTitles,
    curatedTitles,
    ignoredModes,
    difficultyNames,
    chaseDifficulties,
  } = titleContext();
  /** Difficulté structurée : libellé générique curé (absent = pas de name). */
  const difficultyOf = (key: string, order: number): DungeonDifficulty => {
    const nameKey = difficultyNames[key];
    const name = nameKey ? resolveText(tsys, nameKey) : undefined;
    return { key, order, ...(name?.en ? { name } : {}) };
  };

  // Catégorie des monstres (rôle boss/add des rencontres).
  const monsterTypeById = new Map<string, string>();
  for (const r of loadTable('MonsterTemplet')) monsterTypeById.set(r.ID, r.Type ?? '');

  // Tables de récompense : résolues À LA DEMANDE (seuls les RewardID
  // effectivement référencés par un donjon extrait sortent), mutualisées.
  const rewardById = indexBy(loadTable('RewardTemplet'));
  const rewardGroups = groupBy(loadTable('RewardGroupTemplet'), 'GroupID');
  const rewardTables: Record<string, RewardTable> = {};
  // Récompenses non résolues : SIGNALÉES en UNE ligne agrégée en fin de build
  // (38 lignes par rebuild spammaient chaque requête admin) — mais jamais de
  // throw : la donnée réelle peut être lacunaire (RewardID orphelin, ligne de
  // groupe incomplète) sans invalider le reste du build.
  const missingRewardIds = new Set<string>();
  const typelessGroups = new Set<string>();
  const resolveReward = (id: string | undefined): string | undefined => {
    if (!id) return undefined;
    if (rewardTables[id]) return id;
    const r = rewardById.get(id);
    if (!r) {
      missingRewardIds.add(id);
      return undefined;
    }
    const table: RewardTable = {};
    if (num(r.Crystal)) table.crystal = num(r.Crystal);
    if (num(r.CreditMin) || num(r.CreditMax))
      table.credit = { min: num(r.CreditMin), max: num(r.CreditMax) };
    if (num(r.CharacterEXP)) table.charExp = num(r.CharacterEXP);
    if (num(r.AccountEXP)) table.accountExp = num(r.AccountEXP);
    const entries: RewardEntry[] = [];
    const collect = (groupCsv: string | undefined, random: boolean) => {
      for (const gid of splitCsv(groupCsv ?? '')) {
        for (const g of rewardGroups.get(gid) ?? []) {
          if (!g.TypeID) {
            typelessGroups.add(gid);
            continue;
          }
          entries.push({
            kind: slugEnum(g.Type),
            id: g.TypeID,
            min: num(g.MinCount),
            max: num(g.MaxCount),
            ...(random ? { random: true } : {}),
          });
        }
      }
    };
    collect(r.StaticGroupID, false);
    collect(r.RandomGroupID, true);
    if (entries.length) table.entries = entries;
    if (!Object.keys(table).length) return undefined;
    rewardTables[id] = table;
    return id;
  };

  // NameID brut par donjon extrait — les passes par mode dérivent difficulté
  // et groupe de combat du SUFFIXE de la clé (structurel, jamais du texte).
  const nameIdOf = new Map<string, string>();

  for (const d of loadTable('DungeonTemplet')) {
    if (deadWbDungeons.has(d.ID)) continue;
    if ((d.DungeonMode ?? '').startsWith('DM_GUILD_RAID') && !grCurrent.has(d.ID)) continue;
    const groupIds = [...new Set([...spawnGroupIds(d), ...(wbLeague.get(d.ID)?.chain ?? [])])];
    if (!groupIds.length) continue;

    // Monstres du donjon, dédupliqués par (monstre, niveau) — plusieurs vagues
    // peuvent répéter le même mob au même niveau (il garde sa PREMIÈRE vague).
    // Une VAGUE = un groupe de spawn qui engage (a des lignes), dans l'ordre de
    // `groupIds` (positions puis chaîne) — cf. doc de `DungeonMonster.wave`.
    const seen = new Set<string>();
    const found: Array<{ id: string; level: number; hpLines?: number; wave: number }> = [];
    let wave = 0;
    for (const g of groupIds) {
      const rows = spawnsByGroup.get(g) ?? [];
      if (!rows.length) continue; // groupe sans spawn : n'engage rien, ne compte pas
      wave++;
      for (const w of rows) {
        for (let i = 0; i < 4; i++) {
          for (const mid of splitCsv(w[`ID${i}`] ?? '')) {
            const level = num(w[`Level${i}`]);
            const key = `${mid}|${level}`;
            if (seen.has(key)) continue;
            seen.add(key);
            const hpLines = num(w.HPLineCount);
            found.push({ id: mid, level, wave, ...(hpLines > 1 ? { hpLines } : {}) });
          }
        }
      }
    }
    if (!found.length) continue;
    const waveCount = wave;

    // STORY : DM_NORMAL couvre les deux difficultés — la zone tranche
    // (AreaTemplet.AreaGroupType, AGT_NORMAL/AGT_HARD). Slug synthétique
    // `normal_hard`, titres curés (mode-titles.json : Story Normal/Hard).
    let mode = slugEnum(d.DungeonMode);
    const areaRow = areaById.get(d.AreaID ?? '');
    if (mode === 'normal' && areaRow?.AreaGroupType === 'AGT_HARD') mode = 'normal_hard';
    if (ignoredModes.has(mode)) continue;
    if (!(mode in modes)) {
      const curatedKey = curatedTitles[mode];
      const curated = curatedKey ? resolveText(tsys, curatedKey) : undefined;
      const title = curated?.en
        ? curated
        : resolveModeTitle(d.DungeonMode, tsys, keysByNorm, contentTitles)?.text;
      if (title) modes[mode] = title;
    }
    const ref: DungeonRef = { mode, name: resolveText(tsys, d.NameID) };
    if (d.NameID) nameIdOf.set(d.ID, d.NameID);
    if (areaRow?.NameID) {
      const area = resolveText(tsys, areaRow.NameID);
      if (area.en) ref.area = area;
    }
    // Index inverse rencontre → monstres, dans l'ordre du jeu ; rôle dérivé de
    // la catégorie (cf. DungeonMonster). La vague n'est émise que si le combat
    // en a plusieurs (absente = une seule vague, rien à raconter).
    ref.monsters = found.map((f) => ({
      id: f.id,
      level: f.level,
      ...(f.hpLines ? { hpLines: f.hpLines } : {}),
      role: monsterTypeById.get(f.id) === 'CT_MONSTER' ? ('add' as const) : ('boss' as const),
      ...(waveCount > 1 ? { wave: f.wave } : {}),
    }));
    // Story : saison/épisode de la zone (AreaTemplet) — la sidebar les affiche.
    if (mode === 'normal' || mode === 'normal_hard') {
      if (num(areaRow?.SeasonID)) ref.season = num(areaRow!.SeasonID);
      if (num(areaRow?.EpisodeNum)) ref.episode = num(areaRow!.EpisodeNum);
    }
    // World boss : la ligue est la difficulté (nom + niveau structurel), le
    // boss de la rotation courante est le groupe de combat.
    const wb = wbLeague.get(d.ID);
    if (wb?.league) {
      const league = resolveText(tsys, wb.league);
      ref.difficulty = {
        key: `league_${wb.level}`,
        order: wb.level,
        ...(league.en ? { name: league } : {}),
      };
    }
    const wbBoss = wbBossByDungeon.get(d.ID);
    if (wbBoss) ref.group = `world_boss:${wbBoss}`;
    // Special Request (raid_1/raid_2) : 5 échelles de boss par mode, 13
    // stages chacune — tout vit dans la CLÉ du nom
    // (SYS_RAID_1_DUNGEON_E01 : base = échelle, chiffres = stage ; la chaîne
    // NextOpenDungeonID confirme le découpage). Pas de `name` de difficulté :
    // le nom du donjon porte déjà « (Stage N) ».
    if (mode === 'raid_1' || mode === 'raid_2') {
      const m = /^(SYS_RAID_\d+_DUNGEON_[A-Z]+)(\d+)$/.exec(d.NameID ?? '');
      if (m) {
        const stage = Number(m[2]);
        ref.difficulty = { key: `stage_${stage}`, order: stage };
        ref.group = `${mode}:${m[1]}`;
      }
    }
    // Tours : étage et élément vivent dans la CLÉ du nom
    // (SYS_INFINITE_DUNGEON[_FIRE][_HARD|_V_HARD]_<étage> — espaces parasites
    // possibles dans les clés du jeu).
    if (mode.startsWith('tower')) {
      const key = (d.NameID ?? '').replace(/\s+/g, '');
      const m =
        /^SYS_INFINITE_DUNGEON_(?:(FIRE|WATER|EARTH|LIGHT|DARK)_)?(?:V_HARD_|HARD_)?(\d+)$/.exec(
          key,
        );
      if (m) {
        ref.floor = Number(m[2]);
        if (m[1]) ref.element = m[1].toLowerCase();
      }
    }
    // Butin répétable du donjon (table mutualisée, cf. rewardTables).
    const reward = resolveReward(d.RewardID);
    if (reward) ref.reward = reward;
    const adv: DungeonAdv = {};
    if (num(d.SpawnAdvantageRate_Atk)) adv.atk = num(d.SpawnAdvantageRate_Atk);
    if (num(d.SpawnAdvantageRate_Def)) adv.def = num(d.SpawnAdvantageRate_Def);
    if (num(d.SpawnAdvantageRate_HP)) adv.hp = num(d.SpawnAdvantageRate_HP);
    if (num(d.SpawnAdvantageRate_Spd)) adv.spd = num(d.SpawnAdvantageRate_Spd);
    if (Object.keys(adv).length) ref.adv = adv;
    dungeons[d.ID] = ref;

    for (const f of found) {
      const entry = (monsters[f.id] ??= { spawns: [] });
      entry.spawns.push({
        dungeon: d.ID,
        level: f.level,
        ...(f.hpLines ? { hpLines: f.hpLines } : {}),
      });
    }
  }

  // --- surcharges de rencontre par MODE -------------------------------------------
  // Les stats du templet ne suffisent pas : chaque mode « spécial » redéfinit la
  // rencontre dans SA table — PV réels, niveau par palier, advantage rates
  // propres, passifs additionnels. Tout est raccroché ici au donjon.

  /** Advantage rates d'une ligne de table de mode (mêmes colonnes partout). */
  const advOf = (r: Record<string, string | undefined>): DungeonAdv | undefined => {
    const adv: DungeonAdv = {};
    if (num(r.SpawnAdvantageRate_Atk)) adv.atk = num(r.SpawnAdvantageRate_Atk);
    if (num(r.SpawnAdvantageRate_Def)) adv.def = num(r.SpawnAdvantageRate_Def);
    if (num(r.SpawnAdvantageRate_HP)) adv.hp = num(r.SpawnAdvantageRate_HP);
    if (num(r.SpawnAdvantageRate_Spd)) adv.spd = num(r.SpawnAdvantageRate_Spd);
    return Object.keys(adv).length ? adv : undefined;
  };

  /** Ligne de palier (schéma partagé guild dungeon / world boss / singularity /
   * event challenge : MinDamage..MaxDamage → BaseLevel/TransLevel/MaxHP/adv/OptionID). */
  const rankOf = (r: Record<string, string | undefined>): DungeonRank => {
    const rank: DungeonRank = {};
    if (r.RankName) rank.name = r.RankName;
    if (num(r.BaseLevel)) rank.level = num(r.BaseLevel);
    if (num(r.TransLevel)) rank.transLevel = num(r.TransLevel);
    // Barre INCLUSIVE : la colonne stocke largeur−1 (cf. doc DungeonRank.hp).
    if (num(r.MaxHP)) rank.hp = num(r.MaxHP) + 1;
    const dmgMin = num(r.MinDamage);
    const dmgMax = num(r.MaxDamage);
    if (dmgMin || dmgMax) {
      rank.damage = {};
      if (dmgMin) rank.damage.min = dmgMin;
      if (dmgMax) rank.damage.max = dmgMax;
    }
    const adv = advOf(r);
    if (adv) rank.adv = adv;
    const options = splitCsv(r.OptionID ?? '');
    if (options.length) rank.options = options;
    return rank;
  };

  // 1) Event boss (joint challenge…) : `BossMonsterHP` CSV aligné au CSV
  // `DungeonID`. Saisons triées par StartDate, la plus récente l'emporte.
  // Difficulté : suffixe de la clé du nom (SYS_EVENT_BOSS_DUNGEON_0001_HARD),
  // ordre = position dans le CSV ; groupe de combat = base de la clé (les
  // relances d'un boss réutilisent les mêmes donjons).
  const eventBossRows = [...loadTable('EventBossDungeonTemplet')].sort((a, b) =>
    (a.StartDate ?? '').localeCompare(b.StartDate ?? ''),
  );
  for (const r of eventBossRows) {
    const dids = splitCsv(r.DungeonID);
    const hps = splitCsv(r.BossMonsterHP);
    dids.forEach((did, i) => {
      const d = dungeons[did];
      if (!d) return;
      const hp = num(hps[i]);
      if (hp) d.bossHp = hp;
      const nameId = nameIdOf.get(did) ?? '';
      const m = /^(.*?)_(NORMAL|HARD|VERY_HARD)$/.exec(nameId);
      if (m) {
        d.difficulty = difficultyOf(m[2].toLowerCase(), i + 1);
        d.group = `event_boss:${m[1]}`;
      }
    });
  }

  // 2) Guild raid saisonnier : un donjon PAR grade, PV réels sur la ligne.
  // Le titre du donjon est un TEMPLATE (« … (Stage {0}) ») que le jeu formate
  // avec le grade — on le remplit pareil, dans toutes les langues. Difficulté
  // structurée = stage (Grade) ; groupe de combat = base de la clé du nom
  // (SYS_TITLE_GUILD_RAID_SEASON1_MAIN_1 → …_MAIN — les saisons templetées
  // n'ont pas de suffixe, la clé nue est déjà la base).
  for (const r of loadTable('GuildRaidGradeTemplet')) {
    const d = dungeons[r.BossDungeonID ?? ''];
    if (!d) continue;
    if (num(r.BossMonsterHP)) d.bossHp = num(r.BossMonsterHP);
    const grade = num(r.Grade);
    if (grade) {
      d.name = fillPlaceholder(d.name, grade);
      d.difficulty = { key: `stage_${grade}`, order: grade };
      const nameId = nameIdOf.get(r.BossDungeonID ?? '');
      if (nameId) d.group = `guild_raid:${nameId.replace(/_\d+$/, '')}`;
    }
    // Geas offerts par ce donjon (phase 2 — réfs vers le glossaire `geas`).
    const geasIds = splitCsv(r.BossGeisReward ?? '');
    if (geasIds.length) d.geasRewards = geasIds;
  }

  // 2bis) Poursuite (irregular_chase) : la ligne porte les PV réels du boss,
  // la difficulté (DungeonDifficult 1..3 — slugs curés, les titres du jeu
  // « (Normal)/(Hard)/(Very Hard) » fixent la correspondance), le groupe de
  // combat (GroupID : un boss = 3 difficultés) et le butin victoire/défaite.
  for (const r of loadTable('IrregularChaseTemplet')) {
    const d = dungeons[r.DungeonID ?? ''];
    if (!d) continue;
    if (num(r.BossHP)) d.bossHp = num(r.BossHP);
    const order = num(r.DungeonDifficult);
    if (order)
      d.difficulty = difficultyOf(chaseDifficulties[String(order)] ?? String(order), order);
    if (r.GroupID) d.group = `irregular_chase:${r.GroupID}`;
    const win = resolveReward(r.Reward_Win);
    if (win) d.rewardWin = win;
    const lose = resolveReward(r.Reward_Lose);
    if (lose) d.rewardLose = lose;
  }

  // 2ter) Adventure License (`adventure_mission` = Weekly Conquest,
  // `adventure_challenge` = Promotion Challenge) : le jeu ne groupe RIEN ici, et
  // c'est fidèle au mode — un donjon EST le combat, seul contre lui-même. Son
  // échelle vit dans ses `ranks` (les 15 stages de la V2), pas dans des donjons
  // frères comme la poursuite ou le guild raid.
  //
  // On lui donne quand même son `group` : c'est le SEUL pointeur qu'un guide a
  // vers un combat (`meta.group`), et sans lui la catégorie ne pourrait pas
  // afficher son boss. Un groupe d'une seule rencontre est le cas dégénéré
  // normal — `BossEncounters` masque alors ses onglets de difficulté.
  //
  // À NE PAS FAIRE : regrouper les Promotion Challenge « boostés » (Supreme 4-6)
  // avec leur combat d'origine. Ils rejouent les mêmes kits de boss à des stats
  // plus hautes, mais les PAIRES de monstres diffèrent — ce sont d'autres
  // combats, et la scène partagée (SceneID) est l'arène, pas le combat.
  for (const [id, d] of Object.entries(dungeons)) {
    if (d.mode === 'adventure_mission' || d.mode === 'adventure_challenge')
      d.group = `${d.mode}:${id}`;
  }

  // 3) Challenge d'événement : la saison (EventDungeonTemplet) porte le donjon
  // (`ChallengeDungeonID`) + BossHP, ses paliers vivent dans
  // EventRankChallengeTemplet (GroupID = GroupID de la saison).
  const challengeRanks = groupBy(loadTable('EventRankChallengeTemplet'), 'GroupID');
  for (const r of loadTable('EventDungeonTemplet')) {
    const d = dungeons[r.ChallengeDungeonID ?? ''];
    if (!d) continue;
    if (num(r.BossHP)) d.bossHp = num(r.BossHP);
    const ranks = challengeRanks.get(r.GroupID ?? '');
    if (ranks?.length) d.ranks = ranks.map(rankOf);
  }

  // 4) Guild dungeon (élémentaire) : paliers de dégâts par donjon.
  const guildRanks = groupBy(loadTable('GuildDungeonLevelTemplet'), 'GroupID');
  for (const r of loadTable('GuildDungeonTemplet')) {
    const d = dungeons[r.DungeonID ?? ''];
    const ranks = guildRanks.get(r.GuilDungeonLevelGorupID ?? ''); // typo du jeu
    if (d && ranks?.length) d.ranks = ranks.map(rankOf);
  }

  // 5) World boss : la ligue porte le donjon, ses rangs (D…SSS) portent
  // niveau/PV/adv. Ligues croissantes → la plus récente l'emporte par donjon.
  const worldBossRanks = groupBy(loadTable('WorldBossGradeTemplet'), 'WorldBossLeagueID');
  for (const r of [...loadTable('WorldBossLeagueTemplet')].sort((a, b) => num(a.ID) - num(b.ID))) {
    const d = dungeons[r.DungeonID ?? ''];
    const ranks = worldBossRanks.get(r.ID ?? '');
    if (d && ranks?.length) d.ranks = ranks.map(rankOf);
  }

  // 6) Singularity (Monad Gate) : thème → groupe de donjons ; les rangs
  // (E…SSS, 30 par thème) s'appliquent à tous les donjons du thème.
  const singuRanks = groupBy(loadTable('SingularityGradeTemplet'), 'SingularityID');
  const singuGroups = groupBy(loadTable('SingularityDungeonGroupTemplet'), 'GroupID');
  for (const r of loadTable('SingularityTemplet')) {
    const ranks = singuRanks.get(r.ID ?? '');
    if (!ranks?.length) continue;
    for (const g of singuGroups.get(r.SingularityDungeonGroupID ?? '') ?? []) {
      const d = dungeons[g.DungeonID ?? ''];
      if (d) d.ranks = ranks.map(rankOf);
    }
  }

  // 7) Adventure (licences) : la ligne redéfinit ENTIÈREMENT la rencontre du
  // donjon — niveau réel, PV du boss, adv propres (vérifié : BossHP 518000 =
  // interpolation pure à Lv100, sans adv → les adv du palier remplacent bien
  // ceux du donjon).
  //
  // Le palier EST le STAGE (colonne `Level`, 1-10), et surtout PAS le rang de la
  // ligne : un boss n'entre dans la rotation qu'à partir d'un certain stage
  // (Ziggsaron et Anubis n'existent qu'aux stages 8-9-10 ; Amadeus à partir du 2)
  // et ses stats sont celles de CE stage. Sans le dire, le sélecteur numérote les
  // paliers dans l'ordre et le stage 8 d'Anubis s'affiche « 1 » — ses stats
  // rangées sous un stage où il n'existe même pas.
  //
  // La table REDÉCLARE le même stage sous chaque palier de licence qui le
  // contient (`GroupID`) : 243 lignes pour 175 stages réels, 68 doublons — tous
  // strictement identiques (vérifié : niveau, PV, adv, tour limite). On garde le
  // premier ; sans ça, Masterless afficherait 15 paliers pour 10 stages.
  const seenStage = new Set<string>();
  for (const r of loadTable('AdventureDungeonTemplet')) {
    const d = dungeons[r.DungeonID ?? ''];
    if (!d) continue;
    const stage = num(r.Level);
    const key = `${r.DungeonID}|${stage}`;
    if (seenStage.has(key)) continue;
    seenStage.add(key);
    const rank: DungeonRank = {};
    if (stage) rank.stage = stage;
    if (num(r.DungeonLevel)) rank.level = num(r.DungeonLevel);
    if (num(r.BossHP)) rank.hp = num(r.BossHP);
    const adv = advOf(r);
    if (adv) rank.adv = adv;
    (d.ranks ??= []).push(rank);
  }
  // Du stage le plus BAS au plus HAUT — l'ordre des lignes suit les paliers de
  // licence, pas les stages (Masterless : 1,2,3,2,3,4…).
  for (const id of new Set([...seenStage].map((k) => k.split('|')[0])))
    dungeons[id].ranks?.sort((a, b) => (a.stage ?? 0) - (b.stage ?? 0));

  // 8) Exploration : niveau du stage + adv propres par spot de combat.
  const seenExpl = new Set<string>();
  for (const r of loadTable('ExplorationStageTemplet')) {
    if (r.SpotType !== 'ST_BATTLE') continue;
    const d = dungeons[r.SpotValue ?? ''];
    if (!d) continue;
    const rank: DungeonRank = {};
    if (num(r.ExplorationStageLevel)) rank.level = num(r.ExplorationStageLevel);
    const adv = advOf(r);
    if (adv) rank.adv = adv;
    const key = `${r.SpotValue}|${JSON.stringify(rank)}`;
    if (seenExpl.has(key)) continue;
    seenExpl.add(key);
    (d.ranks ??= []).push(rank);
  }

  // --- invocations (heuristique texte, cf. en-tête) ------------------------------

  // Propriétaires de chaque skill monstre (un skill peut être partagé).
  const ownersBySkill = new Map<string, string[]>();
  const monsterRows = loadTable('MonsterTemplet');
  for (const r of monsterRows) {
    for (let i = 1; i <= 23; i++) {
      const sid = r[`Skill_${i}`];
      if (!sid) continue;
      const list = ownersBySkill.get(sid);
      if (list) list.push(r.ID);
      else ownersBySkill.set(sid, [r.ID]);
    }
  }

  // Skills d'invocation : desc EN contenant « summon ».
  const summonSkills: Array<{ desc: string; owners: string[] }> = [];
  for (const s of loadTable('MonsterSkillTemplet')) {
    const key = splitCsv(s.DescID ?? '')[0];
    if (!key) continue;
    const en = resolveText(tskill, key).en.toLowerCase();
    if (!/\bsummons?\b/.test(en)) continue;
    const owners = ownersBySkill.get(s.ID);
    if (owners?.length) summonSkills.push({ desc: en, owners });
  }

  // Monstres jamais spawnés → rattachés par nom aux skills d'invocation.
  for (const r of monsterRows) {
    if (monsters[r.ID]) continue;
    const name = resolveText(tchar, r.NameID).en.toLowerCase().trim();
    if (name.length < 4) continue;
    const words = name.split(/\s+/);
    // Nom complet, puis sans le premier mot (« Deformed Inferior Core » →
    // « inferior core ») — jamais en dessous de 6 caractères (faux positifs).
    const variants = [name, words.length > 1 ? words.slice(1).join(' ') : ''].filter(
      (v) => v.length >= 6 || v === name,
    );
    const by = new Set<string>();
    for (const sk of summonSkills) {
      if (variants.some((v) => v && sk.desc.includes(v))) {
        for (const o of sk.owners) if (o !== r.ID) by.add(o);
      }
    }
    if (by.size && by.size <= 12) {
      monsters[r.ID] = { spawns: [], summonedBy: [...by].sort() };
    }
  }

  // --- liens de kit STRUCTURELS (tooltips → id de monstre) ------------------------

  // Les skills des adds/variantes portent dans `BuffToolTip` des réfs dont l'id
  // est un ID DE MONSTRE (entrées « marqueur » vides de BuffToolTipTemplet,
  // directes ou via ToolTipGroupTemplet) — elles pointent le boss CANONIQUE de
  // la rencontre (ex. Primordial Sentinel → Ragnakeus). C'est le seul lien
  // structurel entre monstres dans les tables (vérifié : pas de BT_SUMMON) —
  // on s'en sert pour localiser les monstres sans spawn, dans les deux sens.
  const monsterIds = new Set(monsterRows.map((r) => r.ID));
  const groupMembers = new Map(
    loadTable('ToolTipGroupTemplet').map((g) => [g.ID, splitCsv(g.ToolTipMember ?? '')]),
  );
  const pairs = new Set<string>();
  for (const lv of loadTable('MonsterSkillLevelTemplet')) {
    const referenced = new Set<string>();
    for (const t of splitCsv(lv.BuffToolTip ?? '')) {
      if (monsterIds.has(t)) referenced.add(t);
      for (const m of groupMembers.get(t) ?? []) if (monsterIds.has(m)) referenced.add(m);
    }
    if (!referenced.size) continue;
    for (const o of ownersBySkill.get(lv.SkillID) ?? []) {
      for (const target of referenced) if (o !== target) pairs.add(`${o}|${target}`);
    }
  }
  const partnersOf = new Map<string, Set<string>>();
  for (const p of pairs) {
    const [a, b] = p.split('|');
    (partnersOf.get(a) ?? partnersOf.set(a, new Set()).get(a)!).add(b);
    (partnersOf.get(b) ?? partnersOf.set(b, new Set()).get(b)!).add(a);
  }
  for (const [id, partners] of partnersOf) {
    if (monsters[id]?.spawns.length) continue;
    const located = [...partners].filter((p) => monsters[p]?.spawns.length).sort();
    if (!located.length) continue;
    const entry = (monsters[id] ??= { spawns: [] });
    entry.linkedTo = located;
  }

  // Tri stable des spawns (donjon puis niveau) : le champ est embarqué dans
  // l'entité monstre committée — un réordonnancement de table ne doit pas
  // produire de faux diff.
  for (const e of Object.values(monsters)) {
    e.spawns.sort((a, b) => a.dungeon.localeCompare(b.dungeon) || a.level - b.level);
  }

  // Placeholders `{0}` restés sans valeur (aucune surcharge par mode n'a de
  // numéro pour ce donjon) : on retire le segment plutôt que d'afficher le
  // template brut.
  for (const d of Object.values(dungeons)) {
    if (Object.values(d.name).some((s) => s.includes('{0}'))) {
      d.name = stripUnfilledPlaceholder(d.name);
    }
  }

  // Passifs de PALIER : chaque `OptionID` est un BUFF (BuffTemplet) — résolu
  // ici une fois pour toutes (nom localisé via le tooltip du buff, stat/type
  // bruts sinon) pour que le site affiche les rangs sans lire les tables.
  const rankOptions: Record<string, RankOption> = {};
  const buffs = loadBuffIndex();
  const tooltipById = indexBy(loadTable('BuffToolTipTemplet'));
  for (const d of Object.values(dungeons)) {
    for (const rk of d.ranks ?? []) {
      for (const o of rk.options ?? []) {
        if (rankOptions[o]) continue;
        const row = buffs.get(o)?.[0];
        // GARANTIE : toute clé citée par un `ranks[].options` existe ici —
        // un OptionID sans buff résoluble sort en stub `unknown` plutôt que
        // de manquer silencieusement au glossaire.
        if (!row) {
          rankOptions[o] = { type: 'unknown' };
          continue;
        }
        const opt: RankOption = { type: row.Type ?? '' };
        const stat = statSlug(row.StatType);
        if (stat) opt.stat = stat;
        const v = num(row.Value);
        if (v) opt.value = v;
        if (bool(row.IsIgnoreInterruption)) opt.irremovable = true;
        if (row.ToolTipID) {
          opt.tooltip = row.ToolTipID;
          const nameId = tooltipById.get(row.ToolTipID)?.NameID;
          if (nameId) {
            const name = resolveText(tsys, nameId);
            const named = name.en ? name : resolveText(tskill, nameId);
            if (named.en) opt.name = named;
          }
        }
        rankOptions[o] = opt;
      }
    }
  }

  // GEAS du guild raid (phase 2, pas encore ouvert in-game) : tout le
  // catalogue sort (107 — le jeu n'en câble que 103 via BossGeisReward), la
  // description du jeu est ÉMISE RÉSOLUE : les placeholders `[buff_c/v/t_
  // <id>]` (minuscules, format des skills) sont remplis avec les valeurs des
  // buffs geis au niveau 1 — pas de niveaux sur ces buffs, donc pas de vars
  // par palier à transporter.
  const geas: Record<string, GuildRaidGeas> = {};
  const fillGeasPlaceholders = (dict: LangDict): LangDict => {
    const out = { ...dict };
    for (const lang of Object.keys(out) as Array<keyof LangDict>) {
      out[lang] = (out[lang] ?? '').replace(
        /\[buff_([cvt])_(.+?)\]/gi,
        (_m, kind: string, bid: string) => {
          const vars = skillBuffVars(buffs, bid, 1);
          const k = kind.toLowerCase();
          return (k === 'c' ? vars.c : k === 't' ? vars.t : vars.v) ?? '?';
        },
      );
    }
    return out;
  };
  for (const r of loadTable('GuildRaidGeisTemplet')) {
    if (!r.ID) continue;
    const desc = fillGeasPlaceholders(resolveText(tskill, r.NameID));
    const values = splitCsv(r.Value ?? '');
    geas[r.ID] = {
      desc,
      ...(r.IconName ? { icon: r.IconName } : {}),
      positive: r.IsPositive === '1',
      grade: num(r.Grade),
      type: slugEnum(r.GeisType, 0),
      points: num(r.GuildRaidPointIncrease),
      ...(values.length ? { values } : {}),
    };
  }

  // Quirks « boss » (système Gift, tables CharacterAwakening*) : nœud → groupe
  // de niveaux → BuffID → BuffTemplet. On retient les MALUS inconditionnels
  // portés par la cible (BT_STAT_PREMIUM, Target=ME, valeur négative) — les
  // nœuds héros sont des BONUS ou des buffs conditionnels (élémentaires).
  // Aujourd'hui : Awakening_Boss_{Avoid,Buff_RESIST}_Down_1/2 → EFF −10 %,
  // RES −10 %.
  const bossQuirkMods: Record<string, number> = {};
  const quirkLevels = groupBy(loadTable('CharacterAwakeningLevelTemplet'), 'AwakeningLevelGroupID');
  for (const n of loadTable('CharacterAwakeningNodeTemplet')) {
    for (const lv of quirkLevels.get(n.AwakeningLevelGroupID ?? '') ?? []) {
      for (const bid of splitCsv(lv.BuffID ?? '')) {
        for (const br of buffs.get(bid) ?? []) {
          if (br.Type !== 'BT_STAT_PREMIUM' || br.TargetType !== 'ME') continue;
          if ((br.BuffConditionType ?? 'NONE') !== 'NONE') continue;
          const v = num(br.Value);
          if (!v || v >= 0) continue;
          const slug = statSlug(br.StatType);
          if (!slug) continue;
          bossQuirkMods[slug] = (bossQuirkMods[slug] ?? 0) + v;
        }
      }
    }
  }

  // Lacunes de butin : UNE ligne agrégée, seulement quand la liste change.
  const gapsSig =
    [...missingRewardIds].sort().join(',') + '§' + [...typelessGroups].sort().join(',');
  if (gapsSig !== '§' && gapsSig !== lastRewardGapsSig) {
    const span = (s: Set<string>) => {
      const ids = [...s].sort();
      return ids.length > 3 ? `${ids[0]}…${ids[ids.length - 1]}` : ids.join(', ');
    };
    const parts: string[] = [];
    if (typelessGroups.size)
      parts.push(
        `${typelessGroups.size} ligne(s) de RewardGroup sans TypeID (${span(typelessGroups)})`,
      );
    if (missingRewardIds.size)
      parts.push(
        `${missingRewardIds.size} RewardID absent(s) de RewardTemplet (${span(missingRewardIds)})`,
      );
    console.warn(`⚠ encounters : butin partiellement ignoré — ${parts.join(' ; ')}.`);
  }
  lastRewardGapsSig = gapsSig;

  cache = {
    data: { modes, rankOptions, bossQuirkMods, rewardTables, geas, dungeons, monsters },
    stamp,
  };
  return cache.data;
}
