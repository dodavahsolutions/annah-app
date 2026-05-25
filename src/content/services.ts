// Service offerings shown on /services. Maps to Annah's core capabilities.

import {
  Calculator,
  FileText,
  Home,
  MapPin,
  RefreshCw,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

export interface ServiceItem {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Where the service points the user. */
  href: string;
}

export const SERVICES: readonly ServiceItem[] = [
  {
    icon: Home,
    title: 'Scotland mortgage guidance',
    description:
      'Plain-English answers about the Scottish buying process — Home Reports, offers over, missives and closing dates — without the jargon.',
    href: '/',
  },
  {
    icon: Calculator,
    title: 'Instant mortgage calculators',
    description:
      'Seven Scotland-aware calculators covering repayments, affordability, LBTT, LTV, overpayments, remortgaging and buy-to-let yield.',
    href: '/calculators',
  },
  {
    icon: TrendingUp,
    title: 'Affordability checks',
    description:
      'See an indicative borrowing range and monthly cost based on income, deposit and term before you start viewing homes.',
    href: '/calculators',
  },
  {
    icon: FileText,
    title: 'Document help',
    description:
      'Upload a Home Report or mortgage document and ask Annah to summarise the key figures and flag what to look at next.',
    href: '/',
  },
  {
    icon: MapPin,
    title: 'Local area guides',
    description:
      'Mortgage and buying context for all 32 Scottish council areas, from the islands to the central belt.',
    href: '/areas',
  },
  {
    icon: RefreshCw,
    title: 'Remortgage comparisons',
    description:
      'Compare your current deal against a new rate to estimate monthly savings and where the break-even point sits.',
    href: '/calculators',
  },
] as const;
