"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { useStore } from "@/store/useStore"
import { useSendMessage } from "@/hooks/useSendMessage"
import { useTenant } from "@/context/TenantContext"
import { calculateLBTT } from "@/lib/chat/lbtt"
import {
  calculateAffordability,
  calculateFTBTotalCost,
  type CalculatorTool,
} from "@/lib/chat/calculations"
import { cn } from "@/lib/chat/utils"

const gbp = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`

const TABS: { id: CalculatorTool; label: string }[] = [
  { id: "lbtt", label: "LBTT" },
  { id: "affordability", label: "Affordability" },
  { id: "totalcost", label: "Total cost" },
]

// Parse a £-formatted/free-typed string to a number.
const parseMoney = (s: string) => {
  const n = Number(s.replace(/[^0-9.]/g, ""))
  return Number.isFinite(n) ? n : 0
}

export function CalculatorPanel() {
  const open = useStore((s) => s.calculatorOpen)
  const tool = useStore((s) => s.calculatorTool)
  const setCalculatorOpen = useStore((s) => s.setCalculatorOpen)
  const openCalculator = useStore((s) => s.openCalculator)
  const { send } = useSendMessage()
  const tenant = useTenant()

  const askAndClose = (prompt: string) => {
    setCalculatorOpen(false)
    send(prompt)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="mx-[16px] mb-[8px] rounded-[12px] border border-border-chat bg-bg-surface p-[16px]"
        >
          <div className="mb-[12px] flex items-center justify-between">
            <div className="flex items-center gap-[4px]">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => openCalculator(t.id)}
                  className={cn(
                    "rounded-[8px] px-[10px] py-[5px] text-[12.5px] font-medium transition-colors",
                    tool === t.id
                      ? "bg-brand-dim text-brand"
                      : "text-text-secondary hover:bg-bg-hover"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="Close calculator"
              onClick={() => setCalculatorOpen(false)}
              className="grid h-[24px] w-[24px] place-items-center rounded-[6px] text-text-hint transition-colors hover:bg-bg-hover hover:text-text-secondary"
            >
              <X size={16} />
            </button>
          </div>

          {tool === "lbtt" && (
            <LbttTool assistantName={tenant.assistantName} onAsk={askAndClose} />
          )}
          {tool === "affordability" && (
            <AffordabilityTool
              assistantName={tenant.assistantName}
              onAsk={askAndClose}
            />
          )}
          {tool === "totalcost" && (
            <TotalCostTool
              assistantName={tenant.assistantName}
              onAsk={askAndClose}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ---------- shared bits ---------- */

const fieldWrap =
  "flex items-center rounded-[6px] border border-border-chat bg-bg-elevated px-[10px]"
const fieldInput =
  "w-full bg-transparent py-[6px] pl-[4px] text-[13px] text-text-primary outline-none"
const label = "mb-[4px] block text-[12px] text-text-secondary"
const receipt =
  "mt-[10px] rounded-[8px] border border-border-chat bg-bg-elevated p-[12px] font-mono text-[12px] text-text-primary"
const askBtn =
  "mt-[10px] h-[36px] w-full rounded-[6px] bg-brand text-[13px] font-medium text-white transition-colors hover:bg-brand-hover"

function MoneyField({
  id,
  label: lbl,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const num = parseMoney(value)
  return (
    <div>
      <label htmlFor={id} className={label}>
        {lbl}
      </label>
      <div className={fieldWrap}>
        <span className="text-[13px] text-text-hint">£</span>
        <input
          id={id}
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => onChange(num ? num.toLocaleString("en-GB") : "")}
          onFocus={() => onChange(String(num || ""))}
          className={fieldInput}
        />
      </div>
    </div>
  )
}

/* ---------- LBTT ---------- */

function LbttTool({
  assistantName,
  onAsk,
}: {
  assistantName: string
  onAsk: (prompt: string) => void
}) {
  const [priceInput, setPriceInput] = useState("250,000")
  const [isFTB, setIsFTB] = useState(true)
  const price = parseMoney(priceInput)
  const result = useMemo(() => calculateLBTT(price, isFTB), [price, isFTB])

  return (
    <>
      <MoneyField
        id="lbtt-price"
        label="Property price"
        value={priceInput}
        onChange={setPriceInput}
      />

      <div className="mt-[12px] flex items-center justify-between">
        <span className="text-[12px] text-text-secondary">First-time buyer</span>
        <Toggle on={isFTB} onToggle={() => setIsFTB((v) => !v)} label="First-time buyer" />
      </div>

      <div className={receipt}>
        {result.bands.map((b, i) => {
          const range =
            b.to === null ? `${gbp(b.from)}+` : `${gbp(b.from)}–${gbp(b.to)}`
          const value = b.rate === 0 ? "£0 (FTB relief)" : gbp(b.tax)
          return (
            <div key={i} className="flex justify-between gap-[12px]">
              <span className="text-text-secondary">
                {range} · {(b.rate * 100).toFixed(0)}%
              </span>
              <span>{value}</span>
            </div>
          )
        })}
        <div className="mt-[6px] flex justify-between border-t border-border-chat pt-[6px] font-semibold">
          <span>Total LBTT</span>
          <span>{gbp(result.total)}</span>
        </div>
        {result.savedByRelief > 0 && (
          <div className="mt-[4px] text-brand">
            You save {gbp(result.savedByRelief)} with FTB relief
          </div>
        )}
      </div>

      <button
        type="button"
        className={askBtn}
        onClick={() =>
          onAsk(
            `What is the LBTT on a ${gbp(price)} property${
              isFTB ? " as a first-time buyer" : ""
            }?`
          )
        }
      >
        Ask {assistantName} about this →
      </button>
    </>
  )
}

/* ---------- Affordability ---------- */

function AffordabilityTool({
  assistantName,
  onAsk,
}: {
  assistantName: string
  onAsk: (prompt: string) => void
}) {
  const [incomeInput, setIncomeInput] = useState("35,000")
  const [depositInput, setDepositInput] = useState("20,000")
  const income = parseMoney(incomeInput)
  const deposit = parseMoney(depositInput)
  const result = useMemo(
    () => calculateAffordability(income, deposit),
    [income, deposit]
  )

  return (
    <>
      <MoneyField
        id="aff-income"
        label="Annual income"
        value={incomeInput}
        onChange={setIncomeInput}
      />
      <div className="mt-[10px]">
        <MoneyField
          id="aff-deposit"
          label="Deposit"
          value={depositInput}
          onChange={setDepositInput}
        />
      </div>

      <div className={receipt}>
        <div className="flex justify-between gap-[12px]">
          <span className="text-text-secondary">
            Income × {result.incomeMultiplier}
          </span>
          <span>{gbp(result.maxBorrowing)}</span>
        </div>
        <div className="flex justify-between gap-[12px]">
          <span className="text-text-secondary">Deposit</span>
          <span>{gbp(deposit)}</span>
        </div>
        <div className="mt-[6px] flex justify-between border-t border-border-chat pt-[6px] font-semibold">
          <span>Max property price</span>
          <span>{gbp(result.maxPropertyPrice)}</span>
        </div>
        <div className="mt-[4px] text-text-hint">
          Indicative — lenders typically allow 4–4.5× income and stress-test
          affordability.
        </div>
      </div>

      <button
        type="button"
        className={askBtn}
        onClick={() =>
          onAsk(
            `I earn ${gbp(income)} a year with a ${gbp(
              deposit
            )} deposit. How much could I borrow and what property price is realistic in Scotland?`
          )
        }
      >
        Ask {assistantName} about this →
      </button>
    </>
  )
}

/* ---------- First-Time Buyer Total Cost ---------- */

function TotalCostTool({
  assistantName,
  onAsk,
}: {
  assistantName: string
  onAsk: (prompt: string) => void
}) {
  const [priceInput, setPriceInput] = useState("200,000")
  const [depositInput, setDepositInput] = useState("20,000")
  const price = parseMoney(priceInput)
  const deposit = parseMoney(depositInput)
  const result = useMemo(
    () => calculateFTBTotalCost(price, deposit),
    [price, deposit]
  )

  return (
    <>
      <MoneyField
        id="tc-price"
        label="Property price"
        value={priceInput}
        onChange={setPriceInput}
      />
      <div className="mt-[10px]">
        <MoneyField
          id="tc-deposit"
          label="Deposit"
          value={depositInput}
          onChange={setDepositInput}
        />
      </div>

      <div className={receipt}>
        {result.lines.map((line) => (
          <div key={line.label} className="flex justify-between gap-[12px]">
            <span className="text-text-secondary">{line.label}</span>
            <span>{gbp(line.amount)}</span>
          </div>
        ))}
        <div className="mt-[6px] flex justify-between border-t border-border-chat pt-[6px] font-semibold">
          <span>Total upfront cost</span>
          <span>{gbp(result.total)}</span>
        </div>
        <div className="mt-[4px] text-text-hint">
          Mortgage needed {gbp(result.mortgageNeeded)}. Home Report is paid by the
          seller; lender product fees vary and can often be added to the loan.
        </div>
      </div>

      <button
        type="button"
        className={askBtn}
        onClick={() =>
          onAsk(
            `As a first-time buyer in Scotland buying a ${gbp(
              price
            )} property with a ${gbp(
              deposit
            )} deposit, what total upfront costs should I budget for (deposit, LBTT, legal fees, registration dues)?`
          )
        }
      >
        Ask {assistantName} about this →
      </button>
    </>
  )
}

/* ---------- toggle ---------- */

function Toggle({
  on,
  onToggle,
  label: lbl,
}: {
  on: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={lbl}
      onClick={onToggle}
      className="relative h-[18px] w-[32px] rounded-full transition-colors"
      style={{ background: on ? "var(--chat-accent)" : "var(--chat-border)" }}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white"
        style={{ left: on ? 16 : 2 }}
      />
    </button>
  )
}
