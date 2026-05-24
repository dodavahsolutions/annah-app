import type { User } from '@supabase/supabase-js';

// Supabase auth normally responds in ~100ms. If it ever stalls (e.g. the
// project is paused or the network is degraded), an unbounded `getUser()`
// blocks the caller — in middleware that surfaces as a site-wide
// MIDDLEWARE_INVOCATION_TIMEOUT (504). This cap fails fast instead.
const DEFAULT_AUTH_TIMEOUT_MS = 3000;

// Minimal structural shape so this helper works with any Supabase client
// (edge `createServerClient`, node server client) without coupling to its
// generic type parameters.
interface AuthCapableClient {
  auth: { getUser: () => Promise<{ data: { user: User | null } }> };
}

/**
 * Resolves the current user, but never blocks longer than `timeoutMs`.
 * On timeout OR any error it resolves to `null` (treat the request as
 * anonymous) rather than throwing or hanging — so a slow/unavailable
 * Supabase degrades gracefully instead of taking the request down.
 */
export async function getUserWithTimeout(
  supabase: AuthCapableClient,
  timeoutMs: number = DEFAULT_AUTH_TIMEOUT_MS
): Promise<User | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`supabase.auth.getUser timed out after ${timeoutMs}ms`)),
        timeoutMs
      );
    });
    const { data } = await Promise.race([supabase.auth.getUser(), timeout]);
    return data.user;
  } catch (error) {
    console.error('[supabase] auth.getUser failed; treating request as anonymous:', error);
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
