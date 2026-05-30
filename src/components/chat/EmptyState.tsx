"use client"

import { useTenant } from "@/context/TenantContext"
import { useAuth } from "@/context/AuthContext"
import { PromptCard } from "./PromptCard"
import { AnnahStacked } from "./brand/AnnahStacked"

interface EmptyStateProps {
  onSelect: (prompt: string) => void
}

const PROMPTS: { title: string; subtitle: string }[] = [
  {
    title: "What is LBTT and how much will I pay?",
    subtitle: "Scottish stamp duty, bands & first-time buyer relief",
  },
  {
    title: "What deposit do I need to buy a home?",
    subtitle: "Minimum 5%, LTV bands and how they affect rates",
  },
  {
    title: "Which Scottish schemes can help me buy?",
    subtitle: "LIFT, shared equity and first-time buyer support",
  },
  {
    title: "How is mortgage affordability calculated?",
    subtitle: "Income multiples, stress testing and lender criteria",
  },
]

export function EmptyState({ onSelect }: EmptyStateProps) {
  const tenant = useTenant()
  const { firstName } = useAuth()

  return (
    <div className="m-auto flex w-full max-w-[480px] flex-col items-center px-[16px] py-[32px]">
      <div className="mb-[32px] flex flex-col items-center text-center">
        <AnnahStacked className="h-[100px] w-auto text-[#3a5a40] dark:text-[#f9f8f5]" />
        <h1 className="font-display mt-[18px] text-[26px] text-text-primary">
          {firstName ? `Hi ${firstName}, I'm ${tenant.assistantName}` : `Hi, I'm ${tenant.assistantName}`}
        </h1>
        <p className="mt-[8px] max-w-[380px] text-[15px] leading-relaxed text-text-secondary">
          {tenant.welcomeMessage}
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-[8px]">
        {PROMPTS.map((p, i) => (
          <PromptCard
            key={p.title}
            title={p.title}
            subtitle={p.subtitle}
            index={i}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
