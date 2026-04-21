'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SuggestionChipProps {
  text: string;
  onClick: () => void;
  index?: number;
}

export function SuggestionChip({ text, onClick, index = 0 }: SuggestionChipProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: 0.6 + index * 0.08,
        ease: [0.16, 1, 0.3, 1]
      }}
      whileHover={{ 
        scale: 1.02,
        backgroundColor: 'hsl(var(--secondary))'
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "px-4 py-3 text-left text-sm text-muted-foreground bg-card border border-border rounded-xl",
        "hover:text-foreground hover:border-border/80 transition-all duration-200",
        "flex items-center gap-2 group"
      )}
    >
      <span className="flex-1">{text}</span>
      <motion.span 
        className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
        initial={{ x: -5 }}
        whileHover={{ x: 0 }}
      >
        →
      </motion.span>
    </motion.button>
  );
}
