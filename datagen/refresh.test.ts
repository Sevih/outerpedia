/**
 * Tests de `refresh` — la DÉCISION DE (RE)GÉNÉRATION, isolée en fonction pure
 * (`regenDecision`). C'est le gating documenté : la chaîne extract→build ne
 * tourne QUE sur un pull neuf, `--force`, ou une signature d'entrées ≠ dernier
 * build réussi (auto-réparation). Le reste du flux est de l'orchestration à
 * effets de bord (execFileSync, pull) — non testable sans le jeu, et sa sortie
 * (data/generated) est déjà couverte par les invariants des générateurs.
 *
 * Tourne SANS `.gamedata` : `regenDecision` ne touche ni fs ni tables.
 */
import { describe, expect, it } from 'vitest';
import { regenDecision } from './refresh';

const base = { hasGamedata: true, force: false, changed: false, prevSig: 'A', currentSig: 'A' };

describe('regenDecision — gating de la chaîne extract→build', () => {
  it('pas de .gamedata → jamais de génération (même --force / changed)', () => {
    expect(regenDecision({ ...base, hasGamedata: false, force: true, changed: true }).doGen).toBe(
      false,
    );
  });

  it('signature identique au dernier build → rien à faire', () => {
    expect(regenDecision(base)).toEqual({ doGen: false, staleByStamp: false });
  });

  it('le pull a ramené du neuf → génération', () => {
    expect(regenDecision({ ...base, changed: true }).doGen).toBe(true);
  });

  it('--force régénère même si le local est à jour (sans être « stale »)', () => {
    expect(regenDecision({ ...base, force: true })).toEqual({ doGen: true, staleByStamp: false });
  });

  it('signature ≠ dernier build → génération par auto-réparation', () => {
    expect(regenDecision({ ...base, currentSig: 'B' })).toEqual({
      doGen: true,
      staleByStamp: true,
    });
  });

  it('1er run (prevSig null) : PAS stale → amorçage de baseline sans régénérer', () => {
    expect(regenDecision({ ...base, prevSig: null })).toEqual({
      doGen: false,
      staleByStamp: false,
    });
  });
});
