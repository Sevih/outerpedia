import { describe, expect, it } from 'vitest';
import {
  guideUpdatedDate,
  listGuides,
  listGuidesByCategory,
  readGuideFile,
} from '@/lib/data/guides';
import { GUIDE_TIER_KEYS, categoryRequires } from '@/lib/data/guide-categories';
import { encountersOfGroup } from '@/lib/data/encounters';
import { findCharacterByName } from '@/lib/data/characters';
import { checkText } from '@/lib/parse-text';

describe('guideUpdatedDate — résolution de la date de mise à jour', () => {
  it('privilégie le `updated` explicite du meta', () => {
    expect(
      guideUpdatedDate({
        updated: '2026-03-24',
        versions: [{ key: '2026-03' }, { key: '2025-10' }],
      }),
    ).toBe('2026-03-24');
  });

  it('dérive du dossier de version le plus récent quand `updated` est absent', () => {
    expect(
      guideUpdatedDate({ updated: undefined, versions: [{ key: '2026-03' }, { key: '2025-10' }] }),
    ).toBe('2026-03-01');
  });

  it('rend une chaîne vide pour un guide plat sans date (cas exclu par le scan)', () => {
    expect(guideUpdatedDate({ updated: undefined, versions: [] })).toBe('');
  });

  it('tous les guides réels résolvent une date ISO (le scan garantit la résolvabilité)', () => {
    for (const g of listGuides()) {
      expect(guideUpdatedDate(g), `${g.category}/${g.slug}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('champs exigés par la vue d’une catégorie (`requires`)', () => {
  it('chaque guide porte les champs que sa catégorie exige', () => {
    for (const g of listGuides()) {
      for (const field of categoryRequires(g.category)) {
        expect(g[field], `${g.category}/${g.slug} : « ${field} » manquant`).toBeDefined();
      }
    }
  });

  /**
   * Le trou de la V2 : sa map `TIER_BY_SLUG` vivait dans le composant et un
   * guide absent était filtré SANS BRUIT. Ici la vue regroupe par palier
   * déclaré — ce test vérifie qu'aucun guide ne peut tomber hors des paniers.
   */
  it('aucun guide de general-guides ne tombe hors des paliers déclarés', () => {
    const guides = listGuidesByCategory('general-guides');
    const bucketed = GUIDE_TIER_KEYS.flatMap((tier) => guides.filter((g) => g.tier === tier));
    expect(bucketed).toHaveLength(guides.length);
  });
});

describe('special-request — les guides désignent des combats réels, entièrement couverts', () => {
  const guides = listGuidesByCategory('special-request');

  it('les dix échelles portées, chacune sur un combat de treize stages', () => {
    expect(guides).toHaveLength(10);
    for (const g of guides) {
      expect(encountersOfGroup(g.group!), `${g.slug} : ${g.group}`).toHaveLength(13);
    }
  });

  /**
   * Les équipes valent par PLAGE de stages (`teams.json`). Une plage mal bornée
   * ne casse rien à l'écran : le stage orphelin n'affiche simplement pas
   * d'équipe, et personne ne le voit. C'est exactement le genre de trou
   * silencieux qu'on attrape ici — chaque stage doit être couvert par
   * exactement UNE plage.
   */
  it('les plages d’équipes couvrent chaque stage, sans trou ni chevauchement', () => {
    for (const g of guides) {
      const teams = readGuideFile<{ buckets: Array<{ stages: [number, number] }> }>(
        g,
        'teams.json',
      );
      expect(teams, `${g.slug} : teams.json`).toBeDefined();
      const count = encountersOfGroup(g.group!).length;
      for (let order = 1; order <= count; order++) {
        const covering = teams!.buckets.filter((b) => order >= b.stages[0] && order <= b.stages[1]);
        expect(covering, `${g.slug} : stage ${order}`).toHaveLength(1);
      }
    }
  });

  it('le boss du meta (og:image) est bien le boss PRINCIPAL du stage le plus haut', () => {
    for (const g of guides) {
      const ladder = encountersOfGroup(g.group!);
      const top = ladder[ladder.length - 1];
      const main = top.monsters.find((m) => m.role === 'boss' && m.hpLines);
      expect(g.bossId, g.slug).toBe(main?.id);
    }
  });
});

describe('irregular-extermination — les guides désignent des combats réels', () => {
  const guides = listGuidesByCategory('irregular-extermination');

  it('les quatre poursuites portées, chacune sur un combat de trois difficultés', () => {
    expect(guides).toHaveLength(4);
    for (const g of guides) {
      expect(encountersOfGroup(g.group!), `${g.slug} : ${g.group}`).toHaveLength(3);
    }
  });

  it('le boss du meta (portrait de la vue, og:image) est celui du Very Hard', () => {
    for (const g of guides) {
      const ladder = encountersOfGroup(g.group!);
      const top = ladder[ladder.length - 1];
      expect(g.bossId, g.slug).toBe(top.monsters[0].id);
    }
  });

  it("l'ordre de la catégorie est celui du jeu (order = GroupID de la poursuite)", () => {
    for (const g of guides) {
      expect(g.group, g.slug).toBe(`irregular_chase:${g.order}`);
    }
  });

  /**
   * Le rendu est STRICT (un nom de perso ou un tag inconnu jette au SSG), mais
   * la gate de dev ne fait pas de build : on vérifie ICI que le contenu porté
   * résout — noms de personnages des sections, et tous les tags `{X/…}` de tous
   * les textes (le dialecte `_IR` de la V2 compris, porté tel quel).
   */
  it('tous les personnages cités existent (recommended + teams)', () => {
    for (const g of guides) {
      const recommended =
        readGuideFile<Array<{ characters: string[] }>>(g, 'recommended.json') ?? [];
      const teams = readGuideFile<Array<{ slots: string[][] }>>(g, 'teams.json') ?? [];
      const names = [
        ...recommended.flatMap((r) => r.characters),
        ...teams.flatMap((t) => t.slots.flat()),
      ];
      expect(names.length, g.slug).toBeGreaterThan(0);
      for (const name of names) {
        expect(findCharacterByName(name), `${g.slug} : « ${name} » introuvable`).toBeDefined();
      }
    }
  });

  it('tous les tags inline du contenu résolvent (effets, persos, équipement)', () => {
    /** Toutes les chaînes d'un JSON de contenu, récursivement. */
    const strings = (v: unknown): string[] => {
      if (typeof v === 'string') return [v];
      if (Array.isArray(v)) return v.flatMap(strings);
      if (v && typeof v === 'object') return Object.values(v).flatMap(strings);
      return [];
    };
    for (const g of guides) {
      for (const file of ['tips.json', 'recommended.json', 'teams.json']) {
        const data = readGuideFile<unknown>(g, file);
        if (!data) continue;
        for (const s of strings(data)) {
          for (const check of checkText(s)) {
            expect(
              check.ok,
              `${g.slug}/${file} : tag {${check.type}/${check.value}} — ${check.reason ?? ''}`,
            ).toBe(true);
          }
        }
      }
    }
  });
});
