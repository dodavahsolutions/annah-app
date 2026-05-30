"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  Calculator,
  Check,
  ChevronDown,
  Compass,
  Download,
  Home,
  LogIn,
  LogOut,
  MoreHorizontal,
  PlusSquare,
  Settings,
  Share2,
  Wallet,
} from "lucide-react"
import { useStore } from "@/store/useStore"
import { useTenant } from "@/context/TenantContext"
import { useAuth } from "@/context/AuthContext"
import { useSendMessage } from "@/hooks/useSendMessage"
import { groupConversationsByDate, type ConversationGroup } from "@/lib/chat/utils"
import { cn } from "@/lib/chat/utils"
import { TOPIC_SECTIONS } from "@/content/topics"
import { AnnahMark } from "./brand/AnnahMark"

const GROUP_ORDER: ConversationGroup[] = ["Today", "Yesterday", "This week", "Older"]

export function Sidebar() {
  const tenant = useTenant()
  const conversations = useStore((s) => s.conversations)
  const activeId = useStore((s) => s.activeConversationId)
  const createConversation = useStore((s) => s.createConversation)
  const setActiveConversation = useStore((s) => s.setActiveConversation)
  const deleteConversation = useStore((s) => s.deleteConversation)
  const renameConversation = useStore((s) => s.renameConversation)
  const openCalculator = useStore((s) => s.openCalculator)
  const setSidebarOpen = useStore((s) => s.setSidebarOpen)
  const setSettingsOpen = useStore((s) => s.setSettingsOpen)
  const { send } = useSendMessage()
  const { user, loading, displayName, signOut } = useAuth()
  const router = useRouter()

  const initials = displayName
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const [menuId, setMenuId] = useState<string | null>(null)
  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [topicsOpen, setTopicsOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)

  const handleAuth = async () => {
    setAccountOpen(false)
    setSidebarOpen(false)
    if (user) {
      await signOut()
      router.refresh()
    } else {
      router.push("/login")
    }
  }

  const openSettings = () => {
    setAccountOpen(false)
    setSidebarOpen(false)
    setSettingsOpen(true)
  }

  const shareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable
    }
  }

  // Close the account menu on click-outside / Escape.
  useEffect(() => {
    if (!accountOpen) return
    const onDown = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAccountOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [accountOpen])

  const askTopic = (prompt: string) => {
    send(prompt)
    setSidebarOpen(false)
  }

  const grouped = groupConversationsByDate(conversations)

  const selectConversation = (id: string) => {
    setActiveConversation(id)
    setSidebarOpen(false)
  }

  const startRename = (id: string, title: string) => {
    setRenameId(id)
    setRenameValue(title)
    setMenuId(null)
  }

  const commitRename = () => {
    if (renameId) renameConversation(renameId, renameValue)
    setRenameId(null)
  }

  const exportChat = () => {
    const conv = conversations.find((c) => c.id === activeId)
    if (!conv) return
    const text = conv.messages
      .map((m) => `${m.role === "user" ? "You" : tenant.assistantName}: ${m.content}`)
      .join("\n\n")
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${conv.title || "conversation"}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toolRow =
    "flex h-[36px] w-full items-center gap-[8px] rounded-[6px] px-[10px] text-[12.5px] text-text-secondary transition-colors hover:bg-bg-hover"
  const menuItem =
    "flex w-full items-center gap-[10px] px-[14px] py-[8px] text-[13px] text-text-primary transition-colors hover:bg-bg-hover"

  return (
    <div className="flex h-full w-[240px] flex-col border-r border-border-chat bg-bg-surface">
      {/* Brand mark — icon only (house + chat bubbles). Inherits its colour
          from the theme: brand green in light mode, cream in dark. */}
      <div className="flex flex-shrink-0 items-center border-b border-border-subtle px-[16px] py-[14px]">
        <AnnahMark className="h-[30px] w-auto text-[#3a5a40] dark:text-[#f9f8f5]" />
      </div>

      {/* New chat */}
      <div className="flex-shrink-0 p-[12px]">
        <button
          type="button"
          onClick={() => {
            createConversation()
            setSidebarOpen(false)
          }}
          className="flex w-full items-center gap-[8px] rounded-[6px] border border-border-chat bg-transparent px-[10px] py-[8px] text-[13px] font-medium text-text-primary transition-colors hover:bg-bg-elevated"
        >
          <PlusSquare size={16} />
          New chat
        </button>
      </div>

      {/* Scrollable middle — history, tools, topics and actions all scroll
          together so the account block and footer below stay pinned in frame. */}
      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>

      {/* History */}
      <div className="px-[8px]">
        {GROUP_ORDER.map((group) => {
          const items = grouped[group]
          if (items.length === 0) return null
          return (
            <div key={group}>
              <div className="px-[8px] pb-[4px] pt-[10px] text-[10px] uppercase tracking-wide text-text-hint">
                {group}
              </div>
              {items.map((conv, i) => {
                const isActive = conv.id === activeId
                if (renameId === conv.id) {
                  return (
                    <input
                      key={conv.id}
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename()
                        if (e.key === "Escape") setRenameId(null)
                      }}
                      className="mb-[2px] h-[36px] w-full rounded-[6px] border border-brand bg-bg-elevated px-[10px] text-[12.5px] text-text-primary outline-none"
                    />
                  )
                }
                return (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.025 }}
                    className={cn(
                      "group relative mb-[2px] flex h-[36px] cursor-pointer items-center rounded-[6px] px-[10px] text-[12.5px] transition-colors",
                      isActive
                        ? "border-l-2 border-brand bg-bg-elevated font-medium text-text-primary"
                        : "text-text-secondary hover:bg-bg-hover"
                    )}
                    onClick={() => selectConversation(conv.id)}
                  >
                    <span className="truncate">{conv.title}</span>
                    <button
                      type="button"
                      aria-label="Conversation options"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuId(menuId === conv.id ? null : conv.id)
                      }}
                      className="ml-auto hidden text-text-hint hover:text-text-secondary group-hover:block"
                    >
                      <MoreHorizontal size={14} />
                    </button>

                    {menuId === conv.id && (
                      <div
                        className="absolute right-[6px] top-[calc(100%-2px)] z-30 w-[120px] rounded-[8px] border border-border-chat bg-bg-surface p-[4px] shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => startRename(conv.id, conv.title)}
                          className="w-full rounded-[6px] px-[8px] py-[6px] text-left text-[12px] text-text-secondary hover:bg-bg-hover"
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteConversation(conv.id)
                            setMenuId(null)
                          }}
                          className="w-full rounded-[6px] px-[8px] py-[6px] text-left text-[12px] text-text-secondary hover:bg-bg-hover"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )
        })}
      </div>

      <div className="mx-[8px] border-t border-border-subtle" />

      {/* Tools */}
      <div className="px-[8px]">
        <div className="px-[8px] pb-[4px] pt-[10px] text-[10px] uppercase tracking-wide text-text-hint">
          Tools
        </div>
        <button type="button" className={toolRow} onClick={() => openCalculator("lbtt")}>
          <Calculator size={16} /> LBTT calculator
        </button>
        <button
          type="button"
          className={toolRow}
          onClick={() => openCalculator("affordability")}
        >
          <Home size={16} /> Affordability check
        </button>
        <button
          type="button"
          className={toolRow}
          onClick={() => openCalculator("totalcost")}
        >
          <Wallet size={16} /> First-time buyer costs
        </button>
      </div>

      <div className="mx-[8px] mt-[8px] border-t border-border-subtle" />

      {/* Explore topics — collapsible prompt shortcuts */}
      <div className="px-[8px]">
        <button
          type="button"
          onClick={() => setTopicsOpen((v) => !v)}
          aria-expanded={topicsOpen}
          className="flex h-[36px] w-full items-center gap-[8px] rounded-[6px] px-[10px] text-[12.5px] text-text-secondary transition-colors hover:bg-bg-hover"
        >
          <Compass size={16} />
          Explore topics
          <ChevronDown
            size={14}
            className={cn(
              "ml-auto text-text-hint transition-transform",
              topicsOpen && "rotate-180"
            )}
          />
        </button>

        <AnimatePresence initial={false}>
          {topicsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {TOPIC_SECTIONS.map((section) => {
                const SectionIcon = section.icon
                return (
                  <div key={section.title}>
                    <div className="flex items-center gap-[6px] px-[8px] pb-[2px] pt-[8px] text-[10px] uppercase tracking-wide text-text-hint">
                      <SectionIcon size={11} />
                      {section.title}
                    </div>
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => askTopic(item.prompt)}
                        className="flex h-[32px] w-full items-center rounded-[6px] pl-[18px] pr-[10px] text-left text-[12.5px] text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
                      >
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mx-[8px] mt-[8px] border-t border-border-subtle" />

      {/* Actions */}
      <div className="px-[8px] pb-[12px]">
        <button type="button" className={toolRow} onClick={exportChat}>
          <Download size={16} /> Export chat
        </button>
      </div>

      </div>
      {/* end scrollable middle */}

      {/* Account — profile row is the trigger for an upward popup menu */}
      <div
        ref={accountRef}
        className="relative flex-shrink-0 border-t border-border-subtle p-[8px]"
      >
        <button
          type="button"
          onClick={() => setAccountOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={accountOpen}
          className="flex w-full items-center gap-[8px] rounded-[8px] px-[8px] py-[6px] transition-colors hover:bg-bg-hover"
        >
          <span className="avatar-circle grid h-[28px] w-[28px] flex-shrink-0 place-items-center rounded-full text-[11px] font-medium">
            {user ? initials : "G"}
          </span>
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate text-[12.5px] font-medium text-text-primary">
              {displayName}
            </div>
            <div className="truncate text-[11px] text-text-hint">
              {user ? user.email : "Not signed in"}
            </div>
          </div>
          <ChevronDown
            size={15}
            className={cn(
              "flex-shrink-0 text-text-hint transition-transform",
              accountOpen && "rotate-180"
            )}
          />
        </button>

        <AnimatePresence>
          {accountOpen && (
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              style={{ transformOrigin: "bottom left" }}
              className="absolute bottom-[calc(100%-2px)] left-[8px] right-[8px] z-40 overflow-hidden rounded-[12px] border border-border-chat bg-bg-surface py-[4px] shadow-lg"
            >
              <button type="button" role="menuitem" onClick={openSettings} className={menuItem}>
                <Settings size={15} /> Settings
              </button>
              <button type="button" role="menuitem" onClick={shareLink} className={menuItem}>
                {copied ? <Check size={15} className="text-brand" /> : <Share2 size={15} />}
                {copied ? "Copied link" : "Share"}
              </button>

              <div className="my-[4px] border-t border-border-subtle" />

              <button
                type="button"
                role="menuitem"
                onClick={handleAuth}
                disabled={loading}
                className={cn(menuItem, "disabled:opacity-40")}
              >
                {user ? <LogOut size={15} /> : <LogIn size={15} />}
                {user ? "Log out" : "Sign in"}
              </button>

              <div className="px-[14px] pb-[4px] pt-[6px] text-[10.5px] text-text-hint">
                {tenant.assistantName} v1
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
