/**
 * Gabarits du journal du site (`/changelog`) — PUR, partagé par quick (onglet
 * « Journal du site ») et, s'il reste, par l'éditeur de l'admin.
 *
 * Constat de Sevih : « on a énormément de messages qui se ressemblent et que
 * l'on pourrait préremplir ». Un gabarit par TYPE d'entrée : son titre et ses
 * puces en ANGLAIS, avec des champs `{nom}` à remplir, la sorte de lien et
 * comment il se déduit. Les autres langues ne sont pas ici — « Traduire » les
 * fait —, sauf le TITRE d'une fiche perso, qui est le nom du perso dans chaque
 * langue du jeu.
 *
 * LES TEXTES VIENNENT DE L'HISTORIQUE (`data/curated/changelog.json`, 150
 * entrées au 08/10/2026), pas d'une invention : la formulation la plus
 * fréquente des douze derniers mois, par type.
 *   - `character` (18 entrées) : « <Perso> has been added to the database with
 *     full skills and stats. » — 8, plus 1 avec « …, stats and exclusive
 *     equipment. » ; le titre est le nom seul sur les 9.
 *   - `guide` (17) : « Dimensional Singularity Strategy Guide vs <Boss>. » — 14,
 *     titre = le boss.
 *   - `update` (30) : « <Guide> <Mode> Guide updated for <Mois AAAA> version. »
 *     — 10 mot pour mot (6 Joint Challenge, 4 Guild Raid), 13 à la casse près
 *     (3 « world boss guide »), 28 dans la famille « updated for <mois> » ;
 *     titre = le guide seul sur 11 de ces 13.
 *   - `feature` (12), `news` (6), `fix` (aucune depuis un an) : aucune
 *     formulation ne revient. Le gabarit ne pose que le type et la sorte de
 *     lien — pour `feature`, `page` (4 des 7 entrées liées), aucun pour les deux
 *     autres.
 *
 * UN CHAMP NON REMPLI RESTE VISIBLE : `fillTemplate` laisse `{guide}` dans le
 * texte, et `unfilledFields` le retrouve — une entrée qui en porte encore un
 * est refusée à l'enregistrement, jamais publiée avec ses accolades.
 */
import { LANGS, type Lang } from '@/lib/i18n/config';
import type { LocalizedText } from '@contracts';
import type { ChangelogEntry, ChangelogLink, ChangelogType } from '@/lib/data/changelog';

/** La sorte de lien d'une entrée ; vide = aucun lien. */
export type ChangelogLinkKind = '' | ChangelogLink['kind'];

/** Les six familles et leur libellé court — ceux de l'éditeur de l'admin. */
export const CHANGELOG_TYPES: readonly { value: ChangelogType; label: string }[] = [
  { value: 'guide', label: 'Guide' },
  { value: 'update', label: 'Mise à jour' },
  { value: 'feature', label: 'Page / outil' },
  { value: 'character', label: 'Perso' },
  { value: 'news', label: 'News' },
  { value: 'fix', label: 'Correctif' },
];

/** Les sortes de lien et ce que leur valeur est — ceux de l'éditeur de l'admin. */
export const CHANGELOG_LINK_KINDS: readonly { value: ChangelogLinkKind; label: string }[] = [
  { value: '', label: 'aucun lien' },
  { value: 'character', label: 'perso (slug)' },
  { value: 'guide', label: 'guide (chemin)' },
  { value: 'tool', label: 'outil (chemin)' },
  { value: 'page', label: 'page (chemin)' },
];

/** Un choix d'un champ `choice` : sa valeur, et les champs qu'il pose avec lui. */
export interface TemplateOption {
  value: string;
  /** Ce que le menu montre ; la valeur, à défaut. */
  label?: string;
  /** Champs DÉDUITS du choix (le dossier des guides d'un mode de jeu). */
  set?: Record<string, string>;
}

/**
 * Un champ à remplir avant de poser l'entrée :
 *   - `text`      : saisi ;
 *   - `choice`    : pris dans `options`, la première d'office ;
 *   - `month`     : saisi, prérempli du mois courant (« October 2026 ») ;
 *   - `character` : un perso du roster — l'appelant en tire le nom par langue,
 *     le slug, et la présence d'un équipement exclusif.
 */
export interface TemplateField {
  key: string;
  label: string;
  kind: 'text' | 'choice' | 'month' | 'character';
  options?: readonly TemplateOption[];
  placeholder?: string;
}

export interface ChangelogTemplate {
  id: string;
  /** Le libellé du bouton. */
  label: string;
  type: ChangelogType;
  /** Titre EN, champs compris. */
  title: string;
  /** Puces EN, champs compris. */
  content: readonly string[];
  /** La sorte de lien, et sa valeur avec ses champs (slug du perso, chemin du guide). */
  link: { kind: ChangelogLinkKind; value: string };
  fields: readonly TemplateField[];
}

/** Ce que dit la puce d'une fiche perso, selon que son équipement exclusif est là. */
export const CHARACTER_SCOPE = {
  base: 'skills and stats',
  ee: 'skills, stats and exclusive equipment',
} as const;

/** Dans l'ordre des boutons de quick ; « Manuel » est l'entrée vierge. */
export const CHANGELOG_TEMPLATES: readonly ChangelogTemplate[] = [
  {
    id: 'character',
    label: 'Perso',
    type: 'character',
    title: '{name}',
    content: ['{name} has been added to the database with full {scope}.'],
    link: { kind: 'character', value: '{slug}' },
    fields: [
      { key: 'name', label: 'Perso', kind: 'character', placeholder: 'Chercher un perso…' },
      {
        key: 'scope',
        label: 'Fiche',
        kind: 'choice',
        options: [
          { value: CHARACTER_SCOPE.base, label: 'skills et stats' },
          { value: CHARACTER_SCOPE.ee, label: 'avec équipement exclusif' },
        ],
      },
    ],
  },
  {
    id: 'guide',
    label: 'Guide',
    type: 'guide',
    title: '{guide}',
    content: ['Dimensional Singularity Strategy Guide vs {guide}.'],
    link: { kind: 'guide', value: '/guides/dimensional-singularity/{slug}' },
    fields: [
      { key: 'guide', label: 'Boss', kind: 'text', placeholder: 'Chimera' },
      { key: 'slug', label: 'Slug du guide', kind: 'text', placeholder: 'chimera' },
    ],
  },
  {
    id: 'update',
    label: 'Mise à jour',
    type: 'update',
    title: '{guide}',
    content: ['{guide} {mode} Guide updated for {month} version.'],
    link: { kind: 'guide', value: '/guides/{category}/{slug}' },
    fields: [
      { key: 'guide', label: 'Guide', kind: 'text', placeholder: 'Annihilator' },
      {
        key: 'mode',
        label: 'Mode',
        kind: 'choice',
        options: [
          { value: 'Joint Challenge', set: { category: 'joint-challenge' } },
          { value: 'Guild Raid', set: { category: 'guild-raid' } },
          { value: 'World Boss', set: { category: 'world-boss' } },
        ],
      },
      { key: 'month', label: 'Mois', kind: 'month' },
      { key: 'slug', label: 'Slug du guide', kind: 'text', placeholder: 'annihilator' },
    ],
  },
  {
    id: 'feature',
    label: 'Page / outil',
    type: 'feature',
    title: '',
    content: [],
    link: { kind: 'page', value: '' },
    fields: [],
  },
  {
    id: 'news',
    label: 'News',
    type: 'news',
    title: '',
    content: [],
    link: { kind: '', value: '' },
    fields: [],
  },
  {
    id: 'fix',
    label: 'Correctif',
    type: 'fix',
    title: '',
    content: [],
    link: { kind: '', value: '' },
    fields: [],
  },
  {
    // Le type d'office de l'éditeur de l'admin pour une entrée vierge.
    id: 'manual',
    label: 'Manuel',
    type: 'guide',
    title: '',
    content: [],
    link: { kind: '', value: '' },
    fields: [],
  },
];

/** Un champ dans un texte : `{guide}`. Des minuscules seules — c'est un nom de champ. */
const FIELD = /\{([a-z]+)\}/g;
/** Le même, sans état (`test` sur un motif global avance son curseur). */
const HAS_FIELD = /\{[a-z]+\}/;

/** Le mois d'un jour ISO, comme l'historique l'écrit : « October 2026 ». */
export function monthLabel(day: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${day.slice(0, 10)}T00:00:00Z`));
}

/**
 * Les valeurs d'office d'un gabarit au jour `today` : le premier choix d'un
 * `choice`, le mois courant d'un `month`. Ce que le formulaire de quick montre
 * prérempli, et ce que `fillTemplate` reçoit quand rien n'est saisi.
 */
export function templateDefaults(
  template: ChangelogTemplate,
  today: string,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of template.fields) {
    if (f.kind === 'choice' && f.options?.[0]) out[f.key] = f.options[0].value;
    if (f.kind === 'month') out[f.key] = monthLabel(today);
  }
  return out;
}

/** Une valeur de champ : un texte, ou un texte par langue (le nom d'un perso). */
export type TemplateValue = string | LocalizedText;
export type TemplateValues = Readonly<Record<string, TemplateValue | undefined>>;

/** Un gabarit rempli : de quoi poser une entrée. */
export interface FilledTemplate {
  type: ChangelogType;
  /** L'anglais toujours ; les autres langues quand le titre porte un champ localisé. */
  title: LocalizedText;
  /** Puces EN — « Traduire » fait le reste. */
  content: string[];
  link: { kind: ChangelogLinkKind; value: string };
}

/**
 * Remplit un gabarit. Chaque `{champ}` prend sa valeur ; un champ SANS valeur
 * (absent, vide, ou des espaces) reste écrit tel quel — visible, et refusé plus
 * tard par `unfilledFields`. Le choix d'un `choice` pose aussi ses champs
 * déduits (`set`), sauf ceux que `values` donne déjà.
 *
 * Une valeur LOCALISÉE (le nom d'un perso) donne un titre par langue : chaque
 * langue où le titre se remplit entièrement en porte un. Les puces et le lien
 * prennent l'anglais.
 */
export function fillTemplate(template: ChangelogTemplate, values: TemplateValues): FilledTemplate {
  const all: Record<string, TemplateValue | undefined> = { ...values };
  for (const f of template.fields) {
    const chosen = all[f.key];
    const option = f.options?.find((o) => o.value === chosen);
    for (const [key, value] of Object.entries(option?.set ?? {})) all[key] ??= value;
  }

  const valueIn = (key: string, lang: Lang): string => {
    const v = all[key];
    return (typeof v === 'string' ? v : (v?.[lang] ?? '')).trim();
  };
  const fill = (text: string, lang: Lang): string =>
    text.replace(FIELD, (raw, key: string) => valueIn(key, lang) || raw);

  const title: LocalizedText = {};
  const en = fill(template.title, 'en');
  if (en) title.en = en;
  const localized = [...template.title.matchAll(FIELD)].some((m) => typeof all[m[1]] === 'object');
  if (localized)
    for (const lang of LANGS) {
      if (lang === 'en') continue;
      const text = fill(template.title, lang);
      // Un nom absent dans cette langue laisserait le champ écrit : pas de titre,
      // le site se replie sur l'anglais.
      if (text && !HAS_FIELD.test(text)) title[lang] = text;
    }

  return {
    type: template.type,
    title,
    content: template.content.map((line) => fill(line, 'en')),
    link: { kind: template.link.kind, value: fill(template.link.value, 'en') },
  };
}

/**
 * Les champs de gabarit encore écrits dans une entrée — titres, puces, lien —,
 * une fois chacun, dans l'ordre de rencontre. Vide = l'entrée est remplie.
 */
export function unfilledFields(
  entry: Pick<ChangelogEntry, 'title' | 'content' | 'link'>,
): string[] {
  const texts = [
    ...Object.values(entry.title ?? {}),
    ...Object.values(entry.content ?? {}).flat(),
    entry.link ? (entry.link.kind === 'character' ? entry.link.slug : entry.link.href) : '',
  ];
  const found = new Set<string>();
  for (const text of texts) for (const m of String(text ?? '').matchAll(FIELD)) found.add(m[1]);
  return [...found];
}
