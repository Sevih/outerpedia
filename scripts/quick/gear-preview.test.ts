/**
 * Contrat de l'APERÇU de l'onglet « Gear reco » de `pnpm quick`, de bout en
 * bout : `previewGearBuilds` appelle `previewGearReco`, l'aperçu de l'admin —
 * donc le résolveur de la fiche perso —, et `previewHtml` (`ui/gear-view.mjs`)
 * rend ce qu'il en sort.
 *
 * UN FICHIER À PART, parce que l'aperçu de l'admin est gardé par `IS_DEV`
 * (`NODE_ENV === 'development'`), faux sous vitest : la garde est remplacée
 * ICI, comme `env.ts` la lève dans le processus de quick. Elle ne l'est pas
 * dans `actions.test.ts`, où elle reste le filet des stores qui écrivent. Rien
 * n'écrit ici : l'aperçu ne fait que lire le fichier des recos, jamais à des
 * coordonnées figées.
 */
import { describe, expect, it, vi } from 'vitest';
import { loadGearReco } from '@/lib/data/gear-reco';
import { gearRecoState, previewGearBuilds } from './actions';
import { previewHtml } from './ui/gear-view.mjs';

vi.mock('@/lib/admin/guard', () => ({ IS_DEV: true }));

describe('previewGearBuilds — l’aperçu, résolu par le site', () => {
  const reco = loadGearReco();
  const [id, builds] = Object.entries(reco).find(([, list]) => list.some((b) => b.note)) ?? [];
  const ok = async (list: unknown, lang: unknown) => {
    const out = await previewGearBuilds(list, lang);
    if ('error' in out) throw new Error(out.error);
    return out;
  };

  it('les builds d’un perso : un build résolu chacun, les libellés dans la langue', async () => {
    expect(id).toBeTruthy();
    const [en, fr] = [await ok(builds, 'en'), await ok(builds, 'fr')];
    expect(en.builds.map((b) => b.name)).toEqual(builds?.map((b) => b.name));
    expect(fr.builds).toHaveLength(builds?.length ?? 0);
    expect(Object.values(en.labels).every(Boolean)).toBe(true);
    expect(fr.labels).not.toEqual(en.labels);
    // Les pièces du fichier sont toutes connues ; la note sort en segments.
    for (const b of en.builds) {
      expect([...b.weapons, ...b.amulets, ...b.talismans].filter((p) => p.unresolved)).toEqual([]);
      expect(b.talismans.every((p) => !p.id.startsWith('$'))).toBe(true);
    }
    expect(en.builds.some((b) => b.noteSegments.length > 0)).toBe(true);
    // Une langue inconnue, ou absente : celle de repli.
    expect((await ok(builds, 'zz')).labels).toEqual(en.labels);
    expect((await ok(builds, undefined)).labels).toEqual(en.labels);
  });

  it('une balise que le site ne résout pas sort en segment `unknown`', async () => {
    const out = await ok([{ name: 'x', note: { en: 'a {B/nope} b\\nc {E/fire}' } }], 'en');
    expect(out.builds[0].noteSegments).toEqual([
      { t: 'text', s: 'a ' },
      { t: 'unknown', s: '{B/nope}' },
      { t: 'text', s: ' b' },
      { t: 'br' },
      { t: 'text', s: 'c ' },
      expect.objectContaining({ t: 'icon', color: 'text-fire' }),
    ]);
  });

  it('tolérant : un id inconnu, un preset absent, un nom vide sont résolus tels quels', async () => {
    const out = await ok(
      [
        {
          name: '',
          weapons: [{ id: 'nope', mainStat: 'ATK%' }],
          talismans: ['$nope'],
          sets: [{ preset: 'nope' }, { pieces: [{ set: 'nope', count: 4 }] }],
          substats: '$nope',
        },
      ],
      'en',
    );
    const [b] = out.builds;
    expect(b.weapons).toEqual([{ id: 'nope', name: 'nope', mainStat: 'ATK%', unresolved: true }]);
    expect(b.talismans).toEqual([{ id: '$nope', name: '$nope', unresolved: true }]);
    expect(b.sets).toEqual([[], [{ id: 'nope', name: 'nope', count: 4 }]]);
    expect(b.setEffects).toEqual([]);
    // Aucun build : rien à résoudre, les libellés quand même.
    expect((await ok([], 'en')).builds).toEqual([]);
  });

  it('ce que rend la route se rend tel quel : les builds réels d’un perso', async () => {
    const env = {
      imgBase: 'https://img.test',
      esc: (v: unknown) =>
        String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'),
    };
    const [, builds] = Object.entries(loadGearReco()).find(([, list]) =>
      list.some((b) => b.note && (b.sets?.length ?? 0) > 0),
    ) ?? ['', []];
    const out = await previewGearBuilds(builds, 'en');
    if ('error' in out) throw new Error(out.error);
    expect(out.builds.length).toBeGreaterThan(0);
    for (const b of out.builds) {
      const html = previewHtml(env, b, out.labels, gearRecoState().statIcons);
      expect(html, b.name).toContain('class="pv-row');
      expect(html, b.name).not.toContain('pv-unknown');
      expect(html, b.name).not.toContain('pv-bad');
      expect(html, b.name).not.toContain('undefined');
    }
  });
});
