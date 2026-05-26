export type Role = "user" | "assistant"
export type Theme = "light" | "dark" | "system"

export interface Source {
  label: string
  url?: string
}

export interface Message {
  id: string
  role: Role
  content: string
  timestamp: number
  sources?: Source[]
  suggestions?: string[]
  isStreaming?: boolean
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  /** Supabase `sessions.id` once this conversation is persisted (signed-in only). */
  remoteId?: string
}
