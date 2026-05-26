const SUGGESTIONS_RE = /<suggestions>\s*(\[[\s\S]*?\])\s*<\/suggestions>/i

/**
 * Reads an Anthropic-format SSE stream (passed through verbatim by the ANNAH
 * backend) and yields text deltas as they arrive.
 */
export async function* readStream(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<string, void, unknown> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      // Keep the last (possibly partial) line in the buffer.
      buffer = lines.pop() ?? ""

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith("data:")) continue

        const payload = trimmed.slice(5).trim()
        if (!payload || payload === "[DONE]") continue

        try {
          const event = JSON.parse(payload) as {
            type?: string
            delta?: { type?: string; text?: string }
          }
          if (event.type === "message_stop") return
          if (
            event.type === "content_block_delta" &&
            event.delta?.type === "text_delta" &&
            typeof event.delta.text === "string"
          ) {
            yield event.delta.text
          }
        } catch {
          // Ignore malformed/non-JSON keep-alive lines.
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

/** Extracts the `<suggestions>[...]</suggestions>` array from assistant content. */
export function parseSuggestions(content: string): string[] {
  const match = content.match(SUGGESTIONS_RE)
  if (!match) return []
  try {
    const parsed = JSON.parse(match[1]) as unknown
    if (Array.isArray(parsed)) {
      return parsed.filter((s): s is string => typeof s === "string")
    }
  } catch {
    // Malformed suggestions block — treat as none.
  }
  return []
}

/** Removes the `<suggestions>...</suggestions>` block, returning display prose. */
export function stripSuggestions(content: string): string {
  return content.replace(SUGGESTIONS_RE, "").trimEnd()
}
