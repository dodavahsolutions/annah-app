import type { RepaymentParams, LBTTParams, AffordabilityParams, LTVParams } from '@/types';

export function calculateMonthlyRepayment(params: RepaymentParams): number {
  const { loanAmount, interestRate, termYears } = params;
  
  if (loanAmount <= 0 || interestRate < 0 || termYears <= 0) {
    return 0;
  }
  
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = termYears * 12;
  
  if (monthlyRate === 0) {
    return loanAmount / numberOfPayments;
  }
  
  const monthlyPayment = 
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  return Math.round(monthlyPayment * 100) / 100;
}

export function calculateTotalRepayable(params: RepaymentParams): number {
  const monthlyPayment = calculateMonthlyRepayment(params);
  return Math.round(monthlyPayment * params.termYears * 12 * 100) / 100;
}

export function calculateTotalInterest(params: RepaymentParams): number {
  const totalRepayable = calculateTotalRepayable(params);
  return Math.round((totalRepayable - params.loanAmount) * 100) / 100;
}

interface LBTTBand {
  threshold: number;
  rate: number;
}

const LBTT_BANDS: LBTTBand[] = [
  { threshold: 145000, rate: 0 },
  { threshold: 250000, rate: 0.02 },
  { threshold: 325000, rate: 0.05 },
  { threshold: 750000, rate: 0.1 },
  { threshold: Infinity, rate: 0.12 },
];

const FTB_RELIEF_THRESHOLD = 175000;

export interface LBTTBreakdown {
  band: string;
  amount: number;
  rate: number;
  tax: number;
}

export function calculateLBTT(params: LBTTParams): { total: number; breakdown: LBTTBreakdown[] } {
  const { purchasePrice, isFirstTimeBuyer } = params;
  
  if (purchasePrice <= 0) {
    return { total: 0, breakdown: [] };
  }
  
  // First-time buyer relief
  if (isFirstTimeBuyer && purchasePrice <= FTB_RELIEF_THRESHOLD) {
    return { total: 0, breakdown: [{ band: 'Up to £175,000', amount: purchasePrice, rate: 0, tax: 0 }] };
  }
  
  let remainingPrice = purchasePrice;
  let previousThreshold = 0;
  const breakdown: LBTTBreakdown[] = [];
  let totalTax = 0;
  
  for (const band of LBTT_BANDS) {
    if (remainingPrice <= 0) break;
    
    const bandAmount = Math.min(remainingPrice, band.threshold - previousThreshold);
    const taxForBand = bandAmount * band.rate;
    
    if (bandAmount > 0) {
      breakdown.push({
        band: band.threshold === Infinity 
          ? `Over £${previousThreshold.toLocaleString()}` 
          : `£${previousThreshold.toLocaleString()} - £${band.threshold.toLocaleString()}`,
        amount: bandAmount,
        rate: band.rate,
        tax: Math.round(taxForBand * 100) / 100,
      });
      totalTax += taxForBand;
    }
    
    remainingPrice -= bandAmount;
    previousThreshold = band.threshold;
  }
  
  return { total: Math.round(totalTax * 100) / 100, breakdown };
}

export function calculateAffordability(params: AffordabilityParams): {
  maxBorrowing: number;
  maxPropertyPrice: number;
  incomeMultiplier: number;
} {
  const { annualIncome, deposit } = params;
  
  if (annualIncome <= 0) {
    return { maxBorrowing: 0, maxPropertyPrice: deposit, incomeMultiplier: 4.5 };
  }
  
  const incomeMultiplier = 4.5;
  const maxBorrowing = annualIncome * incomeMultiplier;
  const maxPropertyPrice = maxBorrowing + deposit;
  
  return {
    maxBorrowing: Math.round(maxBorrowing),
    maxPropertyPrice: Math.round(maxPropertyPrice),
    incomeMultiplier,
  };
}

export function calculateLTV(params: LTVParams): {
  ltv: number;
  loanAmount: number;
  depositPercentage: number;
} {
  const { propertyPrice, deposit } = params;
  
  if (propertyPrice <= 0) {
    return { ltv: 0, loanAmount: 0, depositPercentage: 0 };
  }
  
  const loanAmount = Math.max(0, propertyPrice - deposit);
  const ltv = (loanAmount / propertyPrice) * 100;
  const depositPercentage = (deposit / propertyPrice) * 100;
  
  return {
    ltv: Math.round(ltv * 10) / 10,
    loanAmount: Math.round(loanAmount),
    depositPercentage: Math.round(depositPercentage * 10) / 10,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
