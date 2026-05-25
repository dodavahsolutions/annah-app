// Mortgage & Scottish home-buying glossary. Rendered on /glossary, grouped A–Z.

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export const GLOSSARY_TERMS: readonly GlossaryTerm[] = [
  {
    term: 'Additional Dwelling Supplement (ADS)',
    definition:
      'An extra rate of LBTT charged when you buy an additional residential property in Scotland, such as a second home or buy-to-let, on top of standard LBTT.',
  },
  {
    term: 'Affordability assessment',
    definition:
      'A lender\'s check of whether you can sustainably afford repayments, based on income, outgoings, credit commitments and stress-tested interest rates.',
  },
  {
    term: 'Agreement in Principle (AIP)',
    definition:
      'An indication from a lender of how much they may be willing to lend, based on a soft check. It is not a formal mortgage offer but signals you are a credible buyer.',
  },
  {
    term: 'APRC',
    definition:
      'Annual Percentage Rate of Charge — the total yearly cost of a mortgage including interest and fees, used to compare deals on a like-for-like basis.',
  },
  {
    term: 'Buy-to-let',
    definition:
      'A mortgage for a property you intend to rent out rather than live in. Lending is usually assessed against expected rental income and a different set of rules applies.',
  },
  {
    term: 'Closing date',
    definition:
      'In Scotland, a deadline set by the seller\'s agent by which all interested buyers must submit their best offer. The seller then chooses which offer to accept.',
  },
  {
    term: 'Disposition',
    definition:
      'The Scottish legal deed that transfers ownership of a property from seller to buyer, registered in the Land Register of Scotland.',
  },
  {
    term: 'Early Repayment Charge (ERC)',
    definition:
      'A fee some lenders charge if you repay or overpay more than your deal allows, or remortgage, during a fixed or discounted period.',
  },
  {
    term: 'Fixed-rate mortgage',
    definition:
      'A mortgage where the interest rate is locked for a set period (commonly two to five years), so monthly payments stay the same during that time.',
  },
  {
    term: 'Help to Buy (Scotland)',
    definition:
      'A past Scottish Government equity-loan scheme that helped buyers purchase a new-build home with a smaller deposit. Availability of such schemes changes over time.',
  },
  {
    term: 'Home Report',
    definition:
      'A pack the seller provides for most Scottish homes, containing a single survey, a valuation, an energy performance certificate and a property questionnaire.',
  },
  {
    term: 'Land and Buildings Transaction Tax (LBTT)',
    definition:
      'The tax paid when buying property or land in Scotland above a threshold. Administered by Revenue Scotland and charged in progressive bands.',
  },
  {
    term: 'LIFT (Low-cost Initiative for First Time buyers)',
    definition:
      'A group of Scottish Government shared-equity schemes designed to help lower-income and first-time buyers purchase a home.',
  },
  {
    term: 'Loan-to-value (LTV)',
    definition:
      'The size of your mortgage as a percentage of the property value. A lower LTV usually means access to lower interest rates.',
  },
  {
    term: 'Missives',
    definition:
      'The series of formal letters exchanged between buyers\' and sellers\' solicitors in Scotland that together form the binding contract of sale.',
  },
  {
    term: 'Note of Interest',
    definition:
      'A message from a buyer\'s solicitor to the seller\'s agent registering interest in a property, often prompting the seller to set a closing date.',
  },
  {
    term: 'Offers over',
    definition:
      'A marketing term indicating the seller expects bids above the stated price, typically the Home Report valuation.',
  },
  {
    term: 'Overpayment',
    definition:
      'Paying more than your required monthly amount to reduce the balance faster, cutting total interest and potentially shortening the term.',
  },
  {
    term: 'Remortgage',
    definition:
      'Switching your existing mortgage to a new deal or lender, usually to secure a better rate, release equity or change the term.',
  },
  {
    term: 'Repayment mortgage',
    definition:
      'A mortgage where monthly payments cover both interest and capital, so the balance reduces to zero by the end of the term.',
  },
  {
    term: 'Standard Variable Rate (SVR)',
    definition:
      'The default interest rate a lender charges once an introductory fixed or discounted deal ends. It can change at the lender\'s discretion.',
  },
  {
    term: 'Stress test',
    definition:
      'A check lenders apply to ensure you could still afford repayments if interest rates rose, used as part of the affordability assessment.',
  },
] as const;
