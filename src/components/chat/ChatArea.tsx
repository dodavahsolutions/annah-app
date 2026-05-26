"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useStore } from "@/store/useStore"
import { useSendMessage } from "@/hooks/useSendMessage"
import { EmptyState } from "./EmptyState"
import { MessageList } from "./MessageList"
import { TypingIndicator } from "./TypingIndicator"

// How close to the bottom (px) still counts as "pinned".
const BOTTOM_THRESHOLD = 80

export function ChatArea() {
  const { send } = useSendMessage()
  const conversation = useStore((s) =>
    s.conversations.find((c) => c.id === s.activeConversationId)
  )
  const isGenerating = useStore((s) => s.isGenerating)

  const scrollRef = useRef<HTMLDivElement>(null)
  // Whether to keep auto-following new content. True until the user scrolls up.
  const stickToBottom = useRef(true)
  // Set while we programmatically scroll, so our own scroll events don't get
  // misread as the user scrolling away (the classic auto-scroll feedback bug).
  const programmaticScroll = useRef(false)
  const [showScrollPill, setShowScrollPill] = useState(false)

  const messages = useMemo(
    () => conversation?.messages ?? [],
    [conversation?.messages]
  )
  const lastMessage = messages[messages.length - 1]
  const showTyping =
    isGenerating &&
    lastMessage?.role === "assistant" &&
    lastMessage.content === ""

  // Drop the empty streaming placeholder that the TypingIndicator stands in for.
  const visibleMessages = messages.filter(
    (m) => !(m.role === "assistant" && m.isStreaming && m.content === "")
  )

  const scrollToBottom = useCallback((behavior: ScrollBehavior) => {
    const el = scrollRef.current
    if (!el) return
    programmaticScroll.current = true
    el.scrollTo({ top: el.scrollHeight, behavior })
    // Release the guard after the (instant) scroll settles. Smooth scrolls keep
    // the guard a touch longer so intermediate scroll events are ignored.
    const release = behavior === "smooth" ? 350 : 60
    window.setTimeout(() => {
      programmaticScroll.current = false
    }, release)
  }, [])

  const handleScroll = useCallback(() => {
    if (programmaticScroll.current) return
    const el = scrollRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    stickToBottom.current = distanceFromBottom < BOTTOM_THRESHOLD
    setShowScrollPill(!stickToBottom.current && isGenerating)
  }, [isGenerating])

  // Pin to bottom as content changes — instantly, so streaming stays glued
  // without smooth-scroll jank, and short conversations clamp back to 0.
  useEffect(() => {
    if (stickToBottom.current) {
      scrollToBottom("auto")
      setShowScrollPill(false)
    } else {
      setShowScrollPill(isGenerating)
    }
  }, [visibleMessages, isGenerating, scrollToBottom])

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto bg-bg-base"
    >
      {visibleMessages.length === 0 && !showTyping ? (
        <div className="flex min-h-full">
          <EmptyState onSelect={send} />
        </div>
      ) : (
        <>
          <MessageList messages={visibleMessages} onSend={send} />
          {showTyping && (
            <div className="mx-auto max-w-[768px] px-[16px] pb-[16px]">
              <TypingIndicator />
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {showScrollPill && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onClick={() => {
              stickToBottom.current = true
              setShowScrollPill(false)
              scrollToBottom("smooth")
            }}
            className="fixed bottom-[80px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-[4px] rounded-full border border-border-chat bg-bg-elevated px-[14px] py-[6px] text-[13px] text-text-secondary shadow-sm"
          >
            <ChevronDown size={14} />
            Scroll to latest
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
