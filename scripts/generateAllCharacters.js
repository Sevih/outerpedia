const fs = require('fs');
const path = require('path');

const charactersDir = path.join(process.cwd(), 'src/data/char');
const outputFile = path.join(process.cwd(), 'src/data/_allCharacters.json');
const isNonEmpty = v => typeof v === 'string' && v.trim() !== '';


async function generateAllCharacters() {
  try {
    const files = await fs.promises.readdir(charactersDir);
    const allCharacters = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(charactersDir, file);
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const character = JSON.parse(content);
        const entry = {
          ID: character.ID,
          Fullname: character.Fullname,
          Rarity: character.Rarity,
          role: character.role,
          rank: character.rank,
          Class: character.Class,
          SubClass: character.SubClass,
          Element: character.Element,
          Chain_Type: character.Chain_Type,
          limited: character.limited ?? false,
          gift: character.gift ?? false,
          rank_pvp: character.rank_pvp ?? false
        }
        
        if (Array.isArray(character.tags) && character.tags.length > 0) entry.tags = character.tags
        if (isNonEmpty(character.Fullname_jp)) entry.Fullname_jp = character.Fullname_jp.trim()
        if (isNonEmpty(character.Fullname_kr)) entry.Fullname_kr = character.Fullname_kr.trim()

        allCharacters.push(entry)
      }
    }

    await fs.promises.writeFile(outputFile, JSON.stringify(allCharacters, null, 2));
    console.log(`✅ Successfully generated ${outputFile}`);
  } catch (err) {
    console.error('❌ Error generating all characters:', err);
  }
}

generateAllCharacters();