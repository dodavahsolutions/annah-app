"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Check,
  Clipboard,
  ExternalLink,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react"
import type { Message as MessageType } from "@/types/chat"
import { useTenant } from "@/context/TenantContext"
import { stripSuggestions } from "@/lib/chat/stream"
import { cn } from "@/lib/chat/utils"

interface MessageProps {
  message: MessageType
  index: number
  onSend: (prompt: string) => void
  previousUserContent?: string
}

const ENTER = { type: "spring" as const, stiffness: 380, damping: 28 }

export function Message({ message, index, onSend, previousUserContent }: MessageProps) {
  const tenant = useTenant()

  if (message.role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ENTER, delay: index * 0.03 }}
        className="mb-[28px] flex justify-end"
      >
        <div className="max-w-[70%]">
          <div className="mb-[4px] text-right text-[12px] font-medium text-text-secondary">
            You
          </div>
          <div className="user-bubble">{message.content}</div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...ENTER, delay: index * 0.03 }}
      className="group mb-[28px] flex gap-[10px]"
    >
      <div className="avatar-circle font-display mt-[1px] grid h-[28px] w-[28px] flex-shrink-0 place-items-center rounded-full text-[12px]">
        {tenant.avatarInitial}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-[4px] text-[12px] font-medium text-text-secondary">
          {tenant.assistantName}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="mb-[10px] flex flex-wrap gap-[6px]">
            {message.sources.map((s, i) =>
              s.url ? (
                <a
                  key={`${s.label}-${i}`}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-pill"
                >
                  <ExternalLink size={10} />
                  {s.label}
                </a>
              ) : (
                <span key={`${s.label}-${i}`} className="source-pill">
                  {s.label}
                </span>
              )
            )}
          </div>
        )}

        <div className="chat-prose">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" />
              ),
            }}
          >
            {stripSuggestions(message.content)}
          </ReactMarkdown>
          {message.isStreaming && (
            <span className="streaming-cursor" aria-hidden="true" />
          )}
        </div>

        {!message.isStreaming && (
          <MessageActions
            content={stripSuggestions(message.content)}
            canRegenerate={Boolean(previousUserContent)}
            onRegenerate={() =>
              previousUserContent && onSend(previousUserContent)
            }
          />
        )}

        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-[10px] flex flex-wrap gap-[6px] overflow-x-auto pb-[4px]">
            {message.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="suggestion-pill"
                onClick={() => onSend(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

interface MessageActionsProps {
  content: string
  canRegenerate: boolean
  onRegenerate: () => void
}

type Vote = "up" | "down" | null

function MessageActions({ content, canRegenerate, onRegenerate }: MessageActionsProps) {
  const [copied, setCopied] = useState(false)
  const [vote, setVote] = useState<Vote>(null)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 500)
    } catch {
      // Clipboard unavailable (insecure context) — silently ignore.
    }
  }

  const btn =
    "grid h-[28px] w-[28px] place-items-center rounded-[6px] border-none bg-transparent text-text-hint transition-colors hover:text-text-secondary"

  return (
    <div className="mt-[8px] flex gap-[4px] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
      <button type="button" onClick={copy} className={btn} aria-label="Copy message">
        {copied ? <Check size={14} /> : <Clipboard size={14} />}
      </button>
      {canRegenerate && (
        <button
          type="button"
          onClick={onRegenerate}
          className={btn}
          aria-label="Regenerate response"
        >
          <RotateCcw size={14} />
        </button>
      )}
      <button
        type="button"
        onClick={() => setVote(vote === "up" ? null : "up")}
        className={cn(btn, vote === "up" && "text-brand hover:text-brand")}
        aria-label="Good response"
        aria-pressed={vote === "up"}
      >
        <ThumbsUp size={14} />
      </button>
      <button
        type="button"
        onClick={() => setVote(vote === "down" ? null : "down")}
        className={cn(btn, vote === "down" && "text-brand hover:text-brand")}
        aria-label="Bad response"
        aria-pressed={vote === "down"}
      >
        <ThumbsDown size={14} />
      </button>
    </div>
  )
}
