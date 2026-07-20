/**
 * Guide « Beginner FAQ » — 5 sections thématiques de cartes question→réponse.
 *
 * Server Component : le contenu (content.ts, verbatim V2) est composé sur les
 * primitives éditoriales partagées (`components/guides/editorial`) ; seule la
 * barre de sommaire (TocBar, scroll-spy) est cliente. parse-text en STRICT :
 * une référence de contenu morte casse le build.
 */
import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import type { Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { parseText, plainInlineText, type ParseCtx } from '@/lib/parse-text';
import { buildFaqJsonLd } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { getMonster, monsterIconSrc } from '@/lib/data/monsters';
import { InlineIcon } from '@/components/inline/InlineIcon';
import {
  Callout,
  DotList,
  MiniPanel,
  NumberedList,
  Prose,
  QACard,
  SectionHeading,
  StepRows,
} from '@/components/guides/editorial/blocks';
import { TocBar } from '@/components/guides/editorial/TocBar';
import { RelatedGuides } from '@/components/guides/editorial/RelatedGuides';
import { EDITORIAL_ACCENT } from '@/components/guides/editorial/accents';
import { LABELS } from './content';

/**
 * Q/R du JSON-LD FAQPage — clés de LABELS, en PHASE avec les QACard du rendu
 * (question = prop `question`, réponses = la prose PRINCIPALE de la carte ;
 * les tableaux/listes riches restent au rendu, un schéma veut du concis).
 * Ajouter une carte = ajouter sa ligne ici.
 */
const FAQ_LD: Array<{ q: keyof typeof LABELS; a: Array<keyof typeof LABELS> }> = [
  { q: 'rerollImportance', a: ['rerollAnswer', 'freeHeroesFoundation', 'newAccountStarters'] },
  { q: 'whereGoFirst', a: ['evaGuideQuests', 'underChallengesLine', 'skywardTowerLine'] },
  { q: 'whoPullFor', a: ['wideRangeHeroes', 'limitedDesc', 'premiumBannerDesc'] },
  { q: 'pullForDupes', a: ['regularHeroesFarm', 'star4WeaknessGauge', 'star5Burst3'] },
  { q: 'whatTeam', a: ['standardTeam', 'earthFireTeam'] },
  { q: 'howGetGear', a: ['gearSourceDesc', 'chimeraArmorDesc', 'weaponAccessorySkills'] },
  { q: 'howGetEETalismans', a: ['exclusiveEquipmentDesc', 'talismansDesc'] },
  { q: 'gearWorthKeeping', a: ['dontThrowBlues', 'epicGearStaple', 'gearRarityMeaning'] },
  {
    q: 'whenUpgradeGear',
    a: ['enhancingWeaponsDesc', 'accessoriesCritDesc', 'armorLaterChapters'],
  },
  { q: 'skillManualsFirst', a: ['skillLevel2Weakness', 'effectChanceDuration', 'chainPassive'] },
  { q: 'baseUpgrades', a: ['baseUpgradeOrder', 'unlockQuirks'] },
  { q: 'quirksPriority', a: ['quirksUpgradeOrder', 'dpsSubclassFirst', 'quirkLevel5'] },
  { q: 'guildImportance', a: ['guildDesc'] },
  { q: 'heroScaleHealth', a: ['keyWordsLookFor', 'proportionalStat'] },
];

/* Ancres stables (jamais localisées) des 5 sections. */
const SECTIONS = [
  { id: 'getting-started', accent: 'sky', label: LABELS.sectionGettingStarted },
  { id: 'heroes-pulling', accent: 'violet', label: LABELS.sectionHeroesPulling },
  { id: 'gear-equipment', accent: 'amber', label: LABELS.sectionGearEquipment },
  { id: 'progression-resources', accent: 'emerald', label: LABELS.sectionProgressionResources },
  { id: 'advanced-tips', accent: 'rose', label: LABELS.sectionAdvancedTips },
] as const;

/** Pastille d'étoiles de transcendance (4★, 5★, 6★) des listes de dupes. */
function StarChip({ label }: { label: string }) {
  return <span className="mr-1 font-semibold text-amber-400">{label}</span>;
}

/** Mention inline d'un boss : vignette + nom éditorial. Id inconnu = build cassé. */
function BossInline({ id, label }: { id: string; label: string }) {
  const monster = getMonster(id);
  if (!monster) throw new Error(`beginner-faq : monstre inconnu « ${id} »`);
  return <InlineIcon icon={monsterIconSrc(monster)} label={label} size={28} underline={false} />;
}

/** Table compacte des raretés d'équipement (ticks max de substats). */
function GearRarityTable({
  rows,
}: {
  rows: {
    rarity: string;
    color: 'legendary' | 'epic' | 'superior';
    stars: number;
    ticks: string;
  }[];
}) {
  // Tokens item-* du thème — littéraux (Tailwind v4).
  const COLOR = {
    legendary: 'text-item-legendary',
    epic: 'text-item-epic',
    superior: 'text-item-superior',
  } as const;
  const CHIP = {
    legendary: 'border-item-legendary/25 bg-item-legendary/10',
    epic: 'border-item-epic/25 bg-item-epic/10',
    superior: 'border-item-superior/25 bg-item-superior/10',
  } as const;
  return (
    <div className="border-line-subtle bg-surface-overlay/50 overflow-hidden rounded-lg border">
      {rows.map((r, i) => (
        <div
          key={r.color}
          className={`flex items-center gap-3 px-3.5 py-3 ${i < rows.length - 1 ? 'border-line-subtle border-b' : ''}`}
        >
          <span className="flex min-w-29 flex-col gap-0.5">
            <span className={`text-sm font-semibold ${COLOR[r.color]}`}>{r.rarity}</span>
            <span className={`text-[9px] leading-none ${COLOR[r.color]}`} aria-hidden>
              {'★'.repeat(r.stars)}
            </span>
          </span>
          <span
            className={`rounded-md border px-2 py-1 font-mono text-[11px] font-semibold ${COLOR[r.color]} ${CHIP[r.color]}`}
          >
            {r.ticks}
          </span>
        </div>
      ))}
    </div>
  );
}

export default async function BeginnerFaqGuide({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t, strict: true };
  const L = (m: (typeof LABELS)[keyof typeof LABELS]): string => lRec(m, lang);
  const P = (m: (typeof LABELS)[keyof typeof LABELS]): ReactNode => parseText(lRec(m, lang), ctx);

  const premiumLimitedHref = localePath(lang, '/guides/general-guides/premium-limited') as Route;

  // FAQPage : le rich-result que cette page mérite (c'est LITTÉRALEMENT une FAQ).
  const faqLd = buildFaqJsonLd(
    FAQ_LD.map(({ q, a }) => ({
      question: L(LABELS[q]),
      answer: a.map((k) => plainInlineText(lRec(LABELS[k], lang))).join(' '),
    })),
  );

  return (
    <>
      <JsonLd id="ld-faq" data={faqLd} />
      <Prose>{L(LABELS.intro)}</Prose>

      <TocBar
        ariaLabel={L(LABELS.onThisPage)}
        sections={SECTIONS.map((s) => ({ id: s.id, accent: s.accent, label: L(s.label) }))}
      />

      <div className="flex flex-col gap-12">
        {/* ═══ Getting Started ═══ */}
        <section id="getting-started" className="scroll-mt-28">
          <SectionHeading accent="sky" title={L(LABELS.sectionGettingStarted)} />
          <div className="flex flex-col gap-3.5">
            <QACard accent="sky" question={L(LABELS.rerollImportance)}>
              <Prose>{P(LABELS.rerollAnswer)}</Prose>
              <Prose>{P(LABELS.freeHeroesFoundation)}</Prose>
              <Prose>{P(LABELS.newAccountStarters)}</Prose>
              <Prose>{L(LABELS.doppelgangerFarm)}</Prose>
            </QACard>

            <QACard
              accent="sky"
              featured
              badge={L(LABELS.startHere)}
              question={L(LABELS.whereGoFirst)}
            >
              <Prose>{L(LABELS.evaGuideQuests)}</Prose>
              <DotList
                accent="sky"
                items={[
                  P(LABELS.underChallengesLine),
                  L(LABELS.experienceSlow),
                  P(LABELS.skywardTowerLine),
                ]}
              />
            </QACard>
          </div>
        </section>

        {/* ═══ Heroes & Pulling ═══ */}
        <section id="heroes-pulling" className="scroll-mt-28">
          <SectionHeading accent="violet" title={L(LABELS.sectionHeroesPulling)} />
          <div className="flex flex-col gap-3.5">
            <QACard accent="violet" question={L(LABELS.whoPullFor)}>
              <Prose>{L(LABELS.wideRangeHeroes)}</Prose>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <MiniPanel accent="violet" title={L(LABELS.limited)}>
                  {P(LABELS.limitedDesc)}
                </MiniPanel>
                <MiniPanel accent="amber" title={L(LABELS.premium)}>
                  {L(LABELS.premiumBannerDesc)}
                  <Link
                    href={premiumLimitedHref}
                    className="text-amber-400 underline underline-offset-2"
                  >
                    {L(LABELS.dedicatedGuide)}
                  </Link>
                  {L(LABELS.periodSeeGuide)}
                </MiniPanel>
                <MiniPanel accent="emerald" title={L(LABELS.regular)}>
                  {/* parseText rend un TABLEAU (clés internes 0..n) : chaque
                      appel frère doit vivre dans son propre parent. */}
                  <span>{P(LABELS.regularHeroesDesc)}</span>
                  <br />
                  <span>{P(LABELS.customRecruitGoal)}</span>
                  <div className="mt-2">
                    {parseText('{P/Valentine} {P/Tamara} {P/Skadi} {P/Charlotte}', ctx)}
                  </div>
                </MiniPanel>
              </div>
            </QACard>

            <QACard accent="violet" question={L(LABELS.pullForDupes)}>
              <Prose>{L(LABELS.regularHeroesFarm)}</Prose>
              <p className="text-content-subtle m-0 text-xs">{L(LABELS.transcendSteps)}</p>
              <DotList
                accent="violet"
                items={[
                  <>
                    <StarChip label="4★" />
                    {L(LABELS.star4WeaknessGauge)}
                  </>,
                  <>
                    <StarChip label="5★" />
                    {L(LABELS.star5Burst3)}
                  </>,
                  <>
                    <StarChip label="6★" />
                    {L(LABELS.star6NotPriority)}
                  </>,
                ]}
              />
              <Prose>
                {L(LABELS.premiumLimitedLead)}
                <strong className="font-semibold text-amber-400">{L(LABELS.premium)}</strong>
                {L(LABELS.andKwa)}
                <strong className={`font-semibold ${EDITORIAL_ACCENT.violet.text}`}>
                  {L(LABELS.limited)}
                </strong>
                {L(LABELS.premiumLimitedTranscend)}
                <Link
                  href={premiumLimitedHref}
                  className="text-violet-400 underline underline-offset-2"
                >
                  {L(LABELS.here)}
                </Link>
                {L(LABELS.periodSeeGuide)}
              </Prose>
            </QACard>

            <QACard accent="violet" question={L(LABELS.whatTeam)}>
              <Prose>{L(LABELS.standardTeam)}</Prose>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Callout accent="rose" label={L(LABELS.dpsFromStartDash)}>
                  {parseText('{P/Ame} {P/Rey} {P/Rin} {P/Vlada}', ctx)}
                </Callout>
                <Callout accent="sky" label={L(LABELS.critBuffFromCustom)}>
                  {parseText('{P/Valentine} {P/Tamara} {P/Skadi} {P/Charlotte}', ctx)}
                </Callout>
                <Callout accent="emerald" label={L(LABELS.healers)}>
                  {P(LABELS.healersLine)}
                </Callout>
                <Callout accent="amber" label={L(LABELS.flexSupport)}>
                  {P(LABELS.flexLine)}
                </Callout>
              </div>
              <Callout accent="amber" label={L(LABELS.firstBossPriorities)}>
                <ul className="m-0 mt-0.5 flex list-none flex-col gap-1.5 p-0">
                  <li>
                    <BossInline id="4034002" label={L(LABELS.unidentifiedChimera)} />{' '}
                    {P(LABELS.chimeraArmorSets)}
                  </li>
                  <li>
                    <BossInline id="4076001" label={L(LABELS.glicys)} /> {L(LABELS.and)}{' '}
                    <BossInline id="4076002" label={L(LABELS.blazingKnightMeteos)} />{' '}
                    {L(LABELS.forWeaponsAccessories)}
                  </li>
                </ul>
                <p className="m-0 mt-3">{P(LABELS.earthFireTeam)}</p>
                <div className="mt-3">
                  <Callout accent="emerald" label={L(LABELS.tip)}>
                    {L(LABELS.friendSupportTip)}
                  </Callout>
                </div>
              </Callout>
            </QACard>
          </div>
        </section>

        {/* ═══ Gear & Equipment ═══ */}
        <section id="gear-equipment" className="scroll-mt-28">
          <SectionHeading accent="amber" title={L(LABELS.sectionGearEquipment)} />
          <div className="flex flex-col gap-3.5">
            <QACard accent="amber" question={L(LABELS.howGetGear)}>
              <Prose>{L(LABELS.gearSourceDesc)}</Prose>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Callout accent="cyan" label={L(LABELS.armorPriority)}>
                  <BossInline id="4034002" label={L(LABELS.unidentifiedChimera)} />{' '}
                  {L(LABELS.chimeraArmorDesc)}
                </Callout>
                <Callout accent="rose" label={L(LABELS.weaponsAccessories)}>
                  {L(LABELS.weaponAccessorySkills)}
                  <br />
                  <BossInline id="4076001" label={L(LABELS.glicys)} />{' '}
                  {L(LABELS.glicysAccessoryDesc)}
                  <br />
                  <BossInline id="4076002" label={L(LABELS.meteos)} />{' '}
                  {L(LABELS.meteosAccessoryDesc)}
                </Callout>
              </div>
            </QACard>

            <QACard accent="amber" question={L(LABELS.howGetEETalismans)}>
              <Callout accent="violet" label={L(LABELS.exclusiveEquipment)}>
                {L(LABELS.exclusiveEquipmentDesc)}
              </Callout>
              <Callout accent="sky" label={L(LABELS.talismansAndCharms)}>
                {L(LABELS.talismansDesc)}
              </Callout>
            </QACard>

            <QACard accent="amber" question={L(LABELS.gearWorthKeeping)}>
              <Callout accent="rose">
                <strong className="font-semibold text-rose-400">{L(LABELS.dontThrowBlues)}</strong>
              </Callout>
              <Prose>{L(LABELS.epicGearStaple)}</Prose>
              <Prose>{L(LABELS.gearReforge)}</Prose>
              <GearRarityTable
                rows={[
                  {
                    rarity: L(LABELS.sixStarLegendary),
                    color: 'legendary',
                    stars: 6,
                    ticks: L(LABELS.eighteenTicks),
                  },
                  {
                    rarity: L(LABELS.sixStarEpic),
                    color: 'epic',
                    stars: 6,
                    ticks: L(LABELS.seventeenTicks),
                  },
                  {
                    rarity: L(LABELS.sixStarSuperior),
                    color: 'superior',
                    stars: 6,
                    ticks: L(LABELS.sixteenTicks),
                  },
                ]}
              />
              <Prose>{L(LABELS.gearRarityMeaning)}</Prose>
            </QACard>

            <QACard accent="amber" question={L(LABELS.whenUpgradeGear)}>
              <NumberedList
                accent="amber"
                items={[
                  <>
                    <strong className="text-content-strong font-semibold">
                      {L(LABELS.enhancingWeapons)}
                    </strong>{' '}
                    {L(LABELS.enhancingWeaponsDesc)}
                  </>,
                  <>
                    <strong className="text-content-strong font-semibold">
                      {L(LABELS.accessories)}
                    </strong>{' '}
                    {L(LABELS.accessoriesCritDesc)}
                  </>,
                  <>
                    <strong className="text-content-strong font-semibold">{L(LABELS.armor)}</strong>{' '}
                    {L(LABELS.armorLaterChapters)}
                  </>,
                  <>
                    <strong className="text-content-strong font-semibold">
                      {L(LABELS.reforgeBreakthrough)}
                    </strong>{' '}
                    {L(LABELS.reforgeNotImportant)}
                  </>,
                ]}
              />
              <DotList
                accent="amber"
                items={[
                  L(LABELS.substatsAtSixStar),
                  L(LABELS.breakthroughDesc),
                  L(LABELS.gemsForSpecialGear),
                ]}
              />
            </QACard>
          </div>
        </section>

        {/* ═══ Progression & Resources ═══ */}
        <section id="progression-resources" className="scroll-mt-28">
          <SectionHeading accent="emerald" title={L(LABELS.sectionProgressionResources)} />
          <div className="flex flex-col gap-3.5">
            <QACard accent="emerald" question={L(LABELS.skillManualsFirst)}>
              <Callout accent="amber" label={L(LABELS.skillUpRule)}>
                <div className="mt-0.5">
                  <NumberedList
                    accent="amber"
                    items={[
                      L(LABELS.skillLevel2Weakness),
                      L(LABELS.effectChanceDuration),
                      L(LABELS.damageIncreasesDps),
                    ]}
                  />
                </div>
              </Callout>
              <Prose>{L(LABELS.chainPassive)}</Prose>
            </QACard>

            <QACard accent="emerald" question={L(LABELS.baseUpgrades)}>
              <Prose>{L(LABELS.baseUpgradeOrder)}</Prose>
              <StepRows
                items={[
                  {
                    accent: 'rose',
                    label: (
                      <>
                        {L(LABELS.antiparticleGenerator)}{' '}
                        <span className="text-content-subtle font-normal">
                          · {L(LABELS.maxThisFirst)}
                        </span>
                      </>
                    ),
                  },
                  { accent: 'amber', label: L(LABELS.synchroRoom) },
                  { accent: 'emerald', label: L(LABELS.katesWorkshop) },
                  { accent: 'sky', label: L(LABELS.supplyModule) },
                ]}
              />
              <Prose>{L(LABELS.unlockQuirks)}</Prose>
            </QACard>

            <QACard accent="emerald" question={L(LABELS.quirksPriority)}>
              <Prose>{L(LABELS.quirksUpgradeOrder)}</Prose>
              <Prose>{L(LABELS.dpsSubclassFirst)}</Prose>
              <Prose>{L(LABELS.quirkLevel5)}</Prose>
              <Prose>{L(LABELS.utilityQoL)}</Prose>
            </QACard>

            <QACard accent="emerald" question={L(LABELS.guildImportance)}>
              <Prose>{L(LABELS.guildDesc)}</Prose>
            </QACard>
          </div>
        </section>

        {/* ═══ Advanced Tips ═══ */}
        <section id="advanced-tips" className="scroll-mt-28">
          <SectionHeading accent="rose" title={L(LABELS.sectionAdvancedTips)} />
          <div className="flex flex-col gap-3.5">
            <QACard accent="rose" question={L(LABELS.heroScaleHealth)}>
              <Prose>
                {L(LABELS.keyWordsLookFor)}
                <strong className="text-content-strong font-semibold underline">
                  {L(LABELS.insteadOfAttack)}
                </strong>
                {L(LABELS.proportionalStat)}
              </Prose>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <MiniPanel
                  accent="emerald"
                  title={
                    <span className="inline-flex items-center gap-2">
                      {parseText('{P/Delta}', ctx)}
                      <span className="text-content-subtle text-xs">
                        {L(LABELS.deltaHpInstead)}
                      </span>
                    </span>
                  }
                >
                  <div className="mb-1.5">
                    {parseText('{SK/Delta|S1} {SK/Delta|S2} {SK/Delta|S3}', ctx)}
                  </div>
                  {P(LABELS.deltaScaleDesc)}
                </MiniPanel>
                <MiniPanel
                  accent="amber"
                  title={
                    <span className="inline-flex items-center gap-2">
                      {parseText('{P/Demiurge Stella}', ctx)}
                      <span className="text-content-subtle text-xs">{L(LABELS.stellaHpBonus)}</span>
                    </span>
                  }
                >
                  <div className="mb-1.5">
                    {parseText(
                      '{SK/Demiurge Stella|S1} {SK/Demiurge Stella|S2} {SK/Demiurge Stella|S3}',
                      ctx,
                    )}
                  </div>
                  {P(LABELS.stellaScaleDesc)}
                </MiniPanel>
              </div>
              <Callout accent="violet">{P(LABELS.atkZeroBossExample)}</Callout>
            </QACard>
          </div>
        </section>

        {/* ═══ Related Guides ═══ */}
        {/* TODO(portage general-guides) : rajouter gear et heroes-growth ici au
            fur et à mesure de leur portage (RelatedGuides casse le build sur
            une référence inconnue — c'est voulu). */}
        <RelatedGuides
          lang={lang}
          title={L(LABELS.sectionRelatedGuides)}
          items={[
            { category: 'general-guides', slug: 'free-heroes-start-banner', accent: 'sky' },
            { category: 'general-guides', slug: 'premium-limited', accent: 'violet' },
          ]}
        />
      </div>
    </>
  );
}
