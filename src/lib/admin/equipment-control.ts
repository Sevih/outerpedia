/**
 * CONTRÔLE V2 des ÉQUIPEMENTS (outil admin) : compare l'extraction V3
 * (familles, talismans, EE, sets) à l'oracle V2 (`data/legacy/equipment/*`),
 * champ par champ — identité localisée, icônes, passifs (texte au palier 1 et
 * au palier max), main stats, sets 2P/4P (base + enchanté), chips buff/debuff
 * des EE. Textes normalisés (balises couleur, espaces) avant comparaison.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { LangDict } from '@contracts';
import {
  getAmuletFamilies,
  getEEViews,
  getSetViews,
  getTalismanFamilies,
  getWeaponFamilies,
  passiveEffects,
  resolvePassives,
  slugifyEquipment,
} from '@/lib/data/equipment';
import { getEquipmentDetail } from '@/lib/data/equipment-detail';
import {
  effectForLabel,
  effectForTooltip,
  getMergedEffect,
  loadCuratedEffects,
} from '@/lib/data/effects';

export interface EquipIssue {
  item: string;
  field: string;
  v2: string;
  v3: string;
}

export interface CatalogueReport {
  name: string;
  /** Entrées extraites V3 (l'« extraction »). */
  v3Count: number;
  /** Entrées de l'oracle V2. */
  v2Count: number;
  /** Entrées V2 sans correspondance V3 (par nom EN / id). */
  missingV3: string[];
  issues: EquipIssue[];
}

/** Normalisation de texte : balises couleur, `\n` littéraux, espaces, casse,
 * apostrophes/guillemets typographiques ↔ droits (V2 mélangeait les deux). */
function norm(s: unknown): string {
  return String(s ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/\\n/g, ' ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function readLegacy<T>(file: string): T | null {
  try {
    return JSON.parse(
      readFileSync(resolve(process.cwd(), 'data/legacy/equipment', file), 'utf8'),
    ) as T;
  } catch {
    return null;
  }
}

/** Compare un champ texte ; pousse une issue si différent (normalisé). */
function diff(issues: EquipIssue[], item: string, field: string, v2: unknown, v3: unknown): void {
  if (v2 === undefined || v2 === null || v2 === '') return; // V2 n'a pas la donnée
  if (norm(v2) === norm(v3)) return;
  issues.push({ item, field, v2: String(v2), v3: String(v3 ?? '—') });
}

/** Compare les 4 langues d'un champ V2 (`x`, `x_jp`…) à un LangDict V3. */
function diffLang(
  issues: EquipIssue[],
  item: string,
  field: string,
  v2: Record<string, unknown>,
  v2Key: string,
  v3: LangDict | undefined,
): void {
  diff(issues, item, field, v2[v2Key], v3?.en);
  for (const l of ['jp', 'kr', 'zh'] as const)
    diff(issues, item, `${field}_${l}`, v2[`${v2Key}_${l}`], v3?.[l]);
}

type Row = Record<string, unknown>;

/** Familles à passif (amulettes / talismans) vs oracle par NOM EN. */
function familyReport(
  name: string,
  v2Rows: Row[],
  families: ReturnType<typeof getAmuletFamilies>,
): CatalogueReport {
  const byName = new Map(families.map((f) => [f.name.en.trim().toLowerCase(), f]));
  const issues: EquipIssue[] = [];
  const missingV3: string[] = [];
  for (const r of v2Rows) {
    const label = String(r.name ?? r.id);
    const key = String(r.name ?? '')
      .trim()
      .toLowerCase();
    // V2 déclinait les variantes de classe en entrées séparées (« … [Striker] »)
    // — V3 les regroupe sous la famille au nom nu.
    const stripped = key.replace(/\s*\[[^\]]+\]$/, '');
    const isVariant = stripped !== key;
    const f = byName.get(key) ?? byName.get(stripped);
    if (!f) {
      missingV3.push(label);
      continue;
    }
    if (!isVariant) diffLang(issues, label, 'name', r, 'name', f.name);
    // Variante de classe : icône propre à la variante, pas celle de la famille.
    if (!isVariant) diff(issues, label, 'image', r.image, f.icon);
    if (r.type === 'CP' || r.type === 'AP') diff(issues, label, 'type', r.type, f.mode);
    // Famille à passif PAR CLASSE : la ligne V2 « … [Striker] » se compare au
    // passif de SA classe, pas à celui du membre de tête.
    const classPassives =
      isVariant && r.class && f.classPassives
        ? f.classPassives.find((v) => norm(v.classLimit) === norm(r.class))?.passives
        : undefined;
    const resolved = resolvePassives(classPassives ?? f.passives, 'en');
    const p = resolved[0];
    diff(issues, label, 'effect_name', r.effect_name, p?.name);
    diff(issues, label, 'effect_desc1', r.effect_desc1, p?.first);
    // desc4 = palier max : valeur max du 1er passif (breakthrough / niveau 10)
    // OU 2e passif (déblocage +10) selon la famille — accepté si l'un matche.
    if (r.effect_desc4) {
      const candidates = [p?.last, resolved[1]?.first, p?.first].filter(Boolean) as string[];
      if (!candidates.some((c) => norm(c) === norm(r.effect_desc4)))
        issues.push({
          item: label,
          field: 'effect_desc4',
          v2: String(r.effect_desc4),
          v3: candidates[0] ?? '—',
        });
    }
    // Main stats : ensembles d'abréviations (ordre libre) — pas pour les
    // variantes de classe (la famille est l'UNION de toutes).
    if (Array.isArray(r.mainStats) && !isVariant) {
      const v2Set = [...new Set((r.mainStats as string[]).map(norm))].sort().join(',');
      const v3Set = [...new Set(f.mainStats.map(norm))].sort().join(',');
      diff(issues, label, 'mainStats', v2Set, v3Set);
    }
    if (r.class && !isVariant) diff(issues, label, 'class', r.class, f.classLimits[0]);
    // Variante de classe V2 : la classe doit exister parmi celles de la famille.
    if (r.class && isVariant && !f.classLimits.map(norm).includes(norm(r.class)))
      issues.push({
        item: label,
        field: 'class',
        v2: String(r.class),
        v3: f.classLimits.join(', '),
      });
  }
  return { name, v3Count: families.length, v2Count: v2Rows.length, missingV3, issues };
}

/** Clé d'effet façon V2 (`BT_STAT|ST_ATK`) pour les chips d'EE. */
function effectKey(e: { type: string; stat?: string }): string {
  return e.type === 'BT_STAT' && e.stat ? `${e.type}|ST_${e.stat.toUpperCase()}` : e.type;
}

/** Alias du dialecte V2 (clés historiques) → clés type réelles du jeu. */
const V2_KEY_ALIASES: Record<string, string[]> = {
  BT_BARRIER: ['BT_SHIELD_BASED_CASTER', 'BT_SHIELD_BASED_TARGET'],
  // « Charge d'AP » curée V2 = souvent la stat premium ENTER_AP (AP au début
  // du combat) côté extraction.
  BT_AP_CHARGE: ['BT_STAT|ST_ENTER_AP'],
};

/** Nom d'effet → clé éditoriale V2 (« Corrosive Poison » → CORROSIVE_POISON). */
function nameKey(name: string): string {
  return name
    .replace(/['’]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

/** EE vs oracle par ID DE PERSO. */
function eeReport(v2: Record<string, Row>): CatalogueReport {
  const views = getEEViews();
  const byChar = new Map(views.map((v) => [v.characterId, v]));
  const issues: EquipIssue[] = [];
  const missingV3: string[] = [];
  for (const [charId, r] of Object.entries(v2)) {
    const v = byChar.get(charId);
    const label = `${r.name} (${charId})`;
    if (!v) {
      missingV3.push(label);
      continue;
    }
    diffLang(issues, label, 'name', r, 'name', v.name);
    const model = getEquipmentDetail(slugifyEquipment(v.name.en), 'en');
    if (!model) continue;
    // Main stat conditionnelle (libellé officiel).
    const opt = model.slots[0]?.options[0];
    diff(issues, label, 'mainStat', r.mainStat, opt?.label ?? opt?.key);
    // Effet lv1 / lv10 (même règle que la fiche perso : le +10 = le NOUVEAU).
    const lv1 = model.passives.filter((p) => p.unlockLevel <= 1).map((p) => p.texts[0]);
    let lv10All: string[] = [];
    for (const p of model.passives) {
      const text = p.texts[p.texts.length - 1];
      if (p.isAdd) lv10All.push(text);
      else lv10All = [text];
    }
    diff(issues, label, 'effect', r.effect, lv1.join(' '));
    // effect10 V2 = le NOUVEAU au +10 (palier débloqué / texte remplacé), pas
    // la répétition d'un effet de base inchangé — même règle que la fiche.
    const lv10New = lv10All.filter((tx) => !lv1.includes(tx));
    if (r.effect10)
      diff(issues, label, 'effect10', r.effect10, (lv10New.length ? lv10New : lv10All).join(' '));
    // Chips buff/debuff : comparaison BIDIRECTIONNELLE au niveau AFFICHAGE —
    // seuls les effets NOMMÉS (tooltip/label posés par le datagen) sont des
    // chips. Chaque chip V3 émet ses « jetons » d'équivalence : clé type
    // (`BT_STAT|ST_X`), nom d'effet (clés nommées V2 : CORROSIVE_POISON…), id
    // d'effet résolu et `keys` de sa création curée (UNCOUNTERABLE ↔
    // BT_SEAL_COUNTER, SYS_BUFF_CHARGE_AP ↔ BT_AP_CHARGE). Une clé V2 sans
    // jeton = chip manquante ; une chip V3 sans clé V2 = ajout à arbitrer.
    const displayed = passiveEffects(v.passives).filter((e) => e.tooltip || e.label);
    const curatedFx = loadCuratedEffects();
    const chips = displayed.map((e) => {
      const eff = e.tooltip
        ? (effectForTooltip(e.tooltip) ?? getMergedEffect(e.tooltip))
        : (effectForLabel(e.label!) ?? getMergedEffect(e.label!));
      const key = effectKey(e);
      const tokens = new Set<string>([key]);
      if (eff) {
        tokens.add(eff.id);
        if (eff.name.en) tokens.add(nameKey(eff.name.en));
        for (const k of curatedFx[eff.id]?.keys ?? []) tokens.add(k);
      }
      return { key, name: eff?.name.en ?? key, tokens };
    });
    const v2Bases = new Set(
      (['buff', 'debuff'] as const)
        .flatMap((side) => (r[side] as string[] | undefined) ?? [])
        .map((k) => k.replace(/_IR$/, '')),
    );
    for (const side of ['buff', 'debuff'] as const) {
      for (const key of (r[side] as string[] | undefined) ?? []) {
        const base = key.replace(/_IR$/, '');
        const hit = chips.some(
          (c) =>
            c.tokens.has(key) ||
            c.tokens.has(base) ||
            (V2_KEY_ALIASES[base] ?? []).some((a) => c.tokens.has(a)),
        );
        if (!hit)
          issues.push({
            item: label,
            field: `${side} (V2 sans chip V3)`,
            v2: key,
            v3: chips.map((c) => c.name).join(', ') || '—',
          });
      }
    }
    for (const c of chips) {
      const hit = [...c.tokens].some(
        (t) => v2Bases.has(t) || (V2_KEY_ALIASES[t] ?? []).some((a) => v2Bases.has(a)),
      );
      // Alias sens V2→V3 (BT_BARRIER couvre les BT_SHIELD_*) : une chip V3 est
      // couverte si un alias d'une clé V2 pointe un de ses jetons.
      const aliasHit = [...v2Bases].some((b) =>
        (V2_KEY_ALIASES[b] ?? []).some((a) => c.tokens.has(a)),
      );
      if (!hit && !aliasHit)
        issues.push({
          item: label,
          field: 'chip (V3 seul)',
          v2: [...v2Bases].join(', ') || '—',
          v3: c.name,
        });
    }
  }
  return {
    name: 'ee',
    v3Count: views.length,
    v2Count: Object.keys(v2).length,
    missingV3,
    issues,
  };
}

/** Sets vs oracle par NOM EN (tiers base + enchanté). */
function setsReport(v2Rows: Row[]): CatalogueReport {
  const views = getSetViews('en');
  const byName = new Map(views.map((v) => [v.name.en.trim().toLowerCase(), v]));
  const issues: EquipIssue[] = [];
  const missingV3: string[] = [];
  for (const r of v2Rows) {
    const label = String(r.name ?? r.id);
    const v = byName.get(
      String(r.name ?? '')
        .trim()
        .toLowerCase(),
    );
    if (!v) {
      missingV3.push(label);
      continue;
    }
    diffLang(issues, label, 'name', r, 'name', v.name);
    diff(issues, label, 'set_icon', r.set_icon, v.icon);
    diff(issues, label, 'effect_2_1', r.effect_2_1, v.tiers[0]?.p2);
    diff(issues, label, 'effect_4_1', r.effect_4_1, v.tiers[0]?.p4);
    diff(issues, label, 'effect_2_4', r.effect_2_4, v.tiers[1]?.p2 ?? v.tiers[0]?.p2);
    diff(issues, label, 'effect_4_4', r.effect_4_4, v.tiers[1]?.p4 ?? v.tiers[0]?.p4);
  }
  return { name: 'sets', v3Count: views.length, v2Count: v2Rows.length, missingV3, issues };
}

/** Noms de catalogues disponibles au contrôle (ordre d'affichage). */
export const EQUIPMENT_CATALOGUES = ['weapons', 'amulets', 'talismans', 'ee', 'sets'] as const;
export type EquipmentCatalogue = (typeof EQUIPMENT_CATALOGUES)[number];

/**
 * Contrôle des équipements vs l'oracle V2. `only` restreint à un seul catalogue
 * (les pages Extractor par famille ne recalculent pas tout).
 */
export function equipmentV2Control(only?: EquipmentCatalogue): CatalogueReport[] {
  const out: CatalogueReport[] = [];
  const want = (name: EquipmentCatalogue) => !only || only === name;
  if (want('weapons')) {
    const weap = readLegacy<Row[]>('weapon.json');
    if (weap) out.push(familyReport('weapons', weap, getWeaponFamilies()));
  }
  if (want('amulets')) {
    const acc = readLegacy<Row[]>('accessory.json');
    if (acc) out.push(familyReport('amulets', acc, getAmuletFamilies()));
  }
  if (want('talismans')) {
    const tal = readLegacy<Row[]>('talisman.json');
    if (tal) out.push(familyReport('talismans', tal, getTalismanFamilies()));
  }
  if (want('ee')) {
    const ee = readLegacy<Record<string, Row>>('ee.json');
    if (ee) out.push(eeReport(ee));
  }
  if (want('sets')) {
    const sets = readLegacy<Row[]>('sets.json');
    if (sets) out.push(setsReport(sets));
  }
  return out;
}
