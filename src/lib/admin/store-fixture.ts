/**
 * Bac à sable des stores curés — **TEST UNIQUEMENT** (aucun consommateur en prod ;
 * le fichier ne s'appelle pas `*.test.ts` parce qu'il est importé PAR les tests,
 * pas collecté comme suite).
 *
 * Pourquoi ce détour plutôt qu'un mock de `writeJson` : les stores résolvent leur
 * chemin AU CHARGEMENT du module (`resolve(process.cwd(), 'data/curated/…')`) et
 * relisent le disque à chaque appel. En redirigeant `process.cwd()` vers un
 * dossier temporaire AVANT l'import, on teste le vrai read-merge-write — vraie
 * lecture, vrai `writeJson` atomique, vrai format canonique — sans jamais toucher
 * `data/curated/` du repo. Un mock de l'écriture, lui, ne dirait rien du merge :
 * or c'est LÀ qu'une régression perd des clés en silence (audit F8).
 *
 * ⚠ ORDRE OBLIGATOIRE dans le test : `sandbox()` d'abord, `await import()` du
 * store ENSUITE (sinon le store a déjà figé le chemin du vrai repo).
 * ⚠ Ne pas appeler `vi.restoreAllMocks()` : ça retirerait la redirection de cwd
 * et les écritures repartiraient dans le repo.
 *
 * Le prix à payer : prettier ne trouve pas la config du projet depuis le tmp, donc
 * `formatJson` retombe sur ses défauts. Sans effet ici — les tests relisent le
 * JSON (`read`), ils n'assertent pas des octets.
 */
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { vi } from 'vitest';
import { formatJson } from '@datagen/lib/json';

export interface StoreSandbox {
  /** Racine du faux repo (ce que `process.cwd()` renvoie désormais). */
  root: string;
  /** Pose un curé au format canonique (`rel` relatif à la racine). */
  put(rel: string, data: unknown): Promise<void>;
  /** Pose des octets bruts — pour les curés VOLONTAIREMENT cassés. */
  putRaw(rel: string, text: string): void;
  /** Relit un curé — ce que le store a réellement écrit. */
  read<T>(rel: string): T;
  /** Octets bruts (pour les assertions de format). */
  raw(rel: string): string;
  exists(rel: string): boolean;
  /** Résidus `.tmp` du dossier curé : un temporaire ne doit jamais survivre. */
  leftovers(): string[];
  /** Vide le dossier curé entre deux cas. */
  reset(): void;
  dispose(): void;
}

const CURATED = 'data/curated';

/**
 * Crée le bac à sable et redirige `process.cwd()`. À appeler au NIVEAU MODULE du
 * test, avant l'import dynamique du store.
 */
export function sandbox(prefix: string): StoreSandbox {
  const root = mkdtempSync(join(tmpdir(), `store-${prefix}`));
  mkdirSync(join(root, CURATED), { recursive: true });
  mkdirSync(join(root, 'data/generated'), { recursive: true });
  vi.spyOn(process, 'cwd').mockReturnValue(root);

  const at = (rel: string) => join(root, rel);

  return {
    root,
    async put(rel, data) {
      const path = at(rel);
      mkdirSync(dirname(path), { recursive: true });
      // Format canonique : le store doit savoir relire ce qu'un vrai curé contient.
      writeFileSync(path, await formatJson(data));
    },
    putRaw(rel, text) {
      const path = at(rel);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, text);
    },
    read<T>(rel: string): T {
      return JSON.parse(readFileSync(at(rel), 'utf8')) as T;
    },
    raw(rel) {
      return readFileSync(at(rel), 'utf8');
    },
    exists(rel) {
      return existsSync(at(rel));
    },
    leftovers() {
      return readdirSync(at(CURATED)).filter((f) => f.includes('.tmp'));
    },
    reset() {
      rmSync(at(CURATED), { recursive: true, force: true });
      mkdirSync(at(CURATED), { recursive: true });
    },
    dispose() {
      rmSync(root, { recursive: true, force: true });
    },
  };
}
