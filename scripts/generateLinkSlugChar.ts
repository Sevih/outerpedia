/* generateLinkSlugChar.ts */
import * as fs from 'fs';
import * as path from 'path';
import { getAvailableLanguages } from '../src/tenants/config.js';
import type { SlugToCharMap } from '../src/types/pull.js';

const charactersDir = path.join(process.cwd(), 'src/data/char');
const outputFile = path.join(process.cwd(), 'src/data/_SlugToChar.json');

const isNonEmpty = (v: any): v is string => typeof v === 'string' && v.trim() !== '';

function toKebabCase(input: any): string {
  if (typeof input !== 'string') {
    console.warn('toKebabCase: input not a string:', input);
    return '';
  }
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function generateSlugToChar() {
  try {
    const files = await fs.promises.readdir(charactersDir);
    const map: SlugToCharMap = {};
    let count = 0;

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = path.join(charactersDir, file);
      let character: any;
      try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        character = JSON.parse(content);
      } catch (e: any) {
        console.warn('⚠️  Skip invalid JSON:', filePath, e.message);
        continue;
      }

      const ID = character?.ID;
      const Fullname = character?.Fullname;

      if (!isNonEmpty(ID) || !isNonEmpty(Fullname)) {
        console.warn('⚠️  Missing ID or Fullname, skip:', filePath);
        continue;
      }

      const slug = toKebabCase(Fullname);
      if (!slug) {
        console.warn('⚠️  Empty slug for:', filePath);
        continue;
      }

      const entry: any = {
        ID: String(ID),
        Fullname: String(Fullname).trim(),
      };

      // Add localized fullnames dynamically based on available languages
      for (const lang of getAvailableLanguages()) {
        if (lang === 'en') continue; // Skip English as it's the default Fullname
        const fullnameKey = `Fullname_${lang}`;
        if (isNonEmpty(character[fullnameKey])) {
          entry[fullnameKey] = character[fullnameKey].trim();
        }
      }

      map[slug] = entry;
      count++;
    }

    // Écrire avec clés triées pour des diffs propres
    const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));
    await fs.promises.writeFile(outputFile, JSON.stringify(sorted, null, 2), 'utf-8');

    console.log(`✅ Generated ${outputFile} with ${count} entries.`);
  } catch (err) {
    console.error('❌ Error generating _SlugToChar.json:', err);
    process.exitCode = 1;
  }
}

generateSlugToChar();
