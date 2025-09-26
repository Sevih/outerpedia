// ./src/app/api/pull-sim/chars/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import type { Entry } from '@/types/pull';

const DATA_DIR = path.resolve(process.cwd(), 'src/data');

async function read(file: string): Promise<Entry[]> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), 'utf8');
    return JSON.parse(raw) as Entry[];
  } catch {
    return [];
  }
}

export async function GET() {
  const [regular, premium, limited] = await Promise.all([
    read('characters_regular.json'),
    read('characters_premium.json'),
    read('characters_limited.json'),
  ]);

  const only3 = (arr: ReadonlyArray<Entry>) =>
    arr.filter(x => Number(x.rarity) === 3);

  return NextResponse.json({
    regular3: only3(regular),
    premium3: only3(premium),
    limited3: only3(limited),
    all3: only3([...regular, ...premium, ...limited]),
  });
}
