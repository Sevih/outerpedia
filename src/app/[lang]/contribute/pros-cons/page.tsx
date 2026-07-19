/**
 * Page PUBLIQUE de contribution aux PROS/CONS d'un perso (Jaego). Prod, sans
 * login : on édite et on exporte un JSON (aucune écriture serveur). Non indexée.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { normalizeLang } from '@/lib/i18n/config';
import { localePath } from '@/lib/navigation';
import { editorialToolData } from '@/lib/contribute/editorial-tool-data';
import { EditorialPublicTool } from '@/components/admin/editorial/EditorialPublicTool';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  await params;
  return {
    title: 'Contribution — Pros / Cons',
    robots: { index: false, follow: false },
  };
}

export default async function ContributeProsConsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const data = editorialToolData();

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Link
        href={localePath(lang, '/contribute')}
        className="text-content-subtle hover:text-accent text-sm"
      >
        ← Contribution tools
      </Link>
      <h1 className="text-content-strong text-2xl font-semibold">Pros / Cons — contribution</h1>
      <EditorialPublicTool slice="prosCons" kind="character-pros-cons" {...data} />
    </main>
  );
}
