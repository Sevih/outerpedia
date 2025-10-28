'use client'

import Link from 'next/link'
import GuideHeading from '@/app/components/GuideHeading'
import { useI18n } from '@/lib/contexts/I18nContext'

export default function HowToPlayClient() {
  const { t } = useI18n()

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900/60 via-zinc-900 to-zinc-900/60 p-6 md:p-8 mb-8">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t('howToPlay.hero.title')} <span className="text-blue-400">OUTERPLANE</span>
          </h1>
          <h2 className="h2_custom petit_titre font-bold tracking-tight">{t('howToPlay.hero.subtitle')}</h2>
        </div>
      </section>

      {/* Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <GuideHeading level={3}>{t('howToPlay.about.title')}</GuideHeading>
            
            <div className="prose prose-invert max-w-none">
              <p>
                {t('howToPlay.about.desc')}
              </p>
            </div>
          </section>

          {/* Download for Mobile */}
          <section id="mobile-download">
            <h2 className="text-xl font-semibold mb-3">{t('howToPlay.mobile.title')}</h2>
            <div className="space-y-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-600/20 text-green-400">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.523 15.34l-.758-.758-4.243 4.243-9.9-9.9L1.208 10.34l11.314 11.315L17.523 15.34zM3.172 10.34L1.758 8.926 12.522 0l10.764 8.926-1.414 1.414-9.35-7.752-9.35 7.752z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{t('howToPlay.mobile.android.title')}</h3>
                    <p className="text-sm text-zinc-300 mb-3">
                      {t('howToPlay.mobile.android.desc')}
                    </p>
                    <Link
                      href={t('link.playstore')}
                      target="_blank"
                      className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 transition"
                    >
                      {t('howToPlay.mobile.android.btn')}
                    </Link>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-600/20 text-gray-400">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{t('howToPlay.mobile.ios.title')}</h3>
                    <p className="text-sm text-zinc-300 mb-3">
                      {t('howToPlay.mobile.ios.desc')}
                    </p>
                    <Link
                      href={t('link.appstore')}
                      target="_blank"
                      className="inline-flex items-center justify-center rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-500 transition"
                    >
                      {t('howToPlay.mobile.ios.btn')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PC Platform */}
          <section id="pc-play">
            <h2 className="text-xl font-semibold mb-3">{t('howToPlay.pc.title')}</h2>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{t('howToPlay.pc.gpg.title')}</h3>
                  <p className="text-sm text-zinc-300 mb-3" dangerouslySetInnerHTML={{ __html: t('howToPlay.pc.gpg.desc') }} />
                  <Link
                    href={t('link.googleplaygames')}
                    target="_blank"
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition"
                  >
                    {t('howToPlay.pc.gpg.btn')}
                  </Link>
                  <p className="text-xs text-zinc-400 mt-2">
                    {t('howToPlay.pc.gpg.note')}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 mt-4">
              <p className="text-sm text-amber-100" dangerouslySetInnerHTML={{ __html: t('howToPlay.pc.warning') }} />
            </div>
          </section>

          {/* Getting Started */}
          <section id="getting-started">
            <h2 className="text-xl font-semibold mb-3">{t('howToPlay.start.title')}</h2>
            <div className="prose prose-invert max-w-none">
              <ol className="list-decimal pl-5 space-y-2">
                <li>{t('howToPlay.start.step1')}</li>
                <li>{t('howToPlay.start.step2')}</li>
                <li>{t('howToPlay.start.step3')}</li>
                <li>{t('howToPlay.start.step4')}</li>
              </ol>
            </div>
          </section>

          {/* System Requirements */}
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('howToPlay.sysreq.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                <h3 className="font-semibold mb-2">{t('howToPlay.sysreq.android.title')}</h3>
                <ul className="text-sm text-zinc-300 space-y-1">
                  <li>{t('howToPlay.sysreq.android.os')}</li>
                </ul>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                <h3 className="font-semibold mb-2">{t('howToPlay.sysreq.ios.title')}</h3>
                <ul className="text-sm text-zinc-300 space-y-1">
                  <li>{t('howToPlay.sysreq.ios.os')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('howToPlay.support.title')}</h2>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
              <p className="text-sm text-zinc-300 mb-3">
                {t('howToPlay.support.desc')}
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  {t('howToPlay.support.help')} <Link href={t('link.helpshift')} target="_blank" className="underline text-blue-400">{t('link.helpshift')}</Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 space-y-4 h-max">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
            <h3 className="font-semibold mb-2">{t('howToPlay.sidebar.quicklinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#mobile-download" className="text-blue-400 hover:underline">{t('howToPlay.sidebar.mobile')}</a></li>
              <li><a href="#pc-play" className="text-blue-400 hover:underline">{t('howToPlay.sidebar.pc')}</a></li>
              <li><a href="#getting-started" className="text-blue-400 hover:underline">{t('howToPlay.sidebar.start')}</a></li>
            </ul>
          </div>

          <div className="rounded-lg border border-blue-600/40 bg-blue-600/10 p-4">
            <h3 className="font-semibold mb-2">{t('howToPlay.sidebar.official')}</h3>
            <Link
              href={t('link.officialwebiste')}
              target="_blank"
              className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition"
            >
              {t('howToPlay.sidebar.officialBtn')}
            </Link>
          </div>

          <div className="rounded-lg border border-purple-600/40 bg-purple-600/10 p-4">
            <h3 className="font-semibold mb-2">{t('howToPlay.sidebar.community')}</h3>
            <div className="space-y-2">
              <Link
                href={t('link.discord')}
                target="_blank"
                className="inline-flex w-full items-center justify-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-500 transition"
              >
                {t('howToPlay.sidebar.discord')}
              </Link>
              <Link
                href={t('link.reddit')}
                target="_blank"
                className="inline-flex w-full items-center justify-center rounded-md bg-zinc-700 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-600 transition"
              >
                {t('howToPlay.sidebar.reddit')}
              </Link>
              <Link
                href={t('link.twitter')}
                target="_blank"
                className="inline-flex w-full items-center justify-center rounded-md bg-zinc-700 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-600 transition"
              >
                {t('howToPlay.sidebar.twitter')}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
