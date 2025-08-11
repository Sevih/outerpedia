'use client'

import Link from 'next/link'
import GuideHeading from '@/app/components/GuideHeading'
import ItemInlineDisplay from '@/app/components/ItemInline'


type Step = {
  title: string
  image?: string
  alt?: string
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
        'After Sep 26 maintenance, create a VAGAMES account (Email/Google/Apple) and enter the code on the corresponding server.'
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
              ⏳ <strong className="font-semibold">Transfer:</strong>&nbsp;Sep 26, 2025 (after maintenance)
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
                OUTERPLANE will be transferred to <strong>VAGAMES</strong> on <strong>September 26, 2025</strong>.
                Apply between <strong>August 12</strong> and <strong>September 23</strong> to receive your transfer code.
                <strong> A separate code is required for each account on each server.</strong> Without completing the
                process, you will lose access after September 23.
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
              <li>Inactive accounts (no 1-4 clear + no login since Nov 5, 2024) will be deleted Sep 26.</li>
              <li>Mail claim periods are not extended — claim before Sep 23.</li>
            </ul>
          </section>

          {/* Refunds */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Refund Requests</h2>
            <p className="text-sm text-zinc-300">
              Available Sep 26 → Dec 21, 2025, for Paid Ether purchased in last 90 days, if you did not transfer.
              Apply via STOVE Customer Center with proof of purchase.
            </p>
          </section>

          {/* Shop suspension */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Shop Suspension</h2>
            <p className="text-sm text-zinc-300">
              Shop closed Sep 4 → Sep 26. One new hero + Battle Pass delayed. Event dungeon rerun during downtime.
            </p>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 space-y-4 h-max">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
            <h3 className="font-semibold mb-2">Quick Checklist</h3>
            <ul className="space-y-2 text-sm">
              <li>✅ Apply Aug 12 → Sep 23</li>
              <li>✅ Get code for EACH account/server</li>
              <li>✅ Save the code (screenshot or email)</li>
              <li>✅ Enter after Sep 26</li>
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
              Update Notice - Service Transfer Code issuance has begun
            </Link>
            <Link
              href="https://page.onstove.com/outerplane/en/view/10965889"
              target="_blank"
              className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition mt-3"
            >
              OUTERPLANE Service Transfer FAQ
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
