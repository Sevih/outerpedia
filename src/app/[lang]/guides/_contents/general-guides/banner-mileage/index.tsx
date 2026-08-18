/**
 * Guide « Banners & Mileage » — les 5 types de bannière (Custom Rate Up,
 * Rate Up, Premium, Limited, Dimensional Supply) en onglets à cartes-images,
 * et le système de mileage. La Dimensional Supply est la seule à tirer de
 * l'ÉQUIPEMENT : ni doublons, ni pièces de héros, ni garantie du 25/08.
 *
 * Server Component. Ce qui était codé en dur est GÉNÉRÉ (`recruit.json`) :
 * taux par palier, prix, tickets, pulls gratuits, coût mileage, et la liste
 * des héros limited avec release/rerun (`banner.json` était maintenu à la
 * main). Ne reste éditorial que le texte (labels.ts, verbatim), le mapping
 * bannière → monnaie de mileage (aucune table ne le porte) et le SYSTÈME DE
 * GARANTIE du 25/08/2026 — le pity ne vit dans aucune colonne des tables
 * (`OpenRecruitCount` en est une autre : le déblocage de la bannière).
 */
import type { ReactNode } from 'react';
import type { LocalizedText } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { img } from '@/lib/images';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { getRecruitKind } from '@/lib/data/recruit';
import { Callout, Prose, SectionHeading } from '@/components/guides/editorial/blocks';
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
function tabVisual(kind: keyof typeof MILEAGE_OF): { imageSrc: string } {
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
  // « Elemental Mileage » est la monnaie du Selected Element Recruit (le jeu le
  // dit dans sa description, et elle se convertit en Mileage à la fin de la
  // période) — le Custom Rate Up rend du « Custom Mileage ».
  custom: 'Custom Mileage',
  pickup: 'Mileage',
  premium: "False God's Proof",
  limited: 'Limited Mileage',
  // La monnaie de la Dimensional Supply est curée sous la clé du titre de la
  // bannière (`SYS_EQUIP_GACHA_TITLE`) : le jeu ne lui donne pas de clé
  // `SYS_ASSET_*`, seule sa description dit que c'est bien une monnaie.
  equipment: 'Dimensional Supply',
} as const;

/** Licence d'origine des persos collab (liste des limited) — éditorial. */
const COLLAB_NAMES: Record<string, string> = {
  '2000095': 'DanMachi', // Bell Cranel
  '2000096': 'DanMachi', // Ais Wallenstein
  '2000097': 'DanMachi', // Ryu Lion
};

/**
 * Règles COMMUNES du système de garantie (25/08/2026), dans l'ordre de lecture.
 * Le détail par bannière vit dans `LABELS.<onglet>.pity` — seul ce qui vaut
 * pour toutes les bannières est ici.
 */
const GUARANTEE_RULES = [
  'guarantee_rule_scope',
  'guarantee_rule_early',
  'guarantee_rule_reset',
  'guarantee_rule_screen',
  'guarantee_rule_startdash',
] as const;

/**
 * Règles du CYCLE MENSUEL de la Dimensional Supply, dans l'ordre de lecture —
 * la sélection, sa fenêtre, le partage des 2 % et la fermeture de la bannière.
 */
const SUPPLY_MONTHLY = [
  'monthly_reset',
  'monthly_once',
  'monthly_rate',
  'monthly_close',
  'monthly_mileage',
] as const;

/** Séparateur de l'exemple Custom (ternaire en/zh, repris verbatim). */
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
    if (info.eventTicketId) {
      rows.push({
        items: [itemChipById(info.eventTicketId, lang)],
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

  /** Encart mileage d'un type (coût généré ; défaut historique = 200 si absent). */
  const mileageInfo = (kind: keyof typeof MILEAGE_OF, note?: string): ReactNode => {
    const info = getRecruitKind(kind);
    return (
      <MileageInfo
        mileage={itemChipByName(MILEAGE_OF[kind], lang)}
        cost={info.mileageCost ?? 200}
        lang={lang}
        {...(kind === 'equipment' ? { target: 'gear' as const } : {})}
        {...(note ? { note } : {})}
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
          <BannerRates
            info={getRecruitKind('custom')}
            lang={lang}
            guarantee={L(LABELS.pickup.pity)}
          />
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
          <BannerRates
            info={getRecruitKind('pickup')}
            lang={lang}
            guarantee={L(LABELS.rateup.pity)}
          />
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
            guarantee={L(LABELS.premium.pity)}
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
          <BannerRates
            info={getRecruitKind('limited')}
            lang={lang}
            guarantee={L(LABELS.limited.pity)}
          />
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

    /* ═══ Dimensional Supply (équipement) ═══ */
    {
      id: 'supply',
      label: L(LABELS.supply.label),
      ...tabVisual('equipment'),
      content: (
        <div className="space-y-6">
          <SectionHeading accent="cyan" title={L(LABELS.supply.heading)} />
          <BannerRates info={getRecruitKind('equipment')} lang={lang} />
          <div className="space-y-3">
            <div className={neutralBox}>
              <p className="text-content m-0 text-sm">
                <span className="font-semibold">{L(LABELS.supply.desc_bold)}</span>
                {L(LABELS.supply.desc)}
              </p>
              <p className="text-content-subtle m-0 mt-2 text-xs">{L(LABELS.supply.unlock)}</p>
            </div>
            <div className="rounded-lg border border-cyan-400/25 bg-cyan-400/5 p-3">
              <p className="m-0 text-sm text-cyan-200">
                <span className="font-semibold">{L(LABELS.supply.settings_label)}</span>{' '}
                {L(LABELS.supply.settings)}
              </p>
              <p className="m-0 mt-2 text-sm text-cyan-200">
                {L(LABELS.supply.select_before)}
                <strong className="text-ed-amber">{L(LABELS.supply.select_bold)}</strong>
                {L(LABELS.supply.select_after)}
              </p>
            </div>
          </div>
          <Callout accent="amber" label={L(LABELS.supply.monthly_label)}>
            <ul className="m-0 list-disc space-y-1 pl-4">
              {SUPPLY_MONTHLY.map((key) => (
                <li key={key}>{L(LABELS.supply[key])}</li>
              ))}
            </ul>
          </Callout>
          {/* Pas de BannerRewards : on ne tire pas de doublon de héros ici. */}
          <BannerResources rows={resourceRows('equipment')} lang={lang} />
          {mileageInfo('equipment', L(LABELS.supply.chips_note))}
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
      <Prose>
        {L(LABELS.intro_p5_before)}
        <span className="text-ed-violet underline">{L(LABELS.intro_p5_highlight)}</span>
        {L(LABELS.intro_p5_mid)}
        <strong className="text-content-strong">{L(LABELS.intro_p5_bold)}</strong>
        {L(LABELS.intro_p5_after)}
      </Prose>
      <Callout accent="violet" label={L(LABELS.guarantee_rules_label)}>
        <ul className="m-0 list-disc space-y-1 pl-4">
          {GUARANTEE_RULES.map((key) => (
            <li key={key}>{L(LABELS[key])}</li>
          ))}
        </ul>
      </Callout>
      <BannerTabs tabs={tabs} urlKey="banner" />
    </div>
  );
}
