'use client';

import { useMemo, useState } from 'react';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import { GameText } from '@/components/ui/GameText';
import { TIERS, TIER_COLORS, tierListRankOrder, type Tier } from '@/components/tierlist/tiers';
import type { RankingHelperRow } from '@/lib/contribute/ranking-helper-data';

/**
 * Outil de contribution « ranking helper » : on entre un perso, on voit sa
 * fiche condensée (rôle, tags, EE aux deux paliers) et ses HOMOLOGUES dans le
 * classement discuté — la question réelle d'une session de ranking Discord
 * n'est pas « quel rang ? » mais « par rapport à qui ? ». Anglais seul, comme
 * tout `/contribute`.
 */

type RankMode = 'pve' | 'pvp' | 'eeBase' | 'eePlus10';

const MODES: Array<{ key: RankMode; label: string }> = [
  { key: 'pve', label: 'PvE' },
  { key: 'pvp', label: 'PvP' },
  { key: 'eeBase', label: 'EE (base)' },
  { key: 'eePlus10', label: 'EE (+10)' },
];

/**
 * Critères STRUCTURELS de cohorte, combinables (ET), disponibles dans tous
 * les modes. PvE/PvP : défaut rôle + élément. Modes EE : défaut AUCUN — la
 * cohorte y est d'abord affaire d'EFFETS SIMILAIRES (un EE de « combat
 * readiness » se discute face aux autres EE de combat readiness, pas face
 * aux porteurs du même élément) ; les critères s'y AJOUTENT à la demande
 * (ne garder que les DPS, que les mêmes subclasses…).
 */
const CRITERIA = [
  { key: 'role', label: 'Same role' },
  { key: 'element', label: 'Same element' },
  { key: 'class', label: 'Same class' },
  { key: 'subclass', label: 'Same subclass' },
] as const;
type Criterion = (typeof CRITERIA)[number]['key'];

export function RankingHelperBrowser({ rows }: { rows: RankingHelperRow[] }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<RankMode>('pve');
  const [criteria, setCriteria] = useState<Set<Criterion>>(new Set(['role', 'element']));
  // Critères des modes EE, à part : leur défaut est VIDE (les effets font la
  // cohorte), un même Set partagé imposerait rôle+élément aux comparaisons EE.
  const [eeCriteria, setEeCriteria] = useState<Set<Criterion>>(new Set());
  // Chips d'effet DÉSACTIVÉES (modes EE) — vide à chaque changement de perso :
  // par défaut, tous les effets de l'EE choisi comptent.
  const [disabledRefs, setDisabledRefs] = useState<Set<string>>(new Set());

  const isEeMode = mode === 'eeBase' || mode === 'eePlus10';

  const byId = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);
  const selected = selectedId ? (byId.get(selectedId) ?? null) : null;

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!q) return [];
    return rows
      .filter((r) => r.searchNames.some((n) => n.toLowerCase().includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 12);
  }, [rows, q]);

  const activeCriteria = isEeMode ? eeCriteria : criteria;
  const toggleCriterion = (key: Criterion) =>
    (isEeMode ? setEeCriteria : setCriteria)((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // Refs d'effet ACTIVES du perso choisi (modes EE).
  const activeRefs = useMemo(() => {
    const chips = selected?.ee?.chips ?? [];
    return new Set(chips.map((c) => c.ref).filter((ref) => !disabledRefs.has(ref)));
  }, [selected, disabledRefs]);

  // Homologues : persos RANGÉS matchant chaque critère structurel actif (un
  // critère sans valeur côté perso choisi est ignoré plutôt que de vider la
  // cohorte — un perso sans rôle curé ou sans subclass arrive). Modes EE : en
  // PLUS, partager au moins une chip d'effet active — SAUF si l'utilisateur a
  // tout éteint : zéro chip active = critère effets DÉSACTIVÉ, on compare en
  // structurel seul (retour Shiraen 04/08 : tout éteindre pour ne filtrer que
  // par classe vidait la cohorte au lieu de l'élargir).
  const peers = useMemo(() => {
    if (!selected) return [];
    const structural = rows
      .filter((r) => r.ranks[mode])
      .filter((r) =>
        activeCriteria.has('role') && selected.role ? r.role === selected.role : true,
      )
      .filter((r) => (activeCriteria.has('element') ? r.element === selected.element : true))
      .filter((r) => (activeCriteria.has('class') ? r.class === selected.class : true))
      .filter((r) =>
        activeCriteria.has('subclass') && selected.subClass
          ? r.subClass === selected.subClass
          : true,
      );
    const cohort =
      isEeMode && activeRefs.size > 0
        ? structural.filter(
            (r) => r.id === selected.id || r.ee?.chips.some((c) => activeRefs.has(c.ref)),
          )
        : structural;
    return cohort.sort(tierListRankOrder((r) => r.ranks[mode]));
  }, [rows, selected, mode, activeCriteria, isEeMode, activeRefs]);

  // Second cadre : le perso discuté GARDE le focus, cliquer un homologue
  // l'ouvre en COMPARAISON à côté (demande Sevih) — « Focus » le promeut.
  const [comparedId, setComparedId] = useState<string | null>(null);
  const compared = comparedId && comparedId !== selectedId ? (byId.get(comparedId) ?? null) : null;

  const pick = (id: string) => {
    setSelectedId(id);
    setQuery('');
    setDisabledRefs(new Set());
    setComparedId(null);
  };

  const compare = (id: string) =>
    setComparedId((prev) => (id === selectedId || prev === id ? null : id));

  return (
    <div className="space-y-6">
      {/* ── Recherche ── */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a hero…"
          className="border-line bg-surface-raised text-content-strong placeholder:text-content-subtle focus:border-accent w-full rounded-md border px-3 py-2 text-sm outline-none"
        />
        {matches.length > 0 && (
          <ul className="border-line bg-surface-raised absolute z-10 mt-1 w-full overflow-hidden rounded-md border shadow-lg">
            {matches.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => pick(r.id)}
                  className="hover:bg-line/50 flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm"
                >
                  {/* Largeur FIXE : le span racine du portrait est w-full,
                      lâché dans une rangée flex il avale toute la largeur. */}
                  <span className="w-7 shrink-0">
                    <CharacterPortrait id={r.id} name={r.name} size={28} showName={false} />
                  </span>
                  <span className="text-content-strong">{r.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!selected && (
        <p className="text-content-subtle text-sm">
          Pick a hero to see their condensed sheet (role, tags, EE at both tiers) and where
          comparable heroes sit in each ranking.
        </p>
      )}

      {selected && (
        <>
          {/* ── Fiche(s) : le perso discuté + l'homologue comparé ── */}
          <div className={`grid gap-4 ${compared ? 'items-start lg:grid-cols-2' : ''}`}>
            <HeroSheet hero={selected} />
            {compared && (
              <HeroSheet
                hero={compared}
                onClose={() => setComparedId(null)}
                onFocus={() => pick(compared.id)}
              />
            )}
          </div>

          {/* ── Homologues ── */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="border-line flex overflow-hidden rounded-md border">
                {MODES.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMode(m.key)}
                    className={`px-3 py-1.5 text-sm transition-colors ${
                      mode === m.key
                        ? 'bg-accent/20 text-content-strong'
                        : 'text-content-muted hover:bg-line/50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              {CRITERIA.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => toggleCriterion(c.key)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    activeCriteria.has(c.key)
                      ? 'border-accent bg-accent/15 text-content-strong'
                      : 'border-line text-content-muted hover:bg-line/50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Modes EE : la cohorte se définit par EFFETS SIMILAIRES — les
                chips de l'EE choisi, désactivables une à une. */}
            {isEeMode && !selected.ee && (
              <p className="text-content-subtle text-sm">
                This hero has no exclusive equipment — nothing to compare by effect.
              </p>
            )}
            {isEeMode &&
              selected.ee &&
              (selected.ee.chips.length ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-content-subtle text-xs">Similar effects:</span>
                  {selected.ee.chips.map((c) => {
                    const active = !disabledRefs.has(c.ref);
                    return (
                      <button
                        key={c.ref}
                        type="button"
                        onClick={() =>
                          setDisabledRefs((prev) => {
                            const next = new Set(prev);
                            if (next.has(c.ref)) next.delete(c.ref);
                            else next.add(c.ref);
                            return next;
                          })
                        }
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          active
                            ? c.isDebuff
                              ? 'text-content-strong border-rose-500/60 bg-rose-500/10'
                              : 'text-content-strong border-emerald-500/60 bg-emerald-500/10'
                            : 'border-line text-content-muted hover:bg-line/50'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-content-subtle text-sm">
                  No comparable effect found on this EE.
                </p>
              ))}

            {!selected.ranks[mode] && (
              <p className="text-content-subtle text-sm">
                This hero is not ranked in this list — peers below are still shown for context.
              </p>
            )}

            {TIERS.map((tier) => {
              const inTier = peers.filter((r) => r.ranks[mode] === tier);
              if (inTier.length === 0) return null;
              return (
                <TierRow
                  key={tier}
                  tier={tier}
                  peers={inTier}
                  selectedId={selected.id}
                  comparedId={comparedId}
                  onPick={compare}
                  eeMode={isEeMode}
                  activeRefs={activeRefs}
                />
              );
            })}
            {peers.length === 0 && (
              <p className="text-content-subtle text-sm">
                No ranked hero matches the active filters — loosen them above.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** Texte COMPLET d'un EE en tooltip natif : balises couleur et `\n` retirés. */
function eeTitle(r: RankingHelperRow): string {
  if (!r.ee) return r.name;
  const lines = r.ee.passives.map(
    (p) => `Lv.${p.level}: ${p.text.replace(/<\/?color[^>]*>/gi, '').replace(/\\n/g, ' — ')}`,
  );
  return `${r.name} — ${r.ee.name}\n${lines.join('\n')}`;
}

/** Fiche condensée d'un perso — cadre principal ET cadre de comparaison. */
function HeroSheet({
  hero,
  onClose,
  onFocus,
}: {
  hero: RankingHelperRow;
  /** Présents sur le cadre de COMPARAISON seulement. */
  onClose?: () => void;
  onFocus?: () => void;
}) {
  return (
    <div className="border-line-subtle bg-surface-raised rounded-lg border p-4">
      <div className="flex items-start gap-4">
        <div className="w-18 shrink-0">
          <CharacterPortrait
            id={hero.id}
            name={hero.name}
            element={hero.element}
            classType={hero.class}
            rarity={hero.rarity}
            size={72}
            showName={false}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-content-strong text-xl font-semibold">
              {/* Nouvel onglet : ouvrir la fiche ne doit pas perdre l'état de
                  l'outil (perso, mode, filtres) — suggestion Arabyss 04/08. */}
              <a
                href={`/characters/${hero.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Open character page in a new tab"
                className="hover:text-accent transition-colors"
              >
                {hero.name}
              </a>
            </h2>
            {(onClose || onFocus) && (
              <span className="flex shrink-0 gap-1">
                {onFocus && (
                  <button
                    type="button"
                    onClick={onFocus}
                    title="Make this hero the main focus"
                    className="border-line text-content-muted hover:border-accent hover:text-content-strong rounded border px-2 py-0.5 text-xs transition-colors"
                  >
                    Focus
                  </button>
                )}
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close comparison"
                    className="border-line text-content-muted hover:border-accent hover:text-content-strong rounded border px-2 py-0.5 text-xs transition-colors"
                  >
                    ✕
                  </button>
                )}
              </span>
            )}
          </div>
          <p className="text-content-muted mt-0.5 text-sm capitalize">
            {hero.element} · {hero.class}
            {hero.subClass ? ` (${hero.subClass})` : ''}
            {hero.role ? ` · ${hero.role}` : ''}
          </p>
          {hero.tags.length > 0 && (
            <p className="text-content-subtle mt-1 text-xs">{hero.tags.join(' · ')}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {MODES.map((m) => (
              <span
                key={m.key}
                className="border-line bg-surface-sunken text-content-strong rounded border px-2 py-0.5 text-xs"
              >
                {m.label} : <strong>{hero.ranks[m.key] ?? '—'}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      {hero.ee && (
        <div className="border-line-subtle mt-4 border-t pt-3">
          <h3 className="text-content-strong text-sm font-semibold">EE — {hero.ee.name}</h3>
          <ul className="mt-1 space-y-1">
            {hero.ee.passives.map((p, i) => (
              <li key={i} className="text-sm">
                <span className="text-content-subtle">
                  Lv.{p.level}
                  {p.level > 1 ? (p.isAdd ? ' (adds)' : ' (replaces)') : ''} —
                </span>{' '}
                <GameText text={p.text} className="text-content-muted inline whitespace-pre-line" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TierRow({
  tier,
  peers,
  selectedId,
  comparedId,
  onPick,
  eeMode,
  activeRefs,
}: {
  tier: Tier;
  peers: RankingHelperRow[];
  selectedId: string;
  /** Homologue ouvert dans le cadre de comparaison (anneau distinct). */
  comparedId: string | null;
  onPick: (id: string) => void;
  /** Modes EE : cartes avec les effets de CHAQUE homologue, pas juste le portrait. */
  eeMode: boolean;
  /** Refs d'effet actives de l'EE choisi (surbrillance des effets partagés). */
  activeRefs: Set<string>;
}) {
  return (
    <div className={`rounded-lg border bg-linear-to-r p-2 ${TIER_COLORS[tier]}`}>
      <div className="flex items-start gap-3">
        <span className="text-content-strong w-6 shrink-0 pt-1 text-center text-lg font-bold">
          {tier}
        </span>
        <div className="flex flex-wrap gap-2">
          {peers.map((r) =>
            eeMode ? (
              <button
                key={r.id}
                type="button"
                onClick={() => onPick(r.id)}
                title={eeTitle(r)}
                className={`border-line/60 bg-surface-raised/70 hover:border-accent flex max-w-full min-w-52 items-start gap-2 rounded-md border p-2 text-left transition-colors ${
                  r.id === selectedId
                    ? 'ring-accent ring-2'
                    : r.id === comparedId
                      ? 'ring-2 ring-emerald-400'
                      : ''
                }`}
              >
                <span className="w-10 shrink-0">
                  <CharacterPortrait id={r.id} name={r.name} size={40} showName={false} />
                </span>
                <span className="min-w-0">
                  <span className="text-content-strong block truncate text-xs font-semibold">
                    {r.name}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-1">
                    {(r.ee?.chips ?? []).map((c) => (
                      <span
                        key={c.ref}
                        className={`rounded-full border px-1.5 py-px text-[10px] leading-4 ${
                          activeRefs.has(c.ref)
                            ? c.isDebuff
                              ? 'text-content-strong border-rose-500/60 bg-rose-500/10'
                              : 'text-content-strong border-emerald-500/60 bg-emerald-500/10'
                            : 'border-line text-content-muted'
                        }`}
                      >
                        {c.name}
                      </span>
                    ))}
                  </span>
                </span>
              </button>
            ) : (
              <button
                key={r.id}
                type="button"
                onClick={() => onPick(r.id)}
                title={r.name}
                className={`rounded-md p-0.5 transition-transform hover:scale-105 ${
                  r.id === selectedId
                    ? 'ring-accent ring-2'
                    : r.id === comparedId
                      ? 'ring-2 ring-emerald-400'
                      : ''
                }`}
              >
                <CharacterPortrait id={r.id} name={r.name} size={48} showName={false} />
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
