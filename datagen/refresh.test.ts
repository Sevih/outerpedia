/**
 * Tests de `refresh` — ses DÉCISIONS, isolées en fonctions pures : (re)générer
 * (`regenDecision`), re-dumper (`dumpDecision`), reprendre après échec
 * (`resumeDecision`), et sauter une étape non outillée (`preflightPython`). Le
 * reste du flux est de l'orchestration à effets de bord (execFileSync, pull) —
 * non testable sans le jeu, et sa sortie (data/generated) est déjà couverte par
 * les invariants des générateurs.
 *
 * Tourne SANS `.gamedata` : aucune de ces fonctions ne touche fs ni tables.
 */
import { describe, expect, it } from 'vitest';
import {
  dumpDecision,
  genSteps,
  preflightPython,
  regenDecision,
  resumeDecision,
  stepKey,
} from './refresh';

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

describe('genSteps — la chaîne déclarée', () => {
  const dry = genSteps({ apply: false, collect: false });

  it('les id sont UNIQUES — deux étapes de même clé se confondraient au checkpoint', () => {
    const keys = genSteps({ apply: true, collect: true }).map(stepKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('`promote` et `promote --apply` ont des clés DISTINCTES', () => {
    // Le piège : `pnpm dev` promeut en dry, `datagen:patch --apply` écrit
    // data/generated. Une clé commune ferait sauter l'écriture à une reprise
    // relancée avec --apply — le dry-run compterait pour un apply.
    const applied = genSteps({ apply: true, collect: false });
    expect(stepKey(dry.find((s) => s.id === 'promote')!)).toBe('promote');
    expect(stepKey(applied.find((s) => s.id === 'promote')!)).toBe('promote --apply');
  });

  it('collect n’est dans la chaîne que si on le demande', () => {
    expect(dry.some((s) => s.id === 'assets')).toBe(false);
    expect(genSteps({ apply: false, collect: true }).some((s) => s.id === 'assets')).toBe(true);
  });

  it('chaque étape python déclare le module dont ELLE dépend', () => {
    expect(dry.filter((s) => s.py).map((s) => [s.id, s.py])).toEqual([
      ['face-layout', 'UnityPy'],
      ['sprite-rect', 'UnityPy'],
      ['font-metrics', 'fontTools'],
    ]);
  });
});

describe('preflightPython — ce qui sera sauté, su AVANT le pull', () => {
  const steps = genSteps({ apply: false, collect: false });
  const absent = (mods: string[]) => (m: string) =>
    mods.includes(m) ? `module ${m} absent` : null;

  it('outillage complet → rien à annoncer', () => {
    expect(preflightPython(steps, () => null).size).toBe(0);
  });

  it('le module sondé est celui de l’ÉTAPE, pas un témoin', () => {
    // La panne du 2026-08-14 : le garde sondait UnityPy pour tout le monde,
    // donc une machine avec UnityPy mais sans fontTools passait le contrôle et
    // mourait en plein run. Seule font-metrics doit être annoncée ici.
    const missing = preflightPython(steps, absent(['fontTools']));
    expect([...missing.keys()]).toEqual(['font-metrics']);
  });

  it('un module manquant annonce TOUTES les étapes qui en dépendent', () => {
    expect([...preflightPython(steps, absent(['UnityPy'])).keys()]).toEqual([
      'face-layout',
      'sprite-rect',
    ]);
  });

  it('python introuvable → toutes les étapes python, aucune étape TS', () => {
    const missing = preflightPython(steps, () => 'python introuvable');
    expect([...missing.keys()]).toEqual(['face-layout', 'sprite-rect', 'font-metrics']);
    expect(missing.has('build')).toBe(false);
  });

  it('sondage MÉMOÏSÉ par module — un `python -c` par module, pas par étape', () => {
    const asked: string[] = [];
    preflightPython(steps, (m) => {
      asked.push(m);
      return null;
    });
    expect(asked).toEqual(['UnityPy', 'fontTools']);
  });
});

describe('resumeDecision — reprendre où ça a cassé', () => {
  const cp = { key: 'K', done: ['extract', 'convert'] };

  it('pas de checkpoint → chaîne complète, et rien à annoncer', () => {
    expect(resumeDecision({ force: false, key: 'K', checkpoint: null })).toEqual({
      done: [],
      discarded: null,
    });
  });

  it('même clé → on saute ce qui a déjà réussi', () => {
    expect(resumeDecision({ force: false, key: 'K', checkpoint: cp })).toEqual({
      done: ['extract', 'convert'],
      discarded: null,
    });
  });

  it('clé différente → checkpoint JETÉ (entrées ou sources modifiées depuis)', () => {
    // C'est le garde anti-« je corrige bytes-parser.ts puis je reprends » : la
    // clé porte les sources, donc la reprise ne peut pas sauter un convert qui
    // ne ferait plus le même travail.
    expect(resumeDecision({ force: false, key: 'AUTRE', checkpoint: cp })).toEqual({
      done: [],
      discarded: 'stale',
    });
  });

  it('--force jette le checkpoint même à clé identique', () => {
    expect(resumeDecision({ force: true, key: 'K', checkpoint: cp })).toEqual({
      done: [],
      discarded: 'force',
    });
  });

  it('--force sans checkpoint n’annonce RIEN — on ne jette pas ce qui n’existe pas', () => {
    expect(resumeDecision({ force: true, key: 'K', checkpoint: null }).discarded).toBeNull();
  });

  it('checkpoint vide : pas de reprise à annoncer, mais pas un rejet non plus', () => {
    expect(resumeDecision({ force: false, key: 'K', checkpoint: { key: 'K', done: [] } })).toEqual({
      done: [],
      discarded: null,
    });
  });
});
