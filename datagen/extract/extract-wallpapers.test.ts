/**
 * Classifieurs PURS de l'extraction wallpapers (audit E1) — testés sans pool
 * d'images ni sharp, ils ne prennent que nom/chemin/dimensions :
 *   - `shouldExclude`   : la blocklist (nom + chemin) qui écarte UI, FX, textures 3D
 *     et les HeroFullArt réutilisés ailleurs (`IMG_<id>`) ;
 *   - `getCategory`     : Full (dimensionnel) / Banner / Cutin / Art — premier match
 *     gagne, l'ORDRE est significatif ;
 *   - `getPriorityScore`: départage les quasi-doublons — CG scénario > BG scénario
 *     > BG event > CG event, bonus `_E2`, IMG_ par id décroissant.
 */
import { describe, expect, it } from 'vitest';
import { getCategory, getPriorityScore, shouldExclude } from './extract-wallpapers';

describe('shouldExclude — blocklist nom + chemin', () => {
  const excl = (name: string) => shouldExclude(`/pool/${name}`, name);

  it('garde un vrai candidat (CG scénario) — aucun motif ne matche', () => {
    // Nom RÉEL du pool (cf. wallpapers.json) : ni `_a/_d/_body/_cloud`, ni digits.
    expect(excl('T_ScenarioCG_BRYN_01.png')).toBe(false);
  });

  it('écarte les HeroFullArt (IMG_<id>, réutilisés ailleurs)', () => {
    expect(excl('IMG_2000001.png')).toBe(true);
  });

  it('écarte UI / FX / familles de la blocklist', () => {
    expect(excl('T_FX_flash.png')).toBe(true);
    expect(excl('T_ScenarioBG_0001.png')).toBe(true); // ^T_ScenarioBG_\d+
    expect(excl('T_Some_UI.png')).toBe(true); // _UI
    expect(excl('some#thing.png')).toBe(true); // #
  });

  it('écarte par CHEMIN (textures de modèles 3D) quel que soit le nom', () => {
    // Nom qui passerait seul → seul le CHEMIN (model/textures) déclenche l'exclusion.
    const name = 'T_ScenarioCG_BRYN_01.png';
    expect(shouldExclude(`/pool/model/textures/${name}`, name)).toBe(true);
  });
});

describe('blocklist PORTEUSE — comportement gelé (mesure E7 du 26/07)', () => {
  // La mesure sur le pool réel a montré que ces motifs sont le SEUL rempart de
  // vrais candidats : des images CATÉGORISABLES (ici 2048×1024 → Full) que la
  // blocklist doit malgré tout écarter. Sans eux, 952 images fuiraient. On gèle
  // le couple « catégorisable MAIS exclu » pour qu'un futur « nettoyage » de la
  // blocklist ne casse pas la sortie en silence.
  const porteurs = [
    'T_Banner_Summer.png', // ^T_Banner_ — 80 rattrapés
    'LOADING_Chapter3.png', // ^LOADING_ — 64
    'T_Event_World_Map.png', // ^T_Event_World_ — 36
    'T_Boss_a.png', // _(d|body|cloud|a) — 21
    'weird#name.png', // # — 10
  ];

  it('chaque motif porteur : nom catégorisable (Full 2048×1024) MAIS exclu', () => {
    for (const name of porteurs) {
      expect(getCategory(name, 2048, 1024)).not.toBeNull(); // sortirait sinon…
      expect(shouldExclude(`/pool/${name}`, name)).toBe(true); // …mais la blocklist l'écarte
    }
  });
});

describe('getCategory — premier match gagne (ordre significatif)', () => {
  it('Full est DIMENSIONNEL (2048×1024), indépendant du nom', () => {
    expect(getCategory('T_ScenarioCG_A0106', 2048, 1024)).toBe('Full');
  });

  it('Full l’emporte sur le nom : un Cutin en 2048×1024 → Full (ordre)', () => {
    expect(getCategory('T_CutIn_2000001', 2048, 1024)).toBe('Full');
  });

  it('Banner / Cutin / Art se classent par NOM', () => {
    expect(getCategory('T_Event_Banner_X', 800, 400)).toBe('Banner');
    expect(getCategory('T_CutIn_2000001', 500, 500)).toBe('Cutin');
    expect(getCategory('t_cutin_lowercase', 500, 500)).toBe('Cutin'); // insensible à la casse
    expect(getCategory('T_Demi_Something', 500, 500)).toBe('Art');
  });

  it('aucune catégorie → null (le scan l’écarte)', () => {
    expect(getCategory('T_Inconnu', 500, 500)).toBeNull();
    expect(getCategory('T_CutIn_2000001', 100, 100)).toBe('Cutin'); // le nom suffit, dims libres
  });
});

describe('getPriorityScore — représentant d’un groupe de doublons', () => {
  it('hiérarchie CG scénario > BG scénario > BG event > CG event', () => {
    expect(getPriorityScore('T_ScenarioCG_A0106')).toBe(100);
    expect(getPriorityScore('T_ScenarioBG_A0106')).toBe(80);
    expect(getPriorityScore('T_Event_BG_Summer')).toBe(20);
    expect(getPriorityScore('T_Event_CG_Summer')).toBe(10);
  });

  it('bonus `_E2` cumulé (+50)', () => {
    expect(getPriorityScore('T_ScenarioCG_A0106_E2')).toBe(150);
  });

  it('nom hors hiérarchie → 0', () => {
    expect(getPriorityScore('T_Demi_Something')).toBe(0);
  });

  it('IMG_ départagé par l’id (score négatif décroissant avec l’id)', () => {
    // score -= id/1000 : plus l'id est GRAND, plus le score baisse → l'id le plus
    // petit l'emporte au tri. (IMG_ est exclu des wallpapers ; tie-break hérité.)
    expect(getPriorityScore('IMG_2000001')).toBeGreaterThan(getPriorityScore('IMG_2000010'));
  });
});
