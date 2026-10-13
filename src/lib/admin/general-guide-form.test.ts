/**
 * La forme servie des guides généraux : quatre guides, une description par
 * onglets et blocs que quick rend sans connaître les guides, et la clé d'un
 * champ qui retrouve son bloc (pour situer un refus).
 */
import { describe, expect, it } from 'vitest';
import {
  GENERAL_GUIDE_KINDS,
  blockOfKey,
  generalGuideForm,
  generalGuideKind,
  type ShopFormData,
} from './general-guide-form';

const SHOP: ShopFormData = {
  derived: [
    { key: 'arena', currency: { name: { en: 'Arena Coin' }, icon: 'TI_Arena' } },
    { key: 'guild', currency: { name: { en: 'Guild Coin' }, icon: 'TI_Guild' } },
  ],
  editorial: { textShops: { supply: { paragraphs: [] } }, shopNotes: { joint: { en: 'Save' } } },
};

describe('generalGuideKind — les quatre slugs éditables, rien d’autre', () => {
  it('reconnaît les quatre guides branchés et refuse un autre slug', () => {
    expect(Object.keys(GENERAL_GUIDE_KINDS)).toEqual([
      'premium-limited',
      'free-heroes-start-banner',
      'shop-purchase-priorities',
      'core-fusion',
    ]);
    expect(generalGuideKind('core-fusion')).toBe('core-fusion');
    expect(generalGuideKind('premium-limited')).toBe('premium-limited');
    expect(generalGuideKind('beginner-faq')).toBeUndefined();
    expect(generalGuideForm('beginner-faq', {})).toBeUndefined();
    expect(generalGuideKind('constructor')).toBeUndefined();
  });
});

describe('generalGuideForm — Premium & Limited', () => {
  const form = generalGuideForm('premium-limited', {})!;

  it('quatre onglets : par bucket, Reviews puis Priorités ; les reviews en `roster` sur le roster du bucket, les quatre paliers ordonnés en `tiles`', () => {
    expect(form.kind).toBe('premium-limited');
    expect(form.versioned).toBe(false);
    expect(form.tabs.map((t) => [t.id, t.label])).toEqual([
      ['premium-reviews', 'Premium · Reviews'],
      ['premium-priorities', 'Premium · Priorités'],
      ['limited-reviews', 'Limited · Reviews'],
      ['limited-priorities', 'Limited · Priorités'],
    ]);
    const [reviews, priorities] = form.tabs.slice(2);
    expect(
      reviews.blocks.map((b) => [
        b.id,
        b.path.join('.'),
        b.add,
        b.view,
        b.roster,
        b.ordered ?? false,
      ]),
    ).toEqual([['limited-reviews', 'reviews.limited', 'hero', 'roster', 'limited', false]]);
    // Un perso attendu sans review n'y casse rien : la forme ne demande aucun badge.
    expect(form.tabs.flatMap((t) => t.blocks).some((b) => b.missing)).toBe(false);
    expect(
      priorities.blocks.map((b) => [b.id, b.path.join('.'), b.add, b.view, b.ordered ?? false]),
    ).toEqual([
      ['limited-first', 'priorities.limited.first', 'hero', 'tiles', true],
      ['limited-second', 'priorities.limited.second', 'hero', 'tiles', true],
      ['limited-third', 'priorities.limited.third', 'hero', 'tiles', true],
      ['limited-transcend', 'priorities.limited.transcend', 'hero', 'tiles', true],
    ]);
    expect(priorities.blocks.map((b) => b.label)).toEqual([
      '1er choix',
      '2e choix',
      '3e choix',
      'Priorité de transcendance',
    ]);
  });

  it('une review : le héros (libéré par « pas encore sorti »), la review requise, les cibles en `target` (des chaînes), l’impact', () => {
    const reviews = form.tabs[0].blocks[0];
    expect(reviews.title).toBe('name');
    expect(reviews.fields!.map((f) => [f.key, f.kind])).toEqual([
      ['name', 'hero'],
      ['unreleased', 'check'],
      ['review', 'text'],
      ['recommendedPve', 'target'],
      ['recommendedPvp', 'target'],
      ['impact', 'impact'],
    ]);
    expect(reviews.fields![0]).toMatchObject({ required: true, unreleasedKey: 'unreleased' });
    expect(reviews.fields![2].required).toBe(true);
    expect(reviews.fields![3].default).toBe('');
    const tier = form.tabs[1].blocks[1];
    expect(tier.fields!.map((f) => f.kind)).toEqual(['hero', 'stars']);
  });
});

describe('generalGuideForm — Core Fusion (C13)', () => {
  const form = generalGuideForm('core-fusion', {})!;

  it('deux onglets, la forme de Premium & Limited sans bucket : les reviews en `roster` sur les fusions du jeu, trois paliers ordonnés en `tiles`', () => {
    expect(form.kind).toBe('core-fusion');
    expect(form.versioned).toBe(false);
    expect(form.tabs.map((t) => [t.id, t.label])).toEqual([
      ['reviews', 'Reviews'],
      ['priorities', 'Priorités'],
    ]);
    const [reviews, priorities] = form.tabs;
    expect(
      reviews.blocks.map((b) => [b.id, b.path.join('.'), b.add, b.view, b.roster, b.title]),
    ).toEqual([['reviews', 'reviews', 'hero', 'roster', 'core-fusion', 'name']]);
    // Une fusion du jeu sans review : la saisie reste permise, la page le DIT (le build du site la refuse).
    expect(reviews.blocks[0].missing).toBe('sans review — le build refusera');
    expect(
      priorities.blocks.map((b) => [b.id, b.path.join('.'), b.add, b.view, b.ordered ?? false]),
    ).toEqual([
      ['first', 'priorities.first', 'hero', 'tiles', true],
      ['second', 'priorities.second', 'hero', 'tiles', true],
      ['third', 'priorities.third', 'hero', 'tiles', true],
    ]);
  });

  it('une review : le héros (jamais « pas encore sorti »), la review requise, les niveaux cochables, `changes` en un GROUPE de six textes facultatifs', () => {
    const fields = form.tabs[0].blocks[0].fields!;
    expect(fields.map((f) => [f.key, f.kind])).toEqual([
      ['name', 'hero'],
      ['review', 'text'],
      ['recommendedLevels', 'levels'],
      ['changes', 'group'],
    ]);
    expect(fields[0].required).toBe(true);
    expect(fields[0].unreleasedKey).toBeUndefined();
    expect(fields[1].required).toBe(true);
    expect(fields[2].default).toEqual([]);
    expect(fields[3].label).toBe('Ce qui change à la fusion');
    expect(fields[3].fields!.map((f) => [f.key, f.kind, f.required ?? false])).toEqual([
      ['s1', 'text', false],
      ['s2', 'text', false],
      ['s3', 'text', false],
      ['chain', 'text', false],
      ['passive', 'text', false],
      ['transcendence', 'text', false],
    ]);
  });

  it('une priorité : le héros, son palier, et `op` — `>`, `>=`, ou la valeur vide (`null`), `null` d’office', () => {
    const fields = form.tabs[1].blocks[0].fields!;
    expect(fields.map((f) => [f.key, f.kind])).toEqual([
      ['name', 'hero'],
      ['stars', 'stars'],
      ['op', 'op'],
    ]);
    expect(fields[2].options).toEqual([
      { value: '>', label: '>' },
      { value: '>=', label: '≥' },
      { value: '', label: '—' },
    ]);
    expect(fields[2].default).toBeNull();
  });
});

describe('generalGuideForm — Free Heroes', () => {
  it('un onglet, une liste de sources, chacune ses entrées imbriquées : héros, choix, raison', () => {
    const form = generalGuideForm('free-heroes-start-banner', {})!;
    expect(form.kind).toBe('free-heroes');
    expect(form.tabs.map((t) => t.id)).toEqual(['sources']);
    const [block] = form.tabs[0].blocks;
    expect(block).toMatchObject({ path: ['sources'], kind: 'list', add: 'entry', title: 'source' });
    expect(block.fields!.map((f) => [f.key, f.kind, f.line, f.required])).toEqual([
      ['source', 'text', true, true],
    ]);
    expect(block.nested!.key).toBe('entries');
    expect(block.nested!.fields.map((f) => [f.key, f.kind])).toEqual([
      ['names', 'heroes'],
      ['pickType', 'select'],
      ['reason', 'text'],
    ]);
    expect(block.nested!.fields[1].options!.map((o) => o.value)).toEqual(['all', 'one']);
    expect(block.nested!.fields[1].default).toBe('all');
  });
});

describe('generalGuideForm — Shop priorities', () => {
  const form = generalGuideForm('shop-purchase-priorities', SHOP)!;

  it('un onglet par shop dérivé PRÉSENT, dans l’ordre du guide, puis Event, Resource, et les shops texte présents', () => {
    expect(form.kind).toBe('shop-priorities');
    expect(form.tabs.map((t) => t.id)).toEqual([
      'guild',
      'arena',
      'event',
      'resource',
      'supply',
      'joint',
    ]);
    expect(form.tabs.map((t) => t.label)).toEqual([
      'Guild',
      'Arena',
      'Event',
      'General / Resource',
      'Supply Module',
      'Joint Challenge',
    ]);
  });

  it('une note d’un shop absent de la rotation garde son onglet : elle reste éditable, et écrite', () => {
    const joint = form.tabs[5];
    expect(joint.blocks.map((b) => [b.id, b.kind, b.path.join('.')])).toEqual([
      ['joint-note', 'text', 'editorial.shopNotes.joint'],
    ]);
    expect(joint.blocks[0].hint).toMatch(/absent de la rotation/);
    expect(blockOfKey(form, 'editorial.shopNotes.joint')?.tab.id).toBe('joint');
  });

  it('un dérivé : la note du shop, puis ses produits FIGÉS (pas de ＋) à l’index du shop dans les données, sa monnaie', () => {
    const guild = form.tabs[0];
    expect(guild.blocks.map((b) => [b.id, b.kind, b.path.join('.'), b.add])).toEqual([
      ['guild-note', 'text', 'editorial.shopNotes.guild', undefined],
      ['guild-rows', 'list', 'derived.1.rows', undefined],
    ]);
    expect(guild.blocks[1].currency).toEqual({ name: 'Guild Coin', icon: 'TI_Guild' });
    expect(guild.blocks[1].fields!.map((f) => f.kind)).toEqual(['product', 'priority', 'text']);
  });

  it('Event et Resource : des items éditoriaux ajoutables, priorité C d’office ; un shop texte : ses paragraphes requis et sa note de gear', () => {
    const event = form.tabs[2];
    expect(event.blocks.map((b) => b.id)).toEqual(['event-note', 'event-items']);
    expect(event.blocks[1]).toMatchObject({ path: ['editorial', 'eventItems'], add: 'entry' });
    expect(event.blocks[1].fields!.map((f) => f.kind)).toEqual([
      'priority',
      'string',
      'text',
      'number',
      'cost',
      'limit',
      'text',
    ]);
    expect(event.blocks[1].fields![0].default).toBe('C');
    expect(form.tabs[3].blocks.map((b) => b.id)).toEqual(['resource-items']);
    const supply = form.tabs[4];
    expect(supply.blocks.map((b) => [b.id, b.kind, b.required ?? false])).toEqual([
      ['supply-paragraphs', 'texts', true],
      ['supply-gear', 'text', false],
    ]);
    expect(supply.blocks[0].path).toEqual(['editorial', 'textShops', 'supply', 'paragraphs']);
  });
});

describe('blockOfKey — la clé d’un champ retrouve son bloc et son onglet', () => {
  it('par le chemin le plus long qui préfixe la clé ; une clé hors forme : rien', () => {
    const pl = generalGuideForm('premium-limited', {})!;
    expect(blockOfKey(pl, 'reviews.limited.2.review')?.tab.id).toBe('limited-reviews');
    expect(blockOfKey(pl, 'priorities.premium.third.0.stars')?.block.id).toBe('premium-third');
    expect(blockOfKey(pl, 'priorities.premium.third.0.stars')?.tab.id).toBe('premium-priorities');
    expect(blockOfKey(pl, 'priorities.premium')).toBeUndefined();
    // Core Fusion : le texte d'un groupe (`changes.s1`) retrouve le bloc des reviews.
    const cf = generalGuideForm('core-fusion', {})!;
    expect(blockOfKey(cf, 'reviews.0.changes.s1')?.tab.id).toBe('reviews');
    expect(blockOfKey(cf, 'priorities.second.1.op')?.block.id).toBe('second');
    const shop = generalGuideForm('shop-purchase-priorities', SHOP)!;
    expect(blockOfKey(shop, 'editorial.shopNotes.guild')?.tab.id).toBe('guild');
    expect(blockOfKey(shop, 'editorial.shopNotes.guildx')).toBeUndefined();
    expect(blockOfKey(shop, 'derived.0.rows.3.notes')?.tab.id).toBe('arena');
    expect(blockOfKey(shop, 'editorial.textShops.supply.paragraphs.1')?.block.id).toBe(
      'supply-paragraphs',
    );
  });
});
