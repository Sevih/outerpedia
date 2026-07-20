/**
 * Invariants du générateur singularity sur `data/generated/` committé (modèle
 * towers.test.ts) : la rotation Dimensional Singularity est un dérivé
 * silencieux des tables (groupes hebdomadaires, ancre calendaire curée,
 * donjons 750001xx → entités dédiées 600000xx) — une dérive du générateur
 * rendrait des cartes vides ou une rotation fausse sans aucun symptôme.
 * Tourne SANS `.gamedata` (rien n'appelle buildSingularity).
 */
import { describe, expect, it } from 'vitest';
import singularityData from '../../data/generated/singularity.json';
import encountersData from '../../data/generated/encounters.json';
import monstersData from '../../data/generated/monsters.json';
import type { SingularityData } from './singularity';
import type { DungeonRef } from './encounters';

const sing = singularityData as unknown as SingularityData;
// encounters.json committé = le dict `dungeons` d'EncountersData (éclaté au build).
const dungeons = encountersData as unknown as Record<string, DungeonRef>;
const monsterIds = new Set(Object.keys(monstersData as Record<string, unknown>));

describe('singularity.json — invariants structurels', () => {
  it('des groupes existent et leurs ids ordonnent la rotation (croissants stricts)', () => {
    expect(sing.groups.length).toBeGreaterThan(0);
    const ids = sing.groups.map((g) => g.id);
    expect([...ids].sort((a, b) => a - b)).toEqual(ids);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('l’ancre calendaire pointe un groupe EXISTANT (sinon la rotation part de nulle part)', () => {
    // Optionnelle dans le TYPE (curé absent signalé au build), mais la donnée
    // COMMITTÉE doit l'avoir : sans ancre, SingularityRotation n'a pas de « maintenant ».
    const { anchor } = sing.schedule;
    expect(anchor).toBeDefined();
    expect(anchor!.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(sing.groups.some((g) => g.id === anchor!.group)).toBe(true);
  });

  it('chaque boss a un donjon extrait et des monstres connus', () => {
    const issues: string[] = [];
    for (const g of sing.groups) {
      expect(g.bosses.length, `groupe ${g.id}`).toBeGreaterThan(0);
      for (const b of g.bosses) {
        if (!dungeons[b.dungeon]) issues.push(`groupe ${g.id} → donjon ${b.dungeon}`);
        // Le générateur warn « sans spawn » mais n'exclut pas : la carte
        // rendrait un boss VIDE — d'où l'invariant dur ici.
        if (!b.monsters.length) issues.push(`groupe ${g.id} / donjon ${b.dungeon} : 0 monstre`);
        for (const m of b.monsters) {
          if (!monsterIds.has(m)) issues.push(`groupe ${g.id} → monstre ${m}`);
        }
      }
    }
    expect(issues).toEqual([]);
  });

  it('les positions (`order`) d’un groupe sont uniques et triées', () => {
    for (const g of sing.groups) {
      const orders = g.bosses.map((b) => b.order);
      expect(new Set(orders).size, `groupe ${g.id}`).toBe(orders.length);
      expect(
        [...orders].sort((a, b) => a - b),
        `groupe ${g.id}`,
      ).toEqual(orders);
    }
  });
});
