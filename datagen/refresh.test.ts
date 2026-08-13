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
  const same = { stampedMetaSha: 'aaaa', pulledMetaSha: 'aaaa' };

  it('même version ET même metadata → rien (un patch de DONNÉES ne bouge pas le binaire)', () => {
    expect(dumpDecision({ stamped: '1.4.14', installed: '1.4.14', ...same })).toBeNull();
  });

  it('version installée plus récente → re-dump (dump.cs + listings ASM périmés)', () => {
    expect(dumpDecision({ stamped: '1.4.9', installed: '1.4.14', ...same })).toEqual({
      from: '1.4.9',
      to: '1.4.14',
      reason: 'version',
    });
  });

  it('rollback de version : différent = re-dump, on ne présume pas du sens', () => {
    expect(dumpDecision({ stamped: '1.4.14', installed: '1.4.9', ...same })).toEqual({
      from: '1.4.14',
      to: '1.4.9',
      reason: 'version',
    });
  });

  it('pas d’empreinte (1er dump jamais fait) → pas de dump surprise', () => {
    expect(dumpDecision({ stamped: null, installed: '1.4.14', ...same })).toBeNull();
  });

  it('émulateur absent ou dumpsys muet → la version ne dit rien', () => {
    expect(dumpDecision({ stamped: '1.4.14', installed: null, ...same })).toBeNull();
  });

  it('« inconnue » d’un côté ou de l’autre ne déclenche jamais un dump de minutes', () => {
    expect(dumpDecision({ stamped: 'inconnue', installed: '1.4.14', ...same })).toBeNull();
    expect(dumpDecision({ stamped: '1.4.14', installed: 'inconnue', ...same })).toBeNull();
  });

  it('metadata remplacée à version IDENTIQUE → re-dump quand même (correctif sans bump)', () => {
    const v = dumpDecision({
      stamped: '1.4.14',
      installed: '1.4.14',
      stampedMetaSha: '786cd61e56c3',
      pulledMetaSha: 'ffffffffffff',
    });
    expect(v?.reason).toBe('metadata');
  });

  it('la version prime sur la metadata quand les deux ont bougé', () => {
    const v = dumpDecision({
      stamped: '1.4.9',
      installed: '1.4.14',
      stampedMetaSha: 'aaaa',
      pulledMetaSha: 'bbbb',
    });
    expect(v).toEqual({ from: '1.4.9', to: '1.4.14', reason: 'version' });
  });

  it('metadata jamais tirée (machine sans datamine) → aucun signal', () => {
    expect(
      dumpDecision({
        stamped: '1.4.14',
        installed: '1.4.14',
        stampedMetaSha: 'aaaa',
        pulledMetaSha: null,
      }),
    ).toBeNull();
  });

  it('sans device mais metadata tirée différente → le repli suffit à déclencher', () => {
    const v = dumpDecision({
      stamped: '1.4.14',
      installed: null,
      stampedMetaSha: 'aaaa',
      pulledMetaSha: 'bbbb',
    });
    expect(v?.reason).toBe('metadata');
  });
});
