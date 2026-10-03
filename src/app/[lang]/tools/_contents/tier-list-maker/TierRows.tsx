'use client';

/**
 * Lignes de tiers du Tier List Maker : cellule de label (texte + couleur),
 * zone d'items (vignettes ou cartes, marqueur d'insertion pendant un glissé,
 * bouton de placement clavier) et commandes de ligne. Extrait du composant
 * principal (découpage du 03/10/2026 — JSX déplacé tel quel ; l'état de la
 * liste, les gestes et les opérations de ligne restent au parent, seul le
 * sélecteur de couleur ouvert vit ici).
 */
import { useState } from 'react';
import {
  FaPlus,
  FaTrash,
  FaChevronUp,
  FaChevronDown,
  FaXmark,
  FaGripVertical,
} from 'react-icons/fa6';
import { img } from '@/lib/images';
import { TIER_PALETTE, type Tier } from './share-codec';
import type { IconSize, TierItem, TlmLabels } from './contracts';
import { CardView, DropPreview, ItemView, RowBtn, TierLabel } from './ui';

export function TierRows({
  tiers,
  dropAt,
  drag,
  rowDragActive,
  selectedKey,
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
  skinLabelFor,
  tapZone,
  placeByKeyboard,
  placeBtnClass,
  onItemPointerDown,
  keySelect,
  onRowHandlePointerDown,
  updateTier,
  moveRow,
  clearRow,
  deleteRow,
  addRow,
  labels: L,
}: {
  tiers: Tier[];
  /** Point d'insertion survolé pendant un glissé d'item. */
  dropAt: { tierId: string; index: number } | null;
  drag: { key: string; x: number; y: number } | null;
  /** Id de la ligne tenue par sa poignée. */
  rowDragActive: string | null;
  selectedKey: string | null;
  itemMap: Map<string, TierItem>;
  iconSize: IconSize;
  showNames: boolean;
  showElement: boolean;
  showClass: boolean;
  showRarity: boolean;
  showCards: boolean;
  cardSize: IconSize;
  showCardTags: boolean;
  labelFor: (it: TierItem) => string;
  shortFor: (it: TierItem) => string | undefined;
  skinLabelFor: (it: TierItem) => string | undefined;
  tapZone: (e: React.MouseEvent, action: string) => void;
  placeByKeyboard: (e: React.MouseEvent, action: string) => void;
  placeBtnClass: string;
  onItemPointerDown: (e: React.PointerEvent, key: string) => void;
  keySelect: (key: string) => void;
  onRowHandlePointerDown: (e: React.PointerEvent, id: string) => void;
  updateTier: (id: string, patch: Partial<Tier>) => void;
  moveRow: (idx: number, dir: -1 | 1) => void;
  clearRow: (id: string) => void;
  deleteRow: (id: string) => void;
  addRow: (afterIdx: number) => void;
  labels: TlmLabels;
}) {
  const [colorRow, setColorRow] = useState<string | null>(null);

  return (
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
              rowDragActive === tier.id ? 'relative z-10 ring-2 ring-amber-400 ring-inset' : '',
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
              {selectedKey && (
                <button
                  type="button"
                  data-place
                  onClick={(e) => placeByKeyboard(e, tier.id)}
                  className={placeBtnClass}
                >
                  {L.placeInTier.replace('{tier}', tier.label || String(idx + 1))}
                </button>
              )}
              {(() => {
                const showMarker = !!drag && dropAt?.tierId === tier.id;
                const markerIdx = dropAt?.index ?? -1;
                const dragIt = drag ? itemMap.get(drag.key) : undefined;
                const useCardForDrag = showCards && !!dragIt?.cardId;
                const dragImg = useCardForDrag ? img.portrait(dragIt!.cardId!) : dragIt?.img;
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
                  if (showCards && it.cardId) {
                    nodes.push(
                      <CardView
                        key={key}
                        item={it}
                        selected={selectedKey === key}
                        dimmed={drag?.key === key}
                        /* Carte : nom du perso de base SUR la carte ; le
                                 nom du costume sous la carte, au toggle
                                 « noms de skin » — même règle qu'en tuiles. */
                        label={it.baseLabel ?? it.label}
                        skinLabel={skinLabelFor(it)}
                        size={cardSize}
                        showName={showNames}
                        showElement={showElement}
                        showClass={showClass}
                        showStars={showRarity}
                        showBadge={showCardTags}
                        onPointerDown={onItemPointerDown}
                        onKeySelect={keySelect}
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
                        skinLabel={skinLabelFor(it)}
                        size={iconSize}
                        showName={showNames}
                        showElement={showElement}
                        showClass={showClass}
                        showRarity={showRarity}
                        onPointerDown={onItemPointerDown}
                        onKeySelect={keySelect}
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
  );
}
