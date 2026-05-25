// Shared presentational primitives for marketing pages. Server-component safe
// (no hooks, no client directives). Keeps page files focused on content.

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { JsonLd } from './JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  /** Tighter vertical rhythm for stacked sections. */
  tight?: boolean;
}

export function Section({ children, className, tight }: SectionProps) {
  return (
    <section className={cn('mx-auto w-full max-w-6xl px-4 sm:px-6', tight ? 'py-10' : 'py-16', className)}>
      {children}
    </section>
  );
}

interface Crumb {
  name: string;
  path: string;
}

export function Breadcrumbs({ crumbs }: { crumbs: readonly Crumb[] }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, ...crumbs])} />
      <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
          </li>
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={c.path} className="flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden />
                {isLast ? (
                  <span className="text-foreground" aria-current="page">
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.path} className="transition-colors hover:text-foreground">
                    {c.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHero({ eyebrow, title, subtitle, children }: PageHeroProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Atmospheric accent glow — purely decorative. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"
      />
      <div className="relative mx-auto w-full max-w-6xl px-4 pb-6 pt-12 sm:px-6">
        {eyebrow && (
          <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-300">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-4 max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{subtitle}</p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}

interface CtaBannerProps {
  title?: string;
  body?: string;
}

export function CtaBanner({
  title = 'Have a question about your mortgage?',
  body = 'Anna answers Scotland-specific mortgage questions instantly — free, no signup needed.',
}: CtaBannerProps) {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-teal-500/5 p-8 sm:p-12">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
        <p className="mt-3 max-w-xl text-muted-foreground">{body}</p>
        <Button asChild size="lg" className="mt-6 bg-emerald-500 text-background hover:bg-emerald-600">
          <Link href="/">Ask Anna now</Link>
        </Button>
      </div>
    </Section>
  );
}

/** Long-form readable content column with sensible defaults. */
export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'max-w-3xl space-y-4 text-base leading-relaxed text-muted-foreground',
        '[&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground',
        '[&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground',
        '[&_strong]:text-foreground [&_a]:text-emerald-400 [&_a]:underline-offset-2 hover:[&_a]:underline',
        '[&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_li]:marker:text-emerald-500/70',
        className,
      )}
    >
      {children}
    </div>
  );
}
