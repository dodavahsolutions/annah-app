"use client"

import { useCallback } from "react"
import { useStore } from "@/store/useStore"
import { useAuth } from "@/context/AuthContext"
import { nanoid } from "@/lib/chat/utils"
import { parseSuggestions, readStream, stripSuggestions } from "@/lib/chat/stream"
import { createRemoteSession, persistRemoteMessage } from "@/lib/chat/persistence"
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
  const { user, firstName } = useAuth()

  const send = useCallback(
    async (content: string) => {
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

      // Persist to Supabase for signed-in users (best-effort, non-blocking).
      // Guests fall back to the zustand localStorage store only.
      void (async () => {
        if (!user) return
        let remoteId =
          useStore.getState().conversations.find((c) => c.id === convId)?.remoteId ?? null
        if (!remoteId) {
          remoteId = await createRemoteSession(user.id, text)
          if (remoteId) useStore.getState().setRemoteId(convId, remoteId)
        }
        if (remoteId) await persistRemoteMessage(remoteId, "user", text)
      })()

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
        // firstName lets the server greet the user by name (sanitised server-side).
        const response = await fetch("/api/anna?stream=1", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(firstName ? { messages, firstName } : { messages }),
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

        // Persist the assistant reply (display text, without the suggestions block).
        if (user) {
          const remoteId =
            useStore.getState().conversations.find((c) => c.id === convId)?.remoteId ?? null
          if (remoteId) void persistRemoteMessage(remoteId, "assistant", stripSuggestions(fullContent))
        }
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
    },
    [user, firstName]
  )

  return { send, abort: abortGeneration }
}
