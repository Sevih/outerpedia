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
  type GearFamily,
} from '@/lib/data/equipment';
import {
  bossWaveMonsters,
  difficultyLabel,
  encounterSpawnContexts,
  modeLabel,
  type Encounter,
} from '@/lib/data/encounters';
import { getMonster } from '@/lib/data/monsters';
import { statName } from '@/lib/data/stat-glossary';
import { statAbbr } from '@/lib/stats';
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
import encountersData from '@data/generated/encounters.json';
import quirksRaw from '@data/generated/quirks.json';
import {
  DamageCalculatorBrowser,
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

/** Monad hors périmètre du calculateur (décision Sevih 26/07/2026). */
const EXCLUDED_MODES = new Set(['monad_battle_1', 'monad_battle_2']);

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
    });
  }
  chars.sort((a, b) => b.rarity - a.rarity || a.label.localeCompare(b.label));

  // Passifs d'arme/accessoire par palier de breakthrough (T0..T4 = values 1..5),
  // avec les VARIANTES PAR CLASSE quand la famille en a (Briareos/Gorgon).
  const tiersOf = (refs: GearFamily['passives']): string[] =>
    [1, 2, 3, 4, 5].map((tier) => passiveTextAt(refs, tier, lang) ?? '');
  const gearOf = (families: GearFamily[]): DcGear[] =>
    families
      .filter((f) => f.passives.length)
      .map((f) => ({
        slug: f.slug,
        label: lRec(f.name, lang) || f.name.en,
        icon: f.icon,
        grade: f.grade,
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
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

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
      text: f.passives.length ? (gearPassivesText(f.passives, lang, false) ?? null) : null,
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
    ees[e.characterId] = {
      name: lRec(e.name, lang) || e.name.en,
      src: img.ee(e.characterId),
      grade: e.grade,
      star: e.star,
      rows,
    };
  }

  // Presets de cible : TOUS les donjons peuplés d'encounters.json qui alignent
  // un boss (monad écarté), dans l'ordre du jeu — mode → donjon → contexte.
  const targets: DcTarget[] = [];
  for (const [id, ref] of Object.entries(DUNGEONS)) {
    if (!ref.monsters?.length || EXCLUDED_MODES.has(ref.mode)) continue;
    const e: Encounter = { id, ref, monsters: ref.monsters };
    const wave = bossWaveMonsters(e);
    const boss = wave.find((m) => m.role === 'boss');
    if (!boss) continue;
    const monster = getMonster(boss.id);
    if (!monster) continue;
    const diff = difficultyLabel(ref, lang, t);
    const spawns = encounterSpawnContexts(e, boss, lang).map((s, i) => ({
      label:
        s.stageLabel ??
        (s.rank ? `Rank ${s.rank}` : s.stage ? `#${s.stage}` : i ? `#${i + 1}` : ''),
      level: s.level,
      ...(s.hpLines ? { hpLines: s.hpLines } : {}),
      ...(s.adv
        ? {
            advLabel: Object.entries(s.adv)
              .map(([slug, v]) => `${statAbbr(slug)} ${v > 0 ? '+' : ''}${v / 10}%`)
              .join(' · '),
          }
        : {}),
    }));
    if (!spawns.length) continue;
    targets.push({
      id,
      mode: modeLabel(ref, lang),
      label: `${lRec(ref.name, lang) || ref.name.en}${diff ? ` · ${diff}` : ''}`,
      name: lRec(monster.name, lang) || monster.name.en,
      // Règle d'icône de monstre (miroir de `monsterIconSrc`, serveur only) :
      // icône '2…' = modèle de perso → face, sinon portrait de boss MT_*.
      iconSrc: monster.icon.startsWith('2')
        ? img.face(monster.icon)
        : img.boss(`MT_${monster.icon}`),
      element: monster.element,
      spawns,
    });
  }

  const statFields: DcStatField[] = SHEET_STATS.map(({ slug, percent }) => ({
    key: slug,
    label: statName(slug, lang),
    percent,
  }));

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
      buffs: t(k('panel.buffs')),
      result: t(k('panel.result')),
    },
    title: t('tools.damage-calculator'),
    pick: t(k('attacker.pick')),
    pickCharacter: t('tools.team-planner.pick_character'),
    transcend: t(k('attacker.tier_label')),
    skills: {
      title: t(k('attacker.skill_levels')),
      dmg: t(k('attacker.tag_dmg')),
      support: t('filters.roles.support'),
    },
    settings: {
      title: t(k('settings.title')),
      subtitle: t(k('settings.subtitle')),
      quirks: t(k('settings.quirks')),
    },
    equipment: {
      title: t(k('equipment.title')),
      sets: t(k('equipment.sets')),
      addSet: t(k('equipment.add_set')),
      breakthrough: t('equip.detail.breakthrough'),
      weapon: t('page.character.gear.weapon'),
      accessory: t(k('equipment.accessory')),
      ee: t(k('equipment.ee')),
      eeNone: t(k('equipment.ee_no_data')),
      noPassive: t(k('equipment.no_passive_data')),
      pickWeapon: t(k('equipment.pick_weapon')),
      pickAccessory: t(k('equipment.pick_accessory')),
      pickTalisman: t(k('equipment.pick_talisman')),
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
      monster: t(k('target.monster')),
      character: t('changelog.type.character'),
      mode: t(k('target.mode')),
      resolved: t(k('target.resolved')),
      lv: t(k('target.lv_prefix')),
      boss: t(k('target.boss_badge')),
      hpBars: t(k('target.hp_bars')),
      stage: t(k('target.stage')),
      fight: t(k('target.fight')),
    },
    context: {
      title: t(k('context.title')),
      contentType: t(k('context.content_type')),
      types: {
        pve: t(k('context.type_pve')),
        arena: t(k('context.type_arena')),
        rtpvp: t(k('context.type_rtpvp')),
        worldboss: t('progress.task.world-boss'),
      },
      targetsHit: t(k('context.targets_hit')),
      penaltyCycle: t(k('context.penalty_cycle')),
      penaltyNote: t(k('context.penalty_note')),
    },
    team: {
      emptySlot: t(k('team.empty')),
    },
    buffs: {
      fromKits: t(k('buffs.from_kits')),
      kitsSoon: t(k('buffs.kits_soon')),
      onAttacker: t(k('buffs.on_attacker')),
      onTarget: t(k('buffs.on_target')),
      value: t(k('buffs.value')),
      stacks: t(k('buffs.stacks')),
    },
    report: {
      empty: t(k('result.empty')),
      wip: t(k('report.engine_wip')),
      branchesNote: t(k('report.branches_note')),
      normal: t(k('sub.normal')),
      critical: t(k('report.critical')),
      miss: t(k('report.miss')),
      expected: t(k('report.expected')),
      expectedNote: t(k('report.expected_note')),
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
      quirks={quirks}
      labels={labels}
    />
  );
}
