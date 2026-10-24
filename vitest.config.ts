import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Miroir des paths tsconfig (tests de libs app qui importent via alias).
    alias: {
      '@data': resolve(__dirname, 'data'),
      '@contracts': resolve(__dirname, 'datagen/contracts/index.ts'),
      '@datagen': resolve(__dirname, 'datagen'),
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    // Environnement Node par défaut (tests de logique / transforms de données).
    // Pour tester des composants React plus tard : passer en 'jsdom' + plugin react.
    environment: 'node',
    include: ['{src,datagen,scripts}/**/*.test.{ts,tsx}'],
    // 15 s au lieu des 5 s par défaut : sur le fixe (Windows), les tests qui
    // lisent le vrai corpus sur disque tournent 2 à 3 fois plus lentement que sur
    // le portable (Fedora) ; quatre frôlaient les 5 s dans la suite complète
    // (boss-view, search-index ×2, bot-api.contract : 3,5 à 4,6 s, 24/10). Les
    // plus lourds gardent leur `{ timeout: 30_000 }` explicite.
    testTimeout: 15_000,
  },
});
