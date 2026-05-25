import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Breadcrumbs, PageHero, Section, CtaBanner } from '@/components/marketing/primitives';
import { GLOSSARY_TERMS, type GlossaryTerm } from '@/content/glossary';

export const metadata: Metadata = pageMetadata({
  title: 'Mortgage Glossary for Scotland',
  description:
    'Plain-English definitions of Scottish mortgage and home-buying terms — LBTT, ADS, Home Report, missives, loan-to-value, offers over and more.',
  path: '/glossary',
});

// Group terms by first letter for an A–Z layout.
function groupByLetter(terms: readonly GlossaryTerm[]): [string, GlossaryTerm[]][] {
  const groups = new Map<string, GlossaryTerm[]>();
  for (const term of terms) {
    const letter = term.term[0].toUpperCase();
    const bucket = groups.get(letter) ?? [];
    bucket.push(term);
    groups.set(letter, bucket);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export default function GlossaryPage() {
  const grouped = groupByLetter(GLOSSARY_TERMS);

  return (
    <>
      <Breadcrumbs crumbs={[{ name: 'Glossary', path: '/glossary' }]} />
      <PageHero
        eyebrow="Glossary"
        title="Mortgage terms, in plain English"
        subtitle="The jargon you'll meet when buying a home in Scotland — defined simply, without the spin."
      />
      <Section tight>
        <div className="space-y-10">
          {grouped.map(([letter, terms]) => (
            <section key={letter} aria-labelledby={`glossary-${letter}`}>
              <h2
                id={`glossary-${letter}`}
                className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-lg font-bold text-emerald-300"
              >
                {letter}
              </h2>
              <dl className="grid gap-5 sm:grid-cols-2">
                {terms.map((t) => (
                  <div key={t.term} className="rounded-2xl border border-border bg-card p-5">
                    <dt className="text-base font-semibold text-foreground">{t.term}</dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t.definition}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </Section>
      <CtaBanner />
    </>
  );
}
