'use client'

import Link from 'next/link'
import { FaGithub, FaDiscord, FaReddit, FaYoutube, FaTwitter } from 'react-icons/fa'

export default function Footer() {
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || 'dev'

  return (
    <footer className="mt-10 border-t border-zinc-800 bg-black/40">
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col items-center gap-6 text-sm text-zinc-400 md:flex-row md:flex-wrap md:justify-between">
        {/* Infos version */}
        <p className="text-center md:text-left">
          © {new Date().getFullYear()} Outerpedia v{appVersion} – Fanmade Database for Outerplane.
        </p>

        {/* Liens Outerpedia */}
        <nav aria-label="Outerpedia Links" className="flex flex-wrap justify-center gap-4">
          <Link
            href="https://github.com/Sevih/outerpedia"
            aria-label="GitHub repository for Outerpedia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-zinc-200"
          >
            <FaGithub /> GitHub
          </Link>
          <Link
            href="https://discord.com/invite/keGhVQWsHv"
            aria-label="EvaMains Discord for Outerpedia community"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-zinc-200"
          >
            <FaDiscord /> EvaMains Discord
          </Link>
          <Link href="/legal" className="hover:text-zinc-200">
            Legal Notice
          </Link>
          <Link href="/changelog" className="hover:text-zinc-200">
            Changelog
          </Link>
        </nav>

        {/* Liens officiels Outerplane */}
        <nav aria-label="Official Outerplane Links" className="flex flex-wrap justify-center gap-4">
          <Link
            href="http://outerplane.vagames.kr/index.html"
            aria-label="Outerplane Official Homepage"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-200"
          >
            Homepage
          </Link>
          <Link
            href="https://discord.com/invite/zvktrHTu"
            aria-label="Outerplane Official Discord"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-zinc-200"
          >
            <FaDiscord /> Official Discord
          </Link>
          <Link
            href="https://www.reddit.com/r/OUTERPLANE_Publisher/"
            aria-label="Outerplane Reddit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-zinc-200"
          >
            <FaReddit /> Reddit
          </Link>
          <Link
            href="https://www.youtube.com/@OUTERPLANE_OFFICIAL"
            aria-label="Outerplane YouTube"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-zinc-200"
          >
            <FaYoutube /> YouTube
          </Link>
          <Link
            href="https://x.com/M9_outerplane"
            aria-label="Outerplane Twitter / X"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-zinc-200"
          >
            <FaTwitter /> X (Twitter)
          </Link>
        </nav>
      </div>

      {/* Disclaimer */}
      <p className="mx-auto max-w-4xl px-4 pb-6 text-center text-xs leading-snug text-zinc-500">
        Outerpedia is an unofficial fan-made project. All content related to <i>Outerplane</i>, including characters,
        images, and other game assets, is the property of VAGAMES CORP. This website is not affiliated with, endorsed by,
        or sponsored by VAGAMES CORP in any way.
      </p>
    </footer>
  )
}
