import './globals.css'
import type { Metadata } from 'next'
import Header from './components/Header'

// 👇 Import de la police via next/font
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Outerpedia',
  description: 'Outerplane Wiki & Guide',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* 👇 On applique la classe générée automatiquement par la police */}
      <body className={`${inter.className} text-white`}>
        <Header />
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
