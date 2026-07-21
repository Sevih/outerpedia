/**
 * Présentation des événements communautaires : badges de type/statut et URL des
 * vidéos. Séparé de la couche données (`@/lib/data/events`, pure) et du rendu.
 *
 * Les classes Tailwind sont des LITTÉRAUX — v4 ne voit pas les concaténations
 * `bg-${x}` (même règle que la présentation du changelog).
 */
import type { EventStatus, EventType, EventVideo } from '@/lib/data/events';

/** Badge coloré par famille d'événement (tokens `cat-*` de globals.css). */
export const EVENT_TYPE_BADGE: Record<EventType, string> = {
  tournament: 'bg-cat-red-fg/15 text-cat-red-fg',
  contest: 'bg-cat-violet-fg/15 text-cat-violet-fg',
  community: 'bg-cat-sky-fg/15 text-cat-sky-fg',
};

/** Badge de statut : en cours mis en avant, terminé volontairement discret. */
export const EVENT_STATUS_BADGE: Record<EventStatus, string> = {
  ongoing: 'bg-cat-emerald-fg/15 text-cat-emerald-fg',
  upcoming: 'bg-cat-amber-fg/15 text-cat-amber-fg',
  ended: 'bg-surface-overlay text-content-subtle',
};

/** Clé i18n du libellé de statut / de type. */
export const eventStatusKey = (s: EventStatus) => `tools.event.status.${s}` as const;
export const eventTypeKey = (t: EventType) => `tools.event.type.${t}` as const;

/** Page publique de la vidéo (le lien de la vignette). */
export function videoUrl(v: EventVideo): string {
  switch (v.platform) {
    case 'youtube':
      return `https://youtu.be/${v.id}`;
    case 'twitch':
      return `https://www.twitch.tv/videos/${v.id}`;
    case 'bilibili':
      return `https://www.bilibili.com/video/${v.id}`;
  }
}

/**
 * Vignette de la vidéo, ou `null` quand la plateforme n'en expose pas d'URL
 * stable (Twitch/Bilibili : leur API demande une clé — la carte retombe alors
 * sur le nom de la plateforme, comme en V2).
 */
export function videoThumbnail(v: EventVideo): string | null {
  return v.platform === 'youtube' ? `https://img.youtube.com/vi/${v.id}/hqdefault.jpg` : null;
}
