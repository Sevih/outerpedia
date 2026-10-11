/**
 * Les cibles de pin d'un guide versionné (`guide-pin-targets.ts`, sorti de la
 * page admin pour quick, lot F18) : les monstres du combat de la première
 * version qui en a un, par id, nommés, avec leurs difficultés et leurs
 * archives. Sur le corpus RÉEL, en lecture : un joint challenge du site.
 */
import { describe, expect, it } from 'vitest';
import { listGuides } from '@/lib/data/guides';
import { encountersOfGroup } from '@/lib/data/encounters';
import { archiveLabel, buildPinTargets } from './guide-pin-targets';
import { loadGuideDraft } from './guide-store';

const jc = listGuides().find((g) => g.category === 'joint-challenge' && g.versions.length);

describe('buildPinTargets', () => {
  it('sans combat : aucune cible', async () => {
    expect(await buildPinTargets({ versions: [] })).toEqual([]);
    expect(
      await buildPinTargets({
        versions: [
          {
            key: '2026-01',
            tipSections: [],
            notes: [],
            recommended: [],
            recoSections: [],
            teams: [],
            videos: [],
          },
        ],
      }),
    ).toEqual([]);
  });

  it('les monstres du combat du guide, chacun une fois, nommés et situés', async () => {
    expect(jc, 'un joint challenge versionné dans le corpus').toBeDefined();
    const draft = loadGuideDraft(jc!.category, jc!.slug);
    const group = draft.versions.find((v) => v.group)?.group;
    expect(group).toBeDefined();
    const targets = await buildPinTargets(draft);
    const ids = new Set(encountersOfGroup(group!).flatMap((e) => e.monsters.map((m) => m.id)));
    expect(new Set(targets.map((t) => t.id))).toEqual(ids);
    expect(targets.map((t) => t.id)).toHaveLength(ids.size); // par id : jamais deux fois
    for (const t of targets) {
      expect(t.name).not.toBe('');
      expect(t.where.length).toBeGreaterThan(0);
      expect(Array.isArray(t.archives)).toBe(true);
    }
  });
});

describe('archiveLabel — ce qu’une archive dit d’elle-même', () => {
  it('la note humaine prime, sinon la version du jeu et la date, sinon la date', () => {
    const base = { key: '1@2', version: 2, committedAt: '2026-08-11T16:58:19+02:00' };
    expect(archiveLabel({ ...base, label: 'avant la refonte 1.11' })).toBe(
      'v2 · avant la refonte 1.11',
    );
    expect(archiveLabel({ ...base, gameVersion: '1.11.400' })).toBe(
      'v2 · game 1.11.400 · Aug 11, 2026',
    );
    expect(archiveLabel(base)).toBe('v2 · Aug 11, 2026');
  });
});
