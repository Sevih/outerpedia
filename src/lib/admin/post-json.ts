/**
 * POST + JSON pour les actions admin (dev-only). Centralise le contrat de
 * réponse des routes `/api/admin/*` : envoie le corps en JSON (si fourni),
 * parse la réponse de façon tolérante, et JETTE une `Error` porteuse du message
 * serveur (`error` string ou `errors[]`) quand la réponse n'est pas OK — ou
 * quand le réseau lâche (`fetch` rejette).
 *
 * Chaque appelant DOIT envelopper l'appel dans un `try/catch` et remettre son
 * état « busy » à `false` (branche `catch` ou `finally`). Sinon une erreur
 * réseau laisse le bouton figé en busy — c'était le bug historique des 13
 * éditeurs admin (audit 2026-07-17).
 *
 * Certaines routes répondent `200 { ok: false, errors }` plutôt qu'un statut
 * d'erreur : `postJson` rend alors le corps sans jeter, à l'appelant de tester
 * le champ `ok` retourné (cf. MonsterKitEditor, RegenFromV2Button).
 */
export async function postJson<T = unknown>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    ...(body === undefined
      ? {}
      : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error(errorMessage(data));
  return data as T;
}

/** Message lisible d'une réponse admin en échec (`error` string ou `errors[]`). */
function errorMessage(data: Record<string, unknown>): string {
  if (typeof data.error === 'string' && data.error.trim()) return data.error;
  if (Array.isArray(data.errors) && data.errors.length) return data.errors.join(' ; ');
  return 'Échec de la requête';
}
