'use client'

import Link from 'next/link'

export default function WarningBanner() {
  return (
    <div className="space-y-2 relative z-0">
      {/* Cadre 1 : avertissement fan-site */}
      <div className="bg-yellow-400 text-black px-3 py-2 rounded-lg shadow-md text-sm text-center border border-yellow-400">
        ⚠️ <strong>Outerpedia</strong> is an unofficial fan-made website for the game <strong>OUTERPLANE</strong>.
        All images, names, and other game assets on this site are the property of <strong>VAGAMES</strong> and/or their respective owners.
        This site is not affiliated with or endorsed by <strong>VAGAMES</strong>.
        All content is provided for informational and educational purposes only.
      </div>

      {/* Cadre 2 : annonce du transfert */}
      <div className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-md text-sm text-center border border-blue-500">
        📢 <strong>Service Transfer Update:</strong> The transfer of <strong>OUTERPLANE</strong> to <strong>VAGAMES</strong> is still in progress.  
        An official date is expected to be announced this week.  
        <div className="mt-1">
          <Link
            href="/guides/service-transfer"
            className="inline-block bg-white text-blue-600 font-semibold px-2 py-1 rounded hover:bg-gray-200 transition"
          >
            View Transfer Procedure
          </Link>
        </div>
      </div>
    </div>
  )
}
