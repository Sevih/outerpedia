const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const INPUT_DIR = path.join(__dirname, '..', 'public');
const CWEBP = path.join(__dirname, '..', 'datamine', 'pngTowebp', 'bin', 'cwebp.exe');
const QUALITY = 85;

// Extensions d'images à surveiller
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif'];

// Fonction pour convertir une image en WebP
function convertToWebP(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();

  if (!IMAGE_EXTENSIONS.includes(ext)) {
    return;
  }

  const webpPath = imagePath.replace(/\.(png|jpg|jpeg|gif)$/i, '.webp');

  // Vérifier si le fichier WebP existe déjà
  if (fs.existsSync(webpPath)) {
    return;
  }

  const relativePath = path.relative(process.cwd(), imagePath);
  console.log(`🖼️  Conversion de ${relativePath}...`);

  const args = ['-q', QUALITY, imagePath, '-o', webpPath];
  const cwebp = spawn(CWEBP, args);

  cwebp.on('close', (code) => {
    if (code === 0) {
      console.log(`✅ Converti: ${relativePath}`);
    } else {
      console.error(`❌ Erreur lors de la conversion de ${relativePath}`);
    }
  });
}

// Fonction pour scanner un dossier et convertir toutes les images
function scanDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile()) {
        convertToWebP(fullPath);
      }
    }
  } catch (err) {
    console.error(`Erreur lors du scan de ${dir}:`, err);
  }
}

// Conversion initiale de toutes les images existantes
console.log('🔍 Scan initial des images...');
scanDirectory(INPUT_DIR);

// Surveiller les changements dans le dossier public
console.log(`👀 Surveillance du dossier public pour les nouvelles images...`);

const watcher = fs.watch(INPUT_DIR, { recursive: true }, (eventType, filename) => {
  if (!filename) return;

  const fullPath = path.join(INPUT_DIR, filename);

  // Vérifier si c'est un fichier qui existe (ajout ou modification)
  if (eventType === 'rename' && fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    if (stats.isFile()) {
      convertToWebP(fullPath);
    }
  }
});

console.log('✨ Watcher WebP démarré avec succès!\n');

// Gérer l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n👋 Arrêt du watcher WebP...');
  watcher.close();
  process.exit(0);
});
