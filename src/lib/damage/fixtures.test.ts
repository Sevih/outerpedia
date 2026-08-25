/**
 * Anti-régression des fixtures « dorées » (harnais § 4) : chaque scénario
 * VÉRIFIÉ EN JEU (`src/lib/damage/fixtures/`) est rejoué SANS UI par la
 * logique PARTAGÉE `replayFixture` (replay.ts — la même que
 * `pnpm damage:check`) et comparé aux dégâts observés avec sa tolérance
 * (défaut 0.5 % — réglage de MISE AU POINT, l'objectif à terme est 0,
 * décision Sevih 03/08).
 *
 * Un échec ne dit pas d'office « moteur cassé » : le message oriente —
 * fixture d'une AUTRE version du jeu → revérifier EN JEU d'abord ;
 * fixture de la version courante → régression moteur probable. Un fixture
 * dépendant d'une incertitude § 12 (`skipRef`) est sauté : il devient le
 * test d'acceptation du jour où on tranche.
 */
import { describe, expect, it } from 'vitest';
import charactersData from '../../../data/generated/damage/characters.json';
import growthData from '../../../data/generated/damage/growth.json';
import buffsData from '../../../data/generated/damage/buffs.json';
import targetsData from '../../../data/generated/damage/targets.json';
import equipmentData from '../../../data/generated/damage/equipment.json';
import { FIXTURES } from './fixtures';
import { ENGINE_GAME_VERSION } from './harness';
import { type DamageData } from './inputs';
import { replayFixture } from './replay';
import { type ObservedLine } from './scenario';

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
      // Rejeu au COLLECT par la logique partagée (replay.ts) : le même chemin
      // que le panneau Debug et que `pnpm damage:check`, jamais du code de
      // composant. Toute erreur est capturée pour échouer en `it`. `pending` =
      // slots § 12.4 (chaîne de hits irrésolue) : une valeur observée capturée
      // dessus est GARDÉE (test skippé) — le test d'acceptation du jour où on
      // tranche (même logique que `skipRef`, mais par ligne).
      let lines: ObservedLine[] | null = null;
      let error: unknown = null;
      let pending = new Set<string>();
      try {
        const r = replayFixture(f, data);
        lines = r.lines;
        pending = r.pending;
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
