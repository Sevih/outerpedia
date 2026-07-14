'use client';

import { useState, type ReactNode } from 'react';
import {
  ItemRow,
  Row,
  SetPieceGroup,
  SlotCard,
  type GearItem,
} from '@/components/character/GearRecoSection';
import type { LootPanelLabels } from './loot-labels';

/** Le pool d'équipement d'un donjon, prêt pour les MiniCards (cf. `lootDetails`). */
export interface LootPanelDetails {
  weapons: GearItem[];
  amulets: GearItem[];
  talismans: GearItem[];
  sets: Array<{
    piece: React.ComponentProps<typeof SetPieceGroup>['piece'];
    effect: React.ComponentProps<typeof SetPieceGroup>['effects'][number];
  }>;
}

/**
 * LE BUTIN D'UN DONJON — un résumé en icônes, et le détail à la demande.
 *
 * La ligne dit ce qu'on vient farmer d'un coup d'œil (la monnaie du mode, les
 * tuiles du pool) ; « Details » déplie les MÊMES cartes que l'équipement
 * recommandé d'un personnage (`ItemRow` / `SetPieceGroup` de `GearRecoSection`,
 * réutilisées telles quelles) : mains possibles et valeurs max, passif au
 * palier max, lien vers la page détail. Un objet du jeu se lit pareil partout
 * sur le site — c'est le même objet.
 *
 * Client : le dépliage est un état d'interface. Le contenu, lui, est rendu par
 * le SERVEUR et voyage déjà dans la charge utile — cliquer ne demande rien au
 * réseau.
 */
export function LootPanel({
  icons,
  details,
  labels,
}: {
  /** Résumé en icônes, rendu côté serveur (monnaies, tuiles du pool). */
  icons: ReactNode;
  details: LootPanelDetails;
  labels: LootPanelLabels;
}) {
  const [open, setOpen] = useState(false);
  const hasDetails =
    details.weapons.length > 0 ||
    details.amulets.length > 0 ||
    details.talismans.length > 0 ||
    details.sets.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <h3 className="text-content font-mono text-[10px] font-semibold tracking-[0.14em] uppercase">
          {labels.title}
        </h3>
        {icons}
        {/* Pas d'équipement dans ce pool (une difficulté basse n'en droppe pas) :
            pas de bouton — il n'ouvrirait sur rien. */}
        {hasDetails && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="text-content-muted hover:text-content-strong ml-auto cursor-pointer text-xs font-semibold underline decoration-dotted underline-offset-2"
          >
            {labels.details}
            <span aria-hidden className={`ml-1 inline-block ${open ? 'rotate-90' : ''}`}>
              ›
            </span>
          </button>
        )}
      </div>

      {open && hasDetails && (
        <div className="grid gap-3 sm:grid-cols-2">
          {details.weapons.length > 0 && (
            <SlotCard label={labels.weapon}>
              {details.weapons.map((w) => (
                <Row key={w.id}>
                  <ItemRow item={w} labels={labels} />
                </Row>
              ))}
            </SlotCard>
          )}
          {details.amulets.length > 0 && (
            <SlotCard label={labels.amulet}>
              {details.amulets.map((a) => (
                <Row key={a.id}>
                  <ItemRow item={a} labels={labels} />
                </Row>
              ))}
            </SlotCard>
          )}
          {details.talismans.length > 0 && (
            <SlotCard label={labels.talisman}>
              {details.talismans.map((tl) => (
                <Row key={tl.id}>
                  <ItemRow item={tl} labels={labels} />
                </Row>
              ))}
            </SlotCard>
          )}
          {details.sets.length > 0 && (
            <SlotCard label={labels.set} accentBg>
              {details.sets.map(({ piece, effect }) => (
                <Row key={piece.id}>
                  <SetPieceGroup piece={piece} idx={0} effects={[effect]} labels={labels} />
                </Row>
              ))}
            </SlotCard>
          )}
        </div>
      )}
    </div>
  );
}
