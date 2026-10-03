'use client';

/**
 * Rangée d'un héros suivi : résumé de ce qu'il reste, puis, dépliée, la saisie
 * axe par axe et ce qui manque à CE héros. Extrait du composant principal
 * (découpage du 03/10/2026 — JSX déplacé tel quel ; l'entrée, le besoin et
 * les écritures viennent du parent).
 */
import { useMemo } from 'react';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import { EquipmentIcon } from '@/components/equipment/EquipmentIcon';
import { img, STAR_SPRITE } from '@/lib/images';
import {
  AFFINITY_PRESETS,
  MAX_SKILL,
  PREFERRED_GIFT_BONUS,
  SKILL_SLOTS,
  START_LEVEL,
  type HeroRow,
  type HeroTrackerLabels,
  type ItemAsset,
  type TranscendStep,
} from './contracts';
import {
  foodBreakdown,
  giftBreakdown,
  hasWork,
  type GrowthRules,
  type HeroNeed,
  type HeroProgress,
} from './engine';
import type { HeroEntry } from './roster-import';
import {
  Field,
  fmt,
  NeedChip,
  PieceIcon,
  Presets,
  Rail,
  replace,
  Scale,
  short,
  starLabel,
  Stepper,
} from './ui';

/* ─────────────────────────── Rangée de héros ─────────────────────────── */

export function HeroCard({
  hero,
  entry,
  need,
  steps,
  minTranscend,
  rules,
  items,
  withTarget,
  counted,
  expanded,
  onExpand,
  onUntrack,
  onChange,
  labels,
}: {
  hero: HeroRow;
  entry: HeroEntry;
  need?: HeroNeed;
  steps: TranscendStep[];
  minTranscend: number;
  rules: Omit<GrowthRules, 'transcendLadder'>;
  items: Record<string, ItemAsset>;
  withTarget: boolean;
  /** Ce héros entre-t-il dans les totaux ? (réglages « ignorer les 1★/2★ ») */
  counted: boolean;
  expanded: boolean;
  onExpand: () => void;
  onUntrack: () => void;
  onChange: (side: 'state' | 'target', patch: Partial<HeroProgress>) => void;
  labels: HeroTrackerLabels;
}) {
  const done = !need || !hasWork(need);
  const objects = need ? Object.values(need.items).reduce((a, b) => a + b, 0) : 0;
  const { state, target } = entry;

  /**
   * Paliers de niveau proposés : le plafond AVANT limit break (100 — là où
   * beaucoup de comptes s'arrêtent), puis chaque palier de limit break.
   * Tout est dérivé du barème ; aucun de ces nombres n'est écrit en dur.
   */
  const jumps = useMemo(() => {
    const set = new Set<number>([rules.xpCurve.length]);
    for (const s of rules.limitBreak[`${hero.rarity}_${hero.element}`] ?? []) {
      set.add(s.maxLevel);
      set.add(s.fromLevel);
    }
    return [...set].sort((a, b) => a - b);
  }, [rules, hero.rarity, hero.element]);

  /**
   * Paliers d'enchantement qui CHANGENT quelque chose : celui qui ouvre un slot
   * de gemme (5) et le maximum (10, qui débloque la passive). Dérivés du barème
   * plutôt qu'écrits à la main.
   */
  const eeStops = useMemo(() => {
    const set = new Set<number>([rules.eeEnchant.length]);
    for (const r of rules.eeEnchant) if (r.gemSlot > 0) set.add(r.level);
    return [...set].sort((a, b) => a - b);
  }, [rules.eeEnchant]);

  // Même code couleur que les axes dépliés : en clair ce qu'on a, en accent ce
  // qu'on vise. Deux nombres nus séparés d'une flèche ne se distinguaient pas.
  const aim = (from: string, to: string) => (
    <>
      <span className="text-content-strong">{from}</span>
      <span className="text-content-subtle"> → </span>
      <span className="text-accent">{to}</span>
    </>
  );
  /**
   * Le résumé ne dit QUE ce qu'il reste : un axe déjà à sa cible n'y figure pas.
   * « 6★ → 6★ » occupait la ligne pour annoncer qu'il n'y avait rien à faire.
   */
  const goalLevel = withTarget ? target.level : rules.xpCurve.length;
  const goalTranscend = withTarget ? target.transcend : steps.length - 1;
  const parts: React.ReactNode[] = [];
  if (state.level < goalLevel) {
    parts.push(
      <>
        {labels.level} {aim(`${state.level}`, `${goalLevel}`)}
      </>,
    );
  }
  if (state.transcend < goalTranscend) {
    parts.push(aim(starLabel(steps[state.transcend]), starLabel(steps[goalTranscend])));
  }
  // L'affinité ne se paie qu'en cadeaux : elle n'apparaît dans AUCUN décompte
  // d'objets, et sans ce segment un héros à qui il ne manque qu'elle n'aurait
  // rien à dire.
  const goalAffinity = withTarget ? target.affinity : rules.affinityCurve.length;
  if (state.affinity < goalAffinity) {
    parts.push(
      <>
        {labels.affinity} {aim(`${state.affinity}`, `${goalAffinity}`)}
      </>,
    );
  }
  if (objects > 0) parts.push(labels.itemCount.replace('{count}', fmt(objects)));
  // Reste l'or seul (une transcendance déjà couverte en doublons, par exemple) :
  // il y a du travail, la ligne ne peut pas rester vide.
  if (parts.length === 0 && need && need.gold > 0) parts.push(`${short(need.gold)} ${labels.gold}`);
  const summary = done ? (
    labels.doneHero
  ) : (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && ' · '}
          {part}
        </span>
      ))}
    </>
  );

  return (
    <li
      className={`overflow-hidden rounded-xl border ${
        done
          ? 'border-success/35 bg-success/5'
          : expanded
            ? 'border-line bg-surface-raised'
            : 'border-line-subtle bg-surface-raised'
      }`}
    >
      <div
        className={`flex items-center gap-2.5 px-2.5 py-2 ${expanded ? 'bg-surface-overlay' : ''}`}
      >
        <button
          type="button"
          onClick={onExpand}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          <span className={`w-11 shrink-0 ${done ? 'opacity-70' : ''}`}>
            <CharacterPortrait
              id={hero.id}
              name={hero.name}
              element={hero.element}
              classType={hero.class}
              rarity={hero.rarity}
              // Les étoiles du portrait suivent la TRANSCENDANCE saisie : un héros
              // 6★ affiché à sa rareté de base, c'est l'écran qui dément la saisie.
              transcendence={steps[state.transcend]?.star}
              size={44}
              showName={false}
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-content-strong block text-sm leading-tight font-semibold wrap-break-word">
              {hero.name}
              {hero.fusionLevels && (
                <span className="text-accent text-2xs ml-1.5 uppercase">{labels.coreFusion}</span>
              )}
              {!counted && (
                <span className="text-content-subtle border-line-subtle text-2xs ml-1.5 rounded border px-1 uppercase">
                  {labels.notCounted}
                </span>
              )}
            </span>
            <span
              className={`text-3xs mt-0.5 block font-mono ${done ? 'text-success' : 'text-content-muted'}`}
            >
              {summary}
            </span>
          </span>
          <span className="text-content-muted shrink-0 text-sm">{expanded ? '▴' : '▾'}</span>
        </button>
      </div>

      {expanded && (
        // Deux COLONNES, pas une grille : les axes n'ont pas la même hauteur (les
        // skills en font quatre rangées), et une grille alignait leurs lignes —
        // le niveau se retrouvait seul en haut d'une case vide. Le flux de
        // colonnes les enchaîne, chacun gardant sa hauteur.
        <div className="px-2.5 py-3">
          <div className="space-y-3.5 md:columns-2 md:space-y-0 md:gap-x-5 md:*:mb-3.5 md:*:break-inside-avoid">
            {/* ── Niveau ── */}
            <Field
              label={labels.level}
              value={`${state.level}`}
              target={`${withTarget ? target.level : rules.xpCurve.length}`}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <Rail role={labels.now}>
                  <Stepper
                    value={state.level}
                    min={START_LEVEL}
                    max={rules.xpCurve.length}
                    onChange={(v) => onChange('state', { level: v })}
                  />
                </Rail>
                <Rail role={withTarget ? labels.goal : labels.now} aim={withTarget}>
                  <Presets
                    values={jumps}
                    active={withTarget ? target.level : state.level}
                    aim={withTarget}
                    onPick={(v) => onChange(withTarget ? 'target' : 'state', { level: v })}
                  />
                </Rail>
              </div>
            </Field>

            {/* ── Compétences (ou palier de fusion) ── */}
            {hero.fusionLevels ? (
              <Field
                label={labels.fusionLevel}
                value={`${Math.max(state.fusion, 1)}`}
                target={`${withTarget ? Math.max(target.fusion, 1) : hero.fusionLevels.length}`}
                hint={withTarget ? labels.scaleHint : undefined}
              >
                <Scale
                  // Les skills d'un fusionné DÉMARRENT au niveau 1 : posséder le
                  // fusionné, c'est l'avoir débloqué. Le palier 1 du barème (les
                  // 300 cores de la fusion) est donc déjà payé, jamais compté, et
                  // ni l'état ni la cible ne peuvent redescendre à 0.
                  values={Array.from({ length: hero.fusionLevels.length }, (_, i) => i + 1)}
                  current={Math.max(state.fusion, 1)}
                  target={withTarget ? Math.max(target.fusion, 1) : hero.fusionLevels.length}
                  withTarget={withTarget}
                  onCurrent={(v) => onChange('state', { fusion: v })}
                  onTarget={(v) => onChange('target', { fusion: v })}
                />
              </Field>
            ) : (
              <Field label={labels.skills} hint={withTarget ? labels.scaleHint : undefined}>
                <div className="space-y-1.5">
                  {Array.from({ length: SKILL_SLOTS }, (_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {hero.skillIcons[i] ? (
                        <img
                          src={img.skill(hero.skillIcons[i])}
                          alt=""
                          aria-hidden
                          width={26}
                          height={26}
                          className="border-line-subtle bg-surface-sunken h-6.5 w-6.5 shrink-0 rounded border"
                        />
                      ) : (
                        <span className="border-line-subtle bg-surface-sunken text-content-muted text-2xs flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded border font-mono">
                          {i === SKILL_SLOTS - 1 ? 'CP' : `S${i + 1}`}
                        </span>
                      )}
                      <Scale
                        values={[1, 2, 3, 4, 5]}
                        current={state.skills[i] ?? 1}
                        target={withTarget ? (target.skills[i] ?? 1) : MAX_SKILL}
                        withTarget={withTarget}
                        onCurrent={(v) =>
                          onChange('state', { skills: replace(state.skills, i, v) })
                        }
                        onTarget={(v) =>
                          onChange('target', { skills: replace(target.skills, i, v) })
                        }
                      />
                    </div>
                  ))}
                </div>
              </Field>
            )}

            {/* ── Transcendance ── */}
            <Field
              label={labels.transcend}
              value={starLabel(steps[state.transcend])}
              target={starLabel(steps[withTarget ? target.transcend : steps.length - 1])}
              hint={withTarget ? labels.scaleHint : undefined}
            >
              <Scale
                values={steps.map((_, i) => i).filter((i) => i >= minTranscend)}
                current={state.transcend}
                target={withTarget ? target.transcend : steps.length - 1}
                withTarget={withTarget}
                tone="star"
                // Le sprite d'étoile DU JEU, à la couleur que la donnée déclare
                // pour ce palier (jaune, puis orange/rouge/violet sur les « + »)
                // — la même image que le slider de la fiche perso.
                icon={(i, reached) => (
                  <img
                    src={img.transcendStar(
                      reached
                        ? (STAR_SPRITE[steps[i].starColor] ?? STAR_SPRITE.yellow)
                        : STAR_SPRITE.gray,
                    )}
                    alt=""
                    aria-hidden
                    width={14}
                    height={14}
                  />
                )}
                render={(i) =>
                  `${steps[i].showStar}${steps[i].starPlus > 0 ? `+${steps[i].starPlus}` : ''}`
                }
                onCurrent={(v) => onChange('state', { transcend: v })}
                onTarget={(v) => onChange('target', { transcend: v })}
              />
            </Field>

            {/* ── Affinité ── */}
            <Field
              label={labels.affinity}
              value={`${state.affinity}`}
              target={`${withTarget ? target.affinity : rules.affinityCurve.length}`}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <Rail role={labels.now}>
                  <Stepper
                    value={state.affinity}
                    min={1}
                    max={rules.affinityCurve.length}
                    onChange={(v) => onChange('state', { affinity: v })}
                  />
                </Rail>
                <Rail role={withTarget ? labels.goal : labels.now} aim={withTarget}>
                  <Presets
                    values={AFFINITY_PRESETS.filter((n) => n <= rules.affinityCurve.length)}
                    active={withTarget ? target.affinity : state.affinity}
                    aim={withTarget}
                    onPick={(v) => onChange(withTarget ? 'target' : 'state', { affinity: v })}
                  />
                </Rail>
              </div>
            </Field>

            {/* ── Équipement(s) exclusif(s) ── */}
            {state.ee.map((_, i) => (
              <Field
                key={i}
                label={i === 0 ? labels.ee : labels.eeFusion}
                value={`+${state.ee[i] ?? 0}`}
                target={`+${withTarget ? (target.ee[i] ?? 0) : rules.eeEnchant.length}`}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  {hero.ee[i] && (
                    <EquipmentIcon
                      src={img.equipment(hero.ee[i].icon)}
                      grade={hero.ee[i].grade}
                      alt={hero.ee[i].name}
                      size={30}
                    />
                  )}
                  {/* Onze crans muets ne disaient rien : un pas à pas se lit. */}
                  <Rail role={labels.now}>
                    <Stepper
                      value={state.ee[i] ?? 0}
                      min={0}
                      max={rules.eeEnchant.length}
                      onChange={(v) => onChange('state', { ee: replace(state.ee, i, v) })}
                    />
                  </Rail>
                  <Rail role={withTarget ? labels.goal : labels.now} aim={withTarget}>
                    <Presets
                      values={eeStops}
                      active={withTarget ? (target.ee[i] ?? 0) : (state.ee[i] ?? 0)}
                      aim={withTarget}
                      format={(v) => `+${v}`}
                      onPick={(v) =>
                        onChange(withTarget ? 'target' : 'state', {
                          ee: replace(withTarget ? target.ee : state.ee, i, v),
                        })
                      }
                    />
                  </Rail>
                </div>
              </Field>
            ))}
          </div>

          {/* ── Ce qui manque à CE héros ── */}
          <div className="border-line-subtle mt-3.5 border-t pt-2.5">
            <div className="flex items-center gap-2">
              <h4 className="text-content-muted text-3xs font-mono tracking-wide uppercase">
                {need && !done ? labels.heroNeeds : labels.doneHero}
              </h4>
              <div className="flex-1" />
              <button
                type="button"
                onClick={onUntrack}
                className="border-line-subtle text-content-muted hover:border-danger hover:text-danger text-3xs rounded border px-2 py-0.5 transition-colors"
              >
                {labels.untrack}
              </button>
            </div>
            {need && !done && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {Object.entries(need.items).map(([id, count]) => (
                  <NeedChip key={id} asset={items[id]} count={count} />
                ))}
                {foodBreakdown(need.xp, rules.xpFood).map((b) => (
                  <NeedChip
                    key={b.entry.id}
                    asset={{ name: b.entry.name.en, icon: b.entry.icon, grade: b.entry.grade }}
                    count={b.count}
                  />
                ))}
                {giftBreakdown(
                  need.affinityPoints,
                  rules.gifts,
                  hero.gift,
                  PREFERRED_GIFT_BONUS,
                ).map((b) => (
                  <NeedChip
                    key={b.entry.id}
                    asset={{ name: b.entry.name.en, icon: b.entry.icon, grade: b.entry.grade }}
                    count={b.count}
                  />
                ))}
                {need.pieces > 0 && (
                  <span
                    title={labels.pieces}
                    className="border-line-subtle bg-surface-sunken flex items-center gap-1.5 rounded-lg border py-1 pr-2 pl-1"
                  >
                    <PieceIcon id={hero.id} />
                    <span className="text-content-strong text-3xs font-mono font-semibold">
                      ×{need.pieces}
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
