import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Service-role Supabase client. This key BYPASSES Row Level Security, so it
// must NEVER reach the browser. The `server-only` import above makes any
// accidental client-component import a build-time error, and the env var has
// no NEXT_PUBLIC_ prefix so it is never inlined into the client bundle.
//
// Use only for trusted server-side work: inserting/reading `leads`, syncing
// `profiles.plan` from the Stripe webhook, etc.

let cached: SupabaseClient | null = null;

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Set it in .env.local (development) or your deployment environment.`
    );
  }
  return value;
}

export function createAdminClient(): SupabaseClient {
  if (cached) return cached;

  cached = createClient(
    required('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    required('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
  return cached;
}
