/**
 * Galerie vidéo d'un guide Dimensional Singularity (C29) — le rendu remplace la
 * capture (pas de `pnpm dev` pour les lots). L'horloge est FIGÉE à un jour de
 * combat tiré de la donnée (l'horloge de la rotation), jamais une date en dur :
 * le jour où Verdandi (lumière, 60000011, plusieurs EX Buff) combat.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { getT } from '@/i18n';
import {
  singularityActiveComboAt,
  singularityAppearancesAt,
  singularityExCombos,
} from '@/lib/data/singularity';
import {
  SingularityVideosView,
  splitSingularityVideos,
  type SingularityVideoItem,
} from './SingularityVideos';

const VERDANDI = '60000011';
/**
 * Le premier jour de combat du boss compté depuis l'epoch — une origine
 * arbitraire : c'est l'horloge de la rotation (ancre, groupes) qui donne le jour.
 * À midi UTC.
 */
function battleDayOf(monsterId: string): Date {
  const first = singularityAppearancesAt(monsterId, new Date(0))[0];
  if (!first) throw new Error(`${monsterId} ne combat jamais`);
  return new Date(`${first.date}T12:00:00Z`);
}

const NOW = battleDayOf(VERDANDI);
const COMBOS = singularityExCombos(VERDANDI);
const ACTIVE = singularityActiveComboAt(VERDANDI, NOW)!;
/** Une combinaison du boss qui n'est PAS l'active. */
const OTHER = COMBOS.find((c) => c.target.id !== ACTIVE.target.id)!;

const yt = (id: string, title: string, ex?: string): SingularityVideoItem => ({
  platform: 'youtube',
  id,
  title,
  author: 'Ch',
  ...(ex ? { ex } : {}),
});
/** Deux vidéos sur l'active, une sur une autre combinaison, une d'avant l'EX Buff, une à cible disparue. */
const VIDEOS: SingularityVideoItem[] = [
  yt('pre1', 'Old run'),
  yt('act1', 'Active run A', ACTIVE.target.id),
  yt('oth1', 'Other run', OTHER.target.id),
  yt('act2', 'Active run B', ACTIVE.target.id),
  // `healer` : une cible connue que Verdandi ne porte pas (sortie de sa rotation).
  yt('gone1', 'Gone run', 'healer'),
];

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
const count = (s: string, needle: string) => s.split(needle).length - 1;

async function render(lang: 'fr' | 'en', videos: SingularityVideoItem[], active = ACTIVE) {
  const t = await getT(lang);
  const split = splitSingularityVideos(COMBOS, active, videos);
  return renderToStaticMarkup(<SingularityVideosView split={split} lang={lang} t={t} />);
}
/** Le markup de la galerie seule (sa `section`). */
const gallery = (html: string) =>
  /<section[^>]*aria-labelledby="singularity-videos"[^>]*>[\s\S]*?<\/section>/.exec(html)?.[0] ??
  '';

describe('splitSingularityVideos', () => {
  it('l’active en premier, puis l’ordre des cibles ; sans ex = avant l’EX Buff ; cible disparue à part', () => {
    const split = splitSingularityVideos(COMBOS, ACTIVE, VIDEOS);
    expect(COMBOS.length).toBeGreaterThan(1);
    expect(split.cards[0].combo.target.id).toBe(ACTIVE.target.id);
    expect(split.cards[0].active).toBe(ACTIVE);
    expect(split.cards.slice(1).every((c) => !c.active)).toBe(true);
    expect(split.cards.map((c) => c.combo.target.id).sort()).toEqual(
      COMBOS.map((c) => c.target.id).sort(),
    );
    expect(split.cards[0].videos.map((v) => v.id)).toEqual(['act1', 'act2']);
    expect(split.beforeEx.map((v) => v.id)).toEqual(['pre1']);
    expect(split.others.map((v) => v.id)).toEqual(['gone1']);
  });

  it('sans combinaison active : l’ordre des cibles tel quel', () => {
    const split = splitSingularityVideos(COMBOS, undefined, VIDEOS);
    expect(split.cards.map((c) => c.combo.target.id)).toEqual(COMBOS.map((c) => c.target.id));
  });
});

describe('SingularityVideosView — rendu sur une date figée', () => {
  it('fr : carte active en premier et étiquetée, cartes vides, une seule iframe dans la galerie', async () => {
    const html = await render('fr', VIDEOS);
    const g = gallery(html);
    const out = text(html);
    expect(out).toContain('Vidéos par EX Buff');
    // La première carte est l'active, étiquetée « Actif cette semaine · Aujourd’hui ».
    expect(/data-ex="([a-z]+)"/.exec(g)?.[1]).toBe(ACTIVE.target.id);
    expect(text(g)).toContain('Actif cette semaine · Aujourd’hui');
    expect(count(g, 'Actif cette semaine')).toBe(1);
    // Une carte par combinaison ; celles sans vidéo le disent.
    expect(count(g, 'data-ex="')).toBe(COMBOS.length);
    expect(count(text(g), 'Pas encore de vidéo')).toBe(COMBOS.length - 2);
    // Le compte quand une carte en a plusieurs ; la miniature YouTube.
    expect(text(g)).toContain('2 vidéos');
    expect(g).toContain('https://i.ytimg.com/vi/act1/mqdefault.jpg');
    // UN lecteur dans la galerie, ouvert sur l'active (sa première vidéo).
    expect(count(g, '<iframe')).toBe(1);
    expect(g).toContain('youtube.com/embed/act1');
    // Avant l'EX Buff et cible disparue : chacune sa section, son lecteur.
    expect(out).toContain("Avant l'EX Buff");
    expect(out).toContain('Séquence de combat');
    expect(count(html, '<iframe')).toBe(3);
    expect(out).not.toMatch(/guides\.|video\.by/);
  });

  it('en : mêmes libellés traduits, aucune clé brute', async () => {
    const html = await render('en', VIDEOS);
    const out = text(html);
    expect(out).toContain('Videos by EX Buff');
    expect(out).toContain('Active this week · Today');
    expect(out).toContain('No video yet');
    expect(out).toContain('2 videos');
    expect(out).toContain('Before the EX Buff');
    expect(out).toContain('by Ch');
    expect(out).not.toMatch(/guides\.|video\.by/);
  });

  it('active sans vidéo : le lecteur s’ouvre sur la première carte qui en a', async () => {
    const html = await render('en', [yt('oth1', 'Other run', OTHER.target.id)]);
    const g = gallery(html);
    expect(/data-ex="([a-z]+)"/.exec(g)?.[1]).toBe(ACTIVE.target.id);
    expect(count(g, '<iframe')).toBe(1);
    expect(g).toContain('youtube.com/embed/oth1');
  });

  it('les sections « autres » seulement quand il y en a ; sans vidéo, la galerie sans lecteur', async () => {
    const only = text(await render('en', [yt('act1', 'Active run A', ACTIVE.target.id)]));
    expect(only).not.toContain('Before the EX Buff');
    expect(only).not.toContain('Combat Footage');
    const none = await render('en', []);
    expect(count(gallery(none), 'data-ex="')).toBe(COMBOS.length);
    expect(none).not.toContain('<iframe');
    expect(count(text(none), 'No video yet')).toBe(COMBOS.length);
  });

  it('jour de récompense : l’étiquette annonce la prochaine rotation et le jour', async () => {
    const html = await render('en', VIDEOS, { ...ACTIVE, betweenWeeks: true, state: 'upcoming' });
    expect(text(gallery(html))).toMatch(/Next rotation · \S+ /);
  });

  it('sans combinaison ni vidéo : rien ne se rend', async () => {
    const t = await getT('en');
    const html = renderToStaticMarkup(
      <SingularityVideosView split={splitSingularityVideos([], undefined, [])} lang="en" t={t} />,
    );
    expect(html).toBe('');
  });

  it('sans combinaison (donnée d’avant patch) : les vidéos restent, sous « Before the EX Buff »', async () => {
    const t = await getT('en');
    const html = renderToStaticMarkup(
      <SingularityVideosView
        split={splitSingularityVideos([], undefined, [yt('pre1', 'Old run')])}
        lang="en"
        t={t}
      />,
    );
    expect(gallery(html)).toBe('');
    expect(text(html)).toContain('Before the EX Buff');
    expect(count(html, '<iframe')).toBe(1);
  });
});
