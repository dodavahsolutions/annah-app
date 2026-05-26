"use client"

import { motion } from "framer-motion"

interface PromptCardProps {
  title: string
  subtitle: string
  index: number
  onSelect: (title: string) => void
}

export function PromptCard({ title, subtitle, index, onSelect }: PromptCardProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(title)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 26, delay: index * 0.06 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="h-full w-full rounded-[12px] border border-border-chat bg-bg-surface px-[15px] py-[13px] text-left transition-colors hover:border-text-hint hover:bg-bg-elevated"
    >
      <p className="text-[13px] font-medium leading-[1.4] text-text-primary">
        {title}
      </p>
      <p className="mt-[3px] text-[12px] text-text-secondary">{subtitle}</p>
    </motion.button>
  )
}
