import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Breadcrumbs, PageHero, Section, CtaBanner } from '@/components/marketing/primitives';
import { MarketingCalculators } from '@/components/marketing/MarketingCalculators';

export const metadata: Metadata = pageMetadata({
  title: 'Scotland Mortgage Calculators',
  description:
    'Free Scotland-aware mortgage calculators: monthly repayments, affordability, LBTT (with ADS), loan-to-value, overpayments, remortgaging and buy-to-let yield.',
  path: '/calculators',
});

export default function CalculatorsPage() {
  return (
    <>
      <Breadcrumbs crumbs={[{ name: 'Calculators', path: '/calculators' }]} />
      <PageHero
        eyebrow="7 free tools"
        title="Mortgage calculators for Scotland"
        subtitle="Run the numbers before you start house-hunting. Every calculator reflects Scottish rules — including LBTT and the Additional Dwelling Supplement. Results are indicative only."
      />
      <Section tight>
        <MarketingCalculators />
        <p className="mt-8 max-w-3xl text-sm text-muted-foreground">
          These calculators provide estimates for general guidance and are not a mortgage offer or
          regulated advice. Lenders assess affordability against their own criteria. Confirm any
          figures with a qualified mortgage adviser before making decisions.
        </p>
      </Section>
      <CtaBanner
        title="Not sure which number matters most?"
        body="Ask Annah to walk you through repayments, deposit and LBTT for a specific property in Scotland."
      />
    </>
  );
}
