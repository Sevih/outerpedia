// @vitest-environment happy-dom
/**
 * Ligne « Immunités » du header de la fiche perso, sur une fiche SYNTHÉTIQUE :
 * les immunités passent par la résolution des boss (`resolveImmunities`) et se
 * rendent avec leurs icônes ; un perso sans immunité n'a pas de ligne.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { resolveImmunities } from '@/lib/data/boss-view';
import { liveKitSources } from '@/lib/skill-view';
import { OverviewImmunities } from './OverviewSection';

function render(char: { buffImmune?: string[] }) {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(
    <OverviewImmunities
      label="Immunities"
      immunities={resolveImmunities(char, liveKitSources())}
      lang="en"
    />,
  );
  return host;
}

describe('OverviewImmunities', () => {
  it('avec immunités : libellé, une icône par statut résolu, la réf inconnue en rouge', () => {
    const host = render({ buffImmune: ['BT_STUN', 'BT_SILENCE', 'BT_NOT_A_MECHANIC'] });
    expect(host.textContent).toContain('Immunities');
    const names = [...host.querySelectorAll('button .sr-only')].map((n) => n.textContent);
    expect(names).toEqual(['Stunned', 'Silenced']);
    expect(host.querySelector('.text-danger-strong')?.textContent).toBe('BT_NOT_A_MECHANIC');
  });

  it('sans immunité : rien', () => {
    expect(render({}).innerHTML).toBe('');
  });
});
