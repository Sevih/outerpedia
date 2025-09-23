import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Notice | Outerpedia',
  description: 'Legal disclaimer, copyright, and content usage information for Outerpedia, a non-commercial fan project dedicated to Outerplane.',
  keywords: [
    'outerpedia legal notice',
    'terms of service',
    'content usage policy',
    'copyright',
    'disclaimer',
    'outerplane fan project',
    'non-commercial site',
    'ovh hosting',
    'lcEN compliance',
    'takedown request'
  ],
  alternates: {
    canonical: 'https://outerpedia.com/legal',
  },
};


  
  export default function LegalNoticePage() {
    return (
      <main className="p-4 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Legal Notice</h1>
  
        <p className="mb-4">
          <strong>Outerpedia</strong> is an unofficial, fan-made project dedicated to the game <strong>Outerplane</strong>.
          All names, images, and other assets used on this site are the property of <strong>VAGAMES CORP</strong> or their respective owners.
          This site is not affiliated with, endorsed by, or sponsored by VAGAMES CORP.
        </p>
  
        <p className="mb-4">
          This website was created strictly for non-commercial, educational, and informational purposes.
          No advertisements, donations, tracking tools, or monetization mechanisms are used.
        </p>
  
        <p className="mb-4">
          <strong>Outerpedia does not host or redistribute game files.</strong> All visual assets are displayed for commentary and documentation purposes only.
          No content is made available for download or reuse.
        </p>
  
        <p className="mb-4">
          If you are the rightful owner of any content featured on this site and would like it removed, you may contact us or our hosting provider directly.
          We will respond to any takedown request promptly.
        </p>
  
        <h2 className="text-xl font-semibold mt-8 mb-3">Hosting Provider</h2>
        <p className="mb-2">
          OVH SAS<br />
          2 rue Kellermann – 59100 Roubaix – France<br />
          <a
            href="https://www.ovh.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600"
          >
            https://www.ovh.com
          </a>
        </p>
  
        <p className="text-sm text-gray-500 mt-6">
          This site is maintained by a private individual. In accordance with French law (LCEN),
          identification information may be disclosed to judicial authorities upon legal request via our hosting provider.
        </p>
      </main>
    );
  }
  