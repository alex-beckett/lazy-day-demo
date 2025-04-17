import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Do-Nothing Simulator',
  description: 'A peaceful idle game where doing nothing is everything.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-pink-200 via-purple-300 to-cyan-200`}>
        {children}
      </body>
    </html>
  )
} 