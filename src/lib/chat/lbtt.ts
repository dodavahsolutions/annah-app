export interface LBTTBand {
  from: number
  to: number | null
  rate: number
  tax: number
}

export interface LBTTResult {
  bands: LBTTBand[]
  total: number
  savedByRelief: number
}

interface BandDef {
  from: number
  to: number | null
  rate: number
}

// Standard LBTT thresholds (non first-time-buyer).
const STANDARD_BANDS: BandDef[] = [
  { from: 0, to: 145_000, rate: 0 },
  { from: 145_000, to: 250_000, rate: 0.02 },
  { from: 250_000, to: 325_000, rate: 0.05 },
  { from: 325_000, to: 750_000, rate: 0.1 },
  { from: 750_000, to: null, rate: 0.12 },
]

// First-time-buyer relief: 0% threshold lifted to £175,000.
const FTB_BANDS: BandDef[] = [
  { from: 0, to: 175_000, rate: 0 },
  { from: 175_000, to: 250_000, rate: 0.02 },
  { from: 250_000, to: 325_000, rate: 0.05 },
  { from: 325_000, to: 750_000, rate: 0.1 },
  { from: 750_000, to: null, rate: 0.12 },
]

function computeBands(price: number, defs: BandDef[]): LBTTBand[] {
  return defs.map((b) => {
    const upper = b.to ?? price
    const taxable = Math.max(0, Math.min(price, upper) - b.from)
    return { from: b.from, to: b.to, rate: b.rate, tax: Math.round(taxable * b.rate) }
  })
}

function totalOf(bands: LBTTBand[]): number {
  return bands.reduce((sum, b) => sum + b.tax, 0)
}

export function calculateLBTT(price: number, ftb: boolean): LBTTResult {
  const safePrice = Math.max(0, Math.round(price) || 0)
  const allBands = computeBands(safePrice, ftb ? FTB_BANDS : STANDARD_BANDS)
  const total = totalOf(allBands)

  const savedByRelief = ftb
    ? Math.max(0, totalOf(computeBands(safePrice, STANDARD_BANDS)) - total)
    : 0

  // Show charged bands. For FTB, keep the 0% relief band as the leading marker.
  const bands = allBands.filter(
    (b, i) => b.tax > 0 || (ftb && i === 0)
  )

  return { bands, total, savedByRelief }
}
