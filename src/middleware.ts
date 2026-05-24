import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getUserWithTimeout } from '@/lib/supabase/auth-timeout';

// NOTE — Routing model is intentionally DEFAULT-ALLOW: every page is reachable
// anonymously (chat works as guest). This middleware only refreshes the
// Supabase session and redirects already-authed users away from /login and
// /signup. If you ever add a route that should be authenticated-only
// (/dashboard, /admin, /settings, …) you MUST add an explicit check here —
// otherwise it ships silently public.
export async function middleware(request: NextRequest) {
  // Skip Supabase session refresh if env vars aren't configured yet
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — do not remove, required for Supabase Auth to work.
  // Time-boxed: if Supabase stalls, fall back to anonymous so this middleware
  // never times out and 504s the whole site.
  const user = await getUserWithTimeout(supabase);

  // Redirect authenticated users away from auth pages to keep the UX clean.
  const { pathname } = request.nextUrl;
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
