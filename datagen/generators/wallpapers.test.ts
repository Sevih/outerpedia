/**
 * Invariants du générateur wallpapers sur `wallpapers.json` committé. Le
 * générateur est un SCAN fs + lecture d'en-têtes PNG (pas de cœur pur isolable),
 * mais sa vraie LOGIQUE — l'éclatement de `Full` par préfixe et le tri stable —
 * est directement vérifiable sur la sortie servie.
 *
 * Tourne SANS `.gamedata` (rien n'appelle buildWallpapers).
 */
import { describe, expect, it } from 'vitest';
import wallpapersData from '../../data/generated/wallpapers.json';
import { type WallpapersData, type Wallpaper } from './wallpapers';

const data = wallpapersData as WallpapersData;

describe('wallpapers.json — invariants de catalogue', () => {
  it('catégories éditoriales toujours présentes', () => {
    expect(Array.isArray(data.Outerpedia)).toBe(true);
    expect(data.HeroFullArt?.length ?? 0).toBeGreaterThan(0);
  });

  it('chaque entrée bien formée (f non vide, w/h numériques ≥ 0) et triée par f', () => {
    // Deux segments par catégorie : les entrées VIVANTES (sortie du générateur,
    // triées par f), puis les ARCHIVÉES (`retired`) — versions `@n` émises par
    // le générateur, puis entrées retenues par `promote` dans l'ordre du validé.
    // Jamais une vivante après une archivée ; le segment archivé n'est pas trié
    // (deux provenances), mais chaque stem y est unique.
    const bad: string[] = [];
    for (const [cat, list] of Object.entries(data)) {
      let prev = '';
      let inArchive = false;
      const seen = new Set<string>();
      for (const w of list as Wallpaper[]) {
        if (!w.f) bad.push(`${cat} : entrée sans f`);
        if (seen.has(w.f)) bad.push(`${cat}/${w.f} : doublon`);
        seen.add(w.f);
        if (!(typeof w.w === 'number' && w.w >= 0)) bad.push(`${cat}/${w.f} : w ${w.w}`);
        if (!(typeof w.h === 'number' && w.h >= 0)) bad.push(`${cat}/${w.f} : h ${w.h}`);
        if (w.retired) inArchive = true;
        else if (inArchive) bad.push(`${cat}/${w.f} : vivante après une archivée`);
        else if (w.f < prev) bad.push(`${cat} : ${prev} > ${w.f} (non trié)`);
        prev = w.f;
      }
    }
    expect(bad).toEqual([]);
  });

  it('éclatement de Full par préfixe : Events/Scenario/Others cohérents', () => {
    const starts = (cat: string, prefix: string): boolean =>
      (data[cat] ?? []).every((w) => w.f.startsWith(prefix));
    expect(starts('Full:Events', 'T_Event')).toBe(true);
    expect(starts('Full:Scenario', 'T_Scenario')).toBe(true);
    expect(
      (data['Full:Others'] ?? []).every(
        (w) => !w.f.startsWith('T_Event') && !w.f.startsWith('T_Scenario'),
      ),
    ).toBe(true);
  });

  it('HeroFullArt : full-arts perso réutilisés (IMG_<id>)', () => {
    expect(data.HeroFullArt.every((w) => w.f.startsWith('IMG_'))).toBe(true);
  });
});
