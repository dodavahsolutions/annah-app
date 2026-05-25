'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, MessageCircle } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { MARKETING_NAV } from '@/content/nav';

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Annah home" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          {MARKETING_NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden bg-emerald-500 text-background hover:bg-emerald-600 sm:inline-flex">
            <Link href="/">
              <MessageCircle className="mr-1.5 h-4 w-4" />
              Ask Annah
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] border-l border-border bg-background p-0">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="flex flex-col gap-1 p-4 pt-6">
                {MARKETING_NAV.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    {link.label}
                  </Link>
                ))}
                <Button asChild className="mt-3 bg-emerald-500 text-background hover:bg-emerald-600">
                  <Link href="/" onClick={() => setOpen(false)}>
                    <MessageCircle className="mr-1.5 h-4 w-4" />
                    Ask Annah
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
