import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { Breadcrumbs, PageHero, Section, CtaBanner } from '@/components/marketing/primitives';
import { SERVICES } from '@/content/services';

export const metadata: Metadata = pageMetadata({
  title: 'What Annah Helps With',
  description:
    'From Scotland mortgage guidance and instant calculators to LBTT estimates, document help and local area context — see everything Annah can do for Scottish home buyers.',
  path: '/services',
});

export default function ServicesPage() {
  return (
    <>
      <Breadcrumbs crumbs={[{ name: 'Services', path: '/services' }]} />
      <PageHero
        eyebrow="Services"
        title="Everything Annah helps with"
        subtitle="One place to understand the Scottish mortgage journey — guidance, numbers and local context, all free to use."
      />
      <Section tight>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, description, href }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-emerald-500/40 hover:shadow-card"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/20">
                <Icon className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
              </div>
              <h2 className="text-base font-semibold text-foreground">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </Link>
          ))}
        </div>
      </Section>
      <CtaBanner />
    </>
  );
}
