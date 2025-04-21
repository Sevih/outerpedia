import fs from 'fs/promises';
import path from 'path';
import { Character } from '@/types/character';

export async function loadCharacter(name: string): Promise<Character | null> {
  try {
    const filePath = path.join(process.cwd(), 'src/data/char', `${name}.json`);
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
