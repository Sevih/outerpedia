import { getT } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { characterDisplayName, getAllCharacters } from '@/lib/data/characters';
import {
  fillPlaceholders,
  getAmuletFamilies,
  getEEViews,
  getSetViews,
  getTalismanFamilies,
  getWeaponFamilies,
  gearPassivesText,
  passiveTextAt,
  resolvePassives,
  type GearFamily,
} from '@/lib/data/equipment';
import {
  difficultyLabel,
  encounterSpawnContexts,
  modeLabel,
  type Encounter,
} from '@/lib/data/encounters';
import { getMonster } from '@/lib/data/monsters';
import { getTranscendTiers } from '@/lib/data/char-progression';
import { statAt } from '@/lib/monster-stats';
import { statName } from '@/lib/data/stat-glossary';
import { dedupSkills } from '@/lib/skill-view';
import { img } from '@/lib/images';
import type {
  BuffValues,
  DamageScalingFile,
  EncountersFile,
  LangDict,
  QuirksData,
  Skill,
} from '@contracts';
import skillsData from '@data/generated/skills.json';
import scalingData from '@data/generated/damage-scaling.json';
import passivesData from '@data/generated/equipment/passives.json';
import eeRawData from '@data/generated/equipment/ee.json';
import poolsData from '@data/generated/equipment/pools.json';
import talismanRawData from '@data/generated/equipment/talisman.json';
import setsRawData from '@data/generated/equipment/sets.json';
import glossariesData from '@data/generated/glossaries.json';
import encountersData from '@data/generated/encounters.json';
import quirksRaw from '@data/generated/quirks.json';
import {
  DamageCalculatorBrowser,
  type DcBuffOption,
  type DcChar,
  type DcEE,
  type DcGear,
  type DcLabels,
  type DcSet,
  type DcQuirkGroup,
  type DcSkillRow,
  type DcStatField,
  type DcTalisman,
  type DcTarget,
} from './DamageCalculatorBrowser';

/**
 * Damage Calculator — wrapper SERVEUR, phase UI SEULE (le moteur `src/lib/damage`
 * n'est PAS branché ici : aucune valeur calculée ne sort de cette page tant que
 * les extracteurs damage n'existent pas — cf. docs/specs/damage-report-inputs.md).
 * Le wrapper matérialise tout ce que l'UI montre de RÉEL : roster, kit par perso
 * (S1/S2/S3/Chain, flag `offensive` de la donnée), passifs d'équipement par
 * palier de breakthrough, EE par perso, et TOUS les donjons peuplés
 * d'`encounters.json` comme presets de cible. Le client ne localise rien.
 *
 * Décisions produit (Sevih, 26/07/2026) :
 *   - stats SAISIES depuis la fiche du jeu → seuls comptent les passifs que la
 *     fiche NE porte PAS : sets à effet de combat, arme/accessoire, EE,
 *     Rogue's Charm, et les QUIRKS de compte (réglage localStorage) ;
 *   - monad hors périmètre.
 */

const SKILLS = skillsData as unknown as Record<string, Skill>;
const SCALING = scalingData as unknown as DamageScalingFile;
const DUNGEONS = encountersData as unknown as EncountersFile;
const QUIRKS = quirksRaw as unknown as QuirksData;

interface PassiveEntry {
  name: LangDict;
  desc: LangDict;
  values: BuffValues[];
  levels: number[];
}
const PASSIVES = passivesData as unknown as Record<string, PassiveEntry>;

// Mains d'EE (pools résolus) : seuls `buff`/`levels`/`label` servent ici.
interface PoolRow {
  buff?: string;
  levels?: number[];
  label?: LangDict;
}
const EE_RAW = eeRawData as unknown as Record<string, { options: string[] }>;
const POOLS = poolsData as unknown as Record<string, PoolRow[]>;
const TALISMAN_RAW = talismanRawData as unknown as Record<string, { options?: string[] }>;

/**
 * Main stats possibles d'un TALISMAN — token de la clé de buff du jeu
 * (`BID_ITEM_STAT_OOPARTS_<STAT>_<palier>`, stable) → slug du glossaire des
 * noms. La main du talisman de chaque ALLIÉ est une entrée du moteur
 * (décision Sevih 27/07/2026).
 */
const TALIS_STAT_SLUG: Record<string, string> = {
  ATK: 'atk',
  DEF: 'def',
  HP: 'hp',
  CRI: 'critical_rate',
  CRI_DMG: 'critical_dmg_rate',
  DMG_REDUCE: 'dmg_reduce_rate',
  DMG: 'dmg_boost',
  BUFF_CHANCE: 'buff_chance',
  BUF_RESIST: 'buff_resist',
};

// Sets bruts : la CLASSIFICATION (« proportional to missing Health ») se fait
// sur le texte EN — l'affichage reste localisé via getSetViews.
interface SetEffectRaw {
  desc?: LangDict;
}
const SETS_RAW = setsRawData as unknown as Record<
  string,
  { tiers: { '2p'?: SetEffectRaw | null; '4p'?: SetEffectRaw | null }[] }
>;
/** Effet de set fonction des PV manquants → l'UI demande les PV actuels. */
const HP_SCALED_SET = /missing Health/i;

// Glossaire des effets : les buffs/débuffs STANDARDISÉS du jeu (nom, desc à
// magnitude fixe, icône IG_Buff_*).
const GLOSS = glossariesData as unknown as {
  effects: Record<string, { name: LangDict; desc: LangDict; icon: string }>;
  effectByKey: { buff: Record<string, string>; debuff: Record<string, string> };
  /** Noms localisés des éléments (niveaux de cascade du picker de cible). */
  elements: Record<string, LangDict>;
};

/**
 * Buffs/débuffs de scénario PROPOSÉS : uniquement ceux qui pèsent sur les
 * dégâts (décision Sevih 27/07/2026 — « atk30, def50, cdd50, pen30… »), en
 * QUATRE groupes : buffs/débuffs du lanceur, buffs/débuffs de la cible.
 * `stat` = slug de la fiche : le chip n'apparaît que si la stat est pertinente
 * pour l'attaquant choisi (même filtre que la saisie des stats) — un buff DEF
 * sur un ATK-scaler n'est jamais proposé.
 */
type FxKey = { key: string; from: string; stat?: string };
const ATTACKER_BUFFS: FxKey[] = [
  { key: 'atk', from: 'BT_STAT|ST_ATK', stat: 'atk' },
  { key: 'def', from: 'BT_STAT|ST_DEF', stat: 'def' },
  { key: 'chd', from: 'BT_STAT|ST_CRITICAL_DMG_RATE', stat: 'critical_dmg' },
  { key: 'pen', from: 'BT_STAT|ST_PIERCE_POWER_RATE', stat: 'pierce_power_rate' },
  { key: 'spd', from: 'BT_STAT|ST_SPEED', stat: 'speed' },
  { key: 'eff', from: 'BT_STAT|ST_BUFF_CHANCE', stat: 'buff_chance' },
];
// Miroir débuff : les MÊMES stats du lanceur, réduites (mêmes conditions).
const ATTACKER_DEBUFFS: FxKey[] = [
  { key: 'atk_down', from: 'BT_STAT|ST_ATK', stat: 'atk' },
  { key: 'def_down', from: 'BT_STAT|ST_DEF', stat: 'def' },
  { key: 'chd_down', from: 'BT_STAT|ST_CRITICAL_DMG_RATE', stat: 'critical_dmg' },
  // `BT_STAT|ST_PIERCE_POWER_RATE` côté débuff = « Spatial Distortion » (boss
  // spécifique) — la clé générique du glossaire porte le bon nom.
  { key: 'pen_down', from: 'REDUCED_PENETRATION', stat: 'pierce_power_rate' },
  { key: 'spd_down', from: 'BT_STAT|ST_SPEED', stat: 'speed' },
  { key: 'eff_down', from: 'BT_STAT|ST_BUFF_CHANCE', stat: 'buff_chance' },
];
// Côté CIBLE : la DEF et la réduction de dégâts pèsent toujours sur le calcul ;
// la Résilience ne sert qu'aux kits qui POSENT des debuffs (EFF).
const TARGET_BUFFS: FxKey[] = [
  { key: 't_def', from: 'BT_STAT|ST_DEF' },
  { key: 't_dmg_red', from: 'REDUCED_DAMAGE_TAKEN' },
  { key: 't_res', from: 'BT_STAT|ST_BUFF_RESIST', stat: 'buff_chance' },
];
const TARGET_DEBUFFS: FxKey[] = [
  { key: 't_def_down', from: 'BT_STAT|ST_DEF' },
  { key: 't_dmg_taken', from: 'BT_DMG_REDUCE' },
  // Marked : « takes increased damage » — même famille d'impact.
  { key: 't_marked', from: 'BT_MARKING' },
  { key: 't_res_down', from: 'BT_STAT|ST_BUFF_RESIST', stat: 'buff_chance' },
];

/**
 * Main d'EE « dégâts vs élément » — la SEULE stat d'EE qui touche aux dégâts
 * sans figurer sur la fiche perso (décision Sevih 27/07/2026) : l'UI demande
 * alors le niveau de l'EE (+0..+10) et affiche le montant du palier.
 */
const EE_DMG_MAIN = /^BID_CEQUIP_MAIN_DMG_(FIRE|WATER|EARTH|LIGHT|DARK)$/;

/** Slots du kit. Chain/dual : hors périmètre du calc (décision Sevih 26/07/2026). */
const KIT_SLOTS: { type: string; slot: string }[] = [
  { type: 'first', slot: 'S1' },
  { type: 'second', slot: 'S2' },
  { type: 'ultimate', slot: 'S3' },
];

/**
 * RÉFÉRENTIEL des stats de la fiche personnage (ordre du panneau détaillé du
 * jeu, `STEP_STAT_KEYS`), moins ce qui ne sert JAMAIS aux dégâts de
 * l'attaquant : lignes défensives (DMG RED %, CDMG RED %) et RES (décision
 * Sevih 26/07/2026). `pierce_power_rate` et `dmg_boost` sont bien des lignes
 * de la fiche — le Penetration Set est donc capturé par la saisie, pas par un
 * passif (confirmé Sevih 26/07/2026). Le lifesteal est IGNORÉ : il ne touche
 * pas aux dégâts. Ce tableau fixe l'ordre et l'unité ; ce qui est réellement
 * DEMANDÉ par perso vient de `statKeysFor`.
 */
const SHEET_STATS: { slug: string; percent: boolean }[] = [
  { slug: 'atk', percent: false },
  { slug: 'def', percent: false },
  { slug: 'hp', percent: false },
  { slug: 'speed', percent: false },
  { slug: 'critical_rate', percent: true },
  { slug: 'critical_dmg', percent: true },
  { slug: 'pierce_power_rate', percent: true },
  { slug: 'dmg_boost', percent: true },
  { slug: 'buff_chance', percent: false },
];

/**
 * Stats de la fiche à SAISIR pour un perso — on ne demande QUE ce qui sert à
 * SES dégâts (décision Sevih 26/07/2026) : sa stat d'attaque (ATK, ou HP/DEF si
 * son kit la swap), les multiplicateurs universels (CHD, PEN %, DMG UP %), et
 * les scalings annexes dérivés de son kit (`damage-scaling.json`). La CHC n'est
 * demandée que si le kit scale dessus : le crit du rapport est un interrupteur,
 * pas un tirage. La RES ne sert jamais à l'attaquant.
 */
function statKeysFor(id: string): string[] {
  const s = SCALING[id];
  const keys = new Set<string>([
    s?.attackStat ?? 'atk',
    'critical_dmg',
    'pierce_power_rate',
    'dmg_boost',
  ]);
  for (const b of s?.bonusStats ?? []) keys.add(b);
  if (s?.lostHpDmg) keys.add('hp');
  if (s?.dot) keys.add('buff_chance');
  // Intersection avec la fiche, dans son ordre (écarte p. ex. `get_gold_rate`).
  return SHEET_STATS.filter((f) => keys.has(f.slug)).map((f) => f.slug);
}

/**
 * Seuls les sets à passif de COMBAT comptent : les sets de stats pures (Attack,
 * Critical Hit…) sont déjà dans les stats de la fiche saisie (décision Sevih
 * 26/07/2026). Ids de `sets.json` : Revenge, Patience, Pulverization,
 * Swiftness, Weakness, Augmentation.
 */
const DAMAGE_SET_IDS = new Set(['15', '16', '17', '19', '20', '21']);

/**
 * Les SKIRMISH du Monad Gate restent hors périmètre ; les boss « Dimensional
 * Singularity » (monad_battle_2, libellé du glossaire des modes) sont des
 * cibles réelles (Sevih 27/07/2026 — révise la décision du 26/07).
 */
const EXCLUDED_MODES = new Set(['monad_battle_1']);

/**
 * Catégories de quirks PERTINENTES pour les dégâts → clé i18n de leur libellé.
 * `utility` (économie/farm) est écartée : aucun nœud de combat.
 */
const QUIRK_CATEGORY_KEY: Record<string, string> = {
  pve: 'settings.quirk_counteract',
  class: 'settings.quirk_class',
  elemental: 'settings.quirk_element',
  adventure: 'settings.quirk_adventure_license',
};

/**
 * Nœuds de quirk retenus : OFFENSIFS uniquement (décision Sevih 26/07/2026 —
 * ce qui s'applique à l'ATTAQUANT, pas au défenseur), et hors hausses de stats
 * inconditionnelles (déjà dans la fiche saisie). Sur les données réelles :
 *   - dégâts accrus (vs Break / boss / Skill Chain / avantage élémentaire,
 *     « damage of Mage heroes », boss d'Adventure License) ;
 *   - Reduces Resilience of the Boss (fait tenir NOS debuffs) ;
 *   - miss chance réduite (la branche Esquivé du rapport) ;
 *   - ATK / Effectiveness « of heroes » (bonus conditionnels au mode
 *     Adventure License — absents de la fiche).
 * Écartés : reduces damage taken, Resilience conditionnelle, Reduces
 * Effectiveness of the Boss, Priority, stats défensives — côté défenseur.
 * Classification sur le texte EN ; l'affichage reste localisé.
 */
// SENSIBLE à la casse : « damage » minuscule = dégâts infligés ; « Critical
// Damage » (majuscule) est la stat plate de la fiche, qui ne doit PAS matcher.
const OFFENSIVE_QUIRK_DESC =
  /[Ii]ncreases [^.]*damage|Reduces Resilience of the Boss|[Rr]educes miss chance|increases (Attack|Effectiveness) of heroes/;

export default async function DamageCalculator({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const k = (s: string) => `tools.damage-calculator.${s}` as Parameters<typeof t>[0];

  // Roster + kit par perso (types de skills depuis la donnée, jamais devinés).
  const chars: DcChar[] = [];
  const kits: Record<string, DcSkillRow[]> = {};
  for (const c of getAllCharacters()) {
    const skills = dedupSkills(c.skills.map((id) => SKILLS[id]).filter(Boolean));
    const rows: DcSkillRow[] = [];
    for (const { type, slot } of KIT_SLOTS) {
      const sk = skills.find((s) => s.type === type);
      if (!sk) continue;
      rows.push({
        slot,
        name: lRec(sk.name, lang) || sk.name.en,
        ...(sk.icon ? { iconSrc: img.skill(sk.icon) } : {}),
        offensive: sk.offensive,
        // Multi-cible (RangeType all/double) : conditionne la saisie du nombre
        // de cibles touchées (décroissance AoE) — inutile sur un kit mono-cible.
        ...(sk.range === 'all' || sk.range === 'double' ? { aoe: true } : {}),
        maxLevel: sk.maxLevel,
      });
    }
    if (!rows.length) continue;
    kits[c.id] = rows;
    chars.push({
      id: c.id,
      label: characterDisplayName(c, lang),
      element: c.element,
      cls: c.class,
      rarity: c.rarity,
      statKeys: statKeysFor(c.id),
      // Paliers de transcendance RÉELS du perso (barème de sa rareté ou
      // override), forme compacte — le client reconstruit la rangée d'étoiles
      // via `transcendStarRow` (même slider que la fiche perso, Sevih
      // 27/07/2026).
      transcend: getTranscendTiers(c, lang).map(({ label, star, color }) => ({
        label,
        star,
        color,
      })),
    });
  }
  chars.sort((a, b) => b.rarity - a.rarity || a.label.localeCompare(b.label));

  // Passifs d'arme/accessoire par palier de breakthrough (T0..T4 = values 1..5),
  // avec les VARIANTES PAR CLASSE quand la famille en a (Briareos/Gorgon).
  // Valeurs colorées (balises <color>) : le client rend en GameText.
  const tiersOf = (refs: GearFamily['passives']): string[] =>
    [1, 2, 3, 4, 5].map((tier) => passiveTextAt(refs, tier, lang, true) ?? '');
  /** Icône d'effet du passif (overlay de tuile « comme partout »). */
  const effectIconOf = (refs: GearFamily['passives']): string | undefined =>
    resolvePassives(refs, lang)[0]?.icon || undefined;
  const gearOf = (families: GearFamily[]): DcGear[] =>
    families
      .filter((f) => f.passives.length)
      .map((f) => ({
        slug: f.slug,
        label: lRec(f.name, lang) || f.name.en,
        icon: f.icon,
        grade: f.grade,
        // Tuile « comme partout » (/equipment, gear reco) : étoiles du haut de
        // famille + icône d'effet du passif en overlay.
        star: f.stars[f.stars.length - 1] ?? 0,
        ...(effectIconOf(f.passives) ? { overlayIcon: effectIconOf(f.passives) } : {}),
        classLimits: f.classLimits,
        tiers: tiersOf(f.passives),
        ...(f.classPassives
          ? {
              classTiers: Object.fromEntries(
                f.classPassives.map((cp) => [cp.classLimit, tiersOf(cp.passives)]),
              ),
            }
          : {}),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  const weapons = gearOf(getWeaponFamilies());
  const amulets = gearOf(getAmuletFamilies());

  const sets: DcSet[] = getSetViews(lang)
    .filter((s) => DAMAGE_SET_IDS.has(s.id))
    .map((s) => ({
      id: s.id,
      label: lRec(s.name, lang) || s.name.en,
      icon: s.icon,
      p2: s.tiers.map((tier) => tier.p2 ?? null),
      p4: s.tiers.map((tier) => tier.p4 ?? null),
      // Effet fonction des PV manquants (Revenge/Patience/Swiftness) → l'UI
      // demande les PV actuels, qui pèsent sur les stats finales.
      ...(SETS_RAW[s.id]?.tiers.some((t) =>
        [t['2p'], t['4p']].some((e) => e?.desc?.en && HP_SCALED_SET.test(e.desc.en)),
      )
        ? { hpScaled: true }
        : {}),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // Buffs/débuffs standardisés à impact (chips de scénario, cf. constantes).
  const buffOptionOf = (
    side: 'buff' | 'debuff',
    o: { key: string; from: string; stat?: string },
  ): DcBuffOption | null => {
    const e = GLOSS.effects[GLOSS.effectByKey[side][o.from] ?? ''];
    if (!e) return null;
    return {
      key: o.key,
      name: lRec(e.name, lang) || e.name.en,
      desc: lRec(e.desc, lang) || e.desc.en,
      icon: e.icon,
      debuff: side === 'debuff',
      ...(o.stat ? { stat: o.stat } : {}),
    };
  };
  const isOption = (x: DcBuffOption | null): x is DcBuffOption => x !== null;
  const buffOptions = {
    atkBuff: ATTACKER_BUFFS.map((o) => buffOptionOf('buff', o)).filter(isOption),
    atkDebuff: ATTACKER_DEBUFFS.map((o) => buffOptionOf('debuff', o)).filter(isOption),
    tgtBuff: TARGET_BUFFS.map((o) => buffOptionOf('buff', o)).filter(isOption),
    tgtDebuff: TARGET_DEBUFFS.map((o) => buffOptionOf('debuff', o)).filter(isOption),
  };

  // Décision Sevih 26/07/2026 : seul le Rogue's Charm influe sur les dégâts
  // (dégâts accrus sur cible break) — les autres talismans sont ignorés.
  const talismans: DcTalisman[] = getTalismanFamilies()
    .filter((f) => f.slug === 'rogues-charm')
    .map((f) => ({
      slug: f.slug,
      label: lRec(f.name, lang) || f.name.en,
      icon: f.icon,
      grade: f.grade,
      star: f.stars[f.stars.length - 1] ?? 0,
      ...(effectIconOf(f.passives) ? { overlayIcon: effectIconOf(f.passives) } : {}),
      text: f.passives.length ? (gearPassivesText(f.passives, lang, false, true) ?? null) : null,
    }));

  // EE par perso porteur — UNE ligne PAR palier de passif (Lv0 / Lv10), texte
  // rempli aux valeurs du palier, balises <color> conservées (rendu GameText).
  const ees: Record<string, DcEE> = {};
  for (const e of getEEViews()) {
    const rows = e.passives.flatMap((ref) => {
      const p = PASSIVES[ref.id];
      if (!p) return [];
      const desc = lRec(p.desc, lang) || p.desc.en;
      let idx = 0;
      for (let i = 0; i < (p.levels?.length ?? 0); i++) if (p.levels[i] <= ref.level) idx = i;
      const html = p.values.length
        ? fillPlaceholders(desc, p.values[Math.min(idx, p.values.length - 1)])
        : desc;
      return [{ level: ref.level, isAdd: ref.isAdd, html }];
    });
    if (!rows.length) continue;
    // Main « dégâts vs élément » : montant par niveau d'enchant (levels ‰).
    const dmgMain = (EE_RAW[e.itemId]?.options ?? [])
      .flatMap((ref) => POOLS[ref] ?? [])
      .find((o) => o.buff && EE_DMG_MAIN.test(o.buff) && o.levels?.length);
    ees[e.characterId] = {
      name: lRec(e.name, lang) || e.name.en,
      src: img.ee(e.characterId),
      grade: e.grade,
      star: e.star,
      rows,
      ...(dmgMain?.label && dmgMain.levels
        ? {
            dmgMain: {
              label: lRec(dmgMain.label, lang) || dmgMain.label.en,
              levels: dmgMain.levels,
            },
          }
        : {}),
    };
  }

  // Presets de cible : TOUS les donjons peuplés et NON RETIRÉS d'encounters.json,
  // UNE entrée PAR BOSS — de TOUTES les vagues, pas seulement la dernière : les
  // ligues Very Hard/Extreme du world boss jouent leur phase 1 en vague 1 et la
  // phase 2 en vague 2 (`encounterSpawnContexts` partitionne l'échelle de rangs
  // par boss) ; ne garder que la vague finale CACHAIT les phases 1 (bug relevé
  // par Sevih 27/07/2026).
  //
  // `path` = CASCADE de selects sous le mode (hiérarchies actées par Sevih
  // 27/07/2026), chaque niveau porté par la DONNÉE — rien n'est parsé des
  // libellés localisés :
  //   Story            → Saison, Épisode (champs `season`/`episode`)
  //   World Boss       → Ligue (difficulté)
  //   Joint Challenge / Pursuit Operation → Difficulté
  //   Special Request  → Élément du boss
  //   Guild Raid       → Phase (main/sub, du slug de mode)
  //   Tours            → Difficulté (Skyward) ou Élément (Elemental)
  //   Weekly Conquest / Promotion Challenge / Infiltration / Dimensional
  //   Singularity → à plat
  //     (l'échelle vit dans les rangs du spawn ; les étages d'infiltration
  //     nomment les ENTRÉES, cf. `floor` extrait de la clé du nom du jeu).
  const seasonTpl = t(k('target.season_label'));
  const episodeLbl = t(k('target.episode'));
  const floorTpl = t(k('target.floor_label'));
  const elemName = (slug: string): string => {
    const e = GLOSS.elements[slug];
    return e ? lRec(e, lang) || e.en : slug;
  };
  const TOWER_DIFF: Record<string, string> = {
    tower: t('guides.difficulty.normal'),
    tower_hard: t('guides.difficulty.hard'),
    tower_very_hard: t('guides.difficulty.very_hard'),
  };
  const PHASE: Record<string, string> = {
    guild_raid_main_boss: t(k('target.phase_main')),
    guild_raid_sub_boss: t(k('target.phase_sub')),
  };
  const cascadeOf = (
    ref: EncountersFile[string],
    bossElement: string,
    diff: string | undefined,
  ): string[] | undefined => {
    if (ref.season != null && ref.episode != null)
      return [seasonTpl.replace('{n}', String(ref.season)), `${episodeLbl} ${ref.episode}`];
    if (ref.mode === 'raid_1' || ref.mode === 'raid_2') return [elemName(bossElement)];
    if (PHASE[ref.mode]) return [PHASE[ref.mode]];
    if (ref.mode.startsWith('tower'))
      return [ref.element ? elemName(ref.element) : (TOWER_DIFF[ref.mode] ?? ref.mode)];
    // Ligue du world boss, difficulté du joint challenge / de la poursuite.
    if (diff) return [diff];
    return undefined;
  };
  const targets: DcTarget[] = [];
  const floorOf = new Map<string, number>();
  for (const [id, ref] of Object.entries(DUNGEONS)) {
    if (!ref.monsters?.length || EXCLUDED_MODES.has(ref.mode) || ref.retired) continue;
    const e: Encounter = { id, ref, monsters: ref.monsters };
    const diff = difficultyLabel(ref, lang, t);
    const dungeonName = lRec(ref.name, lang) || ref.name.en;
    const seenBosses = new Set<string>();
    for (const boss of e.monsters.filter((m) => m.role === 'boss')) {
      // Un même boss peut réapparaître d'une vague à l'autre : une seule entrée.
      if (seenBosses.has(boss.id)) continue;
      seenBosses.add(boss.id);
      const monster = getMonster(boss.id);
      if (!monster) continue;
      const spawns = encounterSpawnContexts(e, boss, lang).map((s, i) => {
        // Stats EFFECTIVES au spawn — les défensives qui pèsent sur les dégâts
        // reçus : HP, DEF, DMG RED %, CDMG RED % (décision Sevih 27/07/2026).
        // `statAt` = le calcul partagé des fiches monstre (niveau + adv + bossHp).
        const at = (slug: string): number => {
          const r = monster.stats[slug];
          return r ? statAt(slug, r, s) : 0;
        };
        // hpLines/adv ne sont PAS exposés : l'adv est déjà APPLIQUÉ dans les
        // stats effectives, l'afficher en plus troublait (décision Sevih
        // 27/07/2026 — « le reste on s'en fiche »).
        return {
          label:
            s.stageLabel ??
            (s.rank ? `Rank ${s.rank}` : s.stage ? `#${s.stage}` : i ? `#${i + 1}` : ''),
          level: s.level,
          stats: {
            hp: at('hp'),
            def: at('def'),
            dmgRed: at('dmg_reduce'),
            cdmgRed: at('enemy_critical_dmg_reduce'),
          },
        };
      });
      if (!spawns.length) continue;
      const path = cascadeOf(ref, monster.element, diff);
      const isFloor = ref.mode === 'irregular_infiltrate' && ref.floor != null;
      if (isFloor) floorOf.set(`${id}:${boss.id}`, ref.floor as number);
      targets.push({
        id: `${id}:${boss.id}`,
        mode: modeLabel(ref, lang),
        ...(path ? { path } : {}),
        // Le nom du donjon porte déjà stage/étage/difficulté quand le jeu les
        // nomme ; en infiltration tous les étages partagent le même libellé
        // (« Search Coordinates: Unknown ») → « Floor N » (extrait de la clé).
        label: isFloor ? floorTpl.replace('{n}', String(ref.floor)) : dungeonName,
        name: lRec(monster.name, lang) || monster.name.en,
        cls: monster.class,
        // Règle d'icône de monstre (miroir de `monsterIconSrc`, serveur only) :
        // icône '2…' = modèle de perso → face, sinon portrait de boss MT_*.
        iconSrc: monster.icon.startsWith('2')
          ? img.face(monster.icon)
          : img.boss(`MT_${monster.icon}`),
        element: monster.element,
        spawns,
      });
    }
  }
  // L'ID d'infiltration ne suit PAS l'étage (73000001 = étage 46) : remettre
  // ce bloc (contigu) en ordre d'étage, sans toucher au reste.
  if (floorOf.size) {
    const first = targets.findIndex((tg) => floorOf.has(tg.id));
    const floors = targets
      .filter((tg) => floorOf.has(tg.id))
      .sort((a, b) => (floorOf.get(a.id) ?? 0) - (floorOf.get(b.id) ?? 0));
    const others = targets.filter((tg) => !floorOf.has(tg.id));
    targets.length = 0;
    targets.push(...others.slice(0, first), ...floors, ...others.slice(first));
  }

  const statFields: DcStatField[] = SHEET_STATS.map(({ slug, percent }) => ({
    key: slug,
    label: statName(slug, lang),
    percent,
  }));

  // Stats DÉFENSIVES de la cible (affichage preset + saisie manuelle) — slugs
  // du glossaire des NOMS (`dmg_reduce_rate`/`e_cri_dmg_reduce`), les tables de
  // monstre disent `dmg_reduce`/`enemy_critical_dmg_reduce` pour les mêmes stats.
  const targetStatFields: DcStatField[] = [
    { key: 'hp', label: statName('hp', lang), percent: false },
    { key: 'def', label: statName('def', lang), percent: false },
    { key: 'dmgRed', label: statName('dmg_reduce_rate', lang), percent: true },
    { key: 'cdmgRed', label: statName('e_cri_dmg_reduce', lang), percent: true },
  ];

  // Main stats de talisman proposées pour les ALLIÉS — union des pools réels
  // (mêmes 9 stats à tous les paliers), dans l'ordre du jeu.
  const talismanMains: { key: string; label: string }[] = [];
  {
    const seen = new Set<string>();
    for (const tal of Object.values(TALISMAN_RAW))
      for (const ref of tal.options ?? [])
        for (const row of POOLS[ref] ?? []) {
          const m = /^BID_ITEM_STAT_OOPARTS_(.+)_\d+$/.exec(row.buff ?? '');
          const slug = m ? TALIS_STAT_SLUG[m[1]] : undefined;
          if (slug && !seen.has(slug)) {
            seen.add(slug);
            talismanMains.push({ key: slug, label: statName(slug, lang) });
          }
        }
  }

  // Quirks de compte : SEULS les nœuds offensifs (cf. OFFENSIVE_QUIRK_DESC),
  // en liste plate par catégorie — le réglage localStorage vit côté client.
  const quirks: DcQuirkGroup[] = QUIRKS.categories
    .filter((c) => QUIRK_CATEGORY_KEY[c.key])
    .map((c) => ({
      key: c.key,
      label: t(k(QUIRK_CATEGORY_KEY[c.key])),
      nodes: c.trees.flatMap((tr) =>
        tr.nodes
          .filter((n) => OFFENSIVE_QUIRK_DESC.test(n.desc.en))
          .map((n) => {
            const desc = lRec(n.desc, lang) || n.desc.en;
            return {
              id: n.id,
              iconSrc: img.quirkNode(n.icon),
              color: n.color || 'var(--color-line-strong)',
              name: (lRec(n.name, lang) || n.name.en).replace(/<[^>]+>/g, ''),
              maxLevel: n.maxLevel,
              // Texte de l'effet À CHAQUE niveau (index 0 = Lv1), balises
              // couleur conservées (rendu GameText).
              texts: n.levels.map((l) => desc.replace('{0}', l.value ?? '')),
            };
          }),
      ),
    }))
    .filter((g) => g.nodes.length);

  const labels: DcLabels = {
    search: t('common.search'),
    select: t(k('common.select')),
    noMatches: t(k('common.no_matches')),
    clear: t(k('common.clear_slot')),
    panels: {
      attacker: t(k('panel.attacker')),
      target: t(k('panel.target')),
      team: t(k('panel.team')),
      result: t(k('panel.result')),
    },
    title: t('tools.damage-calculator'),
    pick: t(k('attacker.pick')),
    skills: {
      title: t(k('attacker.skill_levels')),
      dmg: t(k('attacker.tag_dmg')),
      support: t('filters.roles.support'),
    },
    settings: {
      title: t(k('settings.title')),
      subtitle: t(k('settings.subtitle')),
      quirks: t(k('settings.quirks')),
      reset: t(k('settings.reset')),
      activateAll: t(k('settings.activate_all')),
    },
    equipment: {
      title: t(k('equipment.title')),
      sets: t(k('equipment.sets')),
      weapon: t('page.character.gear.weapon'),
      accessory: t(k('equipment.accessory')),
      ee: t(k('equipment.ee')),
      eeNone: t(k('equipment.ee_no_data')),
      noPassive: t(k('equipment.no_passive_data')),
      pickWeapon: t(k('equipment.pick_weapon')),
      pickAccessory: t(k('equipment.pick_accessory')),
      talisman: t('page.character.gear.talisman'),
      lv0: t(k('equipment.passive_lv0')),
      lv10: t(k('equipment.passive_lv10')),
      p2: t(k('equipment.tier_2pc')),
      p4: t(k('equipment.tier_4pc')),
    },
    stats: {
      title: t(k('stat.label')),
      sheetNote: t(k('stats.sheet_note')),
      final: t(k('stats.final')),
      finalNote: t(k('stats.final_note')),
    },
    target: {
      preset: t(k('target.tab.cascade')),
      manual: t(k('target.tab.manual')),
      element: t(k('target.manual.element')),
      copyFromSelected: t(k('target.manual.copy_from_selected')),
      all: t('common.all'),
      mode: t(k('target.mode')),
      lv: t(k('target.lv_prefix')),
      stage: t(k('target.stage')),
      fight: t(k('target.fight')),
      bossFlag: t(k('target.boss_flag')),
    },
    toolbar: {
      reset: t(k('toolbar.reset')),
      copy: t(k('toolbar.copy_link')),
      copied: t(k('toolbar.copied')),
    },
    // Contexte réduit au NOMBRE DE CIBLES TOUCHÉES (décroissance AoE § 7) :
    // le type de contenu se déduit du preset choisi, le PvP est hors périmètre
    // (décision Sevih 27/07/2026).
    context: {
      title: t(k('context.title')),
      targetsHit: t(k('context.targets_hit')),
      // PV actuels des DEUX combattants — du contexte (Sevih 27/07/2026).
      attackerHp: t(k('context.attacker_hp')),
      targetHp: t(k('context.target_hp')),
    },
    team: {
      emptySlot: t(k('team.empty')),
      eeOwned: t(k('team.ee_owned')),
      eePlus: t(k('team.ee_plus10')),
    },
    buffs: {
      fromKits: t(k('buffs.from_kits')),
      kitsSoon: t(k('buffs.kits_soon')),
      awaitPick: t(k('buffs.await_pick')),
      atkBuff: t(k('buffs.col.attacker_buff')),
      atkDebuff: t(k('buffs.col.attacker_debuff')),
      tgtBuff: t(k('buffs.col.target_buff')),
      tgtDebuff: t(k('buffs.col.target_debuff')),
    },
    report: {
      empty: t(k('result.empty')),
      wip: t(k('report.engine_wip')),
      branchesNote: t(k('report.branches_note')),
      normal: t(k('sub.normal')),
      critical: t(k('report.critical')),
      miss: t(k('report.miss')),
      supportSkills: t(k('report.support_skills')),
    },
  };

  return (
    <DamageCalculatorBrowser
      chars={chars}
      kits={kits}
      weapons={weapons}
      amulets={amulets}
      sets={sets}
      talismans={talismans}
      ees={ees}
      targets={targets}
      statFields={statFields}
      targetStatFields={targetStatFields}
      talismanMains={talismanMains}
      buffOptions={buffOptions}
      quirks={quirks}
      labels={labels}
    />
  );
}
