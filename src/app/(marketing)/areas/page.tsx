import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';
import { Breadcrumbs, PageHero, Section, CtaBanner } from '@/components/marketing/primitives';
import { COUNCIL_AREAS, type CouncilArea } from '@/content/areas';

export const metadata: Metadata = pageMetadata({
  title: 'Mortgage Guides by Area',
  description:
    'Local mortgage and home-buying context for all 32 Scottish council areas — from Edinburgh and Glasgow to the Highlands and islands.',
  path: '/areas',
});

// Group areas by region, preserving a sensible regional order.
const REGION_ORDER = [
  'East',
  'Greater Glasgow',
  'Central',
  'West',
  'North East',
  'South West',
  'South East',
  'Highlands',
  'West Highlands & Islands',
  'Islands',
];

function groupByRegion(areas: readonly CouncilArea[]): [string, CouncilArea[]][] {
  const groups = new Map<string, CouncilArea[]>();
  for (const area of areas) {
    const bucket = groups.get(area.region) ?? [];
    bucket.push(area);
    groups.set(area.region, bucket);
  }
  return [...groups.entries()].sort(
    ([a], [b]) => (REGION_ORDER.indexOf(a) + 1 || 99) - (REGION_ORDER.indexOf(b) + 1 || 99),
  );
}

export default function AreasPage() {
  const grouped = groupByRegion(COUNCIL_AREAS);

  return (
    <>
      <Breadcrumbs crumbs={[{ name: 'Areas', path: '/areas' }]} />
      <PageHero
        eyebrow="32 council areas"
        title="Mortgage guides across Scotland"
        subtitle="Pick your council area for local buying context — market character, key towns and how the Scottish process plays out near you."
      />
      <Section tight>
        <div className="space-y-12">
          {grouped.map(([region, areas]) => (
            <section key={region} aria-labelledby={`region-${region}`}>
              <h2 id={`region-${region}`} className="mb-4 text-sm font-semibold uppercase tracking-wide text-emerald-300">
                {region}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {areas.map((area) => (
                  <Link
                    key={area.slug}
                    href={`/areas/${area.slug}`}
                    className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-emerald-500/40 hover:shadow-card"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                      <h3 className="text-base font-semibold text-foreground">{area.name}</h3>
                    </div>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{area.intro}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-400">
                      View guide
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Section>
      <CtaBanner />
    </>
  );
}
