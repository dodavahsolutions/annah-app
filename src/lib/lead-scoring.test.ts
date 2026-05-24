import { describe, expect, test } from 'vitest';
import { scoreLead, type LeadSignals } from './lead-scoring';

// A neutral baseline: lowest non-zero everything. Tests override one axis at a
// time so each assertion isolates a single scoring component.
const base: LeadSignals = {
  budget: 0,
  timeline: 'browsing',
  engagementMessages: 0,
  schemeInterest: [],
  hasUploadedDoc: false,
};

describe('scoreLead — budget component', () => {
  test('unknown/zero budget contributes nothing', () => {
    expect(scoreLead({ ...base, budget: 0 })).toBe(2); // timeline 'browsing' = 2
  });

  test('negative budget is treated as unknown', () => {
    expect(scoreLead({ ...base, budget: -5000 })).toBe(2);
  });

  test('budget brackets increase the score monotonically', () => {
    const at = (budget: number) => scoreLead({ ...base, budget });
    expect(at(50_000)).toBe(8 + 2);
    expect(at(150_000)).toBe(16 + 2);
    expect(at(250_000)).toBe(24 + 2);
    expect(at(350_000)).toBe(32 + 2);
    expect(at(600_000)).toBe(40 + 2);
  });

  test('exact bracket thresholds use the higher bracket', () => {
    expect(scoreLead({ ...base, budget: 500_000 })).toBe(40 + 2);
    expect(scoreLead({ ...base, budget: 100_000 })).toBe(16 + 2);
  });
});

describe('scoreLead — timeline urgency', () => {
  test('maps each timeline to its weight', () => {
    expect(scoreLead({ ...base, timeline: 'asap' })).toBe(30);
    expect(scoreLead({ ...base, timeline: '3m' })).toBe(24);
    expect(scoreLead({ ...base, timeline: '6m' })).toBe(16);
    expect(scoreLead({ ...base, timeline: '12m+' })).toBe(8);
    expect(scoreLead({ ...base, timeline: 'browsing' })).toBe(2);
  });
});

describe('scoreLead — engagement depth', () => {
  test('two points per message', () => {
    expect(scoreLead({ ...base, engagementMessages: 3 })).toBe(6 + 2);
  });

  test('caps at 20 points (10 messages)', () => {
    expect(scoreLead({ ...base, engagementMessages: 10 })).toBe(20 + 2);
    expect(scoreLead({ ...base, engagementMessages: 50 })).toBe(20 + 2);
  });

  test('zero/negative messages contribute nothing', () => {
    expect(scoreLead({ ...base, engagementMessages: 0 })).toBe(2);
    expect(scoreLead({ ...base, engagementMessages: -3 })).toBe(2);
  });
});

describe('scoreLead — bonuses', () => {
  test('scheme interest adds a flat 5', () => {
    expect(scoreLead({ ...base, schemeInterest: ['help-to-buy'] })).toBe(5 + 2);
    expect(scoreLead({ ...base, schemeInterest: ['lift', 'rtb'] })).toBe(5 + 2);
  });

  test('document upload adds a flat 5', () => {
    expect(scoreLead({ ...base, hasUploadedDoc: true })).toBe(5 + 2);
  });
});

describe('scoreLead — aggregate bounds', () => {
  test('a maxed-out lead scores exactly 100', () => {
    expect(
      scoreLead({
        budget: 750_000,
        timeline: 'asap',
        engagementMessages: 12,
        schemeInterest: ['help-to-buy'],
        hasUploadedDoc: true,
      })
    ).toBe(100);
  });

  test('a cold lead scores low but never negative', () => {
    expect(scoreLead(base)).toBe(2);
  });

  test('result is always within 0–100', () => {
    const score = scoreLead({
      budget: 9_999_999,
      timeline: 'asap',
      engagementMessages: 9999,
      schemeInterest: ['a', 'b', 'c'],
      hasUploadedDoc: true,
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
