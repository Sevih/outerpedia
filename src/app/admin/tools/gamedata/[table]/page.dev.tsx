import { notFound } from 'next/navigation';
import { GameDataBrowser } from '@/components/admin/GameDataBrowser';
import { isValidTableName, listGameTables, queryTable } from '@/lib/admin/gamedata-store';

export const dynamic = 'force-dynamic';

export default async function GameDataTablePage({
  params,
  searchParams,
}: {
  params: Promise<{ table: string }>;
  searchParams: Promise<{ q?: string; col?: string; exact?: string }>;
}) {
  const { table } = await params;
  const { q = '', col = '', exact } = await searchParams;
  const isExact = exact === '1';

  if (!isValidTableName(table) || !listGameTables().some((t) => t.name === table)) notFound();

  // Première page rendue au serveur : le client n'ouvre une requête que sur
  // changement de filtre. Le filtre initial vient d'un lien croisé
  // (?col=ID&q=…&exact=1).
  const initial = queryTable(table, { q, col, exact: isExact, resolve: true });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h1 className="text-content-strong text-xl font-semibold">{table}</h1>
        <span className="text-content-subtle text-xs">
          {/* Le nom interne du parser (`CAdventureTemplet`) diffère du fichier. */}
          {initial.table !== table && <span className="mr-2 font-mono">{initial.table}</span>}
          {initial.rowCount} rows · {initial.filled.length}/{initial.columns.length} columns filled
        </span>
      </div>
      <GameDataBrowser
        // Changer de table (ou de filtre croisé) doit REMONTER la grille :
        // sans clé, React réutilise l'instance et garde l'état de l'ancienne.
        key={`${table}:${col}:${q}:${exact}`}
        name={table}
        initial={initial}
        query={{ q, col, exact: isExact }}
      />
    </div>
  );
}
