/**
 * Guide « Service Transfer to VAGAMES » — ARCHIVE du transfert STOVE → VAGAMES
 * (octobre 2025). Le transfert est terminé ; la page reste publiée pour la
 * section « Recovery Help » (récupération de compte, toujours d'actualité) et
 * comme référence historique.
 *
 * Server Component. Les screenshots V2 des étapes n'existent plus (pages
 * sources VAGAMES/Smilegate détruites — cf. strings.ts) : les étapes sont
 * en texte seul. Le HTML inline V2 est remplacé par ./rich.tsx.
 */
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import type { GuideContentProps } from '@/lib/data/guides';
import { Accordion, type AccordionItem } from '@/components/ui/Accordion';
import { rich } from './rich';
import { FAQ_ITEMS, OFFICIAL_LINKS, RECOVERY_LINKS, REWARDS, S, type FaqBlock } from './strings';

function FaqBlockView({ block, lang }: { block: FaqBlock; lang: Lang }) {
  if (block.kind === 'p') {
    return <p className="mt-2 first:mt-0">{rich(lRec(block.text, lang))}</p>;
  }
  const List = block.kind === 'ol' ? 'ol' : 'ul';
  return (
    <List className={`mt-2 space-y-1 pl-5 ${block.kind === 'ol' ? 'list-decimal' : 'list-disc'}`}>
      {block.items.map((item, i) => (
        <li key={i} className="whitespace-pre-line">
          {rich(lRec(item, lang))}
        </li>
      ))}
    </List>
  );
}

export default function ServiceTransferGuide({ lang }: GuideContentProps) {
  const s = (key: keyof typeof S) => lRec(S[key], lang);

  const steps = [
    s('howtoStep1'),
    s('howtoStep2'),
    s('howtoStep3'),
    s('howtoStep4'),
    s('howtoStep5'),
  ];

  const faqItems: AccordionItem[] = FAQ_ITEMS.map((item) => ({
    id: item.key,
    title: <>{lRec(item.title, lang)}</>,
    content: (
      <div className="text-sm">
        {item.blocks.map((block, i) => (
          <FaqBlockView key={i} block={block} lang={lang} />
        ))}
      </div>
    ),
  }));

  return (
    <>
      {/* Héro */}
      <section className="border-line-subtle from-surface-raised/60 via-surface-raised to-surface-raised/60 relative mb-8 overflow-hidden rounded-xl border bg-linear-to-br p-6 md:p-8">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{s('heroTitle')}</h2>
          <p className="text-content-muted mt-2">{s('heroSubtitle')}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="border-line bg-surface-overlay inline-flex items-center gap-1 rounded-md border px-2 py-1">
              📅 <strong className="font-semibold">{s('applyLabel')}</strong>&nbsp;
              {s('applyDates')}
            </span>
            <span className="border-line bg-surface-overlay inline-flex items-center gap-1 rounded-md border px-2 py-1">
              ⏳ <strong className="font-semibold">{s('transferLabel')}</strong>&nbsp;
              {s('transferDate')}
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="mb-3 text-xl font-semibold">{s('overviewTitle')}</h2>
            <p className="text-content leading-relaxed">{rich(s('overviewText'))}</p>
            <p className="text-warn mt-2">{rich(s('overviewMissedWindow'))}</p>
          </section>

          <section id="how-to">
            <h2 className="mb-3 text-xl font-semibold">{s('howtoTitle')}</h2>
            <ol className="space-y-3">
              {steps.map((step, idx) => (
                <li key={idx}>
                  <div className="border-line-subtle bg-surface-raised flex items-start gap-3 rounded-lg border p-3">
                    <div className="text-content-strong flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-content">{step}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">{s('mergeTitle')}</h2>
            <ul className="text-content space-y-1">
              <li>{s('mergeLine1')}</li>
              <li>{s('mergeLine2')}</li>
              <li>{s('mergeLine3')}</li>
              <li>{s('mergeLine4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">{s('rewardsTitle')}</h2>
            <div className="border-warn/30 bg-warn/10 space-y-1 rounded-lg border p-4 text-sm">
              {REWARDS.map((r) => (
                <p key={r.name}>
                  <span className="font-semibold">{r.name}</span>
                  {r.desc ? <> {lRec(r.desc, lang)}</> : null}
                </p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">{s('important')}</h2>
            <ul className="text-content space-y-2">
              <li>{s('importantNote1')}</li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">✔️</span>
                <span>{s('importantNote2')}</span>
              </li>
              <li>{s('importantNote3')}</li>
              <li>{s('importantNote4')}</li>
              <li className="text-warn">{s('importantNote5')}</li>
            </ul>
          </section>

          <section id="recovery">
            <h2 className="mb-3 text-xl font-semibold">{s('recoveryTitle')}</h2>
            <div className="text-content space-y-3 text-sm">
              <div className="rounded-lg border border-blue-600/40 bg-blue-600/10 p-4">
                <p className="font-semibold">{s('recoveryStep1Title')}</p>
                <p>{rich(s('recoveryStep1Text'))}</p>
                <p className="text-content-muted mt-1">{s('recoveryStep1Note')}</p>
              </div>

              <div className="border-line-subtle bg-surface-raised rounded-lg border p-4">
                <p className="font-semibold">{s('recoveryStep2Title')}</p>
                <p>{rich(s('recoveryStep2Text'))}</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>{s('recoveryStep2Item1')}</li>
                  <li>{s('recoveryStep2Item2')}</li>
                  <li>{s('recoveryStep2Item3')}</li>
                  <li>{s('recoveryStep2Item4')}</li>
                  <li>{s('recoveryStep2Item5')}</li>
                  <li>{s('recoveryStep2Item6')}</li>
                </ol>
                <div className="mt-2">
                  {s('recoveryStep2Email')}&nbsp;
                  <a href={`mailto:${RECOVERY_LINKS.email}`} className="text-sky-400 underline">
                    {RECOVERY_LINKS.email}
                  </a>
                  <br />
                  {s('recoveryStep2HelpCenter')}&nbsp;
                  <a
                    href={RECOVERY_LINKS.helpshift}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 underline"
                  >
                    {RECOVERY_LINKS.helpshift}
                  </a>
                </div>
                <p className="text-content-muted mt-2">{rich(s('recoveryStep2Note'))}</p>
              </div>

              <p className="text-warn">{rich(s('recoveryGuestNote'))}</p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">{s('refundTitle')}</h2>
            <p className="text-content-muted text-sm">{s('refundText')}</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">{s('shopTitle')}</h2>
            <p className="text-content-muted text-sm">{s('shopText')}</p>
          </section>

          <section id="faq">
            <h2 className="mb-3 text-xl font-semibold">{s('faqTitle')}</h2>
            <Accordion items={faqItems} />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="h-max space-y-4 lg:sticky lg:top-24">
          <div className="border-line-subtle bg-surface-raised rounded-lg border p-4">
            <h4 className="mb-2 font-semibold">{s('checklistTitle')}</h4>
            <ul className="space-y-2 text-sm">
              <li>{s('checklistItem1')}</li>
              <li>{s('checklistItem2')}</li>
              <li>{s('checklistItem3')}</li>
              <li>{s('checklistItem4')}</li>
              <li>{s('checklistItem5')}</li>
            </ul>
          </div>

          <div className="rounded-lg border border-blue-600/40 bg-blue-600/10 p-4">
            <h4 className="mb-2 font-semibold">{s('officialTitle')}</h4>
            <div className="space-y-3">
              {OFFICIAL_LINKS.map(({ key, href }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-content-strong inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold transition hover:bg-blue-500"
                >
                  {s(key)}
                </a>
              ))}
            </div>
          </div>

          <div className="border-warn/40 bg-warn/10 rounded-lg border p-4">
            <h4 className="mb-2 font-semibold">{s('sidebarRecoveryTitle')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                🔎{' '}
                <a
                  href={RECOVERY_LINKS.stove}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {s('sidebarRecoveryLink1')}
                </a>
              </li>
              <li>
                ✉️{' '}
                <a href={`mailto:${RECOVERY_LINKS.email}`} className="underline">
                  {RECOVERY_LINKS.email}
                </a>
              </li>
              <li>
                🆘{' '}
                <a
                  href={RECOVERY_LINKS.helpshift}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {s('sidebarRecoveryLink3')}
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
