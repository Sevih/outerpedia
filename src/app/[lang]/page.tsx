import type { Metadata } from 'next';
import { normalizeLang } from '@/lib/i18n/config';
import { getT, type TranslationKey } from '@/i18n';
import { createPageMetadata } from '@/lib/seo';
import { localePath } from '@/lib/navigation';
import { getActiveCoupons, getBuffSchedule } from '@/lib/home';
import { HomeHero } from '@/components/home/HomeHero';
import { DiscordBanner } from '@/components/home/DiscordBanner';
import { CurrentBanners } from '@/components/home/CurrentBanners';
import { ServerResets } from '@/components/home/ServerResets';
import { BuffEventTimer } from '@/components/home/BuffEventTimer';
import { PromoCodes } from '@/components/home/PromoCodes';
import { BeginnerGuides } from '@/components/home/BeginnerGuides';

export const revalidate = 86400;

/** Types de buff connus → libellés `buff.type.*` (le reste retombe sur `raw`). */
const BUFF_TYPES = [
  'frog-gold',
  'frog-food',
  'ark-raid',
  'special-ecology',
  'special-identification',
  'doppelganger',
  'kate-workshop',
  'story-survey',
  'evolution-stone',
  'bounty-hunter',
  'bandit-chase',
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const t = await getT(lang);
  const meta = createPageMetadata({
    lang,
    path: '/',
    title: t('page.home.title'),
    description: t('page.home.description'),
  });
  return { ...meta, title: { absolute: t('page.home.title') } };
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const t = await getT(lang);

  const { codes, activeCount } = getActiveCoupons(lang, 6);
  const buffSchedule = getBuffSchedule();
  const buffLabels = Object.fromEntries(
    BUFF_TYPES.map((ty) => [ty, t(`buff.type.${ty}` as TranslationKey)]),
  );

  return (
    <main>
      <HomeHero
        strings={{
          title: t('page.home.title'),
          description: t('page.home.description'),
          searchPlaceholder: t('search.placeholder'),
        }}
      />

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 md:space-y-16 md:px-6">
        <DiscordBanner
          strings={{
            title: t('home.discord.title'),
            description: t('home.discord.description'),
            join: t('home.discord.join'),
            members: t('home.discord.members'),
            online: t('home.discord.online'),
          }}
        />

        {/* 2 colonnes : gauche = bannières + (resets · buff) ; droite = codes promo. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-10 md:gap-12">
            <CurrentBanners
              lang={lang}
              title={t('home.section.banners')}
              endsInLabel={t('home.banner.ends_in')}
              starAria={t('aria.star_rarity')}
            />
            <section>
              <h2 className="text-content-strong mb-6 text-2xl font-bold">
                {t('home.resets.title')} · {t('home.buff.title')}
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-stretch">
                <ServerResets
                  title={t('home.resets.title')}
                  labels={{
                    daily: t('home.resets.daily'),
                    weekly: t('home.resets.weekly'),
                    monthly: t('home.resets.monthly'),
                  }}
                />
                <BuffEventTimer
                  schedule={buffSchedule}
                  lang={lang}
                  typeLabels={buffLabels}
                  strings={{
                    title: t('home.buff.title'),
                    today: t('home.buff.today'),
                    tomorrow: t('home.buff.tomorrow'),
                    changesIn: t('home.buff.changes_in'),
                    none: t('home.buff.none'),
                    nextOn: t('home.buff.next_on'),
                    showAll: t('home.buff.show_all'),
                    showLess: t('home.buff.show_less'),
                  }}
                />
              </div>
            </section>
          </div>

          <PromoCodes
            codes={codes}
            activeCount={activeCount}
            viewAllHref={localePath(lang, '/coupons')}
            strings={{
              title: t('home.section.codes'),
              copy: t('home.codes.copy'),
              copied: t('common.copied'),
              empty: t('home.codes.empty'),
              viewAll: t('home.codes.view_all'),
            }}
          />
        </div>

        <BeginnerGuides lang={lang} title={t('home.section.beginner')} t={t} />
      </div>
    </main>
  );
}
