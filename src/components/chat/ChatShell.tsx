"use client"

import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useStore } from "@/store/useStore"
import { useChatHistory } from "@/hooks/useChatHistory"
import { Sidebar } from "./Sidebar"
import { TopNav } from "./TopNav"
import { ChatArea } from "./ChatArea"
import { InputBar } from "./InputBar"
import { CalculatorPanel } from "./CalculatorPanel"
import { SettingsPanel } from "./SettingsPanel"

export function ChatShell() {
  const sidebarOpen = useStore((s) => s.sidebarOpen)
  const setSidebarOpen = useStore((s) => s.setSidebarOpen)

  // Load signed-in users' saved Supabase chat history into the sidebar.
  useChatHistory()

  useEffect(() => {
    if (!sidebarOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [sidebarOpen, setSidebarOpen])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base">
      {/* Desktop sidebar */}
      <div className="hidden flex-shrink-0 md:block">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
            />
            <motion.div
              key="drawer"
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden"
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopNav />
        <ChatArea />
        <CalculatorPanel />
        <InputBar />
      </div>

      <SettingsPanel />
    </div>
  )
}
