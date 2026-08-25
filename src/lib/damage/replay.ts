/**
 * Rejeu PARTAGÉ d'une fixture dorée (harnais § 4) : décompression de `z`,
 * pont `buildInputsFromZ` + resolvers preset node, moteur — le MÊME chemin
 * que le panneau Debug, sans UI. Deux consommateurs, une seule logique
 * (extraction du 25/08/2026, demande Sevih « rerun tous les scénarios ») :
 *   - `fixtures.test.ts` (vitest) — l'anti-régression, échoue au-delà de la
 *     tolérance ;
 *   - `datagen/damage/check-fixtures.ts` (`pnpm damage:check`, fin de
 *     `damage:build`) — le RAPPORT de validation après patch : chaque ligne
 *     avec son Δ exact, dérives signalées, jamais silencieuses.
 */
import LZString from 'lz-string';
import type { DamageFixture } from './harness';
import { buildDamageReport, type DamageData } from './inputs';
import { resolveGearGroups, resolveTalismanMainBuff } from './preset-gear';
import { resolvePresetTarget } from './preset-target';
import {
  buildInputsFromZ,
  flattenReport,
  type CalculatorUrlState,
  type ObservedLine,
} from './scenario';

export interface FixtureReplay {
  /** Toutes les lignes calculées du rapport rejoué (slot × branche). */
  lines: ObservedLine[];
  /** Clés de slot EN ATTENTE : le slot existe mais sa chaîne de hits est
   *  irrésolue (§ 12.4) — une observation capturée dessus est à SAUTER, pas
   *  à comparer (elle devient le test d'acceptation du jour où on tranche). */
  pending: Set<string>;
}

/** Rejoue une fixture contre `data` ; lève si le scénario ne se reconstruit
 *  pas (z corrompu, preset disparu des tables…). */
export function replayFixture(f: DamageFixture, data: DamageData): FixtureReplay {
  const st = JSON.parse(
    LZString.decompressFromEncodedURIComponent(f.z) || 'null',
  ) as CalculatorUrlState | null;
  if (!st) throw new Error('z indéchiffrable — fixture corrompue ?');
  const { attacker, target, targetsHit } = buildInputsFromZ(st, {
    codexLevel: f.codex ?? 0,
    guildLevel: f.guild ?? 0,
    premiumHp: f.premium === true,
    ...(f.quirks ? { quirks: f.quirks } : {}),
    resolvePreset: resolvePresetTarget,
    resolveGear: resolveGearGroups,
    resolveTalismanMain: resolveTalismanMainBuff,
  });
  if (!attacker) throw new Error('attaquant non résolu depuis z');
  if (!target) throw new Error('cible non résolue depuis z (preset disparu des tables ?)');
  // Un miss observé force sa branche (sans esquive, le miss n'existe qu'avec
  // un buff de « miss chance » — jamais émis par défaut).
  const wantMiss = f.observed.some((o) => o.branch === 'miss');
  const report = buildDamageReport(attacker, target, data, {
    ...(wantMiss ? { includeMissBranch: true } : {}),
    ...(targetsHit !== undefined ? { targetsHit } : {}),
  });
  return {
    lines: flattenReport(report),
    pending: new Set(
      report.slots
        .filter((s) => s.hitsUnresolved === true && s.report.states.length === 0)
        .map((s) => `${s.slot}${s.burst !== undefined ? `b${s.burst}` : ''}`),
    ),
  };
}
