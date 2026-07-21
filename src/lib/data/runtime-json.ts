/**
 * LECTURE RUNTIME d'un JSON curé — la donnée VIVE du site (coupons, bannières,
 * événements) est servie depuis R2 à la requête plutôt que figée au build.
 *
 * En prod : la COPIE hébergée sur R2 (`data/<name>`, publiée par la sauvegarde
 * admin — cf. `lib/admin/runtime-publish`), lue avec revalidation — une édition
 * paraît SANS redéploiement (patron du manifeste comics, décision Sevih 20/07).
 * En dev (base d'images vide) ou si R2 est injoignable : repli sur la donnée
 * committée passée en `fallback`.
 *
 * Le `revalidate` de 600 s abaisse d'office l'ISR des pages consommatrices à
 * 10 min — c'est voulu, c'est la fraîcheur.
 */
const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE ?? '';

export async function loadRuntimeJson<T>(name: string, fallback: T): Promise<T> {
  if (IMG_BASE) {
    try {
      const res = await fetch(`${IMG_BASE}/data/${name}`, { next: { revalidate: 600 } });
      if (res.ok) return (await res.json()) as T;
    } catch {
      /* R2 injoignable → repli committé */
    }
  }
  return fallback;
}
