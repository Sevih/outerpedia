/**
 * Le guide se REND dans les six langues. parse-text y tourne en STRICT : une
 * balise morte, un nom officiel de mode absent du glossaire ou une icône de set
 * manquante jettent — au build de prod seulement, sans ce test (la gate de dev
 * ne fait pas de build). Les jetons `{…}` des définitions (filtre, chiffres du
 * recrutement) doivent tous être remplacés au rendu.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LANGS } from '@/lib/i18n/config';
import { getRecruitKind } from '@/lib/data/recruit';
import { getUnlockEntry } from '@/lib/data/unlock-content';
import TerminologyGuide from './index';

describe('terminology — rendu', () => {
  it.each(LANGS)('%s : la page se rend, sections et termes compris', async (lang) => {
    const html = renderToStaticMarkup(await TerminologyGuide({ lang }));
    for (const id of [
      'tldr',
      'combat',
      'stats',
      'gear',
      'heroes-pulls',
      'gacha-economy',
      'roles',
      'content',
      'community-slang',
    ]) {
      expect(html, id).toContain(`<section id="${id}"`);
    }
    // Combat 29 + Stats 14 + Gear 14 + Heroes 10 + Gacha & economy 22 +
    // Roles 12 + Content 9 + Community slang 12 termes.
    expect(html.match(/<dt /g)).toHaveLength(122);
    // Les jetons (filtre, chiffres du recrutement) sont remplacés, aucune
    // balise ne reste en clair.
    expect(html).not.toContain('{filter}');
    expect(html).not.toContain('{advanced}');
    expect(html).not.toMatch(/\{[a-zA-Z0-9]+\}/);
    expect(html).not.toMatch(/\{[A-Z-]+\//);
  });

  it('les chiffres du recrutement et les noms du jeu viennent de la donnée', async () => {
    const info = getRecruitKind('pickup');
    const featured = info.rates.find((rate) => rate.featured)?.percent ?? 0;
    const text = (html: string): string => html.replace(/<[^>]+>/g, '');

    const en = text(renderToStaticMarkup(await TerminologyGuide({ lang: 'en' })));
    expect(en).toContain(`guaranteed within ${info.pity?.every} recruits`);
    expect(en).toContain(`${featured}% for the featured hero alone`);
    expect(en).toContain(`A recruit costs ${info.price1} Ether`);
    expect(en).toContain(`${getRecruitKind('premium').price1} on the Premium banner`);
    // « Sweep / Skip » et « Auto-battle » portent le nom de l'écran du jeu.
    for (const type of ['BATTLE_SWEEP', 'BATTLE_AUTO', 'MAIN_MENU_RECRUIT']) {
      expect(en, type).toContain(`In game: ${getUnlockEntry(type)?.lockScreenName?.en}`);
    }

    // Le séparateur décimal suit la langue de la page.
    const fr = text(renderToStaticMarkup(await TerminologyGuide({ lang: 'fr' })));
    expect(fr).toContain(`${featured.toLocaleString('fr')} % pour le héros vedette`);
    const jp = text(renderToStaticMarkup(await TerminologyGuide({ lang: 'jp' })));
    expect(jp).toContain(getUnlockEntry('BATTLE_SWEEP')?.lockScreenName?.jp);
  });

  // Les définitions du recrutement disent des règles EN TOUTES LETTRES (« twice
  // at most », « once per Demiurge hero », « without limit », « Rate Up or
  // Limited ») : si `recruit.json` bouge, ce test tombe et le texte se relit.
  it('les règles de recrutement écrites en prose tiennent dans recruit.json', () => {
    const rateUp = getRecruitKind('pickup');
    const limited = getRecruitKind('limited');
    const custom = getRecruitKind('custom');
    const premium = getRecruitKind('premium');
    const featured = (kind: typeof rateUp) => kind.rates.find((rate) => rate.featured)?.percent;
    const threeStar = (kind: typeof rateUp) =>
      kind.rates
        .filter((rate) => rate.featured || rate.titleKey.endsWith('_TITLE_03'))
        .reduce((sum, rate) => sum + rate.percent, 0);

    // « Rate Up or Limited » : mêmes taux 3★, même garantie, deux fois au plus.
    expect(featured(limited)).toBe(featured(rateUp));
    expect(threeStar(limited)).toBe(threeStar(rateUp));
    expect(rateUp.pity?.max).toBe(2);
    expect(limited.pity).toEqual(rateUp.pity);
    // Premium : une fois par héros Demiurge ; Custom : sans plafond.
    expect(premium.pity).toEqual({ every: rateUp.pity?.every, max: 1 });
    expect(custom.pity).toEqual({ every: rateUp.pity?.every, max: null });
    // Dimensional Supply tire du gear, sans garantie ; un x10 Rate Up garantit un 2★.
    expect(getRecruitKind('equipment').pity).toBeUndefined();
    expect(rateUp.rates.some((rate) => rate.percent > 0 && rate.confirmPercent === 0)).toBe(true);
    // « A recruit costs {price} Ether » : même prix hors Premium.
    for (const kind of [custom, limited, getRecruitKind('equipment')]) {
      expect(kind.price1, kind.kind).toBe(rateUp.price1);
    }
  });
});
