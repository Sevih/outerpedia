/**
 * Contrat de `withStoreLock` (audit F7) — la file d'attente par fichier.
 *
 * Ce qui est verrouillé : l'exclusion mutuelle par clé, l'INDÉPENDANCE des clés
 * (deux fichiers différents ne doivent pas se bloquer), et surtout le fait qu'une
 * opération qui ÉCHOUE ne gèle pas la file — sans ça, un enregistrement refusé
 * bloquerait tous les suivants jusqu'au redémarrage du serveur dev.
 */
import { describe, expect, it } from 'vitest';
import { withStoreLock } from './store-lock';

/** Promesse dont on choisit le moment de résolution. */
function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('withStoreLock', () => {
  it('SÉRIALISE deux opérations sur la même clé', async () => {
    const order: string[] = [];
    const first = deferred<void>();

    const a = withStoreLock('k', async () => {
      order.push('a:start');
      await first.promise;
      order.push('a:end');
    });
    const b = withStoreLock('k', async () => {
      order.push('b:start');
    });

    // B ne doit pas avoir commencé tant que A n'a pas fini.
    await Promise.resolve();
    expect(order).toEqual(['a:start']);

    first.resolve();
    await Promise.all([a, b]);
    expect(order).toEqual(['a:start', 'a:end', 'b:start']);
  });

  it('n’oppose AUCUNE attente entre clés différentes', async () => {
    const order: string[] = [];
    const held = deferred<void>();

    const a = withStoreLock('fichier-a', async () => {
      order.push('a:start');
      await held.promise;
    });
    const b = withStoreLock('fichier-b', async () => {
      order.push('b:start');
    });

    await b; // B passe alors que A est encore en cours.
    expect(order).toEqual(['a:start', 'b:start']);

    held.resolve();
    await a;
  });

  it('rend le résultat de la fonction', async () => {
    expect(await withStoreLock('k2', async () => ['erreur'])).toEqual(['erreur']);
  });

  it('PROPAGE l’erreur à l’appelant', async () => {
    await expect(
      withStoreLock('k3', async () => {
        throw new Error('écriture refusée');
      }),
    ).rejects.toThrow('écriture refusée');
  });

  it('un échec ne GÈLE PAS la file (le suivant passe quand même)', async () => {
    // Le point qui compte : sans ça, un enregistrement en erreur bloquerait
    // toutes les écritures suivantes sur ce fichier jusqu'au redémarrage.
    const failed = withStoreLock('k4', async () => {
      throw new Error('boum');
    });
    await expect(failed).rejects.toThrow('boum');

    expect(await withStoreLock('k4', async () => 'ok')).toBe('ok');
  });

  it('tient une file de plusieurs opérations, dans l’ordre d’arrivée', async () => {
    const order: number[] = [];
    await Promise.all(
      [1, 2, 3, 4, 5].map((n) =>
        withStoreLock('k5', async () => {
          order.push(n);
          // Un point de suspension à chaque tour : sans verrou, l'ordre partirait.
          await new Promise((r) => setTimeout(r, 0));
          order.push(-n);
        }),
      ),
    );
    // Chaque opération se termine avant que la suivante ne commence.
    expect(order).toEqual([1, -1, 2, -2, 3, -3, 4, -4, 5, -5]);
  });
});
