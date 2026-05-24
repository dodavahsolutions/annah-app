// Scottish Government home-buying schemes. Shared by the lead-capture
// scheme-interest picker (Sprint A) and the Schemes guide page (Sprint B).

export interface Scheme {
  /** Stable identifier stored against a lead's scheme_interest[]. */
  id: string;
  /** Display label. */
  label: string;
  /** One-line summary (used on the schemes guide). */
  summary: string;
}

export const SCHEMES: readonly Scheme[] = [
  {
    id: 'help-to-buy',
    label: 'Help to Buy (Scotland)',
    summary: 'Government equity loan toward a new-build home, reducing the deposit needed.',
  },
  {
    id: 'lift-open-market',
    label: 'LIFT — Open Market Shared Equity',
    summary: 'Buy a home on the open market with the government holding a shared-equity stake.',
  },
  {
    id: 'lift-nsse',
    label: 'LIFT — New Supply Shared Equity',
    summary: 'Shared-equity purchase of a newly built home from a housing association or council.',
  },
  {
    id: 'first-home-fund',
    label: 'First Home Fund',
    summary: 'A shared-equity contribution for first-time buyers toward a first home.',
  },
  {
    id: 'right-to-buy',
    label: 'Right to Buy',
    summary: 'Scheme allowing eligible council/housing-association tenants to buy their home.',
  },
] as const;
