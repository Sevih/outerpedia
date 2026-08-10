/**
 * PONT scénario — de l'état `?z=` du calculateur (URL, clés courtes) aux
 * entrées de l'amont pur (`buildDamageReport`). Partagé par le panneau Debug
 * (harnais § 2) et le test des fixtures (harnais § 4) : les DEUX rejouent un
 * scénario par CE chemin — jamais par du code de composant, qui divergerait.
 *
 * Périmètre v1 assumé : les pans du scénario que le moteur ne consomme pas
 * encore (passifs d'équipement § 15, alliés, décroissance multi-cible) sont
 * REMONTÉS dans `ignored` — affichés par le harnais, jamais tus.
 */

import type { DamageBranch } from './harness';
import type { AttackerBuildInput, DamageReportResult, TargetBuildInput } from './inputs';
import { MAX_USER_TEAM_MEMBER } from './types';

// ── Référentiels de saisie (l'UI et le pont lisent LA même table) ───────────

export interface SheetField {
  /** Slug de la fiche (clés de `statVals` et du catalogue `SHEET_STAT_MAP`). */
  slug: string;
  /** Saisie en % (fiche du jeu) → le moteur veut du ‰ (×10). */
  percent: boolean;
}

/** Stats de la fiche attaquant, dans l'ordre d'affichage du jeu. */
export const SHEET_FIELDS: SheetField[] = [
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

/** Stats défensives de la cible (mêmes clés que `DcSpawn['stats']`). */
export const TARGET_FIELDS: {
  key: 'hp' | 'def' | 'dmgRed' | 'cdmgRed';
  /** Slug du glossaire des stats (libellé localisé côté UI). */
  statSlug: string;
  percent: boolean;
}[] = [
  { key: 'hp', statSlug: 'hp', percent: false },
  { key: 'def', statSlug: 'def', percent: false },
  { key: 'dmgRed', statSlug: 'dmg_reduce_rate', percent: true },
  { key: 'cdmgRed', statSlug: 'e_cri_dmg_reduce', percent: true },
];

/** Saisie texte → valeur moteur : `%` saisi → ‰ (×10), vide/invalide → 0. */
export function parseStatInput(raw: string | undefined, percent: boolean): number {
  const n = Number(raw);
  if (raw === undefined || raw === '' || !Number.isFinite(n)) return 0;
  return Math.round(percent ? n * 10 : n);
}

// ── L'état `?z=` (miroir typé — la SEULE définition, l'UI l'importe) ────────

/**
 * État sérialisé dans l'URL (`?z=` lz-string, motif team-planner) — clés
 * COURTES, valeurs par défaut omises. Tout consommateur REVALIDE (ids
 * inconnus écartés, nombres bornés) : l'URL est une entrée non fiable.
 */
export interface CalculatorUrlState {
  /** Attaquant + palier de transcendance + affinité (NIVEAU 0..100, paliers
   *  tous les 20) + niveaux de skill + niveau du perso (1..120, omis à 120). */
  a?: string;
  x?: number;
  af?: number;
  k?: Record<string, number>;
  lv?: number;
  /** Arme / accessoire (slug + breakthrough). */
  w?: string;
  y?: number;
  m?: string;
  q?: number;
  /** Sets choisis ([id, enchanté 0/1]) · Rogue's Charm · EE absent · niveau d'EE. */
  s?: [string, number][];
  t?: 1;
  eo?: 0;
  e?: number;
  /** Stats saisies · PV actuels (%). */
  v?: Record<string, string>;
  h?: string;
  /** Cible : onglet manuel, preset + stage, élément + stats manuelles + flag
   *  boss (manuel) + cible en BREAK + PV actuels (%). */
  g?: 1;
  ti?: string;
  si?: number;
  te?: string;
  tv?: Record<string, string>;
  tb?: 1;
  bk?: 1;
  /** Coches « buff de guilde actif » / « buff de titre actif » (cible
   *  MANUELLE — en preset le MODE décide, spec formule § 16.2). */
  gb?: 1;
  pb?: 1;
  th?: string;
  /** Cibles touchées · alliés ([id, palier, main talisman, enhancement,
   *  EE possédé 0/1, EE+10 0/1]) · buffs actifs. */
  n?: number;
  al?: [string, number, string, number, number, number][];
  b?: string[];
  d?: string[];
  /** Conditions d'ÉTAT déclarées remplies (buffIds des entrées `stateful` —
   *  mécaniques perso, STATE_CONDITIONS de gear.ts). */
  cs?: string[];
}

// ── Construction des entrées ────────────────────────────────────────────────

/** Cible preset RÉSOLUE par l'appelant (stats effectives au spawn, déjà en
 *  unités moteur — l'UI les tient du wrapper, le test du même resolver node). */
export interface ResolvedPresetTarget {
  element: string;
  stats: TargetBuildInput['stats'];
  /** Slug de mode d'encounters (`normal`, `raid_1`…) — décide le buff de
   *  guilde § 16.2 pour ce contenu. */
  mode?: string;
  /** ID de MONSTRE du boss — active ses passifs (passives.ts). */
  monsterId?: string;
}

export interface ScenarioBuildOptions {
  /** Niveau du Codex du COMPTE — HORS z (localStorage) : capturé à part
   *  (`DamageFixture.codex`), fourni par l'appelant. */
  codexLevel?: number;
  /** Niveau de GUILDE du compte (0..10) — HORS z, capturé à part
   *  (`DamageFixture.guild`) ; buff MAX_HP § 16.2. */
  guildLevel?: number;
  /** Buff de TITRE « Premium Body » possédé — HORS z, capturé à part
   *  (`DamageFixture.premium`) ; +5 % PV § 16.2. */
  premiumHp?: boolean;
  /** QUIRKS du compte (nœud d'éveil → niveau, seuls les > 0 comptent) — HORS
   *  z (localStorage), capturés à part (`DamageFixture.quirks`). */
  quirks?: Record<string, number>;
  /** Résolution d'un preset de cible (`ti`/`si`) — sans lui, pas de cible. */
  resolvePreset?: (targetId: string, spawnIdx: number) => ResolvedPresetTarget | undefined;
  /** Résolution d'un équipement (slug UI → groupes d'options uniques des
   *  tables) — `attackerId` sert aux variantes PAR CLASSE (Briareos/Gorgon).
   *  Sans lui, l'équipement sélectionné est SIGNALÉ ignoré, jamais tu. */
  resolveGear?: (
    kind: 'weapon' | 'amulet' | 'talisman',
    slug: string,
    attackerId: string,
  ) => { groups: string[] } | undefined;
}

export interface ScenarioBuildResult {
  attacker?: AttackerBuildInput;
  target?: TargetBuildInput;
  /** Cibles touchées (z `n`, défaut 1) — à passer en
   *  `BuildReportOptions.targetsHit` (décompte § 7, branché 10/08/2026). */
  targetsHit?: number;
  /** Pans du scénario que le moteur v1 IGNORE (à afficher, jamais tus). */
  ignored: string[];
}

const clamp = (v: number, min: number, max: number): number => Math.min(Math.max(v, min), max);

/** `%` de PV saisi (string) → entier 0..100 — défaut 100. */
function parseHpPct(raw: string | undefined): number | undefined {
  if (raw === undefined) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? clamp(Math.round(n), 0, 100) : undefined;
}

/**
 * L'état `?z=` (décompressé) → entrées de `buildDamageReport`. Un champ
 * absent garde la valeur par défaut de l'UI (niveau 120, PV 100 %…) — les
 * deux consommateurs restent d'accord par construction.
 */
export function buildInputsFromZ(
  st: CalculatorUrlState,
  opts: ScenarioBuildOptions = {},
): ScenarioBuildResult {
  const ignored: string[] = [];

  let attacker: AttackerBuildInput | undefined;
  if (st.a) {
    const skillLevels: AttackerBuildInput['skillLevels'] = {};
    for (const slot of ['S1', 'S2', 'S3'] as const) {
      const v = st.k?.[slot];
      if (typeof v === 'number') skillLevels[slot] = v;
    }
    const sheet: Record<string, number> = {};
    for (const f of SHEET_FIELDS) {
      const raw = st.v?.[f.slug];
      if (raw !== undefined && raw !== '') sheet[f.slug] = parseStatInput(raw, f.percent);
    }
    const hpPct = parseHpPct(st.h);
    attacker = {
      id: st.a,
      level: clamp(st.lv ?? 120, 1, 120),
      // Index du palier de transcendance (absent = max, défaut UI) — le
      // moteur en dérive transStar pour le passif UNIQUE du kit.
      ...(typeof st.x === 'number' ? { transcendIndex: clamp(st.x, 0, 12) } : {}),
      // Le palier 0..5 est LA valeur de calcul ; `af` porte le niveau 0..100.
      affinityTier: Math.floor(clamp(st.af ?? 0, 0, 100) / 20),
      codexLevel: opts.codexLevel ?? 0,
      skillLevels,
      sheet,
      ...(hpPct !== undefined ? { hpPct } : {}),
      ...(st.b?.length ? { fx: st.b } : {}),
      ...(st.cs?.length
        ? { metConditions: st.cs.filter((x): x is string => typeof x === 'string') }
        : {}),
      ...(opts.guildLevel ? { guildLevel: clamp(opts.guildLevel, 0, 10) } : {}),
      ...(opts.premiumHp ? { premiumHp: true } : {}),
      ...(opts.quirks && Object.keys(opts.quirks).length ? { quirks: opts.quirks } : {}),
    };
    // Équipement § 15 (canal 2 — buffs) : slugs UI → groupes des tables via
    // le resolver de l'appelant ; un slug non résolu est SIGNALÉ, jamais tu.
    const gear: NonNullable<AttackerBuildInput['gear']> = {};
    const unique = (kind: 'weapon' | 'amulet', slug: string, tier: number | undefined): void => {
      const r = opts.resolveGear?.(kind, slug, st.a as string);
      if (r?.groups.length) {
        gear[kind] = { groups: r.groups, tier: clamp(tier ?? 0, 0, 4) };
      } else ignored.push(`${kind === 'weapon' ? 'arme' : 'accessoire'} ${slug} — non résolue`);
    };
    if (st.w) unique('weapon', st.w, st.y);
    if (st.m) unique('amulet', st.m, st.q);
    if (st.s?.length) {
      // 1 set choisi = 4 pièces (2P + 4P), 2 sets = 2P chacun (convention UI).
      const pieces = st.s.length === 1 ? 4 : 2;
      gear.sets = st.s.map(([groupId, tier]) => ({
        groupId: String(groupId),
        enchanted: tier === 1,
        pieces,
      }));
    }
    if (st.t) {
      const r = opts.resolveGear?.('talisman', 'rogues-charm', st.a);
      if (r?.groups.length) gear.roguesCharm = { groups: r.groups };
      else ignored.push('Rogue’s Charm — non résolu');
    }
    // EE : porté par défaut (`eo: 0` = absent), enchant par défaut +10.
    if (st.eo !== 0) gear.ee = { enchant: clamp(st.e ?? 10, 0, 10) };
    if (Object.keys(gear).length) attacker.gear = gear;
    // Hors périmètre v1 (team) : signalé.
    if (st.al?.some((row) => row[0])) ignored.push('alliés — passifs de team hors v1');
  }

  let target: TargetBuildInput | undefined;
  const tgtHpPct = parseHpPct(st.th);
  const tgtCommon = {
    ...(tgtHpPct !== undefined ? { hpPct: tgtHpPct } : {}),
    ...(st.d?.length ? { fx: st.d } : {}),
    ...(st.bk === 1 ? { broken: true } : {}),
  };
  if (st.g) {
    // Cible MANUELLE : élément requis, stats saisies (percent → ‰).
    if (st.te) {
      const stats: TargetBuildInput['stats'] = {};
      for (const f of TARGET_FIELDS) {
        const raw = st.tv?.[f.key];
        if (raw !== undefined && raw !== '') stats[f.key] = parseStatInput(raw, f.percent);
      }
      target = {
        element: st.te,
        stats,
        boss: st.tb === 1,
        // Coches manuelles : le mode du contenu est INCONNU — activations
        // explicites, une par buff (leurs listes de modes diffèrent § 16.2).
        ...(st.gb === 1 ? { guildBuffOn: true } : {}),
        ...(st.pb === 1 ? { titleBuffOn: true } : {}),
        ...tgtCommon,
      };
    }
  } else if (st.ti && opts.resolvePreset) {
    // Preset : stats effectives au spawn, résolues par l'appelant — les
    // presets sont TOUS des boss (décision produit) ; le MODE porte
    // l'éligibilité du buff de guilde (§ 16.2), jamais une coche.
    const resolved = opts.resolvePreset(st.ti, st.si ?? 0);
    if (resolved)
      target = {
        element: resolved.element,
        stats: resolved.stats,
        boss: true,
        ...(resolved.mode !== undefined ? { mode: resolved.mode } : {}),
        ...(resolved.monsterId !== undefined ? { monsterId: resolved.monsterId } : {}),
        ...tgtCommon,
      };
  }

  return {
    attacker,
    target,
    ...(typeof st.n === 'number' ? { targetsHit: clamp(st.n, 1, MAX_USER_TEAM_MEMBER) } : {}),
    ignored,
  };
}

// ── Aplat du rapport (capture et rejeu parlent LA même clé) ─────────────────

export interface ObservedLine {
  /** `S1`/`S2`/`S3`, burst en suffixe (`S2b1`), état non-base en `#chaîne`. */
  slot: string;
  branch: DamageBranch;
  damage: number;
}

/**
 * Toutes les lignes observables d'un rapport : la capture les pré-remplit
 * (calculés à corriger avec les valeurs EN JEU), le test des fixtures y
 * retrouve le calculé d'un `observed` par (slot, branch).
 */
export function flattenReport(result: DamageReportResult): ObservedLine[] {
  const out: ObservedLine[] = [];
  for (const s of result.slots) {
    const key = `${s.slot}${s.burst !== undefined ? `b${s.burst}` : ''}`;
    for (const state of s.report.states) {
      const slot = s.report.states.length > 1 ? `${key}#${state.chain}` : key;
      for (const b of state.branches) {
        out.push({ slot, branch: b.branch, damage: b.totalDamage });
      }
    }
  }
  return out;
}
