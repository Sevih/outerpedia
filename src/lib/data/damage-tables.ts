/**
 * Chargement À LA DEMANDE des tables du moteur de dégâts côté client
 * (`data/generated/damage/*.json`, ~11 Mo) : `import()` dynamiques, donc des
 * chunks séparés — rien dans le bundle initial du visiteur. Ce module ne doit
 * JAMAIS importer statiquement un de ces JSON : le composant client qui le tire
 * les emporterait d'office. La mémoïsation reste chez l'appelant.
 */
import type { DamageData } from '@/lib/damage/inputs';
import type { SkillDescsData } from '@datagen/damage/skill-descs';

/** Les cinq tables du moteur, chargées ensemble. */
export async function loadDamageTables(): Promise<DamageData> {
  const [c, g, b, t, q] = await Promise.all([
    import('@data/generated/damage/characters.json'),
    import('@data/generated/damage/growth.json'),
    import('@data/generated/damage/buffs.json'),
    import('@data/generated/damage/targets.json'),
    import('@data/generated/damage/equipment.json'),
  ]);
  return {
    characters: c.default,
    growth: g.default,
    buffs: b.default,
    targets: t.default,
    equipment: q.default,
  } as unknown as DamageData;
}

/** Descriptions de skills du popover (`damage/skill-descs.json`). */
export async function loadSkillDescs(): Promise<SkillDescsData> {
  const m = await import('@data/generated/damage/skill-descs.json');
  return m.default as unknown as SkillDescsData;
}
