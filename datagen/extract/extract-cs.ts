/**
 * extract-cs — écrit les listings C# que citent les specs damage, depuis le
 * client Steam décompilé (`pnpm datagen:extract-cs`). Pendant Mono de
 * `disasm.py` : même manifeste (`listings.json`), une sortie par entrée, mais en
 * C# lisible plutôt qu'en ARM64 — le client Steam n'a pas de code natif.
 *
 * Entrées, produites par `pnpm datagen:dump-steam` :
 *   - <root>/apk/dumped/src/**\/*.cs      projet décompilé par ilspycmd (-p)
 *   - <root>/apk/dumped/.dump-stamp.json  empreinte (source `steam`)
 *
 * Sortie : docs/specs/damage-formula-cs/<listing>.cs — SUIVIS PAR GIT, comme
 * les .asm : le diff d'un patch montre ce que le jeu a bougé dans les formules.
 *
 * Résolution d'un nom Il2CppDumper `Classe$$Membre` dans le décompilé :
 *   - la classe = le fichier `Classe.cs` (ilspy -p : un type par fichier, dans
 *     le dossier de son namespace), sinon le premier fichier qui la déclare ;
 *   - `get_X` / `set_X` = la PROPRIÉTÉ `X` entière (accesseurs compris) ;
 *   - `.ctor` = les constructeurs ;
 *   - le reste = la méthode, TOUTES SURCHARGES CONFONDUES. L'ordinal du
 *     manifeste ordonne les surcharges par ADRESSE dans le binaire ARM64 — il
 *     n'a pas de sens ici (pas de thunk, ordre source), donc un listing C# porte
 *     toutes les surcharges, chacune sous son en-tête. La spec choisit à la lecture.
 *
 * Une entrée du manifeste ABSENTE du décompilé = échec de fin de run avec la
 * liste complète : un renommage du jeu doit se VOIR (la spec qui cite ce listing
 * est peut-être périmée), jamais être sauté en silence. Un .cs présent en sortie
 * mais ABSENT du manifeste est signalé de même.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { walkFiles } from '../lib/fs';
import { isMain } from '../lib/is-main';
import { gamedata } from '../lib/paths';

const SRC = gamedata('apk/dumped/src');
const STAMP = gamedata('apk/dumped/.dump-stamp.json');
const OUT = resolve('docs/specs/damage-formula-cs');
const MANIFEST = resolve('datagen/extract/listings.json');

export type Listing = { file: string; method: string; overload: number; note?: string };

/** Le manifeste partagé avec `disasm.py`. */
export function loadListings(): Listing[] {
  return JSON.parse(readFileSync(MANIFEST, 'utf-8')) as Listing[];
}

/** Index des fichiers du projet décompilé : nom de type (basename sans .cs) → chemin. */
function indexSources(root: string): Map<string, string> {
  const byName = new Map<string, string>();
  walkFiles(root, (abs, rel) => {
    if (!rel.endsWith('.cs')) return;
    const name = basename(rel, '.cs');
    // Premier vu gagne ; le fichier à la racine (namespace global) est le cas
    // du client OUTERPLANE, dont presque tout le code est sans namespace.
    if (!byName.has(name)) byName.set(name, abs);
  });
  return byName;
}

/** Fin (exclusive) du bloc `{…}` dont l'accolade ouvrante est à `open`. */
function blockEnd(src: string, open: number): number {
  let depth = 0;
  let inStr: string | null = null;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === '\\') i++;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'") inStr = c;
    else if (c === '/' && src[i + 1] === '/') i = src.indexOf('\n', i);
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return i + 1;
  }
  return src.length;
}

/**
 * Extrait d'un fichier C# les MEMBRES nommés `member` de la classe `cls` (méthode :
 * toutes les surcharges ; propriété ; constructeurs). PUR — testable sur un texte.
 * Chaque bloc rendu va de sa ligne de signature à son accolade fermante
 * (ou au `;` d'un membre à corps d'expression).
 */
export function extractMembers(src: string, cls: string, member: string): string[] {
  const out: string[] = [];
  // Signature : modificateurs, type de retour éventuel, NOM, puis `(` (méthode /
  // ctor), `{` ou `=>` (propriété). Le nom est ancré en mot entier.
  const name =
    member === '.ctor'
      ? cls
      : /^(get|set)_/.test(member)
        ? member.replace(/^(get|set)_/, '')
        : member;
  const isProperty = /^(get|set)_/.test(member);
  const re = new RegExp(
    `^[ \\t]*(?:\\[[^\\n]*\\]\\s*)*(?:(?:public|private|protected|internal|static|override|virtual|unsafe|sealed|new|extern|readonly|abstract)\\s+)*` +
      // Type de retour : identifiant (générique inclus) OU tuple `(int a, int b)`.
      (member === '.ctor' ? '' : '(?:\\([^\\n)]*\\)|[^\\s=;(){}]+(?:<[^\\n]*?>)?)\\s+') +
      `${name}(?:<[^\\n]*?>)?\\s*` +
      (isProperty ? '(?=\\{|=>)' : '\\('),
    'gm',
  );
  for (const m of src.matchAll(re)) {
    // Écarter les APPELS et les autres classes : on veut une DÉCLARATION
    // (ligne qui commence par des modificateurs ou un type, pas un `return`/`=`).
    const lineStart = src.lastIndexOf('\n', m.index) + 1;
    const line = src.slice(lineStart, src.indexOf('\n', m.index));
    if (
      /^\s*(return|throw|=|\.)/.test(line) ||
      /=\s*[^=>]*$/.test(line.slice(0, m.index - lineStart))
    )
      continue;
    const open = src.indexOf('{', m.index);
    const semi = src.indexOf(';', m.index);
    const arrow = src.indexOf('=>', m.index);
    let end: number;
    if (open >= 0 && (semi < 0 || open < semi) && (arrow < 0 || open < arrow)) {
      end = blockEnd(src, open);
    } else {
      end = semi >= 0 ? semi + 1 : src.length; // corps d'expression / abstract / extern
    }
    out.push(src.slice(lineStart, end).replace(/\s+$/, ''));
  }
  return out;
}

/**
 * Cible d'un nom Il2CppDumper dans le DÉCOMPILÉ. Le binaire nomme des membres
 * que le compilateur a fabriqués et qu'ILSpy REPLIE dans la méthode d'origine :
 *   - `Classe.<Meth>d__81$$MoveNext`  — machine d'état d'un itérateur/async :
 *     son corps EST celui de `Classe.Meth` ;
 *   - `Classe$$<Meth>g__Local|17_0`   — fonction locale : déclarée DANS `Meth`.
 * Dans les deux cas, le listing C# est la méthode porteuse (`folded` = ce qu'on
 * cherchait, pour l'en-tête). PUR — testable.
 */
export function resolveTarget(method: string): { cls: string; member: string; folded?: string } {
  const [rawCls, rawMember] = method.split('$$');
  const stateMachine = /^(.+)\.<([^>]+)>d__\d+$/.exec(rawCls);
  if (stateMachine) {
    return { cls: stateMachine[1], member: stateMachine[2], folded: `${rawMember} de ${rawCls}` };
  }
  const local = /^<([^>]+)>g__(.+)\|\d+_\d+$/.exec(rawMember);
  if (local) return { cls: rawCls, member: local[1], folded: `fonction locale ${local[2]}` };
  return { cls: rawCls, member: rawMember };
}

export function extractListings(): void {
  if (!existsSync(SRC)) {
    throw new Error(`${SRC} absent — lancer \`pnpm datagen:dump-steam\` d'abord.`);
  }
  const stamp = JSON.parse(readFileSync(STAMP, 'utf-8')) as {
    gameVersion?: string;
    source?: string;
  };
  if (stamp.source !== 'steam') {
    throw new Error(`${STAMP} n'est pas une empreinte Steam (source=${stamp.source ?? '?'}).`);
  }
  const files = indexSources(SRC);
  const listings = loadListings();
  mkdirSync(OUT, { recursive: true });

  const missing: string[] = [];
  const written = new Set<string>();
  for (const l of listings) {
    const { cls, member, folded } = resolveTarget(l.method);
    const file = files.get(cls);
    if (!file) {
      missing.push(`${l.file} ← ${l.method} (classe ${cls} introuvable)`);
      continue;
    }
    // ilspycmd écrit en CRLF ; les listings sont committés en LF, comme le reste.
    const text = readFileSync(file, 'utf-8').replace(/\r\n/g, '\n');
    const blocks = extractMembers(text, cls, member);
    if (!blocks.length) {
      missing.push(`${l.file} ← ${l.method} (membre absent de ${basename(file)})`);
      continue;
    }
    const header =
      `// ${l.method} — client Steam ${stamp.gameVersion ?? '?'} (Assembly-CSharp.dll, Mono)\n` +
      `// Régénéré par \`pnpm datagen:extract-cs\` — NE PAS ÉDITER. Source : ${basename(file)}.\n` +
      (blocks.length > 1 ? `// ${blocks.length} surcharges, dans l'ordre du source.\n` : '') +
      (folded
        ? `// Le binaire cite ${folded} — généré par le compilateur, ILSpy le replie dans ${cls}.${member}.\n`
        : '') +
      (l.note ? `// Note du manifeste : ${l.note}\n` : '');
    writeFileSync(join(OUT, `${l.file}.cs`), `${header}\n${blocks.join('\n\n')}\n`);
    written.add(`${l.file}.cs`);
  }

  const orphans = readdirSync(OUT).filter((f) => f.endsWith('.cs') && !written.has(f));
  console.log(`✓ ${written.size}/${listings.length} listing(s) C# → ${OUT}`);
  if (orphans.length) {
    console.warn(
      `⚠ ${orphans.length} listing(s) présents en sortie mais absents du manifeste ` +
        `(plus personne ne les régénère) : ${orphans.join(', ')}`,
    );
  }
  if (missing.length) {
    throw new Error(
      `${missing.length} entrée(s) du manifeste introuvable(s) dans le décompilé — le jeu a ` +
        `renommé ? La spec qui les cite est peut-être périmée :\n  ${missing.join('\n  ')}`,
    );
  }
}

if (isMain(import.meta.url)) {
  try {
    extractListings();
  } catch (e) {
    console.error('\n✗ datagen:extract-cs a échoué :', e instanceof Error ? e.message : e);
    process.exit(1);
  }
}
