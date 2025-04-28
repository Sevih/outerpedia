import { promises as fs } from 'fs';
import path from 'path';
import type { Character } from '@/types/character';

export async function getCharacters(): Promise<Character[]> {
  const dirPath = path.join(process.cwd(), 'src/data/char');
  const files = await fs.readdir(dirPath);

  const characters: Character[] = [];

  for (const file of files) {
    if (file.endsWith('.json')) {
      const content = await fs.readFile(path.join(dirPath, file), 'utf8');
      const character = JSON.parse(content);
      characters.push(character);
    }
  }

  return characters;
}
