import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Outerpedia',
  description: 'Community-driven wiki and database for Outerplane.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // suppressHydrationWarning : next-themes pose la classe `dark` sur <html> côté
  // client avant l'hydratation, ce qui diffère du HTML serveur — c'est attendu.
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
