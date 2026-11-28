/**
 * Le rendu des puces du journal : le gras `**…**` et le lien markdown
 * `[libellé](cible)`, partagés par la carte du site, l'aperçu de quick et le RSS.
 */
import { describe, expect, it } from 'vitest';
import { bulletSegments, isBulletLink } from './changelog-bullets';

describe('bulletSegments — une puce du journal, en segments', () => {
  it('une puce sans balisage est un seul segment de texte', () => {
    expect(bulletSegments('Titia has been added to the database.')).toEqual([
      { text: 'Titia has been added to the database.' },
    ]);
  });

  it('`**…**` devient un segment gras, sans ses astérisques', () => {
    expect(bulletSegments('Added the **Universal Tower** guide: floor by floor.')).toEqual([
      { text: 'Added the ' },
      { text: 'Universal Tower', bold: true },
      { text: ' guide: floor by floor.' },
    ]);
  });

  it('plusieurs gras dans une puce, en tête et en queue compris', () => {
    expect(bulletSegments('**item pages** and **multilingual support**')).toEqual([
      { text: 'item pages', bold: true },
      { text: ' and ' },
      { text: 'multilingual support', bold: true },
    ]);
  });

  it('le gras collé à du texte sans espace (japonais, chinois)', () => {
    expect(bulletSegments('新增**万象之塔**攻略')).toEqual([
      { text: '新增' },
      { text: '万象之塔', bold: true },
      { text: '攻略' },
    ]);
  });

  it('des astérisques sans fermeture restent du texte', () => {
    expect(bulletSegments('1-2★ heroes ** demoted')).toEqual([{ text: '1-2★ heroes ** demoted' }]);
    expect(bulletSegments('a **b** c ** d')).toEqual([
      { text: 'a ' },
      { text: 'b', bold: true },
      { text: ' c ** d' },
    ]);
  });

  it('du code n’est pas rendu : du texte, tel quel', () => {
    expect(bulletSegments('See `/legal` and _this_.')).toEqual([
      { text: 'See `/legal` and _this_.' },
    ]);
  });

  it('une puce vide ne rend rien', () => {
    expect(bulletSegments('')).toEqual([]);
  });

  it('recollés, les segments redonnent la puce sans ses astérisques — ce que le RSS aplatit', () => {
    const line = '🔍 **New Tool Available** – Discover **which** heroes.';
    expect(
      bulletSegments(line)
        .map((s) => (isBulletLink(s) ? '' : s.text))
        .join(''),
    ).toBe(line.replace(/\*\*(.+?)\*\*/g, '$1'));
  });
});

describe('bulletSegments — les liens markdown (B77)', () => {
  it('un lien externe : sa cible telle quelle, marqué externe', () => {
    expect(bulletSegments('Take the [survey](https://example.com/form?a=1) now.')).toEqual([
      { text: 'Take the ' },
      { href: 'https://example.com/form?a=1', external: true, label: [{ text: 'survey' }] },
      { text: ' now.' },
    ]);
  });

  it('un lien interne : un chemin `/…` sans préfixe de langue, non marqué externe', () => {
    expect(bulletSegments('See [the guide](/guides/x).')).toEqual([
      { text: 'See ' },
      { href: '/guides/x', label: [{ text: 'the guide' }] },
      { text: '.' },
    ]);
  });

  it('le gras autour d’un lien met son libellé en gras', () => {
    expect(bulletSegments('**[Promo codes](/coupons)** updated')).toEqual([
      { href: '/coupons', label: [{ text: 'Promo codes', bold: true }] },
      { text: ' updated' },
    ]);
    expect(bulletSegments('**see [this](/x) now**')).toEqual([
      { text: 'see ', bold: true },
      { href: '/x', label: [{ text: 'this', bold: true }] },
      { text: ' now', bold: true },
    ]);
  });

  it('le gras dans le libellé reste au libellé', () => {
    expect(bulletSegments('[the **new** guide](/guides/x) and **more**')).toEqual([
      {
        href: '/guides/x',
        label: [{ text: 'the ' }, { text: 'new', bold: true }, { text: ' guide' }],
      },
      { text: ' and ' },
      { text: 'more', bold: true },
    ]);
  });

  it('une syntaxe incomplète reste du texte', () => {
    for (const line of [
      '[survey](https://example.com',
      '[survey] (https://example.com)',
      '[](https://example.com)',
      '[survey]()',
      'survey](https://example.com)',
    ])
      expect(bulletSegments(line)).toEqual([{ text: line }]);
  });

  it('une autre cible reste du texte : `javascript:`, `mailto:`, relative sans `/`, `//hôte`', () => {
    for (const line of [
      '[click](javascript:alert(1))',
      '[mail](mailto:a@b.c)',
      '[guide](guides/x)',
      '[evil](//evil.example)',
    ])
      expect(bulletSegments(line)).toEqual([{ text: line }]);
  });

  it('l’entrée de Sevih du 28/11 : deux liens externes, le texte entre eux', () => {
    const line =
      '🔗 [Survey (Global)](https://t.co/KxxijqwJ0f) · [問卷連結 (繁體中文)](https://t.co/OgdUxsLmOv)';
    expect(bulletSegments(line)).toEqual([
      { text: '🔗 ' },
      { href: 'https://t.co/KxxijqwJ0f', external: true, label: [{ text: 'Survey (Global)' }] },
      { text: ' · ' },
      { href: 'https://t.co/OgdUxsLmOv', external: true, label: [{ text: '問卷連結 (繁體中文)' }] },
    ]);
  });
});
