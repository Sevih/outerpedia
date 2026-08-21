'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { img, GRADE_TEXT } from '@/lib/images';
import { STAT_ICON } from '@/lib/stats';
import { SkillDescription } from '@/components/character/SkillDescription';
import { InlineTooltip } from '@/components/inline/InlineTooltip';
import { EquipmentIcon } from '@/components/equipment/EquipmentIcon';
import { gameTabClass } from '@/components/ui/game-tab';
import {
  SubstatVerdictPanel,
  type SubstatVerdictProps,
} from '@/components/character/SubstatVerdict';

const ACCENT = 'var(--cd-el)';
const TOTAL_SEGMENTS = 6;

/** Équipement affichable (résolu côté serveur, pré-localisé) — MiniCard. */
export interface GearItem {
  id: string;
  name: string;
  icon?: string;
  grade?: string;
  /** Étoiles de la tuile (haut de famille, comme /equipment). */
  star?: number;
  /** Lien vers la page détail /equipment/<slug>. */
  slug?: string;
  overlayIcon?: string;
  classType?: string;
  mainStat?: string;
  /** Valeur max (+10 T4) par clé de main stat. */
  mainStatMax?: Record<string, string>;
  effectName?: string;
  effectIcon?: string;
  effectTexts?: string[];
  /** Source (tooltip) : boss + libellé composé par la page. */
  source?: {
    bosses: { id: string; name: string; icon: string; sourceLabel?: string }[];
    label?: string;
  };
  unresolved?: boolean;
}

export interface GearSetPiece {
  id: string;
  name: string;
  slug?: string;
  /** Icône d'enchantement du set (overlay des tuiles). */
  icon?: string;
  /** Tuiles des 4 pièces 6★ (helmet/armor/gloves/shoes). */
  pieceIcons?: string[];
  count: number;
}

export interface GearSetEffect {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  maxCount: number;
  effect2?: string;
  effect4?: string;
  source?: GearItem['source'];
}

/** Un build affichable ; la note arrive PRÉ-RENDUE (parse-text serveur). */
export interface GearBuildView {
  name: string;
  weapons: GearItem[];
  amulets: GearItem[];
  talismans: GearItem[];
  sets: GearSetPiece[][];
  setEffects: GearSetEffect[];
  substats?: string;
  noteNode?: ReactNode;
}

export interface GearRecoLabels {
  weapon: string;
  amulet: string;
  talisman: string;
  set: string;
  substatPrio: string;
  setEffects: string;
  note: string;
  piece2: string;
  piece4: string;
  source: string;
  /** Noms des 4 pièces d'armure, dans l'ordre helmet/armor/gloves/shoes
   *  (sous-ligne « 2 pieces · Helmet + Armor » des combos). */
  pieceNames?: string[];
}

/**
 * Tuile d'un slot : label, puis N lignes séparées par des filets.
 *
 * EXPORTÉE avec `ItemRow` / `SetPieceGroup` / `Row` : les guides de boss
 * affichent le POOL d'un donjon (butin détaillé) et c'est le MÊME objet à
 * l'écran qu'ici — même tuile, même tooltip, même lien détail. Une deuxième
 * implémentation aurait divergé au premier changement. (La fiche perso,
 * elle, n'empile plus ces cartes : une seule carte à rangées, cf.
 * `GearRecoSection`.)
 */
export function SlotCard({
  label,
  accentBg = false,
  children,
}: {
  label: string;
  accentBg?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="card flex flex-col rounded-xl p-4"
      style={
        accentBg
          ? {
              background: `linear-gradient(135deg, color-mix(in srgb, ${ACCENT} 9%, transparent) 0%, transparent 55%), rgba(30,41,59,0.5)`,
            }
          : undefined
      }
    >
      <h4 className="mb-1 border-b border-white/6 pb-2 font-mono text-[10px] font-semibold tracking-[0.18em] text-zinc-300 uppercase">
        {label}
      </h4>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return (
    <div className="border-b border-white/6 py-2.5 first:pt-1 last:border-0 last:pb-0">
      {children}
    </div>
  );
}

/** Chip de stat (icône du jeu + abréviation). */
function StatChip({ abbr, value }: { abbr: string; value?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-zinc-300">
      {STAT_ICON[abbr] && (
        <img
          src={img.statIcon(STAT_ICON[abbr])}
          alt=""
          aria-hidden
          className="h-3.5 w-3.5"
          width={14}
          height={14}
        />
      )}
      {abbr}
      {value && <span className="text-zinc-400">{value}</span>}
    </span>
  );
}

/**
 * MiniCard d'équipement (portée telle quelle) : tuile avec cadre de rareté + overlays,
 * nom cliquable vers la page détail, chips de main stats ; tooltip riche
 * (stats max, passif au palier max, source).
 */
export function ItemRow({
  item,
  labels,
  noLink = false,
}: {
  item: GearItem;
  // Ce que la carte utilise VRAIMENT — un appelant qui n'a pas de build (le
  // butin d'un donjon) n'a pas à fabriquer des libellés qu'elle ignore.
  labels: Pick<GearRecoLabels, 'source'>;
  /** Coupe le lien /equipment (éditeur admin : le clic sert à éditer). */
  noLink?: boolean;
}) {
  if (item.unresolved) return <p className="text-sm text-red-400">{item.name}</p>;
  const chips = (item.mainStat ?? '')
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);
  const nameColor = GRADE_TEXT[item.grade ?? ''] ?? 'text-equipment';

  const card = (
    <div className="flex items-center gap-2.5">
      {item.icon && (
        <EquipmentIcon
          icon={item.icon}
          grade={item.grade ?? 'normal'}
          size={44}
          stars={item.star}
          overlayIcon={item.overlayIcon}
          classType={item.classType}
        />
      )}
      <div className="min-w-0">
        {item.slug && !noLink ? (
          <Link
            href={`/equipment/${item.slug}` as Route}
            className={`font-game block truncate text-sm font-semibold hover:underline ${nameColor}`}
          >
            {item.name}
          </Link>
        ) : (
          <p className={`font-game truncate text-sm font-semibold ${nameColor}`}>{item.name}</p>
        )}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-x-2">
            {chips.map((c) => (
              <StatChip key={c} abbr={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const tooltip = (
    <div className="flex max-w-72 flex-col gap-1.5">
      <div className="flex items-start gap-2">
        {item.icon && (
          <EquipmentIcon
            icon={item.icon}
            grade={item.grade ?? 'normal'}
            size={50}
            stars={item.star}
            overlayIcon={item.overlayIcon}
            classType={item.classType}
          />
        )}
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className={`text-sm font-bold ${nameColor}`}>{item.name}</span>
          {chips.map((c) => (
            <div key={c} className="flex items-center justify-between gap-4">
              <StatChip abbr={c} value={item.mainStatMax?.[c]} />
            </div>
          ))}
        </div>
      </div>
      {item.effectName && (
        <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-zinc-500/40 px-2.5 py-1">
          {item.effectIcon && (
            <img
              src={img.equipment(item.effectIcon)}
              alt=""
              aria-hidden
              className="h-4 w-4"
              width={16}
              height={16}
            />
          )}
          <span className="text-buff text-xs">{item.effectName}</span>
        </div>
      )}
      {item.effectTexts?.map((text, i) => (
        <SkillDescription key={i} desc={text} className="text-xs text-zinc-300" />
      ))}
      {item.source && (item.source.bosses.length > 0 || item.source.label) && (
        <div className="flex flex-col gap-1 border-t border-white/10 pt-1.5">
          <span className="text-[10px] tracking-wider text-zinc-400 uppercase">
            {labels.source}
          </span>
          {item.source.bosses.map((b) => (
            <span key={b.id} className="flex items-center gap-1.5 text-xs text-zinc-200">
              <img
                src={img.boss(`MT_${b.icon}`)}
                alt=""
                aria-hidden
                className="h-5 w-5 rounded object-cover"
                width={20}
                height={20}
              />
              {b.name}
              {b.sourceLabel && <span className="text-zinc-400">· {b.sourceLabel}</span>}
            </span>
          ))}
          {item.source.label && <span className="text-xs text-zinc-300">{item.source.label}</span>}
        </div>
      )}
    </div>
  );

  return (
    <InlineTooltip content={tooltip}>
      <div className="cursor-default">{card}</div>
    </InlineTooltip>
  );
}

/** Tuiles d'un set dans un combo : les 4 s'il est joué à 4, sinon Helmet+Armor
 *  pour le premier set du combo, Gloves+Shoes pour le second. */
function shownPieceIdx(piece: GearSetPiece, idx: number): number[] {
  if (piece.count >= 4) return [0, 1, 2, 3];
  return idx === 0 ? [0, 1] : [2, 3];
}

/** Tooltip d'un set (bonus 2P/4P + source) — partagé par les deux rendus. */
function setTooltip(
  piece: GearSetPiece,
  eff: GearSetEffect | undefined,
  labels: Pick<GearRecoLabels, 'piece2' | 'piece4'>,
): ReactNode {
  return (
    <div className="flex max-w-72 flex-col gap-1.5">
      <div className="flex items-center gap-2">
        {piece.icon && (
          <img
            src={img.effect(piece.icon)}
            alt=""
            aria-hidden
            className="h-8 w-8 shrink-0 object-contain"
            width={32}
            height={32}
          />
        )}
        <span className="text-equipment text-sm font-bold">{piece.name}</span>
      </div>
      {eff && (
        <div className="rounded bg-zinc-800 px-2 py-1 text-xs">
          {eff.effect2 && (
            <div>
              <span className="text-buff">{labels.piece2} </span>
              <span className="text-zinc-300">{eff.effect2}</span>
            </div>
          )}
          {piece.count >= 4 && eff.effect4 && (
            <div className="mt-0.5">
              <span className="text-buff">{labels.piece4} </span>
              <span className="text-zinc-300">{eff.effect4}</span>
            </div>
          )}
        </div>
      )}
      {eff?.source && (eff.source.bosses.length > 0 || eff.source.label) && (
        <div className="flex flex-col gap-1">
          {eff.source.bosses.map((b) => (
            <span key={b.id} className="flex items-center gap-1.5 text-xs text-zinc-200">
              <img
                src={img.boss(`MT_${b.icon}`)}
                alt=""
                aria-hidden
                className="h-5 w-5 rounded object-cover"
                width={20}
                height={20}
              />
              {b.name}
              {b.sourceLabel && <span className="text-zinc-400">· {b.sourceLabel}</span>}
            </span>
          ))}
          {eff.source.label && <span className="text-xs text-zinc-300">{eff.source.label}</span>}
        </div>
      )}
    </div>
  );
}

/**
 * Groupe de tuiles d'un set dans un combo (port de l'ancien SetMiniCard) : joué à 4
 * → les 4 pièces ; combo 2+2 → Helmet+Armor pour le premier set, Gloves+Shoes
 * pour le second. Icône du set en overlay, nom cliquable, tooltip 2P/4P + source.
 */
export function SetPieceGroup({
  piece,
  idx,
  effects,
  labels,
}: {
  piece: GearSetPiece;
  idx: number;
  effects: GearSetEffect[];
  labels: Pick<GearRecoLabels, 'piece2' | 'piece4'>;
}) {
  const icons = piece.pieceIcons ?? [];
  const shown = shownPieceIdx(piece, idx)
    .map((i) => icons[i])
    .filter(Boolean);
  const eff = effects.find((e) => e.id === piece.id);
  const name = piece.slug ? (
    <Link
      href={`/equipment/${piece.slug}` as Route}
      className="font-game text-xs text-zinc-400 hover:underline"
    >
      {piece.name}
    </Link>
  ) : (
    <span className="font-game text-xs text-zinc-400">{piece.name}</span>
  );

  return (
    <InlineTooltip content={setTooltip(piece, eff, labels)}>
      <div className="inline-flex cursor-default flex-col items-center gap-0.5">
        <div className="flex items-center gap-1">
          {shown.map((icon, i) => (
            <EquipmentIcon key={i} icon={icon} grade="unique" size={38} overlayIcon={piece.icon} />
          ))}
        </div>
        {name}
      </div>
    </InlineTooltip>
  );
}

/**
 * Un set dans un combo, version fiche perso : tuiles + nom à droite + sous-ligne
 * « 2 pieces · Helmet + Armor ». Même tooltip que `SetPieceGroup`.
 */
function SetCombo({
  piece,
  idx,
  effects,
  labels,
}: {
  piece: GearSetPiece;
  idx: number;
  effects: GearSetEffect[];
  labels: Pick<GearRecoLabels, 'piece2' | 'piece4' | 'pieceNames'>;
}) {
  const icons = piece.pieceIcons ?? [];
  const which = shownPieceIdx(piece, idx);
  const shown = which.map((i) => icons[i]).filter(Boolean);
  const eff = effects.find((e) => e.id === piece.id);
  const pieceNames = labels.pieceNames
    ? which.map((i) => labels.pieceNames![i]).filter(Boolean)
    : [];
  const sub = [piece.count >= 4 ? labels.piece4 : labels.piece2, pieceNames.join(' + ')]
    .filter(Boolean)
    .join(' · ');

  return (
    <InlineTooltip content={setTooltip(piece, eff, labels)}>
      <div className="flex cursor-default items-center gap-2">
        <div className="flex items-center gap-2">
          {shown.map((icon, i) => (
            <EquipmentIcon key={i} icon={icon} grade="unique" size={38} overlayIcon={piece.icon} />
          ))}
        </div>
        <div className="ml-0.5 flex min-w-0 flex-col">
          {piece.slug ? (
            <Link
              href={`/equipment/${piece.slug}` as Route}
              className="font-game text-equipment truncate text-sm font-semibold hover:underline"
            >
              {piece.name}
            </Link>
          ) : (
            <span className="font-game text-equipment truncate text-sm font-semibold">
              {piece.name}
            </span>
          )}
          <span className="text-[11px] text-zinc-400">{sub}</span>
        </div>
      </div>
    </InlineTooltip>
  );
}

/** Bonus 2p / 4p d'un set (4p seulement s'il est joué à 4). */
function SetEffectLines({ eff, labels }: { eff: GearSetEffect; labels: GearRecoLabels }) {
  return (
    <>
      {eff.effect2 && (
        <p className="text-xs leading-relaxed text-zinc-300">
          <span className="text-buff font-semibold">{labels.piece2}</span> {eff.effect2}
        </p>
      )}
      {eff.maxCount >= 4 && eff.effect4 && (
        <p className="text-xs leading-relaxed text-zinc-300">
          <span className="text-buff font-semibold">{labels.piece4}</span> {eff.effect4}
        </p>
      )}
    </>
  );
}

/** Barre de priorité des substats (portée de l'ancien SubstatPrioBar).
 * `badge(stat)` : annotation optionnelle à côté du nom (verdict flat / % des
 * axes ATK / DEF / HP sur la fiche perso ; rien dans l'éditeur admin). */
export function SubstatPrioBar({
  prio,
  badge,
}: {
  prio: string;
  badge?: (stat: string) => ReactNode;
}) {
  const tiers: { stats: string[]; filled: number }[] = [];
  let level = 0;
  for (const token of prio.split('>')) {
    const trimmed = token.trim();
    if (trimmed === '') {
      level++; // « >> » = un cran de plus
      continue;
    }
    tiers.push({
      stats: trimmed.split('=').map((s) => s.trim()),
      filled: Math.max(1, TOTAL_SEGMENTS - level),
    });
    level++;
  }
  return (
    <div className="space-y-2.5">
      {tiers.map((tier) =>
        tier.stats.map((stat) => (
          <div key={stat}>
            {/* Icône avant le nom — même gabarit que les main stats de l'EE. */}
            <span className="inline-flex items-center gap-1.5 text-sm text-zinc-200">
              {STAT_ICON[stat] && (
                <img
                  src={img.statIcon(STAT_ICON[stat])}
                  alt=""
                  aria-hidden
                  className="h-3.5 w-3.5"
                  width={14}
                  height={14}
                />
              )}
              {stat}
              {badge?.(stat)}
            </span>
            <div className="mt-1 flex gap-0.5">
              {Array.from({ length: TOTAL_SEGMENTS }, (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-sm ${i < tier.filled ? 'bg-yellow-400' : 'bg-zinc-700'}`}
                />
              ))}
            </div>
          </div>
        )),
      )}
    </div>
  );
}

/** Étiquette de rangée / de bloc : la signature mono 10 px des cartes. */
const ROW_LABEL = 'font-mono text-[10px] font-semibold tracking-[0.18em] text-zinc-300 uppercase';

/**
 * Une rangée de la carte gear : étiquette mono à gauche (96 px en ≥ sm),
 * contenu à droite ; en mobile l'étiquette passe au-dessus.
 */
function GearRow({
  label,
  divider = false,
  children,
}: {
  label: string;
  divider?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`grid gap-2 sm:grid-cols-[6rem_1fr] sm:gap-3.5 ${
        divider ? 'border-t border-white/6 pt-4' : ''
      }`}
    >
      <span className={`${ROW_LABEL} sm:pt-3.5`}>{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/**
 * Section Équipement recommandé — une carte par question, plus de cartes dans
 * les cartes : onglets de builds (quel build) → UNE carte gear à rangées
 * étiquetées Weapon / Accessory / Talisman / Armor Set, la légende des bonus
 * fusionnée dans la rangée du set (quoi équiper) → panneau substats avec la
 * priorité puis le verdict flat / % (quoi chasser) → bande de note.
 * Desktop 2fr / 1fr, mobile une colonne dans ce même ordre de lecture.
 */
export function GearRecoSection({
  builds,
  labels,
  verdict,
}: {
  builds: GearBuildView[];
  labels: GearRecoLabels;
  /** Verdict flat / % des substats ATK / DEF / HP (absent : barre nue). */
  verdict?: SubstatVerdictProps;
}) {
  const [active, setActive] = useState(0);
  if (!builds.length) return null;
  const build = builds[Math.min(active, builds.length - 1)];
  const hasGear =
    build.weapons.length + build.amulets.length + build.talismans.length + build.sets.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Onglets de builds — style « game » partagé (cf. ui/game-tab) ; le glow
          prend le thème élémentaire tout seul (--cd-el hérité de .cd-page). */}
      <div className="flex flex-wrap gap-2 self-start">
        {builds.map((b, i) => {
          const on = i === active;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={on}
              className={gameTabClass(on)}
            >
              {b.name}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr] lg:items-start">
        {/* Carte gear : 4 rangées, zéro carte imbriquée */}
        {hasGear && (
          <div className="card flex flex-col gap-4.5 p-4 sm:px-5.5 sm:py-5">
            {build.weapons.length > 0 && (
              <GearRow label={labels.weapon}>
                <div className="flex flex-wrap gap-x-7 gap-y-2.5">
                  {build.weapons.map((w, i) => (
                    <ItemRow key={`${w.id}-${i}`} item={w} labels={labels} />
                  ))}
                </div>
              </GearRow>
            )}
            {build.amulets.length > 0 && (
              <GearRow label={labels.amulet}>
                <div className="flex flex-wrap gap-x-7 gap-y-2.5">
                  {build.amulets.map((a, i) => (
                    <ItemRow key={`${a.id}-${i}`} item={a} labels={labels} />
                  ))}
                </div>
              </GearRow>
            )}
            {build.talismans.length > 0 && (
              <GearRow label={labels.talisman}>
                <div className="flex flex-wrap gap-x-7 gap-y-2.5">
                  {build.talismans.map((tl, i) => (
                    <ItemRow key={`${tl.id}-${i}`} item={tl} labels={labels} />
                  ))}
                </div>
              </GearRow>
            )}
            {build.sets.length > 0 && (
              <GearRow label={labels.set} divider>
                <div className="flex flex-col gap-3">
                  {build.sets.map((combo, i) => (
                    <div key={i} className="flex flex-wrap gap-x-8 gap-y-2">
                      {combo.map((p, j) => (
                        <SetCombo
                          key={j}
                          piece={p}
                          idx={j}
                          effects={build.setEffects}
                          labels={labels}
                        />
                      ))}
                    </div>
                  ))}
                  {/* Légende des bonus : dans la même rangée — c'est la réponse
                      à la même question, plus de carte « Set Effects » à part. */}
                  {build.setEffects.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      {build.setEffects.map((eff) => (
                        <div key={eff.id} className="flex gap-2 text-xs leading-relaxed">
                          {eff.slug ? (
                            <Link
                              href={`/equipment/${eff.slug}` as Route}
                              className="font-game text-equipment w-24 shrink-0 font-semibold hover:underline"
                            >
                              {eff.name}
                            </Link>
                          ) : (
                            <span className="font-game text-equipment w-24 shrink-0 font-semibold">
                              {eff.name}
                            </span>
                          )}
                          <div className="min-w-0">
                            <SetEffectLines eff={eff} labels={labels} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </GearRow>
            )}
          </div>
        )}

        {/* Panneau substats : la priorité d'abord, le verdict dessous */}
        {build.substats && (
          <div className="card flex flex-col gap-3.5 p-4 sm:px-5.5 sm:py-5">
            <h4 className={ROW_LABEL} style={{ color: ACCENT }}>
              {labels.substatPrio}
            </h4>
            {verdict ? (
              <SubstatVerdictPanel {...verdict}>
                {(badge) => <SubstatPrioBar prio={build.substats!} badge={badge} />}
              </SubstatVerdictPanel>
            ) : (
              <SubstatPrioBar prio={build.substats} />
            )}
          </div>
        )}
      </div>

      {/* Note : une bande, étiquette + texte */}
      {build.noteNode && (
        <div className="card flex flex-col gap-1.5 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4.5 sm:px-5.5 sm:py-3.5">
          <span className={`${ROW_LABEL} shrink-0`} style={{ color: ACCENT }}>
            {labels.note}
          </span>
          <p className="flex-1 text-sm leading-relaxed text-zinc-300">{build.noteNode}</p>
        </div>
      )}
    </div>
  );
}
