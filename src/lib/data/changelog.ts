/**
 * JOURNAL DU SITE (page `/changelog`) — couche d'accès aux données.
 *
 * Ce n'est PAS le `CHANGELOG.md` du dépôt (journal de dev), ni des patch notes
 * du jeu : c'est ce qu'on publie sur Outerpedia (guides ajoutés/mis à jour,
 * pages, outils, fiches perso, news, correctifs). Donnée RÉDIGÉE À LA MAIN dans
 * le curé `data/curated/changelog.json`, éditée via le panneau admin (pas de
 * datagen). Lecture publique par import statique — comme les coupons.
 *
 * PROGRAMMATION : la `date` sert à la fois d'affichage ET de mise en ligne. Une
 * entrée n'est publique que si sa date est atteinte (UTC) et qu'elle n'est pas
 * un brouillon → on peut pré-rédiger une news (ex. bannière) qui n'apparaîtra
 * qu'à sa date. La page se régénère à la purge de cache de 00:05 UTC, donc une
 * entrée datée du jour bascule pile à ce moment. Le flux RSS applique le même
 * filtre (cf. `src/app/feed/route.ts`).
 */
import type { Lang } from '@/lib/i18n/config';
import type { LocalizedText } from '@contracts';
import rawEntries from '@data/curated/changelog.json';

/** Familles d'entrées du journal (badge + libellé i18n `changelog.type.*`). */
export type ChangelogType = 'guide' | 'update' | 'feature' | 'character' | 'news' | 'fix';

/** Puces localisées : une liste de lignes par langue (repli EN). */
export type LocalizedLines = Partial<Record<Lang, string[]>>;

/**
 * Lien « typé » d'une entrée → un chip fiable côté page. On référence l'entité
 * (slug perso) plutôt qu'une URL brute pour dériver libellé/icône/vignette et
 * survivre à un renommage de route.
 */
export type ChangelogLink =
  | { kind: 'character'; slug: string }
  | { kind: 'guide'; href: string }
  | { kind: 'tool'; href: string }
  | { kind: 'page'; href: string };

/** Forme brute stockée dans le JSON curé. */
export interface ChangelogEntry {
  /** 'YYYY-MM-DD' — affichage ET date de mise en ligne. */
  date: string;
  type: ChangelogType;
  title: LocalizedText;
  content: LocalizedLines;
  link?: ChangelogLink;
  /** Vignette explicite (chemin R2). Sinon : portrait auto si `character`, sinon icône de type. */
  image?: string;
  /** Jamais publiée, quelle que soit la date. */
  draft?: boolean;
}

/** Entrée résolue pour une langue (ce que consomme la page). */
export interface ResolvedChangelogEntry {
  date: string;
  type: ChangelogType;
  title: string;
  content: string[];
  link?: ChangelogLink;
  image?: string;
}

const entries = rawEntries as ChangelogEntry[];

/** Date du jour en UTC, 'YYYY-MM-DD' — borne de publication (aligne sur la purge 00:05 UTC). */
function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function resolveText(map: LocalizedText, lang: Lang): string {
  return map[lang] ?? map.en ?? '';
}

function resolveLines(map: LocalizedLines, lang: Lang): string[] {
  return map[lang] ?? map.en ?? [];
}

/**
 * Entrées du journal résolues pour `lang`, plus récentes d'abord.
 *
 * Par défaut, exclut les entrées PROGRAMMÉES (date future) et les BROUILLONS.
 * `includeScheduled` (vue admin uniquement) renvoie tout. `limit` borne le
 * nombre (section « Recent Updates » de la home).
 */
export function getChangelog(
  lang: Lang,
  options?: { limit?: number; includeScheduled?: boolean },
): ResolvedChangelogEntry[] {
  const today = todayUtc();
  const visible = options?.includeScheduled
    ? entries
    : entries.filter((e) => !e.draft && e.date <= today);
  const sorted = [...visible].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const resolved: ResolvedChangelogEntry[] = sorted.map((e) => ({
    date: e.date,
    type: e.type,
    title: resolveText(e.title, lang),
    content: resolveLines(e.content, lang),
    ...(e.link && { link: e.link }),
    ...(e.image && { image: e.image }),
  }));
  return options?.limit ? resolved.slice(0, options.limit) : resolved;
}
