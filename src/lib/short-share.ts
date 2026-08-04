/**
 * Côté CLIENT du raccourcisseur (`/api/shortlink` + `/s/[id]`) — fichier
 * séparé de `short-links.ts`, qui importe crypto/mysql2 et ne doit jamais
 * entrer dans un bundle client.
 *
 * Rend l'URL à copier dans un bouton « partager » : la version courte
 * `/s/<id>` si le serveur répond, sinon le lien long AUTOPORTÉ courant —
 * même dégradation que le partage tier-list (dev sans BDD, réseau coupé).
 */
export async function shortShareUrl(): Promise<string> {
  const { origin, pathname, search, hash } = window.location;
  const path = `${pathname}${search}${hash}`;
  const long = `${origin}${path}`;
  // Sans état dans l'URL, le lien canonique est déjà court : ne pas créer
  // une ligne en BDD pour rediriger vers un chemin nu.
  if (!search && !hash) return long;
  try {
    const res = await fetch('/api/shortlink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    if (res.ok) {
      const data = (await res.json()) as { id?: unknown };
      if (typeof data?.id === 'string') return `${origin}/s/${data.id}`;
    }
  } catch {
    // erreur réseau → on garde le lien long autoporté
  }
  return long;
}
