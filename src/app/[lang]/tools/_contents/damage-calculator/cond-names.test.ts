/**
 * Références d'effets de l'UI (cond-names.ts) — rejoué sur les ARTEFACTS
 * réels : la résolution passe par le glossaire des effets, id direct PUIS pont
 * `effectByTooltip` ; les sentinelles de catégorie (9996..9999) et les
 * marqueurs sans nom (4089002) restent hors de la map — le client affiche
 * alors respectivement le gabarit générique et l'id brut (revue 18/08/2026).
 * Depuis le 22/08/2026 la map porte nom + icône + desc (tag inline) et couvre
 * AUSSI les `tooltipId` des DoT (lignes DoT de la table Résultat).
 */
import { describe, expect, it } from 'vitest';
import buffsData from '@data/generated/damage/buffs.json';
import glossariesData from '@data/generated/glossaries.json';
import type { DamageBuffsData } from '@/lib/damage/inputs';
import { buildEffectRefs, type CondNameGlossary } from './cond-names';

const buffs = buffsData as unknown as DamageBuffsData;
const gloss = glossariesData as unknown as CondNameGlossary;

describe('buildEffectRefs — références d’effets des conditions et des DoT', () => {
  const refs = buildEffectRefs(buffs, gloss, 'en');

  it('résout en direct ET via le pont effectByTooltip', () => {
    // Direct : « Burned » (tooltip 1, condition du kit d'Eris entre autres).
    expect(refs['1']?.name).toBe('Burned');
    // Pont effectByTooltip : « 66 » n'est pas une clé d'effet mais une réf de
    // tooltip — perdue avant la revue du 18/08/2026.
    expect(refs['66']?.name).toBe('Cooldown Increase');
  });

  it('porte icône, desc et sens (tag inline)', () => {
    // « Bleeding » (tooltip 3) : référencé par la condition TARGET_HAS_BUFF de
    // Francesca ET tooltipId de ses DoT — même entrée pour les deux usages.
    expect(refs['3']?.name).toBe('Bleeding');
    expect(refs['3']?.icon).toBe('IG_Buff_Dot_Bleed');
    expect(refs['3']?.debuff).toBe(true);
    expect(refs['3']?.desc).toContain('Attack');
  });

  it('la famille HAS_NOT_BUFF est collectée aussi', () => {
    // « 40 » (Dual Attack) et « 4089001 » (Adam's Apple) ne sont référencés
    // QUE par des conditions *_HAS_NOT_BUFF (vérifié sur la donnée) : leur
    // présence prouve que la famille négative passe — l'ancienne regex
    // /HAS_(ALL_)?BUFF/ la laissait anonyme.
    expect(refs['40']?.name).toBe('Dual Attack');
    expect(refs['4089001']?.name).toBe("Adam's Apple");
  });

  it('sentinelles et marqueurs sans nom restent hors de la map', () => {
    for (const s of ['9996', '9997', '9998', '9999']) expect(refs[s]).toBeUndefined();
    // 4089002 : marqueur des Irréguliers, NameID vide dans le jeu — jamais un
    // nom inventé (le client montre « #4089002 »).
    expect(refs['4089002']).toBeUndefined();
  });
});
