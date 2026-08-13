/**
 * LES PRIORITÉS DE PULL NOTENT DES PALIERS, PAS DES ÉTOILES.
 *
 * Le sélecteur admin proposait « ★ 3 / 4 / 5 / 6 » et stockait ces nombres tels
 * quels, alors que la valeur part en `transcendence` au portrait. Les deux
 * échelles coïncident jusqu'à 4 puis divergent — 5★ est le palier 6, 6★ le
 * palier 9 — donc une cible saisie « 6★ » s'affichait 5★. Sans erreur ni signal,
 * puisqu'un palier 6 est parfaitement valide : c'est ce qui rendait la panne
 * invisible.
 *
 * Exactement la confusion déjà payée sur la tier list (cf.
 * `components/tierlist/transcend-step.test.ts`), et corrigée pareil : la donnée
 * porte des paliers, l'écran affiche des étoiles.
 *
 * Ce test tient les DEUX bouts — que la donnée soit dans la bonne unité, et que
 * les portraits montrent bien ce que l'éditorial vise.
 */
import { describe, expect, it } from 'vitest';
import priorities from './premium-priorities.json';
import { unlockOrder } from '../core-fusion/priorities';
import {
  transcendenceFullSteps,
  transcendenceLabel,
  transcendenceSteps,
} from '@/lib/transcendence';

/** Rareté des héros premium/limited — celle dont l'échelle porte les teintes. */
const R = 3;

/** Toutes les cibles notées, tous guides à `PriorityTiers` confondus. */
const picks = [
  ...Object.entries(priorities).flatMap(([grp, order]) =>
    Object.entries(order).flatMap(([tier, list]) =>
      (list as { name: string; stars: number }[]).map((p) => ({
        where: `premium-limited/${grp}.${tier}`,
        ...p,
      })),
    ),
  ),
  ...Object.entries(unlockOrder).flatMap(([tier, list]) =>
    list.map((p) => ({ where: `core-fusion/${tier}`, name: p.name, stars: p.stars })),
  ),
];

describe('priorités de pull — l’unité de `stars`', () => {
  it('il y a des cibles à vérifier', () => {
    // Sans ça, tout ce qui suit passerait sur une liste vide.
    expect(picks.length).toBeGreaterThan(20);
  });

  it('chaque cible est un PALIER réel du jeu', () => {
    const valid = new Set(transcendenceSteps(R));
    const bad = picks.filter((p) => !valid.has(p.stars)).map((p) => `${p.where} ${p.name}: ${p.stars}`); // prettier-ignore
    expect(bad).toEqual([]);
  });

  it('et un palier PLEIN — un éditorial ne vise pas un 5★+', () => {
    // C'est le test qui MORD sur le bug : « 5 » (compte d'étoiles) est un palier
    // valide mais pas plein — il vaut 4★+. Le seul cas rattrapé par le contrôle
    // précédent serait donc passé sans lui.
    const full = new Set(transcendenceFullSteps(R));
    const bad = picks.filter((p) => !full.has(p.stars)).map((p) => `${p.where} ${p.name}: ${p.stars} = ${transcendenceLabel(R, p.stars)}`); // prettier-ignore
    expect(bad).toEqual([]);
  });

  it('la cible de transcendance la plus haute est bien 6★ (palier 9)', () => {
    // CONTRE-ÉPREUVE de la migration : si tout avait été laissé en comptes
    // d'étoiles, le maximum serait 6 — un palier plein lui aussi (5★), donc les
    // deux contrôles ci-dessus passeraient. Ce qui les distingue, c'est qu'un
    // éditorial qui recommande de pousser un héros va jusqu'au bout de l'échelle.
    const top = Math.max(...picks.map((p) => p.stars));
    expect(transcendenceLabel(R, top)).toBe('6★');
  });
});
