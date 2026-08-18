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
  storyFamilyOf,
  type Encounter,
} from '@/lib/data/encounters';
import { getMonster } from '@/lib/data/monsters';
import { getTranscendTiers } from '@/lib/data/char-progression';
import progressionData from '@data/generated/progression.json';
import damageGrowthData from '@data/generated/damage/growth.json';
import { statName } from '@/lib/data/stat-glossary';
import { SHEET_FIELDS, TARGET_FIELDS } from '@/lib/damage/scenario';
import { presetSpawnStats } from '@/lib/damage/preset-target';
import { familyMembersFor, uniqueGroupsOf } from '@/lib/damage/preset-gear';
import { staticBossPassives } from '@/lib/damage/passives';
import { buildCondBuffNames } from './cond-names';
import { sheetSlugOfStat, type DamageBuffsData, type DamageTargetsData } from '@/lib/damage/inputs';
import type { ActiveBuff } from '@/lib/damage/aggregate';
import { loadDataJson } from '@/lib/data/disk';
import { burstSkills, dedupSkills } from '@/lib/skill-view';
import { img } from '@/lib/images';
import type {
  BuffValues,
  DamageScalingFile,
  EncountersFile,
  LangDict,
  QuirksData,
  Skill,
} from '@contracts';
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
  type DcBossPassive,
  type DcBuffOption,
  type DcChar,
  type DcEE,
  type DcGear,
  type DcLabels,
  type DcSet,
  type DcQuirkGroup,
  type DcSkillRow,
  type DcSpawn,
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

const SCALING = scalingData as unknown as DamageScalingFile;
const DUNGEONS = encountersData as unknown as EncountersFile;
const QUIRKS = quirksRaw as unknown as QuirksData;

// Les QUATRE gros JSON (skills 5,9 Mo, monster-skills 9 Mo, damage/targets,
// damage/buffs — ~23 Mo au total) sont lus au DISQUE (`loadDataJson`, cache
// par mtime) et non importés statiquement : un import les mettrait dans le
// graphe de modules, et chaque « Enregistrer » de l'admin qui les réécrit
// recompilait la route (10-40 s de « Compiling… ») — audit D3, 07/08/2026,
// même règle que `lib/data/monsters.ts`. Les petits JSON restent en import.
const loadSkills = () => loadDataJson<Record<string, Skill>>('generated/skills.json');
const loadMonsterSkills = () =>
  loadDataJson<Record<string, { name?: Record<string, string>; icon?: string } | undefined>>(
    'generated/monster-skills.json',
  );
const loadDamageTargets = () => loadDataJson<DamageTargetsData>('generated/damage/targets.json');
const loadDamageBuffs = () => loadDataJson<DamageBuffsData>('generated/damage/buffs.json');

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
  /** Réf de tooltip → id d'effet canonique (pont du nommage des conditions). */
  effectByTooltip: Record<string, string>;
  effectByKey: { buff: Record<string, string>; debuff: Record<string, string> };
  /** Noms localisés des éléments (niveaux de cascade du picker de cible). */
  elements: Record<string, LangDict>;
  /** Titres officiels des familles de modes (« Story », « Origin Story »,
   *  « Special Request ») — entrées du picker de cible qui replient plusieurs
   *  slugs de mode en une seule. */
  modeFamilies?: Record<string, LangDict>;
  /** Titres officiels des saisons de guild raid (n° → « The Frost Legion »…)
   *  — cartes de saison du picker de cible. */
  guildRaidSeasons?: Record<string, LangDict>;
  /** Titres localisés des modes (repli si une famille manquait au glossaire). */
  modes?: Record<string, LangDict>;
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
 * DEMANDÉ par perso vient de `statKeysFor`. La table vit dans la LIB
 * (`SHEET_FIELDS`) : le pont z → moteur applique les MÊMES percent (% → ‰).
 */
const SHEET_STATS = SHEET_FIELDS;

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
  const SKILLS = loadSkills();
  const chars: DcChar[] = [];
  const kits: Record<string, DcSkillRow[]> = {};
  for (const c of getAllCharacters()) {
    const skills = dedupSkills(c.skills.map((id) => SKILLS[id]).filter(Boolean));
    // Déclinaisons burst_1..3 du kit (règle partagée avec la fiche perso) :
    // leurs descs vont au popover du skill burstable, en vert/bleu/rouge.
    const burstIds = burstSkills(skills).map((b) => b.id);
    const rows: DcSkillRow[] = [];
    for (const { type, slot } of KIT_SLOTS) {
      const sk = skills.find((s) => s.type === type);
      if (!sk) continue;
      rows.push({
        slot,
        // Clé du catalogue de skills chargé à la demande côté client (descs
        // du popover d'icône — Sevih 18/08/2026).
        id: sk.id,
        ...(sk.burstAP?.length && burstIds.length ? { burstIds } : {}),
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
        // Groupes d'options UNIQUES des tables damage (moteur § 15) — par
        // classe quand les variantes diffèrent (Briareos/Gorgon).
        ...(uniqueGroupsOf(f.ids).length ? { dmgGroups: uniqueGroupsOf(f.ids) } : {}),
        ...(f.classPassives
          ? {
              dmgGroupsByClass: Object.fromEntries(
                f.classPassives.map((cp) => [
                  cp.classLimit,
                  uniqueGroupsOf(familyMembersFor(f, cp.classLimit)),
                ]),
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
      // Moteur § 15 : seul le 6★ porte l'effet Lv10 (dégâts vs break) — les
      // groupes des variantes basses n'apportent que du CP, sans effet calculé.
      ...(uniqueGroupsOf(f.ids).length ? { dmgGroups: uniqueGroupsOf(f.ids) } : {}),
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
  // UNE entrée PAR MONSTRE — par BOSS hors histoire, et TOUS rôles confondus en
  // story/origin story (les vagues complètes du picker visuel, demande Sevih
  // 06/08/2026). Toujours de TOUTES les vagues, pas seulement la dernière : les
  // ligues Very Hard/Extreme du world boss jouent leur phase 1 en vague 1 et la
  // phase 2 en vague 2 (`encounterSpawnContexts` partitionne l'échelle de rangs
  // par boss) ; ne garder que la vague finale CACHAIT les phases 1 (bug relevé
  // par Sevih 27/07/2026).
  //
  // `path` = CASCADE de selects sous le mode (hiérarchies actées par Sevih
  // 27/07/2026), chaque niveau porté par la DONNÉE — rien n'est parsé des
  // libellés localisés :
  //   Story            → Saison, Épisode (champs `season`/`episode`)
  //   World Boss       → Rotation (nom du donjon, constant sur les 4 ligues),
  //     puis Ligue (difficulté) — Sevih 17/08/2026
  //   Joint Challenge  → Édition (nom du boss final — la difficulté vit déjà
  //     dans le nom du donjon « … Normal/Hard/Very Hard ») — Sevih 17/08/2026
  //   Pursuit Operation → Difficulté
  //   Special Request  → raid_1/raid_2 REPLIÉS sous le titre du menu
  //     (famille `special_request`), puis Sous-requête (titre officiel
  //     complet — le jeu n'a pas d'« Ecology Study » nu), puis NOM du boss
  //     final du donjon (les 5 échelles de stages — Sevih 17/08/2026)
  //   Guild Raid       → Saison, nommée par le TITRE officiel du raid
  //     (glossaire `guildRaidSeasons`, n° extrait de la CLÉ du groupe
  //     SYS_TITLE_GUILD_RAID_SEASON4_MAIN — clé stable, pas un libellé), puis
  //     les 3 boss de la saison en cartes de LIGNE (le stage se choisit dans
  //     le panneau cible, overgrade > 10 inclus pour le main) — Sevih
  //     17/08/2026, l'axe Main/Sub disparaît
  //   Tours            → Difficulté (Skyward) ou Élément (Elemental)
  //   Weekly Conquest / Promotion Challenge / Infiltration / Dimensional
  //   Singularity → à plat
  //     (l'échelle vit dans les rangs du spawn ; les étages d'infiltration
  //     nomment les ENTRÉES, cf. `floor` extrait de la clé du nom du jeu).
  const seasonTpl = t(k('target.season_label'));
  const episodeLbl = t(k('target.episode'));
  const floorTpl = t(k('target.floor_label'));
  /** Titre officiel d'une famille de modes (glossaire `modeFamilies`), repli
   *  sur le titre d'un mode membre — jamais de texte écrit main. */
  const famLabel = (family: string, modeSlug: string): string => {
    const rec = GLOSS.modeFamilies?.[family] ?? GLOSS.modes?.[modeSlug];
    return (rec && (lRec(rec, lang) || rec.en)) || family;
  };
  const elemName = (slug: string): string => {
    const e = GLOSS.elements[slug];
    return e ? lRec(e, lang) || e.en : slug;
  };
  const TOWER_DIFF: Record<string, string> = {
    tower: t('guides.difficulty.normal'),
    tower_hard: t('guides.difficulty.hard'),
    tower_very_hard: t('guides.difficulty.very_hard'),
  };
  /** N° de saison du guild raid — extrait de la CLÉ STABLE du groupe
   *  (`guild_raid:SYS_TITLE_GUILD_RAID_SEASON4_MAIN`), jamais d'un libellé. */
  const grSeasonOf = (ref: EncountersFile[string]): number | undefined => {
    const m = /SEASON(\d+)_/.exec(ref.group ?? '');
    return m ? Number(m[1]) : undefined;
  };
  const cascadeOf = (
    ref: EncountersFile[string],
    posterName: string,
    dungeonName: string,
    diff: string | undefined,
  ): string[] | undefined => {
    if (ref.season != null && ref.episode != null)
      return [seasonTpl.replace('{n}', String(ref.season)), `${episodeLbl} ${ref.episode}`];
    // Sous-requête, puis NOM du boss final du donjon (« Unidentified
    // Chimera »… — Sevih 17/08/2026, plus parlant que l'élément) : le
    // mi-boss de vague 1 des Ecology Study se range sous la même carte.
    if (ref.mode === 'raid_1' || ref.mode === 'raid_2') return [modeLabel(ref, lang), posterName];
    // NOM officiel du raid de la saison (« The Frost Legion »… — Sevih
    // 17/08/2026), puis les boss de la saison À PLAT (main + subs mêlés).
    // Replis en cascade si le glossaire ou la clé de groupe manquait :
    // « Season {n} », puis la clé brute — jamais d'entrée sans chemin dans
    // un mode qui en a, sinon elle devient inatteignable.
    if (ref.mode === 'guild_raid_main_boss' || ref.mode === 'guild_raid_sub_boss') {
      const n = grSeasonOf(ref);
      const rec = n != null ? GLOSS.guildRaidSeasons?.[String(n)] : undefined;
      const name = rec && (lRec(rec, lang) || rec.en);
      return [name || (n != null ? seasonTpl.replace('{n}', String(n)) : (ref.group ?? ref.mode))];
    }
    // Rotation (le nom du donjon est CONSTANT sur les 4 ligues), puis ligue.
    if (ref.mode === 'world_boss') return [dungeonName, ...(diff ? [diff] : [])];
    // Édition = boss final ; la difficulté vit déjà dans le nom du donjon.
    if (ref.mode === 'event_boss') return [posterName];
    if (ref.mode.startsWith('tower'))
      return [ref.element ? elemName(ref.element) : (TOWER_DIFF[ref.mode] ?? ref.mode)];
    // Difficulté de la poursuite.
    if (diff) return [diff];
    return undefined;
  };
  // Passifs de BOSS (lib passives.ts — « un débuff comme un autre », Sevih
  // 05/08/2026) : chips AUTO de la section buff/débuff. Le wrapper compose des
  // props LÉGÈRES (nom localisé du passif + libellé stat/valeur) ; la
  // condition élémentaire brute part au client, qui l'évalue contre
  // l'attaquant COURANT avec la même relation § 6 que le moteur.
  const DMG_TARGETS = loadDamageTargets();
  const DMG_BUFFS = loadDamageBuffs();
  const MONSTER_SKILLS = loadMonsterSkills();
  const passiveLabel = (b: ActiveBuff): string => {
    const v = b.value ?? 0;
    const pct = (x: number) => `${x > 0 ? '+' : ''}${x / 10}%`;
    if (b.type === 'BT_STAT' && b.stat) {
      const slug = sheetSlugOfStat(b.stat);
      const label = slug ? statName(slug, lang) : b.stat;
      const percent = SHEET_FIELDS.find((f) => f.slug === slug)?.percent === true;
      return `${label} ${b.applyingType === 'OAT_RATE' || percent ? pct(v) : `${v > 0 ? '+' : ''}${v}`}`;
    }
    if (b.type === 'BT_DMG_REDUCE') return `${statName('dmg_reduce_rate', lang)} ${pct(v)}`;
    return `${b.type} ${pct(v)}`;
  };
  // Libellés LISIBLES des conditions (Sevih 17/08/2026 — « histoire de
  // comprendre la condition ») : enum brut → gabarit localisé, `{n}` = seuil.
  // Habillage UI (locales, 5 langues) — l'enum brut reste dans les tooltips.
  const CONDITION_ENUMS = [
    'OWNER_RESOURCE',
    'OWNER_HAS_BUFF',
    'OWNER_HAS_ALL_BUFF',
    'OWNER_HAS_NOT_BUFF',
    'OWNER_ALONE',
    'OWNER_TOGETHER',
    'OWNER_RUN_COUNTER',
    'CASTER_HAS_BUFF',
    'CASTER_HAS_NOT_BUFF',
    'CASTER_ENEMY_TEAM_HAS_BUFF',
    'CASTER_HPRATE_OVER',
    'TARGET_HAS_BUFF',
    'TARGET_HAS_NOT_BUFF',
    'TARGET_HPRATE_OVER',
    'TARGET_HPRATE_UNDER',
    'TARGET_RUN_COUNTER',
    'ATTACKER_ELEMENT_WIN',
    'ATTACKER_ELEMENT_LOSE',
    'ATTACKER_ELEMENT_EQUAL',
    'OWNER_RAGE',
  ] as const;
  const condLabels: Record<string, string> = Object.fromEntries(
    CONDITION_ENUMS.map((c) => [c, t(k(`context.cond.${c.toLowerCase()}` as never))]),
  );
  // Noms des buffs RÉFÉRENCÉS par les conditions (prédicat + résolution :
  // cond-names.ts, prédicat partagé avec le client via `conditionBuffRef`).
  const condBuffNames = buildCondBuffNames(DMG_BUFFS, GLOSS, lang);
  const passivesCache = new Map<string, DcBossPassive[]>();
  const bossPassiveChips = (bossId: string): DcBossPassive[] => {
    const hit = passivesCache.get(bossId);
    if (hit) return hit;
    const out: DcBossPassive[] = [];
    for (const e of staticBossPassives(bossId, DMG_TARGETS, DMG_BUFFS)?.entries ?? []) {
      const nameRec = MONSTER_SKILLS[e.skillId]?.name;
      // Condition en clair sur la chip : celle de la ligne, précédée du gate
      // d'enrage quand le buff vient du skill d'enrage.
      const condParts = [
        ...(e.rage ? [condLabels.OWNER_RAGE] : []),
        ...(e.condition !== undefined && e.condition !== 'OWNER_RAGE'
          ? [condLabels[e.condition] ?? e.condition]
          : []),
      ];
      out.push({
        name: nameRec ? lRec(nameRec, lang) || nameRec.en || e.skillId : e.skillId,
        side: e.side === 'attacker' ? 'attacker' : 'target',
        label: passiveLabel(e.buff),
        // Stat du BT_STAT : le Browser tait les chips attaquant dont la stat
        // ne pèse aucun MONTANT pour le kit courant (crit chance… — sauf
        // lecture § 9.1 comme 2000067, cf. `attackerAmountStats` du rapport).
        ...(e.buff.type === 'BT_STAT' && e.buff.stat !== undefined ? { stat: e.buff.stat } : {}),
        ...(e.condition !== undefined ? { condition: e.condition } : {}),
        ...(condParts.length ? { cond: condParts.join(' · ') } : {}),
        ...(e.rage ? { rage: true as const } : {}),
      });
    }
    passivesCache.set(bossId, out);
    return out;
  };
  /** Le monstre a-t-il un skill d'ENRAGE (`SKT_RAGE_ENTER*`) ? — gate de la
   *  coche « Enragé » du contexte. */
  const monsterHasRage = (bossId: string): boolean =>
    (DMG_TARGETS.targets[bossId]?.skills ?? []).some((s) =>
      DMG_TARGETS.skills[s.id]?.type.startsWith('SKT_RAGE_ENTER'),
    );

  const targets: DcTarget[] = [];
  const floorOf = new Map<string, number>();
  /** Cible guild raid → n° de saison : l'ID de donjon ne suit pas les saisons
   *  (70401=S4, 70801=S1), on remet les cartes en ordre après la boucle. */
  const grOrder = new Map<string, number>();
  for (const [id, ref] of Object.entries(DUNGEONS)) {
    if (!ref.monsters?.length || EXCLUDED_MODES.has(ref.mode) || ref.retired) continue;
    const e: Encounter = { id, ref, monsters: ref.monsters };
    const diff = difficultyLabel(ref, lang, t);
    const dungeonName = lRec(ref.name, lang) || ref.name.en;
    // STORY : TOUS les monstres du stage sont ciblables (les vagues du picker
    // visuel — demande Sevih 06/08/2026) ; ailleurs, les boss seuls comme
    // avant (le visuel propre de ces modes viendra plus tard).
    const fam = storyFamilyOf(ref.mode);
    // Boss FINAL du donjon (vague la plus haute) — l'« affiche » qui nomme la
    // carte de niveau 2 des Special Request. Même logique que `posterOf` du
    // browser story.
    let posterMon: (typeof e.monsters)[number] | undefined;
    for (const m of e.monsters)
      if (m.role === 'boss' && (!posterMon || (m.wave ?? 0) >= (posterMon.wave ?? 0)))
        posterMon = m;
    const posterMonster = posterMon ? getMonster(posterMon.id) : undefined;
    const posterName = posterMonster
      ? lRec(posterMonster.name, lang) || posterMonster.name.en
      : dungeonName;
    const seenIds = new Set<string>();
    for (const mon of fam ? e.monsters : e.monsters.filter((m) => m.role === 'boss')) {
      // Un même monstre peut réapparaître d'une vague à l'autre (ou à un autre
      // niveau) : une seule entrée — la PREMIÈRE, même dédup que le resolver
      // node (`resolvePresetTarget`).
      if (seenIds.has(mon.id)) continue;
      seenIds.add(mon.id);
      const monster = getMonster(mon.id);
      if (!monster) continue;
      // Guild raid : chaque stage est un DONJON (et un monstre) distinct — les
      // entrées d'une même ligne (`ref.group`) sont regroupées par l'UI en UNE
      // carte avec un sélecteur de stage (Sevih 17/08/2026, comme la
      // Singularité). Le dernier stage du main boss porte en plus les stages
      // d'OVERGRADE (contextes de spawn supplémentaires, borne du jeu = grade
      // 100) — d'où `overgrade: true` ici ET dans `resolvePresetTarget`.
      const isGrBoss = ref.mode === 'guild_raid_main_boss' || ref.mode === 'guild_raid_sub_boss';
      const grStage = isGrBoss
        ? Number(/^stage_(\d+)$/.exec(ref.difficulty?.key ?? '')?.[1] ?? 0)
        : 0;
      const spawnCtxs = encounterSpawnContexts(e, mon, lang, { overgrade: true });
      // Échelle par RANGS (world boss, Singularité… — paliers de dégâts
      // cumulés) vs par STAGES : le libellé du sélecteur du panneau cible
      // suit (Sevih 17/08/2026, « rank » quand ce n'est pas un stage).
      const ranked = spawnCtxs.some((s) => s.rank);
      const spawns = spawnCtxs.map((s, i) => {
        // Stats EFFECTIVES au spawn — les défensives qui pèsent sur les dégâts
        // reçus : HP, DEF, DMG RED %, CDMG RED % (décision Sevih 27/07/2026).
        // Le calcul (`statAt` : niveau + adv + bossHp) et le mapping vivent
        // dans la LIB (`presetSpawnStats`) : le rejeu node des fixtures
        // résout les MÊMES stats que ce que l'UI affiche.
        // hpLines/adv ne sont PAS exposés : l'adv est déjà APPLIQUÉ dans les
        // stats effectives, l'afficher en plus troublait (décision Sevih
        // 27/07/2026 — « le reste on s'en fiche »).
        // Payload : label vide et stats à 0 sont OMIS (élagage Sevih 27/07/2026).
        // Guild raid : le spawn est un STAGE nommé (« Stage 14 » au-delà du
        // templeté via `s.stage` des contextes d'overgrade).
        const label = isGrBoss
          ? t('guides.difficulty.stage', { n: String(s.stage ?? grStage) })
          : (s.stageLabel ??
            (s.rank ? `Rank ${s.rank}` : s.stage ? `#${s.stage}` : i ? `#${i + 1}` : ''));
        const stats: DcSpawn['stats'] = presetSpawnStats(monster, s);
        return { ...(label ? { label } : {}), level: s.level, stats };
      });
      if (!spawns.length) continue;
      const path = cascadeOf(ref, posterName, dungeonName, diff);
      const isFloor = ref.mode === 'irregular_infiltrate' && ref.floor != null;
      if (isFloor) floorOf.set(`${id}:${mon.id}`, ref.floor as number);
      if (ref.mode === 'guild_raid_main_boss' || ref.mode === 'guild_raid_sub_boss')
        grOrder.set(`${id}:${mon.id}`, grSeasonOf(ref) ?? Number.MAX_SAFE_INTEGER);
      const passives = bossPassiveChips(mon.id);
      // Story : le libellé porte le NUMÉRO du stage comme en jeu
      // (« 3-16. Part of the Plan ») — il nomme la carte du picker visuel et
      // rend la recherche « 3-16 » possible. L'intro sans clé reste nue.
      const storyLabel =
        fam && ref.episode != null && ref.stage != null
          ? `${ref.episode}-${ref.stage}. ${dungeonName}`
          : dungeonName;
      targets.push({
        id: `${id}:${mon.id}`,
        // Les deux Special Request partagent une seule entrée de mode (famille
        // `special_request`) — la sous-requête devient le 1er niveau de cascade.
        mode:
          ref.mode === 'raid_1' || ref.mode === 'raid_2'
            ? famLabel('special_request', ref.mode)
            : modeLabel(ref, lang),
        // Slug BRUT : le buff de guilde (§ 16.2) se décide sur lui, jamais
        // sur le libellé localisé.
        modeSlug: ref.mode,
        ...(path ? { path } : {}),
        // Le nom du donjon porte déjà stage/étage/difficulté quand le jeu les
        // nomme ; en infiltration tous les étages partagent le même libellé
        // (« Search Coordinates: Unknown ») → « Floor N » (extrait de la clé).
        label: isFloor ? floorTpl.replace('{n}', String(ref.floor)) : storyLabel,
        name: lRec(monster.name, lang) || monster.name.en,
        cls: monster.class,
        // Nom BRUT : l'URL est dérivée côté client (`monsterIcon`) — inutile
        // de sérialiser ~700 URLs complètes (élagage Sevih 27/07/2026).
        icon: monster.icon,
        element: monster.element,
        // Les DEUX axes de la vignette, et ils sont indépendants : le TYPE
        // choisit le fond (`SetMonsterBG` prend un CHARACTER_TYPE), le BasicStar
        // compte les étoiles. La tuile déduisait le fond de la rareté — faux
        // pour ~900 monstres.
        type: monster.type,
        rarity: monster.rarity,
        spawns,
        // Ligne de guild raid (cf. `DcTarget.line`) : l'UI replie les stages
        // d'une même ligne en une carte, le sélecteur de stage bascule d'une
        // entrée à l'autre.
        ...(isGrBoss && ref.group ? { line: ref.group, stage: grStage } : {}),
        ...(ranked ? { ranked: true } : {}),
        ...(monsterHasRage(mon.id) ? { hasRage: true } : {}),
        ...(passives.length ? { passives } : {}),
        // Navigation du picker visuel story — cf. `DcTarget.story`. Les vagues
        // viennent de TOUTES les occurrences du monstre dans le donjon (la
        // donnée émet une entrée par vague, avec `count` si exemplaires
        // multiples — story 1-1 : 2 × le même loup en vague 1).
        ...(fam && ref.season != null && ref.episode != null
          ? {
              story: {
                family: fam.family,
                hard: fam.hard,
                season: ref.season,
                episode: ref.episode,
                episodeName: ref.area ? lRec(ref.area, lang) || ref.area.en : '',
                ...(ref.stage != null ? { stage: ref.stage } : {}),
                waves: e.monsters
                  .filter((m) => m.id === mon.id)
                  .map((m) => ({
                    wave: m.wave ?? 1,
                    level: m.level,
                    ...(m.count && m.count > 1 ? { count: m.count } : {}),
                  })),
                role: mon.role,
              },
            }
          : {}),
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
  // Même remise en ordre pour le guild raid : cartes de saison croissantes
  // (l'ID de donjon donne S4, S5, S2, S3, S1). Tri STABLE — dans une saison,
  // l'ordre id (main stages 1-10, puis les 2 subs) est préservé.
  if (grOrder.size) {
    const first = targets.findIndex((tg) => grOrder.has(tg.id));
    const gr = targets
      .filter((tg) => grOrder.has(tg.id))
      .sort((a, b) => (grOrder.get(a.id) ?? 0) - (grOrder.get(b.id) ?? 0));
    const others = targets.filter((tg) => !grOrder.has(tg.id));
    targets.length = 0;
    targets.push(...others.slice(0, first), ...gr, ...others.slice(first));
  }

  const statFields: DcStatField[] = SHEET_STATS.map(({ slug, percent }) => ({
    key: slug,
    label: statName(slug, lang),
    percent,
  }));

  // Stats DÉFENSIVES de la cible (affichage preset + saisie manuelle) — la
  // table (clés, percent, slugs du glossaire des NOMS) vit dans la LIB
  // (`TARGET_FIELDS`) : le pont z → moteur applique les MÊMES conversions.
  const targetStatFields: DcStatField[] = TARGET_FIELDS.map(({ key, statSlug, percent }) => ({
    key,
    label: statName(statSlug, lang),
    percent,
  }));

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
    // Affinité (Trust) : 5 paliers de buffs passifs plats, ABSENTS de la fiche
    // affichée (canal buffValue — vérifié binaire 27/07/2026).
    affinity: t(k('attacker.affinity')),
    skills: {
      title: t(k('attacker.skill_levels')),
      dmg: t(k('attacker.tag_dmg')),
      support: t('filters.roles.support'),
    },
    settings: {
      title: t(k('settings.title')),
      subtitle: t(k('settings.subtitle')),
      quirks: t(k('settings.quirks')),
      codex: t(k('settings.codex')),
      guild: t(k('settings.guild')),
      premium: t(k('settings.premium')),
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
      lv: t(k('target.lv_prefix')),
      stage: t(k('target.stage')),
      rank: t(k('target.rank')),
      fight: t(k('target.fight')),
      bossFlag: t(k('target.boss_flag')),
      breakFlag: t(k('target.break_flag')),
      guildBuffFlag: t(k('target.guild_buff_flag')),
      titleBuffFlag: t(k('target.title_buff_flag')),
      enrageFlag: t(k('target.enrage_flag')),
      // Picker visuel story : les deux FAMILLES (le toggle Normal/Hard vit
      // dans le browser, pas dans la liste des modes), la navigation et les
      // vagues. Titres de famille = textes OFFICIELS du jeu (glossaire
      // `modeFamilies`, curé dans mode-titles.json — jamais écrits main) ;
      // repli sur le titre du mode normal de la famille si la curation
      // manquait. Difficultés : les libellés transverses des guides.
      familyStory: famLabel('story', 'normal'),
      familyOrigin: famLabel('origin', 'origin'),
      diffNormal: t('guides.difficulty.normal'),
      diffHard: t('guides.difficulty.hard'),
      back: t(k('target.back')),
      seasonTpl,
      episode: episodeLbl,
      waveTpl: t(k('target.wave_label')),
      monstersTpl: t(k('target.monster_count')),
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
      // Mécaniques PERSO (conditions d'état, 10/08/2026) : le NOM du
      // skill/EE/quirk vient du jeu, seul l'habillage passe par les locales.
      mechanics: t(k('context.mechanics')),
      mechanicsHint: t(k('context.mechanics_hint')),
      conds: condLabels,
      // Compteurs § 9.1 (« ×N buffs/débuffs ») — steppers contextuels.
      counters: t(k('context.counters')),
      countersHint: t(k('context.counters_hint')),
      ownBuffs: t(k('context.own_buffs')),
      ownDebuffs: t(k('context.own_debuffs')),
      teamBuffs: t(k('context.team_buffs')),
      tgtBuffs: t(k('context.tgt_buffs')),
      tgtDebuffs: t(k('context.tgt_debuffs')),
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
      bossPassive: t(k('buffs.boss_passive')),
    },
    report: {
      empty: t(k('result.empty')),
      wip: t(k('report.engine_wip')),
      branchesNote: t(k('report.branches_note')),
      normal: t(k('sub.normal')),
      critical: t(k('report.critical')),
      miss: t(k('report.miss')),
      supportSkills: t(k('report.support_skills')),
      unsupported: t(k('report.unsupported')),
      unsupportedHint: t(k('report.unsupported_hint')),
      loading: t(k('report.loading')),
      tablesError: t(k('report.tables_error')),
    },
  };

  // Courbe du Codex (archive), indexée PAR NIVEAU ([0] = niveau 0, [1..11] =
  // les 11 paliers du jeu) : taux ‰ appliqués sur la stat de BASE seule, HORS
  // multiplicateur de buffs (CalcFinalStat, spec formule § 3) — même donnée
  // que la fiche perso (progression.json, extraction de CharacterArchiveStatTemplet).
  const codexTiers = (progressionData as { codex: { atk: number; def: number; hp: number }[] })
    .codex;

  // Buffs MAX_HP (spec formule § 16.2), résolus de la donnée damage — jamais
  // codés en dur : guilde indexée PAR NIVEAU ([0] = sans guilde), titre
  // « Premium Body » (somme des lignes hors guilde — une seule en 1.4.9).
  const damageGrowth = damageGrowthData as {
    guildMaxHp: { level: number; maxHpValue: number }[];
    titleMaxHp: { maxHpValue: number }[];
  };
  const guildTiers: number[] = [0];
  for (const tier of damageGrowth.guildMaxHp) {
    guildTiers[tier.level] = tier.maxHpValue;
  }
  const titleHpPct = damageGrowth.titleMaxHp.reduce((s, t) => s + t.maxHpValue, 0);

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
      codexTiers={codexTiers}
      guildTiers={guildTiers}
      titleHpPct={titleHpPct}
      condBuffNames={condBuffNames}
      lang={lang}
      labels={labels}
    />
  );
}
