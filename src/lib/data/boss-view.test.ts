/**
 * LA VUE D'UN BOSS — ce qui doit rester vrai pour qu'un guide épinglé tienne.
 *
 * Le sujet de ces tests n'est pas le contenu de la vue (il suit la donnée du
 * jeu, le figer ici le périmerait à la première extraction — leçon du comptage
 * gelé de `tags.test.ts`) mais sa PROVENANCE : la vue doit sortir des sources
 * qu'on lui donne, et de rien d'autre. Une `buildBossView` qui irait relire le
 * live en douce compilerait, passerait à l'œil, et rendrait toute l'archive
 * inutile — le boss figé afficherait les libellés d'aujourd'hui.
 *
 * Les ids sont DÉRIVÉS de la donnée committée, jamais écrits en dur.
 */
import { describe, expect, it } from 'vitest';
import type { EffectCurated, Monster } from '@contracts';
import { loadDataJson } from '@/lib/data/disk';
import { liveKitSources } from '@/lib/skill-view';
import { localizeStatuses } from '@/lib/data/effects';
import { getMonster, getMonsterSkills } from '@/lib/data/monsters';
import { bossSpawnContexts, buildBossView, type BossViewSources } from '@/lib/data/boss-view';

const monsters = loadDataJson<Record<string, Monster>>('generated/monsters.json');
const dungeons = loadDataJson<Record<string, unknown>>('generated/encounters.json');

/** Premier boss qui exerce vraiment la vue : des skills, des chips, des spawns. */
const richId = Object.keys(monsters).find((id) => {
  const m = monsters[id];
  return (m.skills?.length ?? 0) > 2 && (m.spawns?.length ?? 0) > 0;
})!;

function sources(over: Partial<BossViewSources> = {}): BossViewSources {
  return { ...liveKitSources(), dungeons: dungeons as never, ...over };
}

function viewOf(id: string, over: Partial<BossViewSources> = {}) {
  const m = getMonster(id)!;
  return buildBossView(id, m, getMonsterSkills(m, id), sources(over));
}

describe('buildBossView', () => {
  it('la donnée de test n’est pas vide', () => {
    // Sans ça, tout ce qui suit passerait en ne testant rien.
    expect(richId).toBeTruthy();
    const v = viewOf(richId);
    expect(v.name.en).toBeTruthy();
    expect(v.skills.length).toBeGreaterThan(0);
    expect(Object.keys(v.stats).length).toBeGreaterThan(0);
  });

  it('est PURE : mêmes sources, même vue', () => {
    expect(JSON.stringify(viewOf(richId))).toBe(JSON.stringify(viewOf(richId)));
  });

  it('les textes restent des DICTIONNAIRES — aucune langue n’est choisie', () => {
    // C'est ce qui permet à un guide versionné de se lire dans les cinq langues.
    const v = viewOf(richId);
    expect(typeof v.name).toBe('object');
    expect(v.skills.every((s) => typeof s.name === 'object')).toBe(true);
    expect(Object.values(v.statuses).every((s) => typeof s.name === 'object')).toBe(true);
  });

  it('le NOM d’un statut vient des sources, pas du live', () => {
    // LE test de l'affaire : si la résolution court-circuitait `src`, un boss
    // épinglé afficherait les libellés d'aujourd'hui et l'archive ne servirait
    // à rien. On renomme un effet DANS les sources et on l'exige à l'écran.
    const live = viewOf(richId);
    const key = Object.keys(live.statuses)[0];
    expect(key).toBeTruthy();
    const base = liveKitSources();
    const effId = base.g.effectByTooltip[key] ?? key;
    const curated: Record<string, EffectCurated> = {
      ...base.fx.curated,
      [effId]: { ...base.fx.curated[effId], name: { en: 'NOM-DE-TEST' } },
    };
    const pinned = viewOf(richId, { fx: { ...base.fx, curated } });
    expect(live.statuses[key].name.en).not.toBe('NOM-DE-TEST');
    expect(pinned.statuses[key].name.en).toBe('NOM-DE-TEST');
    // …et la localisation le rend tel quel : la chaîne va bien jusqu'à l'écran.
    expect(localizeStatuses(pinned.statuses, 'en')[key].name).toBe('NOM-DE-TEST');
  });

  it('un DONJON absent du live sert quand même s’il est dans les sources', () => {
    // Le bug que l'archive promettait de couvrir depuis toujours sans le faire :
    // `versionMonster` fige les donjons « pour que l'archive reste lisible même
    // si le donjon disparaît du live » (événement retiré, stage re-niveauté).
    const m = getMonster(richId)!;
    const ghost = { ...m, spawns: [{ dungeon: 'donjon-disparu-du-live', level: 42 }] };
    const sans = buildBossView(richId, ghost, getMonsterSkills(m, richId), sources());
    expect(bossSpawnContexts(sans, 'en')).toEqual([]);

    const avec = buildBossView(richId, ghost, getMonsterSkills(m, richId), {
      ...sources(),
      dungeons: {
        'donjon-disparu-du-live': { mode: 'world_boss', name: { en: 'Donjon figé' } } as never,
      },
    });
    const ctx = bossSpawnContexts(avec, 'en');
    expect(ctx).toHaveLength(1);
    expect(ctx[0].level).toBe(42);
    expect(ctx[0].label).toContain('Donjon figé');
  });

  it('la vue n’embarque QUE les donjons de ses propres spawns', () => {
    // Sinon figer un boss traînerait tout `encounters.json` derrière lui.
    const v = viewOf(richId);
    const used = new Set(v.spawns.map((s) => s.dungeon));
    expect(Object.keys(v.dungeons).every((d) => used.has(d))).toBe(true);
  });

  it('un skill répété ne compte qu’une fois', () => {
    // La dédup vit DANS la vue, pas chez ses quatre appelants : une garantie
    // qu'on ne veut pas faire reposer sur leur discipline.
    const m = getMonster(richId)!;
    const skills = getMonsterSkills(m, richId);
    const doubled = buildBossView(richId, m, [...skills, ...skills], sources());
    expect(doubled.skills).toEqual(viewOf(richId).skills);
  });
});
