import { describe, expect, it } from 'vitest';
import type { TFunction } from '@/i18n';
import { buildBotCharacters, buildBotGuides, buildBotItems } from '@/lib/data/bot-api';

/**
 * L'API du bot Discord est un CONTRAT INTER-REPOS : outerbot (wiki/client.ts)
 * consomme ces payloads tels quels dans ses embeds et pour créer les posts du
 * forum de reviews. On verrouille la FORME (champs présents, chemins d'images
 * relatifs, textes débarrassés des balises `<color>`) — pas les valeurs, qui
 * bougent avec la donnée du jeu.
 */
const t: TFunction = (key) => String(key);

describe('/api/bot/characters — un post de forum par perso publié', () => {
  it('chaque entrée porte le contrat WikiCharacter complet', () => {
    const characters = buildBotCharacters();
    expect(characters.length).toBeGreaterThan(100);
    for (const c of characters) {
      expect(c.slug, c.name).toMatch(/^[a-z0-9-]+$/);
      expect(c.name).toBeTruthy();
      expect(c.element).toBeTruthy();
      expect(c.class).toBeTruthy();
      expect(c.rarity).toBeGreaterThanOrEqual(1);
      expect(c.id, c.name).toBeTruthy();
    }
    // Un slug dupliqué ferait créer deux posts de reviews pour le même perso.
    expect(new Set(characters.map((c) => c.slug)).size).toBe(characters.length);
  });
});

describe('/api/bot/guides', () => {
  it('catégorie + slug (le lien du bot) et titre EN présents partout', () => {
    const guides = buildBotGuides();
    expect(guides.length).toBeGreaterThan(10);
    for (const g of guides) {
      expect(g.category).toBeTruthy();
      expect(g.slug).toBeTruthy();
      expect(g.title, `${g.category}/${g.slug}`).toBeTruthy();
    }
  });
});

describe('/api/bot/items — catalogue pré-formaté pour les embeds', () => {
  const items = buildBotItems(t);

  it('les cinq types sont servis', () => {
    const types = new Set(items.map((i) => i.type));
    expect([...types].sort()).toEqual(['amulet', 'ee', 'set', 'talisman', 'weapon']);
  });

  it('icônes relatives (le bot préfixe sa base) et textes sans balises de couleur', () => {
    for (const i of items) {
      expect(i.icon, i.name).toMatch(/^\/images\/.+\.webp$/);
      for (const tier of i.effectTiers ?? []) {
        expect(tier, `${i.name} : ${tier}`).not.toContain('<color');
        expect(tier).not.toContain('</color>');
      }
    }
  });

  it('chaque EE porte son héros (autocomplete « Porteur — Nom » du bot)', () => {
    const ee = items.filter((i) => i.type === 'ee');
    expect(ee.length).toBeGreaterThan(50);
    for (const i of ee) expect(i.characterName, i.name).toBeTruthy();
  });

  it('slugs uniques par type (la recherche du bot et les URLs en dépendent)', () => {
    for (const type of ['weapon', 'amulet', 'set', 'talisman', 'ee'] as const) {
      const slugs = items.filter((i) => i.type === type).map((i) => i.slug);
      expect(new Set(slugs).size, type).toBe(slugs.length);
    }
  });
});
