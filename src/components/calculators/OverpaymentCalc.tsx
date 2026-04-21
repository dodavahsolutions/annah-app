'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/calculations';

function calcMonthly(P: number, r: number, n: number) {
  if (r === 0) return P / n;
  const mr = r / 12;
  return P * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
}

export function OverpaymentCalc() {
  const [balance, setBalance] = useState(180000);
  const [rate, setRate] = useState(4.5);
  const [termYears, setTermYears] = useState(22);
  const [extra, setExtra] = useState(200);
  const [ercPct, setErcPct] = useState(10);

  const result = useMemo(() => {
    if (!balance || !termYears) return null;
    const n = termYears * 12;
    const stdMo = calcMonthly(balance, rate / 100, n);
    const newMo = stdMo + extra;
    let totalInt = 0, b = balance;
    for (let i = 0; i < n; i++) {
      const int = b * (rate / 100 / 12);
      totalInt += int;
      b -= (stdMo - int);
      if (b < 0) break;
    }
    let totalIntNew = 0, b2 = balance, mo2 = 0;
    while (b2 > 0.01 && mo2 < n * 2) {
      const int = b2 * (rate / 100 / 12);
      totalIntNew += int;
      const prin = Math.min(newMo - int, b2);
      b2 -= prin; mo2++;
      if (b2 < 0.01) break;
    }
    const yrsShaved = (n - mo2) / 12;
    const intSaved = totalInt - totalIntNew;
    const ercLimit = balance * ercPct / 100;
    const annualExtra = extra * 12;
    const ercOk = ercPct === 0 || annualExtra <= ercLimit;
    const newDate = new Date();
    newDate.setMonth(newDate.getMonth() + mo2);
    return { intSaved, yrsShaved, newDate: newDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }), ercOk, ercLimit, annualExtra };
  }, [balance, rate, termYears, extra, ercPct]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between"><Label className="text-xs text-muted-foreground uppercase tracking-wide">Balance</Label><span className="text-xs text-emerald-400">{formatCurrency(balance)}</span></div>
        <Input type="number" value={balance} onChange={e => setBalance(+e.target.value)} className="bg-secondary border-border text-right" />
        <Slider value={[balance]} onValueChange={([v]) => setBalance(v)} min={10000} max={500000} step={5000} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Rate (%)</Label>
          <Input type="number" value={rate} onChange={e => setRate(+e.target.value)} step={0.1} className="bg-secondary border-border text-right" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Term left (yrs)</Label>
          <Input type="number" value={termYears} onChange={e => setTermYears(+e.target.value)} className="bg-secondary border-border text-right" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between"><Label className="text-xs text-muted-foreground uppercase tracking-wide">Monthly overpayment</Label><span className="text-xs text-emerald-400">{formatCurrency(extra)}/mo</span></div>
        <Input type="number" value={extra} onChange={e => setExtra(+e.target.value)} className="bg-secondary border-border text-right" />
        <Slider value={[extra]} onValueChange={([v]) => setExtra(v)} min={0} max={2000} step={50} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">ERC allowance (% of balance/yr)</Label>
        <Input type="number" value={ercPct} onChange={e => setErcPct(+e.target.value)} className="bg-secondary border-border text-right" />
      </div>
      {result && (
        <motion.div className="pt-3 border-t border-border/50 space-y-2.5" layout>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Interest saved</span><motion.span className="text-xl font-bold text-emerald-400" key={result.intSaved} initial={{ scale: 1.1 }} animate={{ scale: 1 }}>{formatCurrency(result.intSaved)}</motion.span></div>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Years shaved off</span><span className="text-sm font-medium text-foreground">{result.yrsShaved.toFixed(1)} yrs</span></div>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">New payoff date</span><span className="text-sm font-medium text-foreground">{result.newDate}</span></div>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">ERC status</span>
            <span className={`text-sm font-medium ${result.ercOk ? 'text-emerald-400' : 'text-red-400'}`}>
              {ercPct === 0 ? 'No ERC set' : result.ercOk ? '✓ Within limit' : '⚠ Exceeds limit'}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
