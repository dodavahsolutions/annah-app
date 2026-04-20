import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useCountUp } from '@/hooks/useCountUp';
import { calculateAffordability, formatCurrency } from '@/lib/calculations';
import { TrendingUp, Home, PiggyBank } from 'lucide-react';

export function AffordabilityCalc() {
  const [annualIncome, setAnnualIncome] = useState(35000);
  const [deposit, setDeposit] = useState(20000);

  const result = useMemo(() => 
    calculateAffordability({ annualIncome, deposit }),
    [annualIncome, deposit]
  );

  const animatedBorrowing = useCountUp(result.maxBorrowing, {
    duration: 500,
    prefix: '£',
  });

  const animatedPropertyPrice = useCountUp(result.maxPropertyPrice, {
    duration: 500,
    prefix: '£',
  });

  return (
    <div className="space-y-5">
      {/* Annual Income */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Annual Income
          </Label>
          <span className="text-sm font-medium text-emerald-400">
            {formatCurrency(annualIncome)}
          </span>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">£</span>
          <Input
            type="number"
            value={annualIncome}
            onChange={(e) => setAnnualIncome(Number(e.target.value))}
            className="pl-7 bg-secondary border-border text-right"
          />
        </div>
        <Slider
          value={[annualIncome]}
          onValueChange={([value]) => setAnnualIncome(value)}
          min={15000}
          max={150000}
          step={1000}
          className="py-1"
        />
      </div>

      {/* Deposit */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <PiggyBank className="w-3.5 h-3.5" />
            Deposit Saved
          </Label>
          <span className="text-sm font-medium text-emerald-400">
            {formatCurrency(deposit)}
          </span>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">£</span>
          <Input
            type="number"
            value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value))}
            className="pl-7 bg-secondary border-border text-right"
          />
        </div>
        <Slider
          value={[deposit]}
          onValueChange={([value]) => setDeposit(value)}
          min={0}
          max={100000}
          step={1000}
          className="py-1"
        />
      </div>

      {/* Results */}
      <motion.div 
        className="pt-4 border-t border-border/50 space-y-4"
        layout
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Max Borrowing</span>
          </div>
          <div className="text-right">
            <motion.span 
              className="text-xl font-bold text-emerald-400"
              key={result.maxBorrowing}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {animatedBorrowing}
            </motion.span>
            <p className="text-[10px] text-muted-foreground">
              {result.incomeMultiplier}x income
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Max Property Price</span>
          </div>
          <motion.span 
            className="text-xl font-bold text-foreground"
            key={result.maxPropertyPrice}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {animatedPropertyPrice}
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}
