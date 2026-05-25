// Scotland-focused mortgage FAQs. Rendered on /faq and emitted as FAQPage JSON-LD.
// Keep answers factual, plain-English and non-advisory (general information only).

export interface FaqItem {
  question: string;
  /** Plain-text answer (also used verbatim in FAQPage structured data). */
  answer: string;
}

export interface FaqCategory {
  id: string;
  title: string;
  items: readonly FaqItem[];
}

export const FAQ_CATEGORIES: readonly FaqCategory[] = [
  {
    id: 'buying-in-scotland',
    title: 'Buying a home in Scotland',
    items: [
      {
        question: 'How is buying a home in Scotland different from England?',
        answer:
          'Scotland uses its own legal process. Most sales go through solicitors, offers are usually made via a "Note of Interest" and a closing date, and the purchase tax is Land and Buildings Transaction Tax (LBTT) rather than Stamp Duty. Properties are often marketed as "offers over" a Home Report valuation.',
      },
      {
        question: 'What is a Home Report?',
        answer:
          'A Home Report is a pack the seller must provide for most residential properties in Scotland. It contains a single survey and valuation, an energy performance certificate, and a property questionnaire. Lenders often rely on the Home Report valuation when deciding how much to lend.',
      },
      {
        question: 'What does "offers over" mean?',
        answer:
          '"Offers over" signals the seller expects bids above the stated figure, which is usually the Home Report valuation. In competitive areas the agreed price can sit well above the asking figure, so buyers should budget for the gap between valuation and final price.',
      },
    ],
  },
  {
    id: 'lbtt',
    title: 'LBTT (the Scottish purchase tax)',
    items: [
      {
        question: 'What is LBTT?',
        answer:
          'Land and Buildings Transaction Tax (LBTT) is the tax paid when you buy a property or land in Scotland over a certain price. It is administered by Revenue Scotland and is charged in progressive bands, so you only pay each rate on the portion of the price within that band.',
      },
      {
        question: 'Is there first-time buyer relief in Scotland?',
        answer:
          'Yes. First-time buyers can claim relief that raises the point at which LBTT starts to apply, reducing the tax due on many typical purchases. The relief applies to the buyer\'s only or main residence.',
      },
      {
        question: 'What is the Additional Dwelling Supplement (ADS)?',
        answer:
          'ADS is an extra LBTT charge that applies when you buy an additional residential property, such as a second home or a buy-to-let, while keeping another. It is charged on top of standard LBTT on the full purchase price. Use Anna\'s LBTT calculator to estimate both figures.',
      },
    ],
  },
  {
    id: 'mortgages',
    title: 'Mortgages and affordability',
    items: [
      {
        question: 'How much can I borrow?',
        answer:
          'Lenders typically lend around four to four-and-a-half times annual income, adjusted for outgoings, credit commitments and the deposit. Affordability also depends on the interest rate and term. Anna\'s affordability calculator gives an indicative range so you can sense-check budgets early.',
      },
      {
        question: 'How big a deposit do I need?',
        answer:
          'Most residential mortgages need at least 5% to 10% of the purchase price as a deposit, with better rates usually available from 15% to 25%. Remember that in Scotland you may also need to fund the gap between the Home Report valuation and an "offers over" sale price.',
      },
      {
        question: 'What is loan-to-value (LTV)?',
        answer:
          'Loan-to-value is the size of your mortgage expressed as a percentage of the property value. A £180,000 mortgage on a £200,000 home is 90% LTV. Lower LTVs generally unlock lower interest rates because they are lower risk for the lender.',
      },
      {
        question: 'Should I overpay my mortgage?',
        answer:
          'Overpaying reduces the balance you pay interest on, which can shorten the term and cut total interest significantly. Many deals allow overpayments of up to 10% of the balance per year without penalty. Check your deal\'s limits and any early repayment charges first.',
      },
    ],
  },
  {
    id: 'about-anna',
    title: 'About Anna',
    items: [
      {
        question: 'Is Anna regulated financial advice?',
        answer:
          'No. Anna provides general information and indicative calculations to help you understand the Scottish mortgage process. It does not recommend specific products or lenders and is not a substitute for advice from a qualified, regulated mortgage adviser.',
      },
      {
        question: 'Does Anna cost anything?',
        answer:
          'Anna\'s chat assistant and calculators are free to use. You can ask questions and run estimates without creating an account.',
      },
    ],
  },
] as const;

/** Flat list for FAQPage JSON-LD. */
export const ALL_FAQS: readonly FaqItem[] = FAQ_CATEGORIES.flatMap((c) => c.items);
