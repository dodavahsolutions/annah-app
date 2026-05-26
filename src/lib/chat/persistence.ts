import { createClient } from '@/lib/supabase/client';
import type { Conversation, Message } from '@/types/chat';

// Supabase persistence for signed-in chat history. All calls are best-effort:
// when Supabase is unconfigured (guest-only) or a write fails, chat still works
// in-memory/localStorage. RLS on `sessions`/`messages` scopes rows to auth.uid().

export async function createRemoteSession(
  userId: string,
  title: string
): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('sessions')
      .insert({ user_id: userId, title: title.slice(0, 80) })
      .select('id')
      .single();
    if (error || !data) return null;
    return data.id as string;
  } catch {
    return null;
  }
}

export async function persistRemoteMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;
  try {
    await supabase.from('messages').insert({ session_id: sessionId, role, content });
    // Bump updated_at so the most-recent ordering on next load is correct.
    await supabase
      .from('sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId);
  } catch {
    // best-effort
  }
}

export async function loadRemoteHistory(userId: string): Promise<Conversation[]> {
  const supabase = createClient();
  if (!supabase) return [];
  try {
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, title, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (!sessions || sessions.length === 0) return [];

    const ids = sessions.map((s) => s.id as string);
    const { data: rows } = await supabase
      .from('messages')
      .select('id, session_id, role, content, created_at')
      .in('session_id', ids)
      .order('created_at', { ascending: true });

    const bySession = new Map<string, Message[]>();
    for (const r of rows ?? []) {
      const sid = r.session_id as string;
      const list = bySession.get(sid) ?? [];
      list.push({
        id: String(r.id),
        role: r.role as 'user' | 'assistant',
        content: r.content as string,
        timestamp: new Date(r.created_at as string).getTime(),
      });
      bySession.set(sid, list);
    }

    return sessions.map((s) => {
      const id = s.id as string;
      return {
        id,
        remoteId: id,
        title: (s.title as string) || 'Conversation',
        messages: bySession.get(id) ?? [],
        createdAt: new Date(s.created_at as string).getTime(),
        updatedAt: new Date(s.updated_at as string).getTime(),
      };
    });
  } catch {
    return [];
  }
}
