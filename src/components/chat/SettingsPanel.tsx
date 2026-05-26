"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Download, Trash2, X } from "lucide-react"
import { useStore } from "@/store/useStore"
import { useTenant } from "@/context/TenantContext"
import { ThemeToggle } from "./ThemeToggle"

export function SettingsPanel() {
  const tenant = useTenant()
  const open = useStore((s) => s.settingsOpen)
  const setSettingsOpen = useStore((s) => s.setSettingsOpen)
  const conversations = useStore((s) => s.conversations)
  const clearConversations = useStore((s) => s.clearConversations)

  const [confirmClear, setConfirmClear] = useState(false)

  const close = () => {
    setConfirmClear(false)
    setSettingsOpen(false)
  }

  const exportAll = () => {
    if (conversations.length === 0) return
    const text = conversations
      .map((c) => {
        const body = c.messages
          .map(
            (m) =>
              `${m.role === "user" ? "You" : tenant.assistantName}: ${m.content}`
          )
          .join("\n\n")
        return `# ${c.title}\n\n${body}`
      })
      .join("\n\n———\n\n")
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${tenant.assistantName.toLowerCase()}-conversations.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const sectionLabel =
    "px-[4px] pb-[8px] pt-[18px] text-[10px] uppercase tracking-wide text-text-hint"
  const row =
    "flex w-full items-center justify-between rounded-[8px] border border-border-chat bg-bg-elevated px-[12px] py-[10px] text-[13px] text-text-primary"

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-black/50"
          />
          <motion.aside
            role="dialog"
            aria-label="Settings"
            initial={{ x: 360 }}
            animate={{ x: 0 }}
            exit={{ x: 360 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="fixed inset-y-0 right-0 z-50 flex w-[min(360px,100vw)] flex-col border-l border-border-chat bg-bg-surface"
          >
            <div className="flex h-[52px] flex-shrink-0 items-center justify-between border-b border-border-chat px-[16px]">
              <span className="text-[14px] font-medium text-text-primary">
                Settings
              </span>
              <button
                type="button"
                aria-label="Close settings"
                onClick={close}
                className="grid h-[32px] w-[32px] place-items-center rounded-[8px] text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-[16px] pb-[24px]">
              <div className={sectionLabel}>Appearance</div>
              <div className={row}>
                <span>Theme</span>
                <ThemeToggle />
              </div>

              <div className={sectionLabel}>Conversations</div>
              <button
                type="button"
                onClick={exportAll}
                disabled={conversations.length === 0}
                className={`${row} mb-[8px] transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-40`}
              >
                <span>Export all conversations</span>
                <Download size={15} className="text-text-secondary" />
              </button>

              {confirmClear ? (
                <div className="rounded-[8px] border border-border-chat bg-bg-elevated px-[12px] py-[10px]">
                  <p className="mb-[8px] text-[12.5px] text-text-secondary">
                    Delete all {conversations.length} conversation
                    {conversations.length === 1 ? "" : "s"}? This cannot be undone.
                  </p>
                  <div className="flex gap-[8px]">
                    <button
                      type="button"
                      onClick={() => {
                        clearConversations()
                        setConfirmClear(false)
                      }}
                      className="flex-1 rounded-[6px] bg-red-600 px-[10px] py-[6px] text-[12.5px] font-medium text-white transition-colors hover:bg-red-700"
                    >
                      Delete all
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="flex-1 rounded-[6px] border border-border-chat px-[10px] py-[6px] text-[12.5px] text-text-secondary transition-colors hover:bg-bg-hover"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  disabled={conversations.length === 0}
                  className={`${row} transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  <span>Clear conversation history</span>
                  <Trash2 size={15} className="text-text-secondary" />
                </button>
              )}

              <div className={sectionLabel}>About</div>
              <div className="rounded-[8px] border border-border-chat bg-bg-elevated px-[12px] py-[10px] text-[12.5px] text-text-secondary">
                <p className="text-text-primary">{tenant.assistantName}</p>
                <p className="mt-[4px]">{tenant.footerDisclaimer}</p>
                {tenant.fcaNumber && (
                  <p className="mt-[4px]">FCA {tenant.fcaNumber}</p>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
