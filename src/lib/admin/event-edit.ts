/**
 * Ce que les ÉDITEURS d'événements (l'admin, quick) partagent hors du rendu :
 * les libellés français des familles et des genres de bloc, le squelette d'un
 * événement neuf et d'un bloc neuf, et la LOCALISATION d'un refus de
 * `validateEvents` — son message dit « Événement i (slug), bloc n (kind),
 * puce k : … », ici lu en `{ index, tab, block, entry }` pour que la page le
 * pose sous le champ fautif au lieu de l'empiler dans un journal.
 *
 * Un bloc neuf porte TOUJOURS sa clé `title` (vide) : l'admin n'ouvrait le
 * champ du titre que si la clé existait déjà (`'title' in block`), donc jamais
 * sur un bloc ajouté — un titre ne se posait qu'en éditant le JSON. Un `cta`
 * et une `image` n'ont pas de titre dans le modèle : eux n'en portent pas.
 */
import type { EventBlock, EventBlockKind, EventEntry, EventType } from '@/lib/data/events';

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  tournament: 'Tournoi',
  contest: 'Concours',
  community: 'Communauté',
};

export const EVENT_BLOCK_LABEL: Record<EventBlockKind, string> = {
  prose: 'Paragraphe',
  list: 'Liste à puces',
  sections: 'Sous-sections',
  timeline: 'Calendrier (jalons)',
  callout: 'Encart',
  cta: 'Bouton d’action',
  videos: 'Vidéos',
  image: 'Image',
};

export const EVENT_BLOCK_KINDS = Object.keys(EVENT_BLOCK_LABEL) as EventBlockKind[];

/** Bloc vierge du genre demandé, sa clé `title` posée quand le modèle en a une. */
export function newEventBlock(kind: EventBlockKind): EventBlock {
  switch (kind) {
    case 'prose':
    case 'callout':
      return { kind, title: {}, text: {} };
    case 'list':
      return { kind, title: {}, items: [{}] };
    case 'sections':
      return { kind, title: {}, items: [{ title: {}, text: {} }] };
    case 'timeline':
      return { kind, title: {} };
    case 'cta':
      return { kind, label: {}, href: '' };
    case 'videos':
      return { kind, title: {}, entries: [{ platform: 'youtube', id: '', title: '' }] };
    case 'image':
      return { kind, src: '' };
  }
}

/**
 * Un événement neuf, le squelette de l'admin : communautaire, brouillon, un
 * paragraphe vide, du jour `day` (AAAA-MM-JJ, UTC) au soir même.
 */
export function newEvent(day: string): EventEntry {
  return {
    slug: '',
    type: 'community',
    title: {},
    start: `${day}T00:00:00Z`,
    end: `${day}T23:59:00Z`,
    blocks: [newEventBlock('prose')],
    draft: true,
  };
}

/** Les sous-onglets d'un événement, là où un refus se pose. */
export type EventTab = 'meta' | 'phases' | 'blocks';

/** Un refus de `validateEvents`, situé : l'événement, l'onglet, le bloc, l'entrée (tous à partir de 0). */
export interface EventIssue {
  /** Le rang de l'événement dans la liste envoyée ; `null` si le message ne le dit pas. */
  index: number | null;
  tab: EventTab;
  /** Le bloc fautif (onglet Blocs). */
  block?: number;
  /** La puce, la sous-section, la vidéo du bloc — ou le jalon (onglet Jalons). */
  entry?: number;
  message: string;
}

const AT_RE =
  /^Événement (\d+) \([^)]*\)(?:, jalon (\d+))?(?:, bloc (\d+) \([a-z]+\))?(?:, (?:puce|sous-section|vidéo) (\d+))? : /;

/** Lit la position que porte un message de `validateEvents` ; un message étranger va à Méta, sans rang. */
export function locateEventError(error: string): EventIssue {
  const m = AT_RE.exec(error);
  if (!m) return { index: null, tab: 'meta', message: error };
  const [, event, phase, block, entry] = m;
  const issue: EventIssue = { index: Number(event) - 1, tab: 'meta', message: error };
  if (phase) {
    issue.tab = 'phases';
    issue.entry = Number(phase) - 1;
  } else if (block) {
    issue.tab = 'blocks';
    issue.block = Number(block) - 1;
    if (entry) issue.entry = Number(entry) - 1;
  }
  return issue;
}
