/**
 * quick est un outil LOCAL : il se déclare en développement. Les actions de
 * l'admin qu'il rappelle sont gardées par `IS_DEV` (`NODE_ENV === 'development'`,
 * figé au chargement de `src/lib/admin/guard.ts`) et ne feraient rien sans lui.
 * Module à effet de bord, importé EN PREMIER par `server.ts` : les imports
 * sont évalués avant le corps d'un module, y poser la variable serait trop tard.
 */
// Les types de Next déclarent `NODE_ENV` en lecture seule.
(process.env as Record<string, string | undefined>).NODE_ENV ??= 'development';
