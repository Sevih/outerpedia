/**
 * `SetCard` : la mention du palier enchanté sous les lignes 2P/4P, comme sous
 * les recos de build (décision de Sevih du 15/10/2026).
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SetCard, type SetRow } from './cards';

const row: SetRow = {
  id: '1',
  slug: 'speed-set',
  name: 'Speed',
  setIcon: '',
  pieceIcons: [],
  p2: 'SPD +13%',
  p4: 'SPD +12%',
};

describe('SetCard — palier enchanté', () => {
  it('dit le palier quand la ligne le porte', () => {
    const html = renderToStaticMarkup(
      <SetCard row={{ ...row, enchantedTier: 'Breakthrough 4' }} sourceTitle="Source" />,
    );
    expect(html).toContain('Breakthrough 4');
  });

  it('rien sans le champ, rien sans bonus', () => {
    expect(renderToStaticMarkup(<SetCard row={row} sourceTitle="Source" />)).not.toContain(
      'Breakthrough',
    );
    const bare = { ...row, p2: undefined, p4: undefined, enchantedTier: 'Breakthrough 4' };
    expect(renderToStaticMarkup(<SetCard row={bare} sourceTitle="Source" />)).not.toContain(
      'Breakthrough',
    );
  });
});
