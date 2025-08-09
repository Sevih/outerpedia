'use client'

import Link from 'next/link'
import GuideHeading from '@/app/components/GuideHeading'

export default function ServiceTransferGuide() {
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
            Follow this quick guide to keep your account and game data.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1">
              📅 <strong className="font-semibold">Transfer:</strong>&nbsp;Tue, Sep 23, 2025 (after maintenance)
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1">
              ⏳ <strong className="font-semibold">Apply:</strong>&nbsp;Aug 12 → Sep 23, 2025
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
                The OUTERPLANE service will be transferred to <strong>VAGAMES</strong> to provide a better gaming
                experience. If you agree to the transfer, <strong>all your existing game data will be preserved</strong>.
                If you do not complete the transfer, you will lose access to the game after <strong>September 23, 2025</strong>.
              </p>
            </div>
          </section>

          <section id="how-to">
            <h2 className="text-xl font-semibold mb-3">How to Transfer Your Account</h2>

            <ol className="space-y-3">
              {[
                {
                  title: 'Log into the game.',
                },
                {
                  title:
                    'Open the transfer screen: tap [Service Transfer] on the main screen, or go to [Settings] → [Service Transfer].',
                },
                {
                  title: 'Read the important information and agree to the terms.',
                },
                {
                  title:
                    'Receive your transfer code automatically after agreeing. Save it as a screenshot or email it to yourself.',
                },
                {
                  title:
                    'After the Sep 23 maintenance, enter the code (for your server) on the login screen to restore your account. You can also enter it via [Settings] → [Account].',
                },
              ].map((step, idx) => (
                <li key={idx} className="group">
                  <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-zinc-200">{step.title}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Important Notes</h2>
            <ul className="space-y-2">
              {[
                'Each transfer code can only be used once per account to recreate your existing game data on the new account, and only after September 23, 2025.',
                'Transfer is irreversible once agreed.',
                'Do not share your transfer code.',
                'No transfer = no access after maintenance.',
                'If you wish to delete your STOVE account, do so after the transfer is complete.',
                'After the transfer, customer support will be handled by VAGAMES Customer Center.',
              ].map((note, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5">✔️</span>
                  <span className="text-zinc-200">{note}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Transfer Rewards</h2>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="text-amber-100">
                <strong>Distribution:</strong> starts Sep 23, 2025 (after maintenance). Rewards are sent once per account
                to your in-game mailbox and include a <strong>Demiurge Selection Ticket</strong> and more (details on
                Aug 12, 2025).
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 space-y-4 h-max">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
            <h3 className="font-semibold mb-2">Quick Checklist</h3>
            <ul className="space-y-2 text-sm">
              <li>✅ Apply between <strong>Aug 12 → Sep 23</strong></li>
              <li>✅ Save your <strong>transfer code</strong></li>
              <li>✅ Enter code after <strong>Sep 23 maintenance</strong></li>
              <li>✅ Keep your code private</li>
            </ul>
          </div>

          <div id="official" className="rounded-lg border border-blue-600/40 bg-blue-600/10 p-4">
            <h3 className="font-semibold mb-2">Official Announcement</h3>
            <p className="text-sm text-blue-100 mb-3">
              Read the full notice and details on the official community page.
            </p>
            <Link
              href="https://page.onstove.com/outerplane/en/view/10859677"
              target="_blank"
              className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition"
            >
              View Stove Notice
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
