/**
 * Blocs du guide « Core Fusion » : pills de coût par palier (DÉRIVÉS de
 * CharacterFusionLevelTemplet — la V2 codait [300,150…] en dur), rangées de
 * changements de skills (renommages dérivés + review éditoriale), comparaison
 * d'EE base ↔ fusion (données équipement V3 — la V2 lisait son ee.json).
 */
import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';
import type { FusionInfo } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { img } from '@/lib/images';
import { cn } from '@/lib/cn';
import { localePath } from '@/lib/navigation';
import { fusionCumulativeCosts } from '@/lib/data/core-fusion';
import { getEEViews, slugifyEquipment } from '@/lib/data/equipment';
import { getEquipmentDetail } from '@/lib/data/equipment-detail';
import { itemChipById } from '@/components/guides/editorial/banner/items';
import { SkillDescription } from '@/components/character/SkillDescription';

/**
 * Niveaux recommandés (éditorial) avec leur coût CUMULÉ dérivé des tables.
 * Un niveau recommandé hors table casse le build (éditorial périmé).
 */
export function FusionCostPills({
  info,
  levels,
  lang,
  label,
  orLabel,
}: {
  info: FusionInfo;
  levels: number[];
  lang: Lang;
  label: string;
  orLabel: string;
}) {
  if (levels.length === 0) return null;
  const totals = new Map(fusionCumulativeCosts(info).map((c) => [c.level, c.total]));
  const core = itemChipById(info.levels[0].item, lang);
  return (
    <div className="border-line-subtle flex flex-wrap items-center justify-center gap-4 rounded-md border p-4">
      <span className="text-content-subtle text-xs">{label}</span>
      {levels.map((lv, i) => {
        const total = totals.get(lv);
        if (total === undefined) {
          throw new Error(`core-fusion : niveau recommandé « ${lv} » absent des paliers du jeu`);
        }
        return (
          <span key={lv} className="flex items-center gap-4">
            {i > 0 && <span className="text-content-subtle text-sm">{orLabel}</span>}
            <span className="flex items-center gap-3">
              <span className="text-ed-purple-fg text-xl font-bold">Lv {lv}</span>
              <span className="flex items-center gap-1">
                {core.iconSrc && (
                  <img
                    src={core.iconSrc}
                    alt={core.name}
                    width={18}
                    height={18}
                    className="object-contain"
                  />
                )}
                <span className="text-content-strong text-sm font-semibold">{total}</span>
              </span>
            </span>
          </span>
        );
      })}
    </div>
  );
}

export interface SkillChangeRowData {
  /** Libellé du slot (S1/S2/S3/Chain / Dual). */
  label: string;
  /** Renommage dérivé (noms localisés), absent si le skill garde son nom. */
  rename?: { from: string; to: string };
  /** Review éditoriale DÉJÀ parsée (parse-text côté guide). */
  review: ReactNode;
}

/** Rangées « changements de skills » (label + renommage + review). */
export function SkillChangeRows({ rows }: { rows: SkillChangeRowData[] }) {
  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div
          key={i}
          className="border-line-subtle bg-surface-overlay/50 flex gap-3 rounded-md border p-3"
        >
          <span className="text-ed-purple-fg shrink-0 pt-0.5 text-xs font-bold">{row.label}</span>
          <div className="min-w-0 space-y-1 text-sm">
            {row.rename && (
              <p className="text-content-subtle text-xs">
                {row.rename.from} → <span className="text-content">{row.rename.to}</span>
              </p>
            )}
            <p className="text-content-muted">{row.review}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

interface EeSide {
  characterId: string;
  name: string;
  slug: string;
  grade: string;
  lv1: string[];
  lv10: string[];
}

/** Vue EE d'un perso (nom, textes Lv1/Lv10) — même dérivation que la fiche. */
function eeSideOf(characterId: string, lang: Lang): EeSide | undefined {
  const view = getEEViews().find((e) => e.characterId === characterId);
  if (!view) return undefined;
  const slug = slugifyEquipment(view.name.en);
  const model = getEquipmentDetail(slug, lang);
  if (!model) return undefined;
  const lv1 = model.passives.filter((pt) => pt.unlockLevel <= 1).map((pt) => pt.texts[0]);
  let lv10All: string[] = [];
  for (const pt of model.passives) {
    const text = pt.texts[pt.texts.length - 1];
    if (pt.isAdd) lv10All.push(text);
    else lv10All = [text];
  }
  return {
    characterId,
    name: model.name,
    slug,
    grade: view.grade,
    lv1,
    lv10: lv10All.filter((tx) => !lv1.includes(tx)),
  };
}

function EeMiniCard({
  side,
  label,
  lang,
  accent,
  labels,
}: {
  side: EeSide;
  label: string;
  lang: Lang;
  accent: 'neutral' | 'purple';
  labels: { effect: string; effectMax: string };
}) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-md border p-3',
        accent === 'purple'
          ? 'border-ed-purple-bd/20 bg-ed-purple-bd/5'
          : 'border-line-subtle bg-surface-overlay/50',
      )}
    >
      <span className="relative h-12 w-12 shrink-0">
        <img src={img.slotFrame(side.grade)} alt="" className="absolute inset-0 h-full w-full" />
        <img
          src={img.ee(side.characterId)}
          alt={side.name}
          className="absolute inset-1 h-[calc(100%-8px)] w-[calc(100%-8px)] object-contain"
        />
      </span>
      <div className="min-w-0 space-y-1">
        <p className="text-xs">
          <span className="text-content-subtle">{label} </span>
          <Link
            href={localePath(lang, `/equipment/${side.slug}`) as Route}
            className="text-item-legendary font-semibold hover:underline"
          >
            {side.name}
          </Link>
        </p>
        <div className="text-content-muted text-xs">
          <span className="text-content-subtle">{labels.effect} </span>
          {side.lv1.map((t, i) => (
            <SkillDescription key={i} desc={t} className="text-content-muted text-xs" />
          ))}
        </div>
        {side.lv10.length > 0 && (
          <div className="text-content-muted text-xs">
            <span className="text-content-subtle">{labels.effectMax} </span>
            {side.lv10.map((t, i) => (
              <SkillDescription key={i} desc={t} className="text-content-muted text-xs" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Comparaison d'EE base ↔ core-fusion (mapping officiel des tables). */
export function EeComparison({
  baseId,
  fusionId,
  lang,
  labels,
}: {
  baseId: string;
  fusionId: string;
  lang: Lang;
  labels: { title: string; base: string; coreFusion: string; effect: string; effectMax: string };
}) {
  const base = eeSideOf(baseId, lang);
  const fusion = eeSideOf(fusionId, lang);
  if (!base && !fusion) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-ed-purple-fg text-sm font-semibold">{labels.title}</h4>
      <div className="grid gap-2 sm:grid-cols-2">
        {base && (
          <EeMiniCard
            side={base}
            label={labels.base}
            lang={lang}
            accent="neutral"
            labels={labels}
          />
        )}
        {fusion && (
          <EeMiniCard
            side={fusion}
            label={labels.coreFusion}
            lang={lang}
            accent="purple"
            labels={labels}
          />
        )}
      </div>
    </div>
  );
}
