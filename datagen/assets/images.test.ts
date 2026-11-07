/**
 * Orchestrateur `pnpm images` (A87) : la collecte et les commandes sont
 * factices — on vérifie l'ORDRE des étapes, et que la régénération de
 * `wallpapers.json` n'a lieu que si la collecte a archivé une version, une
 * seule fois, avant tout push.
 */
import { describe, expect, it, vi } from 'vitest';
import type { CollectStats } from './collect-wallpapers';
import { REGEN, runImages, type Step } from './images';

function harness(archived: string[], args: string[] = []) {
  const steps: string[] = [];
  const stats: CollectStats = { copied: 0, skipped: 0, pruned: 0, archived };
  const log = vi.fn();
  const done = runImages(args, {
    collect: async () => {
      steps.push('collect-wallpapers');
      return stats;
    },
    run: (step: Step) => {
      steps.push(step.join(' '));
    },
    log,
  });
  return { steps, log, done };
}

const BEFORE = [
  'collect-wallpapers',
  'assets:collect',
  'assets:collect-audio',
  'assets:collect-comics',
];
const AFTER = ['editorial:push', 'assets:push', 'assets:sync-comics-seed', 'assets:commit'];

describe('runImages — orchestrateur de pnpm images', () => {
  it('sans archive : la chaîne d’origine, sans regen', async () => {
    const { steps, done } = harness([]);
    expect(await done).toEqual({ regenerated: false });
    expect(steps).toEqual([...BEFORE, ...AFTER]);
  });

  it('avec archive : build + promote ciblé une fois, après les collectes et AVANT les push', async () => {
    const { steps, log, done } = harness([
      'Full/T_ScenarioCG_RONA_01@1',
      'Cutin/T_CutIn_2000008@1',
    ]);
    expect(await done).toEqual({ regenerated: true });
    const regen = REGEN.map((s) => s.join(' '));
    expect(regen).toEqual(['datagen:build', 'datagen:promote --apply --only wallpapers.json']);
    expect(steps).toEqual([...BEFORE, ...regen, ...AFTER]);
    expect(steps.filter((s) => s === 'datagen:build')).toHaveLength(1);
    expect(log).toHaveBeenCalled(); // il le dit
  });

  it('transmet les arguments de pnpm images (--no-commit) au seul assets:commit', async () => {
    const { steps, done } = harness([], ['--no-commit']);
    await done;
    expect(steps.at(-1)).toBe('assets:commit --no-commit');
    expect(steps.filter((s) => s.includes('--no-commit'))).toHaveLength(1);
  });

  it('une étape en échec arrête la chaîne (plus de push)', async () => {
    const steps: string[] = [];
    const done = runImages([], {
      collect: async () => ({ copied: 0, skipped: 0, pruned: 0, archived: ['Full/X@1'] }),
      run: (step) => {
        steps.push(step[0]);
        if (step[0] === 'datagen:build') throw new Error('build KO');
      },
      log: () => {},
    });
    await expect(done).rejects.toThrow('build KO');
    expect(steps).not.toContain('editorial:push');
    expect(steps).not.toContain('assets:push');
  });
});
