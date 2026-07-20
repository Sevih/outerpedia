import Link from 'next/link';
import type { Route } from 'next';
import { GRADE_TEXT, img } from '@/lib/images';
import { STAT_ICON } from '@/lib/stats';
import { SkillDescription } from '@/components/character/SkillDescription';
import {
  EffectChipsRow,
  type ClientEffect,
  type StatusMap,
} from '@/components/character/EffectChips';
import { EquipmentIcon } from './EquipmentIcon';

/**
 * Cards de la page /equipment — composants PURS alimentés par des lignes
 * pré-localisées (construites côté serveur dans la page).
 */

/** Boss d'une source d'obtention, matérialisé. */
export interface SourceBoss {
  id: string;
  name: string;
  icon: string;
  element: string;
}

export interface RowSource {
  bosses: SourceBoss[];
  label?: string;
}

/**
 * Une ligne d'effet de passif, prête à rendre : un palier (« Lv.10 ») et TOUS
 * ses textes (l'effet monté en valeurs + l'effet additionnel éventuel).
 */
export interface EffectLine {
  label?: string;
  texts: string[];
}

/** Arme / amulette / talisman (familles) — pré-localisé. */
export interface GearRow {
  id: string;
  slug: string;
  name: string;
  icon: string;
  grade: string;
  stars: number[];
  classLimits: string[];
  mainStats: string[];
  /** Pill du passif (nom + icône d'effet du 1er palier). */
  passive?: { name: string; icon: string };
  /** Lignes d'effet (paliers résolus). */
  effects: EffectLine[];
  source?: RowSource;
  mode?: 'AP' | 'CP';
}

export interface SetRow {
  id: string;
  slug: string;
  name: string;
  /** Icône d'enchantement du set (TI_Icon_Set_*), posée en overlay des pièces. */
  setIcon: string;
  pieceIcons: string[];
  /** Bonus du DERNIER tier connu (enchanté si existant). */
  p2?: string;
  p4?: string;
  source?: RowSource;
}

export interface EERow {
  itemId: string;
  slug: string;
  characterId: string;
  charName: string;
  charSlug: string;
  element: string;
  classType: string;
  name: string;
  grade: string;
  star: number;
  mainStats: string[];
  effects: EffectLine[];
  /** Buffs/debuffs appliqués par les passifs (chips, comme les skills). */
  chips?: { effects: ClientEffect[]; statuses: StatusMap };
  rank?: string;
  rank10?: string;
  trustLevel: number;
}

/** Ligne « Source » : portraits + noms des boss, ou libellé curé. */
export function SourceLine({ source, title }: { source?: RowSource; title: string }) {
  if (!source || (!source.bosses.length && !source.label)) return null;
  return (
    <div className="border-line-subtle mt-auto flex flex-wrap items-center gap-2 border-t pt-2">
      <span className="text-content-subtle text-xs uppercase">{title}</span>
      {source.bosses.map((b) => (
        <span key={b.id} className="inline-flex items-center gap-1">
          {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
          <img src={img.boss(`MT_${b.icon}`)} alt="" className="h-6 w-6 rounded object-cover" />
          <span className="text-content-muted text-xs">{b.name}</span>
        </span>
      ))}
      {source.label && <span className="text-content-muted text-xs">{source.label}</span>}
    </div>
  );
}

/** Pill du passif : icône + nom. */
function PassivePill({ passive }: { passive: NonNullable<GearRow['passive']> }) {
  return (
    <span className="bg-surface-base border-line-subtle inline-flex w-fit items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-1">
      {passive.icon && (
        // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
        <img src={img.equipment(passive.icon)} alt="" className="h-4 w-4" />
      )}
      <span className="text-content-strong text-xs font-semibold">{passive.name}</span>
    </span>
  );
}

/** Lignes d'effet : palier optionnel + textes empilés. */
function EffectLines({ effects }: { effects: EffectLine[] }) {
  if (!effects.length) return null;
  return (
    <div className="space-y-1">
      {effects.map((e, i) => (
        <div key={i} className="flex gap-1.5 text-xs">
          {e.label && <span className="text-content-subtle shrink-0 font-semibold">{e.label}</span>}
          <div className="min-w-0 space-y-0.5">
            {e.texts.map((t, j) => (
              <SkillDescription key={j} desc={t} className="text-content-muted text-xs" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Main stats possibles : icône de stat du jeu + abréviation. */
function MainStatChips({ stats }: { stats: string[] }) {
  if (!stats.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {stats.map((s) => (
        <span key={s} className="text-content-subtle inline-flex items-center gap-1 text-xs">
          {STAT_ICON[s] && (
            // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
            <img src={img.statIcon(STAT_ICON[s])} alt="" className="h-3.5 w-3.5" />
          )}
          {s}
        </span>
      ))}
    </div>
  );
}

/** Carte arme / amulette : overlays d'effet + classe sur la tuile (comme en jeu). */
export function GearCard({ row, sourceTitle }: { row: GearRow; sourceTitle: string }) {
  const singleClass = row.classLimits.length === 1 ? row.classLimits[0] : undefined;
  return (
    <div className="card flex flex-col gap-2 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <EquipmentIcon
          icon={row.icon}
          grade={row.grade}
          alt={row.name}
          stars={row.stars.at(-1)}
          overlayIcon={row.passive?.icon}
          classType={singleClass}
        />
        <div className="min-w-0 flex-1 space-y-1">
          <Link
            href={`/equipment/${row.slug}` as Route}
            className={`block font-bold hover:underline ${GRADE_TEXT[row.grade] ?? 'text-content-strong'}`}
          >
            {row.name}
          </Link>
          {!singleClass && row.classLimits.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {row.classLimits.map((cl) => (
                // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
                <img key={cl} src={img.klass(cl)} alt={cl} title={cl} className="h-5 w-5" />
              ))}
            </div>
          )}
          <MainStatChips stats={row.mainStats} />
        </div>
      </div>
      {row.passive && <PassivePill passive={row.passive} />}
      <EffectLines effects={row.effects} />
      <SourceLine source={row.source} title={sourceTitle} />
    </div>
  );
}

/** Carte talisman : badge AP/CP + effets par palier (Lv.1 / Lv.10). */
export function TalismanCard({ row, sourceTitle }: { row: GearRow; sourceTitle: string }) {
  return (
    <div className="card flex flex-col gap-2 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <EquipmentIcon
          icon={row.icon}
          grade={row.grade}
          alt={row.name}
          stars={row.stars.at(-1)}
          overlayIcon={row.passive?.icon}
        />
        <div className="min-w-0 flex-1 space-y-1">
          <Link
            href={`/equipment/${row.slug}` as Route}
            className={`block font-bold hover:underline ${GRADE_TEXT[row.grade] ?? 'text-content-strong'}`}
          >
            {row.name}
          </Link>
          {row.mode && (
            <span className="bg-surface-base border-line-subtle text-content-strong rounded border px-1.5 py-0.5 text-xs font-semibold">
              {row.mode}
            </span>
          )}
        </div>
      </div>
      {row.passive && <PassivePill passive={row.passive} />}
      <EffectLines effects={row.effects} />
      <SourceLine source={row.source} title={sourceTitle} />
    </div>
  );
}

/** Carte set d'armure : les 4 pièces + bonus 2P/4P (dernier tier). */
export function SetCard({ row, sourceTitle }: { row: SetRow; sourceTitle: string }) {
  return (
    <div className="card flex flex-col gap-2 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="grid shrink-0 grid-cols-2 gap-0.5">
          {row.pieceIcons.map((icon, i) => (
            <EquipmentIcon key={i} icon={icon} grade="unique" size={34} overlayIcon={row.setIcon} />
          ))}
        </div>
        <Link
          href={`/equipment/${row.slug}` as Route}
          className="text-item-legendary min-w-0 font-bold hover:underline"
        >
          {row.name}
        </Link>
      </div>
      <div className="space-y-1 text-xs">
        {row.p2 && (
          <div>
            <span className="text-content-strong font-semibold">2P </span>
            <SkillDescription desc={row.p2} className="text-content-muted inline text-xs" />
          </div>
        )}
        {row.p4 && (
          <div>
            <span className="text-content-strong font-semibold">4P </span>
            <SkillDescription desc={row.p4} className="text-content-muted inline text-xs" />
          </div>
        )}
      </div>
      <SourceLine source={row.source} title={sourceTitle} />
    </div>
  );
}

/** Carte équipement exclusif : porteur + rangs + effets Lv.1 / Lv.10. */
export function EECard({
  row,
  labels,
}: {
  row: EERow;
  labels: { unlock: string; upgrade: string };
}) {
  return (
    <div className="card flex flex-col gap-2 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <EquipmentIcon
          src={img.ee(row.characterId)}
          grade={row.grade}
          alt={row.name}
          stars={row.star}
          classType={row.classType}
        />
        <div className="min-w-0 flex-1 space-y-1">
          <Link
            href={`/equipment/${row.slug}` as Route}
            className={`block font-bold hover:underline ${GRADE_TEXT[row.grade] ?? 'text-content-strong'}`}
          >
            {row.name}
          </Link>
          <Link
            href={`/characters/${row.charSlug}` as Route}
            className="text-content-muted hover:text-accent inline-flex items-center gap-1.5 text-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
            <img src={img.face(row.characterId)} alt="" className="h-6 w-6 rounded" />
            {row.charName}
          </Link>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {(
            [
              [labels.unlock, row.rank],
              [labels.upgrade, row.rank10],
            ] as const
          ).map(
            ([label, rank]) =>
              rank && (
                <div key={label} className="flex flex-col items-center gap-0.5">
                  {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
                  <img src={img.rank(rank)} alt={rank} className="h-7 w-7" />
                  <span className="text-content-subtle text-[9px] uppercase">{label}</span>
                </div>
              ),
          )}
        </div>
      </div>
      <MainStatChips stats={row.mainStats} />
      <EffectLines effects={row.effects} />
      {row.chips && row.chips.effects.length > 0 && (
        <EffectChipsRow effects={row.chips.effects} statuses={row.chips.statuses} />
      )}
    </div>
  );
}
