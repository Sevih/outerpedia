/**
 * KILL-SWITCH TEMPORAIRE des réglages du site — module SANS React : il est lu
 * aussi bien par le composant SERVEUR `Header` (qui n'a pas le droit d'importer
 * un module à hooks) que par les surfaces clientes, via le ré-export de
 * `site-settings`.
 *
 * La feature est en chantier et la CI déploie chaque push : sans ce verrou, un
 * commit de travail la mettrait en prod. Visible en DEV, invisible partout
 * ailleurs tant que `NEXT_PUBLIC_SITE_SETTINGS=1` n'est pas posée (variable
 * inlinée au build, comme `NEXT_PUBLIC_LANG_ROUTING`). Toutes les surfaces s'y
 * soumettent : l'engrenage et la modale du header, les feuilles clientes des
 * cartes, le bouton de la galerie de la fiche. À SUPPRIMER (le verrou, pas la
 * feature) quand Sevih valide la mise en ligne.
 */
export const SITE_SETTINGS_ENABLED =
  process.env.NEXT_PUBLIC_SITE_SETTINGS === '1' || process.env.NODE_ENV === 'development';
