/**
 * Guide « Banners & Mileage » — les 4 types de bannière (Custom Rate Up,
 * Rate Up, Premium, Limited) en onglets à cartes-images, et le système de
 * mileage.
 *
 * Server Component. Ce que la V2 codait en dur est GÉNÉRÉ (`recruit.json`) :
 * taux par palier, prix, tickets, pulls gratuits, coût mileage, et la liste
 * des héros limited avec release/rerun (la V2 maintenait `banner.json` à la
 * main). Ne reste éditorial que le texte (labels.ts, verbatim V2) et le
 * mapping bannière → monnaie de mileage (aucune table ne le porte).
 */
import type { ReactNode } from 'react';
import type { LocalizedText } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { img } from '@/lib/images';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { getRecruitKind } from '@/lib/data/recruit';
import { Prose, SectionHeading } from '@/components/guides/editorial/blocks';
import {
  BannerRates,
  BannerResources,
  BannerRewards,
  MileageInfo,
  type DupeReward,
  type ResourceRow,
} from '@/components/guides/editorial/banner/BannerBlocks';
import { BannerTabs, type BannerTabDef } from '@/components/guides/editorial/banner/BannerTabs';
import { LimitedHeroesList } from '@/components/guides/editorial/banner/LimitedHeroesList';
import { StarText } from '@/components/guides/editorial/banner/StarText';
import { itemChipById, itemChipByName } from '@/components/guides/editorial/banner/items';
import { LABELS } from './labels';

/** Visuel d'une carte d'onglet — GÉNÉRÉ (BannerImageName du groupe courant). */
function tabVisual(kind: 'custom' | 'pickup' | 'premium' | 'limited'): { imageSrc: string } {
  const info = getRecruitKind(kind);
  if (!info.bannerImage) {
    throw new Error(`banner-mileage : pas de BannerImageName pour « ${kind} »`);
  }
  return { imageSrc: img.recruitSprite(info.bannerImage) };
}

/** Doublons → wildcard/pièces (constantes du jeu, stables — éditorial). */
const STANDARD_REWARDS: DupeReward[] = [
  { stars: 1, wildcard: 0, heroPiece: 5 },
  { stars: 2, wildcard: 1, heroPiece: 10 },
  { stars: 3, wildcard: 15, heroPiece: 150 },
];

/**
 * Monnaie de MILEAGE par type de bannière — éditorial : le lien bannière →
 * monnaie ne vit dans aucune table (le client du jeu le code en dur, nous
 * aussi). Les NOMS résolvent contre le catalogue (build cassé sinon).
 */
const MILEAGE_OF = {
  custom: 'Elemental Mileage',
  pickup: 'Mileage',
  premium: "False God's Proof",
  limited: 'Limited Mileage',
} as const;

/** Tickets d'EVENT (variante sans mileage) par type — éditorial, comme en V2. */
const EVENT_TICKET_OF: Partial<Record<keyof typeof MILEAGE_OF, string>> = {
  custom: 'Special Recruitment Ticket (Event)',
  pickup: 'Special Recruitment Ticket (Event)',
  premium: 'Call of the Demiurge (Event)',
  limited: 'Limited Recruitment Ticket (Event)',
};

/** Licence d'origine des persos collab (liste des limited) — éditorial. */
const COLLAB_NAMES: Record<string, string> = {
  '2000095': 'DanMachi', // Bell Cranel
  '2000096': 'DanMachi', // Ais Wallenstein
  '2000097': 'DanMachi', // Ryu Lion
};

/** Séparateur de l'exemple Custom (V2 : ternaire en/zh, verbatim). */
const AND: LocalizedText = { en: 'and ', zh: '和' };

export default async function BannerMileageGuide({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t, strict: true };
  const L = (m: LocalizedText): string => lRec(m, lang);

  /** Ressources d'un type : event ticket (éditorial) + ticket (généré) + éther. */
  const resourceRows = (kind: keyof typeof MILEAGE_OF, note?: string): ResourceRow[] => {
    const info = getRecruitKind(kind);
    const mileage = itemChipByName(MILEAGE_OF[kind], lang);
    const rows: ResourceRow[] = [];
    const eventTicket = EVENT_TICKET_OF[kind];
    if (eventTicket) {
      rows.push({
        items: [itemChipByName(eventTicket, lang)],
        cost: info.ticketCost,
        mileage: null,
        ...(note ? { note } : {}),
      });
    }
    if (info.ticketId) {
      rows.push({ items: [itemChipById(info.ticketId, lang)], cost: info.ticketCost, mileage });
    }
    rows.push({
      items: [itemChipByName('Free Ether', lang), itemChipByName('Ether', lang)],
      cost: info.price1,
      mileage,
    });
    return rows;
  };

  /** Encart mileage d'un type (coût généré ; défaut V2 = 200 si absent). */
  const mileageInfo = (kind: keyof typeof MILEAGE_OF): ReactNode => {
    const info = getRecruitKind(kind);
    return (
      <MileageInfo
        mileage={itemChipByName(MILEAGE_OF[kind], lang)}
        cost={info.mileageCost ?? 200}
        lang={lang}
      />
    );
  };

  const neutralBox = 'border-line-subtle bg-surface-raised/40 rounded-lg border p-3';

  const tabs: BannerTabDef[] = [
    /* ═══ Custom Rate Up ═══ */
    {
      id: 'pickup',
      label: L(LABELS.pickup.label),
      ...tabVisual('custom'),
      content: (
        <div className="space-y-6">
          <SectionHeading accent="sky" title={L(LABELS.pickup.heading)} />
          <BannerRates info={getRecruitKind('custom')} lang={lang} />
          <div className="space-y-3">
            <Prose>{L(LABELS.pickup.desc)}</Prose>
            <div className={neutralBox}>
              <p className="text-content m-0 text-sm">
                <span className="font-semibold text-amber-400">
                  {L(LABELS.pickup.example_label)}
                </span>
                {L(LABELS.pickup.example_before)}
                {/* parseText rend un TABLEAU (clés internes 0..n) : chaque
                    appel frère doit vivre dans son propre parent. */}
                <span>{parseText('{P/Alice}', ctx)}</span>,{' '}
                <span>{parseText('{P/Eliza}', ctx)}</span> {L(AND)}
                <span>{parseText('{P/Francesca}', ctx)}</span>
                <StarText text={L(LABELS.pickup.example_after)} />
              </p>
            </div>
          </div>
          <BannerRewards rewards={STANDARD_REWARDS} lang={lang} />
          <BannerResources
            rows={resourceRows('custom')}
            lang={lang}
            warning={L(LABELS.pickup.warning)}
          />
          {mileageInfo('custom')}
        </div>
      ),
    },

    /* ═══ Rate Up ═══ */
    {
      id: 'new',
      label: L(LABELS.rateup.label),
      ...tabVisual('pickup'),
      content: (
        <div className="space-y-6">
          <SectionHeading accent="violet" title={L(LABELS.rateup.heading)} />
          <BannerRates info={getRecruitKind('pickup')} lang={lang} />
          <div className={neutralBox}>
            <p className="text-content m-0 text-sm">
              {L(LABELS.rateup.desc)}
              <span className="font-semibold text-amber-400">{L(LABELS.rateup.desc_duration)}</span>
              {L(LABELS.rateup.desc_after)}
            </p>
          </div>
          <BannerRewards rewards={STANDARD_REWARDS} lang={lang} />
          <BannerResources
            rows={resourceRows('pickup')}
            lang={lang}
            warning={L(LABELS.rateup.warning)}
          />
          {mileageInfo('pickup')}
        </div>
      ),
    },

    /* ═══ Premium ═══ */
    {
      id: 'premium',
      label: L(LABELS.premium.label),
      ...tabVisual('premium'),
      content: (
        <div className="space-y-6">
          <SectionHeading accent="amber" title={L(LABELS.premium.heading)} />
          <BannerRates
            info={getRecruitKind('premium')}
            lang={lang}
            subtext={L(LABELS.premium.subtext)}
          />
          <div className="rounded-lg border border-violet-400/25 bg-violet-400/5 p-3">
            <p className="m-0 text-sm text-violet-200">
              <span className="font-semibold">{L(LABELS.premium.desc_bold)}</span>
              {L(LABELS.premium.desc)}
            </p>
            <p className="m-0 mt-2 text-xs text-violet-300">
              <StarText text={L(LABELS.premium.note)} />
            </p>
          </div>
          <BannerRewards rewards={STANDARD_REWARDS} lang={lang} />
          <BannerResources rows={resourceRows('premium')} lang={lang} />
          {mileageInfo('premium')}
        </div>
      ),
    },

    /* ═══ Limited ═══ */
    {
      id: 'fes',
      label: L(LABELS.limited.label),
      ...tabVisual('limited'),
      content: (
        <div className="space-y-6">
          <SectionHeading accent="rose" title={L(LABELS.limited.heading)} />
          <BannerRates info={getRecruitKind('limited')} lang={lang} />
          <div className="space-y-3">
            <div className="rounded-lg border border-rose-400/25 bg-rose-400/5 p-3">
              <p className="m-0 mb-3 text-sm text-rose-200">
                <span className="font-semibold">{L(LABELS.limited.desc_bold)}</span>
                {L(LABELS.limited.desc)}
              </p>
              <div className="space-y-2 text-xs">
                {(
                  [
                    ['type_limited_label', 'type_limited_desc', 'text-pink-400'],
                    ['type_seasonal_label', 'type_seasonal_desc', 'text-emerald-400'],
                    ['type_collab_label', 'type_collab_desc', 'text-red-400'],
                  ] as const
                ).map(([labelKey, descKey, color]) => (
                  <div key={labelKey} className="flex items-start gap-2">
                    <span className={`min-w-17.5 font-semibold ${color}`}>
                      {L(LABELS.limited[labelKey])}
                    </span>
                    <span className="text-rose-200">{L(LABELS.limited[descKey])}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={neutralBox}>
              <p className="text-content m-0 text-xs">
                {L(LABELS.limited.duration_before)}
                <span className="font-semibold text-amber-400">
                  {L(LABELS.limited.duration_value)}
                </span>
                {L(LABELS.limited.duration_after)}
              </p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-amber-400">
              {L(LABELS.limited.heroes_list_title)}
            </p>
            <LimitedHeroesList lang={lang} collabNames={COLLAB_NAMES} />
          </div>
          <BannerRewards rewards={STANDARD_REWARDS} lang={lang} />
          <BannerResources
            rows={resourceRows('limited', L(LABELS.limited.ticket_note))}
            lang={lang}
          />
          {mileageInfo('limited')}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Prose>{L(LABELS.intro)}</Prose>
      <Prose>{L(LABELS.intro_p1)}</Prose>
      <Prose>
        {L(LABELS.intro_p2_before)}
        <span className="text-amber-400 underline">{L(LABELS.intro_p2_highlight)}</span>
        {L(LABELS.intro_p2_mid)}
        <strong className="text-content-strong">{L(LABELS.intro_p2_bold)}</strong>
        {L(LABELS.intro_p2_after)}
      </Prose>
      <Prose>
        {L(LABELS.intro_p3_before)}
        <strong className="text-content-strong">{L(LABELS.intro_p3_bold)}</strong>
        {L(LABELS.intro_p3_after)}
      </Prose>
      <Prose>
        {L(LABELS.intro_p4_before)}
        <strong className="text-content-strong">{L(LABELS.intro_p4_bold1)}</strong>
        {L(LABELS.intro_p4_mid)}
        <br />
        {L(LABELS.intro_p4_why)}
        <br />
        {L(LABELS.intro_p4_scenario)}
        <strong className="text-content-strong">{L(LABELS.intro_p4_bold2)}</strong>
        {L(LABELS.intro_p4_end)}
      </Prose>
      <BannerTabs tabs={tabs} urlParam="banner" />
    </div>
  );
}
