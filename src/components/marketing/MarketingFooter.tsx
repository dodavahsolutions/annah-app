import Link from 'next/link';
import { MARKETING_NAV } from '@/content/nav';
import { SITE } from '@/lib/seo';

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground">{SITE.name}</span>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {SITE.tagline}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {SITE.description}
            </p>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground">Explore</h2>
            {MARKETING_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground">Resources</h2>
            <Link href="/glossary" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Mortgage glossary
            </Link>
            <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Chat with Anna
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-border/60 pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Anna provides general information and calculators only. It is not regulated financial
            advice and does not recommend specific products or lenders. Always confirm figures with a
            qualified mortgage adviser before making decisions. LBTT is administered by Revenue
            Scotland.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">© {year} {SITE.legalName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
