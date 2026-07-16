/**
 * Guide « How to Play » — page de téléchargement / démarrage (portage V2).
 *
 * Server Component : contenu 100 % statique (liens officiels + textes de
 * strings.ts), aucune donnée de jeu. Le layout V2 est conservé (héro, deux
 * colonnes, sidebar liens rapides / officiel / communauté) sur les tokens V3.
 */
import { lRec } from '@/lib/i18n/localize';
import type { GuideContentProps } from '@/lib/data/guides';
import { LINKS, LOCALIZED_LINKS, S } from './strings';

/** Carte de plateforme (Android / iOS / Google Play Games). */
function PlatformCard({
  badge,
  title,
  desc,
  btnLabel,
  btnHref,
  btnClass,
  note,
}: {
  badge: React.ReactNode;
  title: string;
  desc: string;
  btnLabel: string;
  btnHref: string;
  btnClass: string;
  note?: string;
}) {
  return (
    <div className="border-line-subtle bg-surface-raised rounded-lg border p-4">
      <div className="flex items-start gap-4">
        {badge}
        <div className="flex-1">
          <h4 className="mb-2 text-lg font-semibold">{title}</h4>
          <p className="text-content-muted mb-3 text-sm">{desc}</p>
          <a
            href={btnHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-content-strong inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition ${btnClass}`}
          >
            {btnLabel}
          </a>
          {note && <p className="text-content-subtle mt-2 text-xs">{note}</p>}
        </div>
      </div>
    </div>
  );
}

/** Pastille d'icône colorée à gauche d'une carte de plateforme. */
function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tone}`}
      aria-hidden
    >
      {children}
    </div>
  );
}

export default function HowToPlayGuide({ lang }: GuideContentProps) {
  const s = (key: keyof typeof S) => lRec(S[key], lang);
  return (
    <>
      {/* Héro */}
      <section className="border-line-subtle from-surface-raised/60 via-surface-raised to-surface-raised/60 relative mb-8 overflow-hidden rounded-xl border bg-linear-to-br p-6 md:p-8">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="relative">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {s('heroTitle')} <span className="text-sky-400">OUTERPLANE</span>
          </h2>
          <p className="text-content-muted mt-2 text-sm">{s('heroSubtitle')}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="mb-3 text-xl font-semibold">{s('aboutTitle')}</h2>
            <p className="text-content leading-relaxed">{s('aboutDesc')}</p>
          </section>

          <section id="mobile-download">
            <h2 className="mb-3 text-xl font-semibold">{s('mobileTitle')}</h2>
            <div className="space-y-4">
              <PlatformCard
                badge={
                  <Badge tone="bg-green-600/20 text-green-400">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.523 15.34l-.758-.758-4.243 4.243-9.9-9.9L1.208 10.34l11.314 11.315L17.523 15.34zM3.172 10.34L1.758 8.926 12.522 0l10.764 8.926-1.414 1.414-9.35-7.752-9.35 7.752z" />
                    </svg>
                  </Badge>
                }
                title={s('androidTitle')}
                desc={s('androidDesc')}
                btnLabel={s('androidBtn')}
                btnHref={LINKS.playstore}
                btnClass="bg-green-600 hover:bg-green-500"
              />
              <PlatformCard
                badge={
                  <Badge tone="bg-surface-overlay text-content-muted">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                  </Badge>
                }
                title={s('iosTitle')}
                desc={s('iosDesc')}
                btnLabel={s('iosBtn')}
                btnHref={LINKS.appstore}
                btnClass="bg-surface-overlay hover:bg-surface-sunken"
              />
            </div>
          </section>

          <section id="pc-play">
            <h2 className="mb-3 text-xl font-semibold">{s('pcTitle')}</h2>
            <PlatformCard
              badge={
                <Badge tone="bg-blue-600/20 text-blue-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </Badge>
              }
              title={s('gpgTitle')}
              desc={s('gpgDesc')}
              btnLabel={s('gpgBtn')}
              btnHref={LINKS.googleplaygames}
              btnClass="bg-blue-600 hover:bg-blue-500"
              note={s('gpgNote')}
            />
            <div className="border-warn/30 bg-warn/10 mt-4 rounded-lg border p-4 text-sm">
              <strong>{s('pcWarningLabel')}</strong> {s('pcWarning')}
            </div>
          </section>

          <section id="getting-started">
            <h2 className="mb-3 text-xl font-semibold">{s('startTitle')}</h2>
            <ol className="text-content list-decimal space-y-2 pl-5">
              <li>{s('startStep1')}</li>
              <li>{s('startStep2')}</li>
              <li>{s('startStep3')}</li>
              <li>{s('startStep4')}</li>
            </ol>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">{s('sysreqTitle')}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="border-line-subtle bg-surface-raised rounded-lg border p-4">
                <h4 className="mb-2 font-semibold">Android</h4>
                <p className="text-content-muted text-sm">{s('sysreqAndroid')}</p>
              </div>
              <div className="border-line-subtle bg-surface-raised rounded-lg border p-4">
                <h4 className="mb-2 font-semibold">iOS</h4>
                <p className="text-content-muted text-sm">{s('sysreqIos')}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">{s('supportTitle')}</h2>
            <div className="border-line-subtle bg-surface-raised rounded-lg border p-4 text-sm">
              <p className="text-content-muted mb-3">{s('supportDesc')}</p>
              <a
                href={lRec(LOCALIZED_LINKS.helpshift, lang)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 underline"
              >
                {s('supportHelp')}
              </a>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="h-max space-y-4 lg:sticky lg:top-24">
          <div className="border-line-subtle bg-surface-raised rounded-lg border p-4">
            <h4 className="mb-2 font-semibold">{s('sidebarQuicklinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#mobile-download" className="text-sky-400 hover:underline">
                  {s('sidebarMobile')}
                </a>
              </li>
              <li>
                <a href="#pc-play" className="text-sky-400 hover:underline">
                  {s('sidebarPc')}
                </a>
              </li>
              <li>
                <a href="#getting-started" className="text-sky-400 hover:underline">
                  {s('sidebarStart')}
                </a>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-blue-600/40 bg-blue-600/10 p-4">
            <h4 className="mb-2 font-semibold">{s('sidebarOfficial')}</h4>
            <a
              href={lRec(LOCALIZED_LINKS.officialwebsite, lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-content-strong inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold transition hover:bg-blue-500"
            >
              {s('sidebarOfficialBtn')}
            </a>
          </div>

          <div className="rounded-lg border border-purple-600/40 bg-purple-600/10 p-4">
            <h4 className="mb-2 font-semibold">{s('sidebarCommunity')}</h4>
            <div className="space-y-2">
              <a
                href={LINKS.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="text-content-strong inline-flex w-full items-center justify-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold transition hover:bg-purple-500"
              >
                Discord
              </a>
              <a
                href={LINKS.reddit}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-surface-overlay text-content-strong hover:bg-surface-sunken inline-flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-semibold transition"
              >
                Reddit
              </a>
              <a
                href={LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-surface-overlay text-content-strong hover:bg-surface-sunken inline-flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-semibold transition"
              >
                X (Twitter)
              </a>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
