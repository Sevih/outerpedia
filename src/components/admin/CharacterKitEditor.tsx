'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EffectPillShell } from '@/components/character/EffectChips';
import { renderGameColors } from '@/components/ui/GameText';
import { postJson } from '@/lib/admin/post-json';

/** Une chip AUTO d'une carte (positions « règles pures »), déjà résolue. */
export interface CardChip {
  /** Ref d'identité = `tooltip ?? label` de l'effet (clé de chipHide). */
  ref: string;
  name: string;
  icon?: string;
  isDebuff: boolean;
}

/** Une carte de skill éditable (main, fusion_passive, extra, chaîne, duo). */
export interface KitEditorCard {
  id: string;
  name: string;
  type: string;
  desc?: string;
  iconSrc?: string;
  chips: CardChip[];
}

/** Effet du glossaire proposable en chipAdd. */
export interface EffectOption {
  id: string;
  name: string;
  icon?: string;
  isDebuff: boolean;
  /** Variante indissipable (effet DISTINCT de la version normale). */
  irremovable?: boolean;
  /** Description du jeu (aide-mémoire de curation). */
  desc?: string;
}

/**
 * Éditeur du CÂBLAGE d'affichage d'un kit PERSO, rendu comme l'extracteur
 * (cartes de skills + chips) mais interactif : × masque une chip sur sa carte
 * (chipHide) ; + ajoute un effet du glossaire (chipAdd). Écrit
 * `data/curated/character-skills.json` via l'API dev — présentation seule, la
 * donnée extraite reste fidèle aux tables. Pas de déplacement inter-cartes
 * (chipOwner) : le routage auto d'un perso est déjà déterministe.
 */
export function CharacterKitEditor({
  cards,
  chipHide: initialHide,
  chipAdd: initialAdd,
  catalog,
}: {
  cards: KitEditorCard[];
  /** cardId → refs masquées (état curé actuel). */
  chipHide: Record<string, string[]>;
  /** cardId → réfs tooltip ajoutées (état curé actuel). */
  chipAdd: Record<string, string[]>;
  /** Effets du glossaire (id → méta) pour le bouton + et les réfs actuelles. */
  catalog: Record<string, EffectOption>;
}) {
  const router = useRouter();
  const [hides, setHides] = useState<Record<string, string[]>>(() => ({ ...initialHide }));
  const [adds, setAdds] = useState<Record<string, string[]>>(() => ({ ...initialAdd }));
  const [adding, setAdding] = useState<string | null>(null);
  const [addQuery, setAddQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Modifié ? Comparaison sur la forme normalisée (listes vides écartées).
  const norm = (a: Record<string, string[]>) =>
    JSON.stringify(
      Object.entries(a)
        .filter(([, l]) => l.length)
        .map(([k, l]) => [k, [...l].sort()] as const)
        .sort(([x], [y]) => x.localeCompare(y)),
    );
  const dirty = norm(hides) !== norm(initialHide) || norm(adds) !== norm(initialAdd);

  // Libellés de recherche UNIQUES : des effets DISTINCTS partagent un nom —
  // variante irremovable ou natures opposées. Homonymes suffixés, reliquat de
  // collision porté par l'id (même règle que l'éditeur monstre).
  const options = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of Object.values(catalog)) {
      const k = o.name.toLowerCase();
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    const seen = new Set<string>();
    return Object.values(catalog).map((o) => {
      let label = o.name;
      if ((counts.get(o.name.toLowerCase()) ?? 0) > 1) {
        const tags = [o.irremovable ? 'irremovable' : null, o.isDebuff ? 'debuff' : 'buff'].filter(
          (t): t is string => Boolean(t),
        );
        label = `${o.name} (${tags.join(', ')})`;
      }
      if (seen.has(label.toLowerCase())) label = `${label} [${o.id}]`;
      seen.add(label.toLowerCase());
      return { id: o.id, label };
    });
  }, [catalog]);
  const byName = useMemo(
    () => new Map(options.map((o) => [o.label.toLowerCase(), o.id])),
    [options],
  );

  const hiddenOn = (cardId: string) => hides[cardId] ?? [];
  const isHidden = (cardId: string, ref: string) => hiddenOn(cardId).includes(ref);
  const hideChip = (cardId: string, ref: string) =>
    setHides((prev) => ({ ...prev, [cardId]: [...new Set([...(prev[cardId] ?? []), ref])] }));
  const restoreChip = (cardId: string, ref: string) =>
    setHides((prev) => ({ ...prev, [cardId]: (prev[cardId] ?? []).filter((r) => r !== ref) }));

  const confirmAdd = (cardId: string) => {
    const q = addQuery.trim();
    const id = catalog[q] ? q : byName.get(q.toLowerCase());
    if (!id) {
      setMessage(`“${q}” : effect unknown to the glossary.`);
      return;
    }
    setAdds((prev) => ({ ...prev, [cardId]: [...new Set([...(prev[cardId] ?? []), id])] }));
    setAdding(null);
    setAddQuery('');
    setMessage(null);
  };
  const removeAdd = (cardId: string, ref: string) =>
    setAdds((prev) => ({ ...prev, [cardId]: (prev[cardId] ?? []).filter((r) => r !== ref) }));

  const save = async () => {
    setBusy(true);
    setMessage(null);
    // État COMPLET par carte (idempotent) : listes vides = suppression côté store.
    const chipHide: Record<string, string[]> = {};
    const chipAdd: Record<string, string[]> = {};
    for (const c of cards) {
      chipHide[c.id] = hiddenOn(c.id);
      chipAdd[c.id] = adds[c.id] ?? [];
    }
    try {
      const json = await postJson<{ ok: boolean; errors?: string[] }>(
        '/api/admin/curated/character-skills',
        { cardIds: cards.map((c) => c.id), chipHide, chipAdd },
      );
      if (!json.ok) {
        setMessage(`Error: ${(json.errors ?? ['unknown']).join(' ; ')}`);
        return;
      }
      setMessage('Saved — data/curated/character-skills.json (commit via git).');
      router.refresh();
    } catch (e) {
      setMessage(`Error: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-content-strong text-xs font-semibold uppercase">
          Chip wiring (curated — presentation only)
        </h2>
        <div className="flex items-center gap-3">
          {message && <span className="text-content-subtle text-xs">{message}</span>}
          <button
            type="button"
            onClick={save}
            disabled={busy || !dirty}
            className="bg-accent text-accent-fg rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
      <p className="text-content-subtle text-xs">
        × hides a chip on its card (chipHide) · + adds an effect from the glossary (chipAdd). Since
        auto-routing is deterministic, there is no inter-card moving.
      </p>

      <datalist id="character-kit-effects">
        {options.map((o) => (
          <option key={o.id} value={o.label} />
        ))}
      </datalist>

      {cards.map((card) => {
        const added = adds[card.id] ?? [];
        return (
          <div key={card.id} className="border-line-subtle rounded-lg border p-3">
            <div className="flex items-start gap-2.5">
              {card.iconSrc && (
                <img
                  src={card.iconSrc}
                  alt=""
                  aria-hidden
                  className="h-10 w-10 shrink-0 rounded object-contain"
                  onError={(e) => {
                    e.currentTarget.style.visibility = 'hidden';
                  }}
                  width={40}
                  height={40}
                />
              )}
              <div className="min-w-0">
                <p className="text-content-strong text-sm font-semibold">
                  {card.name || '(no name)'}{' '}
                  <span className="text-content-subtle font-mono text-xs font-normal">
                    {card.id} · {card.type}
                  </span>
                </p>
                {card.desc && (
                  <p className="text-content-subtle text-xs whitespace-pre-line">
                    {renderGameColors(card.desc.replace(/\\n/g, '\n'))}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {card.chips.map((c) =>
                isHidden(card.id, c.ref) ? (
                  <span
                    key={`hidden-${c.ref}`}
                    title={`${c.ref} — hidden here (chipHide)`}
                    className="border-line flex items-center gap-1 rounded-md border border-dashed py-0.5 pr-1 pl-1 opacity-50"
                  >
                    <span className="text-content-subtle text-[11px] font-semibold line-through">
                      {c.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => restoreChip(card.id, c.ref)}
                      title="Restore the chip"
                      className="text-content-subtle hover:text-content ml-0.5 rounded px-0.5 text-[11px] leading-none"
                    >
                      ↺
                    </button>
                  </span>
                ) : (
                  <span key={c.ref} title={c.ref}>
                    <EffectPillShell icon={c.icon} name={c.name} isDebuff={c.isDebuff}>
                      <button
                        type="button"
                        onClick={() => hideChip(card.id, c.ref)}
                        title="Hide on this card (chipHide)"
                        className="ml-0.5 rounded px-0.5 text-[11px] leading-none opacity-60 hover:opacity-100"
                      >
                        ✕
                      </button>
                    </EffectPillShell>
                  </span>
                ),
              )}
              {added.map((ref) => {
                const o = catalog[ref];
                return (
                  <span
                    key={`add-${ref}`}
                    title={`chipAdd ${ref}`}
                    className="ring-accent/60 rounded-md ring-1"
                  >
                    <EffectPillShell
                      icon={o?.icon}
                      name={o?.name ?? ref}
                      isDebuff={o?.isDebuff ?? false}
                    >
                      <button
                        type="button"
                        onClick={() => removeAdd(card.id, ref)}
                        title="Remove (chipAdd)"
                        className="ml-0.5 rounded px-0.5 text-[11px] leading-none opacity-60 hover:opacity-100"
                      >
                        ✕
                      </button>
                    </EffectPillShell>
                  </span>
                );
              })}
              {adding === card.id ? (
                <span className="flex items-center gap-1">
                  <input
                    autoFocus
                    list="character-kit-effects"
                    value={addQuery}
                    onChange={(e) => setAddQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmAdd(card.id);
                      if (e.key === 'Escape') setAdding(null);
                    }}
                    placeholder="Effect name or tooltip ref…"
                    className="border-line bg-surface-base text-content w-52 rounded-md border px-2 py-0.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => confirmAdd(card.id)}
                    className="bg-accent text-accent-fg rounded px-1.5 py-0.5 text-xs"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdding(null)}
                    className="text-content-subtle hover:text-content px-1 text-xs"
                  >
                    cancel
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAdding(card.id);
                    setAddQuery('');
                  }}
                  title="Add an effect (chipAdd)"
                  className="border-line text-content-subtle hover:text-content-strong hover:border-line-strong rounded-md border border-dashed px-1.5 py-0.5 text-xs"
                >
                  +
                </button>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
