const fs = require('fs');
const path = require('path');

const charactersDir = path.join(process.cwd(), 'src/data/char');
const outputFile = path.join(process.cwd(), 'src/data/_allCharacters.json');

async function generateAllCharacters() {
  try {
    const files = await fs.promises.readdir(charactersDir);
    const allCharacters = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(charactersDir, file);
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const character = JSON.parse(content);
        allCharacters.push({
          ID: character.ID,
          Fullname: character.Fullname,
          Rarity: character.Rarity,
          role: character.role,
          rank: character.rank,
          Class: character.Class,
          Element: character.Element,
          // tu peux ajouter d'autres champs utiles ici
        });
      }
    }

    await fs.promises.writeFile(outputFile, JSON.stringify(allCharacters, null, 2));
    console.log(`✅ Successfully generated ${outputFile}`);
  } catch (err) {
    console.error('❌ Error generating all characters:', err);
  }
}

generateAllCharacters();