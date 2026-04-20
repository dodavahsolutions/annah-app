import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

interface LogoProps {
  collapsed?: boolean;
}

export function Logo({ collapsed = false }: LogoProps) {
  return (
    <div className="flex items-center gap-3 px-2">
      <motion.div 
        className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-glow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <Home className="w-5 h-5 text-background" strokeWidth={2} />
      </motion.div>
      
      {!collapsed && (
        <motion.div 
          className="flex flex-col"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <span className="text-base font-semibold text-foreground tracking-tight">
            Anna
          </span>
          <span className="text-[11px] text-muted-foreground tracking-wide uppercase">
            Scotland Mortgages
          </span>
        </motion.div>
      )}
    </div>
  );
}
