/**
 * Lecture des RECOMMANDATIONS D'ÉQUIPEMENT curées (`data/curated/gear-reco.json`
 * + `gear-presets.json`) : presets `$slug` résolus, équipements matérialisés
 * (nom localisé, icône, grade) depuis le généré. Lu au FS pour que l'admin voie
 * ses écritures immédiatement.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { GearBuild, GearPresets, LangDict, Option, SetComboPiece } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { statOptionView } from '@/lib/stats';
import {
  getAmuletFamilies,
  getSetViews,
  getTalismanFamilies,
  getWeaponFamilies,
  resolvePassives,
  setEffectText,
  slugifyEquipment,
  type GearFamily,
  type ResolvedSource,
} from '@/lib/data/equipment';
import weaponsData from '@data/generated/equipment/weapon.json';
import accessoryData from '@data/generated/equipment/accessory.json';
import talismanData from '@data/generated/equipment/talisman.json';
import setsData from '@data/generated/equipment/sets.json';
import poolsData from '@data/generated/equipment/pools.json';

interface EquipEntry {
  name: LangDict;
  icon?: string;
  grade?: string;
  classLimit?: string | null;
  star?: number;
  main?: string[];
}
interface SetEntry {
  name: LangDict;
  icon?: string;
  tiers?: { '2p'?: { stat: string; value: string }; '4p'?: { stat: string; value: string } }[];
}

const WEAPONS = weaponsData as unknown as Record<string, EquipEntry>;
const AMULETS = accessoryData as unknown as Record<string, EquipEntry>;
const TALISMANS = talismanData as unknown as Record<string, EquipEntry>;
const SETS = setsData as unknown as Record<string, SetEntry>;
const POOLS = poolsData as unknown as Record<string, Option[]>;

const RECO_PATH = resolve(process.cwd(), 'data/curated/gear-reco.json');
const PRESETS_PATH = resolve(process.cwd(), 'data/curated/gear-presets.json');

function readJson<T>(path: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

/** Tous les builds curés (clé = id de perso), bruts. */
export function loadGearReco(): Record<string, GearBuild[]> {
  return readJson(RECO_PATH, {});
}

/** Presets partagés, bruts. */
export function loadGearPresets(): GearPresets {
  return readJson(PRESETS_PATH, { talismans: {}, sets: {}, substats: {} });
}

/** Source d'obtention localisée (tooltip des MiniCards). */
export interface ResolvedItemSource {
  bosses: { id: string; name: string; icon: string; sourceLabel?: string }[];
  /** Slugs de boutique extraits — traduits par la page. */
  shops?: string[];
  label?: string;
}

/** Équipement matérialisé pour l'affichage (MiniCard + tooltip). */
export interface ResolvedGearItem {
  id: string;
  name: string;
  icon?: string;
  grade?: string;
  /** Étoiles du haut de famille (tuile 6★, comme /equipment). */
  star?: number;
  mainStat?: string;
  /** Lien vers la page détail (slug de famille). */
  slug?: string;
  /** Icône d'effet posée sur la tuile (passif). */
  overlayIcon?: string;
  /** Classe unique restreinte (icône sur la tuile). */
  classType?: string;
  /** Valeur max (+10 T4) par clé de main stat curée. */
  mainStatMax?: Record<string, string>;
  /** Passif : nom + icône + textes au PALIER MAX (T4 / Lv10). */
  effectName?: string;
  effectIcon?: string;
  effectTexts?: string[];
  source?: ResolvedItemSource;
  /** Référence `!name` non résolue à l'import (à arbitrer dans l'admin). */
  unresolved?: boolean;
}

export interface ResolvedSetPiece {
  id: string;
  name: string;
  slug?: string;
  /** Icône d'enchantement du set (overlay des tuiles). */
  icon?: string;
  /** Tuiles des 4 pièces 6★ (helmet/armor/gloves/shoes, ordre fixe). */
  pieceIcons?: string[];
  count: number;
}

/** Un set distinct du build, avec ses bonus 2p/4p (4p seulement si joué à 4). */
export interface ResolvedSetEffect {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  maxCount: number;
  effect2?: string;
  effect4?: string;
  source?: ResolvedItemSource;
}

export interface ResolvedBuild {
  name: string;
  weapons: ResolvedGearItem[];
  amulets: ResolvedGearItem[];
  talismans: ResolvedGearItem[];
  sets: ResolvedSetPiece[][];
  setEffects: ResolvedSetEffect[];
  /** Priorité de substats résolue (« ATK>CHC=CHD>SPD »). */
  substats?: string;
  note?: string;
}

// Index id de membre → famille, par slot (les familles portent slug/passifs/source).
type Slot = 'weapons' | 'amulets' | 'talismans';
let famByMember: Record<Slot, Map<string, GearFamily>> | null = null;
function familyOf(slot: Slot, id: string): GearFamily | undefined {
  if (!famByMember) {
    const index = (fams: GearFamily[]) => {
      const m = new Map<string, GearFamily>();
      for (const f of fams) for (const mid of f.ids) m.set(mid, f);
      return m;
    };
    famByMember = {
      weapons: index(getWeaponFamilies()),
      amulets: index(getAmuletFamilies()),
      talismans: index(getTalismanFamilies()),
    };
  }
  return famByMember[slot].get(id);
}

/** Membre le plus étoilé d'une famille (porte les pools de main stats). */
function topEntry(table: Record<string, EquipEntry>, f: GearFamily): EquipEntry | undefined {
  return f.ids.reduce<EquipEntry | undefined>((best, id) => {
    const e = table[id];
    return e && (!best || (e.star ?? 0) > (best.star ?? 0)) ? e : best;
  }, undefined);
}

/**
 * Valeurs max (+10 T4 : ×6, formules extraites) des main stats curées d'un
 * item — clé de chip → valeur affichée (« 60% » / « 1200 »).
 */
function mainStatMaxOf(entry: EquipEntry | undefined, mainStat?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!entry?.main || !mainStat) return out;
  const wanted = new Set(mainStat.split('/').map((s) => s.trim().toUpperCase()));
  for (const g of entry.main) {
    for (const o of POOLS[g] ?? []) {
      if (!o.stat || o.stat === 'none' || o.buff) continue;
      const { key, percent } = statOptionView(o.stat, o.mode);
      if (!wanted.has(key.toUpperCase()) || out[key]) continue;
      const base = percent ? o.value / 10 : o.value;
      const max = o.levels?.length ? o.levels[o.levels.length - 1] / (percent ? 10 : 1) : base * 6;
      out[key] = percent ? `${Math.floor(max * 10) / 10}%` : String(Math.floor(max));
    }
  }
  return out;
}

/** Textes du passif à l'état MAX (T4 gear / Lv10 talisman) : add cumule, replace écrase. */
function effectAtMax(f: GearFamily, lang: Lang): { name?: string; icon?: string; texts: string[] } {
  const refs = resolvePassives(f.passives, lang);
  if (!refs.length) return { texts: [] };
  let texts: string[] = [];
  for (const r of refs) {
    const text = r.last ?? r.first;
    if (r.isAdd) texts.push(text);
    else texts = [text];
  }
  return { name: refs[0].name, icon: refs[0].icon, texts };
}

function toItemSource(s: ResolvedSource | undefined, lang: Lang): ResolvedItemSource | undefined {
  if (!s) return undefined;
  return {
    bosses: s.bosses.map((b) => ({
      id: b.id,
      name: lRec(b.name, lang) || b.name.en,
      icon: b.icon,
      ...(b.source ? { sourceLabel: lRec(b.source, lang) || b.source.en } : {}),
    })),
    shops: s.shops.length ? s.shops : undefined,
    label: s.label,
  };
}

function resolveItem(
  slot: Slot,
  table: Record<string, EquipEntry>,
  id: string,
  lang: Lang,
  mainStat?: string,
): ResolvedGearItem {
  if (id.startsWith('!')) return { id, name: id.slice(1), mainStat, unresolved: true };
  const e = table[id];
  if (!e) return { id, name: id, mainStat, unresolved: true };
  const f = familyOf(slot, id);
  const eff = f ? effectAtMax(f, lang) : { texts: [] };
  const maxes = slot === 'talismans' ? {} : mainStatMaxOf(f ? topEntry(table, f) : e, mainStat);
  return {
    id,
    name: lRec(e.name, lang),
    // Tuile du HAUT de famille (6★) — les paliers bas ont d'autres miniatures.
    icon: f?.icon ?? e.icon,
    grade: f?.grade ?? e.grade,
    star: f?.stars.at(-1),
    mainStat,
    slug: f?.slug,
    overlayIcon: eff.icon || undefined,
    classType: f && f.classLimits.length === 1 ? f.classLimits[0] : undefined,
    ...(Object.keys(maxes).length ? { mainStatMax: maxes } : {}),
    ...(eff.name ? { effectName: eff.name, effectIcon: eff.icon } : {}),
    ...(eff.texts.length ? { effectTexts: eff.texts } : {}),
    source: toItemSource(f?.source, lang),
  };
}

/** Ordre fixe des pièces d'armure (tuiles des sets). */
const PIECE_ORDER = ['helmet', 'armor', 'gloves', 'shoes'] as const;

/**
 * Texte d'un bonus de set, dernier palier connu : nom OFFICIEL de la stat
 * (« Attack +35% ») ou description officielle pour les bonus riches
 * (Immunity, Revenge…) — même rendu que la page /equipment.
 */
function setBonus(entry: SetEntry, piece: '2p' | '4p', lang: Lang): string | undefined {
  const tier = entry.tiers?.[entry.tiers.length - 1]?.[piece];
  return setEffectText(tier ?? null, lang);
}

/** Builds d'un perso, presets résolus et équipements matérialisés. */
export function getCharacterGearReco(charId: string, lang: Lang): ResolvedBuild[] | null {
  const builds = loadGearReco()[charId];
  if (!builds?.length) return null;
  const presets = loadGearPresets();

  const setViews = new Map(getSetViews(lang).map((v) => [v.id, v]));

  return builds.map((b): ResolvedBuild => {
    const taliIds = (b.talismans ?? []).flatMap((tn) =>
      tn.startsWith('$') ? (presets.talismans[tn.slice(1)] ?? [tn]) : [tn],
    );
    const combos: SetComboPiece[][] = (b.sets ?? []).map(
      (c) => c.pieces ?? (c.preset ? (presets.sets[c.preset] ?? []) : []),
    );
    const substats = b.substats?.startsWith('$')
      ? presets.substats[b.substats.slice(1)]
      : b.substats;

    // Sets distincts du build (bonus 4p seulement si un combo le joue à 4).
    const legend = new Map<string, ResolvedSetEffect>();
    for (const combo of combos)
      for (const p of combo) {
        const entry = SETS[p.set];
        if (!entry) continue;
        const prev = legend.get(p.set);
        if (prev) prev.maxCount = Math.max(prev.maxCount, p.count);
        else
          legend.set(p.set, {
            id: p.set,
            name: lRec(entry.name, lang),
            slug: slugifyEquipment(entry.name.en),
            icon: entry.icon,
            maxCount: p.count,
            effect2: setBonus(entry, '2p', lang),
            effect4: setBonus(entry, '4p', lang),
            source: toItemSource(setViews.get(p.set)?.source, lang),
          });
      }

    return {
      name: b.name,
      weapons: (b.weapons ?? []).map((w) =>
        resolveItem('weapons', WEAPONS, w.id, lang, w.mainStat),
      ),
      amulets: (b.amulets ?? []).map((a) =>
        resolveItem('amulets', AMULETS, a.id, lang, a.mainStat),
      ),
      talismans: taliIds.map((id) => resolveItem('talismans', TALISMANS, id, lang)),
      sets: combos.map((combo) =>
        combo.map((p) => {
          const v = setViews.get(p.set);
          return {
            id: p.set,
            name: lRec(SETS[p.set]?.name ?? { en: p.set }, lang),
            slug: SETS[p.set] ? slugifyEquipment(SETS[p.set].name.en) : undefined,
            icon: SETS[p.set]?.icon,
            pieceIcons: v
              ? PIECE_ORDER.map((s) => v.pieceIcons[s]).filter((i): i is string => Boolean(i))
              : undefined,
            count: p.count,
          };
        }),
      ),
      setEffects: [...legend.values()],
      substats,
      note: b.note ? lRec(b.note, lang) : undefined,
    };
  });
}
