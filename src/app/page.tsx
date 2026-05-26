'use client';

import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { TenantProvider } from '@/context/TenantContext';
import { DEFAULT_TENANT } from '@/lib/tenant-config';
import { ChatShell } from '@/components/chat/ChatShell';

export default function Home() {
  // The chat app is a fixed full-viewport shell: lock document scroll so only
  // its inner panes scroll. Marketing pages render without this class.
  useEffect(() => {
    const { documentElement, body } = document;
    documentElement.classList.add('chat-locked');
    body.classList.add('chat-locked');
    return () => {
      documentElement.classList.remove('chat-locked');
      body.classList.remove('chat-locked');
    };
  }, []);

  // Theme + tenant are scoped to the chat surface so the marketing site (which
  // is dark-only via shadcn tokens) is never affected by the chat theme toggle.
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false}>
      <TenantProvider config={DEFAULT_TENANT}>
        <ChatShell />
      </TenantProvider>
    </ThemeProvider>
  );
}
