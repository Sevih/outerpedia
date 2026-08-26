/**
 * dump — lecture de `dump.cs` (le code du client sous forme lisible) avec
 * message clair s'il manque.
 *
 * C'est un artefact LOCAL, jamais committé, généré par `pnpm datagen:dump`
 * (ilspycmd sur l'Assembly-CSharp.dll du client Steam) ou `pnpm
 * datagen:dump-android` (Il2CppDumper sur l'APK, le secours). Les générateurs (goods, recruit) y
 * lisent des enums du client (ASSET_TYPE…) via `readEnum`, qui comprend les
 * DEUX syntaxes — la source ne doit pas se voir en aval :
 *
 *   Il2CppDumper :  public const ASSET_TYPE AT_GOLD = 1;
 *   C# décompilé : enum ASSET_TYPE { AT_GOLD = 1, AT_CRYSTAL, … }
 *
 * Dans la seconde, une valeur omise vaut la précédente + 1 (règle C#), ce que
 * le lecteur applique — Il2CppDumper, lui, écrit toujours la valeur.
 */
import { readFileSync } from 'node:fs';
import { gamedata } from './paths';

export const DUMP_PATH = gamedata('apk/dumped/dump.cs');

/** Contenu de `dump.cs`, ou lève en pointant vers `datagen:dump`. */
export function readDump(): string {
  try {
    return readFileSync(DUMP_PATH, 'utf8');
  } catch {
    throw new Error(
      `dump.cs manquant (${DUMP_PATH}). Génère-le : \`pnpm datagen:dump\` ` +
        `(voir docs/procedure/installation.md).`,
    );
  }
}

/**
 * Membres d'un enum du client, `{ nom → valeur }` dans l'ordre de déclaration —
 * PUR (testable sur un texte), lit les deux syntaxes (cf. en-tête). Map vide si
 * l'enum est absent : c'est à l'appelant de décider si c'est une erreur.
 */
export function readEnum(dump: string, enumName: string): Map<string, number> {
  const out = new Map<string, number>();

  // Syntaxe Il2CppDumper : chaque membre est une constante typée.
  const il2cpp = new RegExp(`public const ${enumName} ([A-Za-z_][A-Za-z0-9_]*) = (-?\\d+);`, 'g');
  for (const m of dump.matchAll(il2cpp)) out.set(m[1], Number(m[2]));
  if (out.size) return out;

  // Syntaxe C# : le corps de `enum <Nom> { … }` (le premier trouvé).
  const head = new RegExp(`\\benum ${enumName}\\b[^{]*\\{`).exec(dump);
  if (!head) return out;
  const start = head.index + head[0].length;
  const end = dump.indexOf('}', start);
  if (end < 0) return out;
  let next = 0;
  for (const raw of dump.slice(start, end).split(',')) {
    // `[Attribut] NOM = 3` ou `NOM` — on ignore attributs et commentaires.
    const line = raw
      .replace(/\/\/.*$/gm, '')
      .replace(/\[[^\]]*\]/g, '')
      .trim();
    if (!line) continue;
    const m = /^([A-Za-z_][A-Za-z0-9_]*)\s*(?:=\s*(-?\d+))?$/.exec(line);
    if (!m) continue;
    const value = m[2] !== undefined ? Number(m[2]) : next;
    out.set(m[1], value);
    next = value + 1;
  }
  return out;
}

/**
 * `ASSET_TYPE` du client : id numérique de monnaie → clé texte `SYS_ASSET_<X>`
 * (convention `AT_<X>` ↔ `SYS_ASSET_<X>`, vérifiée ensuite contre le catalogue
 * par les appelants — l'enum a ses fantômes). Lève si l'enum est introuvable :
 * un dump sans ASSET_TYPE est un dump cassé, pas un catalogue vide.
 */
export function assetTypeKeys(dump: string = readDump()): Map<string, string> {
  const out = new Map<string, string>();
  for (const [name, id] of readEnum(dump, 'ASSET_TYPE')) {
    if (!name.startsWith('AT_')) continue;
    const x = name.slice(3);
    if (x === 'MAX') continue; // sentinelle de l'enum, pas une monnaie
    out.set(String(id), `SYS_ASSET_${x}`);
  }
  if (!out.size) throw new Error(`ASSET_TYPE introuvable dans ${DUMP_PATH}`);
  return out;
}
