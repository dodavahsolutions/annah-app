import type { Metadata } from 'next';
import { pageMetadata, faqPageJsonLd } from '@/lib/seo';
import { Breadcrumbs, PageHero, Section, CtaBanner } from '@/components/marketing/primitives';
import { JsonLd } from '@/components/marketing/JsonLd';
import { FaqAccordion } from '@/components/marketing/FaqAccordion';
import { FAQ_CATEGORIES, ALL_FAQS } from '@/content/faq';

export const metadata: Metadata = pageMetadata({
  title: 'Scotland Mortgage FAQ',
  description:
    'Answers to common questions about buying a home and getting a mortgage in Scotland — Home Reports, LBTT, deposits, affordability, offers over and more.',
  path: '/faq',
});

export default function FaqPage() {
  return (
    <>
      <Breadcrumbs crumbs={[{ name: 'FAQ', path: '/faq' }]} />
      <JsonLd data={faqPageJsonLd(ALL_FAQS)} />
      <PageHero
        eyebrow="FAQ"
        title="Scotland mortgage questions, answered"
        subtitle="The things buyers most often ask about mortgages and the Scottish home-buying process."
      />
      <Section tight>
        <FaqAccordion categories={FAQ_CATEGORIES} />
      </Section>
      <CtaBanner
        title="Still have a question?"
        body="Ask Anna directly — it answers Scotland-specific mortgage questions in plain English."
      />
    </>
  );
}
