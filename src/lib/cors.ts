// Shared CORS header builder for API routes. Same-origin requests from our own
// app carry no Origin header (fine — we just don't echo one back). We only ever
// reflect an Origin when it exactly matches the configured site URL, so a
// tampered/foreign origin is never granted access.
export function buildCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = process.env.NEXT_PUBLIC_SITE_URL || '';
  const allowOrigin = origin && allowed && origin === allowed ? origin : '';
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
  if (allowOrigin) headers['Access-Control-Allow-Origin'] = allowOrigin;
  return headers;
}
