import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Anna – Scotland Mortgage Advisor',
  description: 'AI-powered mortgage advisor specialising in Scotland',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
