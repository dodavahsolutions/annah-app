import { motion } from 'framer-motion';
import { 
  Home, 
  Building2, 
  HandCoins, 
  FileText, 
  Landmark,
  MapPin,
  ChevronRight,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  building: Building2,
  coins: HandCoins,
  file: FileText,
  landmark: Landmark,
  map: MapPin,
};

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  hasChildren?: boolean;
  expanded?: boolean;
  onClick?: () => void;
}

export function NavItem({ 
  icon, 
  label, 
  active = false, 
  collapsed = false,
  hasChildren = false,
  expanded = false,
  onClick 
}: NavItemProps) {
  const Icon = iconMap[icon] || Home;
  
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
        active 
          ? "bg-secondary text-emerald-400" 
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
      )}
      whileHover={{ x: active ? 0 : 2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Active indicator */}
      {active && (
        <motion.div 
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-emerald-500 rounded-full"
          layoutId="activeIndicator"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      
      <Icon 
        className={cn(
          "w-[18px] h-[18px] flex-shrink-0 transition-colors",
          active ? "text-emerald-400" : "text-muted-foreground group-hover:text-foreground"
        )} 
        strokeWidth={1.5}
      />
      
      {!collapsed && (
        <>
          <span className="flex-1 text-left truncate">{label}</span>
          {hasChildren && (
            <ChevronRight 
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                expanded && "rotate-90"
              )} 
              strokeWidth={1.5}
            />
          )}
        </>
      )}
    </motion.button>
  );
}
