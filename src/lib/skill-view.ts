/**
 * Vues « kit de skills » pré-localisées — partagées entre la fiche publique et
 * le panneau admin (même rendu, données construites UNE fois ici).
 *
 * Rappels modèle : les buffs/debuffs de l'attaque en CHAÎNE vivent sur les
 * skills techniques `strike_*` (selon la position du perso dans la chaîne),
 * ceux de l'attaque DUO sur `backup_*` ; le `chain_passive` porte le texte des
 * deux moitiés (titres colorés + saut de ligne). Les WGR réels par niveau
 * vivent aussi sur strike/backup.
 */
import type { Glossaries, Skill } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { MAIN_SKILL_TYPES, levelAt, splitChainDual } from '@/lib/skills';
import { getMergedEffect, loadCuratedEffects } from '@/lib/data/effects';
import type { ClientEffect, StatusMap } from '@/components/character/EffectChips';
import type { ChainLevel } from '@/components/character/ChainDualSection';
import glossariesData from '@data/generated/glossaries.json';

const G = glossariesData as unknown as Glossaries;

/** Dédoublonne par id (les listes de skills des persos à formes en répètent). */
export function dedupSkills(skills: Skill[]): Skill[] {
  const seen = new Set<string>();
  return skills.filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}

type RawEffect = NonNullable<Skill['effects']>[number];

/** Labels de CÂBLAGE générique (magnitude pure, « Damage Increase ») — jamais
 * des statuts côté joueur, même résolubles (arbitrage V2 : 2000114/2000057…). */
const WIRING_LABELS = new Set(['SYS_BUFF_DMG']);

/** Buffs ARBITRÉS non-chips (arbitrages utilisateur 2026-07-07) :
 * - Ais `2000096_chain_1_1` : modificateur de l'ATTAQUE elle-même encodé comme
 *   buff à tooltip — indiscernable d'un vrai buff dans les tables (mêmes
 *   durée/valeur), seule la desc le dit (« Increases Critical Damage of the
 *   attack »).
 * - Astei/Ember `2000059_1_1`/`2000094_1_3` : déclencheurs d'attaque renforcée
 *   câblés avec le label SYS_BUFF_REVENGE_HEAL → chip « Agile Response »
 *   erronée (le label est légitime ailleurs, ex. Christina). */
const NON_CHIP_BUFFS = new Set(['2000096_chain_1_1', '2000059_1_1', '2000094_1_3']);

/**
 * Upgrade de TRANSCENDANCE : buff `trancendent_*` NON accordé au NIVEAU 1 du
 * skill porteur. Le niveau 1 d'un unique_passive fait partie du kit de base
 * (Dual Attack du S1 d'Eva : `trancendent_8_call_back_up_1`) ; les niveaux
 * suivants sont les paliers de transcendance, affichés dans leur section
 * (cool3 de 2000090 : accordé au niveau 2 seulement).
 */
function isTranscendUpgrade(s: Skill, e: RawEffect): boolean {
  const b = e.buff ?? '';
  if (!b.startsWith('trancendent') && !b.startsWith('transcendent')) return false;
  // Effet RATTACHÉ à un skill principal (`caller`) : il décrit ce que CE skill
  // fait, même débloqué par la transcendance (Unbuffable du S2 d'E.Tamamo sur
  // cible Water ; 2e Dual Attack du S1 d'Eva). Il appartient à la carte du
  // skill — seuls les paliers AUTONOMES (sans caller) restent cantonnés à la
  // section transcendance.
  if (e.caller) return false;
  return !s.levels[0]?.vars?.[b];
}

let curatedKeyCache: Map<string, string> | undefined;

/** `nature|type` → id de CRÉATION curée (`keys` de data/curated/effects.json) —
 * mécaniques sans texte dans les tables, nommées par la curation (« Extinction »
 * pour BT_SEALED_RESURRECTION…). Même pont que les passifs d'équipement. */
function curatedCreationFor(side: 'buff' | 'debuff', type: string): string | undefined {
  if (!curatedKeyCache) {
    curatedKeyCache = new Map();
    for (const [id, c] of Object.entries(loadCuratedEffects())) {
      const s = (c.isDebuff ?? getMergedEffect(id)?.isDebuff) ? 'debuff' : 'buff';
      for (const k of c.keys ?? []) {
        const key = `${s}|${k}`;
        if (!curatedKeyCache.has(key)) curatedKeyCache.set(key, id);
      }
    }
  }
  return (
    curatedKeyCache.get(`${side}|${type}`) ??
    curatedKeyCache.get(`${side === 'buff' ? 'debuff' : 'buff'}|${type}`)
  );
}

/**
 * Un effet de skill devient une CHIP s'il référence un statut/mécanique NOMMÉ
 * et RÉSOLUBLE : tooltip du glossaire, label de mécanique non-stat, ou — pour
 * les mécaniques sans texte — la CRÉATION curée adressée par type. Exclusions
 * (câblage, jamais des buffs côté joueur — même règle que le contrôle V2) :
 * `BT_STAT*`/`BT_NONE` à label seul, labels de magnitude générique
 * (SYS_BUFF_DMG), enfants de groupe aléatoire (le statut du groupe fait la
 * chip), dégâts fixes auto-infligés (coût en HP, pas une attaque — 2000024).
 * Les upgrades de transcendance sont filtrés en amont (`isTranscendUpgrade`,
 * qui a besoin du skill porteur).
 */
function toChipEffect(e: RawEffect): ClientEffect | null {
  if (e.choice) return null;
  if (e.buff && NON_CHIP_BUFFS.has(e.buff)) return null;
  const base = {
    family: e.family,
    category: e.category,
    buff: e.buff,
    stat: e.stat,
    mode: e.mode,
  };
  if (e.tooltip && (G.effectByTooltip[e.tooltip] ?? getMergedEffect(e.tooltip)))
    return { ...base, tooltip: e.tooltip };
  const isStatLike = e.type === 'BT_STAT' || e.type === 'BT_STAT_PREMIUM' || e.type === 'BT_NONE';
  if (e.label && !isStatLike && !WIRING_LABELS.has(e.label) && G.effectByLabel[e.label])
    return { ...base, label: e.label };
  // « Dégâts fixes » (reverse heal) ciblés sur le LANCEUR ou un allié = coût
  // en HP du kit, pas des dégâts infligés — jamais une chip.
  if (e.type.startsWith('BT_REVERSE_HEAL') && !(e.target ?? '').startsWith('enemy')) return null;
  // Pont curé par TYPE (la `stat` de ces types est une base de CALCUL — % des
  // HP de la cible pour les dégâts fixes — pas un buff de stat).
  if (!isStatLike) {
    const side = e.category === 'buff' ? 'buff' : 'debuff';
    const cid = curatedCreationFor(side, e.type);
    if (cid) return { ...base, tooltip: cid };
  }
  return null;
}

/** Effets structurés d'un skill → forme client (chips affichables seulement). */
export function toClientEffects(s: Skill): ClientEffect[] | undefined {
  return s.effects
    ?.filter((e) => !isTranscendUpgrade(s, e))
    .map(toChipEffect)
    .filter((e): e is ClientEffect => Boolean(e));
}

/** Composite type|stat d'un effet brut — même clé que `Glossaries.tooltipKinds`. */
function kindOf(e: RawEffect): string {
  return e.stat ? `${e.type}|${e.stat}` : e.type;
}

/**
 * Les 3 skills principaux, dans l'ordre d'affichage. Certains persos ont des
 * VARIANTES du même type à 1 niveau (formes/états, ex. 2000001) : on garde la
 * version complète (le plus de niveaux).
 */
export function mainSkills(skills: Skill[]): Skill[] {
  return MAIN_SKILL_TYPES.map((type) => {
    const candidates = skills.filter((s) => s.type === type);
    return candidates.sort((a, b) => b.levels.length - a.levels.length)[0];
  }).filter((s): s is Skill => Boolean(s));
}

/**
 * Statuts nommés référencés par les effets des skills (chips) : nom, nature,
 * icône et description depuis les effets FUSIONNÉS (les overrides curés de
 * /admin/effects comptent) — utilisé par le site ET l'admin.
 */
export function buildStatusMap(skills: Skill[], lang: Lang): StatusMap {
  const statuses: StatusMap = {};
  const burstable = mainSkills(skills).find((s) => s.burstAP?.length);
  mergeStatusEffects(
    statuses,
    [
      // Chips affichables (mêmes réfs que les cartes — ponts curés inclus).
      ...skills.flatMap((s) => toClientEffects(s) ?? []),
      // Statuts affichés par les niveaux (Heavy Strike…) — sans dédup ici :
      // une entrée de plus dans la map est inoffensive sans chip.
      ...skills.flatMap((s) => levelTooltipEffects(s)),
      // Effets synthétiques (bonus WG des bursts) — leur statut vient d'une
      // création curée, résolue par id directement.
      ...(burstable ? syntheticBurstEffects(skills) : []),
    ],
    lang,
  );
  return statuses;
}

/** Ajoute au StatusMap les statuts référencés par des effets SUPPLÉMENTAIRES
 * (passifs d'EE/talisman…) — même résolution que les skills. */
export function mergeStatusEffects(
  statuses: StatusMap,
  effects: ClientEffect[],
  lang: Lang,
): StatusMap {
  for (const e of effects) {
    const key = e.tooltip ?? e.label;
    if (!key || statuses[key]) continue;
    // Tooltip du jeu → effet canonique ; sinon le tooltip EST un id d'effet
    // (créations curées des effets synthétiques).
    const effId = e.tooltip
      ? (G.effectByTooltip[e.tooltip] ?? e.tooltip)
      : G.effectByLabel[e.label!];
    const eff = effId ? getMergedEffect(effId) : undefined;
    if (eff) {
      // Les variantes irremovable sont des EFFETS distincts (icône à cadre
      // spécial portée par l'effet lui-même — jamais recolorée à l'affichage).
      statuses[key] = {
        name: lRec(eff.name, lang),
        isDebuff: eff.isDebuff,
        icon: eff.icon || undefined,
        desc: lRec(eff.desc, lang) || eff.desc.en || undefined,
        hidden: eff.hidden || undefined,
      };
    }
  }
  return statuses;
}

/** Création curée référencée par le bonus WG synthétique (id = clé principale). */
const WG_BONUS_KEY = 'WEAKNESS_GAUGE_DAMAGE';

/** Un burst affiche un bonus de jauge de faiblesse (texte du jeu). */
const WG_TEXT = /weakness gauge|\bwg\b/i;

/**
 * Effets SYNTHÉTIQUES du kit burstable : un burst « +N WG damage » (Anarky,
 * Rey…) n'est pas un buff dans les tables — on matérialise la chip via la
 * création curée WEAKNESS_GAUGE_DAMAGE (même règle que le contrôle V2).
 * Le marqueur est le TEXTE du burst, pas le `wgReduce` brut : plusieurs kits
 * (Astei, Christina, Luna) ont un WGReduce de burst supérieur dans les tables
 * sans que le jeu ne l'affiche — vérifié en jeu, la V2 ne les listait pas.
 */
function syntheticBurstEffects(skills: Skill[]): ClientEffect[] {
  const bursts = skills.filter((b) => b.type.startsWith('burst_'));
  // \n littéraux normalisés : « …\nWG » n'offre pas de frontière de mot.
  if (bursts.some((b) => WG_TEXT.test((b.desc?.en ?? '').replace(/\\n/g, ' ')))) {
    return [{ family: 'damage', category: 'buff', tooltip: WG_BONUS_KEY }];
  }
  return [];
}

/**
 * Statuts AFFICHÉS par les niveaux du skill (`BuffToolTip` — « Heavy Strike »)
 * sans être appliqués par un buff : le jeu les montre sur le skill, nous
 * aussi. Rendus comme des buffs (la nature réelle vient du statut résolu).
 * Seuls les VRAIS statuts (icône) passent : les tooltips sans icône (Burst
 * Skill, Chain Start…) sont des textes d'explication de mécanique, pas des
 * chips.
 */
function levelTooltipEffects(
  s: Skill,
  ctx?: { refs: Set<string | undefined>; kinds: Set<string> },
): ClientEffect[] {
  const present = new Set((s.effects ?? []).map((e) => e.tooltip).filter(Boolean));
  // Tooltips du NIVEAU MAX (ce que le jeu affiche au palier consulté), PAS
  // l'union des niveaux : une réf erronée sur un niveau intermédiaire (S1 de
  // 2000053 : le niveau 3 seul pointe « Buff Duration Reduction ») ferait une
  // chip fantôme. Un seul skill du jeu a des tooltips variant entre niveaux —
  // cette coquille précisément.
  const ids = new Set(s.levels[s.levels.length - 1]?.tooltips ?? []);
  // Statut cité comme CONDITION par la desc (« if the caster has a Barrier »,
  // S1 de 2000103) : le jeu référence son tooltip pour lecture, mais le skill
  // ne l'accorde pas — pas une chip.
  const desc = (s.desc?.en ?? '').replace(/\\n/g, ' ');
  const isCondition = (name: string | undefined) =>
    Boolean(name) &&
    new RegExp(
      `(?:if|when)[^.]*\\bha(?:s|ve)\\b[^.]*${name!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
      'i',
    ).test(desc);
  return [...ids]
    .filter((t) => {
      // Déjà représenté par une chip du kit : même réf (chips de passifs
      // attribués — Pureblood's Dominion, 2000035)…
      if (present.has(t) || ctx?.refs.has(t)) return false;
      const eff = getMergedEffect(G.effectByTooltip[t] ?? t);
      if (!eff?.icon) return false;
      // …ou même TYPE de mécanique sous un statut custom : le générique est
      // une redite (« Execution time! » ⊃ « Increased Damage Taken », 2000020).
      if (ctx && (G.tooltipKinds?.[t] ?? []).some((k) => ctx.kinds.has(k))) return false;
      if (isCondition(eff.name?.en)) return false;
      return true;
    })
    .map((t) => ({ family: 'special', category: 'buff', tooltip: t }));
}

/** Skills « porteurs » hors kit : leurs effets peuvent appartenir à un kit. */
const PASSIVE_SKILL_TYPES = new Set(['class_passive', 'unique_passive']);

/**
 * Kit fonctionnel d'un effet porté par un PASSIF — même règle que le contrôle
 * V2 : `CallerSkillType` (caller), ou convention de nommage du jeu
 * `{charId}_1|2|3_*` / `_chain` / `_backup` (buffs on-death d'Eris…).
 */
function passiveEffectKit(e: RawEffect): string | undefined {
  if (e.caller) return e.caller;
  const b = e.buff ?? '';
  const m = /^\d+_([123])(_|$)/.exec(b);
  if (m) return { '1': 'first', '2': 'second', '3': 'ultimate' }[m[1]];
  if (b.includes('_chain') || b.includes('_backup')) return 'chain_passive';
  return undefined;
}

/**
 * Effets des PASSIFS appartenant fonctionnellement à un kit (caller,
 * convention de slot, ou buff référencé par la DESC d'un skill du kit) —
 * ce sont des chips du skill correspondant, comme les listait la V2.
 */
function passiveKitRaw(skills: Skill[], kit: string, kitSkills: Skill[]): RawEffect[] {
  const raw: RawEffect[] = [];
  for (const p of skills.filter((s) => PASSIVE_SKILL_TYPES.has(s.type))) {
    for (const e of p.effects ?? []) {
      if (isTranscendUpgrade(p, e)) continue;
      const owner = passiveEffectKit(e);
      if (owner === kit) {
        raw.push(e);
        continue;
      }
      if (owner !== undefined || !e.buff) continue;
      const baseId = e.buff.replace(/_\d+$/, '');
      if (kitSkills.some((k) => k.desc?.en.includes(e.buff!) || k.desc?.en.includes(baseId)))
        raw.push(e);
    }
  }
  return raw;
}

function passiveKitEffects(skills: Skill[], kit: string, kitSkills: Skill[]): ClientEffect[] {
  return passiveKitRaw(skills, kit, kitSkills)
    .map(toChipEffect)
    .filter((e): e is ClientEffect => Boolean(e));
}

/**
 * Effets à afficher sur la CARTE d'un skill : effets appliqués + effets de
 * PASSIFS rattachés à ce kit + statuts affichés par les niveaux ; le skill
 * « burstable » hérite en plus des buffs/debuffs de ses déclinaisons
 * burst_1..3 (même skill côté joueur) et des effets synthétiques (bonus WG).
 */
export function cardEffects(skills: Skill[], s: Skill): ClientEffect[] | undefined {
  // VARIANTES du même type (formes/copies — Luna 2000119/120 : White Night ET
  // Polar Night) : l'union de leurs effets = ce que le kit fait, quelle que
  // soit la forme. La carte affichée reste la variante choisie par mainSkills.
  const variants = skills.filter((k) => k.type === s.type);
  const own = s.burstAP?.length
    ? [...variants, ...skills.filter((b) => b.type.startsWith('burst_'))]
    : variants;
  // Dédup : plusieurs buffs techniques d'un même skill peuvent pointer le
  // même statut (S2 de Demiurge Luna : 2 buffs → tooltip « White Night »).
  const chips = dedupList([
    ...own.flatMap((k) => toClientEffects(k) ?? []),
    ...passiveKitEffects(skills, s.type, [s]),
  ]);
  // Réfs et types de mécanique déjà représentés par une chip — dédup des
  // statuts de niveau (mêmes règles que le contrôle V2).
  const rawChipped = [
    ...own.flatMap((k) => (k.effects ?? []).filter((e) => !isTranscendUpgrade(k, e))),
    ...passiveKitRaw(skills, s.type, [s]),
  ].filter((e) => toChipEffect(e));
  const ctx = {
    refs: new Set(chips.map((c) => c.tooltip)),
    kinds: new Set(rawChipped.map(kindOf)),
  };
  const merged = [
    ...chips,
    ...levelTooltipEffects(s, ctx),
    ...(s.burstAP?.length ? syntheticBurstEffects(skills) : []),
  ];
  return merged.length ? merged : undefined;
}

/**
 * AUTO-TAG « ignore-defense » : un skill porte un bonus de pénétration PASSIF
 * (effet technique sans nom, stat pierce_power*) — pas un buff côté joueur,
 * mais le marqueur du perso qui ignore une partie de la DEF.
 */
export function hasIgnoreDefense(skills: Skill[]): boolean {
  return skills.some((s) =>
    s.effects?.some((e) => !e.tooltip && !e.label && e.stat?.startsWith('pierce_power')),
  );
}

/** Une carte de burst, données prêtes à rendre (texte résolu par le caller). */
export interface BurstView {
  level: 1 | 2 | 3;
  cost?: number;
  desc?: string;
  vars?: Skill['levels'][number]['vars'];
}

/** Bursts 1..3 : desc localisée + vars du dernier palier + coût AP du burstable. */
export function buildBurstViews(skills: Skill[], lang: Lang): BurstView[] {
  const burstable = mainSkills(skills).find((s) => s.burstAP?.length);
  // Un seul burst par palier : les persos à FORMES portent le kit jumeau
  // (textes identiques) — même règle que mainSkills (variante la plus complète).
  const byType = new Map<string, Skill>();
  for (const b of skills.filter((s) => s.type.startsWith('burst_'))) {
    const prev = byType.get(b.type);
    if (!prev || b.levels.length > prev.levels.length) byType.set(b.type, b);
  }
  return [...byType.values()]
    .sort((a, b) => a.type.localeCompare(b.type))
    .map((b, i) => {
      const last = b.levels[b.levels.length - 1];
      return {
        level: (i + 1) as 1 | 2 | 3,
        cost: burstable?.burstAP?.[i],
        desc: b.desc ? lRec(b.desc, lang) : undefined,
        vars: last?.vars,
      };
    });
}

/** Vue chaîne & duo complète, pré-localisée (hors icône, qui dépend du perso). */
export interface ChainView {
  name: string;
  maxLevel: number;
  levels: ChainLevel[];
  chainDesc: string;
  dualDesc: string;
  chainEffects: ClientEffect[];
  dualEffects: ClientEffect[];
}

/** Dédoublonne une liste d'effets client (par réf + famille + stat). */
function dedupList(effects: ClientEffect[]): ClientEffect[] {
  const out: ClientEffect[] = [];
  const seen = new Set<string>();
  for (const e of effects) {
    const key = `${e.tooltip ?? e.label ?? ''}|${e.family}|${e.stat ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

/** Dédoublonne des effets venus de plusieurs skills techniques (aerial/ground…). */
function dedupEffects(list: Skill[]): ClientEffect[] {
  return dedupList(list.flatMap((s) => toClientEffects(s) ?? []));
}

export function buildChainView(skills: Skill[], lang: Lang): ChainView | null {
  const cp = skills.find((s) => s.type === 'chain_passive');
  if (!cp) return null;
  const strikes = skills.filter((s) => s.type.startsWith('strike_'));
  const backups = skills.filter((s) => s.type.startsWith('backup_'));

  const levels: ChainLevel[] = Array.from({ length: cp.maxLevel }, (_, i) => {
    const lvl = i + 1;
    const vars: NonNullable<ChainLevel['vars']> = {};
    for (const s of [cp, ...strikes, ...backups]) Object.assign(vars, levelAt(s.levels, lvl)?.vars);
    const wgOf = (list: Skill[]) => {
      const vals = list
        .map((s) => levelAt(s.levels, lvl)?.wgReduce)
        .filter((v): v is number => v !== undefined);
      return vals.length ? Math.max(...vals) : undefined;
    };
    return {
      level: lvl,
      vars,
      chainWgr: wgOf(strikes),
      dualWgr: wgOf(backups),
      upgrades: cp.levels
        .find((l) => l.level === lvl)
        ?.upgrades?.map((u) => lRec(u, lang))
        .filter(Boolean),
    };
  });

  const { chain, dual } = cp.desc ? splitChainDual(lRec(cp.desc, lang)) : { chain: '', dual: '' };
  // Effets de PASSIFS rattachés à la chaîne/duo (convention `_chain`/`_backup`),
  // répartis entre les deux moitiés par leur id de buff.
  const passive = passiveKitEffects(skills, 'chain_passive', [cp, ...strikes, ...backups]);
  const chainChips = dedupList([
    ...dedupEffects([cp, ...strikes]),
    ...passive.filter((e) => !e.buff?.includes('_backup')),
  ]);
  const dualChips = dedupList([
    ...dedupEffects(backups),
    ...passive.filter((e) => e.buff?.includes('_backup')),
  ]);
  // Statuts affichés par les NIVEAUX du chain passive (« Heavy Strike ») — le
  // jeu les montre sur la chaîne, la V2 les listait ; mêmes dédups que les
  // cartes de skills (réfs + types des chips des deux moitiés).
  const rawChipped = [cp, ...strikes, ...backups]
    .flatMap((k) => (k.effects ?? []).filter((e) => !isTranscendUpgrade(k, e)))
    .concat(passiveKitRaw(skills, 'chain_passive', [cp, ...strikes, ...backups]))
    .filter((e) => toChipEffect(e));
  const levelChips = levelTooltipEffects(cp, {
    refs: new Set([...chainChips, ...dualChips].map((c) => c.tooltip)),
    kinds: new Set(rawChipped.map(kindOf)),
  });
  return {
    name: lRec(cp.name, lang),
    maxLevel: cp.maxLevel,
    levels,
    chainDesc: chain,
    dualDesc: dual,
    chainEffects: [...chainChips, ...levelChips],
    dualEffects: dualChips,
  };
}
