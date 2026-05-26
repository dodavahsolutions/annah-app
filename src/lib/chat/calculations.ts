import { calculateLBTT } from "./lbtt"

// Pure B2C calculator math. LBTT lives in ./lbtt.ts; this covers the
// Affordability check and the First-Time Buyer Total Cost calculator. Other
// tools (repayment, BTL, overpayment, remortgage) are reserved for the B2B side.

export type CalculatorTool = "lbtt" | "affordability" | "totalcost"

export interface AffordabilityResult {
  maxBorrowing: number
  maxPropertyPrice: number
  incomeMultiplier: number
}

// Income-multiple affordability (typical 4.5x), plus deposit.
export function calculateAffordability(
  annualIncome: number,
  deposit: number,
  incomeMultiplier = 4.5
): AffordabilityResult {
  const income = Math.max(0, annualIncome)
  const dep = Math.max(0, deposit)
  if (income <= 0) {
    return { maxBorrowing: 0, maxPropertyPrice: dep, incomeMultiplier }
  }
  const maxBorrowing = income * incomeMultiplier
  return {
    maxBorrowing: Math.round(maxBorrowing),
    maxPropertyPrice: Math.round(maxBorrowing + dep),
    incomeMultiplier,
  }
}

// Estimated solicitor/conveyancing fee for a Scottish residential purchase
// (legal fee + outlays/searches, incl. VAT). Indicative — firms vary ~£900–1,500.
export const LEGAL_FEES_ESTIMATE = 1200

// Registers of Scotland registration dues for a disposition, by price band.
// Source: The Registers of Scotland (Fees) Amendment Order 2021 (in force 1 Apr 2021).
export function registrationDues(price: number): number {
  if (price <= 50_000) return 80
  if (price <= 100_000) return 140
  if (price <= 150_000) return 260
  if (price <= 200_000) return 400
  if (price <= 300_000) return 530
  if (price <= 500_000) return 660
  if (price <= 700_000) return 800
  if (price <= 1_000_000) return 930
  if (price <= 2_000_000) return 1100
  if (price <= 3_000_000) return 3300
  if (price <= 5_000_000) return 5500
  return 8250
}

export interface FTBCostLine {
  label: string
  amount: number
  note?: string
}

export interface FTBTotalCostResult {
  deposit: number
  lbtt: number
  legalFees: number
  registrationDues: number
  total: number
  mortgageNeeded: number
  lines: FTBCostLine[]
}

// First-Time Buyer Total Cost: the upfront cash a Scottish FTB needs —
// deposit + LBTT (with FTB relief) + estimated legal fees + RoS registration
// dues. (Home Report is seller-provided in Scotland; mortgage product fees vary
// and can often be added to the loan, so they're excluded from upfront cash.)
export function calculateFTBTotalCost(
  propertyPrice: number,
  deposit: number
): FTBTotalCostResult {
  const price = Math.max(0, Math.round(propertyPrice) || 0)
  const dep = Math.max(0, Math.min(Math.round(deposit) || 0, price))
  const lbtt = calculateLBTT(price, true).total
  const legalFees = price > 0 ? LEGAL_FEES_ESTIMATE : 0
  const reg = price > 0 ? registrationDues(price) : 0
  const total = dep + lbtt + legalFees + reg

  return {
    deposit: dep,
    lbtt,
    legalFees,
    registrationDues: reg,
    total,
    mortgageNeeded: Math.max(0, price - dep),
    lines: [
      { label: "Deposit", amount: dep },
      { label: "LBTT (FTB relief)", amount: lbtt },
      { label: "Legal fees (est.)", amount: legalFees },
      { label: "Registration dues", amount: reg },
    ],
  }
}
