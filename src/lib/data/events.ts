/**
 * ÉVÉNEMENTS COMMUNAUTAIRES (`/event`, `/event/<slug>`) — modèle et lecture.
 *
 * En V2, un événement était un COMPOSANT (`events/<slug>.tsx`) : publier un
 * concours, corriger une date ou ajouter les gagnants demandait un commit et un
 * redéploiement, et son dictionnaire i18n vivait dans le fichier. Ici un
 * événement est une DONNÉE (`data/curated/events.json`) : des métadonnées + une
 * liste de BLOCS au vocabulaire fermé, rendus par un composant unique. L'admin
 * l'édite (`/admin/tools/events`) et la sauvegarde publie le fichier sur R2 —
 * l'événement paraît en prod sans redéploiement (cf. `runtime-json`).
 *
 * Un contenu vraiment hors-modèle reste possible sans tordre le vocabulaire :
 * `EVENT_PAGES` (registry.ts de l'outil) associe un slug à un composant maison,
 * qui remplace alors le rendu des blocs. C'est l'exception, pas la règle.
 */
import type { LocalizedText } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { LANGUAGES } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { loadRuntimeJson } from '@/lib/data/runtime-json';
import eventsData from '@data/curated/events.json';

/** Familles d'événements (badge + libellé i18n `tools.event.type.*`). */
export type EventType = 'tournament' | 'contest' | 'community';

/** Statut DÉRIVÉ des dates — jamais stocké (cf. `eventStatus`). */
export type EventStatus = 'upcoming' | 'ongoing' | 'ended';

export const EVENT_TYPES: EventType[] = ['tournament', 'contest', 'community'];
export const EVENT_STATUSES: EventStatus[] = ['ongoing', 'upcoming', 'ended'];

/** Plateformes d'hébergement acceptées (miroir de `VideoItem` de MultiVideoEmbed). */
export type EventVideoPlatform = 'youtube' | 'twitch' | 'bilibili';
export const EVENT_VIDEO_PLATFORMS: EventVideoPlatform[] = ['youtube', 'twitch', 'bilibili'];

/**
 * Une vidéo d'un bloc `videos`. `featured` porte un libellé (« 1st place »,
 * « Pick of the month »…) : sa présence promeut l'entrée en LECTEUR EMBARQUÉ
 * avec ce libellé en badge ; sans lui, l'entrée est une vignette de la grille.
 * C'est ce qui rend le bloc générique — un podium de concours et une galerie de
 * showcase sont la même donnée, seul le libellé change.
 */
export interface EventVideo {
  platform: EventVideoPlatform;
  /** Identifiant de la plateforme (YouTube/Twitch : id ; Bilibili : BVxxxx). */
  id: string;
  title: string;
  author?: string;
  featured?: LocalizedText;
}

/**
 * Jalon du calendrier : ce qui se joue À CETTE DATE (ouverture, clôture,
 * dépouillement…). Source UNIQUE des dates intermédiaires — le bloc `timeline`
 * les affiche et l'en-tête met en avant le jalon courant, personne ne les
 * recopie dans la prose (le défaut de la V2).
 */
export interface EventPhase {
  /** ISO 8601 avec fuseau (`2026-04-28T00:00:00Z`). */
  until: string;
  label: LocalizedText;
}

/** Vocabulaire FERMÉ des blocs de contenu (le rendu vit dans `EventBlocks`). */
export type EventBlock =
  | { kind: 'prose'; title?: LocalizedText; text: LocalizedText }
  | { kind: 'list'; title?: LocalizedText; items: LocalizedText[] }
  | {
      kind: 'sections';
      title?: LocalizedText;
      items: { title: LocalizedText; text: LocalizedText }[];
    }
  | { kind: 'timeline'; title?: LocalizedText }
  | { kind: 'callout'; title?: LocalizedText; text: LocalizedText }
  | { kind: 'cta'; label: LocalizedText; href: string; note?: LocalizedText }
  | { kind: 'videos'; title?: LocalizedText; entries: EventVideo[] }
  | { kind: 'image'; src: string; alt?: LocalizedText; caption?: LocalizedText };

export type EventBlockKind = EventBlock['kind'];

/** Un événement tel que stocké dans `data/curated/events.json`. */
export interface EventEntry {
  /** Identifiant d'URL (`/event/<slug>`) — stable, jamais réutilisé. */
  slug: string;
  type: EventType;
  title: LocalizedText;
  /** Résumé de la carte de liste ET de la meta description. */
  summary?: LocalizedText;
  organizer?: string;
  /** Chemin R2 de la bannière (`images/events/<slug>/cover.webp`). */
  cover?: string;
  /** Début / fin, ISO 8601 avec fuseau. */
  start: string;
  end: string;
  phases?: EventPhase[];
  blocks: EventBlock[];
  /** Jamais publié, quelle que soit la date (invisible hors admin local). */
  draft?: boolean;
}

/** Ligne de la liste `/event` (l'entrée complète n'est chargée qu'au détail). */
export interface EventSummary {
  slug: string;
  type: EventType;
  status: EventStatus;
  title: string;
  summary: string;
  organizer?: string;
  cover?: string;
  start: string;
  end: string;
  /** Libellé du jalon en cours (événement `ongoing` seulement). */
  phase?: string;
  draft?: boolean;
}

const committed = eventsData as unknown as EventEntry[];

/** Le curé, lu en RUNTIME (R2) avec repli sur la copie committée. */
export const loadEvents = (): Promise<EventEntry[]> => loadRuntimeJson('events.json', committed);

/**
 * Statut d'un événement à l'instant `now` (ms). Fenêtre INCLUSIVE des deux
 * côtés : un événement qui se termine « à » sa date de fin l'est encore à la
 * milliseconde près. Une date illisible ne fait pas planter la page — elle
 * dégrade en `ended` (l'événement sort de la mise en avant, pas du site).
 */
export function eventStatus(e: Pick<EventEntry, 'start' | 'end'>, now: number): EventStatus {
  const start = Date.parse(e.start);
  const end = Date.parse(e.end);
  if (Number.isNaN(start) || Number.isNaN(end)) return 'ended';
  if (now < start) return 'upcoming';
  return now <= end ? 'ongoing' : 'ended';
}

/** Jalon COURANT : le premier pas encore atteint (sinon aucun). */
export function currentPhase(e: EventEntry, now: number): EventPhase | undefined {
  return (e.phases ?? []).find((p) => {
    const until = Date.parse(p.until);
    return !Number.isNaN(until) && now < until;
  });
}

/**
 * Ordre d'affichage : en cours d'abord (celui qui ferme le plus tôt en tête —
 * c'est l'urgent), puis à venir (le plus proche d'abord), puis terminés (le
 * plus récent d'abord).
 */
const STATUS_RANK: Record<EventStatus, number> = { ongoing: 0, upcoming: 1, ended: 2 };

function compareEvents(a: EventSummary, b: EventSummary): number {
  const rank = STATUS_RANK[a.status] - STATUS_RANK[b.status];
  if (rank !== 0) return rank;
  if (a.status === 'upcoming') return a.start.localeCompare(b.start);
  if (a.status === 'ongoing') return a.end.localeCompare(b.end);
  return b.end.localeCompare(a.end);
}

const isPublic = (e: EventEntry): boolean => !e.draft;

/**
 * Liste résolue pour `lang`. Les BROUILLONS sont écartés côté SERVEUR (leur
 * contenu ne part jamais dans le HTML ni dans le bundle — la V2 les filtrait
 * côté client, donc les livrait quand même) ; `includeDrafts` n'est utilisé que
 * par l'admin local.
 */
export async function getEvents(
  lang: Lang,
  options?: { includeDrafts?: boolean; now?: number },
): Promise<EventSummary[]> {
  return summarize(await loadEvents(), lang, options);
}

/** Cœur PUR de `getEvents` (filtrage, résolution, tri) — c'est lui qui est testé. */
export function summarize(
  all: EventEntry[],
  lang: Lang,
  options?: { includeDrafts?: boolean; now?: number },
): EventSummary[] {
  const now = options?.now ?? Date.now();
  const kept = options?.includeDrafts ? all : all.filter(isPublic);
  return kept
    .map((e) => {
      const status = eventStatus(e, now);
      const phase = status === 'ongoing' ? currentPhase(e, now) : undefined;
      return {
        slug: e.slug,
        type: e.type,
        status,
        title: lRec(e.title, lang),
        summary: lRec(e.summary, lang),
        start: e.start,
        end: e.end,
        ...(e.organizer && { organizer: e.organizer }),
        ...(e.cover && { cover: e.cover }),
        ...(phase && { phase: lRec(phase.label, lang) }),
        ...(e.draft && { draft: true }),
      };
    })
    .sort(compareEvents);
}

/** Un événement par slug, ou `undefined` (inconnu ou brouillon hors admin). */
export async function getEvent(
  slug: string,
  options?: { includeDrafts?: boolean },
): Promise<EventEntry | undefined> {
  const found = (await loadEvents()).find((e) => e.slug === slug);
  if (!found) return undefined;
  return options?.includeDrafts || isPublic(found) ? found : undefined;
}

/** Un événement + tout ce qui se déduit de l'instant courant (page détail). */
export interface EventView {
  event: EventEntry;
  status: EventStatus;
  phase?: EventPhase;
  /** L'instant retenu — passé au rendu pour que la page reste cohérente. */
  now: number;
}

/**
 * Vue complète d'un événement. Le `Date.now()` vit ICI, dans la couche données :
 * l'appeler pendant le rendu d'un composant est une impureté (react-hooks/purity)
 * et ferait diverger le statut d'une passe de rendu à l'autre.
 */
export async function getEventView(
  slug: string,
  options?: { includeDrafts?: boolean },
): Promise<EventView | undefined> {
  const event = await getEvent(slug, options);
  if (!event) return undefined;
  const now = Date.now();
  const status = eventStatus(event, now);
  return { event, status, now, ...(status === 'ongoing' && { phase: currentPhase(event, now) }) };
}

/** Slugs PUBLIÉS (`generateStaticParams`) — un brouillon n'a pas de page. */
export async function listEventSlugs(): Promise<string[]> {
  return (await loadEvents()).filter(isPublic).map((e) => e.slug);
}

/** Date d'événement en toutes lettres (« 24 mars 2026 »), fuseau UTC. */
export function formatEventDate(iso: string, lang: Lang): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  return new Date(ms).toLocaleDateString(LANGUAGES[lang].htmlLang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
