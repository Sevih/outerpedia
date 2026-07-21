'use client';

/**
 * Éditeur des ÉVÉNEMENTS communautaires (`/admin/tools/events`).
 *
 * Maître/détail : la colonne de gauche liste les événements (statut dérivé des
 * dates), la droite édite celui qui est sélectionné — métadonnées, jalons, puis
 * les BLOCS de contenu (ajouter / monter / descendre / supprimer).
 *
 * Une seule langue à la fois (comme les autres éditeurs V3) : l'ANGLAIS est la
 * source, les autres langues se remplissent au bouton « Traduire » (DeepL puis
 * Haiku). Conséquence assumée : la STRUCTURE (nombre de puces, de vidéos, de
 * jalons) ne se modifie qu'en anglais — sinon une traduction en cours pourrait
 * amputer la liste partagée par toutes les langues.
 *
 * Les dates sont saisies en UTC, en deux champs (jour + heure) : le jeu et le
 * site raisonnent en UTC, et `datetime-local` aurait converti dans le fuseau du
 * navigateur sans le dire.
 */
import { useState } from 'react';
import type { LocalizedText } from '@contracts';
import { LANGS, LANGUAGES, type Lang } from '@/lib/i18n/config';
import { postJson } from '@/lib/admin/post-json';
import { rowKey, stripKey } from '@/lib/admin/keyed';
import { autoTranslate } from '@/lib/admin/translate-actions';
import {
  EVENT_TYPES,
  EVENT_VIDEO_PLATFORMS,
  eventStatus,
  type EventBlock,
  type EventBlockKind,
  type EventEntry,
  type EventType,
  type EventVideoPlatform,
} from '@/lib/data/events';

const input =
  'rounded-md border border-line bg-surface-base px-2 py-1 text-sm text-content focus:border-accent focus:outline-none';
const btn = 'rounded-md border border-line px-2.5 py-1 text-xs hover:border-accent';

type Row = EventEntry & { _key: string };
type Status = { kind: 'idle' | 'ok' | 'err'; msg?: string };

const TYPE_LABEL: Record<EventType, string> = {
  tournament: 'Tournoi',
  contest: 'Concours',
  community: 'Communauté',
};

const BLOCK_LABEL: Record<EventBlockKind, string> = {
  prose: 'Paragraphe',
  list: 'Liste à puces',
  sections: 'Sous-sections',
  timeline: 'Calendrier (jalons)',
  callout: 'Encart',
  cta: 'Bouton d’action',
  videos: 'Vidéos',
  image: 'Image',
};

const BLOCK_KINDS = Object.keys(BLOCK_LABEL) as EventBlockKind[];

/** Bloc vierge du type demandé. */
function emptyBlock(kind: EventBlockKind): EventBlock {
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

function UtcDate({
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

function LocalField({
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

/* --- Collecte des textes à traduire ---------------------------------------- */

/**
 * Toutes les valeurs localisées d'un événement, PAR RÉFÉRENCE : l'appelant
 * travaille sur une copie profonde et remplit les champs en place.
 */
function collectTexts(e: EventEntry): LocalizedText[] {
  const out: LocalizedText[] = [e.title];
  if (e.summary) out.push(e.summary);
  for (const p of e.phases ?? []) out.push(p.label);
  for (const b of e.blocks) {
    if ('title' in b && b.title) out.push(b.title);
    switch (b.kind) {
      case 'prose':
      case 'callout':
        out.push(b.text);
        break;
      case 'list':
        out.push(...b.items);
        break;
      case 'sections':
        for (const s of b.items) out.push(s.title, s.text);
        break;
      case 'cta':
        out.push(b.label);
        if (b.note) out.push(b.note);
        break;
      case 'videos':
        for (const v of b.entries) if (v.featured) out.push(v.featured);
        break;
      case 'image':
        if (b.alt) out.push(b.alt);
        if (b.caption) out.push(b.caption);
        break;
      case 'timeline':
        break;
    }
  }
  return out;
}

/* --- Éditeur d'un bloc ------------------------------------------------------ */

function BlockEditor({
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

export function EventsEditor({ initial }: { initial: EventEntry[] }) {
  const [rows, setRows] = useState<Row[]>(() => initial.map((e) => ({ ...e, _key: rowKey() })));
  const [selected, setSelected] = useState<string | null>(() => (initial.length ? null : null));
  const [lang, setLang] = useState<Lang>('en');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [busy, setBusy] = useState(false);

  // Figé au montage : le statut affiché dans la liste n'a pas à bouger sous les
  // doigts pendant une session d'édition (et `Date.now()` en rendu est impur).
  const [now] = useState(() => Date.now());
  const current = rows.find((r) => r._key === selected);
  const isEn = lang === 'en';

  const update = (patch: Partial<EventEntry>) =>
    setRows((s) => s.map((r) => (r._key === selected ? { ...r, ...patch } : r)));

  function addEvent() {
    const key = rowKey();
    const day = new Date().toISOString().slice(0, 10);
    setRows((s) => [
      ...s,
      {
        _key: key,
        slug: '',
        type: 'community',
        title: {},
        start: `${day}T00:00:00Z`,
        end: `${day}T23:59:00Z`,
        blocks: [emptyBlock('prose')],
        draft: true,
      },
    ]);
    setSelected(key);
  }

  function removeEvent(key: string) {
    setRows((s) => s.filter((r) => r._key !== key));
    if (selected === key) setSelected(null);
  }

  /* Blocs */
  const setBlock = (i: number, next: EventBlock) =>
    update({ blocks: (current?.blocks ?? []).map((b, j) => (j === i ? next : b)) });
  const moveBlock = (i: number, dir: -1 | 1) => {
    const blocks = [...(current?.blocks ?? [])];
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    update({ blocks });
  };

  /* Traduction de l'événement courant */
  async function translate() {
    if (!current) return;
    setBusy(true);
    setStatus({ kind: 'idle' });
    try {
      const clone = structuredClone({ ...current }) as Row;
      const texts = collectTexts(clone).filter((t) => t.en?.trim());
      if (!texts.length) {
        setStatus({ kind: 'err', msg: 'Rien à traduire (aucun texte EN).' });
        return;
      }
      const targets = LANGS.filter((l) => l !== 'en');
      const { results, provider } = await autoTranslate(
        texts.map((t) => t.en!),
        targets,
      );
      let filled = 0;
      texts.forEach((rec, k) => {
        const tr = results[k] ?? {};
        for (const l of targets) {
          if (tr[l] && !rec[l]?.trim()) {
            rec[l] = tr[l];
            filled++;
          }
        }
      });
      setRows((s) => s.map((r) => (r._key === selected ? clone : r)));
      setStatus({
        kind: 'ok',
        msg: filled
          ? `${filled} champ(s) traduits via ${provider} — à relire avant d'enregistrer.`
          : 'Toutes les langues cibles étaient déjà remplies.',
      });
    } catch (e) {
      setStatus({ kind: 'err', msg: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    setStatus({ kind: 'idle' });
    try {
      const payload = rows.map(stripKey);
      const res = await postJson<{ ok: boolean; publish?: { ok: boolean; error?: string } }>(
        '/api/admin/curated/events',
        payload,
      );
      const warn = res.publish?.error;
      setStatus({ kind: 'ok', msg: warn ? `Enregistré — ${warn}` : 'Enregistré et publié' });
    } catch (e) {
      setStatus({ kind: 'err', msg: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-line-subtle bg-surface-base sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b py-2">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="bg-accent text-accent-fg rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          Enregistrer
        </button>
        <button type="button" className={btn} onClick={translate} disabled={busy || !current}>
          Traduire cet événement
        </button>
        {status.kind === 'ok' && <span className="text-success text-sm">{status.msg}</span>}
        {status.kind === 'err' && <span className="text-danger text-sm">{status.msg}</span>}
        <div className="ml-auto flex items-center gap-1">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`rounded-md px-2 py-1 font-mono text-xs ${
                l === lang ? 'bg-accent text-accent-fg' : 'border-line text-content-subtle border'
              }`}
            >
              {LANGUAGES[l].abbrev}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
        {/* Liste */}
        <div className="space-y-2">
          <button type="button" className={btn} onClick={addEvent}>
            + Nouvel événement
          </button>
          <ul className="space-y-1">
            {rows.map((r) => {
              const st = eventStatus(r, now);
              return (
                <li key={r._key}>
                  <button
                    type="button"
                    onClick={() => setSelected(r._key)}
                    className={`w-full rounded-md border px-2 py-1.5 text-left text-sm ${
                      r._key === selected
                        ? 'border-accent bg-accent/10'
                        : 'border-line-subtle hover:border-line'
                    }`}
                  >
                    <span className="text-content-strong block truncate">
                      {r.title.en || r.slug || '(sans titre)'}
                    </span>
                    <span className="text-content-subtle text-[11px]">
                      {st}
                      {r.draft ? ' · brouillon' : ''}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Détail */}
        {!current ? (
          <p className="text-content-subtle text-sm">
            Sélectionne un événement, ou crée-en un nouveau.
          </p>
        ) : (
          <div className="space-y-5">
            {/* Métadonnées */}
            <section className="border-line-subtle space-y-2 rounded-lg border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  className={`${input} w-56 font-mono`}
                  value={current.slug}
                  placeholder="slug-url"
                  onChange={(e) => update({ slug: e.target.value })}
                />
                <select
                  className={input}
                  value={current.type}
                  onChange={(e) => update({ type: e.target.value as EventType })}
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABEL[t]}
                    </option>
                  ))}
                </select>
                <label className="text-content-subtle flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={current.draft ?? false}
                    onChange={(e) => update({ draft: e.target.checked })}
                  />
                  brouillon (jamais publié)
                </label>
                <label
                  className="text-content-subtle flex items-center gap-1 text-xs"
                  title="Par défaut, un événement pas encore démarré est un TEASER : on annonce sa famille et sa date, rien d'autre ne quitte le serveur."
                >
                  <input
                    type="checkbox"
                    checked={current.revealEarly ?? false}
                    onChange={(e) => update({ revealEarly: e.target.checked })}
                  />
                  dévoiler le contenu avant le début
                </label>
                <button
                  type="button"
                  className="text-danger ml-auto text-sm"
                  onClick={() => removeEvent(current._key)}
                  aria-label="Supprimer l'événement"
                >
                  ✕
                </button>
              </div>
              <LocalField
                label="Titre"
                required
                lang={lang}
                value={current.title}
                onChange={(title) => update({ title })}
              />
              <LocalField
                label="Résumé"
                multiline
                lang={lang}
                value={current.summary}
                onChange={(summary) => update({ summary })}
                placeholder="Affiché sur la carte de liste et en meta description"
              />
              <div className="flex flex-wrap items-center gap-4">
                <UtcDate
                  label="Début"
                  value={current.start}
                  onChange={(start) => update({ start })}
                />
                <UtcDate label="Fin" value={current.end} onChange={(end) => update({ end })} />
              </div>
              <label className="flex items-center gap-2">
                <span className="text-content-subtle w-20 shrink-0 text-xs">Organisateur</span>
                <input
                  className={`${input} flex-1`}
                  value={current.organizer ?? ''}
                  onChange={(e) => update({ organizer: e.target.value })}
                />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-content-subtle w-20 shrink-0 text-xs">Bannière</span>
                <input
                  className={`${input} flex-1 font-mono`}
                  value={current.cover ?? ''}
                  placeholder="/images/events/<slug>/cover.webp"
                  onChange={(e) => update({ cover: e.target.value })}
                />
              </label>
            </section>

            {/* Jalons */}
            <section className="border-line-subtle space-y-2 rounded-lg border p-3">
              <h2 className="text-content-strong text-sm font-semibold">Calendrier (jalons)</h2>
              {(current.phases ?? []).map((p, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <UtcDate
                    label={`Jalon ${i + 1}`}
                    value={p.until}
                    onChange={(until) =>
                      update({
                        phases: (current.phases ?? []).map((x, j) =>
                          j === i ? { ...x, until } : x,
                        ),
                      })
                    }
                  />
                  <LocalField
                    lang={lang}
                    value={p.label}
                    onChange={(label) =>
                      update({
                        phases: (current.phases ?? []).map((x, j) =>
                          j === i ? { ...x, label } : x,
                        ),
                      })
                    }
                  />
                  {isEn && (
                    <button
                      type="button"
                      className="text-danger text-sm"
                      onClick={() =>
                        update({ phases: (current.phases ?? []).filter((_, j) => j !== i) })
                      }
                      aria-label="Supprimer le jalon"
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
                  onClick={() =>
                    update({ phases: [...(current.phases ?? []), { until: '', label: {} }] })
                  }
                >
                  + jalon
                </button>
              )}
            </section>

            {/* Blocs */}
            <section className="space-y-3">
              <h2 className="text-content-strong text-sm font-semibold">Contenu</h2>
              {current.blocks.map((b, i) => (
                <div key={i} className="border-line-subtle space-y-2 rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-content-subtle text-xs font-semibold uppercase">
                      {BLOCK_LABEL[b.kind]}
                    </span>
                    {isEn && (
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          type="button"
                          className={btn}
                          onClick={() => moveBlock(i, -1)}
                          aria-label="Monter le bloc"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className={btn}
                          onClick={() => moveBlock(i, 1)}
                          aria-label="Descendre le bloc"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="text-danger px-1 text-sm"
                          onClick={() =>
                            update({ blocks: current.blocks.filter((_, j) => j !== i) })
                          }
                          aria-label="Supprimer le bloc"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                  <BlockEditor block={b} lang={lang} onChange={(next) => setBlock(i, next)} />
                </div>
              ))}
              {isEn && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-content-subtle text-xs uppercase">Ajouter un bloc</span>
                  {BLOCK_KINDS.map((k) => (
                    <button
                      key={k}
                      type="button"
                      className={btn}
                      onClick={() => update({ blocks: [...current.blocks, emptyBlock(k)] })}
                    >
                      + {BLOCK_LABEL[k]}
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
