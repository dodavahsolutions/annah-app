"use client"

import type { Message as MessageType } from "@/types/chat"
import { useTenant } from "@/context/TenantContext"
import { Message } from "./Message"

interface MessageListProps {
  messages: MessageType[]
  onSend: (prompt: string) => void
}

export function MessageList({ messages, onSend }: MessageListProps) {
  const tenant = useTenant()
  return (
    <div
      role="log"
      aria-live="polite"
      aria-label={`Conversation with ${tenant.assistantName}`}
      className="mx-auto flex max-w-[768px] flex-col px-[16px] pb-[16px] pt-[32px]"
    >
      {messages.map((message, i) => {
        const prev = messages[i - 1]
        const previousUserContent =
          message.role === "assistant" && prev?.role === "user"
            ? prev.content
            : undefined
        return (
          <Message
            key={message.id}
            message={message}
            index={i}
            onSend={onSend}
            previousUserContent={previousUserContent}
          />
        )
      })}
    </div>
  )
}
