"use client"

import { useState } from "react"
import TextareaAutosize from "react-textarea-autosize"
import { motion } from "framer-motion"
import { ArrowUp, Square } from "lucide-react"
import { useStore } from "@/store/useStore"
import { useTenant } from "@/context/TenantContext"
import { useSendMessage } from "@/hooks/useSendMessage"
import { cn } from "@/lib/chat/utils"

export function InputBar() {
  const tenant = useTenant()
  const { send, abort } = useSendMessage()
  const isGenerating = useStore((s) => s.isGenerating)

  const [input, setInput] = useState("")

  const canSend = input.trim().length > 0 && !isGenerating

  const handleSend = () => {
    if (!canSend) return
    const content = input
    setInput("")
    void send(content)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    } else if (e.key === "Escape" && isGenerating) {
      abort()
    }
  }

  const disclaimer = tenant.fcaNumber
    ? `${tenant.footerDisclaimer} · FCA ${tenant.fcaNumber}`
    : tenant.footerDisclaimer

  return (
    <div className="border-t border-border-chat bg-bg-base px-[16px] pb-[14px] pt-[10px] [padding-bottom:calc(14px+env(safe-area-inset-bottom))]">
      <div className="input-wrap flex items-end gap-[6px] rounded-[20px] border border-border-chat bg-bg-elevated py-[4px] pl-[14px] pr-[4px] transition-[border-color,box-shadow] duration-150">
        <TextareaAutosize
          minRows={1}
          maxRows={6}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask ${tenant.assistantName} about Scottish mortgages…`}
          className="my-[6px] flex-1 resize-none border-none bg-transparent text-[14px] leading-[20px] text-text-primary outline-none placeholder:text-text-hint"
        />

        {isGenerating ? (
          <motion.button
            layoutId="send-stop-btn"
            type="button"
            onClick={abort}
            aria-label="Stop generating"
            className="grid h-[32px] w-[32px] flex-shrink-0 place-items-center rounded-full border border-border-chat bg-bg-elevated text-text-primary transition-colors hover:bg-bg-hover"
          >
            <Square size={13} strokeWidth={2.5} className="fill-current" />
          </motion.button>
        ) : (
          <motion.button
            layoutId="send-stop-btn"
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            whileHover={canSend ? { scale: 1.04 } : undefined}
            className={cn(
              "grid h-[32px] w-[32px] flex-shrink-0 place-items-center rounded-full border-none bg-brand text-white transition-colors hover:bg-brand-hover",
              !canSend && "cursor-not-allowed opacity-40"
            )}
          >
            <ArrowUp size={15} />
          </motion.button>
        )}
      </div>

      <p className="mt-[8px] text-center text-[10.5px] text-text-hint">{disclaimer}</p>
    </div>
  )
}
