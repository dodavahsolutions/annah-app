import type { Metadata, Viewport } from 'next';
import { Lora } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

// "Trustworthy editorial" serif for the chat surface — section headings and
// AI chat responses. Exposed as the --font-display CSS var; only the chat
// design system references it (marketing stays on Inter). Loaded via next/font
// (the repo convention) rather than an @import so it's self-hosted and
// preloaded with no extra render-blocking request.
const lora = Lora({
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Annah – Scotland Mortgage Guidance Tool',
  description: 'AI-powered mortgage guidance tool specialising in Scotland',
};

// viewport-fit=cover lets the chat input clear the mobile gesture/nav bar via
// env(safe-area-inset-bottom); without it those insets resolve to 0 and the
// input sits flush against the device's home indicator.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={lora.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
