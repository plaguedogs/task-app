import type { Metadata } from 'next'
import { ThemeProvider } from '@/contexts/theme-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Task App',
  description: 'Task management app with Google Sheets integration',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}