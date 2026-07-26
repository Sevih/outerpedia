/**
 * Cœurs PURS de la sync gamedata, testés sans device ni `.gamedata` (audit E1/E2) :
 *   - `parseMd5` / `parseLsLR` : les PARSERS de signatures distantes. Fragiles
 *     (dépendent du layout de colonnes toybox) et à conséquence lourde — une ligne
 *     non parsée fait manquer le fichier de `remote`, le siège d'E2 ;
 *   - `massDeleteGuard` : le garde-fou E2 qui refuse la purge silencieuse du miroir
 *     quand ce listing rentre incomplet.
 */
import { describe, expect, it } from 'vitest';
import { massDeleteGuard, parseLsLR, parseMd5 } from './pull-gamedata';

const BASE = '/sdcard/Android/data/com.bnkr.outerplane/files/bundles';

describe('parseMd5 — sortie `md5sum` récursive toybox', () => {
  it('mappe chaque « hash  ./relatif » → { relatif → md5 }', () => {
    const out = [
      'd41d8cd98f00b204e9800998ecf8427e  ./a1b2c3.bundle',
      '098f6bcd4621d373cade4e832627b4f6  ./sub/d4e5f6.bundle',
    ].join('\n');
    expect(parseMd5(out)).toEqual(
      new Map([
        ['a1b2c3.bundle', 'd41d8cd98f00b204e9800998ecf8427e'],
        ['sub/d4e5f6.bundle', '098f6bcd4621d373cade4e832627b4f6'],
      ]),
    );
  });

  it('CRLF (Windows) toléré comme LF', () => {
    const out = 'd41d8cd98f00b204e9800998ecf8427e  ./x.bundle\r\n';
    expect(parseMd5(out).get('x.bundle')).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });

  it('ignore le bruit adb et les lignes mal formées (ni hash ni `./`)', () => {
    const out = [
      '',
      'md5sum: ./manque: No such file or directory', // erreur toybox
      'ZZZ8f6bcd4621d373cade4e832627b4f6  ./pas-hexa.bundle', // hash invalide
      'd41d8cd98f00b204e9800998ecf8427e  chemin/sans/point-slash', // pas de `./`
      'd41d8cd98f00b204e9800998ecf8427e  ./ok.bundle', // seule ligne valide
    ].join('\n');
    expect(parseMd5(out)).toEqual(new Map([['ok.bundle', 'd41d8cd98f00b204e9800998ecf8427e']]));
  });
});

describe('parseLsLR — sortie `ls -lR <baseDir>` toybox', () => {
  // Un bloc par dossier : en-tête « chemin: », `total N`, puis les entrées.
  const listing = [
    `${BASE}:`,
    'total 24',
    '-rw-rw---- 1 u0_a123 ext_data_rw 12345 2024-01-01 12:00 a1b2c3.bundle',
    'drwxrwx--x 2 u0_a123 ext_data_rw  3452 2024-01-01 12:00 sub', // dossier → ignoré
    '',
    `${BASE}/sub:`,
    'total 8',
    '-rw-rw---- 1 u0_a123 ext_data_rw   678 2024-01-01 12:00 d4e5f6.bundle',
  ].join('\n');

  it('ne retient QUE les fichiers réguliers, chemin relatif reconstruit → taille', () => {
    expect(parseLsLR(listing, BASE)).toEqual(
      new Map([
        ['a1b2c3.bundle', '12345'],
        ['sub/d4e5f6.bundle', '678'],
      ]),
    );
  });

  it('écarte dossiers (d), liens (l) et la ligne `total`', () => {
    const out = [
      `${BASE}:`,
      'total 4',
      'drwxrwx--x 2 u0_a123 ext_data_rw 3452 2024-01-01 12:00 dossier',
      'lrwxrwxrwx 1 u0_a123 ext_data_rw   10 2024-01-01 12:00 lien -> cible',
      '-rw-rw---- 1 u0_a123 ext_data_rw   42 2024-01-01 12:00 vrai.bundle',
    ].join('\n');
    expect(parseLsLR(out, BASE)).toEqual(new Map([['vrai.bundle', '42']]));
  });

  it('tolère un espace dans le nom (le nom prend tout à partir de la 8e colonne)', () => {
    const out = [
      `${BASE}:`,
      '-rw-rw---- 1 u0_a123 ext_data_rw 99 2024-01-01 12:00 nom avec espace.png',
    ].join('\n');
    expect(parseLsLR(out, BASE).get('nom avec espace.png')).toBe('99');
  });

  it('siège d’E2 : une ligne TRONQUÉE (< 8 colonnes) est ignorée en SILENCE', () => {
    // Le fichier manque alors de `remote` → classé « à supprimer » à tort. C'est
    // exactement ce que `massDeleteGuard` rattrape en aval.
    const out = [
      `${BASE}:`,
      '-rw-rw---- 1 u0_a123 ext_data_rw', // ligne coupée
      '-rw-rw---- 1 u0_a123 ext_data_rw 7 2024-01-01 12:00 intact.bundle',
    ].join('\n');
    const map = parseLsLR(out, BASE);
    expect(map.has('intact.bundle')).toBe(true);
    expect(map.size).toBe(1); // la ligne coupée n'a produit aucune entrée
  });
});

describe('massDeleteGuard', () => {
  it('run incrémental normal (peu de suppressions) → OK', () => {
    expect(massDeleteGuard({ localSize: 1000, toDelete: 3, toPull: 5 })).toBeNull();
  });

  it('vrai gros patch (supprime beaucoup MAIS tire autant) → OK', () => {
    // Bundles content-addressed : un nom change → 1 suppression + 1 tirage.
    expect(massDeleteGuard({ localSize: 1000, toDelete: 700, toPull: 720 })).toBeNull();
  });

  it('listing tronqué (supprime l’essentiel, ne tire presque rien) → REFUS', () => {
    const r = massDeleteGuard({ localSize: 1000, toDelete: 900, toPull: 4 });
    expect(r).toBeTruthy();
    expect(r).toMatch(/900\/1000/);
    expect(r).toMatch(/miroir intact/);
  });

  it('bootstrap (miroir vide) → OK, jamais de refus', () => {
    expect(massDeleteGuard({ localSize: 0, toDelete: 0, toPull: 5000 })).toBeNull();
  });

  it('juste sous les seuils (50 % pile, ou pull ≥ 10 %) → OK', () => {
    expect(massDeleteGuard({ localSize: 1000, toDelete: 500, toPull: 0 })).toBeNull(); // delRatio pas > 0.5
    expect(massDeleteGuard({ localSize: 1000, toDelete: 900, toPull: 100 })).toBeNull(); // pullRatio pas < 0.1
  });
});
