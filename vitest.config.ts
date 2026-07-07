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
    include: ['{src,datagen}/**/*.test.{ts,tsx}'],
  },
});
