import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Conversation } from "@/types/chat"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function nanoid(length = 12): string {
  return Math.random()
    .toString(36)
    .slice(2, 2 + length)
}

export type ConversationGroup = "Today" | "Yesterday" | "This week" | "Older"

const DAY = 86_400_000

export function groupConversationsByDate(
  convs: Conversation[]
): Record<ConversationGroup, Conversation[]> {
  const now = Date.now()
  const groups: Record<ConversationGroup, Conversation[]> = {
    Today: [],
    Yesterday: [],
    "This week": [],
    Older: [],
  }

  for (const c of convs) {
    const age = now - c.updatedAt
    if (age < DAY) groups.Today.push(c)
    else if (age < DAY * 2) groups.Yesterday.push(c)
    else if (age < DAY * 7) groups["This week"].push(c)
    else groups.Older.push(c)
  }

  return groups
}
