import './globals.css';
import type { Metadata, Viewport } from 'next';
import Header from './components/Header';
import Footer from './components/Footer';
import { Inter } from 'next/font/google';
import UpdateToast from './components/UpdateToast';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Outerpedia',
  description: 'Outerplane Wiki & Guide',
  icons: {
    icon: '/favicon.ico',
    apple: '/images/icons/icon-192x192.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0891b2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-white`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 container mx-auto p-4">
            {children}
          </main>
          <Footer />
        </div>
        <UpdateToast />
      </body>
    </html>
  );
}
