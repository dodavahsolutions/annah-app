import { NextRequest, NextResponse } from 'next/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500, headers: CORS_HEADERS });
  }

  const { messages, system, max_tokens } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Missing messages' }, { status: 400, headers: CORS_HEADERS });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: Math.min(Number(max_tokens) || 1000, 1000),
        system,
        messages,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status, headers: CORS_HEADERS });
  } catch (err) {
    console.error('Proxy error:', err);
    return NextResponse.json({ error: 'Failed to reach Anthropic API' }, { status: 502, headers: CORS_HEADERS });
  }
}
