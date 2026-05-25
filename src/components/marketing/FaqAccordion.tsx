'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { FaqCategory } from '@/content/faq';

export function FaqAccordion({ categories }: { categories: readonly FaqCategory[] }) {
  return (
    <div className="space-y-12">
      {categories.map((category) => (
        <section key={category.id} aria-labelledby={`faq-${category.id}`}>
          <h2 id={`faq-${category.id}`} className="mb-3 text-xl font-bold tracking-tight text-foreground">
            {category.title}
          </h2>
          <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-4">
            {category.items.map((item, i) => (
              <AccordionItem
                key={item.question}
                value={`${category.id}-${i}`}
                className="border-border/60 last:border-0"
              >
                <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ))}
    </div>
  );
}
