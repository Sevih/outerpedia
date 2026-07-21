'use client';

/**
 * Team Planner — client (portage V2 sur les primitives V3).
 *
 * Tout le moteur d'effets est SERVEUR (wrapper) : ici on ne fait que composer
 * des RÉFS de statut avec la `StatusMap` résolue. Quatre blocs :
 *   - la CROIX d'équipe (4 slots, sprites d'UI du jeu), buffs sur soi affichés
 *     en icônes au-dessus/en-dessous du portrait ;
 *   - l'ORDRE DE CHAÎNE (visible équipe complète) : colonnes de portraits,
 *     échange par deux clics, validité Start/Join/Finish par position, icônes
 *     d'effet de chaîne sur fond bleu/rouge (gris si position invalide) ;
 *   - la SYNTHÈSE d'équipe : buffs d'équipe, debuffs ennemis, apports du burst,
 *     effets d'attaque duo (équipe complète) — chips par personnage ;
 *   - le PICKER (recherche + filtres élément/classe).
 *
 * Partage : `?z=` = JSON compact {t, o, n} compressé lz-string — FORMAT V2 à
 * l'identique (des liens circulent, et les ids V3 des persos de base sont les
 * ids du jeu, mêmes valeurs qu'en V2) ; l'ancien `?t=&o=&n=` reste décodé.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LZString from 'lz-string';
import { FaArrowRotateLeft, FaCheck, FaLink, FaXmark } from 'react-icons/fa6';
import { img, CHAIN_PILL, ELEMENT_ORDER } from '@/lib/images';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import {
  EffectChip,
  EffectIconBadge,
  type ClientEffect,
  type NamedEffect,
  type StatusMap,
} from '@/components/character/EffectChips';

// ── Contrats wrapper → client ──────────────────────────────────────────────

export interface TpChar {
  id: string;
  /** Nom d'affichage localisé (préfixe Core Fusion inclus). */
  label: string;
  element: string;
  cls: string;
  rarity: number;
  /** `start` | `join` | `finish` (absent : position libre). */
  chainType?: string;
}

/** Réfs de statut d'un perso, classées par cible/nature (voir le wrapper). */
export interface TpFx {
  self: string[];
  team: string[];
  debuff: string[];
  burstBuff: string[];
  burstDebuff: string[];
  chainBuff: string[];
  chainDebuff: string[];
  dualBuff: string[];
  dualDebuff: string[];
}

export interface TpLabels {
  wip: string;
  teamNamePlaceholder: string;
  emptySlot: string;
  pickCharacter: string;
  search: string;
  all: string;
  reset: string;
  share: string;
  copied: string;
  chainOrder: string;
  chainOrderDesc: string;
  chains: { start: string; join: string; finish: string };
  teamBuffs: string;
  teamDebuffs: string;
  burstEffects: string;
  dualAttackEffects: string;
  noEffects: string;
}

interface Props {
  chars: TpChar[];
  fx: Record<string, TpFx>;
  statuses: StatusMap;
  labels: TpLabels;
}

const EMPTY_FX: TpFx = {
  self: [],
  team: [],
  debuff: [],
  burstBuff: [],
  burstDebuff: [],
  chainBuff: [],
  chainDebuff: [],
  dualBuff: [],
  dualDebuff: [],
};

// ── Petites briques d'affichage ────────────────────────────────────────────

/** Réf de statut → effet nommé prêt à afficher (null si réf inconnue). */
function namedOf(ref: string, statuses: StatusMap): NamedEffect | null {
  const st = statuses[ref];
  if (!st) return null;
  return { name: st.name, icon: st.icon, isDebuff: st.isDebuff, desc: st.desc };
}

/** Rangée d'icônes d'effet nues (nom au survol) — les buffs sur soi des slots. */
function IconRow({ refs, statuses }: { refs: string[]; statuses: StatusMap }) {
  const effects = refs.map((r) => namedOf(r, statuses)).filter((e): e is NamedEffect => !!e);
  if (!effects.length) return null;
  return (
    <div className="flex flex-nowrap gap-0.5">
      {effects.map((e) => (
        <EffectIconBadge key={e.name} effect={e} className="h-6 w-6" />
      ))}
    </div>
  );
}

/** Rangée de pills nommées (chips) — les sections de synthèse. */
function ChipsRow({ refs, statuses }: { refs: string[]; statuses: StatusMap }) {
  if (!refs.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {refs.map((ref) => {
        const st = statuses[ref];
        if (!st) return null;
        // La réf sert de clé de lookup (tooltip ?? label) — la nature vient du
        // statut résolu, la catégorie n'est qu'un repli.
        const effect: ClientEffect = {
          family: 'special',
          category: st.isDebuff ? 'debuff' : 'buff',
          tooltip: ref,
        };
        return <EffectChip key={ref} effect={effect} statuses={statuses} />;
      })}
    </div>
  );
}

// ── Croix d'équipe ─────────────────────────────────────────────────────────

function TeamSlot({
  char,
  selfRefs,
  statuses,
  isTop,
  emptyAlt,
  onClick,
  onRemove,
}: {
  char: TpChar | null;
  selfRefs: string[];
  statuses: StatusMap;
  isTop: boolean;
  emptyAlt: string;
  onClick: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        className="relative block h-18 w-18 transition hover:opacity-80 sm:h-22 sm:w-22"
      >
        {char ? (
          <CharacterPortrait
            id={char.id}
            name={char.label}
            element={char.element}
            classType={char.cls}
            rarity={char.rarity}
            size={88}
            showName={false}
          />
        ) : (
          <img
            src={img.skillchain('TI_Slot_Empty')}
            alt={emptyAlt}
            className="h-full w-full object-contain"
          />
        )}
      </button>
      {char && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="bg-danger-deep absolute -top-1 -right-1 z-20 rounded-full p-1 text-red-200 opacity-0 shadow transition-opacity group-hover:opacity-100"
        >
          <FaXmark className="h-3 w-3" />
        </button>
      )}
      {selfRefs.length > 0 && (
        <div
          className="absolute left-1/2 z-30 -translate-x-1/2"
          style={isTop ? { bottom: '100%', marginBottom: 2 } : { top: '100%', marginTop: 2 }}
        >
          <IconRow refs={selfRefs} statuses={statuses} />
        </div>
      )}
    </div>
  );
}

// ── Ordre de chaîne ────────────────────────────────────────────────────────

/** Un type de chaîne est-il jouable à cette position (0..3) ? */
function validAt(chainType: string | undefined, pos: number): boolean {
  if (!chainType || chainType === 'join') return true;
  if (chainType === 'start') return pos === 0;
  if (chainType === 'finish') return pos === 3;
  return false;
}

function ChainEffectIcons({
  refs,
  statuses,
  disabled,
}: {
  refs: string[];
  statuses: StatusMap;
  disabled: boolean;
}) {
  const effects = refs.map((r) => namedOf(r, statuses)).filter((e): e is NamedEffect => !!e);
  if (!effects.length) return null;
  return (
    <div className="absolute -top-4 left-1/2 z-20 flex -translate-x-1/2 gap-0.5">
      {effects.slice(0, 3).map((e) => {
        const bg = disabled
          ? 'SC_Whole_Disable'
          : e.isDebuff
            ? 'SC_Whole_Red_Bg'
            : 'SC_Whole_Blue_Bg';
        return (
          <span
            key={e.name}
            className="relative flex h-7 w-7 items-center justify-center sm:h-9 sm:w-9"
            title={e.name}
          >
            <img
              src={img.skillchain(bg)}
              alt=""
              className="absolute inset-0 h-full w-full object-contain"
            />
            {e.icon && (
              <img
                src={img.effect(e.icon)}
                alt={e.name}
                className={`relative z-10 h-4.5 w-4.5 object-contain sm:h-5.5 sm:w-5.5 ${
                  disabled ? 'opacity-50 grayscale' : ''
                }`}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}

// ── Synthèse d'équipe ──────────────────────────────────────────────────────

/** Section par-personnage : portrait + chips (masquée si personne n'apporte rien). */
function EffectSection({
  title,
  titleClass,
  members,
  statuses,
  buffsOf,
  debuffsOf,
}: {
  title: string;
  titleClass: string;
  members: TpChar[];
  statuses: StatusMap;
  buffsOf: (c: TpChar) => string[];
  debuffsOf: (c: TpChar) => string[];
}) {
  const active = members.filter((m) => buffsOf(m).length || debuffsOf(m).length);
  if (!active.length) return null;
  return (
    <div className="border-line bg-surface-raised/60 rounded-xl border p-4">
      <h3 className={`mb-2 text-sm font-bold ${titleClass}`}>{title}</h3>
      <div
        className={`flex flex-col gap-3 ${active.length >= 2 ? 'sm:grid sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3' : ''}`}
      >
        {active.map((c, i) => (
          <div
            key={c.id}
            className={[
              i > 0 ? 'border-line/50 border-t pt-3 sm:border-t-0 sm:pt-0' : '',
              active.length >= 2 && i % 2 === 1 ? 'sm:border-line/50 sm:border-l sm:pl-4' : '',
            ].join(' ')}
          >
            <div className="flex items-start gap-2">
              <div className="shrink-0 self-center">
                <CharacterPortrait
                  id={c.id}
                  name={c.label}
                  element={c.element}
                  classType={c.cls}
                  size={48}
                  showName={false}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <ChipsRow refs={buffsOf(c)} statuses={statuses} />
                <ChipsRow refs={debuffsOf(c)} statuses={statuses} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Picker ─────────────────────────────────────────────────────────────────

function CharPicker({
  chars,
  exclude,
  labels,
  onPick,
  onClose,
}: {
  chars: TpChar[];
  exclude: Set<string>;
  labels: TpLabels;
  onPick: (c: TpChar) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [element, setElement] = useState<string | null>(null);
  const [cls, setCls] = useState<string | null>(null);

  const classes = useMemo(() => [...new Set(chars.map((c) => c.cls))].sort(), [chars]);
  const q = query.trim().toLowerCase();
  const shown = chars.filter(
    (c) =>
      !exclude.has(c.id) &&
      (!element || c.element === element) &&
      (!cls || c.cls === cls) &&
      (!q || c.label.toLowerCase().includes(q)),
  );

  const filterBtn = (selected: boolean) =>
    `flex h-8 w-8 items-center justify-center rounded-lg transition ${
      selected
        ? 'bg-accent/25 ring-accent ring-2'
        : 'bg-surface-overlay hover:bg-surface-overlay/70'
    }`;

  return (
    <div
      className="bg-scrim/60 fixed inset-0 z-100 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="border-line bg-surface-raised flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-line/60 flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-content-strong text-base font-bold">{labels.pickCharacter}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-content-muted hover:text-content rounded p-1 transition"
          >
            <FaXmark />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.search}
            autoFocus
            className="border-line bg-surface-overlay/60 text-content placeholder-content-subtle min-w-40 flex-1 rounded-lg border px-3 py-1.5 text-sm focus:border-sky-500 focus:outline-none"
          />
          <div className="flex gap-1">
            {ELEMENT_ORDER.map((el) => (
              <button
                key={el}
                type="button"
                title={el}
                onClick={() => setElement((v) => (v === el ? null : el))}
                className={filterBtn(element === el)}
              >
                <img src={img.element(el)} alt={el} className="h-5 w-5" />
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {classes.map((k) => (
              <button
                key={k}
                type="button"
                title={k}
                onClick={() => setCls((v) => (v === k ? null : k))}
                className={filterBtn(cls === k)}
              >
                <img src={img.klass(k)} alt={k} className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 overflow-y-auto px-4 pb-4 sm:grid-cols-6">
          {shown.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c)}
              className="hover:bg-surface-overlay/70 rounded-lg p-1 transition"
            >
              <CharacterPortrait
                id={c.id}
                name={c.label}
                element={c.element}
                classType={c.cls}
                rarity={c.rarity}
                size={64}
              />
            </button>
          ))}
          {!shown.length && (
            <p className="text-content-subtle col-span-full py-6 text-center text-sm">
              {labels.all}: 0
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────

type TeamState = (string | null)[];

export function TeamPlannerBrowser({ chars, fx, statuses, labels: L }: Props) {
  const [team, setTeam] = useState<TeamState>([null, null, null, null]);
  const [chainOrder, setChainOrder] = useState<number[]>([0, 1, 2, 3]);
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [selectedChainIndex, setSelectedChainIndex] = useState<number | null>(null);
  const [teamName, setTeamName] = useState('');
  const [copied, setCopied] = useState(false);

  const byId = useMemo(() => new Map(chars.map((c) => [c.id, c])), [chars]);
  const fxOf = useCallback((id: string): TpFx => fx[id] ?? EMPTY_FX, [fx]);
  const slots: (TpChar | null)[] = team.map((id) => (id ? (byId.get(id) ?? null) : null));
  const members = slots.filter((c): c is TpChar => c !== null);
  const fullTeam = members.length === 4;
  const exclude = useMemo(() => new Set(team.filter((id): id is string => !!id)), [team]);

  // ── Hydratation depuis l'URL (une fois) : `?z=` lz-string, legacy `?t=` ──
  const didHydrate = useRef(false);
  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;
    const params = new URLSearchParams(window.location.search);
    let raw: { t?: string[]; o?: string; n?: string } | null = null;
    const z = params.get('z');
    if (z) {
      try {
        raw = JSON.parse(LZString.decompressFromEncodedURIComponent(z) || '{}') as typeof raw;
      } catch {
        raw = null;
      }
    } else if (params.get('t')) {
      raw = {
        t: params.get('t')!.split(','),
        o: params.get('o') ?? undefined,
        n: params.get('n') ?? undefined,
      };
    }
    if (!raw) return;
    const data = raw;
    // Règle set-state-in-effect : la pose d'état est déférée en microtâche.
    void Promise.resolve().then(() => {
      if (data.t) {
        const loaded: TeamState = data.t.slice(0, 4).map((id) => (byId.has(id) ? id : null));
        while (loaded.length < 4) loaded.push(null);
        setTeam(loaded);
      }
      if (data.o && /^[0-3]{4}$/.test(data.o)) setChainOrder(data.o.split('').map(Number));
      if (data.n) setTeamName(data.n.slice(0, 100));
    });
  }, [byId]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handlePick = useCallback(
    (c: TpChar) => {
      if (pickerSlot === null) return;
      setTeam((prev) => prev.map((id, i) => (i === pickerSlot ? c.id : id)));
      setPickerSlot(null);
    },
    [pickerSlot],
  );

  const handleRemove = useCallback((slotIdx: number) => {
    setTeam((prev) => prev.map((id, i) => (i === slotIdx ? null : id)));
  }, []);

  const handleReset = useCallback(() => {
    setTeam([null, null, null, null]);
    setChainOrder([0, 1, 2, 3]);
    setTeamName('');
    setSelectedChainIndex(null);
  }, []);

  const handleShare = useCallback(() => {
    // Format V2 à l'identique (contrat public — des liens circulent).
    const compact: { t?: string[]; o?: string; n?: string } = {};
    const ids = team.map((id) => id ?? '');
    if (ids.some(Boolean)) compact.t = ids;
    const order = chainOrder.join('');
    if (order !== '0123') compact.o = order;
    if (teamName) compact.n = teamName;
    const z = LZString.compressToEncodedURIComponent(JSON.stringify(compact));
    window.history.replaceState(null, '', `${window.location.pathname}?z=${z}`);
    void navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [team, chainOrder, teamName]);

  const handleChainSlotClick = useCallback(
    (chainIndex: number) => {
      if (selectedChainIndex === null) {
        setSelectedChainIndex(chainIndex);
        return;
      }
      setChainOrder((prev) => {
        const next = [...prev];
        [next[selectedChainIndex], next[chainIndex]] = [next[chainIndex], next[selectedChainIndex]];
        return next;
      });
      setSelectedChainIndex(null);
    },
    [selectedChainIndex],
  );

  // ── Effets de chaîne actifs (positions valides seulement) ────────────────
  const activeChain = useMemo(() => {
    const buffs: string[] = [];
    const debuffs: string[] = [];
    const seen = new Set<string>();
    chainOrder.forEach((slotIdx, pos) => {
      const id = team[slotIdx];
      const c = id ? byId.get(id) : undefined;
      if (!id || !c || !validAt(c.chainType, pos)) return;
      for (const ref of fxOf(id).chainBuff)
        if (!seen.has(ref)) {
          seen.add(ref);
          buffs.push(ref);
        }
      for (const ref of fxOf(id).chainDebuff)
        if (!seen.has(ref)) {
          seen.add(ref);
          debuffs.push(ref);
        }
    });
    return { buffs, debuffs };
  }, [chainOrder, team, byId, fxOf]);

  // ── Rendu ────────────────────────────────────────────────────────────────
  const renderSlot = (idx: number) => (
    <TeamSlot
      char={slots[idx]}
      selfRefs={team[idx] ? fxOf(team[idx]!).self : []}
      statuses={statuses}
      isTop={idx === 0}
      emptyAlt={L.emptySlot}
      onClick={() => setPickerSlot(idx)}
      onRemove={() => handleRemove(idx)}
    />
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="border-line bg-surface-raised/60 text-content-muted rounded-lg border px-4 py-2 text-center text-sm">
        {L.wip}
      </div>

      <input
        type="text"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        placeholder={L.teamNamePlaceholder}
        maxLength={100}
        className="border-line bg-surface-raised/60 text-content-strong placeholder-content-subtle w-full rounded-lg border px-4 py-2 text-sm focus:border-sky-500 focus:outline-none"
      />

      {/* Croix d'équipe (slot 0 en haut, 1 à gauche, 2 à droite, 3 en bas). */}
      <div className="relative mx-auto w-fit">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <img
            src={img.skillchain('T_Tame_Select')}
            alt=""
            className="h-52 w-52 object-contain opacity-30 sm:h-64 sm:w-64"
          />
        </div>
        <div className="relative grid grid-cols-3 grid-rows-3 place-items-center gap-5 p-4 sm:gap-6">
          <div />
          <div className="-mt-2">{renderSlot(0)}</div>
          <div />
          <div className="-ml-2">{renderSlot(1)}</div>
          <div />
          <div className="-mr-2">{renderSlot(2)}</div>
          <div />
          <div className="-mb-2">{renderSlot(3)}</div>
          <div />
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="bg-danger-deep/40 hover:bg-danger-deep/70 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-red-200 transition"
        >
          <FaArrowRotateLeft /> {L.reset}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="bg-surface-overlay text-content hover:bg-surface-overlay/70 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition"
        >
          {copied ? <FaCheck /> : <FaLink />} {copied ? L.copied : L.share}
        </button>
      </div>

      {/* Ordre de chaîne — équipe complète seulement. */}
      {fullTeam && (
        <div className="border-line bg-surface-raised/60 rounded-xl border p-4">
          <h3 className="text-content-strong mb-1 text-center text-sm font-bold">{L.chainOrder}</h3>
          <p className="text-content-subtle mb-4 text-center text-xs">{L.chainOrderDesc}</p>
          <div className="flex justify-center gap-2 pt-4 sm:gap-3">
            {chainOrder.map((slotIdx, chainIndex) => {
              const c = slots[slotIdx];
              if (!c) return null;
              const isSelected = selectedChainIndex === chainIndex;
              const isValid = validAt(c.chainType, chainIndex);
              const f = fxOf(c.id);
              return (
                <button
                  key={`chain-${chainIndex}-${slotIdx}`}
                  type="button"
                  onClick={() => handleChainSlotClick(chainIndex)}
                  className={`relative h-36 w-12 cursor-pointer transition-all hover:scale-105 sm:h-44 sm:w-16 ${
                    isSelected ? 'ring-accent rounded-lg ring-2' : ''
                  }`}
                >
                  <img
                    src={img.skillchain('T_FX_SkillChain_Mask')}
                    alt=""
                    className="absolute inset-0 h-full w-full object-contain opacity-20"
                  />
                  <span className="absolute inset-0 z-10 overflow-hidden rounded-lg">
                    <span
                      className="block h-full w-full"
                      style={{ transform: 'scale(1.7)', transformOrigin: 'center center' }}
                    >
                      <img
                        src={img.portrait(c.id)}
                        alt={c.label}
                        className="h-full w-full object-contain"
                      />
                    </span>
                  </span>
                  <ChainEffectIcons
                    refs={[...f.chainBuff, ...f.chainDebuff]}
                    statuses={statuses}
                    disabled={!isValid}
                  />
                  {c.chainType && (
                    <span
                      className={`absolute right-0 bottom-0 left-0 z-20 rounded-b px-0.5 py-0.5 text-center text-[8px] leading-tight font-semibold sm:text-[10px] ${
                        isValid
                          ? (CHAIN_PILL[c.chainType] ?? 'bg-surface-overlay text-content')
                          : 'bg-surface-overlay/80 text-content-subtle'
                      }`}
                    >
                      {L.chains[c.chainType as keyof TpLabels['chains']] ?? c.chainType}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {(activeChain.buffs.length > 0 || activeChain.debuffs.length > 0) && (
            <div className="mt-4 flex flex-col gap-1">
              <ChipsRow refs={activeChain.buffs} statuses={statuses} />
              <ChipsRow refs={activeChain.debuffs} statuses={statuses} />
            </div>
          )}
        </div>
      )}

      {/* Synthèse d'équipe. */}
      {members.length === 0 ? (
        <p className="text-content-subtle py-4 text-center text-sm">{L.noEffects}</p>
      ) : (
        <div className="space-y-4">
          <EffectSection
            title={L.teamBuffs}
            titleClass="text-buff"
            members={members}
            statuses={statuses}
            buffsOf={(c) => fxOf(c.id).team}
            debuffsOf={() => []}
          />
          <EffectSection
            title={L.teamDebuffs}
            titleClass="text-debuff"
            members={members}
            statuses={statuses}
            buffsOf={() => []}
            debuffsOf={(c) => fxOf(c.id).debuff}
          />
          <EffectSection
            title={L.burstEffects}
            titleClass="text-fire"
            members={members}
            statuses={statuses}
            buffsOf={(c) => fxOf(c.id).burstBuff}
            debuffsOf={(c) => fxOf(c.id).burstDebuff}
          />
          {fullTeam && (
            <EffectSection
              title={L.dualAttackEffects}
              titleClass="text-dark-elem"
              members={members}
              statuses={statuses}
              buffsOf={(c) => fxOf(c.id).dualBuff}
              debuffsOf={(c) => fxOf(c.id).dualDebuff}
            />
          )}
        </div>
      )}

      {pickerSlot !== null && (
        <CharPicker
          chars={chars}
          exclude={exclude}
          labels={L}
          onPick={handlePick}
          onClose={() => setPickerSlot(null)}
        />
      )}
    </div>
  );
}
