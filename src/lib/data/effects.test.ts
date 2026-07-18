import { describe, expect, it } from 'vitest';
import {
  curatedKeyIndex,
  effectForTooltip,
  getMergedEffect,
  loadCuratedEffects,
  resolveEffectKey,
} from '@/lib/data/effects';

/**
 * La résolution par tooltip sert l'AFFICHAGE (immunités des cartes de boss,
 * chips d'équipement) : elle doit rendre l'effet FUSIONNÉ, curation comprise.
 * Le bug qu'on verrouille : elle renvoyait l'extrait brut, et chaque override
 * curé était silencieusement ignoré partout où un tooltip résolvait.
 */
describe('résolution par tooltip — la curation gagne', () => {
  it("chaque override d'icône curé traverse la résolution par tooltip", () => {
    const overridden = Object.entries(loadCuratedEffects()).filter(([, c]) => c.icon);
    // S'il n'y a plus un seul override d'icône, ce test ne prouve plus rien :
    // le faire savoir plutôt que passer en silence.
    expect(overridden.length).toBeGreaterThan(0);
    for (const [id, c] of overridden) {
      const eff = getMergedEffect(id);
      expect(eff?.icon, `effet ${id}`).toBe(c.icon);
      for (const tid of eff?.tooltips ?? []) {
        expect(effectForTooltip(tid)?.icon, `tooltip ${tid} → effet ${id}`).toBe(c.icon);
      }
    }
  });

  it("le cas payé : « Priority Increase » (61) porte l'icône de combat curée", () => {
    // L'icône d'encyclopédie du jeu (SC_Buff_Effect_Increase_Priority) repartait
    // à l'écran sur les immunités des world boss, à la place de l'icône de
    // combat curée — celle que le joueur voit sous la barre du boss.
    expect(effectForTooltip('61')?.icon).toBe('IG_Buff_Action_Gauge_Up');
  });
});

/**
 * L'index des clés curées est PARTAGÉ par `resolveEffectKey` (côté effects) et
 * `curatedCreationFor` (côté skill-view) : on verrouille qu'il reste fidèle à un
 * scan linéaire de `loadCuratedEffects` — la raison d'être de l'extraction.
 */
describe('index des clés curées — fidèle au scan linéaire', () => {
  it("byKey = premier gagnant, exactement comme le .find() qu'il remplace", () => {
    const { byKey } = curatedKeyIndex();
    const entries = Object.entries(loadCuratedEffects());
    const allKeys = new Set(entries.flatMap(([, c]) => c.keys ?? []));
    for (const key of allKeys) {
      const expected = entries.find(([, c]) => c.keys?.includes(key))?.[0];
      expect(byKey.get(key), `clé ${key}`).toBe(expected);
    }
  });

  it("resolveEffectKey trouve toute création curée par n'importe quelle clé", () => {
    for (const [id, c] of Object.entries(loadCuratedEffects())) {
      for (const key of c.keys ?? []) {
        // La clé ne peut être détournée par l'index généré (BY_KEY) : on vérifie
        // seulement que la clé résout bien vers UN effet (le sien ou un homonyme
        // généré prioritaire), jamais undefined.
        expect(resolveEffectKey('debuff', key), `clé ${key} (curé ${id})`).toBeDefined();
      }
    }
  });
});
