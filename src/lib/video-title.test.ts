import { describe, expect, it } from 'vitest';
import { cleanVideoTitle } from '@/lib/video-title';

/**
 * Les cas sont PRIS dans les titres réellement en base (132 de guides, 83 de
 * persos au 02/10) : c'est là que vivent les formes qu'on n'inventerait pas —
 * nom du mode collé au boss, double espace, pipe final, crochets autour du nom
 * du jeu, titre qui n'est QUE du bruit.
 */
describe('cleanVideoTitle', () => {
  it('retire le nom du mode et celui du jeu, où qu’ils soient', () => {
    expect(cleanVideoTitle('Dimensional Singularity KSAI - Regina/Roxie Team | Outerplane')).toBe(
      'KSAI - Regina/Roxie Team',
    );
    expect(cleanVideoTitle('Water Team - Dimensional Singularity KSAI | Outerplane')).toBe(
      'Water Team - KSAI',
    );
    expect(cleanVideoTitle('[OUTERPLANE] Re-animator, Mero')).toBe('Re-animator, Mero');
    expect(cleanVideoTitle('Dahlia World Boss Guide')).toBe('Dahlia Guide');
  });

  it('tolère les espaces doublés du titre d’origine', () => {
    // Ce titre-là existe : « Singularity » et le tiret sont séparés de deux espaces.
    expect(cleanVideoTitle('Dimensional Singularity KSAI  - Rin/Lambda Team | Outerplane')).toBe(
      'KSAI - Rin/Lambda Team',
    );
  });

  it('ne laisse derrière lui ni séparateur orphelin ni délimiteur vide', () => {
    expect(cleanVideoTitle('Skuld — Dimensional Singularity')).toBe('Skuld');
    expect(cleanVideoTitle('SSS Extreme League World Boss Venion! [Outerplane]')).toBe(
      'SSS Extreme League Venion!',
    );
    expect(cleanVideoTitle('Promotion Battle vs DStella - Adventure License!')).toBe(
      'Promotion Battle vs DStella!',
    );
    // Deux séparateurs se retrouvent côte à côte : le premier fait foi.
    expect(cleanVideoTitle('Demiurge Vlada - Adventure License: Promotion Challenge')).toBe(
      'Demiurge Vlada - Promotion Challenge',
    );
  });

  it('épargne un motif qui CLÔT la phrase sans séparateur devant lui', () => {
    // Sans cette garde : « … Testing, and New » — une phrase coupée net.
    const t = 'Holy Night Dianne Summons, Testing, and New World Boss';
    expect(cleanVideoTitle(t)).toBe(t);
  });

  it('garde le titre entier plutôt que de rendre une chaîne vide', () => {
    expect(cleanVideoTitle('Outerplane - World Boss')).toBe('Outerplane - World Boss');
  });

  it('laisse intact un titre sans bruit', () => {
    expect(cleanVideoTitle('Gustav — Stage 10 — 1 run clear')).toBe(
      'Gustav — Stage 10 — 1 run clear',
    );
  });
});
