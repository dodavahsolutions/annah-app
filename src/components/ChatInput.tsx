'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  onFileUpload?: (files: FileList | null) => void;
  docCount?: number;
}

export function ChatInput({ onSend, disabled = false, placeholder = "Ask Annah about Scottish mortgages, schemes, or new builds...", onFileUpload, docCount = 0 }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }} className="p-5">
      <div className={cn("relative flex items-end gap-3 p-4 bg-card rounded-2xl border transition-all duration-200", isFocused ? "border-emerald-500/50 shadow-[0_0_0_3px_rgba(16,185,129,0.1)]" : "border-border hover:border-border/80")}>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-emerald-400 hover:bg-secondary transition-colors relative"
          disabled={disabled}
          title="Upload document"
        >
          <Paperclip className="w-5 h-5" strokeWidth={1.5} />
          {docCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-background text-[9px] font-bold rounded-full flex items-center justify-center">{docCount}</span>
          )}
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.txt,.doc,.docx" multiple onChange={e => onFileUpload?.(e.target.files)} className="hidden" />

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn("flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground resize-none outline-none min-h-[24px] max-h-[200px] py-1.5", disabled && "opacity-50 cursor-not-allowed")}
        />

        <motion.div whileHover={{ scale: input.trim() ? 1.05 : 1 }} whileTap={{ scale: input.trim() ? 0.95 : 1 }}>
          <Button
            size="icon"
            className={cn("flex-shrink-0 h-10 w-10 rounded-xl transition-all duration-200", input.trim() ? "bg-emerald-500 hover:bg-emerald-600 text-background shadow-glow" : "bg-secondary text-muted-foreground")}
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
          >
            <Send className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Annah provides guidance only · Not regulated financial advice · Always consult a qualified mortgage advisor
      </p>
    </motion.div>
  );
}
