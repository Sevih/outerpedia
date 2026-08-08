import { describe, expect, it } from 'vitest';
import { LANGS } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { getAllCharacters, characterDisplayName } from '@/lib/data/characters';
import { loadShortNames } from '@/lib/data/short-names';
import { fitsOnTwoLines } from './CharacterPortrait';

/**
 * LE LIBELLÉ SOUS LA CARTE NE SE TRONQUE JAMAIS — et ça, seule la donnée peut le
 * garantir.
 *
 * Sous 1024 px, `CharacterCard` écrit le nom SOUS la carte, sur deux lignes
 * réservées, et se rabat sur le nom court curé quand le nom complet déborde. Le
 * `line-clamp-2` du libellé est un garde-fou de rendu, pas une politique : s'il
 * s'active, le lecteur voit un nom coupé.
 *
 * Le repli ne peut tenir que si CHAQUE couple (perso, langue) est dans un de ces
 * deux cas — d'où ce test, qui les vérifie tous les 620. Il est là parce que le
 * défaut, lui, était silencieux : la mesure se faisait sur 128 px pour un texte
 * rendu sur 80, donc le repli ne se déclenchait jamais et seize noms étaient
 * tronqués sans que rien ne le signale.
 *
 * SI CE TEST CASSE : un personnage vient d'arriver avec un nom long. Ce n'est pas
 * le test qu'il faut assouplir, c'est un nom court qu'il faut lui curer, dans
 * `/admin/tools/short-names`.
 */

/**
 * La largeur du libellé au palier le plus étroit — celui du mobile. Recopiée de
 * `SCALE.default.labelWidthPx` : la table de `CharacterCard` reste celle qui
 * décide, ce test constate.
 */
const LABEL_WIDTH_PX = 80;

describe('nom sous la carte', () => {
  const shortNames = loadShortNames();

  it('tient sur deux lignes en 80 px, au besoin via le nom court curé', () => {
    const truncated: string[] = [];

    for (const c of getAllCharacters()) {
      for (const lang of LANGS) {
        const full = characterDisplayName(c, lang);
        if (fitsOnTwoLines(full, LABEL_WIDTH_PX)) continue;

        const short = lRec(shortNames[c.id], lang);
        if (short && fitsOnTwoLines(short, LABEL_WIDTH_PX)) continue;

        truncated.push(
          short
            ? `${c.id} [${lang}] « ${full} » → nom court « ${short} » ENCORE trop long`
            : `${c.id} [${lang}] « ${full} » → aucun nom court curé`,
        );
      }
    }

    expect(truncated).toEqual([]);
  });
});
