'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Fournit le thème clair/sombre via next-themes :
 *   - bascule la classe `dark` sur <html> (cf. tokens dans globals.css) ;
 *   - suit la préférence OS au 1er chargement (`enableSystem`) ;
 *   - mémorise le choix manuel ;
 *   - pas de transition au changement (évite le flash de couleurs).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
