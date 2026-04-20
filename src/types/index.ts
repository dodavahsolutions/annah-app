export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Source[];
  citations?: string[];
}

export interface Source {
  title: string;
  url?: string;
}

export interface RepaymentParams {
  loanAmount: number;
  interestRate: number;
  termYears: number;
}

export interface LBTTParams {
  purchasePrice: number;
  isFirstTimeBuyer: boolean;
  isAdditionalProperty?: boolean;
}

export interface AffordabilityParams {
  annualIncome: number;
  partnerIncome?: number;
  deposit: number;
  monthlyCommitments?: number;
  stressRate?: number;
  termYears?: number;
}

export interface LTVParams {
  propertyPrice: number;
  deposit: number;
}

export interface OverpaymentParams {
  balance: number;
  rate: number;
  termYears: number;
  monthlyOverpayment: number;
  ercPct: number;
}

export interface RemortgageParams {
  balance: number;
  termYears: number;
  currentRate: number;
  newRate: number;
  fees: number;
  erc: number;
}

export interface BTLParams {
  propertyValue: number;
  loanAmount: number;
  rate: number;
  monthlyRent: number;
  monthlyCosts: number;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  area: string;
  isFirstTimeBuyer: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  prompt?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}
