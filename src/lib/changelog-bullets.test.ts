/**
 * Le rendu des puces du journal : une seule règle, le gras `**…**`, partagée
 * par la carte du site et l'aperçu de quick.
 */
import { describe, expect, it } from 'vitest';
import { bulletSegments } from './changelog-bullets';

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

  it('un lien markdown ou du code ne sont pas rendus : du texte, tel quel', () => {
    expect(bulletSegments('See [the guide](/guides/x) and `/legal`.')).toEqual([
      { text: 'See [the guide](/guides/x) and `/legal`.' },
    ]);
  });

  it('une puce vide ne rend rien', () => {
    expect(bulletSegments('')).toEqual([]);
  });

  it('recollés, les segments redonnent la puce sans ses astérisques — ce que le RSS aplatit', () => {
    const line = '🔍 **New Tool Available** – Discover **which** heroes.';
    expect(
      bulletSegments(line)
        .map((s) => s.text)
        .join(''),
    ).toBe(line.replace(/\*\*(.+?)\*\*/g, '$1'));
  });
});
