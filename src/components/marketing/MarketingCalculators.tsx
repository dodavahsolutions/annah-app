'use client';

import { Calculator, Percent, TrendingUp, PieChart, ArrowUpCircle, RefreshCw, Key, type LucideIcon } from 'lucide-react';
import { RepaymentCalculator } from '@/components/calculators/RepaymentCalculator';
import { LBTTCalculator } from '@/components/calculators/LBTTCalculator';
import { AffordabilityCalc } from '@/components/calculators/AffordabilityCalc';
import { LTVCalculator } from '@/components/calculators/LTVCalculator';
import { OverpaymentCalc } from '@/components/calculators/OverpaymentCalc';
import { RemortgageCalc } from '@/components/calculators/RemortgageCalc';
import { BTLCalculator } from '@/components/calculators/BTLCalculator';

interface CalcEntry {
  id: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
  Component: () => React.JSX.Element;
}

const CALCULATORS: readonly CalcEntry[] = [
  { id: 'repayment', title: 'Monthly Repayment', blurb: 'Estimate monthly payments and total interest over the term.', icon: Calculator, Component: RepaymentCalculator },
  { id: 'affordability', title: 'Affordability Check', blurb: 'See an indicative borrowing range from income and deposit.', icon: TrendingUp, Component: AffordabilityCalc },
  { id: 'lbtt', title: 'LBTT Calculator', blurb: 'Work out Land and Buildings Transaction Tax, including ADS.', icon: Percent, Component: LBTTCalculator },
  { id: 'ltv', title: 'LTV & Deposit', blurb: 'Find your loan-to-value and the deposit a price implies.', icon: PieChart, Component: LTVCalculator },
  { id: 'overpayment', title: 'Overpayment Savings', blurb: 'See how overpaying cuts interest and shortens the term.', icon: ArrowUpCircle, Component: OverpaymentCalc },
  { id: 'remortgage', title: 'Remortgage Compare', blurb: 'Compare your current deal against a new rate.', icon: RefreshCw, Component: RemortgageCalc },
  { id: 'btl', title: 'Buy-to-Let Yield', blurb: 'Estimate rental yield and monthly position for a let.', icon: Key, Component: BTLCalculator },
];

export function MarketingCalculators() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {CALCULATORS.map(({ id, title, blurb, icon: Icon, Component }) => (
        <article
          key={id}
          id={id}
          className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-card"
        >
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
              <Icon className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">{title}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{blurb}</p>
            </div>
          </div>
          <Component />
        </article>
      ))}
    </div>
  );
}
