/**
 * EX Buff de Dimensional Singularity — le rendu remplace la capture (pas de
 * `pnpm dev` pour les lots). L'horloge est figée au vendredi 20/11/2026, constaté
 * en jeu : groupe 5, Abomination Hunter Belial, EX Buff Water.
 *  - les cartes de la rotation (vue de catégorie entière, section « Ranks »
 *    neutralisée : elle est testée à part) ;
 *  - le bloc « prochaines apparitions » d'un guide de boss ;
 *  - sans `exBuff` dans la donnée, rien ne s'affiche.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getT } from '@/i18n';
import {
  singularityAppearancesAt,
  singularityBattleDays,
  singularityCycleWeeks,
} from '@/lib/data/singularity';
import SingularityRotation from './category-views/SingularityRotation';
import SingularityAppearances, { SingularityAppearancesView } from './SingularityExBuff';

const NOW = new Date('2026-11-20T12:00:00Z');
vi.mock('@/lib/time', () => ({ serverNow: () => NOW }));
vi.mock('@/components/guides/SingularityRanks', () => ({ default: () => null }));

/** Interrupteur : simule une donnée d'avant patch (aucun `exBuff`). */
const noExBuff = { value: false };
vi.mock('@/lib/data/singularity', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/data/singularity')>();
  return {
    ...mod,
    singularityExBuffOf: (boss: Parameters<typeof mod.singularityExBuffOf>[0]) =>
      noExBuff.value ? undefined : mod.singularityExBuffOf(boss),
  };
});

const BELIAL = '60000001';
// Balises retirées, entités décodées (l'apostrophe sort en `&#x27;`).
const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
const count = (s: string, needle: string) => s.split(needle).length - 1;

async function rotation(lang: 'fr' | 'en') {
  const node = await SingularityRotation({ lang, category: 'dimensional-singularity', guides: [] });
  return renderToStaticMarkup(<>{node}</>);
}

beforeEach(() => {
  noExBuff.value = false;
});

describe('cartes de la rotation — EX Buff du créneau', () => {
  it('fr : le boss du jour porte « EX Buff · Eau » et la desc du jeu en texte', async () => {
    const out = text(await rotation('fr'));
    expect(out).toContain('EX Buff · Eau');
    expect(out).toContain("Dégâts de tous les alliés d'Eau +200%");
  });

  it('en : idem, et une pastille par jour de combat — aucune sur la bibliothèque', async () => {
    const html = await rotation('en');
    const out = text(html);
    expect(out).toContain('EX Buff · Water');
    expect(out).toContain("All Water allies' Damage +200%");
    // 1 pastille pleine (le boss du jour) + une pastille compacte par autre jour,
    // infobulle = desc du jeu. Les 15 cartes de bibliothèque n'en ont pas.
    const days = singularityBattleDays();
    expect(count(out, 'EX Buff')).toBe(days);
    expect(count(html, 'title="All ')).toBe(days - 1);
    expect(html).toContain('IG_Turn_Element_Water');
  });

  it('sans `exBuff` dans la donnée : aucune pastille, aucune place vide', async () => {
    noExBuff.value = true;
    const html = await rotation('fr');
    expect(text(html)).not.toContain('EX Buff');
    expect(html).not.toContain('border-accent/50');
  });
});

describe('guide de boss — prochaines apparitions', () => {
  it.each(['fr', 'en'] as const)('%s : un cycle complet, la première aujourd’hui', async (lang) => {
    const node = await SingularityAppearances({ monsterId: BELIAL, lang });
    expect(node).not.toBeNull();
    const out = text(renderToStaticMarkup(node!));
    const list = singularityAppearancesAt(BELIAL, NOW);
    const weeks = String(singularityCycleWeeks());
    if (lang === 'fr') {
      expect(out).toContain('Prochaines apparitions');
      expect(out).toContain(`Les ${weeks} prochaines semaines`);
      expect(out).toContain('Aujourd’hui');
      expect(out).toContain("L'EX Buff dépend du créneau");
      expect(out).toContain('EX Buff · Eau');
    } else {
      expect(out).toContain('Upcoming appearances');
      expect(out).toContain(`The next ${weeks} weeks`);
      expect(out).toContain('Today');
      expect(out).toContain('The EX Buff depends on the slot');
      expect(out).toContain('EX Buff · Water');
    }
    // Une ligne par apparition, chacune avec son buff.
    expect(count(out, 'EX Buff ·')).toBe(list.length);
    expect(out).not.toContain('guides.singularity.');
  });

  it('sans `exBuff` : les dates restent, aucune pastille', async () => {
    const t = await getT('fr');
    const list = singularityAppearancesAt(BELIAL, NOW).map((a) => ({ ...a, exBuff: undefined }));
    const html = renderToStaticMarkup(
      <SingularityAppearancesView appearances={list} weeks={12} lang="fr" t={t} />,
    );
    expect(text(html)).not.toContain('EX Buff');
    expect(count(html, '<li')).toBe(list.length);
  });

  it('un monstre hors rotation : bloc absent', async () => {
    expect(await SingularityAppearances({ monsterId: '0', lang: 'fr' })).toBeNull();
  });
});
