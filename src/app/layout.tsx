import './globals.css'
import type { Metadata } from 'next'
import Header from './components/Header'

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
      <body className="text-white">
        <Header />
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
