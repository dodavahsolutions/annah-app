"use client"

import { useCallback } from "react"
import { useStore } from "@/store/useStore"
import { nanoid } from "@/lib/chat/utils"
import { parseSuggestions, readStream } from "@/lib/chat/stream"
import type { Message } from "@/types/chat"

// Only one generation runs at a time (guarded by isGenerating), so a single
// module-scoped controller lets the Stop button abort from anywhere.
let activeController: AbortController | null = null

export function abortGeneration(): void {
  activeController?.abort()
}

export function useSendMessage(): {
  send: (content: string) => Promise<void>
  abort: () => void
} {
  const send = useCallback(async (content: string) => {
    const text = content.trim()
    const store = useStore.getState()
    if (!text || store.isGenerating) return

    const convId = store.activeConversationId ?? store.createConversation()

    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    }
    store.addMessage(convId, userMessage)

    const assistantMessage: Message = {
      id: nanoid(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      isStreaming: true,
    }
    store.addMessage(convId, assistantMessage)
    store.setGenerating(true)

    const controller = new AbortController()
    activeController = controller

    try {
      const messages =
        useStore
          .getState()
          .getActiveConversation()
          ?.messages.filter((m) => !m.isStreaming)
          .map((m) => ({ role: m.role, content: m.content })) ?? []

      // Same-origin call to ANNAH's streaming proxy. /api/anna passes the
      // Anthropic SSE through verbatim; readStream() parses it unchanged.
      const response = await fetch("/api/anna?stream=1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
        signal: controller.signal,
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      if (!response.body) throw new Error("No response body")

      let fullContent = ""
      for await (const delta of readStream(response.body)) {
        fullContent += delta
        useStore.getState().appendToLastMessage(convId, delta)
      }

      useStore.getState().finaliseMessage(convId, parseSuggestions(fullContent))
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        useStore.getState().finaliseMessage(convId, [])
      } else {
        useStore
          .getState()
          .appendToLastMessage(
            convId,
            "\n\n*Something went wrong. Please try again.*"
          )
        useStore.getState().finaliseMessage(convId, [])
      }
    } finally {
      useStore.getState().setGenerating(false)
      activeController = null
    }
  }, [])

  return { send, abort: abortGeneration }
}
