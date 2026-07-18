/**
 * Guide « Daily Stamina Burn » — la roadmap quotidienne de dépense de stamina
 * (5 priorités numérotées + suggestions hors endgame + pro tips).
 *
 * Server Component : contenu verbatim V2 (labels.ts) sur les primitives
 * éditoriales ; parse-text STRICT (une référence d'item morte casse le build).
 * Les noms des boss irréguliers DÉRIVENT de monsters.json (la V2 les codait
 * en dur dans 5 langues) — sauf l'Irregular Queen, au nom vide dans les
 * tables du jeu (repli éditorial).
 */
import type { ReactNode } from 'react';
import type { Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { getMonster, monsterIconSrc } from '@/lib/data/monsters';
import { img } from '@/lib/images';
import { InlineIcon } from '@/components/inline/InlineIcon';
import { Callout, Prose } from '@/components/guides/editorial/blocks';
import type { LocalizedText } from '@contracts';
import { IRREGULAR_QUEEN_NAME, LABELS, SWEEP_OPTIONAL, SWEEP_ROWS, type SweepRow } from './labels';

const WHERE = 'daily-stamina';

/** Boss irréguliers cités (les collections d'Irregular gear qu'ils droppent). */
const GEAR_SOURCES: { collection: string; bossIds: string[] }[] = [
  { collection: 'Briareos Collection', bossIds: ['4013071', '4013072'] },
  { collection: 'Gorgon Collection', bossIds: ['4014003', '4089001'] },
];

/** Pastille de coût en stamina (le chip ambré V2). */
function CostPill({ children }: { children: ReactNode }) {
  return (
    <span className="w-fit rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
      {children}
    </span>
  );
}

/** Numéro de priorité (cercle sky V2). */
function NumBadge({ n, size = 'md' }: { n: number; size?: 'md' | 'sm' }) {
  return (
    <span
      className={
        size === 'md'
          ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sky-500/40 bg-sky-500/15 text-sm font-bold text-sky-400'
          : 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sky-500/40 bg-sky-500/15 text-xs font-bold text-sky-400'
      }
      aria-hidden
    >
      {n}
    </span>
  );
}

export default async function DailyStaminaGuide({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t, strict: true };
  const L = (m: LocalizedText): string => lRec(m, lang) || m.en || '';
  const P = (m: LocalizedText): ReactNode => parseText(L(m), ctx);

  /** Mention inline d'un boss : vignette + nom DÉRIVÉ (repli éditorial si les
   *  tables n'en donnent pas — Irregular Queen). Id inconnu = build cassé. */
  const boss = (id: string): ReactNode => {
    const monster = getMonster(id);
    if (!monster) throw new Error(`${WHERE} : monstre inconnu « ${id} »`);
    const name =
      lRec(monster.name, lang) ||
      monster.name.en ||
      (id === '4089001' ? L(IRREGULAR_QUEEN_NAME) : '');
    if (!name) throw new Error(`${WHERE} : boss « ${id} » sans nom (ajouter un repli éditorial)`);
    return <InlineIcon icon={monsterIconSrc(monster)} label={name} size={28} underline={false} />;
  };

  const sweepTile = (row: SweepRow, optional = false): ReactNode => (
    <div
      className={
        optional
          ? 'border-line space-y-1 rounded-lg border border-dashed p-3'
          : 'border-line-subtle bg-surface-overlay/50 space-y-1 rounded-lg border p-3'
      }
    >
      <div className="flex items-center gap-2">
        <span
          className={
            optional
              ? 'text-content-subtle text-sm font-semibold'
              : 'text-content-strong text-sm font-semibold'
          }
        >
          {L(row.name)}
        </span>
        {optional && (
          <span className="text-content-subtle text-xs italic">{L(LABELS.sweep_optional)}</span>
        )}
      </div>
      <CostPill>{P(row.cost)}</CostPill>
      <div className="text-content-muted pt-1 text-xs">{P(row.reason)}</div>
    </div>
  );

  /** Carte de priorité 2..5 (grille) : numéro + titre + coût + corps. */
  const priorityCard = (
    n: number,
    heading: LocalizedText,
    cost: LocalizedText,
    body: ReactNode,
  ) => (
    <div className="border-line bg-surface-raised/60 space-y-2 rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <NumBadge n={n} size="sm" />
        <span className="text-content-strong text-sm font-semibold">{L(heading)}</span>
      </div>
      <CostPill>{P(cost)}</CostPill>
      <div className="text-content-muted pt-1 text-xs">{body}</div>
    </div>
  );

  return (
    <>
      <Prose>{P(LABELS.introPara1)}</Prose>
      <Prose>{P(LABELS.introPara2)}</Prose>

      {/* ── 1. Daily Sweep ── */}
      <section className="border-line bg-surface-raised/60 rounded-xl border p-5">
        <div className="flex gap-4">
          <NumBadge n={1} />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="text-lg font-semibold text-sky-300">{L(LABELS.heading_dailySweep)}</div>
            <p className="text-content-subtle m-0 text-sm">{L(LABELS.body_dailySweep)}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {SWEEP_ROWS.map((row, i) => (
                <div key={i}>{sweepTile(row)}</div>
              ))}
            </div>
            {sweepTile(SWEEP_OPTIONAL, true)}
          </div>
        </div>
      </section>

      {/* ── 2-5. Autres priorités ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {priorityCard(
          2,
          LABELS.heading_terminusIsle,
          LABELS.cost_terminusIsle,
          <span className="whitespace-pre-line">{P(LABELS.body_terminusIsle)}</span>,
        )}
        {priorityCard(
          3,
          LABELS.heading_irregularBosses,
          LABELS.cost_irregularBosses,
          <div className="space-y-1">
            <p className="m-0 whitespace-pre-line">{P(LABELS.body_irregularBossesCost)}</p>
            <ul className="m-0 list-disc space-y-1 pl-4">
              {GEAR_SOURCES.map(({ collection, bossIds }) => (
                <li key={collection}>
                  <span className="text-item-legendary font-semibold">{collection}</span>
                  {L(LABELS.irregularGearFrom)}
                  {bossIds.map((id, i) => (
                    <span key={id}>
                      {i > 0 && ' / '}
                      {boss(id)}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </div>,
        )}
        {priorityCard(
          4,
          LABELS.heading_towerFloors,
          LABELS.cost_towerFloors,
          P(LABELS.body_towerFloors),
        )}
        {priorityCard(
          5,
          LABELS.heading_adventureLicense,
          LABELS.cost_adventureLicense,
          <span className="whitespace-pre-line">{P(LABELS.body_adventureLicense)}</span>,
        )}
      </div>

      {/* ── Total de base ── */}
      <Callout accent="sky" label={`Σ ${L(LABELS.heading_totalBaseline)}`}>
        {P(LABELS.body_totalBaseline)}
      </Callout>

      {/* ── Hors endgame ── */}
      <Callout accent="cyan">
        <p className="m-0 mb-2">{L(LABELS.notYetEndgame)}</p>
        <ul className="m-0 list-disc space-y-1 pl-5">
          <li>
            <strong className="font-semibold text-amber-400 underline">
              {L(LABELS.heading_farmStage12)}
            </strong>
            {P(LABELS.body_farmStage12)}
          </li>
          <li>
            <strong className="font-semibold text-amber-400 underline">
              {L(LABELS.heading_hardModeStoryBossesAlt)}
            </strong>
            {L(LABELS.body_hardModeStoryAlt_prefix)}
            <InlineIcon icon={img.item('TI_Present_01_01')} label={L(LABELS.affectionItemsLabel)} />
            {', '}
            <InlineIcon
              icon={img.item('TI_Item_Growth_Earth_02')}
              label={L(LABELS.upgradeStonesLabel)}
            />
            {P(LABELS.body_hardModeStoryAlt_suffix)}
          </li>
        </ul>
      </Callout>

      {/* ── Pro tips ── */}
      <Callout accent="amber">
        {'⚠️ '}
        <strong className="font-semibold text-amber-400 underline">
          {L(LABELS.avoidReceiveAll)}
        </strong>
        {L(LABELS.body_avoidReceiveAll)}
      </Callout>
      <Callout accent="emerald">{P(LABELS.body_noteOtherDailies)}</Callout>
    </>
  );
}
