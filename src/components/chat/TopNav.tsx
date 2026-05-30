"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronDown, Menu } from "lucide-react"
import { useStore } from "@/store/useStore"
import { useTenant } from "@/context/TenantContext"

export function TopNav() {
  const tenant = useTenant()
  const toggleSidebar = useStore((s) => s.toggleSidebar)
  const [menuOpen, setMenuOpen] = useState(false)
  const pillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [menuOpen])

  return (
    <header className="flex h-[52px] items-center justify-between border-b border-border-chat bg-bg-base px-[16px]">
      <div className="flex items-center gap-[8px]">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Open menu"
          className="grid h-[32px] w-[32px] place-items-center rounded-[8px] text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary md:hidden"
        >
          <Menu size={20} />
        </button>

        <div ref={pillRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-[8px] rounded-full border border-border-chat bg-transparent px-[10px] py-[5px] transition-colors hover:bg-bg-elevated"
          >
            <span className="avatar-circle font-display grid h-[24px] w-[24px] place-items-center rounded-full text-[12px]">
              {tenant.avatarInitial}
            </span>
            <span className="text-[13px] font-medium text-text-primary">
              {tenant.assistantName}
            </span>
            <ChevronDown size={14} className="text-text-hint" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                role="menu"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.12 }}
                style={{ transformOrigin: "top left" }}
                className="absolute left-0 top-[calc(100%+6px)] z-30 w-[240px] rounded-[12px] border border-border-chat bg-bg-surface p-[6px] shadow-lg"
              >
                <div className="flex items-center gap-[8px] rounded-[8px] bg-bg-elevated px-[10px] py-[8px] text-[13px] font-medium text-text-primary">
                  <Check size={14} className="text-brand" />
                  {tenant.assistantName} — First-time Buyers
                </div>
                {["Remortgage advice", "Buy to Let"].map((label) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-[8px] px-[10px] py-[8px] text-[13px] text-text-hint"
                  >
                    {label}
                    <span className="rounded-full border border-border-chat px-[6px] py-[1px] text-[10px] uppercase">
                      soon
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
