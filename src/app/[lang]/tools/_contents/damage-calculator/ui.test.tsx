/**
 * Note de l'infiltration dans le panneau cible : elle dit que l'adv appliquée
 * (celle du nœud seul) monte tant que des nœuds liés restent à nettoyer — pour
 * une cible qui porte `advLinked`, et pour elle seule.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AdvLinkedNote, ApplyChancePair } from './ui';

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

/**
 * Pose des débuffs dans la carte cible : l'EFF de l'attaquant (désactivée sans
 * attaquant) face à la RES de la cible — saisie en manuel, valeur de combat
 * du spawn en preset.
 */
describe('ApplyChancePair', () => {
  const base = {
    title: 'Debuff landing: EFF vs RES',
    note: 'Only the DOT lines use it today.',
    attackerLabel: 'Attacker',
    targetLabel: 'Target',
    effLabel: 'Effectiveness',
    resLabel: 'Resilience',
  };
  const noop = () => {};

  it('rend les deux libellés et la note', () => {
    const html = renderToStaticMarkup(
      <ApplyChancePair
        {...base}
        eff={{ value: '120', set: noop, disabled: false }}
        res={{ mode: 'input', value: '80', set: noop }}
      />,
    );
    for (const s of [base.title, base.note, base.effLabel, base.resLabel, 'Attacker', 'Target'])
      expect(html).toContain(s);
    expect(html).toContain('value="120"');
  });

  it('EFF désactivée et vide sans attaquant', () => {
    const html = renderToStaticMarkup(
      <ApplyChancePair
        {...base}
        eff={{ value: '120', set: noop, disabled: true }}
        res={{ mode: 'input', value: '80', set: noop }}
      />,
    );
    expect(html).toMatch(/<input[^>]*disabled=""[^>]*value=""/);
    expect(html).not.toContain('value="120"');
  });

  it('RES en saisie en manuel, en texte avec infobulle en preset', () => {
    const manual = renderToStaticMarkup(
      <ApplyChancePair
        {...base}
        eff={{ value: '', set: noop, disabled: false }}
        res={{ mode: 'input', value: '80', set: noop }}
      />,
    );
    expect(manual.match(/<input/g)).toHaveLength(2);
    expect(manual).toContain('value="80"');

    const preset = renderToStaticMarkup(
      <ApplyChancePair
        {...base}
        eff={{ value: '', set: noop, disabled: false }}
        res={{ mode: 'value', text: '250', title: 'Sheet: 200' }}
      />,
    );
    expect(preset.match(/<input/g)).toHaveLength(1);
    expect(preset).toContain('>250<');
    expect(preset).toContain('title="Sheet: 200"');
  });
});
