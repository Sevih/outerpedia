import { listGameTables } from '@/lib/admin/gamedata-store';

export const dynamic = 'force-dynamic';

export default function ToolGameData() {
  const tables = listGameTables();
  const bytes = tables.reduce((sum, t) => sum + t.bytes, 0);
  const last = Math.max(0, ...tables.map((t) => t.mtimeMs));

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-content-strong text-xl font-semibold">Tools · Game data</h1>
        <p className="text-content-muted text-sm">
          Reader for the RAW tables extracted from the game (<code>.gamedata/parsed</code>) — as the
          parser produces them, without interpretation. This is the pre-generator exploration tool:
          search for a column, follow an id, read the matching text key.
        </p>
      </div>

      {tables.length === 0 ? (
        <p className="text-warn text-sm">
          No parsed table. Run the extraction (<code>pnpm datagen:convert</code>) to populate{' '}
          <code>.gamedata/parsed</code>.
        </p>
      ) : (
        <>
          <ul className="text-content-subtle space-y-1 text-sm">
            <li>
              <span className="text-content-strong">{tables.length}</span> tables ·{' '}
              <span className="text-content-strong">{(bytes / 1_000_000).toFixed(0)} MB</span> ·
              last extraction on{' '}
              <span className="text-content-strong">
                {new Date(last).toLocaleString('fr-FR', { dateStyle: 'medium' })}
              </span>
            </li>
          </ul>
          <div className="text-content-muted space-y-1 text-sm">
            <p>Choose a table on the left. On a table:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>search and pagination happen on the server (up to 18 MB per table);</li>
              <li>
                columns that are never filled are hidden by default — off-header columns (
                <code>_unknown_*</code>) are always shown;
              </li>
              <li>
                a cell that is a text key shows the English below it; an <code>*ID</code> column
                whose table exists (<span className="text-accent">↗</span>) becomes a link to the
                target row;
              </li>
              <li>clicking a row shows its raw JSON.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
