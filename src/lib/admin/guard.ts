/**
 * Garde-fou de l'admin : outil LOCAL, jamais en production.
 *
 * `assertDevOnly()` rend 404 hors développement (pages) ; `IS_DEV` sert aux
 * routes API pour répondre 403. Combiné à `export const dynamic = 'force-dynamic'`
 * sur le layout admin, rien n'est prérendu/exposé en prod.
 */
import { notFound } from 'next/navigation';

export const IS_DEV = process.env.NODE_ENV === 'development';

export function assertDevOnly(): void {
  if (!IS_DEV) notFound();
}
