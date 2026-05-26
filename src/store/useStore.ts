"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Conversation, Message } from "@/types/chat"
import type { CalculatorTool } from "@/lib/chat/calculations"
import { nanoid } from "@/lib/chat/utils"

interface StoreState {
  conversations: Conversation[]
  activeConversationId: string | null
  isGenerating: boolean
  sidebarOpen: boolean
  calculatorOpen: boolean
  calculatorTool: CalculatorTool
  settingsOpen: boolean

  createConversation: () => string
  setActiveConversation: (id: string) => void
  addMessage: (conversationId: string, message: Message) => void
  appendToLastMessage: (conversationId: string, chunk: string) => void
  finaliseMessage: (conversationId: string, suggestions: string[]) => void
  deleteConversation: (id: string) => void
  renameConversation: (id: string, title: string) => void
  setGenerating: (val: boolean) => void
  toggleSidebar: () => void
  setSidebarOpen: (val: boolean) => void
  setCalculatorOpen: (val: boolean) => void
  openCalculator: (tool: CalculatorTool) => void
  setSettingsOpen: (val: boolean) => void
  clearConversations: () => void
  getActiveConversation: () => Conversation | undefined
}

function deriveTitle(content: string): string {
  const words = content.trim().split(/\s+/).slice(0, 6).join(" ")
  return words.length < content.trim().length ? `${words}…` : words || "New conversation"
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      isGenerating: false,
      sidebarOpen: false,
      calculatorOpen: false,
      calculatorTool: "lbtt",
      settingsOpen: false,

      createConversation: () => {
        const id = nanoid()
        const now = Date.now()
        const conversation: Conversation = {
          id,
          title: "New conversation",
          messages: [],
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          activeConversationId: id,
        }))
        return id
      },

      setActiveConversation: (id) => set({ activeConversationId: id }),

      addMessage: (conversationId, message) =>
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c.id !== conversationId) return c
            const isFirstUserMessage =
              message.role === "user" &&
              !c.messages.some((m) => m.role === "user")
            return {
              ...c,
              title: isFirstUserMessage ? deriveTitle(message.content) : c.title,
              messages: [...c.messages, message],
              updatedAt: Date.now(),
            }
          }),
        })),

      appendToLastMessage: (conversationId, chunk) =>
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c.id !== conversationId || c.messages.length === 0) return c
            const messages = c.messages.map((m, i) =>
              i === c.messages.length - 1
                ? { ...m, content: m.content + chunk }
                : m
            )
            return { ...c, messages, updatedAt: Date.now() }
          }),
        })),

      finaliseMessage: (conversationId, suggestions) =>
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c.id !== conversationId || c.messages.length === 0) return c
            const messages = c.messages.map((m, i) =>
              i === c.messages.length - 1
                ? {
                    ...m,
                    isStreaming: false,
                    suggestions: suggestions.length ? suggestions : undefined,
                  }
                : m
            )
            return { ...c, messages, updatedAt: Date.now() }
          }),
        })),

      deleteConversation: (id) =>
        set((state) => {
          const conversations = state.conversations.filter((c) => c.id !== id)
          const activeConversationId =
            state.activeConversationId === id
              ? conversations[0]?.id ?? null
              : state.activeConversationId
          return { conversations, activeConversationId }
        }),

      renameConversation: (id, title) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title: title.trim() || c.title } : c
          ),
        })),

      setGenerating: (val) => set({ isGenerating: val }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (val) => set({ sidebarOpen: val }),
      setCalculatorOpen: (val) => set({ calculatorOpen: val }),
      openCalculator: (tool) => set({ calculatorOpen: true, calculatorTool: tool }),
      setSettingsOpen: (val) => set({ settingsOpen: val }),
      clearConversations: () =>
        set({ conversations: [], activeConversationId: null }),

      getActiveConversation: () => {
        const { conversations, activeConversationId } = get()
        return conversations.find((c) => c.id === activeConversationId)
      },
    }),
    {
      name: "anna-ui-store",
      version: 1,
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
      }),
    }
  )
)
