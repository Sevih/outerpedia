'use client';

/**
 * Briques d'édition des ÉVÉNEMENTS (audit F9) — sorties de `EventsEditor`, qui
 * approchait 900 lignes dont 286 pour le seul `BlockEditor`.
 *
 * ⚠ CE DÉCOUPAGE EST UNE PROTECTION, pas seulement du rangement. Ces composants
 * DOIVENT vivre au niveau module : déclarés dans le corps de l'éditeur, leur
 * identité change à chaque rendu et React démonte puis remonte tout leur
 * sous-arbre à CHAQUE frappe — les champs perdent le focus. C'est le bug vécu le
 * 24/07 ailleurs dans l'admin, et la surface que F9 visait à réduire.
 *
 * Les dates sont saisies en UTC en DEUX champs (jour + heure) : le jeu et le site
 * raisonnent en UTC, et `datetime-local` aurait converti dans le fuseau du
 * navigateur sans le dire.
 */
import type { LocalizedText } from '@contracts';
import { LANGUAGES, type Lang } from '@/lib/i18n/config';
import {
  EVENT_VIDEO_PLATFORMS,
  type EventBlock,
  type EventBlockKind,
  type EventType,
  type EventVideoPlatform,
} from '@/lib/data/events';

export const input =
  'rounded-md border border-line bg-surface-base px-2 py-1 text-sm text-content focus:border-accent focus:outline-none';
export const btn = 'rounded-md border border-line px-2.5 py-1 text-xs hover:border-accent';

export const TYPE_LABEL: Record<EventType, string> = {
  tournament: 'Tournoi',
  contest: 'Concours',
  community: 'Communauté',
};

export const BLOCK_LABEL: Record<EventBlockKind, string> = {
  prose: 'Paragraphe',
  list: 'Liste à puces',
  sections: 'Sous-sections',
  timeline: 'Calendrier (jalons)',
  callout: 'Encart',
  cta: 'Bouton d’action',
  videos: 'Vidéos',
  image: 'Image',
};

export const BLOCK_KINDS = Object.keys(BLOCK_LABEL) as EventBlockKind[];

/** Bloc vierge du type demandé. */
export function emptyBlock(kind: EventBlockKind): EventBlock {
  switch (kind) {
    case 'prose':
      return { kind, text: {} };
    case 'callout':
      return { kind, text: {} };
    case 'list':
      return { kind, items: [{}] };
    case 'sections':
      return { kind, items: [{ title: {}, text: {} }] };
    case 'timeline':
      return { kind };
    case 'cta':
      return { kind, label: {}, href: '' };
    case 'videos':
      return { kind, entries: [{ platform: 'youtube', id: '', title: '' }] };
    case 'image':
      return { kind, src: '' };
  }
}

/* --- Dates UTC : ISO ⇄ (jour, heure) --------------------------------------- */

const splitIso = (iso: string | undefined): [string, string] => {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(iso ?? '');
  return m ? [m[1], m[2]] : ['', ''];
};
const joinIso = (day: string, time: string): string => (day ? `${day}T${time || '00:00'}:00Z` : '');

export function UtcDate({
  value,
  onChange,
  label,
}: {
  value: string | undefined;
  onChange: (iso: string) => void;
  label: string;
}) {
  const [day, time] = splitIso(value);
  return (
    <label className="flex items-center gap-2">
      <span className="text-content-subtle w-20 shrink-0 text-xs">{label}</span>
      <input
        type="date"
        className={input}
        value={day}
        onChange={(e) => onChange(joinIso(e.target.value, time))}
      />
      <input
        type="time"
        className={input}
        value={time}
        onChange={(e) => onChange(joinIso(day, e.target.value))}
      />
      <span className="text-content-subtle text-[10px]">UTC</span>
    </label>
  );
}

/* --- Champs localisés ------------------------------------------------------- */

export function LocalField({
  value,
  onChange,
  lang,
  label,
  required,
  multiline,
  placeholder,
}: {
  value: LocalizedText | undefined;
  onChange: (next: LocalizedText) => void;
  lang: Lang;
  label?: string;
  required?: boolean;
  multiline?: boolean;
  placeholder?: string;
}) {
  const set = (v: string) => onChange({ ...(value ?? {}), [lang]: v });
  const common = {
    className: `${input} flex-1`,
    value: value?.[lang] ?? '',
    placeholder: placeholder ?? (lang === 'en' ? 'Texte EN' : LANGUAGES[lang].abbrev),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(e.target.value),
  };
  return (
    <div className="flex items-start gap-2">
      {label && (
        <span className="text-content-subtle w-24 shrink-0 pt-1 text-xs">
          {label} {required && lang === 'en' && <span className="text-danger">*</span>}
        </span>
      )}
      {multiline ? (
        <textarea {...common} className={`${input} min-h-20 flex-1`} />
      ) : (
        <input {...common} />
      )}
    </div>
  );
}

/* --- Éditeur d'un bloc ------------------------------------------------------ */

export function BlockEditor({
  block,
  lang,
  onChange,
}: {
  block: EventBlock;
  lang: Lang;
  onChange: (next: EventBlock) => void;
}) {
  const isEn = lang === 'en';
  const patch = (p: Partial<EventBlock>) => onChange({ ...block, ...p } as EventBlock);
  const titled = 'title' in block;

  return (
    <div className="space-y-2">
      {titled && (
        <LocalField
          label="Titre"
          lang={lang}
          value={block.title}
          onChange={(title) => patch({ title } as Partial<EventBlock>)}
          placeholder="Titre de section (facultatif)"
        />
      )}

      {(block.kind === 'prose' || block.kind === 'callout') && (
        <LocalField
          label="Texte"
          required
          multiline
          lang={lang}
          value={block.text}
          onChange={(text) => patch({ text } as Partial<EventBlock>)}
        />
      )}

      {block.kind === 'list' && (
        <div className="space-y-1.5">
          {block.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <LocalField
                lang={lang}
                value={item}
                onChange={(v) =>
                  onChange({ ...block, items: block.items.map((x, j) => (j === i ? v : x)) })
                }
              />
              {isEn && (
                <button
                  type="button"
                  className="text-danger text-sm"
                  onClick={() =>
                    onChange({ ...block, items: block.items.filter((_, j) => j !== i) })
                  }
                  aria-label="Supprimer la puce"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {isEn && (
            <button
              type="button"
              className={btn}
              onClick={() => onChange({ ...block, items: [...block.items, {}] })}
            >
              + puce
            </button>
          )}
        </div>
      )}

      {block.kind === 'sections' && (
        <div className="space-y-2">
          {block.items.map((s, i) => (
            <div key={i} className="border-line-subtle space-y-1.5 rounded-md border p-2">
              <div className="flex items-center gap-2">
                <LocalField
                  label="Sous-titre"
                  required
                  lang={lang}
                  value={s.title}
                  onChange={(title) =>
                    onChange({
                      ...block,
                      items: block.items.map((x, j) => (j === i ? { ...x, title } : x)),
                    })
                  }
                />
                {isEn && (
                  <button
                    type="button"
                    className="text-danger text-sm"
                    onClick={() =>
                      onChange({ ...block, items: block.items.filter((_, j) => j !== i) })
                    }
                    aria-label="Supprimer la sous-section"
                  >
                    ✕
                  </button>
                )}
              </div>
              <LocalField
                label="Texte"
                required
                multiline
                lang={lang}
                value={s.text}
                onChange={(text) =>
                  onChange({
                    ...block,
                    items: block.items.map((x, j) => (j === i ? { ...x, text } : x)),
                  })
                }
              />
            </div>
          ))}
          {isEn && (
            <button
              type="button"
              className={btn}
              onClick={() =>
                onChange({ ...block, items: [...block.items, { title: {}, text: {} }] })
              }
            >
              + sous-section
            </button>
          )}
        </div>
      )}

      {block.kind === 'timeline' && (
        <p className="text-content-subtle text-xs">
          Rend les jalons saisis plus haut (section « Calendrier ») — rien à saisir ici.
        </p>
      )}

      {block.kind === 'cta' && (
        <>
          <LocalField
            label="Libellé"
            required
            lang={lang}
            value={block.label}
            onChange={(label) => onChange({ ...block, label })}
          />
          <label className="flex items-center gap-2">
            <span className="text-content-subtle w-24 shrink-0 text-xs">
              URL <span className="text-danger">*</span>
            </span>
            <input
              className={`${input} flex-1 font-mono`}
              value={block.href}
              placeholder="https://forms.gle/…"
              onChange={(e) => onChange({ ...block, href: e.target.value })}
            />
          </label>
          <LocalField
            label="Note"
            lang={lang}
            value={block.note}
            onChange={(note) => onChange({ ...block, note })}
          />
        </>
      )}

      {block.kind === 'videos' && (
        <div className="space-y-2">
          {block.entries.map((v, i) => {
            const setEntry = (p: Partial<(typeof block.entries)[number]>) =>
              onChange({
                ...block,
                entries: block.entries.map((x, j) => (j === i ? { ...x, ...p } : x)),
              });
            return (
              <div key={i} className="border-line-subtle space-y-1.5 rounded-md border p-2">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className={input}
                    value={v.platform}
                    disabled={!isEn}
                    onChange={(e) => setEntry({ platform: e.target.value as EventVideoPlatform })}
                  >
                    {EVENT_VIDEO_PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <input
                    className={`${input} w-40 font-mono`}
                    value={v.id}
                    placeholder="id de la vidéo"
                    disabled={!isEn}
                    onChange={(e) => setEntry({ id: e.target.value })}
                  />
                  <input
                    className={`${input} w-36`}
                    value={v.author ?? ''}
                    placeholder="auteur"
                    disabled={!isEn}
                    onChange={(e) => setEntry({ author: e.target.value })}
                  />
                  {isEn && (
                    <button
                      type="button"
                      className="text-danger ml-auto text-sm"
                      onClick={() =>
                        onChange({ ...block, entries: block.entries.filter((_, j) => j !== i) })
                      }
                      aria-label="Supprimer la vidéo"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <input
                  className={`${input} w-full`}
                  value={v.title}
                  placeholder="titre de la vidéo"
                  disabled={!isEn}
                  onChange={(e) => setEntry({ title: e.target.value })}
                />
                <LocalField
                  label="Mise en avant"
                  lang={lang}
                  value={v.featured}
                  onChange={(featured) => setEntry({ featured })}
                  placeholder="ex. 1st place — vide = simple vignette"
                />
              </div>
            );
          })}
          {isEn && (
            <button
              type="button"
              className={btn}
              onClick={() =>
                onChange({
                  ...block,
                  entries: [...block.entries, { platform: 'youtube', id: '', title: '' }],
                })
              }
            >
              + vidéo
            </button>
          )}
        </div>
      )}

      {block.kind === 'image' && (
        <>
          <label className="flex items-center gap-2">
            <span className="text-content-subtle w-24 shrink-0 text-xs">
              Chemin R2 <span className="text-danger">*</span>
            </span>
            <input
              className={`${input} flex-1 font-mono`}
              value={block.src}
              placeholder="/images/events/<slug>/visuel.webp"
              onChange={(e) => onChange({ ...block, src: e.target.value })}
            />
          </label>
          <LocalField
            label="Alt"
            lang={lang}
            value={block.alt}
            onChange={(alt) => onChange({ ...block, alt })}
          />
          <LocalField
            label="Légende"
            lang={lang}
            value={block.caption}
            onChange={(caption) => onChange({ ...block, caption })}
          />
        </>
      )}
    </div>
  );
}

/* --- Éditeur principal ------------------------------------------------------ */
