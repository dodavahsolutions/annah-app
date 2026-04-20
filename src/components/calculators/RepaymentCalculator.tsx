import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCountUp } from '@/hooks/useCountUp';
import { calculateMonthlyRepayment, calculateTotalInterest, formatCurrency } from '@/lib/calculations';

export function RepaymentCalculator() {
  const [loanAmount, setLoanAmount] = useState(180000);
  const [interestRate, setInterestRate] = useState(4.5);
  const [termYears, setTermYears] = useState(25);

  const monthlyPayment = useMemo(() => 
    calculateMonthlyRepayment({ loanAmount, interestRate, termYears }),
    [loanAmount, interestRate, termYears]
  );

  const totalInterest = useMemo(() => 
    calculateTotalInterest({ loanAmount, interestRate, termYears }),
    [loanAmount, interestRate, termYears]
  );

  const animatedMonthly = useCountUp(monthlyPayment, {
    duration: 500,
    prefix: '£',
  });

  const animatedInterest = useCountUp(totalInterest, {
    duration: 500,
    prefix: '£',
  });

  return (
    <div className="space-y-5">
      {/* Loan Amount */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Loan Amount
          </Label>
          <span className="text-sm font-medium text-emerald-400">
            {formatCurrency(loanAmount)}
          </span>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">£</span>
          <Input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="pl-7 bg-secondary border-border text-right"
          />
        </div>
        <Slider
          value={[loanAmount]}
          onValueChange={([value]) => setLoanAmount(value)}
          min={50000}
          max={500000}
          step={5000}
          className="py-1"
        />
      </div>

      {/* Interest Rate */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Interest Rate
          </Label>
          <span className="text-sm font-medium text-emerald-400">
            {interestRate.toFixed(1)}%
          </span>
        </div>
        <div className="relative">
          <Input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            step={0.1}
            className="pr-8 bg-secondary border-border text-right"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
        </div>
        <Slider
          value={[interestRate]}
          onValueChange={([value]) => setInterestRate(value)}
          min={1}
          max={10}
          step={0.1}
          className="py-1"
        />
      </div>

      {/* Term */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Mortgage Term
          </Label>
          <span className="text-sm font-medium text-emerald-400">
            {termYears} years
          </span>
        </div>
        <Slider
          value={[termYears]}
          onValueChange={([value]) => setTermYears(value)}
          min={5}
          max={40}
          step={1}
          className="py-1"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5 years</span>
          <span>40 years</span>
        </div>
      </div>

      {/* Results */}
      <motion.div 
        className="pt-4 border-t border-border/50 space-y-3"
        layout
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Monthly Payment</span>
          <motion.span 
            className="text-2xl font-bold text-emerald-400"
            key={monthlyPayment}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {animatedMonthly}
          </motion.span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Interest</span>
          <span className="text-sm font-medium text-foreground">
            {animatedInterest}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
