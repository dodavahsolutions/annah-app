import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { pageMetadata, localBusinessJsonLd } from '@/lib/seo';
import { Breadcrumbs, PageHero, Section, Prose, CtaBanner } from '@/components/marketing/primitives';
import { JsonLd } from '@/components/marketing/JsonLd';
import { COUNCIL_AREAS, type CouncilArea } from '@/content/areas';

interface AreaPageProps {
  params: Promise<{ slug: string }>;
}

// Statically generate a page for each of the 32 council areas at build time.
export function generateStaticParams() {
  return COUNCIL_AREAS.map((area) => ({ slug: area.slug }));
}

function findArea(slug: string): CouncilArea | undefined {
  return COUNCIL_AREAS.find((a) => a.slug === slug);
}

export async function generateMetadata({ params }: AreaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const area = findArea(slug);
  if (!area) return pageMetadata({ title: 'Area not found', description: '', path: `/areas/${slug}`, index: false });

  return pageMetadata({
    title: `Mortgages in ${area.name}`,
    description: `${area.intro} A local guide to mortgages, LBTT and buying a home in ${area.name}, Scotland.`,
    path: `/areas/${area.slug}`,
  });
}

export default async function AreaPage({ params }: AreaPageProps) {
  const { slug } = await params;
  const area = findArea(slug);
  if (!area) notFound();

  const path = `/areas/${area.slug}`;
  const townList = area.towns.join(', ');

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Areas', path: '/areas' },
          { name: area.name, path },
        ]}
      />
      <JsonLd
        data={localBusinessJsonLd({
          name: `Anna — Mortgage guidance in ${area.name}`,
          description: `${area.intro} ${area.marketNote}`,
          path,
          areaName: area.name,
        })}
      />
      <PageHero
        eyebrow={area.region}
        title={`Buying a home in ${area.name}`}
        subtitle={area.intro}
      >
        <p className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
          Key areas: {townList}
        </p>
      </PageHero>
      <Section tight>
        <Prose>
          <h2>The local market</h2>
          <p>{area.marketNote}</p>
          <p>
            Wherever you buy in {area.name}, the Scottish process is the same: most homes come with a{' '}
            <Link href="/glossary">Home Report</Link>, sales run through solicitors, and the purchase
            tax is <Link href="/glossary">LBTT</Link> rather than Stamp Duty. In competitive streets,
            expect &ldquo;offers over&rdquo; and budget for the gap between the valuation and the
            agreed price.
          </p>

          <h2>Work out your numbers for {area.name}</h2>
          <p>
            Before viewing in {townList.split(',')[0]} or elsewhere in {area.name}, sense-check what
            you can afford and what the tax will be:
          </p>
          <ul>
            <li>
              <Link href="/calculators#affordability">Affordability calculator</Link> — your
              indicative borrowing range.
            </li>
            <li>
              <Link href="/calculators#repayment">Repayment calculator</Link> — estimated monthly
              cost.
            </li>
            <li>
              <Link href="/calculators#lbtt">LBTT calculator</Link> — the Scottish purchase tax,
              including the Additional Dwelling Supplement.
            </li>
          </ul>

          <h2>Schemes that may help</h2>
          <p>
            Buyers across {area.region} can explore the Scottish Government&rsquo;s{' '}
            <Link href="/schemes">home-buying schemes</Link>, which can reduce the deposit or amount
            you need to borrow. Availability and eligibility change over time, so confirm what is
            currently open before relying on a scheme.
          </p>

          <p className="text-sm">
            This guide is general information about {area.name}, not regulated advice or a property
            valuation. Confirm figures with a qualified mortgage adviser.
          </p>
        </Prose>
      </Section>
      <CtaBanner
        title={`Have a question about buying in ${area.name}?`}
        body="Ask Anna about local prices, LBTT and affordability for a specific Scottish property."
      />
    </>
  );
}
