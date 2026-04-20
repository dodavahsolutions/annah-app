import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useCountUp } from '@/hooks/useCountUp';
import { calculateLBTT, formatCurrency } from '@/lib/calculations';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function LBTTCalculator() {
  const [purchasePrice, setPurchasePrice] = useState(200000);
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(true);

  const result = useMemo(() => 
    calculateLBTT({ purchasePrice, isFirstTimeBuyer }),
    [purchasePrice, isFirstTimeBuyer]
  );

  const animatedTotal = useCountUp(result.total, {
    duration: 400,
    prefix: '£',
  });

  return (
    <div className="space-y-5">
      {/* Purchase Price */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Purchase Price
          </Label>
          <span className="text-sm font-medium text-emerald-400">
            {formatCurrency(purchasePrice)}
          </span>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">£</span>
          <Input
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(Number(e.target.value))}
            className="pl-7 bg-secondary border-border text-right"
          />
        </div>
        <Slider
          value={[purchasePrice]}
          onValueChange={([value]) => setPurchasePrice(value)}
          min={50000}
          max={1000000}
          step={5000}
          className="py-1"
        />
      </div>

      {/* First Time Buyer Toggle */}
      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-foreground cursor-pointer" htmlFor="ftb-toggle">
            First-Time Buyer
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">First-time buyers pay 0% LBTT on properties up to £175,000</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Switch
          id="ftb-toggle"
          checked={isFirstTimeBuyer}
          onCheckedChange={setIsFirstTimeBuyer}
        />
      </div>

      {/* Results */}
      <motion.div 
        className="pt-4 border-t border-border/50 space-y-3"
        layout
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">LBTT Due</span>
          <motion.span 
            className="text-2xl font-bold text-emerald-400"
            key={result.total}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {animatedTotal}
          </motion.span>
        </div>

        {/* Band Breakdown */}
        {result.breakdown.length > 0 && (
          <div className="space-y-1.5 pt-2">
            {result.breakdown.map((band, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{band.band}</span>
                <span className="text-foreground">{formatCurrency(band.tax)}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
