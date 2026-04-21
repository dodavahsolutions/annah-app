'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeft, ChevronRight, Home, Building2, FileText, Landmark, Coins, ClipboardCheck, Scale, MapPin } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home, building: Building2, file: FileText, landmark: Landmark,
  coins: Coins, 'clipboard-check': ClipboardCheck, scale: Scale, map: MapPin,
};

const navSections = [
  { title: 'Scottish Schemes', items: [
    { id: 'htb', icon: 'home', label: 'Help to Buy Scotland', prompt: 'Explain Help to Buy Scotland — who qualifies, how much equity loan, and how to apply.' },
    { id: 'lift', icon: 'building', label: 'LIFT / Shared Equity', prompt: 'How does the LIFT Shared Equity scheme work in Scotland? Explain OMSE and NSSE.' },
    { id: 'lbtt', icon: 'file', label: 'LBTT Relief', prompt: 'What LBTT first-time buyer relief is available in Scotland? Show me the bands.' },
    { id: 'first-home', icon: 'landmark', label: 'First Home Fund', prompt: 'What was the First Home Fund in Scotland and what has replaced it?' },
  ]},
  { title: 'Finance', items: [
    { id: 'deposit', icon: 'coins', label: 'Deposit Requirements', prompt: 'How much deposit do I need to buy a home in Scotland as a first-time buyer?' },
    { id: 'mip', icon: 'file', label: 'Mortgage in Principle', prompt: 'What is a mortgage in principle and do I need one before making an offer in Scotland?' },
    { id: 'rates', icon: 'file', label: 'Fixed vs Tracker', prompt: 'Should I choose a fixed or tracker rate mortgage in Scotland?' },
    { id: 'dev-incentives', icon: 'building', label: 'Developer Incentives', prompt: 'What developer incentives are common on Scottish new builds?' },
  ]},
  { title: 'Buying Process', items: [
    { id: 'conveyancing', icon: 'landmark', label: 'Scottish Conveyancing', prompt: 'Walk me through the Scottish property buying process step by step — missives, Home Report, closing dates.' },
    { id: 'offers', icon: 'file', label: 'Making an Offer', prompt: 'How does making an offer work in Scotland? What are offers over, fixed price, and closing dates?' },
    { id: 'snagging', icon: 'clipboard-check', label: 'Snagging Surveys', prompt: 'What is a snagging survey and when should I commission one on a Scottish new build?' },
    { id: 'solicitor', icon: 'scale', label: 'Finding a Solicitor', prompt: 'How do I find a solicitor to buy a property in Scotland?' },
  ]},
  { title: 'Areas', items: [
    { id: 'edinburgh', icon: 'map', label: 'Edinburgh & Lothians', prompt: 'What are the best new build areas in Edinburgh and the Lothians for first-time buyers? Include prices.' },
    { id: 'glasgow', icon: 'map', label: 'Glasgow & West', prompt: 'What new build developments are available in Glasgow and the West of Scotland?' },
    { id: 'aberdeen', icon: 'map', label: 'Aberdeen & North', prompt: 'What new build homes are available in Aberdeen and the north of Scotland?' },
    { id: 'dundee', icon: 'map', label: 'Dundee & Tayside', prompt: 'What new build developments are available in Dundee and Tayside?' },
    { id: 'highlands', icon: 'map', label: 'Highlands & Islands', prompt: 'What new build homes and rural schemes are available in the Scottish Highlands and Islands?' },
    { id: 'stirling', icon: 'map', label: 'Stirling & Falkirk', prompt: 'What new build developments are available in Stirling and Falkirk?' },
  ]},
];

interface SidebarProps { className?: string; onNavClick?: (prompt: string) => void; }

export function Sidebar({ className, onNavClick }: SidebarProps) {
  const [collapsed, setCollapsed] = useLocalStorage('sidebar-collapsed', false);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  return (
    <motion.aside
      initial={{ x:-20, opacity:0 }}
      animate={{ x:0, opacity:1, width: collapsed ? 80 : 280 }}
      transition={{ duration:0.4, ease:[0.16,1,0.3,1], width:{ duration:0.3 } }}
      className={cn("flex flex-col bg-background border-r border-border flex-shrink-0", className)}
      style={{ height:'100vh', overflow:'hidden' }}
    >
      {/* Brand */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-border/50 flex-shrink-0">
        <Logo collapsed={collapsed as boolean} />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Nav */}
      <div style={{ flex:1, minHeight:0, overflowY:'scroll', overflowX:'hidden', padding:'16px 12px' }}>
        <AnimatePresence mode="wait">
          {navSections.map((section, si) => (
            <motion.div key={section.title} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:si*0.08+0.2 }} className="mb-5">
              {!collapsed && <h3 className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{section.title}</h3>}
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = iconMap[item.icon] || Home;
                  const isActive = activeItem === item.id;
                  return (
                    <button key={item.id}
                      onClick={() => { setActiveItem(item.id); if (item.prompt && onNavClick) onNavClick(item.prompt); }}
                      className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left border",
                        isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60 border-transparent")}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-emerald-400" : "opacity-70")} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className={cn("p-4 border-t border-border/50 flex-shrink-0", collapsed && "flex justify-center")}>
        {!collapsed ? (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-background" id="userInitials">?</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate" id="userName">Guest</p>
              <p className="text-xs text-muted-foreground truncate" id="userRole">First-time buyer</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <span className="text-xs font-semibold text-background">?</span>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
