/**
 * Hub PUBLIC des outils de contribution (`/contribute`). Liste tous les outils
 * du registre — chacun est une page où l'on édite puis EXPORTE un JSON à
 * renvoyer (aucun compte, aucune écriture serveur). Non indexé.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { normalizeLang } from '@/lib/i18n/config';
import { localePath } from '@/lib/navigation';
import { CONTRIBUTE_TOOLS } from '@/lib/contribute/registry';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Contribution tools',
  robots: { index: false, follow: false },
};

export default async function ContributeHubPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-content-strong text-2xl font-semibold">Contribution tools</h1>
        <p className="text-content-subtle text-sm">
          Tools for community contributors. Edit content, then export a JSON file and send it back —
          no account needed, nothing is written to the site directly.
        </p>
      </div>

      {CONTRIBUTE_TOOLS.length === 0 ? (
        <p className="text-content-subtle text-sm">No contribution tool available yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {CONTRIBUTE_TOOLS.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={localePath(lang, `/contribute/${tool.slug}`)}
                className="border-line bg-surface-raised/60 hover:border-accent block h-full rounded-xl border p-4 transition-colors"
              >
                <h2 className="text-content-strong text-base font-semibold">{tool.title}</h2>
                <p className="text-content-muted mt-2 text-sm">{tool.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
