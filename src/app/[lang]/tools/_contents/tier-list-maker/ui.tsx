'use client';

/**
 * Briques d'affichage du Tier List Maker — la vignette et la carte d'un item,
 * le label de tier, l'aperçu de drop, et les petits contrôles de la barre
 * d'outils et des lignes. Extrait de `TierListMakerBrowser.tsx` le 03/10/2026
 * (découpage mécanique, contenu inchangé).
 */
import { memo, useEffect, useRef } from 'react';
import { img } from '@/lib/images';
import { Portrait } from '@/components/character/Portrait';
import { FILTER_TAGS, type IconSize, type TierItem } from './contracts';

/**
 * Badge de recrutement pour un jeu de tags — MÊME règle que les cartes de
 * perso : les `tags` arrivent déjà triés canoniquement (`characterTags` →
 * `sortTags`), donc le premier qui a une icône fait le badge. L'ordre en dur
 * qui vivait ici contredisait celui du glossaire.
 */
export function recruitBadge(tags?: string[]): string | null {
  const tag = tags?.find((t) => FILTER_TAGS.includes(t));
  return tag ? img.tag(tag) : null;
}

// ── Vignette d'item ──

const ITEM_SIZES: Record<IconSize, { box: string; col: string }> = {
  s: { box: 'h-9 w-9 sm:h-11 sm:w-11', col: 'w-9 sm:w-11' },
  m: { box: 'h-12 w-12 sm:h-14 sm:w-14', col: 'w-12 sm:w-14' },
  l: { box: 'h-16 w-16 sm:h-20 sm:w-20', col: 'w-16 sm:w-20' },
};

/**
 * Largeurs des cartes de la grille rangée. La HAUTEUR ne s'écrit plus ici : c'est
 * `Portrait` qui porte le ratio du cadre du jeu (180×344), et il n'était pas celui
 * qu'on posait — `aspect-[120/231]` valait 0,5195 quand le prefab dit 0,5233, soit
 * un cadre étiré de 0,7 % que l'`object-cover` rattrapait en ROGNANT l'art.
 */
const CARD_SIZES: Record<IconSize, string> = {
  s: 'w-[66px]',
  m: 'w-25',
  l: 'w-30',
};
/** Les mêmes largeurs en pixels — l'export PNG et l'aperçu de glissé en ont besoin. */
export const CARD_PX: Record<IconSize, number> = { s: 66, m: 100, l: 120 };

type ItemViewProps = {
  item: TierItem;
  selected: boolean;
  dimmed: boolean;
  /** Nom du PERSO (toggle « noms ») — pour un skin, celui du perso de base. */
  label: string;
  shortLabel?: string;
  /** Nom du SKIN, en ligne dédiée sous le portrait (toggle « noms de skin »). */
  skinLabel?: string;
  size: IconSize;
  showName: boolean;
  showElement: boolean;
  showClass: boolean;
  showRarity: boolean;
  onPointerDown: (e: React.PointerEvent, key: string) => void;
  /** Sélection au CLAVIER (Entrée / Espace) — la souris passe par `onPointerDown`. */
  onKeySelect: (key: string) => void;
};

export const ItemView = memo(function ItemView({
  item,
  selected,
  dimmed,
  label,
  shortLabel,
  skinLabel,
  size,
  showName,
  showElement,
  showClass,
  showRarity,
  onPointerDown,
  onKeySelect,
}: ItemViewProps) {
  const s = ITEM_SIZES[size];
  return (
    // Un bouton pour le CLAVIER : `detail === 0` signe un clic né d'Entrée ou
    // d'Espace — le tap souris/tactile, lui, sélectionne déjà au `pointerup`
    // (le compter ici le désélectionnerait aussitôt).
    <button
      type="button"
      data-item-key={item.key}
      onPointerDown={(e) => onPointerDown(e, item.key)}
      onClick={(e) => e.detail === 0 && onKeySelect(item.key)}
      aria-label={label}
      aria-pressed={selected}
      title={item.label}
      className={`relative flex shrink-0 cursor-grab touch-none flex-col items-center select-none ${showName || skinLabel ? s.col : ''} ${dimmed ? 'opacity-30' : ''}`}
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
            aria-hidden
            className="absolute -top-1 -right-1 h-[40%] w-[40%] drop-shadow-md"
          />
        )}
        {showClass && item.cls && (
          <img
            src={img.klass(item.cls)}
            alt=""
            aria-hidden
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
                aria-hidden
                className="h-3 w-3 drop-shadow-md"
                style={{ marginLeft: i ? -3 : 0 }}
                width={12}
                height={12}
              />
            ))}
          </span>
        ) : null}
      </div>
      {showName && (
        <span className="text-content-muted text-2xs mt-0.5 w-full text-center leading-tight hyphens-auto">
          {shortLabel || label}
        </span>
      )}
      {skinLabel && (
        <span className="text-content-subtle text-2xs mt-0.5 line-clamp-2 w-full text-center leading-tight">
          {skinLabel}
        </span>
      )}
    </button>
  );
});

// ── Carte pleine (grille rangée en mode « cartes ») ──

/**
 * LA CARTE, C'EST LE PORTRAIT DU JEU — plus le chrome de l'outil.
 *
 * Elle en portait une IMITATION : l'art collé en `object-cover` dans un cadre au
 * mauvais ratio, les étoiles empilées à la verticale sans le rail sombre ni les six
 * creux, la classe à 26 % de la largeur et l'élément à 24 % (le prefab dit 20,6 %
 * et 25,6 %, et ils ne sont PAS alignés l'un sur l'autre), le nom posé sur un
 * dégradé qui n'existe pas dans le prefab (`LowBg` y est inactif), et pas de titre
 * du tout. Trois transcriptions manuscrites du même nœud vivaient sur le site ; il
 * n'en reste qu'une, et elle est lue au prefab.
 *
 * Les réglages de l'outil se traduisent en props du portrait plutôt qu'en calques
 * dessinés à côté : l'élément et la classe se coupent en n'étant pas passés, le nom
 * par `hideName`, les étoiles par `hideStars`. Seul le badge de recrutement reste
 * posé PAR-DESSUS — c'est une convention éditoriale du site, le jeu n'en a pas sur
 * ce nœud (cf. `CharacterCard`, qui fait exactement pareil).
 */
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
  /** Sélection au CLAVIER (Entrée / Espace) — la souris passe par `onPointerDown`. */
  onKeySelect: (key: string) => void;
};

export const CardView = memo(function CardView({
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
  onKeySelect,
}: CardViewProps) {
  const badge = showBadge ? recruitBadge(item.tags) : null;
  return (
    // Bouton clavier : même règle que `ItemView`.
    <button
      type="button"
      data-item-key={item.key}
      onPointerDown={(e) => onPointerDown(e, item.key)}
      onClick={(e) => e.detail === 0 && onKeySelect(item.key)}
      aria-label={skinLabel ?? label}
      aria-pressed={selected}
      title={skinLabel ?? label}
      className={[
        CARD_SIZES[size],
        'relative flex shrink-0 cursor-grab touch-none flex-col items-center select-none',
        dimmed ? 'opacity-30' : '',
      ].join(' ')}
    >
      <div
        className={[
          'relative w-full overflow-hidden rounded transition',
          selected ? 'ring-2 ring-amber-400' : 'ring-line-subtle ring-1',
        ].join(' ')}
      >
        <Portrait
          id={item.cardId!}
          name={label}
          prefix={item.prefix}
          rarity={item.rarity ?? 1}
          element={showElement ? item.element : undefined}
          cls={showClass ? item.cls : undefined}
          hideName={!showName}
          hideStars={!showStars}
          className="w-full"
        />
        {/* Le badge de recrutement — le seul calque qui reste par-dessus : c'est
            une convention du site, pas du prefab (cf. `CharacterCard`). */}
        {badge && <img src={badge} alt="" aria-hidden className="absolute top-1 left-1 w-[60%]" />}
      </div>
      {skinLabel && (
        <span className="text-content-subtle text-2xs mt-0.5 line-clamp-2 w-full text-center leading-tight">
          {skinLabel}
        </span>
      )}
    </button>
  );
});

// ── Label de tier (textarea auto-grandissant) ──

export function TierLabel({
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
export function DropPreview({
  src,
  size,
  card,
}: {
  src: string | undefined;
  size: IconSize;
  card?: boolean;
}) {
  // Le cadre du jeu (180×344) quand c'est une carte, sinon la boîte carrée.
  const sizeCls = card ? `${CARD_SIZES[size]} aspect-180/344` : ITEM_SIZES[size].box;
  return (
    <div
      className={`${sizeCls} shrink-0 overflow-hidden rounded-md border-2 border-dashed border-amber-400/80 bg-amber-400/10`}
    >
      {src && (
        <img
          src={src}
          alt=""
          aria-hidden
          draggable={false}
          className="h-full w-full rounded-md object-cover opacity-40"
        />
      )}
    </div>
  );
}

// ── Petites briques UI ──

export function SettingRow({
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

export function ToolbarButton({
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

/**
 * Bouton de commande de ligne — inactivé par `aria-disabled`, JAMAIS par
 * l'attribut `disabled` : Firefox RESTAURE l'état des contrôles de formulaire
 * au rechargement (F5), donc un bouton que le JS avait activé après coup (une
 * ligne remplie par le `?z=` de l'URL) revient activé AVANT l'hydratation —
 * React voit un DOM qui ne correspond plus à son rendu et crie au mismatch.
 * Rien à restaurer ici : l'attribut ne bouge plus, la garde est dans le
 * `onClick` (le `stopPropagation` reste inconditionnel, sinon un clic sur un
 * bouton inactif retomberait sur le `onClick` de la ligne).
 */
export function RowBtn({
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
        if (disabled) return;
        onClick();
      }}
      aria-disabled={!!disabled}
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
