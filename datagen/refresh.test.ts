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
import { dumpDecision, regenDecision } from './refresh';

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

describe('dumpDecision — re-dump du binaire quand le CODE du jeu a changé', () => {
  it('même version → rien à faire (un patch de DONNÉES ne bouge pas le binaire)', () => {
    expect(dumpDecision({ stamped: '1.4.14', installed: '1.4.14' })).toBeNull();
  });

  it('version installée plus récente → re-dump (dump.cs + listings ASM périmés)', () => {
    expect(dumpDecision({ stamped: '1.4.9', installed: '1.4.14' })).toEqual({
      from: '1.4.9',
      to: '1.4.14',
    });
  });

  it('rollback de version : différent = re-dump, on ne présume pas du sens', () => {
    expect(dumpDecision({ stamped: '1.4.14', installed: '1.4.9' })).toEqual({
      from: '1.4.14',
      to: '1.4.9',
    });
  });

  it('pas d’empreinte (1er dump jamais fait) → pas de dump surprise', () => {
    expect(dumpDecision({ stamped: null, installed: '1.4.14' })).toBeNull();
  });

  it('émulateur absent ou dumpsys muet → on se tait, ce n’est pas une preuve', () => {
    expect(dumpDecision({ stamped: '1.4.14', installed: null })).toBeNull();
  });

  it('« inconnue » d’un côté ou de l’autre ne déclenche jamais un dump de minutes', () => {
    expect(dumpDecision({ stamped: 'inconnue', installed: '1.4.14' })).toBeNull();
    expect(dumpDecision({ stamped: '1.4.14', installed: 'inconnue' })).toBeNull();
  });
});
