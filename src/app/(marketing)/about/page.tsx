import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { Breadcrumbs, PageHero, Section, Prose, CtaBanner } from '@/components/marketing/primitives';

export const metadata: Metadata = pageMetadata({
  title: 'About Anna',
  description:
    'Anna is an AI mortgage guide built specifically for Scotland — explaining Home Reports, LBTT, offers over and the schemes available to Scottish buyers in plain English.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <>
      <Breadcrumbs crumbs={[{ name: 'About', path: '/about' }]} />
      <PageHero
        eyebrow="About"
        title="Mortgage help built for Scotland"
        subtitle="Buying a home in Scotland works differently. Anna explains the parts that trip people up — and gives you instant numbers to plan around."
      />
      <Section tight>
        <Prose>
          <p>
            Most mortgage tools are written for the English market. Scotland has its own legal
            process, its own purchase tax, and its own home-buying schemes. Anna was built to close
            that gap with guidance that is genuinely Scotland-first.
          </p>

          <h2>What Anna does</h2>
          <p>
            Anna combines a conversational assistant with a set of Scotland-aware calculators. You
            can ask a question in plain English — &ldquo;what is LBTT on a £260,000 flat in
            Edinburgh?&rdquo; — and get a clear answer, then run the exact figures yourself in the{' '}
            <Link href="/calculators">calculators</Link>.
          </p>
          <ul>
            <li>Explains the Scottish process: Home Reports, notes of interest, closing dates and missives.</li>
            <li>Calculates LBTT, including first-time buyer relief and the Additional Dwelling Supplement.</li>
            <li>Estimates affordability, repayments, loan-to-value, overpayments and remortgage savings.</li>
            <li>Summarises the Scottish Government <Link href="/schemes">home-buying schemes</Link>.</li>
            <li>Offers <Link href="/areas">local context</Link> for all 32 council areas.</li>
          </ul>

          <h2>How Anna is different</h2>
          <p>
            Everything is tuned for Scotland rather than retrofitted from an England-and-Wales tool.
            That means the tax is LBTT, not Stamp Duty; the survey is a Home Report; and the schemes
            are the Scottish ones. The aim is to help you arrive at a conversation with a lender or
            adviser already understanding the moving parts.
          </p>

          <h2>An honest note on advice</h2>
          <p>
            Anna gives <strong>general information and indicative calculations only</strong>. It is
            not regulated financial advice, it does not recommend specific products or lenders, and
            it cannot replace a qualified mortgage adviser. Always confirm figures and suitability
            with a regulated professional before committing.
          </p>
        </Prose>
      </Section>
      <CtaBanner />
    </>
  );
}
