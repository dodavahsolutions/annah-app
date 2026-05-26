"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { AnimatePresence, motion } from "framer-motion"
import { Monitor, Moon, Sun } from "lucide-react"
import type { Theme } from "@/types/chat"

const ORDER: Theme[] = ["system", "light", "dark"]
const NEXT: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" }
const ICON = { system: Monitor, light: Sun, dark: Moon }

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // next-themes has no value during SSR; defer icon selection to the client to
  // avoid a hydration mismatch. This one-time mount flag is the documented pattern.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const current: Theme = mounted && ORDER.includes(theme as Theme)
    ? (theme as Theme)
    : "system"
  const Icon = ICON[current]

  return (
    <button
      type="button"
      onClick={() => setTheme(NEXT[current])}
      aria-label={`Switch to ${NEXT[current]} mode`}
      className="grid h-[32px] w-[32px] place-items-center rounded-[8px] border border-border-chat bg-transparent text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={current}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.15 }}
          className="grid place-items-center"
        >
          <Icon size={16} />
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
