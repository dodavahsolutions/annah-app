import { motion } from 'framer-motion';
import { Calculator, Percent, TrendingUp, PieChart, ArrowUpCircle, RefreshCw, Key, Info } from 'lucide-react';
import { CalculatorCard } from './CalculatorCard';
import { RepaymentCalculator } from './calculators/RepaymentCalculator';
import { LBTTCalculator } from './calculators/LBTTCalculator';
import { AffordabilityCalc } from './calculators/AffordabilityCalc';
import { LTVCalculator } from './calculators/LTVCalculator';
import { OverpaymentCalc } from './calculators/OverpaymentCalc';
import { RemortgageCalc } from './calculators/RemortgageCalc';
import { BTLCalculator } from './calculators/BTLCalculator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const calcs = [
  { title: 'Monthly Repayment', icon: Calculator, component: RepaymentCalculator, delay: 0.3 },
  { title: 'Affordability Check', icon: TrendingUp, component: AffordabilityCalc, delay: 0.35 },
  { title: 'LBTT Calculator', icon: Percent, component: LBTTCalculator, delay: 0.4 },
  { title: 'LTV & Deposit', icon: PieChart, component: LTVCalculator, delay: 0.45 },
  { title: 'Overpayment Savings', icon: ArrowUpCircle, component: OverpaymentCalc, delay: 0.5 },
  { title: 'Remortgage Compare', icon: RefreshCw, component: RemortgageCalc, delay: 0.55 },
  { title: 'Buy-to-Let Yield', icon: Key, component: BTLCalculator, delay: 0.6 },
];

export function ToolsPanel() {
  return (
    <motion.aside
      initial={{ x:20, opacity:0 }}
      animate={{ x:0, opacity:1 }}
      transition={{ duration:0.4, delay:0.2 }}
      style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:'hsl(220 18% 5%)', borderLeft:'1px solid hsl(220 13% 14%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold text-foreground">Mortgage Tools</h2>
          <span className="text-xs text-muted-foreground">7 calculators</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="text-xs">All calculations are indicative only. Consult a qualified mortgage advisor.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Scrollable calculators */}
      <div style={{ flex:1, minHeight:0, overflowY:'scroll', overflowX:'hidden', padding:'16px' }}>
        <div className="space-y-3">
          {calcs.map(({ title, icon: Icon, component: Comp, delay }) => (
            <motion.div key={title} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay }}>
              <CalculatorCard title={title} icon={Icon}>
                <Comp />
              </CalculatorCard>
            </motion.div>
          ))}
        </div>
        <motion.div className="mt-4 p-4 bg-secondary/30 rounded-xl border border-border/50" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }}>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland:</span> LBTT rates and first-time buyer relief apply across Scotland. Administered by Revenue Scotland, not HMRC.
          </p>
        </motion.div>
      </div>
    </motion.aside>
  );
}
