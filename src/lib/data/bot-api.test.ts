import { describe, expect, it, vi } from 'vitest';
import { loadMessages, makeT, type TFunction } from '@/i18n';
import {
  buildBotChangelog,
  buildBotCharacters,
  buildBotCoupons,
  buildBotGuides,
  buildBotItems,
} from '@/lib/data/bot-api';
import { getCharacterBySlug } from '@/lib/data/characters';
import { getEquipmentDetail } from '@/lib/data/equipment-detail';
import { getGuide } from '@/lib/data/guides';
import { COUPON_REDEEM_URL } from '@/lib/data/promo-rules';
import { LANGS } from '@/lib/i18n/config';
import type { CouponVM } from '@/lib/home';

// Les coupons actifs viennent de R2 : une liste figée à la place, aucun appel réseau.
vi.mock('@/lib/home', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/home')>()),
  getActiveCoupons: async () => ({
    codes: [
      {
        code: 'OUTER2026',
        start: '2026-10-01',
        end: '2026-10-31',
        rewards: [{ item: { name: 'Gold' }, qty: '100000' }],
      },
    ] as unknown as CouponVM[],
    activeCount: 1,
  }),
}));

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

  it('`href` mène à la fiche, `icon` est la face icon en chemin relatif', () => {
    for (const c of buildBotCharacters()) {
      expect(c.href, c.name).toBe(`/characters/${c.slug}`);
      expect(getCharacterBySlug(c.slug)?.id, c.name).toBe(c.id);
      expect(c.icon, c.name).toBe(`/images/characters/faceicon/FI_${c.id}.webp`);
    }
  });

  it('aucun slug n’est fait que de chiffres : le bot distingue id et slug par la forme', () => {
    // `/reviews/<id>` et `/reviews/<slug>` (lot suivant du bot) : les ids sont
    // tous numériques, un slug numérique serait pris pour un id.
    const characters = buildBotCharacters();
    for (const c of characters) {
      expect(c.slug, c.name).not.toMatch(/^\d+$/);
      expect(c.id, c.name).toMatch(/^\d+$/);
    }
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

  it(
    '`href` mène à une page de guide qui existe',
    // Parcourt le disque : hors production, chaque `getGuide` rescanne tous les
    // guides, donc ~150 scans complets ; ~7 s seul sur le fixe (Windows), sous
    // les 5 s sur le portable (Fedora) — 24/10.
    { timeout: 30_000 },
    () => {
      for (const g of buildBotGuides()) {
        expect(g.href).toBe(`/guides/${g.category}/${g.slug}`);
        expect(getGuide(g.category, g.slug), g.href).toBeDefined();
      }
    },
  );
});

describe('/api/bot/coupons', () => {
  it('chaque code porte le lien de la page des codes et l’adresse d’échange officielle', async () => {
    const coupons = await buildBotCoupons();
    expect(coupons).toHaveLength(1);
    for (const c of coupons) {
      expect(c.href).toBe('/coupons');
      expect(c.redeemUrl).toBe(COUPON_REDEEM_URL);
    }
  });

  it('le lien iOS de la page `/coupons` est la même constante, dans les six langues', async () => {
    for (const lang of LANGS) {
      const html = makeT(await loadMessages(lang))('coupons.redeem_ios', {
        url: COUPON_REDEEM_URL,
      });
      expect(html, lang).toContain(`href="${COUPON_REDEEM_URL}"`);
      expect(html, lang).not.toContain('{url}');
    }
  });
});

describe('/api/bot/changelog', () => {
  it('chaque entrée porte son id stable (8 hex), unique', () => {
    const entries = buildBotChangelog();
    expect(entries.length).toBeGreaterThan(0);
    for (const e of entries) expect(e.id, e.title).toMatch(/^[0-9a-f]{8}$/);
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length);
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

  it('aucune ligne ne garde de `\\n` littéral (les sauts de ligne du jeu sont convertis)', () => {
    for (const i of items) {
      for (const tier of i.effectTiers ?? []) expect(tier, i.name).not.toContain('\\n');
    }
  });

  it('talismans et EE : chaque palier dit le texte de la page détail, à SON niveau', () => {
    const embed = (s: string) => s.replace(/<\/?color[^>]*>/g, '').replace(/\\n/g, '\n');
    const levelled = items.filter((i) => i.type === 'talisman' || i.type === 'ee');
    expect(levelled.length).toBeGreaterThan(50);
    for (const i of levelled) {
      const detail = getEquipmentDetail(i.slug, 'en');
      expect(detail?.kind, i.name).toBe(i.type);
      const page = detail!.passives.map((p) => embed(p.texts[0]));
      const bot = (i.effectTiers ?? []).map((tier) => tier.replace(/^Lv\.\d+: /, ''));
      expect(bot, i.name).toEqual(page);
    }
  });

  it('chaque EE porte son héros (autocomplete « Porteur — Nom » du bot)', () => {
    const ee = items.filter((i) => i.type === 'ee');
    expect(ee.length).toBeGreaterThan(50);
    for (const i of ee) expect(i.characterName, i.name).toBeTruthy();
  });

  it('`href` mène à la page détail de l’item (variantes multi-classes et EE comprises)', () => {
    for (const i of items) {
      expect(i.href, i.name).toBe(`/equipment/${i.slug}`);
      expect(getEquipmentDetail(i.slug, 'en'), i.href).toBeDefined();
    }
  });

  it('slugs uniques par type (la recherche du bot et les URLs en dépendent)', () => {
    for (const type of ['weapon', 'amulet', 'set', 'talisman', 'ee'] as const) {
      const slugs = items.filter((i) => i.type === type).map((i) => i.slug);
      expect(new Set(slugs).size, type).toBe(slugs.length);
    }
  });
});
