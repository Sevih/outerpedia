/**
 * Anti-régression des fixtures « dorées » (harnais § 4) : chaque scénario
 * VÉRIFIÉ EN JEU (`src/lib/damage/fixtures/`) est rejoué SANS UI —
 * décompression de `z`, pont partagé (`buildInputsFromZ` + resolver preset
 * node), amont pur, moteur — et comparé aux dégâts observés avec sa
 * tolérance (défaut 0.5 % — réglage de MISE AU POINT, l'objectif à terme
 * est 0, décision Sevih 03/08).
 *
 * Un échec ne dit pas d'office « moteur cassé » : le message oriente —
 * fixture d'une AUTRE version du jeu → revérifier EN JEU d'abord ;
 * fixture de la version courante → régression moteur probable. Un fixture
 * dépendant d'une incertitude § 12 (`skipRef`) est sauté : il devient le
 * test d'acceptation du jour où on tranche.
 */
import LZString from 'lz-string';
import { describe, expect, it } from 'vitest';
import charactersData from '../../../data/generated/damage/characters.json';
import growthData from '../../../data/generated/damage/growth.json';
import buffsData from '../../../data/generated/damage/buffs.json';
import targetsData from '../../../data/generated/damage/targets.json';
import equipmentData from '../../../data/generated/damage/equipment.json';
import { FIXTURES } from './fixtures';
import { ENGINE_GAME_VERSION } from './harness';
import { buildDamageReport, type DamageData } from './inputs';
import { resolveGearGroups } from './preset-gear';
import { resolvePresetTarget } from './preset-target';
import {
  buildInputsFromZ,
  flattenReport,
  type CalculatorUrlState,
  type ObservedLine,
} from './scenario';

const data = {
  characters: charactersData,
  growth: growthData,
  buffs: buffsData,
  targets: targetsData,
  equipment: equipmentData,
} as unknown as DamageData;

describe('fixtures dorées (harnais § 4)', () => {
  it('le registre est un tableau (vide tant que rien n’est vérifié en jeu)', () => {
    expect(Array.isArray(FIXTURES)).toBe(true);
  });

  for (const f of FIXTURES) {
    const suite = f.skipRef ? describe.skip : describe;
    suite(`${f.name} [${f.gameVersion}]${f.skipRef ? ` — skip ${f.skipRef}` : ''}`, () => {
      // Rejeu au COLLECT : le même chemin que le panneau Debug, jamais du
      // code de composant. Toute erreur est capturée pour échouer en `it`.
      let lines: ObservedLine[] | null = null;
      let error: unknown = null;
      // Clés de slot EN ATTENTE : le slot existe mais sa chaîne de hits est
      // irrésolue (§ 12.4) — une valeur observée capturée dessus est GARDÉE
      // (test skippé), elle devient le test d'acceptation du jour où § 12.4
      // est tranché (même logique que `skipRef`, mais par ligne).
      let pending = new Set<string>();
      try {
        const st = JSON.parse(
          LZString.decompressFromEncodedURIComponent(f.z) || 'null',
        ) as CalculatorUrlState | null;
        if (!st) throw new Error('z indéchiffrable — fixture corrompue ?');
        const { attacker, target } = buildInputsFromZ(st, {
          codexLevel: f.codex ?? 0,
          guildLevel: f.guild ?? 0,
          premiumHp: f.premium === true,
          ...(f.quirks ? { quirks: f.quirks } : {}),
          resolvePreset: resolvePresetTarget,
          resolveGear: resolveGearGroups,
        });
        if (!attacker) throw new Error('attaquant non résolu depuis z');
        if (!target) throw new Error('cible non résolue depuis z (preset disparu des tables ?)');
        // Un miss observé force sa branche (sans esquive, le miss n'existe
        // qu'avec un buff de « miss chance » — jamais émis par défaut).
        const wantMiss = f.observed.some((o) => o.branch === 'miss');
        const report = buildDamageReport(
          attacker,
          target,
          data,
          wantMiss ? { includeMissBranch: true } : {},
        );
        lines = flattenReport(report);
        pending = new Set(
          report.slots
            .filter((s) => s.hitsUnresolved === true && s.report.states.length === 0)
            .map((s) => `${s.slot}${s.burst !== undefined ? `b${s.burst}` : ''}`),
        );
      } catch (e) {
        error = e;
      }

      it('le scénario z se rejoue par le pont partagé', () => {
        if (error) throw error;
        expect(lines).not.toBeNull();
      });

      const tol = f.tolerance ?? 0.5;
      for (const o of f.observed) {
        // Ligne sur un slot § 12.4 : skip NOMMÉ (visible dans le rapport de
        // test), jamais un échec ni un silence.
        if (pending.has(o.slot.split('#')[0])) {
          it.skip(`${o.slot} · ${o.branch} — EN ATTENTE : chaîne de hits irrésolue (§ 12.4)`);
          continue;
        }
        it(`${o.slot} · ${o.branch} : Δ ≤ ${tol} %`, () => {
          expect(
            o.damage,
            'observed.damage = 0 — la capture pré-remplit les CALCULÉS, à remplacer par la valeur constatée EN JEU',
          ).toBeGreaterThan(0);
          const computed = lines?.find((l) => l.slot === o.slot && l.branch === o.branch)?.damage;
          expect(
            computed,
            `ligne ${o.slot}/${o.branch} absente du rapport rejoué — le kit ou les branches ont changé ?`,
          ).toBeDefined();
          const delta = Math.abs((((computed as number) - o.damage) / o.damage) * 100);
          const hint =
            f.gameVersion !== ENGINE_GAME_VERSION
              ? `fixture ${f.gameVersion} ≠ tables ${ENGINE_GAME_VERSION} : le JEU a pu changer — REVÉRIFIER EN JEU d'abord (badge « à revérifier » du panneau Debug), le moteur n'est suspect qu'ensuite`
              : `fixture capturée sur les tables COURANTES (${ENGINE_GAME_VERSION}) : régression moteur probable — comparer la trace du panneau Debug étape par étape`;
          expect(
            delta,
            `calculé ${computed} vs en jeu ${o.damage} (Δ ${delta.toFixed(3)} %) — ${hint}`,
          ).toBeLessThanOrEqual(tol);
        });
      }
    });
  }
});
