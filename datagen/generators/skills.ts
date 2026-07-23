/**
 * Générateur des COMPÉTENCES (CharacterSkillTemplet + …LevelTemplet).
 *
 * Un skill = définition (nom, type, cible, portée, AP, icône) + une desc
 * TEMPLATE (placeholders `[Buff_C/V/T_<id>]`, couleurs source conservées) + des
 * niveaux. Chaque niveau porte les valeurs qui scalent (damageFactor, cool, gains)
 * et les EFFETS appliqués (BuffID → classifier) + les réfs glossaire (BuffToolTip).
 *
 * Patron maison appliqué :
 *   - desc = 1 template (les nombres viennent des effets par niveau → pas 5 phrases) ;
 *   - effets = structurés via le classifier (famille/cat + réf glossaire) ;
 *   - on garde TOUT (skills mécaniques sans nom/desc inclus) — aucun drop silencieux.
 *
 * Le lien desc↔effet se fait par l'id de buff : un placeholder `[Buff_V_<id>]` se
 * résout depuis l'effet du niveau dont `buff === <id>` (ou via la primitive
 * `resolveSkillPlaceholders` côté datagen / front).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  buffRowAtLevel,
  expandBuffIds,
  loadBuffGroups,
  loadBuffIndex,
  resolveSkillPlaceholders,
  skillBuffVars,
  type BuffGroup,
  type SkillBuffVars,
} from '../lib/buff';
import { effectShape, type EffectShape } from '../lib/effects';
import { slugEnum } from '../lib/enums';
import { isMain } from '../lib/is-main';
import type { LangDict } from '../lib/lang';
import { loadTextIndex, resolveText } from '../lib/text';
import { groupBy, loadTable, num, splitCsv, type Row } from '../lib/tables';

const OUT = resolve('.gamedata/staging/skills');

/** Sous-type fonctionnel d'un skill. */
export type SkillSubType = 'active' | 'passive' | null;

/** Données d'un niveau de compétence (seules les clés utiles sont émises). */
export interface SkillLevel {
  level: number;
  /** Multiplicateur de dégâts brut (DamageFactor de la table). */
  damageFactor?: number;
  /** Cooldown (tours) et cooldown initial. */
  cool?: number;
  startCool?: number;
  /** Gains de jauge / ressources à l'usage. */
  gainAP?: number;
  gainCP?: number;
  /** Réduction de jauge de garde infligée. */
  wgReduce?: number;
  /**
   * Valeurs scalantes par id de buff (chance/valeur/tours). Sert la desc
   * (`[Buff_C/V/T_<id>]`) ET les nombres des chips d'effet. Un buff absent ici
   * = inactif à ce niveau.
   */
  vars?: Record<string, SkillBuffVars>;
  /** Réfs vers le glossaire des statuts (BuffToolTipTemplet). */
  tooltips?: string[];
  /** Notes d'amélioration de niveau (« +10% damage »), résolues, non vides. */
  upgrades?: LangDict[];
  /**
   * Desc PROPRE à ce niveau — uniquement pour les skills dont la desc vit sur
   * les lignes de niveau (passif de transcendance : chaque palier a son texte
   * officiel `SE_DESC_SKILL08_*`, « +4% Ally Team Critical Damage »…).
   */
  desc?: LangDict;
}

/** Une compétence (source unique, référencée par les personnages). */
export interface Skill {
  id: string;
  name: LangDict;
  /** Template de description (placeholders + couleurs source), si présent. */
  desc?: LangDict;
  /** Famille de skill (slug de SkillType : first/second/ultimate/class_passive…). */
  type: string;
  subType: SkillSubType;
  /** Inflige des dégâts (ou attaque en chaîne) — vs support/heal/buff. */
  offensive: boolean;
  /** Cible (slug minuscule de TargetTeamType) si applicable. */
  target?: string;
  /** Portée (slug minuscule de RangeType) si applicable. */
  range?: string;
  icon?: string;
  /** Coût en points d'action (premier palier). */
  requireAP?: number;
  /**
   * Coûts d'AP des bursts 1/2/3 (RequireAP en CSV) — présent UNIQUEMENT sur le
   * skill « burstable » du perso (un seul par perso ; burst 3 déverrouillé à la
   * transcendance 5★). Les skills SKT_BURST_1..3 sont ses déclinaisons.
   */
  burstAP?: number[];
  /**
   * Structure des effets appliqués (famille/cat/cible/stat + id de buff),
   * INVARIANTE par niveau et définie une seule fois. Les nombres vivent dans
   * `levels[i].vars[buff]`. Union des buffs vus sur tous les niveaux.
   */
  effects?: EffectShape[];
  maxLevel: number;
  levels: SkillLevel[];
}

/** Sortie du générateur : catalogue de compétences référençable par id. */
export interface SkillData {
  skills: Record<string, Skill>;
}

/**
 * Valeur d'enum de cible/portée → slug minuscule. Sur un CSV (plusieurs cibles),
 * on garde le 1er token ; `undefined` seulement si NONE ou vide.
 */
function slugTeam(v: string | undefined): string | undefined {
  const first = splitCsv(v ?? '')[0];
  if (!first || first === 'NONE') return undefined;
  return first.toLowerCase();
}

/** Sous-type ACTIVE/PASSIVE → slug, sinon null. */
function subTypeOf(v: string | undefined): SkillSubType {
  if (v === 'ACTIVE') return 'active';
  if (v === 'PASSIVE') return 'passive';
  return null;
}

/**
 * Variante du CŒUR D'ASSEMBLAGE partagé (`assembleSkill`) — UN SEUL axe de
 * variation réel entre les deux tables :
 *   - `character` : les lignes de niveau portent GainAP/GainCP (jauge joueur)
 *     et un DescID (repli de desc principale + notes d'amélioration) ;
 *   - `monster` : rien de tout ça (pas de jauge, pas de DescID de niveau).
 * Un seul discriminant (pas deux flags) : les combinaisons incohérentes sont
 * irreprésentables. RequireAP/burstAP, buffs de chaîne et buffs « ambiants »
 * PriorityGroup sont aussi propres aux persos — gérés par l'appelant, pas ici.
 */
export type AssembleVariant = 'character' | 'monster';

/** Sortie du cœur d'assemblage : le skill SANS `effects` (finalisé par
 * l'appelant, qui peut d'abord enrichir `shapes` — chaîne/ambiants persos). */
export interface AssembledSkill {
  skill: Skill;
  /** Effets structurés collectés (union des niveaux) — à poser sur `effects`. */
  shapes: EffectShape[];
  /** Buffs déjà émis dans `shapes` (dédup des enrichissements appelant). */
  seen: Set<string>;
  /** PriorityGroups des buffs posés (lien vers les buffs ambiants persos). */
  prioGroups: Set<string>;
  /** Statuts que le jeu AFFICHE lui-même sur le skill (BuffToolTip). */
  levelTooltips: Set<string>;
}

/**
 * Assemble un skill depuis sa ligne de table + ses lignes de niveau : desc
 * template, niveaux (vars scalantes par buff), backfill des vars cités par la
 * desc, target/range/icône, union des effets structurés. MÊME CONTRAT de
 * sortie pour CharacterSkill* et MonsterSkill* (cf. monster-skills).
 */
export function assembleSkill(
  s: Row,
  rawLvlRows: Row[],
  buffs: ReturnType<typeof loadBuffIndex>,
  groups: Map<string, BuffGroup>,
  tskill: Map<string, LangDict>,
  variant: AssembleVariant = 'monster',
): AssembledSkill {
  const forCharacter = variant === 'character';
  const lvlRows = rawLvlRows.slice().sort((a, b) => num(a.SkillLevel) - num(b.SkillLevel));
  const lvl1 = lvlRows[0];

  // Desc principale = DescID du skill (template), sinon (persos) DescID du
  // niveau 1 — cas des passifs uniques dont la desc vit sur la ligne de niveau.
  const mainOnSkill = !!s.DescID;
  const descKey =
    splitCsv(s.DescID ?? '')[0] || (forCharacter ? splitCsv(lvl1?.DescID ?? '')[0] : '') || '';
  const desc = descKey ? resolveText(tskill, descKey) : undefined;

  const maxLevel = num(lvlRows[lvlRows.length - 1]?.SkillLevel) || lvlRows.length || 1;

  const type = slugEnum(s.SkillType ?? '');
  const levels = lvlRows.map((r) =>
    buildLevel(r, buffs, groups, tskill, mainOnSkill, forCharacter),
  );
  const skill: Skill = {
    id: s.ID,
    name: resolveText(tskill, s.NameID),
    type,
    subType: subTypeOf(s.SkillSubType),
    // Offensif = inflige des dégâts, ou attaque en chaîne (toujours offensive).
    offensive: levels.some((l) => (l.damageFactor ?? 0) > 0) || type === 'chain_passive',
    maxLevel,
    levels,
  };
  if (desc && desc.en) skill.desc = desc;

  // Vars des buffs référencés par la DESC mais portés par un AUTRE skill
  // (formes de combat : le S1 de Demiurge Luna cite `[Buff_T_2000120_1_1]`,
  // buff du kit jumeau) — résolution GLOBALE par id de buff, niveau à niveau.
  if (skill.desc) {
    const refIds = new Set([...skill.desc.en.matchAll(/\[Buff_[CVT]_(.+?)\]/g)].map((m) => m[1]));
    for (const lv of skill.levels) {
      for (const refId of refIds) {
        if (lv.vars?.[refId]) continue;
        const v = skillBuffVars(buffs, refId, lv.level);
        if (v.c || v.v || v.t) (lv.vars ??= {})[refId] = v;
      }
    }
  }
  const target = slugTeam(s.TargetTeamType);
  if (target) skill.target = target;
  const range = slugTeam(s.RangeType);
  if (range) skill.range = range;
  if (s.IconName) skill.icon = s.IconName;

  // Structure des effets : union des buffs vus sur tous les niveaux (ordre
  // d'apparition), forme invariante prise au niveau max.
  const shapes: EffectShape[] = [];
  const seen = new Set<string>();
  // Groupes de priorité des buffs posés par ce skill (buffs « ambiants »
  // conditionnés — exploités par l'appelant persos).
  const prioGroups = new Set<string>();
  // Statuts que le jeu AFFICHE lui-même sur le skill (colonne BuffToolTip).
  const levelTooltips = new Set(lvlRows.flatMap((r) => splitCsv(r.BuffToolTip ?? '')));
  for (const r of lvlRows) {
    for (const { id: buffId, choice, child } of expandBuffIds(
      splitCsv(r.BuffID ?? ''),
      buffs,
      groups,
      maxLevel,
    )) {
      if (seen.has(buffId)) continue;
      const row = buffRowAtLevel(buffs, buffId, maxLevel);
      if (!row) continue;
      // Marqueur MOTEUR : un `BT_NONE` enfant de groupe n'applique rien — si
      // le jeu ne le liste pas lui-même sur le skill (BuffToolTip), son
      // ToolTipID est du câblage, souvent RECYCLÉ d'un autre kit (l'ultimate
      // du Guardian 131644 pointait « Random Debuff » du kit 4044xxx).
      if (child && row.Type === 'BT_NONE' && !levelTooltips.has(row.ToolTipID ?? '')) continue;
      seen.add(buffId);
      if (row.PriorityGroup) prioGroups.add(row.PriorityGroup);
      const shape = effectShape(row);
      if (choice) shape.choice = true;
      shapes.push(shape);
    }
  }

  return { skill, shapes, seen, prioGroups, levelTooltips };
}

export function buildSkills(): SkillData {
  const buffs = loadBuffIndex();
  const groups = loadBuffGroups();
  const tskill = loadTextIndex('TextSkill');
  const skillRows = loadTable('CharacterSkillTemplet');
  const levelsBySkill = groupBy(loadTable('CharacterSkillLevelTemplet'), 'SkillID');

  // Propriétaire d'un skill (id de perso) + buffs référencés par AU MOINS un
  // niveau de skill : sert à rattacher les buffs de chaîne câblés par pure
  // CONVENTION `{charId}_chain*` (persos anciens, ex. Rin — aucun niveau ne les
  // référence, le jeu les applique via BuffCreateType CHAIN_*).
  const ownerBySkill = new Map<string, string>();
  for (const c of loadTable('CharacterTemplet')) {
    if (c.Type !== 'CT_PC') continue;
    // Les skins partagent les skills de leur base : seule la ligne à IDENTITÉ
    // PROPRE (NameID = `<ID>_Name`) est le vrai propriétaire.
    const own = c.NameID === `${c.ID}_Name`;
    for (let i = 1; i <= 23; i++) {
      const sid = c[`Skill_${i}`];
      if (sid && (own || !ownerBySkill.has(sid))) ownerBySkill.set(sid, c.ID);
    }
  }
  const referencedBuffs = new Set<string>();
  for (const l of loadTable('CharacterSkillLevelTemplet'))
    for (const id of splitCsv(l.BuffID ?? '')) referencedBuffs.add(id);

  const skills: Record<string, Skill> = {};

  for (const s of skillRows) {
    const id = s.ID;
    if (!id) continue;
    // Cœur partagé persos/monstres ; les options activent les spécificités
    // des lignes de niveau perso (GainAP/GainCP, DescID de niveau).
    const { skill, shapes, seen, prioGroups, levelTooltips } = assembleSkill(
      s,
      levelsBySkill.get(id) ?? [],
      buffs,
      groups,
      tskill,
      'character',
    );
    const maxLevel = skill.maxLevel;
    if (num(s.RequireAP) > 0) {
      skill.requireAP = num(s.RequireAP);
      const costs = splitCsv(s.RequireAP ?? '').map(num);
      if (costs.length > 1) skill.burstAP = costs;
    }

    const cid = ownerBySkill.get(id);
    // Buffs de chaîne par convention (jamais référencés par un niveau) →
    // rattachés au skill chain_passive du propriétaire.
    if (s.SkillType === 'SKT_CHAIN_PASSIVE' && cid) {
      for (const [buffId] of buffs) {
        if (!buffId.startsWith(`${cid}_chain`) || buffId.endsWith('_old')) continue;
        if (referencedBuffs.has(buffId) || seen.has(buffId)) continue;
        const row = buffRowAtLevel(buffs, buffId, maxLevel);
        if (!row) continue;
        seen.add(buffId);
        shapes.push(effectShape(row));
      }
    }
    // Buffs « ambiants » du perso conditionnés à un buff posé par CE skill
    // (Omega Nadja : l'Irregular Infection de l'ultimate — PriorityGroup —
    // active les `{cid}_buff_*` qui étendent les durées, jamais référencés
    // par un niveau). Lien : BuffConditionValue = PriorityGroup.
    if (cid && prioGroups.size) {
      // Dédup par type+stat : les variantes de palier (`_1_*` vs `_2_*`)
      // décrivent le même effet — une seule chip.
      const ambientSeen = new Set(shapes.map((sh) => `${sh.type}|${sh.stat ?? ''}`));
      for (const [buffId] of buffs) {
        if (!buffId.startsWith(`${cid}_`) || buffId.endsWith('_old')) continue;
        if (referencedBuffs.has(buffId) || seen.has(buffId)) continue;
        const row = buffRowAtLevel(buffs, buffId, maxLevel);
        if (!row) continue;
        const cond = row.BuffConditionType ?? '';
        if (cond !== 'OWNER_HAS_BUFF' && cond !== 'TARGET_HAS_BUFF') continue;
        if (!prioGroups.has(row.BuffConditionValue ?? '')) continue;
        for (const { id: xid, choice, child } of expandBuffIds([buffId], buffs, groups, maxLevel)) {
          if (seen.has(xid)) continue;
          const xrow = buffRowAtLevel(buffs, xid, maxLevel);
          if (!xrow) continue;
          // Même filtre des marqueurs moteur que la boucle principale.
          if (child && xrow.Type === 'BT_NONE' && !levelTooltips.has(xrow.ToolTipID ?? ''))
            continue;
          seen.add(xid);
          const shape = effectShape(xrow);
          const key = `${shape.type}|${shape.stat ?? ''}`;
          if (ambientSeen.has(key)) continue;
          ambientSeen.add(key);
          if (choice) shape.choice = true;
          shapes.push(shape);
        }
      }
    }
    if (shapes.length) skill.effects = shapes;

    skills[id] = skill;
  }

  return { skills };
}

/** Construit un niveau de skill : valeurs scalantes + vars (par buff) + réfs.
 * `forCharacter` active les champs propres aux persos (cf. `AssembleVariant`). */
function buildLevel(
  r: Row,
  buffs: ReturnType<typeof loadBuffIndex>,
  groups: Map<string, BuffGroup>,
  tskill: Map<string, LangDict>,
  mainOnSkill: boolean,
  forCharacter: boolean,
): SkillLevel {
  const level = num(r.SkillLevel) || 1;
  const out: SkillLevel = { level };
  if (num(r.DamageFactor) > 0) out.damageFactor = num(r.DamageFactor);
  if (num(r.Cool) > 0) out.cool = num(r.Cool);
  if (num(r.StartCool) > 0) out.startCool = num(r.StartCool);
  if (forCharacter) {
    if (num(r.GainAP) > 0) out.gainAP = num(r.GainAP);
    if (num(r.GainCP) > 0) out.gainCP = num(r.GainCP);
  }
  if (num(r.WGReduce) > 0) out.wgReduce = num(r.WGReduce);

  // Valeurs scalantes par buff (chance/valeur/tours), à CE niveau.
  const vars: Record<string, SkillBuffVars> = {};
  for (const { id: buffId } of expandBuffIds(splitCsv(r.BuffID ?? ''), buffs, groups, level)) {
    const v = skillBuffVars(buffs, buffId, level);
    if (v.c || v.v || v.t) vars[buffId] = v;
  }
  if (Object.keys(vars).length) out.vars = vars;

  // Réfs glossaire (statuts nommés affichés pour ce skill).
  const tooltips = splitCsv(r.BuffToolTip ?? '');
  if (tooltips.length) out.tooltips = tooltips;

  // Notes d'amélioration de niveau : seulement quand la desc principale est sur
  // le skill (sinon le DescID du niveau EST la desc du niveau, émise telle quelle).
  if (forCharacter) {
    if (mainOnSkill && r.DescID) {
      const ups = splitCsv(r.DescID)
        .map((k) => resolveText(tskill, k))
        .filter((d) => d.en);
      if (ups.length) out.upgrades = ups;
    } else if (!mainOnSkill && r.DescID) {
      const d = resolveText(tskill, splitCsv(r.DescID)[0]);
      if (d.en) out.desc = d;
    }
  }

  return out;
}

// --- staging -----------------------------------------------------------------

function main(): void {
  mkdirSync(OUT, { recursive: true });
  const buffs = loadBuffIndex();
  const { skills } = buildSkills();
  writeFileSync(resolve(OUT, 'skills.json'), JSON.stringify({ skills }, null, 2));

  // Échantillon lisible : les skills de K (2000001), descs résolues par niveau.
  const ch = loadTable('CharacterTemplet').find((c) => c.ID === '2000001');
  const ids: string[] = [];
  for (let i = 1; i <= 23; i++) if (ch?.[`Skill_${i}`]) ids.push(ch[`Skill_${i}`]);
  const strip = (s: string) => s.replace(/<color=#[0-9a-fA-F]+>/g, '').replace(/<\/color>/g, '');
  const sample = ids
    .map((id) => skills[id])
    .filter(Boolean)
    .map((sk) => ({
      id: sk.id,
      type: sk.type,
      name: sk.name.en,
      descTemplate: sk.desc ? strip(sk.desc.en) : null,
      descByLevel: sk.desc
        ? [1, sk.maxLevel].map(
            (lv) => `Lv${lv}: ${strip(resolveSkillPlaceholders(sk.desc!.en, buffs, lv))}`,
          )
        : null,
      effects: sk.effects?.map((e) => {
        const v = sk.levels[0]?.vars?.[e.buff ?? ''];
        const num = v
          ? [v.c, v.v && `${e.stat ?? ''}${v.v}`, v.t && `${v.t}t`].filter(Boolean).join(' ')
          : '';
        return `${e.family}/${e.category}${num ? ` (${num})` : ''}`;
      }),
    }));
  writeFileSync(resolve(OUT, 'sample-K.json'), JSON.stringify(sample, null, 2));

  const list = Object.values(skills);
  console.log(`skills: ${list.length}`);
  console.log(`  avec desc: ${list.filter((s) => s.desc).length}`);
  console.log(`  avec effets: ${list.filter((s) => s.effects?.length).length}`);
  console.log(
    `  actifs/passifs/none: ${list.filter((s) => s.subType === 'active').length}/${list.filter((s) => s.subType === 'passive').length}/${list.filter((s) => s.subType === null).length}`,
  );
  console.log(`staging: ${OUT}`);
}

// Exécution directe uniquement (importable sans effet de bord par l'orchestrateur).
if (isMain(import.meta.url)) main();
