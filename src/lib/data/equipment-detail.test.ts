/**
 * Fiche d'équipement sur la donnée RÉELLE (C19), en relation — les attendus se
 * lisent dans les tables générées, jamais recopiés ; les valeurs en commentaire
 * sont celles du jour, pour le lecteur.
 *
 *   - mains : union des membres au palier d'étoile max, par slot (R13) ;
 *   - secondaire des EE : 0 à +0, `min(OptionValue + n × OptionFactor, max)` (M10) ;
 *   - sous-stat : pas = `OptionFactor` (O11) ;
 *   - main stat : float32 tronqué du client (`itemMainOptionValue`) sur la page
 *     et dans les recos (B1).
 */
import { describe, expect, it } from 'vitest';
import type { GearItem, Option } from '@contracts';
import { getEquipmentDetail } from '@/lib/data/equipment-detail';
import {
  getAmuletFamilies,
  getEEViews,
  getWeaponFamilies,
  slugifyEquipment,
  topMainSlots,
} from '@/lib/data/equipment';
import { getEnhanceRules } from '@/lib/data/equipment-enhance';
import { resolveLootGear } from '@/lib/data/gear-reco';
import { statOptionView } from '@/lib/stats';
import { itemMainOptionValue, sumFactorsF32 } from '@/lib/damage/item';
import { mainValue } from '@/components/equipment/EquipmentDetail';
import weaponData from '@data/generated/equipment/weapon.json';
import accessoryData from '@data/generated/equipment/accessory.json';
import eeData from '@data/generated/equipment/ee.json';
import poolsData from '@data/generated/equipment/pools.json';

const WEAPONS = weaponData as unknown as Record<string, GearItem>;
const AMULETS = accessoryData as unknown as Record<string, GearItem>;
const EE = eeData as unknown as Record<string, { options: string[] }>;
const POOLS = poolsData as unknown as Record<string, Option[]>;
const RULES = getEnhanceRules();

const keyOf = (o: Option) => statOptionView(o.stat, o.mode).key;
const detail = (slug: string) => {
  const m = getEquipmentDetail(slug, 'en');
  if (!m) throw new Error(`fiche ${slug} introuvable`);
  return m;
};
const family = (fams: ReturnType<typeof getWeaponFamilies>, en: string) => {
  const f = fams.find((x) => x.name.en === en);
  if (!f) throw new Error(`famille ${en} introuvable`);
  return f;
};

describe('fiche — mains au palier max (R13)', () => {
  it('Winter of Hubris : le slot 2 porte ATK %, DEF %, PV % malgré la ligne au pool orphelin', () => {
    const f = family(getWeaponFamilies(), 'Winter of Hubris');
    const top = Math.max(...f.ids.map((id) => WEAPONS[id].star));
    const members = f.ids.filter((id) => WEAPONS[id].star === top);
    // Une ligne du palier max pointe vers un groupe absent (1504 → []), l'autre
    // vers le pool roulé (1054) : la fiche montre celui-là.
    const orphan = members.find((id) => !(POOLS[WEAPONS[id].main[1]] ?? []).length);
    const rolled = members.find((id) => (POOLS[WEAPONS[id].main[1]] ?? []).length > 1);
    expect(orphan && rolled).toBeTruthy();
    const slot2 = detail(f.slug).slots[1];
    expect(slot2.type).toBe('choice');
    expect(slot2.options.map((o) => o.key)).toEqual(POOLS[WEAPONS[rolled!].main[1]].map(keyOf));
    expect(slot2.options.map((o) => o.key)).toEqual(
      expect.arrayContaining(['ATK%', 'DEF%', 'HP%']),
    );
  });

  it('Steel Necklace : un slot de choix à l’union des variantes (12 options)', () => {
    const f = family(getAmuletFamilies(), 'Steel Necklace');
    const top = Math.max(...f.ids.map((id) => AMULETS[id].star));
    const distinct = new Set(
      f.ids
        .filter((id) => AMULETS[id].star === top)
        .flatMap((id) => AMULETS[id].main.flatMap((g) => POOLS[g] ?? []))
        .map((o) => `${o.stat}|${o.mode}`),
    );
    const slots = detail(f.slug).slots;
    expect(slots).toHaveLength(1);
    expect(slots[0].type).toBe('choice');
    expect(slots[0].options).toHaveLength(distinct.size); // 12
    expect(distinct.size).toBeGreaterThan(
      (POOLS[AMULETS[f.ids.find((id) => AMULETS[id].star === top)!].main[0]] ?? []).length,
    );
  });

  it('variante de classe : la fiche garde SES mains, pas l’union de famille', () => {
    const fams = [...getWeaponFamilies(), ...getAmuletFamilies()].filter((f) => f.classPassives);
    expect(fams.length).toBeGreaterThan(0);
    let differs = 0;
    for (const f of fams) {
      const table = WEAPONS[f.ids[0]] ? WEAPONS : AMULETS;
      const family = topMainSlots(f.ids, table).flat().map(keyOf);
      for (const v of f.classPassives!) {
        const own = topMainSlots(
          f.ids.filter((id) => table[id].classLimit === v.classLimit),
          table,
        );
        const shown = detail(v.slug).slots.flatMap((s) => s.options.map((o) => o.key));
        expect(shown, v.slug).toEqual(own.flat().map(keyOf));
        if (shown.length !== family.length) differs++;
      }
    }
    // Briareos's Ambition / Gorgon's Vanity : 6 mains par classe, 12 en famille.
    expect(differs).toBeGreaterThan(0);
  });
});

describe('fiche EE — stat secondaire (M10)', () => {
  it('vaut 0 à +0 et son plafond à +10, OptionValue + n × OptionFactor entre les deux', () => {
    const views = getEEViews();
    expect(views.length).toBeGreaterThan(0);
    for (const v of views) {
      const row = EE[v.itemId].options.map((g) => POOLS[g]?.[0]).find((o) => o?.buff && o.factor);
      if (!row) continue;
      // La secondaire (hit_ap / kill_ap) est la DERNIÈRE option de la fiche.
      const sec = detail(slugifyEquipment(v.name.en)).slots.at(-1)!.options[0];
      expect(sec.levels![0], v.itemId).toBe(0);
      expect(sec.levels!.at(-1), v.itemId).toBe(row.max);
      sec.levels!.forEach((x, n) =>
        expect(x).toBe(n === 0 ? 0 : Math.min(row.max!, row.value + row.factor! * n)),
      );
    }
  });
});

describe('fiche — pas des sous-stats (O11)', () => {
  it('step = OptionFactor de la ligne', () => {
    const f = family(getWeaponFamilies(), 'Winter of Hubris');
    const sub = detail(f.slug).sub!;
    const rows = POOLS[WEAPONS[f.ids.find((id) => WEAPONS[id].sub)!].sub!];
    for (const p of sub.pool) {
      const o = rows.find((r) => statOptionView(r.stat, r.mode).key === p.key)!;
      expect(p.step).toBe(p.percent ? o.factor! / 10 : o.factor);
    }
  });
});

describe('main stat — float32 tronqué du client (B1)', () => {
  const game = (raw: number, enh: number, tier: number) =>
    itemMainOptionValue(
      raw,
      sumFactorsF32(Array<number>(enh).fill(RULES.enhanceFactor)),
      sumFactorsF32(Array<number>(tier).fill(RULES.tierFactor)),
    );
  const opt = (raw: number, percent: boolean) => ({
    key: '',
    raw,
    percent,
    base: percent ? raw / 10 : raw,
  });

  it('page détail : base 60 +0 T1 et 100 ‰ +3 T1 (62 et 23 %, pas 63 ni 23,1 %)', () => {
    expect(mainValue(opt(60, false), 0, 1, false, RULES)).toBe(game(60, 0, 1));
    expect(mainValue(opt(100, true), 3, 1, false, RULES)).toBe(game(100, 3, 1) / 10);
    expect(mainValue(opt(60, false), 0, 1, false, RULES)).not.toBe(63);
  });

  it('recos : max (+10, dernière percée) de chaque main lu en float32 (CHD 81 ‰ → 48,6 %)', () => {
    expect(game(81, RULES.maxEnhance, 4) / 10).toBe(48.6);
    let checked = 0;
    for (const [table, fams] of [
      [WEAPONS, getWeaponFamilies()],
      [AMULETS, getAmuletFamilies()],
    ] as const)
      for (const f of fams) {
        const loot = resolveLootGear(f.ids[0], 'en');
        for (const [key, shown] of Object.entries(loot?.mainStatMax ?? {})) {
          const o = topMainSlots(f.ids, table)
            .flat()
            .find((x) => !x.buff && keyOf(x) === key)!;
          const v = game(o.value, RULES.maxEnhance, 4);
          const pct = statOptionView(o.stat, o.mode).percent;
          expect(shown, `${f.slug} ${key}`).toBe(pct ? `${v / 10}%` : String(v));
          checked++;
        }
      }
    expect(checked).toBeGreaterThan(0);
  });
});
