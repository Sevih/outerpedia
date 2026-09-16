/**
 * Invariants du générateur comics sur `comics.json` committé. Le générateur est
 * un simple SCAN fs (`.editorial/comics/<LANG>`) sans cœur pur à isoler → on
 * valide la FORME du catalogue servi : clés = langues d'origine connues, stems
 * sans extension, uniques et triés (ordre stable du JSON).
 *
 * Tourne SANS `.gamedata` (le générateur ne lit que l'éditorial, ici pas lu).
 */
import { describe, expect, it } from 'vitest';
import comicsData from '../../data/generated/comics.json';
import { COMIC_LANGS, removedStems, toNfc, type ComicsData } from './comics';

const comics = comicsData as ComicsData;
const IMAGE_RE = /\.(png|jpe?g|webp)$/i;

describe('comics.json — invariants de catalogue', () => {
  it('clés = langues d’origine connues (EN/JP/KR)', () => {
    expect(Object.keys(comics).sort()).toEqual([...COMIC_LANGS].sort());
  });

  it('chaque langue : stems sans extension, uniques, triés', () => {
    const bad: string[] = [];
    for (const lang of COMIC_LANGS) {
      const list = comics[lang];
      if (!Array.isArray(list)) {
        bad.push(`${lang} : pas une liste`);
        continue;
      }
      if (new Set(list).size !== list.length) bad.push(`${lang} : doublons`);
      if (list.some((s) => IMAGE_RE.test(s))) bad.push(`${lang} : extension dans un stem`);
      const sorted = [...list].sort();
      if (JSON.stringify(list) !== JSON.stringify(sorted)) bad.push(`${lang} : non trié`);
    }
    expect(bad).toEqual([]);
  });

  /**
   * NFC OBLIGATOIRE. Syncthing renomme d'office les noms de fichiers en Unicode
   * composé : un stem NFD au catalogue ne correspondrait plus au disque, et la
   * réconciliation de `collect-comics` remettrait la BD au manifeste EN DOUBLE
   * (constat du 2026-09-15 sur les 13 BD à titre hangeul).
   */
  it('chaque stem est en Unicode composé (NFC) — exigence Syncthing', () => {
    const nfd: string[] = [];
    for (const lang of COMIC_LANGS) {
      for (const stem of comics[lang] ?? []) {
        if (stem !== toNfc(stem)) nfd.push(`${lang} : ${stem}`);
      }
    }
    expect(nfd).toEqual([]);
  });
});

describe('removedStems — ce qu’une publication RETIRERAIT du catalogue en ligne', () => {
  const ref = { EN: ['a', 'b'], JP: ['x'], KR: [] };

  it('pool complet → aucun retrait, publication sans perte', () => {
    expect(removedStems({ EN: ['a', 'b'], JP: ['x'], KR: [] }, ref).size).toBe(0);
  });

  it('un ajout seul ne retire rien', () => {
    expect(removedStems({ EN: ['a', 'b', 'c'], JP: ['x'], KR: [] }, ref).size).toBe(0);
  });

  it('ÉCHANGE À SOMME NULLE détecté — le piège du 2026-08-21', () => {
    // 2 BD de part et d’autre pour EN, mais pas les mêmes : le garde-fou d’avant
    // comparait des comptes et laissait passer l’effacement de « b ».
    const removed = removedStems({ EN: ['a', 'nouvelle'], JP: ['x'], KR: [] }, ref);
    expect([...removed]).toEqual([['EN', ['b']]]);
  });

  it('une langue entièrement absente du pool compte comme retrait total', () => {
    expect(removedStems({ EN: ['a', 'b'], KR: [] }, ref).get('JP')).toEqual(['x']);
  });

  /**
   * Le cas du 2026-09-15 : le pool local est passé en NFC (renommage Syncthing)
   * alors que la référence committée porte encore le NFD. Sans normalisation,
   * la BD comptait pour RETIRÉE — et `collect-comics` la rajoutait au manifeste
   * à côté de sa jumelle NFC.
   */
  it('même nom en NFD côté référence et NFC côté pool → aucun retrait', () => {
    const nfc = '유마님_EN'; // graphie du disque depuis le renommage Syncthing
    const nfd = nfc.normalize('NFD'); // graphie que porte encore le repli committé
    expect(nfd).not.toBe(nfc); // deux chaînes différentes, même nom à l'écran
    expect(removedStems({ EN: [nfc] }, { EN: [nfd] }).size).toBe(0);
    // …et dans l'autre sens, un pool encore NFD face à une référence NFC.
    expect(removedStems({ EN: [nfd] }, { EN: [nfc] }).size).toBe(0);
  });

  it('référence illisible ou vide → rien à protéger (premier passage)', () => {
    expect(removedStems({ EN: ['a'] }, {}).size).toBe(0);
    expect(removedStems({ EN: ['a'] }, null).size).toBe(0);
  });
});
