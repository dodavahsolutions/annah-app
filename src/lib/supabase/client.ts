import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/** True when both public Supabase env vars are configured. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Returns null when the public Supabase env vars are absent, so the app
// degrades to guest-only instead of throwing at hydration. This mirrors the
// default-allow guard in src/middleware.ts and the guest-only contract in
// .env.local. Every caller guards with `if (!supabase)`. In production the
// vars are set in Vercel, so this returns a real client.
export function createClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createBrowserClient(url, anonKey);
}
