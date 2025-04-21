'use client'
import Link from 'next/link'

export default function WarningBanner() {
  return (
    <>
      <div className="bg-yellow-600 text-white px-4 py-3 rounded-lg shadow-md text-center border border-yellow-400">
        ⚠️ Character data has been parsed automatically using a custom tool. Errors may exist!
        If you spot something wrong, please report it via our{' '}
        <Link
          href="https://discord.com/invite/ESkqR8ta7y"
          target="_blank"
          className="underline font-semibold hover:text-yellow-200"
        >
          Discord
        </Link>.
      </div>
      <div className="bg-yellow-600 text-white px-4 py-3 rounded-lg shadow-md text-center border border-yellow-400 mt-4">
        ⚠️ All gear recommendations and tier lists (characters and exclusive equipment priority) come from the{' '}
        <Link
          href="https://discord.gg/6bNysAVY6e"
          target="_blank"
          className="underline font-semibold hover:text-yellow-200"
        >
          EvaMains Discord
        </Link>. Consider joining if you have further questions.
      </div>
    </>
  )
}
