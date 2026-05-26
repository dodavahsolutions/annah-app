import type { Metadata } from 'next';
import { DM_Serif_Display } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

// Display font for the chat surface (headings/avatars). Exposed as the
// --font-display CSS var; only the chat design system references it.
const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Annah – Scotland Mortgage Advisor',
  description: 'AI-powered mortgage advisor specialising in Scotland',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={dmSerif.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
