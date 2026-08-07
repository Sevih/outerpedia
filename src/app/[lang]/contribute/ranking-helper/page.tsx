/**
 * Page PUBLIQUE d'aide au ranking (`/contribute/ranking-helper`) : consultation
 * pure (rien à exporter, contrairement aux autres outils du hub) — elle JOINT
 * en une vue ce qu'une session de ranking Discord oblige à ouvrir en quatre
 * onglets : fiche du perso, son EE aux deux paliers, et ses homologues dans
 * chaque classement. Non indexée.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { normalizeLang } from '@/lib/i18n/config';
import { localePath } from '@/lib/navigation';
import { rankingHelperRows } from '@/lib/contribute/ranking-helper-data';
import { RankingHelperBrowser } from '@/components/contribute/RankingHelperBrowser';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Contribution — Ranking helper',
  robots: { index: false, follow: false },
};

export default async function ContributeRankingHelperPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Link
        href={localePath(lang, '/contribute')}
        className="text-content-subtle hover:text-accent text-sm"
      >
        ← Contribution tools
      </Link>
      <h1 className="text-content-strong mx-auto text-2xl font-semibold">Ranking helper</h1>
      <RankingHelperBrowser rows={rankingHelperRows()} />
    </div>
  );
}
