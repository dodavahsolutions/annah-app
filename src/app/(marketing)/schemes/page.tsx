import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, articleJsonLd } from '@/lib/seo';
import { Breadcrumbs, PageHero, Section, Prose, CtaBanner } from '@/components/marketing/primitives';
import { JsonLd } from '@/components/marketing/JsonLd';
import { SCHEMES } from '@/content/schemes';

export const metadata: Metadata = pageMetadata({
  title: 'Scottish Home-Buying Schemes Explained',
  description:
    'A plain-English guide to Scotland\'s home-buying schemes — Help to Buy, the LIFT shared-equity schemes, the First Home Fund and Right to Buy — and who they are designed for.',
  path: '/schemes',
});

// Deeper per-scheme content for the pillar page, keyed to the shared SCHEMES data.
const SCHEME_DETAIL: Record<string, { who: string; how: string }> = {
  'help-to-buy': {
    who: 'Buyers of a new-build home who need help bridging the deposit gap.',
    how: 'The government took an equity stake in the property, reducing the mortgage and deposit required. Schemes like this open and close over time, so always check current availability.',
  },
  'lift-open-market': {
    who: 'Priority groups and first-time buyers purchasing on the open market.',
    how: 'The government funds a share of the purchase price and holds a corresponding equity stake, lowering the amount you need to borrow and deposit.',
  },
  'lift-nsse': {
    who: 'Buyers purchasing a newly built home from a housing association or council.',
    how: 'A shared-equity arrangement on new-supply homes, with the public stake reducing your upfront and monthly costs.',
  },
  'first-home-fund': {
    who: 'First-time buyers needing a contribution toward a first home.',
    how: 'Provided a shared-equity contribution to top up a deposit. As with all schemes, funding rounds and eligibility change.',
  },
  'right-to-buy': {
    who: 'Eligible council or housing-association tenants in qualifying circumstances.',
    how: 'Allowed certain tenants to buy the home they rent, sometimes at a discount. The scheme has been ended for new applicants in Scotland — included here for context.',
  },
};

export default function SchemesPage() {
  return (
    <>
      <Breadcrumbs crumbs={[{ name: 'Schemes', path: '/schemes' }]} />
      <JsonLd
        data={articleJsonLd({
          headline: 'Scottish home-buying schemes explained',
          description:
            'A guide to Scotland\'s home-buying schemes including Help to Buy, LIFT shared equity, the First Home Fund and Right to Buy.',
          path: '/schemes',
          datePublished: '2026-05-25',
        })}
      />
      <PageHero
        eyebrow="Pillar guide"
        title="Scottish home-buying schemes, explained"
        subtitle="Scotland has run several schemes to help people onto the property ladder. Here's what each one was for and who it suited — in plain English."
      />
      <Section tight>
        <Prose>
          <p>
            Government home-buying schemes can lower the deposit you need or reduce how much you have
            to borrow. They open, change and close over time, so treat the descriptions below as
            general context and always confirm what is currently available before relying on a
            scheme. For the tax side of any purchase, see our{' '}
            <Link href="/calculators#lbtt">LBTT calculator</Link>.
          </p>
        </Prose>

        <div className="mt-10 space-y-6">
          {SCHEMES.map((scheme) => {
            const detail = SCHEME_DETAIL[scheme.id];
            return (
              <article
                key={scheme.id}
                id={scheme.id}
                className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 sm:p-8"
              >
                <h2 className="text-xl font-bold tracking-tight text-foreground">{scheme.label}</h2>
                <p className="mt-2 text-muted-foreground">{scheme.summary}</p>
                {detail && (
                  <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                        Who it&rsquo;s for
                      </dt>
                      <dd className="mt-1 text-sm text-muted-foreground">{detail.who}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                        How it works
                      </dt>
                      <dd className="mt-1 text-sm text-muted-foreground">{detail.how}</dd>
                    </div>
                  </dl>
                )}
              </article>
            );
          })}
        </div>

        <Prose className="mt-10">
          <h2>How to use a scheme in practice</h2>
          <p>
            Schemes work alongside a normal mortgage, not instead of one — you&rsquo;ll still need a
            deposit and a lender willing to lend. Start by checking eligibility, then model the
            numbers: use the <Link href="/calculators#affordability">affordability calculator</Link>{' '}
            to see your borrowing range and the{' '}
            <Link href="/calculators#repayment">repayment calculator</Link> for monthly cost.
          </p>
          <p>
            Scheme rules and availability are set by the Scottish Government and can change without
            notice. This page is general information, not advice — confirm current schemes and your
            eligibility with the official source or a qualified adviser.
          </p>
        </Prose>
      </Section>
      <CtaBanner
        title="Wondering if a scheme fits your situation?"
        body="Ask Anna about Scottish home-buying schemes and how they interact with deposit, LBTT and affordability."
      />
    </>
  );
}
