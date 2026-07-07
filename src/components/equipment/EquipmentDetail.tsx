'use client';

/**
 * Vue INTERACTIVE de la page détail équipement — port de l'UX « console » V2 :
 * slider d'amélioration, onglets de breakthrough, ascension Singularity, choix
 * de main stat, sélection de pièce d'armure. Les maths viennent des règles
 * EXTRAITES du jeu (`rules` : base × (1 + 0.4·niv) × (1 + 0.05·palier), paliers
 * d'ascension 0.15 + 0.1×4 + 0.2) ; le modèle est pré-localisé côté serveur.
 *
 * Couleurs : accent = rareté via tokens `--color-item-*`, ascension via
 * `--color-singularity` (pas de couleur en dur).
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { img } from '@/lib/images';
import { STAT_ICON } from '@/lib/stats';
import { SkillDescription } from '@/components/character/SkillDescription';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import { EffectChipsRow } from '@/components/character/EffectChips';
import { ItemInline } from '@/components/inline/ItemInline';
import { EquipmentIcon } from './EquipmentIcon';
import type {
  DetailModel,
  DetailPiece,
  RecommendedChar,
  StatOption,
  SubstatPool,
} from '@/lib/data/equipment-detail';

/** Libellés pré-traduits par la page serveur. */
export interface DetailLabels {
  back: string;
  configure: string;
  enhancement: string;
  breakthrough: string;
  reforge: string;
  available: string;
  ascend: string;
  ascended: string;
  needs10: string;
  mainStat: string;
  mainStats: string;
  substats: string;
  effect: string;
  setEffects: string;
  source: string;
  recommendedBy: string;
  ascension: string;
  bonus15: string;
  priority: string;
  unlock: string;
  upgrade: string;
  owner: string;
  /** Suffixe du nom quand l'item est ascendé (« [Singularity] », localisé). */
  singularitySuffix: string;
  /** Gabarit « and {n} more » (persos recommandés au-delà du plafond). */
  andMore: string;
  activationCost: string;
  stepRates: string;
  grade: string;
  pieces: Record<string, string>;
}

/** Accent CSS par grade (tokens item-*). */
const GRADE_VAR: Record<string, string> = {
  normal: 'var(--color-item-normal)',
  magic: 'var(--color-item-superior)',
  rare: 'var(--color-item-epic)',
  unique: 'var(--color-item-legendary)',
};
const SING = 'var(--color-singularity)';

// --- maths live (formules extraites) -------------------------------------------

const floorDisplay = (v: number, percent: boolean) =>
  percent ? Math.floor(v * 10 + 1e-9) / 10 : Math.floor(v + 1e-9);

function mainValue(
  o: StatOption,
  enh: number,
  tier: number,
  ascended: boolean,
  rules: DetailModel['rules'],
): number {
  // Talisman/EE : table de niveaux du jeu (index = niveau, borné).
  if (o.levels?.length) return o.levels[Math.min(enh, o.levels.length - 1)];
  const tierMult = 1 + rules.tierFactor * tier;
  if (ascended && enh >= rules.maxEnhance) {
    let mult = 1 + rules.enhanceFactor * rules.maxEnhance + rules.singularity.activation.factor;
    for (const s of rules.singularity.steps) if (enh >= s.to) mult += s.factor;
    return floorDisplay(o.base * mult * tierMult, o.percent);
  }
  const lv = Math.min(enh, rules.maxEnhance);
  return floorDisplay(o.base * (1 + rules.enhanceFactor * lv) * tierMult, o.percent);
}

const fmt = (v: number, percent: boolean) => `${v}${percent ? '%' : ''}`;

// --- primitives UI ---------------------------------------------------------------

/** Valeur qui « flashe » quand elle change. */
function FlashNum({
  value,
  suffix,
  color,
}: {
  value: number | string;
  suffix?: string;
  color: string;
}) {
  const [hot, setHot] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setHot(true);
    const id = setTimeout(() => setHot(false), 500);
    return () => clearTimeout(id);
  }, [value]);
  return (
    <span
      className="inline-block font-mono font-bold transition-all duration-200"
      style={{
        color,
        ...(hot
          ? { textShadow: `0 0 12px ${color}`, transform: 'translateY(-1px) scale(1.06)' }
          : {}),
      }}
    >
      {value}
      {suffix}
    </span>
  );
}

/** Cadre de module (port du « Module » console V2). */
function Module({
  title,
  span,
  ascension,
  children,
}: {
  title: string;
  span?: 2;
  ascension?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`bg-surface-raised/80 flex min-w-0 flex-col overflow-hidden rounded-lg border ${
        ascension ? 'border-singularity/30' : 'border-line-subtle'
      } ${span === 2 ? 'md:col-span-2' : ''}`}
    >
      <div className="border-line-subtle bg-surface-base/60 border-b px-3.5 py-2.5">
        <span className="text-content-strong text-xs font-bold tracking-wider uppercase">
          {title}
        </span>
      </div>
      <div className="flex-1 p-4">{children}</div>
    </section>
  );
}

function StatInline({ statKey, label }: { statKey: string; label?: string }) {
  return (
    <span className="text-content-strong inline-flex min-w-0 items-center gap-1.5 text-sm font-bold">
      {STAT_ICON[statKey] && (
        // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
        <img src={img.statIcon(STAT_ICON[statKey])} alt="" className="h-4 w-4 shrink-0" />
      )}
      <span className="truncate">{label ?? statKey}</span>
    </span>
  );
}

// --- contrôles -----------------------------------------------------------------

function StepSlider({
  label,
  value,
  lo,
  hi,
  mark,
  accent,
  ascended,
  onChange,
}: {
  label: string;
  value: number;
  lo: number;
  hi: number;
  mark?: number;
  accent: string;
  ascended: boolean;
  onChange: (v: number) => void;
}) {
  const pct = hi > lo ? ((value - lo) / (hi - lo)) * 100 : 100;
  const markPct = mark !== undefined && hi > lo ? ((mark - lo) / (hi - lo)) * 100 : undefined;
  const color = ascended ? SING : accent;
  return (
    <div className="flex items-center gap-3">
      <span className="text-content-muted w-24 shrink-0 text-[10px] tracking-wider uppercase">
        {label}
      </span>
      <div className="relative flex h-6 flex-1 items-center rounded">
        <div className="bg-line-subtle absolute inset-x-0 h-1.5 rounded-full" />
        <div
          className="absolute left-0 h-1.5 rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
        {markPct !== undefined && markPct > 0 && markPct < 100 && (
          <div
            className="absolute h-3 w-px"
            style={{ left: `${markPct}%`, background: SING }}
            title="Singularity"
          />
        )}
        <div
          className="absolute h-3 w-3 -translate-x-1/2 rotate-45"
          style={{ left: `${pct}%`, background: color, borderRadius: 3 }}
        />
        <input
          type="range"
          min={lo}
          max={hi}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
          aria-valuetext={`+${value} / +${hi}`}
        />
      </div>
      <span className="w-14 text-right text-sm">
        <FlashNum value={`+${value}`} color={color} />
        <span className="text-content-subtle text-[9px]"> /+{hi}</span>
      </span>
    </div>
  );
}

function TierTabs({
  label,
  tier,
  accent,
  onChange,
}: {
  label: string;
  tier: number;
  accent: string;
  onChange: (t: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-content-muted w-24 shrink-0 text-[10px] tracking-wider uppercase">
        {label}
      </span>
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3, 4].map((tt) => {
          const on = tt === tier;
          return (
            <button
              key={tt}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(tt)}
              className="h-7 flex-1 rounded font-mono text-xs font-bold transition-all"
              style={{
                border: `1px solid ${on ? accent : 'rgba(255,255,255,0.1)'}`,
                background: on ? `color-mix(in srgb, ${accent} 12%, transparent)` : 'transparent',
                color: on ? accent : undefined,
              }}
            >
              T{tt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- vue principale --------------------------------------------------------------

export function EquipmentDetail({ model, labels }: { model: DetailModel; labels: DetailLabels }) {
  const accent = GRADE_VAR[model.grade] ?? GRADE_VAR.unique;
  const rules = model.rules;
  const useTiers = model.kind !== 'talisman' && model.kind !== 'ee';
  const maxEnhBase = rules.maxEnhance;

  const [tier, setTier] = useState(useTiers ? 4 : 0);
  const [enh, setEnhRaw] = useState(maxEnhBase);
  const [ascended, setAscended] = useState(false);
  const [choice, setChoice] = useState<Record<number, number>>({});
  const [piece, setPiece] = useState(0);

  const maxEnh = ascended ? maxEnhBase + rules.singularity.addLevels : maxEnhBase;
  const enhFloor = ascended ? maxEnhBase : 0;
  const setEnh = (v: number) => setEnhRaw(Math.max(enhFloor, Math.min(maxEnh, v)));
  const reforgeBase = model.reforgeBase;
  const maxReforge = ascended ? reforgeBase + rules.singularity.addReforge : reforgeBase;
  const canAscendNow = model.canAscend && reforgeBase > 0 && !ascended && enh === maxEnhBase;
  const toggleAscend = () => {
    if (ascended) {
      setAscended(false);
      setEnhRaw(maxEnhBase);
    } else if (canAscendNow) {
      setAscended(true);
    }
  };

  // Slots actifs (gear/talisman/EE ou pièce de set sélectionnée).
  const activePiece: DetailPiece | undefined = model.pieces?.[piece];
  const slots = activePiece ? activePiece.mains : model.slots;
  const subPool: SubstatPool | undefined = activePiece ? activePiece.sub : model.sub;

  // Exclusion main ↔ substats (paire clé+percent, comme le jeu).
  const usedSigs = useMemo(() => {
    const sigs = new Set<string>();
    slots.forEach((s, i) => {
      const opt = s.type === 'fixed' ? s.options[0] : s.options[choice[i] ?? 0];
      if (opt) sigs.add(`${opt.key}|${opt.percent}`);
    });
    return sigs;
  }, [slots, choice]);
  const effectivePool = subPool?.pool.filter((p) => !usedSigs.has(`${p.key}|${p.percent}`)) ?? [];

  // Texte de passif : indexé par breakthrough (gear) ou par niveau (talisman/EE).
  const passiveTextAt = (texts: string[]) => {
    if (!texts.length) return '';
    const idx = model.passiveByTier ? tier : enh;
    return texts[Math.min(idx, texts.length - 1)];
  };

  const singColor = ascended ? SING : accent;

  return (
    <div className="space-y-3.5">
      {/* Header : hero + configure */}
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <div
          className="bg-surface-raised/60 flex items-center gap-4 overflow-hidden rounded-xl border p-4 md:p-5"
          style={{ borderColor: `color-mix(in srgb, ${accent} 25%, transparent)` }}
        >
          <EquipmentIcon
            icon={model.icon || undefined}
            src={model.eeCharacterId ? img.ee(model.eeCharacterId) : undefined}
            grade={model.grade}
            size={80}
            stars={model.star}
            classType={model.classLimits.length === 1 ? model.classLimits[0] : undefined}
            overlayIcon={model.setIcon ?? model.passives[0]?.icon}
            ascended={ascended}
            enhanceLevel={enh}
            tier={useTiers && tier > 0 ? tier : undefined}
          />
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span
                className="text-[10px] font-bold tracking-[0.2em] uppercase"
                style={{ color: accent }}
              >
                {model.kind}
              </span>
              <span className="text-light text-xs">{'★'.repeat(model.star)}</span>
              {model.mode && (
                <span className="border-line-subtle text-content-strong rounded border px-1.5 text-[10px] font-bold">
                  {model.mode}
                </span>
              )}
            </div>
            <h1
              className={`text-2xl font-bold md:text-3xl ${ascended ? 'singularity-text' : ''}`}
              style={ascended ? undefined : { color: accent }}
            >
              {model.name}
              {ascended && (
                <>
                  {' - '}
                  <br />
                  {labels.singularitySuffix}
                </>
              )}
            </h1>
          </div>
        </div>

        {/* Configure */}
        <section className="border-line-subtle bg-surface-raised/80 flex flex-col overflow-hidden rounded-lg border">
          <div className="border-line-subtle bg-surface-base/60 border-b px-3.5 py-2.5">
            <span className="text-content-strong text-xs font-bold tracking-wider uppercase">
              {labels.configure}
            </span>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-2.5 px-3.5 py-3">
            <StepSlider
              label={labels.enhancement}
              value={enh}
              lo={enhFloor}
              hi={maxEnh}
              mark={model.canAscend ? maxEnhBase : undefined}
              accent={accent}
              ascended={ascended}
              onChange={setEnh}
            />
            {useTiers && (
              <TierTabs
                label={labels.breakthrough}
                tier={tier}
                accent={accent}
                onChange={setTier}
              />
            )}
            {reforgeBase > 0 && (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-content-muted w-24 shrink-0 text-[10px] tracking-wider uppercase">
                  {labels.reforge}
                </span>
                <FlashNum value={maxReforge} color={singColor} />
                <span className="text-content-subtle">{labels.available}</span>
                {ascended && rules.singularity.addReforge > 0 && (
                  <span style={{ color: SING }}>(+{rules.singularity.addReforge} ✦)</span>
                )}
              </div>
            )}
            {model.canAscend && reforgeBase > 0 && (
              <div className="flex items-center gap-3">
                <span className="w-24 shrink-0" />
                <button
                  type="button"
                  onClick={toggleAscend}
                  disabled={!ascended && !canAscendNow}
                  aria-pressed={ascended}
                  className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded text-[11px] font-bold tracking-wider uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    border: `1px solid ${SING}`,
                    background: ascended
                      ? `color-mix(in srgb, ${SING} 15%, transparent)`
                      : 'transparent',
                    color: SING,
                  }}
                >
                  <span>✦</span> {ascended ? labels.ascended : labels.ascend}
                  {!ascended && !canAscendNow && (
                    <span className="text-content-subtle text-[9px] normal-case">
                      · {labels.needs10}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Rangée effet + source AU-DESSUS des stats (armes/amulettes, comme V2) */}
      {model.passives.length > 0 && subPool && (
        <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2">
          <PassiveModules
            model={model}
            labels={labels}
            enh={enh}
            textAt={passiveTextAt}
            accent={accent}
          />
          {model.source && (
            <Module title={labels.source}>
              <SourceDetail source={model.source} />
            </Module>
          )}
        </div>
      )}

      {/* Sets : bonus de set + source en tête (comme V2) */}
      {model.setEffects && (
        <div className={model.source ? 'grid grid-cols-1 items-start gap-3 md:grid-cols-2' : ''}>
          <Module title={labels.setEffects}>
            <div className="flex flex-wrap gap-3">
              {(
                [
                  [
                    '2P',
                    tier >= 4 ? (model.setEffects.p2e ?? model.setEffects.p2) : model.setEffects.p2,
                  ],
                  [
                    '4P',
                    tier >= 4 ? (model.setEffects.p4e ?? model.setEffects.p4) : model.setEffects.p4,
                  ],
                ] as const
              ).map(
                ([tag, text]) =>
                  text && (
                    <div
                      key={tag}
                      className="border-line-subtle bg-surface-base/40 min-w-60 flex-1 rounded-lg border p-3.5"
                    >
                      <span className="border-buff/30 bg-buff/10 text-buff mb-2 inline-block rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase">
                        {tag}
                      </span>
                      <SkillDescription desc={text} className="text-content-muted text-sm" />
                    </div>
                  ),
              )}
            </div>
          </Module>
          {model.source && (
            <Module title={labels.source}>
              <SourceDetail source={model.source} />
            </Module>
          )}
        </div>
      )}

      {/* Grille des modules */}
      <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2">
        {/* Colonne stats / pièces */}
        <div className="flex flex-col gap-3">
          {model.rank || model.rank10 ? (
            <Module title={labels.priority}>
              <div className="flex gap-6">
                {(
                  [
                    [labels.unlock, model.rank],
                    [labels.upgrade, model.rank10],
                  ] as const
                ).map(
                  ([label, rank]) =>
                    rank && (
                      <div key={label} className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
                        <img src={img.rank(rank)} alt={rank} className="h-8 w-8" />
                        <span className="text-content-muted text-xs uppercase">{label}</span>
                      </div>
                    ),
                )}
              </div>
            </Module>
          ) : null}

          {activePiece && model.pieces ? (
            <Module title={labels.mainStat}>
              <div className="flex flex-col gap-2.5">
                {model.pieces.map((p, i) => {
                  const sel = i === piece;
                  return (
                    <button
                      key={p.slot}
                      type="button"
                      aria-pressed={sel}
                      onClick={() => setPiece(i)}
                      className="flex items-center gap-3 rounded-lg border p-3 text-left transition-colors"
                      style={{
                        borderColor: sel ? accent : 'rgba(255,255,255,0.1)',
                        background: sel
                          ? `color-mix(in srgb, ${accent} 8%, transparent)`
                          : 'transparent',
                      }}
                    >
                      <EquipmentIcon
                        icon={p.icon}
                        grade={model.grade}
                        size={48}
                        overlayIcon={model.setIcon}
                      />
                      <div className="min-w-0 flex-1">
                        <div
                          className="mb-1 text-[10px] tracking-wider uppercase"
                          style={{ color: sel ? accent : undefined }}
                        >
                          {labels.pieces[p.slot] ?? p.slot}
                        </div>
                        {p.mains.map((s, si) =>
                          s.options.slice(0, 1).map((o) => (
                            <div
                              key={si}
                              className="flex items-baseline justify-between gap-2 py-0.5"
                            >
                              <StatInline statKey={o.key} label={o.label} />
                              <FlashNum
                                value={mainValue(o, enh, tier, ascended, rules)}
                                suffix={o.percent ? '%' : ''}
                                color={sel ? accent : 'var(--color-content)'}
                              />
                            </div>
                          )),
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Module>
          ) : (
            slots.map((slot, i) =>
              slot.type === 'fixed' ? (
                <Module key={i} title={labels.mainStat}>
                  <div className="flex flex-col gap-2">
                    {slot.options.map((o) => (
                      <div key={o.key} className="flex items-baseline justify-between gap-3">
                        <StatInline statKey={o.key} label={o.label} />
                        <FlashNum
                          value={mainValue(o, enh, tier, ascended, rules)}
                          suffix={o.percent ? '%' : ''}
                          color={singColor}
                        />
                      </div>
                    ))}
                  </div>
                </Module>
              ) : (
                <Module key={i} title={labels.mainStats}>
                  <div className="flex flex-col gap-1.5">
                    {slot.options.map((o, oi) => {
                      const sel = (choice[i] ?? 0) === oi;
                      return (
                        <button
                          key={o.key}
                          type="button"
                          aria-pressed={sel}
                          onClick={() => setChoice((c) => ({ ...c, [i]: oi }))}
                          className="flex items-center justify-between gap-3 rounded-lg border px-2.5 py-2 text-left transition-colors"
                          style={{
                            borderColor: sel ? accent : 'rgba(255,255,255,0.1)',
                            background: sel
                              ? `color-mix(in srgb, ${accent} 8%, transparent)`
                              : 'transparent',
                          }}
                        >
                          <StatInline statKey={o.key} label={o.label} />
                          <FlashNum
                            value={mainValue(o, enh, tier, ascended, rules)}
                            suffix={o.percent ? '%' : ''}
                            color={sel ? accent : 'var(--color-content)'}
                          />
                        </button>
                      );
                    })}
                  </div>
                </Module>
              ),
            )
          )}

          {/* EE : passifs empilés à gauche (le full art occupe la droite, V2) */}
          {model.kind === 'ee' && model.passives.length > 0 && (
            <PassiveModules
              model={model}
              labels={labels}
              enh={enh}
              textAt={passiveTextAt}
              accent={accent}
            />
          )}
        </div>

        {/* Colonne droite : substats OU owner (full art) OU effet (talisman) */}
        {subPool ? (
          <Module title={labels.substats}>
            <div className="flex flex-col gap-2">
              <p className="text-content-subtle text-[11px]">min → max</p>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {effectivePool.map((s) => (
                  <div
                    key={`${s.key}|${s.percent}`}
                    className="border-line-subtle bg-surface-base/40 flex items-center justify-between gap-2.5 rounded-lg border px-2.5 py-1.5"
                  >
                    <StatInline statKey={s.key} />
                    <span className="flex items-baseline gap-2 font-mono text-xs tabular-nums">
                      <span className="text-content-muted">+{fmt(s.step, s.percent)}</span>
                      <span className="text-content-subtle">→</span>
                      <span className="text-content-strong font-semibold">
                        +{fmt(s.max, s.percent)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Module>
        ) : model.owner ? (
          <Module title={labels.owner}>
            <div className={`grid gap-3 ${model.ownerCompanion ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {[model.owner, ...(model.ownerCompanion ? [model.ownerCompanion] : [])].map((o) => (
                <OwnerFullArt key={o.id} owner={o} />
              ))}
            </div>
          </Module>
        ) : model.passives.length > 0 ? (
          // Talisman : l'effet occupe la cellule de droite (côte à côte, V2).
          <PassiveModules
            model={model}
            labels={labels}
            enh={enh}
            textAt={passiveTextAt}
            accent={accent}
          />
        ) : null}
      </div>

      {/* Ascension Singularity — ledger V2 */}
      {model.canAscend && (
        <Module title={labels.ascension} span={2} ascension>
          <AscensionLedger asc={model.ascension} labels={labels} />
        </Module>
      )}

      {/* Source (si pas déjà affichée à côté de l'effet / des bonus de set) */}
      {model.source && !(model.passives.length > 0 && subPool) && !model.setEffects && (
        <Module title={labels.source} span={2}>
          <SourceDetail source={model.source} />
        </Module>
      )}

      {/* Recommandé pour (portraits FI, plafonné) */}
      {model.recommended.length > 0 && (
        <Module title={labels.recommendedBy} span={2}>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6">
            {model.recommended.slice(0, RECO_CAP).map((c) => (
              <CharacterPortrait
                key={c.id}
                id={c.id}
                name={c.name}
                element={c.element}
                classType={c.classType}
                rarity={c.rarity}
                href={`/characters/${c.slug}`}
              />
            ))}
          </div>
          {model.recommended.length > RECO_CAP && (
            <p className="text-content-subtle mt-3 text-center text-sm">
              {labels.andMore.replace('{n}', String(model.recommended.length - RECO_CAP))}
            </p>
          )}
        </Module>
      )}
    </div>
  );
}

/** Plafond d'affichage des persos recommandés (le reste en « + N »). */
const RECO_CAP = 20;

/** Source détaillée : portrait MT du boss + nom + titre du contenu extrait. */
function SourceDetail({ source }: { source: NonNullable<DetailModel['source']> }) {
  return (
    <div className="flex flex-col gap-2">
      {source.bosses.map((b) => (
        <div key={b.id} className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
          <img
            src={img.boss(b.icon)}
            alt=""
            className="border-line-subtle h-10 w-10 rounded-lg border object-cover"
          />
          <div className="min-w-0">
            <div className="text-content-strong text-sm font-semibold">{b.name}</div>
            {b.sourceLabel && <div className="text-content-subtle text-xs">{b.sourceLabel}</div>}
          </div>
        </div>
      ))}
      {source.label && <p className="text-content-muted text-xs">{source.label}</p>}
    </div>
  );
}

// --- Ledger d'ascension Singularity (présentation V2) ----------------------------

/** Échelle de couleurs des grades C → S+ (palette V2, tokens globals.css). */
const AX_COLOR: Record<string, string> = {
  C: 'var(--color-ax-grade-c)',
  B: 'var(--color-ax-grade-b)',
  A: 'var(--color-ax-grade-a)',
  S: 'var(--color-ax-grade-s)',
  'S+': 'var(--color-ax-grade-sp)',
};
const axRateColor = (rate: number) =>
  rate >= 80 ? 'var(--color-success)' : rate >= 50 ? 'var(--color-warn)' : 'var(--color-danger)';

function AxEyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="text-content-muted text-[10px] font-semibold tracking-[0.14em] uppercase">
      {children}
    </div>
  );
}

/** Bande « Activation cost » : or + matériaux (comme V2). */
function AxActivationBand({ asc, labels }: { asc: AscView; labels: DetailLabels }) {
  return (
    <div className="border-line-subtle bg-surface-base/40 rounded-xl border px-4 py-3.5">
      <div className="mb-3">
        <AxEyebrow>{labels.activationCost}</AxEyebrow>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span className="text-stat-accent font-mono font-bold">
            {asc.activation.price.toLocaleString('en')}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
          <img src={img.gold()} alt="Gold" className="h-4.5 w-4.5" />
        </span>
        {asc.activation.materials.map((m) => (
          <span key={m.icon} className="inline-flex items-center gap-1.5">
            <span className="text-content-strong font-mono font-bold">×{m.count}</span>
            <ItemInline
              item={{ name: m.name, iconSrc: img.equipment(m.icon), grade: m.grade, desc: m.desc }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}

/** Table « Step success rates » +11..+15 : coûts + taux colorés (comme V2). */
function AxStepsCard({ asc, labels }: { asc: AscView; labels: DetailLabels }) {
  const headMats = asc.activation.materials;
  return (
    <div className="border-line-subtle bg-surface-base/40 rounded-xl border px-4 py-3.5">
      <div className="mb-3">
        <AxEyebrow>{labels.stepRates}</AxEyebrow>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-content-subtle pb-1.5 text-left text-[10px] font-semibold tracking-wider uppercase">
              Step
            </th>
            <th className="pb-1.5 pl-2 text-right text-xs whitespace-nowrap">
              {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
              <img src={img.gold()} alt="Gold" className="inline h-4.5 w-4.5" />
            </th>
            {headMats.map((m) => (
              <th key={m.icon} className="pb-1.5 pl-2 text-right text-xs whitespace-nowrap">
                <ItemInline
                  item={{
                    name: m.name,
                    iconSrc: img.equipment(m.icon),
                    grade: m.grade,
                    desc: m.desc,
                  }}
                  iconOnly
                />
              </th>
            ))}
            <th className="text-content-subtle pb-1.5 pl-2 text-right text-[10px] font-semibold tracking-wider uppercase">
              %
            </th>
          </tr>
        </thead>
        <tbody>
          {asc.steps.map((s) => (
            <tr key={s.to} className="border-line-subtle border-t">
              <td className="text-content-strong py-2 align-middle font-mono text-sm font-bold whitespace-nowrap">
                +{s.to}
              </td>
              <td className="text-stat-accent py-2 pl-2 text-right align-middle font-mono text-xs whitespace-nowrap tabular-nums">
                {s.price.toLocaleString('en')}
              </td>
              {headMats.map((hm) => {
                const m = s.materials.find((x) => x.icon === hm.icon);
                return (
                  <td
                    key={hm.icon}
                    className="text-content-muted py-2 pl-2 text-right align-middle font-mono text-xs whitespace-nowrap tabular-nums"
                  >
                    {m ? `×${m.count}` : '—'}
                  </td>
                );
              })}
              <td
                className="py-2 pl-2 text-right align-middle font-mono text-sm font-bold whitespace-nowrap tabular-nums"
                style={{ color: axRateColor(s.rate) }}
              >
                {s.rate}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Une ligne de bonus : nom + chance, chip de grade + plage(s) + taux du grade. */
function AxBonusRow({ bonus, sel }: { bonus: AscView['bonuses'][number]; sel: string }) {
  const g = bonus.grades.find((x) => x.grade === sel);
  const c = AX_COLOR[sel] ?? 'var(--color-content)';
  const split = g?.rangeAlt && bonus.splitLabels;
  return (
    <div className="border-line-subtle bg-surface-base/50 flex flex-col gap-2 rounded-lg border px-3 py-3">
      <div className="flex items-start justify-between gap-2.5">
        <span className="text-content-strong text-[13px] leading-snug font-medium">
          {bonus.name}
        </span>
        <span className="text-content-strong shrink-0 font-mono text-[13px] font-bold tabular-nums">
          {bonus.chance}%
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-5 min-w-5 items-center justify-center rounded px-1 font-mono text-[10.5px] font-bold"
          style={{
            border: `1px solid color-mix(in srgb, ${c} 67%, transparent)`,
            background: `color-mix(in srgb, ${c} 15%, transparent)`,
            color: c,
          }}
        >
          {sel}
        </span>
        <span className="font-mono text-sm font-bold tabular-nums" style={{ color: c }}>
          {g?.range ?? '—'}
          {split && (
            <span className="text-content-subtle ml-1 text-[10px] font-normal">
              ({bonus.splitLabels!.primary})
            </span>
          )}
        </span>
        {split && (
          <span className="font-mono text-sm font-bold tabular-nums" style={{ color: c }}>
            / {g!.rangeAlt}
            <span className="text-content-subtle ml-1 text-[10px] font-normal">
              ({bonus.splitLabels!.alt})
            </span>
          </span>
        )}
        {g && (
          <span className="text-content-subtle ml-auto shrink-0 font-mono text-[10px] tabular-nums">
            {g.rate}%
          </span>
        )}
      </div>
    </div>
  );
}

/** Colonne des bonus +15 : sélecteur de grade C → S+ (défaut S+, comme V2). */
function AxBonusColumn({ asc, labels }: { asc: AscView; labels: DetailLabels }) {
  const gradeList = asc.bonuses[0]?.grades.map((g) => g.grade) ?? [];
  const [sel, setSel] = useState(gradeList[gradeList.length - 1] ?? 'S+');
  return (
    <div className="border-line-subtle bg-surface-base/40 rounded-xl border p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <AxEyebrow>{labels.bonus15}</AxEyebrow>
        <div className="inline-flex items-center gap-1.5">
          <span className="text-content-muted mr-1 text-[9.5px] tracking-wider uppercase">
            {labels.grade}
          </span>
          {gradeList.map((g) => {
            const c = AX_COLOR[g] ?? 'var(--color-content)';
            const on = g === sel;
            return (
              <button
                key={g}
                type="button"
                aria-pressed={on}
                onClick={() => setSel(g)}
                className="inline-flex h-5 min-w-5 cursor-pointer items-center justify-center rounded px-1 font-mono text-[10.5px] font-bold transition-all"
                style={{
                  border: `1px solid ${on ? `color-mix(in srgb, ${c} 67%, transparent)` : 'var(--color-line-subtle)'}`,
                  background: on ? `color-mix(in srgb, ${c} 15%, transparent)` : 'transparent',
                  color: on ? c : 'var(--color-content-muted)',
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {asc.bonuses.map((b, i) => (
          <AxBonusRow key={i} bonus={b} sel={sel} />
        ))}
      </div>
    </div>
  );
}

type AscView = DetailModel['ascension'];

/** Ledger complet : [activation + steps] | [colonne bonus] (grille V2). */
function AscensionLedger({ asc, labels }: { asc: AscView; labels: DetailLabels }) {
  return (
    <div
      className={`grid grid-cols-1 items-start gap-4 ${asc.bonuses.length ? 'md:grid-cols-2' : ''}`}
    >
      <div className="flex min-w-0 flex-col gap-4">
        <AxActivationBand asc={asc} labels={labels} />
        <AxStepsCard asc={asc} labels={labels} />
      </div>
      {asc.bonuses.length > 0 && (
        <div className="min-w-0">
          <AxBonusColumn asc={asc} labels={labels} />
        </div>
      )}
    </div>
  );
}

/** Full art du porteur d'un EE (grand visuel IMG_, lien vers la fiche). */
function OwnerFullArt({ owner }: { owner: RecommendedChar }) {
  return (
    <Link
      href={`/characters/${owner.slug}` as Route}
      className="border-line-subtle relative block overflow-hidden rounded-lg border transition-opacity hover:opacity-90"
      style={{ aspectRatio: '3 / 4' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
      <img
        src={img.full(owner.id)}
        alt={owner.name}
        className="absolute inset-0 h-full w-full object-cover object-top"
      />
      <span className="from-surface-base/90 text-content-strong absolute inset-x-0 bottom-0 bg-linear-to-t to-transparent px-2.5 pt-8 pb-2 text-sm font-bold">
        {owner.name}
      </span>
    </Link>
  );
}

/** Paliers de passif (gear : 1 palier suit le breakthrough ; talisman/EE : Lv). */
function PassiveModules({
  model,
  labels,
  enh,
  textAt,
  accent,
}: {
  model: DetailModel;
  labels: DetailLabels;
  enh: number;
  textAt: (texts: string[]) => string;
  accent: string;
}) {
  // Famille à passif PAR CLASSE : chaque palier est indépendant (pas de
  // logique remplace/masque) et porte l'icône de sa classe + son nom.
  const byClass = model.passives.some((p) => p.classLimit);
  return (
    <Module title={byClass ? labels.effect : model.passives[0]?.name || labels.effect}>
      <div className="flex flex-col gap-2">
        {model.passives.map((p, i) => {
          const unlocked = enh >= p.unlockLevel || p.unlockLevel <= 1;
          // Palier remplaçant : masqué tant que non atteint ; masque la base après.
          if (!byClass && !p.isAdd && i > 0 && enh < p.unlockLevel) return null;
          if (
            !byClass &&
            !p.isAdd &&
            model.passives.some((q, qi) => qi > i && !q.isAdd && enh >= q.unlockLevel)
          )
            return null;
          return (
            <div
              key={i}
              className={`border-line-subtle bg-surface-base/40 rounded-lg border px-3 py-2.5 ${
                p.isAdd && !unlocked ? 'opacity-40' : ''
              }`}
            >
              {p.classLimit && (
                <div className="mb-1 flex items-center gap-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
                  <img src={img.klass(p.classLimit)} alt={p.classLimit} className="h-4 w-4" />
                  <span className="text-content-strong text-xs font-semibold">{p.name}</span>
                </div>
              )}
              {p.unlockLevel > 1 && (
                <div
                  className="mb-1 text-[10px] tracking-wider uppercase"
                  style={{ color: accent }}
                >
                  +{p.unlockLevel}
                </div>
              )}
              <SkillDescription desc={textAt(p.texts)} className="text-content-muted text-sm" />
            </div>
          );
        })}
        {model.effectChips && (
          <EffectChipsRow
            effects={model.effectChips.effects}
            statuses={model.effectChips.statuses}
          />
        )}
      </div>
    </Module>
  );
}

/** Lien retour (au-dessus de la vue, rendu par la page). */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href as Route}
      className="text-content-subtle hover:text-content mb-4 inline-flex items-center gap-1.5 text-xs tracking-wider uppercase transition-colors"
    >
      <span aria-hidden="true">←</span> {label}
    </Link>
  );
}
