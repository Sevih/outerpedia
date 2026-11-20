/**
 * Section « Ranks » de Dimensional Singularity — le rendu remplace la capture
 * (pas de `pnpm dev` pour les lots). Deux volets :
 *  - la VUE sur une échelle fabriquée aux valeurs de la table du 20/11/2026 :
 *    la donnée committée peut précéder le patch (30 rangs, sans récompense),
 *    le test ne doit pas en dépendre pour vérifier les rangs EX ;
 *  - la section BRANCHÉE sur la donnée committée, dans les six langues : elle
 *    se rend sans jeter (récompenses résolues strictement), quelle que soit
 *    l'échelle qu'elle porte.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { getT } from '@/i18n';
import { LANGS, LANGUAGES } from '@/lib/i18n/config';
import type { SingularityRankLadderView } from '@/lib/data/singularity-ranks';
import SingularityRanks, { SingularityRanksView } from './SingularityRanks';

const reward = (name: string, max: number) => ({
  name,
  iconSrc: '',
  grade: 'epic',
  min: max,
  max,
});

const LADDER: SingularityRankLadderView = {
  exBuffPercent: 200,
  rows: [
    { name: 'SSS++', minDamage: 3600001, level: 200, changes: [], rewards: [reward('Chip', 40)] },
    {
      name: 'EX',
      minDamage: 5000001,
      level: 200,
      changes: ['Dégâts des DoT subis -20%'],
      exBuff: true,
      rewards: [reward('Mémoire de dépassement de limite', 20)],
    },
    { name: 'EX+', minDamage: 10000001, level: 200, changes: ['Dégâts des DoT subis -30%'] },
    { name: 'EX++', minDamage: 15000001, level: 200, changes: ['Dégâts des DoT subis -50%'] },
    {
      name: 'EX+++',
      minDamage: 20000001,
      level: 200,
      changes: [],
      rewards: [reward('Or', 2000000)],
    },
  ],
};

const FR = LANGUAGES.fr.htmlLang;
// Balises retirées SANS replier les blancs : les séparateurs de milliers (U+202F en
// français) en sont, et le test compare des seuils formatés.
const text = (html: string) => html.replace(/<[^>]+>/g, ' ');

describe('SingularityRanksView (fr)', () => {
  it('rangs EX présents, badges et seuils exacts au format de la langue', async () => {
    const t = await getT('fr');
    const html = renderToStaticMarkup(<SingularityRanksView ladder={LADDER} lang="fr" t={t} />);
    for (const sprite of [
      'CM_Event_Rank_EX.',
      'CM_Event_Rank_EX_01',
      'CM_Event_Rank_EX_02',
      'CM_Event_Rank_EX_03',
    ])
      expect(html, sprite).toContain(sprite);
    const out = text(html);
    for (const n of [5000001, 10000001, 15000001, 20000001])
      expect(out).toContain(n.toLocaleString(FR));
    expect(out).toContain('Rangs');
    expect(out).toContain('Dégâts requis');
    expect(out).toContain('EX Buff : +200% de dégâts');
    expect(out).toContain('Dégâts des DoT subis -50%');
    // Récompenses : le texte qui les annonce et leur colonne.
    expect(out).toContain('se réinitialisent chaque semaine');
    expect(out).toContain('×20');
    expect(out).toContain(`×${(2000000).toLocaleString(FR)}`);
  });

  it('le buff EX n’apparaît qu’à son rang', async () => {
    const t = await getT('fr');
    const html = renderToStaticMarkup(<SingularityRanksView ladder={LADDER} lang="fr" t={t} />);
    expect(text(html).match(/EX Buff :/g)).toHaveLength(1);
  });

  it('sans récompense dans la donnée, ni colonne ni texte de récompense', async () => {
    const t = await getT('fr');
    const bare = { rows: LADDER.rows.map((r) => ({ ...r, rewards: undefined })) };
    const out = text(renderToStaticMarkup(<SingularityRanksView ladder={bare} lang="fr" t={t} />));
    expect(out).not.toContain('Récompenses');
    expect(out).not.toContain('se réinitialisent');
    expect(out).not.toContain('EX Buff :');
  });
});

describe('SingularityRanks — branchée sur la donnée committée', () => {
  it.each(LANGS)('%s : se rend, une ligne par rang, aucune clé brute', async (lang) => {
    const node = await SingularityRanks({ lang });
    expect(node).not.toBeNull();
    const html = renderToStaticMarkup(node!);
    expect(html).toContain('CM_Event_Rank_E.');
    expect(html).toContain('CM_Event_Rank_SSS_02');
    expect(html).not.toContain('guides.singularity.ranks.');
  });
});
