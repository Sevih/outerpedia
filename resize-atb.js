const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, 'public/images/characters/atb');
const outputDir = path.join(__dirname, 'public/images/characters/thumbs');

const width = 100;
const height = 100;

// Crée le dossier de sortie s’il n’existe pas
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdirSync(inputDir).forEach(file => {
  const ext = path.extname(file).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return;

  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file.replace(ext, '.jpg')); // Convertit tout en .jpg

  sharp(inputPath)
    .resize(width, height)
    .flatten({ background: '#000000' }) // ajoute fond noir si transparence
    .jpeg({ quality: 85 })
    .toFile(outputPath)
    .then(() => {
      console.log(`✅ ${file} → resized to 100x100 with black background`);
    })
    .catch(err => {
      console.error(`❌ Error processing ${file}:`, err.message);
    });
});
