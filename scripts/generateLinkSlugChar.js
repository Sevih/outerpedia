/* generateLinkSlugChar.js */
const fs = require('fs');
const path = require('path');

const charactersDir = path.join(process.cwd(), 'src/data/char');
const outputFile = path.join(process.cwd(), 'src/data/_SlugToChar.json');

const isNonEmpty = (v) => typeof v === 'string' && v.trim() !== '';

function toKebabCase(input) {
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
    /** @type {Record<string, {ID:string, Fullname:string, Fullname_jp?:string, Fullname_kr?:string}>} */
    const map = {};
    let count = 0;

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = path.join(charactersDir, file);
      let character;
      try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        character = JSON.parse(content);
      } catch (e) {
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

      const entry = {
        ID: String(ID),
        Fullname: String(Fullname).trim(),
      };
      if (isNonEmpty(character.Fullname_jp)) entry.Fullname_jp = character.Fullname_jp.trim();
      if (isNonEmpty(character.Fullname_kr)) entry.Fullname_kr = character.Fullname_kr.trim();

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
