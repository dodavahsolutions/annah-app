'use client';

import { memo, Fragment, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';

interface ChatMessageProps {
  message: Message;
  index: number;
}

// Safe **bold** renderer — splits the line and returns React elements instead of
// injecting raw HTML. Eliminates the dangerouslySetInnerHTML XSS sink.
function renderInlineBold(line: string): ReactNode {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function formatContent(content: string) {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('• ') || line.startsWith('- ')) {
      return (
        <li key={i} className="ml-4 list-disc">
          {renderInlineBold(line.substring(2))}
        </li>
      );
    }
    return (
      <p key={i} className={i > 0 ? 'mt-2.5' : ''}>
        {line ? renderInlineBold(line) : '\u00A0'}
      </p>
    );
  });
}

function ChatMessageComponent({ message, index }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: isUser ? 0 : 15, x: isUser ? 20 : 0 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex gap-4", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <motion.div
        className={cn("flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center", isUser ? "bg-secondary" : "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-glow")}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: Math.min(index * 0.05, 0.3) + 0.1, duration: 0.2 }}
      >
        {isUser ? <User className="w-4 h-4 text-muted-foreground" strokeWidth={2} /> : <Bot className="w-4 h-4 text-background" strokeWidth={2} />}
      </motion.div>

      <div className={cn("flex flex-col max-w-[85%]", isUser ? "items-end" : "items-start")}>
        <div className={cn(
          "px-5 py-3.5 text-[14.5px] leading-relaxed",
          isUser
            ? "bg-emerald-500/15 text-foreground rounded-2xl rounded-br-md border border-emerald-500/20"
            : "bg-card text-foreground rounded-2xl rounded-bl-md border border-border"
        )}>
          {formatContent(message.content)}
        </div>

        {/* Citations */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <motion.div className="flex flex-wrap gap-2 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {message.citations.map((cite, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                📄 {cite}
              </span>
            ))}
          </motion.div>
        )}

        <span className="mt-1.5 text-[11px] text-muted-foreground">
          {message.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

export const ChatMessage = memo(ChatMessageComponent, (prev, next) =>
  prev.message === next.message && prev.index === next.index
);
