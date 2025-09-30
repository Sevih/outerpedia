'use client'

import Link from 'next/link'
import GuideHeading from '@/app/components/GuideHeading'
import ItemInlineDisplay from '@/app/components/ItemInline'
import Accordion, { type AccordionItem } from '@/app/components/ui/Accordion'

type Step = {
  title: string
  image?: string
  alt?: string
}

/* --- FAQ Section (updated) --- */
const faqItems: AccordionItem[] = [
  {
    key: 'faq-0',
    title: <>I didn’t issue / lost my Service Transfer Code. Can I still recover my account?</>,
    content: (
      <>
        Yes. First try checking/issuing your code on the official page:<br />
        <Link
          href="https://outerplane.game.onstove.com/transfer"
          target="_blank"
          className="underline"
        >
          STOVE Transfer Code Confirmation
        </Link>.
        <p className="mt-2">
          If you can’t verify your STOVE account but you have <strong>purchase history</strong>, email support with as
          much info as you can (see the “Recovery Help” section below). They will review your data and assist with
          recovery.
        </p>
      </>
    ),
  },
  {
    key: 'faq-1',
    title: <>Will I be able to continue using my existing account after the service transfer?</>,
    content: (
      <>
        Yes. Once you enter the transfer code and the data transfer completes, you can keep playing with your existing account.
        <ul className="mt-2 list-disc pl-5">
          <li>You need a separate transfer code for <strong>each account and each server</strong>.</li>
          <li>Codes must be used on the corresponding server. Server changes are not allowed.</li>
          <li>Ex: A Korea server code <strong>cannot</strong> be used on the Japan server.</li>
          <li>Ex: A Korea server code <strong>can</strong> be used on the Global 2 server (post-merge).</li>
        </ul>
      </>
    ),
  },
  {
    key: 'faq-2',
    title: <>How do I get the service transfer code?</>,
    content: (
      <>
        <ol className="list-decimal pl-5 space-y-1">
          <li>After the Aug 12 (Tue) maintenance, log in → tap <strong>Service Transfer</strong> notice → open transfer screen.</li>
          <li>Review the notes and agree to the terms to apply.</li>
          <li>Proceed to <strong>Service Transfer Code issuance</strong>.</li>
        </ol>
        <p className="mt-2 text-gray-300">
          If an account has characters on multiple servers, issue a separate code <strong>for each server</strong>.
        </p>
      </>
    ),
  },
  {
    key: 'faq-3',
    title: <>Can guest accounts also be transferred?</>,
    content: (
      <>
        Transfer codes are <strong>not</strong> issued for guest IDs. Link your account first:
        <div className="mt-1">Settings → Account → Manage Account → Link Account → then issue the code.</div>
      </>
    ),
  },
  {
    key: 'faq-4',
    title: <>What types of new accounts can be created after the transfer?</>,
    content: <>You can create/link a VAGAMES account via <strong>Email / Google / Apple</strong>.</>,
  },
  {
    key: 'faq-5',
    title: <>If I have multiple characters, can all of them be transferred?</>,
    content: (
      <>
        Yes. But if you have characters on multiple servers, you must issue a <strong>separate</strong> code for each server.
        <div className="mt-1">Ex: Accounts on Korea and Global → get one code per server.</div>
      </>
    ),
  },
  {
    key: 'faq-6',
    title: <>I applied for the transfer. Can I change or cancel it?</>,
    content: <>No. Once you agree to the Service Transfer, it <strong>cannot</strong> be reversed.</>,
  },
  {
    key: 'faq-7',
    title: <>If I withdraw my account during the application period, can I still play after transfer?</>,
    content: <>No. If you withdraw before transfer, the account is erased and transfer is impossible, even if you already have a code.</>,
  },
  {
    key: 'faq-8',
    title: <>Will all game data, including guild info, be retained?</>,
    content: (
      <>
        <p>Most data is retained. However:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>
            <strong>Names changed</strong> (Ether for rename sent after Sep 26 maintenance):
            <div className="pl-4">
              – Account nickname → <em>current nickname_number</em><br />
              – Guild name → <em>OuterplaneGuild_number</em>
            </div>
          </li>
          <li>
            For Korea/ASIA/ASIA II servers, rankings will be <strong>merged and recalculated</strong>:
            <div className="pl-4">
              – Guild Raid Hall of Fame<br />
              – Arena League Hall of Fame
            </div>
          </li>
        </ul>
      </>
    ),
  },
  {
    key: 'faq-9',
    title: <>Will the guild remain if the Guild Leader doesn’t complete the transfer?</>,
    content: (
      <>
        Yes, the guild remains. Leader is reassigned based on:
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>Guild Officer with the highest contribution</li>
          <li>Most recently active among top 10 contributors</li>
          <li>Most recently active member otherwise</li>
        </ol>
      </>
    ),
  },
  {
    key: 'faq-10',
    title: <>What happens to items/products in my mailbox?</>,
    content: (
      <>
        Items/products are retained, but claim history for mail <em>before</em> the transfer won’t be shown afterward.
        <div className="mt-1">Mail with expired claim periods won’t be extended — claim before Sep 23.</div>
      </>
    ),
  },
  {
    key: 'faq-11',
    title: <>What will happen to Monthly Subscription products?</>,
    content: (
      <>
        Remaining duration will be <strong>automatically extended</strong> by the maintenance period after Sep 23 (Tue).
        <div className="mt-1">For a smooth transfer, claim them from your mailbox before Sep 23, 2025.</div>
      </>
    ),
  },
  {
    key: 'faq-12',
    title: <>If operation policy changes after transfer, are previous restrictions removed?</>,
    content: <>No. Accounts already under restriction remain inaccessible, won’t receive a code, and cannot be transferred.</>,
  },
  {
    key: 'faq-13',
    title: <>Will I still be able to use the official STOVE community?</>,
    content: (
      <>
        Available only for a limited time. All posts/content will be deleted on <strong>Oct 27, 2025 (Mon)</strong>.
        <div className="mt-1">Back up anything you need per the schedule.</div>
        <div className="mt-2">
          <strong>Official Community Schedule</strong>
          <ul className="list-disc pl-5 mt-1">
            <li>Sep 22: Restriction on Posting/Commenting</li>
            <li>Sep 23: Closure of all boards except Notices/Updates</li>
            <li>Oct 27: Complete closure of the STOVE community</li>
          </ul>
          <div className="mt-1 text-gray-300">
            Address for the official VAGAMES community will be announced later.
          </div>
        </div>
      </>
    ),
  },
  {
    key: 'faq-14',
    title: <>Will official social media channels remain after the transfer?</>,
    content: (
      <>
        The official <strong>X</strong> and <strong>Discord</strong> will continue to operate.
        <div className="mt-1">The <strong>Facebook</strong> page will be deleted on <strong>Sep 22</strong>. Save any content you want.</div>
      </>
    ),
  },
]

function ServiceTransferFAQ() {
  return (
    <section id="faq" className="mt-8">
      <h2 className="text-xl font-semibold mb-3">Service Transfer FAQ</h2>
      <Accordion items={faqItems} multiple />
    </section>
  )
}

export default function ServiceTransferGuide() {
  const steps: Step[] = [
    { title: 'Log into the game.' },
    {
      title: 'Tap [Service Transfer] on the main screen or go to [Settings] → [Service Transfer].',
      image: '/images/guides/service-transfert/1.webp',
      alt: 'Open the Service Transfer screen'
    },
    {
      title: 'Review the notes and agree to the terms.',
      image: '/images/guides/service-transfert/2.webp',
      alt: 'Agree to Service Transfer terms'
    },
    {
      title:
        'Receive a unique transfer code per account/server. Save it safely as a screenshot or send it to your email once issued.',
      image: '/images/guides/service-transfert/3.webp',
      alt: 'Transfer code issuance and save options'
    },
    {
      title:
        'After the transfer maintenance Oct 1, create a VAGAMES account (Email/Google/Apple) and enter the code on the corresponding server.'
    }
  ]

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900/60 via-zinc-900 to-zinc-900/60 p-6 md:p-8 mb-8">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            OUTERPLANE Service Transfer to <span className="text-blue-400">VAGAMES</span>
          </h1>
          <p className="text-zinc-300 mt-2">
            Keep your account, data, and rewards by following this updated guide.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1">
              📅 <strong className="font-semibold">Apply:</strong>&nbsp;Aug 12 → Sep 23, 2025
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1">
              ⏳ <strong className="font-semibold">Transfer:</strong>&nbsp;Oct 1
            </span>
          </div>
        </div>
      </section>

      {/* Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <GuideHeading level={3}>Overview</GuideHeading>
            <div className="prose prose-invert max-w-none">
              <p>
                OUTERPLANE will be transferred to <strong>VAGAMES</strong>. The exact date will be announced this week.
                Apply between <strong>August 12</strong> and <strong>September 23</strong> to receive your transfer code.
                <strong> A separate code is required for each account on each server.</strong>
              </p>
              <p className="mt-2 text-amber-100">
                Missed the window or lost your code? You can still recover your account. See{' '}
                <a href="#recovery" className="underline">Recovery Help</a> below.
              </p>
            </div>
          </section>

          {/* How to */}
          <section id="how-to">
            <h2 className="text-xl font-semibold mb-3">How to Transfer Your Account</h2>

            <ol className="space-y-3">
              {steps.map((step, idx) => (
                <li key={idx} className="group">
                  <div className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                        {idx + 1}
                      </div>
                      <p className="text-zinc-200">{step.title}</p>
                    </div>
                    {step.image && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={step.image}
                          alt={step.alt ?? `Step ${idx + 1}`}
                          className="rounded-lg border border-zinc-800"
                          loading="lazy"
                        />
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Server merge */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Server Merge</h2>
            <ul className="space-y-1 text-zinc-200">
              <li>Korea, Asia I, Asia II → merged into Global 2</li>
              <li>Global → renamed to Global 1</li>
              <li>Japan → unchanged</li>
              <li>Separate code needed for each account/server you have characters on</li>
            </ul>
          </section>

          {/* Rewards */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Transfer Completion Rewards</h2>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 space-y-1 text-amber-100 text-sm">
              <p><strong><ItemInlineDisplay names="“New Beginning” Title" /></strong> – 1 less Stamina in Adventure / Special Request / Skyward Tower</p>
              <p><strong><ItemInlineDisplay names="“New Beginning” Profile Frame" /></strong></p>
              <p><strong>1 <ItemInlineDisplay names="Oath of Determination" /></strong> – set Trust Level to 10</p>
              <p><strong>1 <ItemInlineDisplay names="Book of Evolution" /></strong> – set Upgrade Stage to 6</p>
              <p><strong>1 <ItemInlineDisplay names="Unlimited Restaurant Voucher" /></strong> – level hero to 100</p>
              <p><strong>1 <ItemInlineDisplay names="Demiurge Selection Ticket" /></strong> – choose Stella, Astei, Drakhan, Vlada, or Monad Eva</p>
              <p><strong>1,500 <ItemInlineDisplay names="Ether" /></strong></p>
            </div>
          </section>

          {/* Important */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Important Notes</h2>
            <ul className="space-y-2">
              <li>Transfer is irreversible once agreed.</li>
              <li className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">✔️</span>
                  <span className="text-zinc-200">Guest accounts must be linked to receive a code.</span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/guides/service-transfert/4.webp"
                  alt="Link guest account to receive a transfer code"
                  className="rounded-lg border border-zinc-800"
                  loading="lazy"
                />
              </li>
              <li>Inactive accounts (no 1-4 clear + no login since Nov 5, 2024) will be deleted on the transfer maintenance date Oct 1.</li>
              <li>Mail claim periods are not extended — claim before Sep 23.</li>
              <li className="text-amber-200">
                Recovery may <strong>not</strong> be possible for guest accounts or accounts without purchase history (ownership can’t be verified).
              </li>
            </ul>
          </section>

          {/* Recovery Help (new) */}
          <section id="recovery">
            <h2 className="text-xl font-semibold mb-3">Recovery Help (No Code / Lost Code)</h2>
            <div className="space-y-3 text-sm text-zinc-200">
              <div className="rounded-lg border border-blue-600/40 bg-blue-600/10 p-4">
                <p className="font-semibold">Step 1 — Check / issue your code</p>
                <p>
                  Use the official page:&nbsp;
                  <Link
                    href="https://outerplane.game.onstove.com/transfer"
                    target="_blank"
                    className="underline"
                  >
                    STOVE Transfer Code Confirmation
                  </Link>
                </p>
                <p className="mt-1 text-zinc-300">
                  If you didn’t receive a code before, you can still get one after agreeing to the transfer agreement.
                </p>
              </div>

              <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-4">
                <p className="font-semibold">Step 2 — Can’t verify your STOVE account?</p>
                <p>
                  If you have <strong>purchase history</strong>, contact support. Provide as much info as possible for a faster review:
                </p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li>Server</li>
                  <li>Nickname</li>
                  <li>UID</li>
                  <li>Device & OS (e.g., iPhone 14 / iOS 17)</li>
                  <li>Service Transfer Code (if available)</li>
                  <li>App Store / Google Play receipt (screenshot)</li>
                </ol>
                <div className="mt-2">
                  Email:&nbsp;
                  <Link href="mailto:outerplane_contact@vagames.kr" className="underline">
                    outerplane_contact@vagames.kr
                  </Link>
                  <br />
                  Help Center:&nbsp;
                  <Link
                    href="https://outerplane.helpshift.com/hc/en/4-outerplane/"
                    target="_blank"
                    className="underline"
                  >
                    https://outerplane.helpshift.com/hc/en/4-outerplane/
                  </Link>
                </div>
                <p className="mt-2 text-zinc-300">
                  Provide info based on data <strong>prior to the transfer maintenance date</strong>. Typical response time is 3–5 business days (may vary).
                </p>
              </div>

              <p className="text-amber-200">
                Note: Accounts created as <strong>Guest</strong> or <strong>without purchase history</strong> may not be eligible for recovery, as ownership can’t be verified.
              </p>
            </div>
          </section>

          {/* Refunds */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Refund Requests</h2>
            <p className="text-sm text-zinc-300">
              Available post-transfer Oct 1 → Dec 21, 2025, for Paid Ether purchased in last 90 days, if you did not transfer.
              Apply via STOVE Customer Center with proof of purchase.
            </p>
          </section>

          {/* Shop suspension */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Shop Suspension</h2>
            <p className="text-sm text-zinc-300">
              Shop closed Sep 4 → until transfer maintenance Oct 1. One new hero + Battle Pass delayed. Event dungeon rerun during downtime.
            </p>
          </section>

          <ServiceTransferFAQ />
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 space-y-4 h-max">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
            <h3 className="font-semibold mb-2">Quick Checklist</h3>
            <ul className="space-y-2 text-sm">
              <li>✅ Apply Aug 12 → Sep 23</li>
              <li>✅ Get code for EACH account/server</li>
              <li>✅ Save the code (screenshot or email)</li>
              <li>✅ Enter after Oct 1</li>
              <li>✅ Link guest accounts</li>
            </ul>
          </div>

          <div id="official" className="rounded-lg border border-blue-600/40 bg-blue-600/10 p-4">
            <h3 className="font-semibold mb-2">Official Announcement</h3>
            <Link
              href="https://page.onstove.com/outerplane/en/view/10859677"
              target="_blank"
              className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition"
            >
              View Stove Notice
            </Link>
            <Link
              href="https://page.onstove.com/outerplane/en/view/10965877"
              target="_blank"
              className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition mt-3"
            >
              Update Notice — Code issuance started
            </Link>
            <Link
              href="https://page.onstove.com/outerplane/en/view/10965889"
              target="_blank"
              className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition mt-3"
            >
              OUTERPLANE Service Transfer FAQ
            </Link>
          </div>

          {/* Recovery shortcut box */}
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
            <h3 className="font-semibold mb-2">Need Recovery?</h3>
            <ul className="text-sm space-y-2">
              <li>
                🔎{' '}
                <Link href="https://outerplane.game.onstove.com/transfer" target="_blank" className="underline">
                  Check / Issue Transfer Code (STOVE)
                </Link>
              </li>
              <li>
                ✉️{' '}
                <Link href="mailto:outerplane_contact@vagames.kr" className="underline">
                  outerplane_contact@vagames.kr
                </Link>
              </li>
              <li>
                🆘{' '}
                <Link
                  href="https://outerplane.helpshift.com/hc/en/4-outerplane/"
                  target="_blank"
                  className="underline"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
