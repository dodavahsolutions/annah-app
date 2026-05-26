'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/store/useStore';
import { loadRemoteHistory } from '@/lib/chat/persistence';

// On sign-in (or first mount while authed), load the user's Supabase chat
// history into the store so the sidebar reflects saved conversations across
// devices. Runs once per user id; no-op for guests (and when remote is empty,
// so local guest conversations aren't wiped).
export function useChatHistory(): void {
  const { user } = useAuth();
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user || loadedFor.current === user.id) return;
    loadedFor.current = user.id;

    let cancelled = false;
    void (async () => {
      const conversations = await loadRemoteHistory(user.id);
      if (!cancelled && conversations.length > 0) {
        useStore.getState().hydrateConversations(conversations);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);
}
