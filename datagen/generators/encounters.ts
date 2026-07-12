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
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { LangDict } from '../lib/lang';
import { loadBuffIndex } from '../lib/buff';
import { statSlug } from '../lib/effects';
import { slugEnum } from '../lib/enums';
import { loadTextIndex, resolveText } from '../lib/text';
import { groupBy, indexBy, loadTable, num, splitCsv, type Row } from '../lib/tables';

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

/** Un donjon/stage où spawne au moins un monstre. */
export interface DungeonRef {
  /** Mode de contenu (slug de DungeonMode : normal/guild_raid_main_boss/…). */
  mode: string;
  /** Titre localisé du stage (difficulté incluse : « … (Stage 1) », « … Hard »). */
  name: LangDict;
  /** Région/chapitre (AreaTemplet), si résolue. */
  area?: LangDict;
  /**
   * Difficulté du donjon quand elle ne vit PAS dans le nom : world boss
   * (les 4 donjons d'un groupe partagent le même nom, la ligue tranche —
   * `WorldBossLeagueTemplet.LeagueName`, « Beginner/Junior/Senior League »…).
   * JC/poursuite/guild raid portent la leur dans `name`.
   */
  difficulty?: LangDict;
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

/** Titre localisé d'un mode `DM_X`, ou `undefined` (le slug reste affichable). */
function resolveModeTitle(
  rawMode: string,
  tsys: Map<string, LangDict>,
  keysByNorm: Map<string, string>,
  contentTitles: Array<{ norm: string; tokens: string[]; text: LangDict }>,
): LangDict | undefined {
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
        if (plain?.en && title.en.startsWith(plain.en) && title.en !== plain.en) return plain;
      }
      return title;
    }
  }

  // 2) ContentLockTemplet : meilleur recoupement de tokens distinctifs.
  let best: { score: number; text: LangDict } | undefined;
  for (const c of contentTitles) {
    let score = 0;
    for (const t of tokens) {
      if (MODE_STOP_TOKENS.has(t)) continue;
      if (c.tokens.includes(t) || (t.length >= 5 && c.norm.includes(t))) score += t.length;
    }
    if (score > 0 && (!best || score > best.score)) best = { score, text: c.text };
  }
  return best?.text;
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

/**
 * Mémoïsé : appelé par la spec monstre (chaque monstre embarque ses spawns),
 * l'orchestrateur (dictionnaires modes/donjons) et l'admin — même processus,
 * mêmes tables (elles-mêmes cachées par `loadTable`).
 */
let cache: EncountersData | undefined;

export function buildEncounters(): EncountersData {
  if (cache) return cache;
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
  for (const c of wbCurrent.values()) for (const d of c.dungeons) currentWbDungeons.add(d);
  const deadWbDungeons = new Set<string>();
  const wbLeague = new Map<string, { chain: string[]; league?: string }>();
  for (const r of leagueRows) {
    if (!r.DungeonID) continue;
    if (!currentWbDungeons.has(r.DungeonID)) {
      deadWbDungeons.add(r.DungeonID);
      continue;
    }
    // Lignes croissantes → la rotation la plus récente l'emporte.
    wbLeague.set(r.DungeonID, {
      chain: splitCsv(r.ChangeSpawnGroupID ?? ''),
      ...(r.LeagueName ? { league: r.LeagueName } : {}),
    });
  }

  const modes: Record<string, LangDict> = {};
  const dungeons: Record<string, DungeonRef> = {};
  const monsters: Record<string, MonsterEncounters> = {};

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
  const contentTitles: Array<{ norm: string; tokens: string[]; text: LangDict }> = [];
  for (const c of loadTable('ContentLockTemplet')) {
    if (!c.ContentType || !c.TextID || c.TextID === '0') continue;
    const text = resolveText(tsys, c.TextID);
    if (!text.en) continue;
    contentTitles.push({
      norm: normKey(c.ContentType),
      tokens: c.ContentType.split('_'),
      text: stripBrackets(text),
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
  const curatedPath = resolve('data/curated/mode-titles.json');
  if (existsSync(curatedPath)) {
    const curated = JSON.parse(readFileSync(curatedPath, 'utf8')) as {
      titles?: Record<string, string>;
      ignore?: string[];
    };
    Object.assign(curatedTitles, curated.titles ?? {});
    for (const m of curated.ignore ?? []) ignoredModes.add(m);
  }

  for (const d of loadTable('DungeonTemplet')) {
    if (deadWbDungeons.has(d.ID)) continue;
    const groupIds = [...new Set([...spawnGroupIds(d), ...(wbLeague.get(d.ID)?.chain ?? [])])];
    if (!groupIds.length) continue;

    // Monstres du donjon, dédupliqués par (monstre, niveau) — plusieurs waves
    // peuvent répéter le même mob au même niveau.
    const seen = new Set<string>();
    const found: Array<{ id: string; level: number; hpLines?: number }> = [];
    for (const g of groupIds) {
      for (const w of spawnsByGroup.get(g) ?? []) {
        for (let i = 0; i < 4; i++) {
          for (const mid of splitCsv(w[`ID${i}`] ?? '')) {
            const level = num(w[`Level${i}`]);
            const key = `${mid}|${level}`;
            if (seen.has(key)) continue;
            seen.add(key);
            const hpLines = num(w.HPLineCount);
            found.push({ id: mid, level, ...(hpLines > 1 ? { hpLines } : {}) });
          }
        }
      }
    }
    if (!found.length) continue;

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
        : resolveModeTitle(d.DungeonMode, tsys, keysByNorm, contentTitles);
      if (title) modes[mode] = title;
    }
    const ref: DungeonRef = { mode, name: resolveText(tsys, d.NameID) };
    if (areaRow?.NameID) {
      const area = resolveText(tsys, areaRow.NameID);
      if (area.en) ref.area = area;
    }
    // Story : saison/épisode de la zone (AreaTemplet) — la sidebar les affiche.
    if (mode === 'normal' || mode === 'normal_hard') {
      if (num(areaRow?.SeasonID)) ref.season = num(areaRow!.SeasonID);
      if (num(areaRow?.EpisodeNum)) ref.episode = num(areaRow!.EpisodeNum);
    }
    const leagueKey = wbLeague.get(d.ID)?.league;
    if (leagueKey) {
      const league = resolveText(tsys, leagueKey);
      if (league.en) ref.difficulty = league;
    }
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
  const eventBossRows = [...loadTable('EventBossDungeonTemplet')].sort((a, b) =>
    (a.StartDate ?? '').localeCompare(b.StartDate ?? ''),
  );
  for (const r of eventBossRows) {
    const dids = splitCsv(r.DungeonID);
    const hps = splitCsv(r.BossMonsterHP);
    dids.forEach((did, i) => {
      const hp = num(hps[i]);
      if (hp && dungeons[did]) dungeons[did].bossHp = hp;
    });
  }

  // 2) Guild raid saisonnier : un donjon PAR grade, PV réels sur la ligne.
  // Le titre du donjon est un TEMPLATE (« … (Stage {0}) ») que le jeu formate
  // avec le grade — on le remplit pareil, dans toutes les langues.
  for (const r of loadTable('GuildRaidGradeTemplet')) {
    const d = dungeons[r.BossDungeonID ?? ''];
    if (!d) continue;
    if (num(r.BossMonsterHP)) d.bossHp = num(r.BossMonsterHP);
    if (num(r.Grade)) d.name = fillPlaceholder(d.name, num(r.Grade));
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
  for (const r of loadTable('AdventureDungeonTemplet')) {
    const d = dungeons[r.DungeonID ?? ''];
    if (!d) continue;
    const rank: DungeonRank = {};
    if (num(r.DungeonLevel)) rank.level = num(r.DungeonLevel);
    if (num(r.BossHP)) rank.hp = num(r.BossHP);
    const adv = advOf(r);
    if (adv) rank.adv = adv;
    (d.ranks ??= []).push(rank);
  }

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
        if (!row) continue;
        const opt: RankOption = { type: row.Type ?? '' };
        const stat = statSlug(row.StatType);
        if (stat) opt.stat = stat;
        const v = num(row.Value);
        if (v) opt.value = v;
        if (row.IsIgnoreInterruption === 'True') opt.irremovable = true;
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

  cache = { modes, rankOptions, bossQuirkMods, dungeons, monsters };
  return cache;
}
