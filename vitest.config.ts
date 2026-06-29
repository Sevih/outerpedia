import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Environnement Node par défaut (tests de logique / transforms de données).
    // Pour tester des composants React plus tard : passer en 'jsdom' + plugin react.
    environment: 'node',
    include: ['{src,datagen}/**/*.test.{ts,tsx}'],
  },
});
