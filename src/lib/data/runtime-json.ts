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
 * ATTENTION au `revalidate` : il ABAISSE d'office l'ISR de la page appelante.
 * 600 s (défaut) est le bon compromis pour une page dédiée à cette donnée
 * (accueil, /coupons, /event) ; un appel depuis un LAYOUT partagé doit passer
 * une valeur alignée sur l'ISR du site (86 400), sinon c'est tout le site qui
 * se régénère toutes les 10 minutes.
 */
const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE ?? '';

export async function loadRuntimeJson<T>(name: string, fallback: T, revalidate = 600): Promise<T> {
  if (IMG_BASE) {
    try {
      const res = await fetch(`${IMG_BASE}/data/${name}`, { next: { revalidate } });
      if (res.ok) return (await res.json()) as T;
    } catch {
      /* R2 injoignable → repli committé */
    }
  }
  return fallback;
}
