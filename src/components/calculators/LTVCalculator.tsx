'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useCountUp } from '@/hooks/useCountUp';
import { calculateLTV, formatCurrency, formatPercent } from '@/lib/calculations';
import { Home, Wallet } from 'lucide-react';

export function LTVCalculator() {
  const [propertyPrice, setPropertyPrice] = useState(200000);
  const [deposit, setDeposit] = useState(20000);

  const result = useMemo(() => 
    calculateLTV({ propertyPrice, deposit }),
    [propertyPrice, deposit]
  );

  const animatedLTV = useCountUp(result.ltv, {
    duration: 400,
    suffix: '%',
    decimals: 1,
  });

  // Determine LTV tier
  const getLTVTier = (ltv: number) => {
    if (ltv <= 60) return { label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500' };
    if (ltv <= 75) return { label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500' };
    if (ltv <= 85) return { label: 'Fair', color: 'text-amber-400', bg: 'bg-amber-500' };
    return { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500' };
  };

  const tier = getLTVTier(result.ltv);

  return (
    <div className="space-y-5">
      {/* Property Price */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5" />
            Property Price
          </Label>
          <span className="text-sm font-medium text-emerald-400">
            {formatCurrency(propertyPrice)}
          </span>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">£</span>
          <Input
            type="number"
            value={propertyPrice}
            onChange={(e) => setPropertyPrice(Number(e.target.value))}
            className="pl-7 bg-secondary border-border text-right"
          />
        </div>
        <Slider
          value={[propertyPrice]}
          onValueChange={([value]) => setPropertyPrice(value)}
          min={50000}
          max={1000000}
          step={5000}
          className="py-1"
        />
      </div>

      {/* Deposit */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" />
            Deposit
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
          max={Math.min(propertyPrice, 200000)}
          step={1000}
          className="py-1"
        />
      </div>

      {/* Results */}
      <motion.div 
        className="pt-4 border-t border-border/50 space-y-4"
        layout
      >
        {/* LTV Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Loan-to-Value (LTV)</span>
            <div className="flex items-center gap-2">
              <motion.span 
                className={`text-2xl font-bold ${tier.color}`}
                key={result.ltv}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {animatedLTV}
              </motion.span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${tier.bg}/20 ${tier.color}`}>
                {tier.label}
              </span>
            </div>
          </div>
          
          {/* Visual Bar */}
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div 
              className={`h-full ${tier.bg} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(result.ltv, 100)}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Loan Amount</p>
            <p className="text-sm font-medium text-foreground">{formatCurrency(result.loanAmount)}</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Deposit</p>
            <p className="text-sm font-medium text-foreground">{formatPercent(result.depositPercentage)}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
