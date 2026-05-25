import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { JsonLd } from '@/components/marketing/JsonLd';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
