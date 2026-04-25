import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ANNA_SYSTEM_PROMPT } from '@/lib/anna';
import { checkAnnaRateLimit, getClientIp } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';

const MAX_MESSAGE_CHARS = 4000;
const MAX_MESSAGES = 40;
const MAX_DOC_CONTEXT_CHARS = 60_000;

// Strict, server-enforced schema. The system prompt is NEVER client-controlled.
const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(MAX_MESSAGE_CHARS),
      })
    )
    .min(1)
    .max(MAX_MESSAGES),
  docContext: z.string().max(MAX_DOC_CONTEXT_CHARS).optional(),
  firstName: z.string().max(60).optional(),
  max_tokens: z.number().int().min(1).max(1500).optional(),
});

// Strip control chars and brackets that could be used to forge a fake system
// turn. Lives server-side so a tampered client cannot bypass it.
function sanitizeFirstName(raw: string): string {
  return raw
    .replace(/[\r\n\t]/g, ' ')
    .replace(/[\[\]<>{}`]/g, '')
    .trim()
    .slice(0, 60);
}

function buildCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = process.env.NEXT_PUBLIC_SITE_URL || '';
  // Same-origin requests from our own app have no Origin header, which is fine.
  // Only echo the origin back if it matches our configured site URL.
  const allowOrigin = origin && allowed && origin === allowed ? origin : '';
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
  if (allowOrigin) headers['Access-Control-Allow-Origin'] = allowOrigin;
  return headers;
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: buildCorsHeaders(req.headers.get('origin')) });
}

export async function POST(req: NextRequest) {
  const cors = buildCorsHeaders(req.headers.get('origin'));

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500, headers: cors });
  }

  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  } catch {
    userId = null;
  }

  const ip = getClientIp(req.headers);
  const rl = await checkAnnaRateLimit({ userId, ip });
  if (rl && !rl.success) {
    const retryAfterSec = Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000));
    return NextResponse.json(
      {
        error: {
          code: 'rate_limited',
          message: userId
            ? 'Too many requests. Please wait a moment before sending more messages.'
            : 'Too many requests from this IP. Sign in for a higher limit.',
        },
      },
      {
        status: 429,
        headers: {
          ...cors,
          'Retry-After': String(retryAfterSec),
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rl.reset / 1000)),
        },
      }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: cors });
  }

  const parsed = requestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400, headers: cors });
  }

  const { messages, docContext, firstName, max_tokens } = parsed.data;

  // Document context is client-supplied but purely informational — it is concatenated
  // after the hard-coded system prompt and capped in size. The system prompt itself
  // is NEVER controlled by the client.
  const safeDocContext = docContext ?? '';
  const safeFirstName = firstName ? sanitizeFirstName(firstName) : '';
  const maxTokensNum = max_tokens ?? 1000;

  const wantsStream = req.nextUrl.searchParams.get('stream') === '1';

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokensNum,
        stream: wantsStream,
        system: [
          {
            type: 'text',
            text: ANNA_SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
          ...(safeFirstName
            ? [
                {
                  type: 'text' as const,
                  text: `The user's first name is ${safeFirstName}. Greet them warmly by first name on your next reply.`,
                },
              ]
            : []),
          ...(safeDocContext
            ? [{ type: 'text' as const, text: safeDocContext }]
            : []),
        ],
        messages,
      }),
    });

    if (!wantsStream) {
      const data = await anthropicResponse.json();
      return NextResponse.json(data, { status: anthropicResponse.status, headers: cors });
    }

    if (!anthropicResponse.ok || !anthropicResponse.body) {
      // Log details server-side; do NOT echo upstream payload to the client
      // (it can leak provider internals or auth hints).
      console.error('Anthropic upstream error', anthropicResponse.status);
      return NextResponse.json(
        { error: 'Upstream service unavailable. Please try again shortly.' },
        { status: 502, headers: cors }
      );
    }

    // Pass the Anthropic SSE stream straight through. The client parses
    // `content_block_delta` events to assemble the assistant message.
    return new NextResponse(anthropicResponse.body, {
      status: 200,
      headers: {
        ...cors,
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    console.error('Proxy error:', err);
    return NextResponse.json({ error: 'Failed to reach Anthropic API' }, { status: 502, headers: cors });
  }
}
