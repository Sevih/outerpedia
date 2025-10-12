import type { EventDef } from './registry.types'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const Page: React.FC = () => (
  <main className="mx-auto max-w-2xl px-4 py-12 text-center space-y-6">
    <header>
      <h1 className="text-4xl font-extrabold text-rose-500 mb-2">Get out of here.</h1>
      <div className="flex justify-center">
        <Image
          src="/images/events/gtfo.webp"
          alt="Suspicious cat"
          width={300}
          height={200}
          className="rounded-lg border border-white/10 shadow-md mx-auto"
        />
      </div>
      <p className="text-zinc-300">

        You weren’t supposed to find this page.
      </p>
    </header>

    <section className="space-y-4 mt-8">
      <p className="text-zinc-400">
        There’s nothing to see here.
        No event. No secret. Definitely not a hidden test for something coming soon.
      </p>
      <p className="text-zinc-500 italic">
        (Seriously, go play the game or check the <Link href="/" className="underline hover:text-rose-400">
          homepage
        </Link>.)
      </p>
    </section>

    <section className="mt-10">
      <h2 className="text-lg font-semibold text-white mb-2">Confidential Area</h2>
      <p className="text-zinc-400">
        Access restricted to Outerpedia Admins, Cats, and Possibly Space Jellyfish.
        Unauthorized reading may result in mild disappointment.
      </p>
      <p className="text-sm text-zinc-500 mt-2">
        (A mysterious force prevents you from going further. Maybe it’s the dev’s coffee break.)
      </p>

    </section>

    <footer className="pt-6 border-t border-white/10 text-xs text-zinc-600">
      <p>
        © 2025 Outerpedia — All leaks are imaginary.
        No rewards will be distributed for finding this page. Probably.
      </p>
    </footer>
  </main>
)

export default {
  meta: {
    slug: 'no-peaking',
    title: 'Get out of here',
    cover: '/images/events/gtfo.webp',
    start: '2020-10-09T00:00:00Z',
    end: '2020-10-15T23:59:59Z',
  },
  Page,
} satisfies EventDef
