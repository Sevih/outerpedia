'use client';

/**
 * Éditeur des ÉVÉNEMENTS communautaires (`/admin/tools/events`).
 *
 * Maître/détail : la colonne de gauche liste les événements (statut dérivé des
 * dates), la droite édite celui qui est sélectionné — métadonnées, jalons, puis
 * les BLOCS de contenu (ajouter / monter / descendre / supprimer).
 *
 * Une seule langue à la fois (comme les autres éditeurs) : l'ANGLAIS est la
 * source, les autres langues se REGÉNÈRENT au bouton « Traduire » (DeepL puis
 * Haiku). Conséquence assumée : la STRUCTURE (nombre de puces, de vidéos, de
 * jalons) ne se modifie qu'en anglais — sinon une traduction en cours pourrait
 * amputer la liste partagée par toutes les langues.
 *
 * Les dates sont saisies en UTC, en deux champs (jour + heure) : le jeu et le
 * site raisonnent en UTC, et `datetime-local` aurait converti dans le fuseau du
 * navigateur sans le dire.
 */
import { useState } from 'react';
import { LANGS, LANGUAGES, type Lang } from '@/lib/i18n/config';
import { postJson } from '@/lib/admin/post-json';
import { rowKey, stripKey } from '@/lib/admin/keyed';
import { autoTranslate } from '@/lib/admin/translate-actions';
import { applyTranslation, createFreshness } from '@/lib/admin/translate-fill';
import { TRANSLATE_MSG } from '@/lib/admin/useAutoTranslate';
import {
  EVENT_TYPES,
  eventStatus,
  type EventBlock,
  type EventEntry,
  type EventType,
} from '@/lib/data/events';

import {
  input,
  btn,
  TYPE_LABEL,
  BLOCK_LABEL,
  BLOCK_KINDS,
  emptyBlock,
  UtcDate,
  LocalField,
  BlockEditor,
} from '@/components/admin/events/EventBlocks';
import { collectTexts } from '@/components/admin/events/event-text';
import { moveItem } from '@/lib/admin/reorder';
import { MoveButtons } from '@/components/admin/MoveButtons';

type Row = EventEntry & { _key: string };
type Status = { kind: 'idle' | 'ok' | 'err'; msg?: string };

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
  // Photo des EN au chargement : référence de ce qui est « déjà traduit ».
  const [freshness] = useState(() =>
    createFreshness(initial.flatMap((e) => collectTexts(e).map((t) => t.en))),
  );
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
  // Échange DÉLÉGUÉ (`lib/admin/reorder`) : la garde des extrémités s'écrivait ici
  // et une seconde fois dans les priorités de pull — deux copies qui ne divergent
  // que sur le cas limite, celui qui fabrique un `undefined` dans la liste.
  const moveBlock = (i: number, dir: -1 | 1) =>
    update({ blocks: [...moveItem(current?.blocks ?? [], i, dir)] });

  /* Traduction de l'événement courant */
  async function translate() {
    if (!current) return;
    setBusy(true);
    setStatus({ kind: 'idle' });
    try {
      const clone = structuredClone({ ...current }) as Row;
      const targets = LANGS.filter((l) => l !== 'en');
      // On n'envoie que ce qui a BOUGÉ (EN édité/ajouté) ou à qui il manque une
      // langue — inutile de repayer DeepL pour l'identique.
      const texts = collectTexts(clone).filter((t) => freshness.isStale(t, targets));
      if (!texts.length) {
        setStatus({ kind: 'err', msg: TRANSLATE_MSG.nothingStale });
        return;
      }
      const { results, provider } = await autoTranslate(
        texts.map((t) => t.en!),
        targets,
      );
      let filled = 0;
      texts.forEach((rec, k) => {
        filled += applyTranslation(rec, results[k] ?? {}, targets);
        freshness.markFresh(rec);
      });
      setRows((s) => s.map((r) => (r._key === selected ? clone : r)));
      setStatus({
        kind: 'ok',
        msg: filled ? TRANSLATE_MSG.filled(filled, provider) : TRANSLATE_MSG.noChange,
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
        <button
          type="button"
          className={btn}
          onClick={translate}
          disabled={busy || !current}
          title="Regénère toutes les autres langues depuis l'anglais — les traductions existantes sont écrasées"
        >
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
                        <MoveButtons
                          index={i}
                          count={current.blocks.length}
                          onMove={(dir) => moveBlock(i, dir)}
                          what="block"
                        />
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
