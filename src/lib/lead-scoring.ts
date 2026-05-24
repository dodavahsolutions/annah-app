// Lead scoring — a pure, deterministic 0–100 score used to prioritise leads
// handed to broker partners (plan §2.4). Kept side-effect free and dependency
// free so it is trivially unit-testable, mirroring src/lib/calculations.ts.
//
// The score MUST be computed server-side from validated input. Never trust a
// score sent by the client.

export type LeadTimeline = 'asap' | '3m' | '6m' | '12m+' | 'browsing';

export const LEAD_TIMELINES: readonly LeadTimeline[] = [
  'asap',
  '3m',
  '6m',
  '12m+',
  'browsing',
] as const;

export interface LeadSignals {
  /** Purchase budget in GBP. 0 or negative is treated as "unknown". */
  budget: number;
  /** How soon the buyer intends to act. */
  timeline: LeadTimeline;
  /** Number of user messages exchanged with Anna (engagement depth). */
  engagementMessages: number;
  /** Scheme codes the user expressed interest in (e.g. ['help-to-buy']). */
  schemeInterest: string[];
  /** Whether the user uploaded a document (pay slip, bank statement, etc.). */
  hasUploadedDoc: boolean;
}

// Component weights. The maxima sum to exactly 100:
// budget 40 + timeline 30 + engagement 20 + scheme 5 + doc 5.
const ENGAGEMENT_MAX = 20;
const SCHEME_BONUS = 5;
const DOC_BONUS = 5;

// Engagement: each user message is worth POINTS_PER_MESSAGE, capped.
const POINTS_PER_MESSAGE = 2;
const ENGAGEMENT_MESSAGE_CAP = ENGAGEMENT_MAX / POINTS_PER_MESSAGE; // 10 messages

// Budget brackets (GBP → points), highest first. A higher budget signals a
// more valuable, more serious lead.
const BUDGET_BRACKETS: ReadonlyArray<{ min: number; points: number }> = [
  { min: 500_000, points: 40 },
  { min: 300_000, points: 32 },
  { min: 200_000, points: 24 },
  { min: 100_000, points: 16 },
  { min: 1, points: 8 },
];

// Timeline urgency → points.
const TIMELINE_POINTS: Record<LeadTimeline, number> = {
  asap: 30,
  '3m': 24,
  '6m': 16,
  '12m+': 8,
  browsing: 2,
};

function scoreBudget(budget: number): number {
  if (!Number.isFinite(budget) || budget <= 0) return 0;
  const bracket = BUDGET_BRACKETS.find((b) => budget >= b.min);
  return bracket ? bracket.points : 0;
}

function scoreTimeline(timeline: LeadTimeline): number {
  return TIMELINE_POINTS[timeline] ?? 0;
}

function scoreEngagement(messages: number): number {
  if (!Number.isFinite(messages) || messages <= 0) return 0;
  const capped = Math.min(messages, ENGAGEMENT_MESSAGE_CAP);
  return Math.round(capped * POINTS_PER_MESSAGE);
}

/**
 * Compute a 0–100 lead quality score from buyer signals.
 * Weighted: budget (40) + timeline urgency (30) + engagement depth (20)
 * + scheme interest (5) + document upload (5).
 */
export function scoreLead(signals: LeadSignals): number {
  const budget = scoreBudget(signals.budget);
  const timeline = scoreTimeline(signals.timeline);
  const engagement = scoreEngagement(signals.engagementMessages);
  const scheme = signals.schemeInterest.length > 0 ? SCHEME_BONUS : 0;
  const doc = signals.hasUploadedDoc ? DOC_BONUS : 0;

  const total = budget + timeline + engagement + scheme + doc;
  return Math.max(0, Math.min(100, total));
}
