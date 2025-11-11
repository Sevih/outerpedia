const { spawn } = require('child_process');
const kill = require('tree-kill');

// Afficher le message d'accueil
console.log('\n   ▲ Next.js');
console.log('   - LocalEn:    https://outerpedia.local/');
console.log('   - LocalJp:    https://jp.outerpedia.local/');
console.log('   - LocalKr:    https://kr.outerpedia.local/');
console.log('   - LocalZh:    https://zh.outerpedia.local/\n');

// Lancer le watcher WebP
const webpWatcher = spawn('node', ['scripts/watch-webp.js'], {
  stdio: 'inherit',
  shell: true
});

// Attendre un peu avant de lancer Next.js pour laisser le watcher se mettre en place
setTimeout(() => {
  // Lancer Next.js
  const nextDev = spawn('next', ['dev'], {
    stdio: 'inherit',
    shell: true
  });

  // Gérer l'arrêt propre
  const cleanup = () => {
    console.log('\n👋 Arrêt des serveurs...');
    if (webpWatcher.pid) kill(webpWatcher.pid);
    if (nextDev.pid) kill(nextDev.pid);
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  nextDev.on('exit', () => {
    if (webpWatcher.pid) kill(webpWatcher.pid);
    process.exit(0);
  });
}, 500);
