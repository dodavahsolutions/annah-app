import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildCorsHeaders } from '@/lib/cors';
import { checkLeadRateLimit, getClientIp } from '@/lib/rate-limit';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { getUserWithTimeout } from '@/lib/supabase/auth-timeout';
import { scoreLead, LEAD_TIMELINES } from '@/lib/lead-scoring';

// Consent text is recorded verbatim alongside each lead for the GDPR audit log.
const DEFAULT_CONSENT_TEXT =
  'I consent to ANNAH sharing my details with a regulated mortgage broker partner so they can contact me about my enquiry.';

const requestSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional(),
  purchaseArea: z.string().max(120).optional(),
  budget: z.number().int().min(0).max(100_000_000).optional(),
  timeline: z.enum(LEAD_TIMELINES as unknown as [string, ...string[]]).optional(),
  schemeInterest: z.array(z.string().max(60)).max(20).optional(),
  engagementMessages: z.number().int().min(0).max(1000).optional(),
  hasUploadedDoc: z.boolean().optional(),
  // Consent must be explicitly granted — a false/missing value is rejected.
  consent: z.literal(true),
  consentText: z.string().max(500).optional(),
});

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(req.headers.get('origin')),
  });
}

export async function POST(req: NextRequest) {
  const cors = buildCorsHeaders(req.headers.get('origin'));
  const ip = getClientIp(req.headers);

  // Spam/abuse guard. Anonymous by design, so this is per-IP.
  const rl = await checkLeadRateLimit(ip);
  if (rl && !rl.success) {
    const retryAfterSec = Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000));
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Too many submissions. Please wait a moment and try again.' },
      { status: 429, headers: { ...cors, 'Retry-After': String(retryAfterSec) } }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Invalid JSON body' },
      { status: 400, headers: cors }
    );
  }

  const parsed = requestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Please check the form and try again.' },
      { status: 400, headers: cors }
    );
  }

  const input = parsed.data;

  // Associate the lead with a user when one is signed in; guests are allowed
  // (user_id stays null). Auth is time-boxed so a slow Supabase can't hang us.
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const user = await getUserWithTimeout(supabase);
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }

  // Score is computed server-side from validated signals — never trusted from
  // the client.
  const timeline = (input.timeline ?? 'browsing') as (typeof LEAD_TIMELINES)[number];
  const schemeInterest = input.schemeInterest ?? [];
  const score = scoreLead({
    budget: input.budget ?? 0,
    timeline,
    engagementMessages: input.engagementMessages ?? 0,
    schemeInterest,
    hasUploadedDoc: input.hasUploadedDoc ?? false,
  });

  const admin = createAdminClient();
  const { data: lead, error } = await admin
    .from('leads')
    .insert({
      user_id: userId,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      purchase_area: input.purchaseArea ?? null,
      budget: input.budget ?? null,
      timeline,
      scheme_interest: schemeInterest,
      score,
      engagement_messages: input.engagementMessages ?? 0,
      consent: true,
      consent_text: input.consentText ?? DEFAULT_CONSENT_TEXT,
      consent_at: new Date().toISOString(),
      source_ip: ip,
    })
    .select('id')
    .single();

  if (error || !lead) {
    console.error('[leads] insert failed:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'We could not save your details. Please try again shortly.' },
      { status: 500, headers: cors }
    );
  }

  // Hand off to the broker CRM if a webhook is configured. Best-effort — a
  // webhook failure must not fail the user's submission (the lead is already
  // persisted and can be replayed).
  await forwardToCrm({
    id: lead.id as string,
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    purchaseArea: input.purchaseArea ?? null,
    budget: input.budget ?? null,
    timeline,
    schemeInterest,
    score,
  });

  // NOTE: confirmation email to the user is wired in Sprint C (Resend).

  return NextResponse.json<ApiResponse<{ id: string }>>(
    { success: true, data: { id: lead.id as string } },
    { status: 201, headers: cors }
  );
}

async function forwardToCrm(payload: Record<string, unknown>): Promise<void> {
  const webhook = process.env.LEADS_WEBHOOK;
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[leads] CRM webhook failed (lead is saved, will not retry inline):', err);
  }
}
