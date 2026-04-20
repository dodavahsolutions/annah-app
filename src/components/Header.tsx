import { motion } from 'framer-motion';
import { Download, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
  onExport?: () => void;
  className?: string;
}

export function Header({ onMenuClick, onExport, className }: HeaderProps) {
  const isMobile = useIsMobile();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex items-center justify-between h-16 px-4 sm:px-6 border-b border-border/50 bg-background/80 backdrop-blur-sm", className)}
    >
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button variant="ghost" size="icon" className="h-9 w-9 -ml-1" onClick={onMenuClick}>
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-foreground font-medium">Anna</span>
          <span>/</span>
          <span>Scotland Mortgage Advisor</span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-foreground" onClick={onExport}>
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline text-sm">Export chat</span>
        </Button>
      </div>
    </motion.header>
  );
}
