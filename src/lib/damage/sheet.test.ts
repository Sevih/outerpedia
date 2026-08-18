/**
 * Preuve de l'identité § 16.1 : la reconstruction fiche → combat de `sheet.ts`
 * doit être EXACTEMENT égale à `calcFinalStat` (§ 3) sur toutes les couches —
 * pas une approximation : les troncatures s'annulent (fiche = sub_sans_buffs
 * + A). Test de propriété sur un balayage déterministe + témoins à la main.
 * Avec des taux PREMIUM (Rp — déjà dans la fiche, 18/08/2026) : la
 * défactorisation doit refactoriser la fiche à l'identique sans buffs, et le
 * témoin Caren (mesuré in-game) fixe le terme croisé trust × premiums.
 */
import { describe, expect, it } from 'vitest';
import { calcFinalStat, calcBaseStat } from './formula';
import { archiveTerm, sheetToCombatStat, sheetToCombatStatAtLevel } from './sheet';
import type { FinalStatInput } from './types';

/** Générateur déterministe (LCG) — pas de Math.random : échec reproductible. */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function finalStat(over: Partial<FinalStatInput>): number {
  return calcFinalStat({
    baseValue: 0,
    spawnAdvantageRate: 0,
    evolutionValue: 0,
    awakeningValue: 0,
    awakeningValueRate: 0,
    monadEnchantValue: 0,
    monadEnchantValueRate: 0,
    transcendentStarValueRate: 0,
    archiveStatValueRate: 0,
    itemOptionValue: 0,
    itemOptionValueRate: 0,
    buffValue: 0,
    buffValueRate: 0,
    ...over,
  });
}

describe('sheet — identité § 16.1 (fiche saisie → stat de combat)', () => {
  it('propriété : reconstruit EXACTEMENT calcFinalStat sur 500 configurations', () => {
    const rand = lcg(0x5eed);
    const int = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
    for (let i = 0; i < 500; i++) {
      const layers: Partial<FinalStatInput> = {
        baseValue: int(50, 40000),
        evolutionValue: int(0, 3000),
        awakeningValue: int(0, 2000),
        awakeningValueRate: int(0, 300),
        monadEnchantValue: int(0, 1500),
        monadEnchantValueRate: int(0, 200),
        transcendentStarValueRate: int(0, 500),
        archiveStatValueRate: int(0, 60),
        itemOptionValue: int(0, 20000),
        itemOptionValueRate: int(0, 800),
      };
      const buffValue = int(-500, 3000);
      const buffValueRate = int(-400, 1200);
      // La fiche du jeu = le même pipeline SANS le canal des buffs (§ 16.1).
      const sheetValue = finalStat(layers);
      const combat = finalStat({ ...layers, buffValue, buffValueRate });
      const reconstructed = sheetToCombatStat({
        sheetValue,
        baseValue: layers.baseValue ?? 0,
        archiveRatePermille: layers.archiveStatValueRate ?? 0,
        buffValue,
        buffValueRate,
      });
      expect(reconstructed, `config ${i}`).toBe(combat);
    }
  });

  it('sans buff, la fiche EST la stat de combat (le terme Codex s’annule)', () => {
    expect(
      sheetToCombatStat({
        sheetValue: 28414,
        baseValue: 3623,
        archiveRatePermille: 50,
        buffValue: 0,
        buffValueRate: 0,
      }),
    ).toBe(28414);
  });

  it('témoin affinité : les plats de Trust passent par le canal buff', () => {
    // Palier 3 d'affinité : 3 × +60 ATK plats, aucun buff % — la stat de combat
    // dépasse la fiche d'exactement 180 (pas de troncature sur un plat pur).
    expect(
      sheetToCombatStat({
        sheetValue: 10000,
        baseValue: 2000,
        archiveRatePermille: 0,
        buffValue: 180,
        buffValueRate: 0,
      }),
    ).toBe(10180);
  });

  it('témoin Codex : le terme d’archive n’est PAS multiplié par les buffs %', () => {
    // base 2000, Codex 50 ‰ → A = 100 ; fiche 10000 ; +30 % de buff :
    // combat = div1000((10000 − 100) × 1300) + 100 = 12870 + 100 = 12970
    // (une reconstruction naïve ferait 10000 × 1,3 = 13000 — 30 de trop).
    expect(archiveTerm(2000, 50)).toBe(100);
    expect(
      sheetToCombatStat({
        sheetValue: 10000,
        baseValue: 2000,
        archiveRatePermille: 50,
        buffValue: 0,
        buffValueRate: 300,
      }),
    ).toBe(12970);
  });

  it('clamp ≥ 0 (mêmes bornes que calcFinalStat)', () => {
    expect(
      sheetToCombatStat({
        sheetValue: 100,
        baseValue: 0,
        archiveRatePermille: 0,
        buffValue: -5000,
        buffValueRate: 0,
      }),
    ).toBe(0);
  });

  it('premiums (Rp) : défactorisation exacte sans buffs — la fiche est refactorisée telle quelle', () => {
    // Propriété : pour tout sous-total et tout Rp, la fiche composée
    // div1000(sub × (1000+Rp)) + A repasse par la défactorisation sans dériver.
    const rand = lcg(0xca1e);
    const int = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
    for (let i = 0; i < 500; i++) {
      const sub = int(100, 60000);
      const rp = int(1, 800);
      const baseValue = int(50, 40000);
      const archiveRatePermille = int(0, 60);
      const a = archiveTerm(baseValue, archiveRatePermille);
      const sheetValue = Math.trunc((sub * (1000 + rp)) / 1000) + a;
      expect(
        sheetToCombatStat({
          sheetValue,
          baseValue,
          archiveRatePermille,
          buffValue: 0,
          buffValueRate: 0,
          premiumRatePermille: rp,
        }),
        `config ${i} (sub ${sub}, rp ${rp})`,
      ).toBe(sheetValue);
    }
  });

  it('témoin Caren 18/08/2026 : terme croisé trust × premiums — DEF de combat 5891 EXACTE', () => {
    // Fiche équipée 5631 (base 535, Codex 11 → A = 53), premiums 300 ‰
    // (skill_8 100 + EE Lv10 200), trust +200 DEF plats : la défactorisation
    // donne sub 4291, et div1000((4291+200)×1300) + 53 = 5891 — la valeur que
    // les 6 captures in-game exigeaient (le « +60 » vs l'identité sans Rp).
    expect(
      sheetToCombatStat({
        sheetValue: 5631,
        baseValue: 535,
        archiveRatePermille: 100,
        buffValue: 200,
        buffValueRate: 0,
        premiumRatePermille: 300,
      }),
    ).toBe(5891);
    // Fiche NUE 2314 (+732 affiché) : sans buffs de combat, la reconstruction
    // rend la fiche telle quelle (Rp 100 = skill_8 seul, l'EE est retirée).
    expect(
      sheetToCombatStat({
        sheetValue: 2314,
        baseValue: 535,
        archiveRatePermille: 100,
        buffValue: 0,
        buffValueRate: 0,
        premiumRatePermille: 100,
      }),
    ).toBe(2314);
  });

  it('sheetToCombatStatAtLevel recalcule la base comme calcBaseStat (§ 3.1-3.2)', () => {
    // Au niveau 100, l'interpolation § 3.1 atteint exactement le max du templet.
    const base = calcBaseStat(300, 2970, 100);
    expect(base).toBe(2970);
    const viaLevel = sheetToCombatStatAtLevel({
      sheetValue: 20000,
      minValue: 300,
      maxValue: 2970,
      level: 100,
      archiveRatePermille: 50,
      buffValue: 0,
      buffValueRate: 300,
    });
    const direct = sheetToCombatStat({
      sheetValue: 20000,
      baseValue: base,
      archiveRatePermille: 50,
      buffValue: 0,
      buffValueRate: 300,
    });
    expect(viaLevel).toBe(direct);
    // Post-100 : le palier 3 (700 ‰) fait CROÎTRE la base — et donc le terme A.
    expect(calcBaseStat(300, 2970, 120, 700)).toBeGreaterThan(calcBaseStat(300, 2970, 120));
  });
});
