/**
 * Note de l'infiltration dans le panneau cible : elle dit que l'adv appliquée
 * (celle du nœud seul) monte tant que des nœuds liés restent à nettoyer — pour
 * une cible qui porte `advLinked`, et pour elle seule.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AdvLinkedNote } from './ui';

const LABEL = 'Higher while linked nodes remain uncleared';

describe('AdvLinkedNote', () => {
  it('rendue pour une cible à nœuds liés', () => {
    const html = renderToStaticMarkup(<AdvLinkedNote target={{ advLinked: true }} label={LABEL} />);
    expect(html).toContain(LABEL);
  });

  it('absente pour une autre cible', () => {
    expect(renderToStaticMarkup(<AdvLinkedNote target={{}} label={LABEL} />)).toBe('');
  });
});
