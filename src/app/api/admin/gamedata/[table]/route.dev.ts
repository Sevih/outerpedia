import { NextResponse } from 'next/server';
import { IS_DEV } from '@/lib/admin/guard';
import {
  isValidTableName,
  listGameTables,
  PAGE_SIZE,
  queryTable,
} from '@/lib/admin/gamedata-store';

/**
 * DEV ONLY — pagine/filtre une table BRUTE du jeu (`.gamedata/parsed`).
 * Les tables montent à 18 Mo : la recherche et la pagination restent au serveur,
 * le client ne reçoit jamais qu'une page.
 */
export async function GET(req: Request, { params }: { params: Promise<{ table: string }> }) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { table } = await params;
  if (!isValidTableName(table)) return NextResponse.json({ error: 'bad table' }, { status: 400 });
  if (!listGameTables().some((t) => t.name === table))
    return NextResponse.json({ error: 'unknown table' }, { status: 404 });

  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page') ?? '1');

  return NextResponse.json(
    queryTable(table, {
      q: url.searchParams.get('q') ?? '',
      col: url.searchParams.get('col') ?? '',
      exact: url.searchParams.get('exact') === '1',
      page: Number.isFinite(page) ? page : 1,
      pageSize: PAGE_SIZE,
      resolve: url.searchParams.get('resolve') === '1',
    }),
  );
}
