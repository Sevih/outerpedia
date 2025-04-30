import ToolsClient from "./ToolsClient";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Assets Download – Outerplane | Outerpedia',
  description: 'Browse and download all Outerplane asset images: characters, skills, full art, UI and effects. Powered by Outerpedia.',
  keywords: ['Outerplane', 'Assets', 'Download', 'Characters', 'Skills', 'UI', 'Effects', 'Images', 'Outerpedia'],
  alternates: {
    canonical: 'https://outerpedia.com/assets-dl',
  },
  openGraph: {
    title: 'Assets Download – Outerplane | Outerpedia',
    description: 'Access and download visual assets from Outerplane including skills, portraits, effects and more.',
    url: 'https://outerpedia.com/assets-dl',
    type: 'website',
    images: [
      {
        url: 'https://outerpedia.com/images/ui/nav/CM_Guild_NoticeBoard.png',
        width: 120,
        height: 40,
        alt: 'Outerplane Assets',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Assets Download – Outerplane',
    description: 'Download all assets from Outerplane: characters, skills, effects, UI and more.',
    images: ['https://outerpedia.com/images/ui/nav/CM_Guild_NoticeBoard.png'],
  },
}

export const dynamic = "force-static";

export default function ToolsPage() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Assets Download</h1>
      <ToolsClient />
    </main>
  );
}


