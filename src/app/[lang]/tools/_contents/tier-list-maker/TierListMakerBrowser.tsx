'use client';

import { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import {
  FaPlus,
  FaTrash,
  FaChevronUp,
  FaChevronDown,
  FaXmark,
  FaImage,
  FaLink,
  FaArrowRotateLeft,
  FaCheck,
  FaGear,
  FaFileExport,
  FaFileImport,
  FaGripVertical,
} from 'react-icons/fa6';
import { useStoredState, type StoreSpec } from '@/lib/client-storage';
import { img, ELEMENT_ORDER } from '@/lib/images';
import { FilterPill } from '@/components/character/filters/FilterPill';
import { TIER_PALETTE, buildCanon, decodeState, encodeState, type Tier } from './share-codec';

// ── Types ──

/** Item rangeable — noms DÉJÀ localisés par le wrapper serveur. */
export interface TierItem {
  key: string;
  label: string;
  /** Nom court d'affichage (curé), si présent. */
  short?: string;
  /** Vignette carrée (face icon / EE / portrait de boss). */
  img: string;
  /** Portrait haut `CT_*` (persos + costumes) — grille en mode « cartes ». */
  card?: string;
  element?: string;
  cls?: string;
  rarity?: number;
  tags?: string[];
  isSkin?: boolean;
  /** Costume : nom du perso de base (affiché quand « noms de skin » est off). */
  baseLabel?: string;
  baseShort?: string;
}

export interface TlmLabels {
  tabs: Record<Tab, string>;
  tags: Record<string, string>;
  sorts: Record<SortKey, string>;
  sizes: Record<IconSize, string>;
  search: string;
  hint: string;
  titlePlaceholder: string;
  addRow: string;
  clearRow: string;
  deleteRow: string;
  moveUp: string;
  moveDown: string;
  dragRow: string;
  color: string;
  reset: string;
  share: string;
  copied: string;
  exportPng: string;
  noResults: string;
  emptyPool: string;
  confirmReset: string;
  confirmClearRow: string;
  confirmDeleteRow: string;
  settings: string;
  iconSize: string;
  showNames: string;
  showElement: string;
  showClass: string;
  showRarity: string;
  showCards: string;
  cardSize: string;
  showCardTags: string;
  showSkins: string;
  showSkinNames: string;
  skinsOnly: string;
  exportJson: string;
  importJson: string;
  importError: string;
  exportBlocked: string;
  sort: string;
}

type Tab = 'characters' | 'ee' | 'bosses';
type IconSize = 's' | 'm' | 'l';
type SortKey = 'default' | 'name' | 'rarity' | 'element';

// ── Constantes ──

const DEFAULT_LABELS = ['S', 'A', 'B', 'C', 'D'];

// Ids de tiers DÉTERMINISTES : ce code tourne au SSR et à l'hydratation, un id
// aléatoire ici créerait un mismatch.
function makeDefaultTiers(): Tier[] {
  return DEFAULT_LABELS.map((label, i) => ({
    id: `t${i}`,
    label,
    color: TIER_PALETTE[i],
    items: [],
  }));
}

const DRAG_THRESHOLD = 6;
const TOUCH_HOLD_MS = 220;

const SORT_KEYS: SortKey[] = ['default', 'name', 'rarity', 'element'];
/** Tags de perso exposés en filtres de pool, dans l'ordre d'affichage. */
const FILTER_TAGS = ['limited', 'collab', 'seasonal', 'free', 'premium'];
const CLASSES = ['striker', 'defender', 'ranger', 'healer', 'mage'];
const RARITIES = [1, 2, 3];

// ── Réglages d'affichage (persistés — clé V2 `tlm-settings` absorbée) ──

interface TlmSettings {
  iconSize: IconSize;
  showNames: boolean;
  showElement: boolean;
  showClass: boolean;
  showRarity: boolean;
  showSkins: boolean;
  showSkinNames: boolean;
  showCards: boolean;
  cardSize: IconSize;
  showCardTags: boolean;
}

const SETTINGS_FALLBACK: TlmSettings = {
  iconSize: 'm',
  showNames: false,
  showElement: false,
  showClass: false,
  showRarity: false,
  showSkins: false,
  showSkinNames: true,
  showCards: false,
  cardSize: 'm',
  showCardTags: false,
};

/** Normalise des réglages de provenance quelconque (V2 `tlm-settings` incluse
 *  — mêmes champs, on ne garde que les valeurs valides). */
function coerceSettings(raw: unknown): TlmSettings {
  const d = (raw && typeof raw === 'object' ? raw : {}) as Partial<TlmSettings>;
  const size = (v: unknown): IconSize | undefined =>
    v === 's' || v === 'm' || v === 'l' ? v : undefined;
  const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
  return {
    iconSize: size(d.iconSize) ?? 'm',
    showNames: bool(d.showNames, false),
    showElement: bool(d.showElement, false),
    showClass: bool(d.showClass, false),
    showRarity: bool(d.showRarity, false),
    showSkins: bool(d.showSkins, false),
    showSkinNames: bool(d.showSkinNames, true),
    showCards: bool(d.showCards, false),
    cardSize: size(d.cardSize) ?? 'm',
    showCardTags: bool(d.showCardTags, false),
  };
}

const SETTINGS_SPEC: StoreSpec<TlmSettings> = {
  key: 'outerpedia:tier-list-maker:settings',
  version: 1,
  fallback: SETTINGS_FALLBACK,
  legacyKeys: ['tlm-settings'],
  fromLegacy: (data) => (data && typeof data === 'object' ? coerceSettings(data) : undefined),
};

// ── Mutations de tiers ──

function removeKey(tiers: Tier[], key: string): Tier[] {
  return tiers.map((t) => ({ ...t, items: t.items.filter((k) => k !== key) }));
}

/** Retire `key` partout puis l'insère dans `tierId` (avant `beforeKey`, ou à la fin). */
function placeKey(tiers: Tier[], key: string, tierId: string, beforeKey: string | null): Tier[] {
  const cleaned = removeKey(tiers, key);
  const idx = cleaned.findIndex((t) => t.id === tierId);
  if (idx < 0) return cleaned;
  const items = [...cleaned[idx].items];
  let pos = items.length;
  if (beforeKey) {
    const bi = items.indexOf(beforeKey);
    if (bi >= 0) pos = bi;
  }
  items.splice(pos, 0, key);
  cleaned[idx] = { ...cleaned[idx], items };
  return cleaned;
}

/** Déplace `key` dans `tierId` à un index d'insertion VISUEL (calculé contre la
 *  liste rendue, qui contient encore l'item traîné). */
function moveKeyToVisualIndex(tiers: Tier[], key: string, tierId: string, vIndex: number): Tier[] {
  const ti = tiers.findIndex((t) => t.id === tierId);
  const oldPos = ti >= 0 ? tiers[ti].items.indexOf(key) : -1;
  // Retirer la clé d'abord décale d'un cran les positions suivantes du même tier.
  const target = oldPos >= 0 && oldPos < vIndex ? vIndex - 1 : vIndex;
  const cleaned = removeKey(tiers, key);
  const ci = cleaned.findIndex((t) => t.id === tierId);
  if (ci < 0) return cleaned;
  const items = [...cleaned[ci].items];
  items.splice(Math.max(0, Math.min(target, items.length)), 0, key);
  cleaned[ci] = { ...cleaned[ci], items };
  return cleaned;
}

/** Index d'insertion parmi les lignes de tier pour un Y de pointeur (0..count). */
function rowIndexAtY(y: number): number {
  const rows = Array.from(document.querySelectorAll('[data-tier-id]'));
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i].getBoundingClientRect();
    if (y < r.top + r.height / 2) return i;
  }
  return rows.length;
}

/** Déplace la ligne `id` à l'index d'insertion `vIndex` ; rend la MÊME référence
 *  quand rien ne change (un drag en cours ne re-rend pas pour rien). */
function moveRowToIndex(tiers: Tier[], id: string, vIndex: number): Tier[] {
  const from = tiers.findIndex((t) => t.id === id);
  if (from < 0) return tiers;
  const target = Math.max(0, Math.min(from < vIndex ? vIndex - 1 : vIndex, tiers.length - 1));
  if (target === from) return tiers;
  const next = [...tiers];
  const [row] = next.splice(from, 1);
  next.splice(target, 0, row);
  return next;
}

type DropTarget = { type: 'pool' } | { type: 'tier'; tierId: string; index: number };

/** Résout ce qui est sous le pointeur en cible de drop. Sert à l'indicateur
 *  d'insertion ET au drop réel — ils ne peuvent pas diverger. L'index est la
 *  position de trou parmi les items du tier. */
function computeDrop(x: number, y: number): DropTarget | null {
  const el = document.elementFromPoint(x, y) as HTMLElement | null;
  const zone = el?.closest('[data-drop]');
  if (!zone) return null;
  if (zone.getAttribute('data-drop') === 'pool') return { type: 'pool' };
  const tierId = zone.getAttribute('data-tier-id');
  if (!tierId) return null;
  const box = zone.querySelector('[data-items]');
  const els = box ? Array.from(box.querySelectorAll<HTMLElement>('[data-item-key]')) : [];
  let index = els.length;
  for (let i = 0; i < els.length; i++) {
    const r = els[i].getBoundingClientRect();
    if (y < r.top) {
      index = i;
      break;
    }
    if (y <= r.bottom && x < r.left + r.width / 2) {
      index = i;
      break;
    }
  }
  return { type: 'tier', tierId, index };
}

/** Retour à la ligne glouton pour du texte canvas ; coupe au caractère un mot trop long. */
function wrapLabel(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  const addChars = (chunk: string) => {
    for (const ch of chunk) {
      if (line && ctx.measureText(line + ch).width > maxWidth) {
        lines.push(line);
        line = ch;
      } else line += ch;
    }
  };
  text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .forEach((word, i) => {
      if (i > 0) {
        if (line && ctx.measureText(`${line} ${word}`).width > maxWidth) {
          lines.push(line);
          line = '';
        } else if (line) line += ' ';
      }
      addChars(word);
    });
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

/** Badge de recrutement pour un jeu de tags (même priorité que les cartes). */
function recruitBadge(tags?: string[]): string | null {
  if (!tags) return null;
  for (const tag of ['collab', 'seasonal', 'premium', 'free', 'limited'])
    if (tags.includes(tag)) return img.tag(tag);
  return null;
}

// ── Vignette d'item ──

const ITEM_SIZES: Record<IconSize, { box: string; col: string }> = {
  s: { box: 'h-9 w-9 sm:h-11 sm:w-11', col: 'w-9 sm:w-11' },
  m: { box: 'h-12 w-12 sm:h-14 sm:w-14', col: 'w-12 sm:w-14' },
  l: { box: 'h-16 w-16 sm:h-20 sm:w-20', col: 'w-16 sm:w-20' },
};

/** Largeurs des cartes de la grille rangée (portrait `CT_*`, ratio 120×231). */
const CARD_SIZES: Record<IconSize, string> = {
  s: 'w-[66px]',
  m: 'w-25',
  l: 'w-30',
};
const CARD_ASPECT = 'aspect-[120/231]';

type ItemViewProps = {
  item: TierItem;
  selected: boolean;
  dimmed: boolean;
  label: string;
  shortLabel?: string;
  size: IconSize;
  showName: boolean;
  showElement: boolean;
  showClass: boolean;
  showRarity: boolean;
  onPointerDown: (e: React.PointerEvent, key: string) => void;
};

const ItemView = memo(function ItemView({
  item,
  selected,
  dimmed,
  label,
  shortLabel,
  size,
  showName,
  showElement,
  showClass,
  showRarity,
  onPointerDown,
}: ItemViewProps) {
  const s = ITEM_SIZES[size];
  return (
    <div
      data-item-key={item.key}
      onPointerDown={(e) => onPointerDown(e, item.key)}
      title={label}
      className={`relative flex shrink-0 cursor-grab touch-none flex-col items-center select-none ${showName ? s.col : ''} ${dimmed ? 'opacity-30' : ''}`}
    >
      <div
        className={[
          s.box,
          'relative rounded-md transition',
          selected ? 'ring-2 ring-amber-400' : 'ring-line hover:ring-line-strong ring-1',
        ].join(' ')}
      >
        <img
          src={item.img}
          alt={label}
          draggable={false}
          loading="lazy"
          className="bg-surface-overlay h-full w-full rounded-md object-cover"
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden';
          }}
        />
        {showElement && item.element && (
          <img
            src={img.element(item.element)}
            alt=""
            className="absolute -top-1 -right-1 h-[40%] w-[40%] drop-shadow-md"
          />
        )}
        {showClass && item.cls && (
          <img
            src={img.klass(item.cls)}
            alt=""
            className="absolute top-[42%] right-0 h-[28%] w-[28%] drop-shadow-md"
          />
        )}
        {showRarity && item.rarity ? (
          <span className="absolute inset-x-0 bottom-0.5 flex items-center justify-center">
            {Array.from({ length: item.rarity }, (_, i) => (
              <img
                key={i}
                src={img.star()}
                alt=""
                className="h-3 w-3 drop-shadow-md"
                style={{ marginLeft: i ? -3 : 0 }}
              />
            ))}
          </span>
        ) : null}
      </div>
      {showName && (
        <span
          lang="en"
          className="text-content-muted mt-0.5 w-full text-center text-[10px] leading-tight hyphens-auto"
        >
          {shortLabel || label}
        </span>
      )}
    </div>
  );
});

// ── Carte pleine (grille rangée en mode « cartes ») ──

type CardViewProps = {
  item: TierItem;
  selected: boolean;
  dimmed: boolean;
  /** Nom du perso de base — rendu SUR la carte. */
  label: string;
  /** Nom du costume — rendu SOUS la carte quand présent. */
  skinLabel?: string;
  size: IconSize;
  showName: boolean;
  showElement: boolean;
  showClass: boolean;
  showStars: boolean;
  showBadge: boolean;
  onPointerDown: (e: React.PointerEvent, key: string) => void;
};

const CardView = memo(function CardView({
  item,
  selected,
  dimmed,
  label,
  skinLabel,
  size,
  showName,
  showElement,
  showClass,
  showStars,
  showBadge,
  onPointerDown,
}: CardViewProps) {
  const badge = showBadge ? recruitBadge(item.tags) : null;
  return (
    <div
      data-item-key={item.key}
      onPointerDown={(e) => onPointerDown(e, item.key)}
      title={skinLabel ?? label}
      className={[
        CARD_SIZES[size],
        'relative flex shrink-0 cursor-grab touch-none flex-col items-center select-none',
        dimmed ? 'opacity-30' : '',
      ].join(' ')}
    >
      <div
        className={[
          CARD_ASPECT,
          'relative w-full overflow-hidden rounded transition',
          selected ? 'ring-2 ring-amber-400' : 'ring-line-subtle ring-1',
        ].join(' ')}
      >
        <img
          src={item.card ?? item.img}
          alt={label}
          draggable={false}
          loading="lazy"
          className="bg-surface-overlay h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden';
          }}
        />
        {badge && <img src={badge} alt="" className="absolute top-1 left-1 w-[60%]" />}
        {showStars && item.rarity ? (
          <span className="absolute top-1 right-1 flex flex-col items-center">
            {Array.from({ length: item.rarity }, (_, i) => (
              <img key={i} src={img.star()} alt="" className="h-3 w-3 drop-shadow-md" />
            ))}
          </span>
        ) : null}
        {showClass && item.cls && (
          <img
            src={img.klass(item.cls)}
            alt=""
            className="absolute right-1 bottom-[26%] w-[26%] drop-shadow-md"
          />
        )}
        {showElement && item.element && (
          <img
            src={img.element(item.element)}
            alt=""
            className="absolute right-1 bottom-1 w-[24%] drop-shadow-md"
          />
        )}
        {showName && (
          <span className="from-scrim/90 text-content-strong absolute inset-x-0 bottom-0 bg-linear-to-t to-transparent px-1 pt-4 pb-1 text-center text-[10px] leading-tight font-semibold">
            {label}
          </span>
        )}
      </div>
      {skinLabel && (
        <span className="text-content-subtle mt-0.5 line-clamp-2 w-full text-center text-[10px] leading-tight">
          {skinLabel}
        </span>
      )}
    </div>
  );
});

// ── Label de tier (textarea auto-grandissant) ──

function TierLabel({
  value,
  onChange,
  onClick,
}: {
  value: string;
  onChange: (value: string) => void;
  onClick: (e: React.MouseEvent) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  // Redimensionné au contenu au montage et à chaque changement (y compris à
  // l'hydratation d'une liste partagée).
  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      rows={1}
      maxLength={60}
      onChange={(e) => onChange(e.target.value)}
      onClick={onClick}
      placeholder="…"
      className="w-full resize-none overflow-hidden bg-transparent text-center text-base leading-tight font-bold wrap-break-word text-[#1a1a1a] placeholder-[#1a1a1a]/40 focus:outline-none"
    />
  );
}

/** Aperçu estompé de l'item traîné, au point d'insertion pendant un drag. */
function DropPreview({
  src,
  size,
  card,
}: {
  src: string | undefined;
  size: IconSize;
  card?: boolean;
}) {
  const sizeCls = card ? `${CARD_SIZES[size]} ${CARD_ASPECT}` : ITEM_SIZES[size].box;
  return (
    <div
      className={`${sizeCls} shrink-0 overflow-hidden rounded-md border-2 border-dashed border-amber-400/80 bg-amber-400/10`}
    >
      {src && (
        <img
          src={src}
          alt=""
          draggable={false}
          className="h-full w-full rounded-md object-cover opacity-40"
        />
      )}
    </div>
  );
}

// ── Composant principal ──

/**
 * Éditeur de tier list (portage V2) : glisser-déposer (souris + tactile),
 * lignes éditables (label/couleur/ordre), pool filtrable en trois onglets,
 * partage par lien court (`?s=` via /api/tierlist, repli lien long `?z=`),
 * export PNG canvas et export/import JSON. L'état de la LISTE vit dans l'URL
 * (source de vérité partageable) ; seuls les réglages d'affichage sont
 * persistés (`useStoredState`, clé V2 `tlm-settings` absorbée).
 */
export function TierListMakerBrowser({
  characters,
  ee,
  bosses,
  labels: L,
}: {
  characters: TierItem[];
  ee: TierItem[];
  bosses: TierItem[];
  labels: TlmLabels;
}) {
  // Répertoire de tous les items disponibles.
  const itemMap = useMemo(() => {
    const m = new Map<string, TierItem>();
    for (const it of characters) m.set(it.key, it);
    for (const it of ee) m.set(it.key, it);
    for (const it of bosses) m.set(it.key, it);
    return m;
  }, [characters, ee, bosses]);

  const sourceByTab = useMemo<Record<Tab, TierItem[]>>(
    () => ({ characters, ee, bosses }),
    [characters, ee, bosses],
  );

  // Index stable par type — compacité et stabilité du lien de partage.
  const canon = useMemo(() => buildCanon(characters, ee, bosses), [characters, ee, bosses]);

  // État du tableau
  const [title, setTitle] = useState('');
  const [tiers, setTiers] = useState<Tier[]>(makeDefaultTiers);

  // État du pool
  const [tab, setTab] = useState<Tab>('characters');
  const [rawQuery, setRawQuery] = useState('');
  const query = useDeferredValue(rawQuery);
  const [elementFilter, setElementFilter] = useState<string[]>([]);
  const [classFilter, setClassFilter] = useState<string[]>([]);
  const [rarityFilter, setRarityFilter] = useState<number[]>([]);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [skinsOnly, setSkinsOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('default');

  // Réglages d'affichage persistés (un seul objet — cf. SETTINGS_SPEC).
  const [settings, setSettings] = useStoredState(SETTINGS_SPEC);
  const {
    iconSize,
    showNames,
    showElement,
    showClass,
    showRarity,
    showSkins,
    showSkinNames,
    showCards,
    cardSize,
    showCardTags,
  } = settings;
  const patchSettings = (patch: Partial<TlmSettings>) =>
    setSettings((prev) => ({ ...prev, ...patch }));
  const [showSettings, setShowSettings] = useState(false);

  // État d'interaction
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ key: string; x: number; y: number } | null>(null);
  const [dropAt, setDropAt] = useState<{ tierId: string; index: number } | null>(null);
  const [colorRow, setColorRow] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Quel nom afficher : un costume retombe sur le nom du perso de base quand
  // « noms de skin » est décoché.
  const labelFor = useCallback(
    (it: TierItem) => (it.isSkin && !showSkinNames ? (it.baseLabel ?? it.label) : it.label),
    [showSkinNames],
  );
  const shortFor = useCallback(
    (it: TierItem) => (it.isSkin && !showSkinNames ? it.baseShort : it.short),
    [showSkinNames],
  );

  // ── Hydratation depuis l'URL / synchro de l'URL ──
  const didHydrate = useRef(false);
  const lastUrlRef = useRef('');
  // Payload d'une liste ouverte par lien court `?s=` — conservé jusqu'à la
  // première édition pour que la barre d'adresse garde le lien compact.
  const shareBaselineRef = useRef<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;

    const apply = (z: string | null, fromShortLink = false) => {
      const decoded = decodeState(z, canon);
      if (decoded && decoded.tiers.length) {
        setTitle(decoded.title);
        setTiers(decoded.tiers);
        if (fromShortLink && z) shareBaselineRef.current = z;
      }
    };

    const params = new URLSearchParams(window.location.search);
    const shortId = params.get('s');
    if (shortId) {
      fetch(`/api/tierlist/${encodeURIComponent(shortId)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { z?: unknown } | null) => {
          if (typeof data?.z === 'string') apply(data.z, true);
        })
        .catch(() => {})
        .finally(() => setHydrated(true));
    } else {
      const z = params.get('z');
      // Différé en microtâche : même chemin asynchrone que la branche `?s=`
      // (pas de setState synchrone dans un effet — rendus en cascade).
      void Promise.resolve().then(() => {
        apply(z);
        setHydrated(true);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydratation unique
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const handle = setTimeout(() => {
      const z = encodeState(title, tiers, canon);
      // Liste inchangée encore sous son lien court → ne pas toucher l'URL.
      if (shareBaselineRef.current === z) return;
      const path = window.location.pathname;
      const isPristine = !title && tiers.every((t) => t.items.length === 0);
      const next = isPristine ? path : `${path}?z=${z}`;
      if (lastUrlRef.current !== next) {
        lastUrlRef.current = next;
        // replaceState ne met à jour QUE la barre d'adresse — pas de fetch RSC,
        // pas de re-rendu (contrairement à router.replace).
        window.history.replaceState(window.history.state, '', next);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [hydrated, title, tiers, canon]);

  // ── Dérivés : clés placées + pool ──
  const placed = useMemo(() => new Set(tiers.flatMap((t) => t.items)), [tiers]);

  const poolItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = sourceByTab[tab].filter((it) => {
      if (placed.has(it.key)) return false;
      // « Skins seulement » outrepasse le masquage par défaut des skins : le
      // filtre marche même quand le réglage est décoché.
      if (skinsOnly) {
        if (!it.isSkin) return false;
      } else if (it.isSkin && !showSkins) return false;
      if (elementFilter.length && (!it.element || !elementFilter.includes(it.element)))
        return false;
      if (classFilter.length && (!it.cls || !classFilter.includes(it.cls))) return false;
      if (rarityFilter.length && (it.rarity === undefined || !rarityFilter.includes(it.rarity)))
        return false;
      if (tagFilter.length && !it.tags?.some((tg) => tagFilter.includes(tg))) return false;
      if (q && !`${it.label} ${it.baseLabel ?? ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sort === 'default') return filtered;
    const arr = [...filtered];
    if (sort === 'name') arr.sort((a, b) => a.label.localeCompare(b.label));
    else if (sort === 'rarity')
      arr.sort((a, b) => (b.rarity ?? 0) - (a.rarity ?? 0) || a.label.localeCompare(b.label));
    else if (sort === 'element')
      arr.sort(
        (a, b) =>
          ELEMENT_ORDER.indexOf((a.element ?? '') as (typeof ELEMENT_ORDER)[number]) -
            ELEMENT_ORDER.indexOf((b.element ?? '') as (typeof ELEMENT_ORDER)[number]) ||
          a.label.localeCompare(b.label),
      );
    return arr;
  }, [
    sourceByTab,
    tab,
    placed,
    query,
    elementFilter,
    classFilter,
    rarityFilter,
    tagFilter,
    showSkins,
    skinsOnly,
    sort,
  ]);

  // ── Glisser-déposer (pointer events, souris + tactile) ──
  const startRef = useRef<{ x: number; y: number; key: string } | null>(null);
  const armedRef = useRef(false);
  const draggingRef = useRef(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Réordonnancement des lignes par poignée
  const rowDragId = useRef<string | null>(null);
  const rowDraggingRef = useRef(false);
  const [rowDragActive, setRowDragActive] = useState<string | null>(null);

  // Bloque le défilement de page pendant un drag actif (tactile).
  useEffect(() => {
    const block = (e: TouchEvent) => {
      if (draggingRef.current || rowDraggingRef.current) e.preventDefault();
    };
    document.addEventListener('touchmove', block, { passive: false });
    return () => document.removeEventListener('touchmove', block);
  }, []);

  const onRowHandlePointerDown = useCallback((e: React.PointerEvent, id: string) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.stopPropagation();
    rowDragId.current = id;
    rowDraggingRef.current = true;
    setRowDragActive(id);
    const onMove = (ev: PointerEvent) => {
      if (rowDragId.current)
        setTiers((prev) => moveRowToIndex(prev, rowDragId.current!, rowIndexAtY(ev.clientY)));
    };
    const onEnd = () => {
      rowDragId.current = null;
      rowDraggingRef.current = false;
      setRowDragActive(null);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
  }, []);

  const updateDragOver = useCallback((x: number, y: number) => {
    const d = computeDrop(x, y);
    setDropAt(d && d.type === 'tier' ? { tierId: d.tierId, index: d.index } : null);
  }, []);

  const handleDrop = useCallback((key: string, x: number, y: number) => {
    const d = computeDrop(x, y);
    if (!d) return;
    if (d.type === 'pool') setTiers((prev) => removeKey(prev, key));
    else setTiers((prev) => moveKeyToVisualIndex(prev, key, d.tierId, d.index));
  }, []);

  const handleTap = useCallback((key: string) => {
    setSelectedKey((cur) => (cur === key ? null : key));
  }, []);

  const endPointer = useRef<((e: PointerEvent) => void) | null>(null);
  const movePointer = useRef<((e: PointerEvent) => void) | null>(null);

  const cleanupPointer = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (movePointer.current) window.removeEventListener('pointermove', movePointer.current);
    if (endPointer.current) {
      window.removeEventListener('pointerup', endPointer.current);
      window.removeEventListener('pointercancel', endPointer.current);
    }
    startRef.current = null;
    armedRef.current = false;
    draggingRef.current = false;
  }, []);

  const onItemPointerDown = useCallback(
    (e: React.PointerEvent, key: string) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      startRef.current = { x: e.clientX, y: e.clientY, key };
      draggingRef.current = false;
      armedRef.current = e.pointerType === 'mouse';

      const onMove = (ev: PointerEvent) => {
        const s = startRef.current;
        if (!s) return;
        const dist = Math.hypot(ev.clientX - s.x, ev.clientY - s.y);
        if (!armedRef.current) {
          // Tactile avant la fin de l'appui long : bouger = défilement.
          if (dist > 10) cleanupPointer();
          return;
        }
        if (!draggingRef.current) {
          if (dist < DRAG_THRESHOLD) return;
          draggingRef.current = true;
        }
        setDrag({ key: s.key, x: ev.clientX, y: ev.clientY });
        updateDragOver(ev.clientX, ev.clientY);
      };

      const onEnd = (ev: PointerEvent) => {
        const s = startRef.current;
        const wasDragging = draggingRef.current;
        cleanupPointer();
        setDrag(null);
        setDropAt(null);
        if (!s) return;
        if (wasDragging) handleDrop(s.key, ev.clientX, ev.clientY);
        else handleTap(s.key);
      };

      movePointer.current = onMove;
      endPointer.current = onEnd;
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onEnd);
      window.addEventListener('pointercancel', onEnd);

      if (e.pointerType !== 'mouse') {
        holdTimer.current = setTimeout(() => {
          armedRef.current = true;
          draggingRef.current = true;
          const s = startRef.current;
          if (s) {
            setDrag({ key: s.key, x: s.x, y: s.y });
            updateDragOver(s.x, s.y);
          }
        }, TOUCH_HOLD_MS);
      }
    },
    [cleanupPointer, handleDrop, handleTap, updateDragOver],
  );

  useEffect(() => cleanupPointer, [cleanupPointer]);

  // ── Toucher-placer : taper un tier / le pool avec un item sélectionné ──
  const tapZone = useCallback(
    (e: React.MouseEvent, action: 'pool' | string) => {
      if ((e.target as HTMLElement).closest('[data-item-key]')) return; // géré par l'item
      if (!selectedKey) return;
      if (action === 'pool') setTiers((prev) => removeKey(prev, selectedKey));
      else setTiers((prev) => placeKey(prev, selectedKey, action, null));
      setSelectedKey(null);
    },
    [selectedKey],
  );

  // ── Opérations sur les lignes ──
  const updateTier = (id: string, patch: Partial<Tier>) =>
    setTiers((prev) => prev.map((tr) => (tr.id === id ? { ...tr, ...patch } : tr)));

  const addRow = (afterIdx: number) =>
    setTiers((prev) => {
      const next = [...prev];
      next.splice(afterIdx + 1, 0, {
        id: `t-${Math.random().toString(36).slice(2, 8)}`,
        label: '',
        color: TIER_PALETTE[next.length % TIER_PALETTE.length],
        items: [],
      });
      return next;
    });

  const deleteRow = (id: string) => {
    if (tiers.length <= 1) return;
    const row = tiers.find((tr) => tr.id === id);
    if (row && row.items.length > 0 && !window.confirm(L.confirmDeleteRow)) return;
    setTiers((prev) => prev.filter((tr) => tr.id !== id));
  };

  const moveRow = (idx: number, dir: -1 | 1) =>
    setTiers((prev) => {
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });

  const clearRow = (id: string) => {
    if (!window.confirm(L.confirmClearRow)) return;
    updateTier(id, { items: [] });
  };

  const resetAll = () => {
    if (!window.confirm(L.confirmReset)) return;
    setTitle('');
    setTiers(makeDefaultTiers());
    setSelectedKey(null);
    shareBaselineRef.current = null;
  };

  // ── Export / import JSON ──
  const importInputRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const data = {
      title,
      tiers: tiers.map((tr) => ({ label: tr.label, color: tr.color, items: tr.items })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title.trim() || 'tier-list').replace(/[^\w-]+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as {
          title?: unknown;
          tiers?: { label?: unknown; color?: unknown; items?: unknown }[];
        };
        if (!Array.isArray(data?.tiers)) throw new Error('bad');
        const next: Tier[] = data.tiers.map((tr, i) => ({
          id: `t${i}-${Math.random().toString(36).slice(2, 7)}`,
          label: typeof tr.label === 'string' ? tr.label : '',
          color: typeof tr.color === 'string' ? tr.color : TIER_PALETTE[i % TIER_PALETTE.length],
          items: Array.isArray(tr.items)
            ? tr.items.filter((k: unknown): k is string => typeof k === 'string' && itemMap.has(k))
            : [],
        }));
        if (!next.length) throw new Error('empty');
        setTitle(typeof data.title === 'string' ? data.title : '');
        setTiers(next);
        setSelectedKey(null);
        shareBaselineRef.current = null;
      } catch {
        window.alert(L.importError);
      }
    };
    reader.readAsText(file);
  };

  // ── Partage ──
  // Tente le stockage serveur et copie un lien court `?s=<id>` ; stockage
  // indisponible (dev, BDD coupée) → repli sur le lien long `?z=` autoporté.
  const copyLink = async () => {
    const z = encodeState(title, tiers, canon);
    const base = `${window.location.origin}${window.location.pathname}`;
    let url = `${base}?z=${z}`;
    try {
      const res = await fetch('/api/tierlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ z }),
      });
      if (res.ok) {
        const data = (await res.json()) as { id?: unknown };
        if (typeof data?.id === 'string') url = `${base}?s=${data.id}`;
      }
    } catch {
      // erreur réseau → on garde le lien long autoporté
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('', url);
    }
  };

  // ── Export PNG (reflète les réglages d'affichage à l'écran) ──
  const exportPng = useCallback(async () => {
    // Géométrie : portrait carré sans cartes, carte haute sinon.
    const ICON = { s: 56, m: 76, l: 100 }[iconSize];
    const CARD_W = { s: 66, m: 100, l: 120 }[cardSize];
    const CARD_H = Math.round((CARD_W * 231) / 120);
    const cellW = showCards ? CARD_W : ICON;
    const cellH = showCards ? CARD_H : ICON;
    const PER_ROW = 12,
      PAD = 20,
      LABEL_W = 110;
    const LABEL_PAD = 8,
      LINE_H = 24,
      LABEL_FONT = '700 20px system-ui, sans-serif';
    const NAME_PX = Math.max(10, Math.round(cellW * 0.16));
    const NAME_LH = NAME_PX + 2;
    const NAME_FONT = `500 ${NAME_PX}px system-ui, sans-serif`;

    const load = (src: string) =>
      new Promise<HTMLImageElement | null>((resolve) => {
        const im = new Image();
        im.crossOrigin = 'anonymous'; // canvas propre pour toBlob (assets R2)
        im.onload = () => resolve(im);
        im.onerror = () => resolve(null);
        im.src = src;
      });

    // Toutes les URLs : vignettes + les overlays que les réglages demandent.
    const urls = new Set<string>();
    for (const tr of tiers)
      for (const k of tr.items) {
        const it = itemMap.get(k);
        if (!it) continue;
        urls.add(showCards && it.card ? it.card : it.img);
        if (showElement && it.element) urls.add(img.element(it.element));
        if (showClass && it.cls) urls.add(img.klass(it.cls));
        if (showCards && showCardTags) {
          const b = recruitBadge(it.tags);
          if (b) urls.add(b);
        }
      }
    if (showRarity) urls.add(img.star());
    const loaded = new Map<string, HTMLImageElement>();
    await Promise.all(
      [...urls].map(async (u) => {
        const im = await load(u);
        if (im) loaded.set(u, im);
      }),
    );

    const canvas = document.createElement('canvas');
    // willReadFrequently force un canvas CPU : readback plus rapide, et
    // contourne les drivers GPU cassés qui rendent une image vide.
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Pré-wrap des noms : la hauteur d'une ligne de tier s'adapte au plus long.
    // Mode cartes : DEUX noms sous la cellule — perso de base (si showNames)
    // et nom du costume (toujours, pour un costume).
    ctx.font = NAME_FONT;
    const baseNameLines = new Map<string, string[]>();
    const skinNameLines = new Map<string, string[]>();
    for (const tr of tiers)
      for (const k of tr.items) {
        const it = itemMap.get(k);
        if (!it) continue;
        if (showCards) {
          if (showNames)
            baseNameLines.set(
              k,
              wrapLabel(ctx, it.baseShort ?? it.baseLabel ?? it.short ?? it.label, cellW - 2),
            );
          if (it.isSkin) skinNameLines.set(k, wrapLabel(ctx, it.short ?? it.label, cellW - 2));
        } else if (showNames) {
          baseNameLines.set(k, wrapLabel(ctx, shortFor(it) ?? labelFor(it), cellW - 2));
        }
      }
    const cellTotalH = tiers.map((tr) => {
      let extra = 0;
      if (showCards) {
        const maxBase = Math.max(0, ...tr.items.map((k) => baseNameLines.get(k)?.length ?? 0));
        const maxSkin = Math.max(0, ...tr.items.map((k) => skinNameLines.get(k)?.length ?? 0));
        if (maxBase || maxSkin) extra = (maxBase + maxSkin) * NAME_LH + 4;
      } else if (showNames) {
        const maxLines = Math.max(1, ...tr.items.map((k) => baseNameLines.get(k)?.length ?? 1));
        extra = maxLines * NAME_LH + 4;
      }
      return cellH + extra;
    });

    ctx.font = LABEL_FONT;
    const labelLines = tiers.map((tr) => wrapLabel(ctx, tr.label, LABEL_W - LABEL_PAD * 2));
    const rowHeights = tiers.map((tr, i) => {
      const itemsH = Math.max(1, Math.ceil(tr.items.length / PER_ROW)) * cellTotalH[i];
      const labelH = labelLines[i].length * LINE_H + LABEL_PAD * 2;
      return Math.max(itemsH, labelH);
    });

    const titleH = title.trim() ? 56 : 0;
    const contentW = LABEL_W + PER_ROW * cellW;
    const footerH = 30;
    const width = PAD * 2 + contentW;
    const height = PAD * 2 + titleH + rowHeights.reduce((a, b) => a + b, 0) + footerH;

    // Netteté sans dépasser la taille max d'un canvas (export silencieusement
    // vide au-delà).
    const MAX_SIDE = 8192;
    let scale = Math.min(window.devicePixelRatio || 1, 2);
    scale = Math.max(0.5, Math.min(scale, MAX_SIDE / width, MAX_SIDE / height));
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, width, height);

    const drawCover = (im: HTMLImageElement, dx: number, dy: number, dw: number, dh: number) => {
      const sc = Math.max(dw / im.width, dh / im.height);
      const sw = dw / sc,
        sh = dh / sc;
      ctx.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, dx, dy, dw, dh);
    };
    const drawContain = (im: HTMLImageElement, dx: number, dy: number, d: number) => {
      const k = Math.min(d / im.width, d / im.height);
      const w = im.width * k,
        h = im.height * k;
      ctx.drawImage(im, dx + (d - w) / 2, dy + (d - h) / 2, w, h);
    };

    let y = PAD;
    if (titleH) {
      ctx.fillStyle = '#fafafa';
      ctx.font = '700 30px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(title.trim(), width / 2, y + titleH / 2);
      y += titleH;
    }

    tiers.forEach((tr, ti) => {
      const rh = rowHeights[ti];
      // Cellule de label — wrap, centrée verticalement
      ctx.fillStyle = tr.color;
      ctx.fillRect(PAD, y, LABEL_W, rh);
      ctx.fillStyle = '#1a1a1a';
      ctx.font = LABEL_FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lines = labelLines[ti];
      const startY = y + (rh - lines.length * LINE_H) / 2 + LINE_H / 2;
      lines.forEach((ln, i) => ctx.fillText(ln, PAD + LABEL_W / 2, startY + i * LINE_H));
      // Fond de la rangée d'items
      ctx.fillStyle = '#131c2e';
      ctx.fillRect(PAD + LABEL_W, y, PER_ROW * cellW, rh);
      // Items
      tr.items.forEach((k, idx) => {
        const it = itemMap.get(k);
        if (!it) return;
        const isCard = !!(showCards && it.card);
        const src = isCard ? it.card! : it.img;
        const im = loaded.get(src);
        if (!im) return;
        const cellX = PAD + LABEL_W + (idx % PER_ROW) * cellW;
        const cellY = y + Math.floor(idx / PER_ROW) * cellTotalH[ti];
        const pad = isCard ? 0 : 3;
        const boxW = cellW - pad * 2;
        const boxH = cellH - pad * 2;
        const bx = cellX + pad,
          by = cellY + pad;
        // Vignette (arrondie, recadrée pour remplir)
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(bx, by, boxW, boxH, isCard ? 4 : 6);
        ctx.clip();
        drawCover(im, bx, by, boxW, boxH);
        ctx.restore();
        // Overlays — positions par mode (cartes : élément/classe en bas à
        // droite ; portrait : élément en haut, classe sur le côté).
        if (isCard) {
          if (showElement && it.element) {
            const el = loaded.get(img.element(it.element));
            if (el) {
              const s = boxW * 0.24;
              drawContain(el, bx + boxW - s - 2, by + boxH - s - 4, s);
            }
          }
          if (showClass && it.cls) {
            const cl = loaded.get(img.klass(it.cls));
            if (cl) {
              const s = boxW * 0.26;
              drawContain(cl, bx + boxW - s - 2, by + boxH - s * 2 - 8, s);
            }
          }
          if (showRarity && it.rarity) {
            const star = loaded.get(img.star());
            if (star) {
              const s = boxW * 0.16;
              for (let r = 0; r < it.rarity; r++)
                drawContain(star, bx + boxW - s - 4, by + 4 + r * (s + 1), s);
            }
          }
          if (showCardTags) {
            const badgeSrc = recruitBadge(it.tags);
            const bd = badgeSrc ? loaded.get(badgeSrc) : null;
            if (bd) {
              const bw = boxW * 0.6;
              const bh = (bw * bd.height) / bd.width;
              ctx.drawImage(bd, bx + 2, by + 2, bw, bh);
            }
          }
        } else {
          if (showElement && it.element) {
            const el = loaded.get(img.element(it.element));
            if (el) {
              const s = boxW * 0.4;
              drawContain(el, bx + boxW - s, by, s);
            }
          }
          if (showClass && it.cls) {
            const cl = loaded.get(img.klass(it.cls));
            if (cl) {
              const s = boxW * 0.28;
              drawContain(cl, bx + boxW - s, by + boxW * 0.4, s);
            }
          }
          if (showRarity && it.rarity) {
            const star = loaded.get(img.star());
            if (star) {
              const s = boxW * 0.2;
              let sx = bx + (boxW - it.rarity * s) / 2;
              const sy = by + boxW - s - 2;
              for (let r = 0; r < it.rarity; r++) {
                drawContain(star, sx, sy, s);
                sx += s;
              }
            }
          }
        }
        // Noms sous la cellule — base puis costume (cartes) ou base (portrait).
        ctx.font = NAME_FONT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        let ty = cellY + cellH + 2;
        if (isCard) {
          if (showNames) {
            ctx.fillStyle = '#d4d4d8';
            const bn = baseNameLines.get(k) ?? [];
            bn.forEach((ln, i) => ctx.fillText(ln, cellX + cellW / 2, ty + i * NAME_LH));
            ty += bn.length * NAME_LH;
          }
          if (it.isSkin) {
            ctx.fillStyle = '#a1a1aa';
            (skinNameLines.get(k) ?? []).forEach((ln, i) =>
              ctx.fillText(ln, cellX + cellW / 2, ty + i * NAME_LH),
            );
          }
        } else if (showNames) {
          ctx.fillStyle = '#d4d4d8';
          (baseNameLines.get(k) ?? []).forEach((ln, i) =>
            ctx.fillText(ln, cellX + cellW / 2, ty + i * NAME_LH),
          );
        }
      });
      y += rh;
    });

    ctx.fillStyle = '#71717a';
    ctx.font = '500 15px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('outerpedia.com', width - PAD, y + footerH / 2);

    // Garde-fou : readback vide (canvas GPU cassé, navigateur anti-empreinte
    // qui neutralise le canvas, image R2 sans CORS) → message clair plutôt
    // qu'un PNG vide téléchargé en silence.
    try {
      if (ctx.getImageData(5, 5, 1, 1).data[3] === 0) {
        window.alert(L.exportBlocked);
        return;
      }
    } catch {
      window.alert(L.exportBlocked);
      return;
    }

    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          window.alert(L.exportBlocked);
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(title.trim() || 'tier-list').replace(/[^\w-]+/g, '_')}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch {
      // un canvas « taint » jette ici — le dire plutôt que d'échouer muet
      window.alert(L.exportBlocked);
    }
  }, [
    tiers,
    title,
    itemMap,
    iconSize,
    showNames,
    showElement,
    showClass,
    showRarity,
    showCards,
    cardSize,
    showCardTags,
    labelFor,
    shortFor,
    L.exportBlocked,
  ]);

  // ── Rendu ──
  // Compte les persos de BASE — les costumes sont un extra opt-in masqué par défaut.
  const baseCharCount = useMemo(() => characters.filter((c) => !c.isSkin).length, [characters]);
  const TABS: { id: Tab; count: number }[] = [
    { id: 'characters', count: baseCharCount },
    { id: 'ee', count: ee.length },
    { id: 'bosses', count: bosses.length },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      {/* Titre + barre d'outils */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={L.titlePlaceholder}
          maxLength={100}
          className="border-line bg-surface-raised/60 text-content-strong placeholder-content-subtle w-full rounded-lg border px-3 py-2 text-lg font-semibold focus:border-sky-500 focus:outline-none sm:max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          <ToolbarButton onClick={copyLink} icon={copied ? <FaCheck /> : <FaLink />}>
            {copied ? L.copied : L.share}
          </ToolbarButton>
          <ToolbarButton onClick={exportPng} icon={<FaImage />}>
            {L.exportPng}
          </ToolbarButton>
          <div className="relative">
            <ToolbarButton onClick={() => setShowSettings((v) => !v)} icon={<FaGear />}>
              {L.settings}
            </ToolbarButton>
            {showSettings && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
                <div className="border-line bg-surface-raised absolute right-0 z-50 mt-2 w-60 rounded-lg border p-3 text-sm shadow-xl">
                  <p className="text-content-muted mb-1 text-xs tracking-wide uppercase">
                    {L.iconSize}
                  </p>
                  <div className="mb-3 flex gap-1.5">
                    {(['s', 'm', 'l'] as IconSize[]).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => patchSettings({ iconSize: sz })}
                        className={[
                          'flex-1 rounded px-2 py-1 text-xs font-medium transition',
                          iconSize === sz
                            ? 'bg-accent text-accent-fg'
                            : 'bg-surface-overlay text-content-muted hover:bg-surface-overlay/70',
                        ].join(' ')}
                      >
                        {L.sizes[sz]}
                      </button>
                    ))}
                  </div>
                  <SettingRow
                    label={L.showNames}
                    checked={showNames}
                    onChange={(v) => patchSettings({ showNames: v })}
                  />
                  <SettingRow
                    label={L.showElement}
                    checked={showElement}
                    onChange={(v) => patchSettings({ showElement: v })}
                  />
                  <SettingRow
                    label={L.showClass}
                    checked={showClass}
                    onChange={(v) => patchSettings({ showClass: v })}
                  />
                  <SettingRow
                    label={L.showRarity}
                    checked={showRarity}
                    onChange={(v) => patchSettings({ showRarity: v })}
                  />
                  <div className="border-line/60 mt-2 border-t pt-2">
                    <SettingRow
                      label={L.showSkins}
                      checked={showSkins}
                      onChange={(v) => patchSettings({ showSkins: v })}
                    />
                    <SettingRow
                      label={L.showSkinNames}
                      checked={showSkinNames}
                      onChange={(v) => patchSettings({ showSkinNames: v })}
                    />
                  </div>
                  <div className="border-line/60 mt-2 border-t pt-2">
                    <SettingRow
                      label={L.showCards}
                      checked={showCards}
                      onChange={(v) => patchSettings({ showCards: v })}
                    />
                    {showCards && (
                      <>
                        <p className="text-content-muted mb-1 text-xs tracking-wide uppercase">
                          {L.cardSize}
                        </p>
                        <div className="mb-3 flex gap-1.5">
                          {(['s', 'm', 'l'] as IconSize[]).map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => patchSettings({ cardSize: sz })}
                              className={[
                                'flex-1 rounded px-2 py-1 text-xs font-medium transition',
                                cardSize === sz
                                  ? 'bg-accent text-accent-fg'
                                  : 'bg-surface-overlay text-content-muted hover:bg-surface-overlay/70',
                              ].join(' ')}
                            >
                              {L.sizes[sz]}
                            </button>
                          ))}
                        </div>
                        <SettingRow
                          label={L.showCardTags}
                          checked={showCardTags}
                          onChange={(v) => patchSettings({ showCardTags: v })}
                        />
                      </>
                    )}
                  </div>
                  <div className="border-line/60 flex gap-2 border-t pt-3">
                    <button
                      type="button"
                      onClick={exportJson}
                      className="bg-surface-overlay text-content hover:bg-surface-overlay/70 flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs"
                    >
                      <FaFileExport /> {L.exportJson}
                    </button>
                    <button
                      type="button"
                      onClick={() => importInputRef.current?.click()}
                      className="bg-surface-overlay text-content hover:bg-surface-overlay/70 flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs"
                    >
                      <FaFileImport /> {L.importJson}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          <ToolbarButton onClick={resetAll} icon={<FaArrowRotateLeft />} danger>
            {L.reset}
          </ToolbarButton>
        </div>
      </div>

      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importJson(f);
          e.target.value = '';
        }}
      />

      <p className="text-content-subtle mb-3 text-center text-xs">{L.hint}</p>

      <div className="lg:flex lg:items-start lg:gap-4">
        <div className="lg:min-w-0 lg:flex-1">
          {/* Lignes de tiers */}
          <div className="border-line overflow-hidden rounded-lg border">
            {tiers.map((tier, idx) => {
              const isOver = dropAt?.tierId === tier.id;
              return (
                <div
                  key={tier.id}
                  data-drop="tier"
                  data-tier-id={tier.id}
                  onClick={(e) => tapZone(e, tier.id)}
                  className={[
                    'border-line/60 flex border-b transition-colors last:border-b-0',
                    rowDragActive === tier.id
                      ? 'relative z-10 ring-2 ring-amber-400 ring-inset'
                      : '',
                    isOver
                      ? 'bg-amber-400/10'
                      : selectedKey
                        ? 'hover:bg-surface-overlay/40 cursor-pointer'
                        : '',
                  ].join(' ')}
                >
                  {/* Cellule de label */}
                  <div
                    className="relative flex w-16 shrink-0 items-center justify-center p-1 sm:w-28"
                    style={{ backgroundColor: tier.color }}
                  >
                    <TierLabel
                      value={tier.label}
                      onChange={(value) => updateTier(tier.id, { label: value })}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setColorRow(colorRow === tier.id ? null : tier.id);
                      }}
                      title={L.color}
                      className="absolute right-0.5 bottom-0.5 h-4 w-4 rounded-full border border-[#1a1a1a]/40 bg-[#1a1a1a]/20"
                    />
                    {colorRow === tier.id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={(e) => {
                            e.stopPropagation();
                            setColorRow(null);
                          }}
                        />
                        <div
                          className="border-line bg-surface-raised absolute top-full left-1/2 z-50 mt-1 -translate-x-1/2 rounded-lg border p-2 shadow-xl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="grid grid-cols-6 gap-1">
                            {TIER_PALETTE.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  updateTier(tier.id, { color: c });
                                  setColorRow(null);
                                }}
                                className="border-line h-6 w-6 rounded border"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                          <input
                            type="color"
                            value={tier.color}
                            onChange={(e) => updateTier(tier.id, { color: e.target.value })}
                            className="mt-2 h-7 w-full cursor-pointer rounded bg-transparent"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Zone d'items */}
                  <div
                    data-items
                    className="bg-surface-sunken/60 flex min-h-15 flex-1 flex-wrap content-start gap-1 p-1.5"
                  >
                    {(() => {
                      const showMarker = !!drag && dropAt?.tierId === tier.id;
                      const markerIdx = dropAt?.index ?? -1;
                      const dragIt = drag ? itemMap.get(drag.key) : undefined;
                      const useCardForDrag = showCards && !!dragIt?.card;
                      const dragImg = useCardForDrag ? dragIt!.card : dragIt?.img;
                      const marker = (
                        <DropPreview
                          key="drop-marker"
                          src={dragImg}
                          size={useCardForDrag ? cardSize : iconSize}
                          card={useCardForDrag}
                        />
                      );
                      const nodes: React.ReactNode[] = [];
                      tier.items.forEach((key, i) => {
                        if (showMarker && i === markerIdx) nodes.push(marker);
                        const it = itemMap.get(key);
                        if (!it) return;
                        if (showCards && it.card) {
                          nodes.push(
                            <CardView
                              key={key}
                              item={it}
                              selected={selectedKey === key}
                              dimmed={drag?.key === key}
                              /* Les cartes affichent toujours le nom du perso de
                                 base ; le nom du costume passe sous la carte. */
                              label={it.baseLabel ?? it.label}
                              skinLabel={it.isSkin ? it.label : undefined}
                              size={cardSize}
                              showName={showNames}
                              showElement={showElement}
                              showClass={showClass}
                              showStars={showRarity}
                              showBadge={showCardTags}
                              onPointerDown={onItemPointerDown}
                            />,
                          );
                        } else {
                          nodes.push(
                            <ItemView
                              key={key}
                              item={it}
                              selected={selectedKey === key}
                              dimmed={drag?.key === key}
                              label={labelFor(it)}
                              shortLabel={shortFor(it)}
                              size={iconSize}
                              showName={showNames}
                              showElement={showElement}
                              showClass={showClass}
                              showRarity={showRarity}
                              onPointerDown={onItemPointerDown}
                            />,
                          );
                        }
                      });
                      if (showMarker && markerIdx >= tier.items.length) nodes.push(marker);
                      return nodes;
                    })()}
                  </div>

                  {/* Commandes de ligne */}
                  <div className="border-line/60 bg-surface-sunken/60 flex shrink-0 flex-col items-center justify-center gap-1 border-l px-1.5">
                    <button
                      type="button"
                      onPointerDown={(e) => onRowHandlePointerDown(e, tier.id)}
                      onClick={(e) => e.stopPropagation()}
                      title={L.dragRow}
                      className="text-content-subtle hover:bg-surface-overlay hover:text-content-strong flex h-6 w-6 cursor-grab touch-none items-center justify-center rounded text-sm transition"
                    >
                      <FaGripVertical />
                    </button>
                    <RowBtn onClick={() => moveRow(idx, -1)} disabled={idx === 0} title={L.moveUp}>
                      <FaChevronUp />
                    </RowBtn>
                    <RowBtn
                      onClick={() => moveRow(idx, 1)}
                      disabled={idx === tiers.length - 1}
                      title={L.moveDown}
                    >
                      <FaChevronDown />
                    </RowBtn>
                    <RowBtn
                      onClick={() => clearRow(tier.id)}
                      disabled={tier.items.length === 0}
                      title={L.clearRow}
                    >
                      <FaXmark />
                    </RowBtn>
                    <RowBtn
                      onClick={() => deleteRow(tier.id)}
                      disabled={tiers.length <= 1}
                      title={L.deleteRow}
                      danger
                    >
                      <FaTrash />
                    </RowBtn>
                    <RowBtn onClick={() => addRow(idx)} title={L.addRow}>
                      <FaPlus />
                    </RowBtn>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pool — panneau latéral en desktop, empilé en dessous en mobile */}
        <div className="mt-6 lg:sticky lg:top-4 lg:mt-0 lg:max-h-[calc(100dvh-1.5rem)] lg:w-96 lg:shrink-0 lg:self-start lg:overflow-y-auto">
          {/* Onglets */}
          <div className="mb-3 flex flex-wrap justify-center gap-2">
            {TABS.map(({ id, count }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={[
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                  tab === id
                    ? 'bg-accent text-accent-fg'
                    : 'bg-surface-overlay text-content-muted hover:bg-surface-overlay/70',
                ].join(' ')}
              >
                {L.tabs[id]}
                <span className="ml-1.5 text-xs opacity-60">{count}</span>
              </button>
            ))}
          </div>

          {/* Recherche + filtres */}
          <input
            type="search"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder={L.search}
            className="border-line bg-surface-raised/60 placeholder-content-subtle w-full rounded-lg border px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-center gap-2">
            <label className="text-content-muted text-xs">{L.sort}</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="border-line bg-surface-overlay text-content rounded border px-2 py-1 text-xs focus:border-sky-500 focus:outline-none"
            >
              {SORT_KEYS.map((k) => (
                <option key={k} value={k}>
                  {L.sorts[k]}
                </option>
              ))}
            </select>
          </div>
          {tab === 'characters' && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              <div className="flex gap-1.5">
                {ELEMENT_ORDER.map((el) => (
                  <FilterPill
                    key={el}
                    active={elementFilter.includes(el)}
                    onClick={() =>
                      setElementFilter((f) =>
                        f.includes(el) ? f.filter((x) => x !== el) : [...f, el],
                      )
                    }
                    className="h-8 w-8 px-0"
                    title={el}
                  >
                    <img src={img.element(el)} alt={el} className="h-6 w-6" />
                  </FilterPill>
                ))}
              </div>
              <div className="flex gap-1.5">
                {CLASSES.map((cl) => (
                  <FilterPill
                    key={cl}
                    active={classFilter.includes(cl)}
                    onClick={() =>
                      setClassFilter((f) =>
                        f.includes(cl) ? f.filter((x) => x !== cl) : [...f, cl],
                      )
                    }
                    className="h-8 w-8 px-0"
                    title={cl}
                  >
                    <img src={img.klass(cl)} alt={cl} className="h-6 w-6" />
                  </FilterPill>
                ))}
              </div>
              <div className="flex gap-1.5">
                {RARITIES.map((r) => (
                  <FilterPill
                    key={r}
                    active={rarityFilter.includes(r)}
                    onClick={() =>
                      setRarityFilter((f) => (f.includes(r) ? f.filter((x) => x !== r) : [...f, r]))
                    }
                    className="h-8 px-2"
                    title={`${r}★`}
                  >
                    <span className="text-xs leading-none font-semibold">{r}★</span>
                  </FilterPill>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {FILTER_TAGS.map((tg) => (
                  <FilterPill
                    key={tg}
                    active={tagFilter.includes(tg)}
                    onClick={() =>
                      setTagFilter((f) => (f.includes(tg) ? f.filter((x) => x !== tg) : [...f, tg]))
                    }
                    className="h-8 px-2"
                    title={L.tags[tg]}
                  >
                    <span className="text-xs leading-none font-medium">{L.tags[tg]}</span>
                  </FilterPill>
                ))}
                <FilterPill
                  active={skinsOnly}
                  onClick={() => setSkinsOnly((v) => !v)}
                  className="h-8 px-2"
                  title={L.skinsOnly}
                >
                  <span className="text-xs leading-none font-medium">{L.skinsOnly}</span>
                </FilterPill>
              </div>
            </div>
          )}

          {/* Grille du pool (cible de drop pour dé-ranger) */}
          <div
            data-drop="pool"
            onClick={(e) => tapZone(e, 'pool')}
            className="border-line bg-surface-sunken/40 mt-4 flex min-h-20 flex-wrap content-start justify-center gap-1.5 rounded-lg border border-dashed p-3"
          >
            {poolItems.length === 0 ? (
              <p className="text-content-subtle py-6 text-sm">
                {placed.size > 0 &&
                query.trim() === '' &&
                elementFilter.length === 0 &&
                classFilter.length === 0 &&
                rarityFilter.length === 0 &&
                tagFilter.length === 0 &&
                !skinsOnly
                  ? L.emptyPool
                  : L.noResults}
              </p>
            ) : (
              poolItems.map((it) => (
                <ItemView
                  key={it.key}
                  item={it}
                  selected={selectedKey === it.key}
                  dimmed={drag?.key === it.key}
                  label={labelFor(it)}
                  shortLabel={shortFor(it)}
                  size={iconSize}
                  showName={showNames}
                  showElement={showElement}
                  showClass={showClass}
                  showRarity={showRarity}
                  onPointerDown={onItemPointerDown}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Fantôme de drag */}
      {drag && (
        <div
          className="pointer-events-none fixed z-100 -translate-x-1/2 -translate-y-1/2 opacity-90"
          style={{ left: drag.x, top: drag.y }}
        >
          <img
            src={itemMap.get(drag.key)?.img}
            alt=""
            className="h-16 w-16 rounded-md border-2 border-amber-400 object-cover shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

// ── Petites briques UI ──

function SettingRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="mb-2 flex cursor-pointer items-center justify-between">
      <span className="text-content">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-sky-500"
      />
    </label>
  );
}

function ToolbarButton({
  onClick,
  icon,
  children,
  danger,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition',
        danger
          ? 'bg-danger-deep/40 hover:bg-danger-deep/70 text-red-200'
          : 'bg-surface-overlay text-content hover:bg-surface-overlay/70',
      ].join(' ')}
    >
      {icon}
      {children}
    </button>
  );
}

function RowBtn({
  onClick,
  disabled,
  title,
  children,
  danger,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={[
        'flex h-6 w-6 items-center justify-center rounded text-sm transition',
        disabled
          ? 'text-content-subtle/40 cursor-not-allowed'
          : danger
            ? 'text-danger hover:bg-danger-deep/40'
            : 'text-content-muted hover:bg-surface-overlay hover:text-content-strong',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
