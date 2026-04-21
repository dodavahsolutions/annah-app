'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/calculations';

function calcMonthly(P: number, r: number, n: number) {
  if (r === 0) return P / n;
  const mr = r / 12;
  return P * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
}

export function RemortgageCalc() {
  const [balance, setBalance] = useState(160000);
  const [termYears, setTermYears] = useState(20);
  const [curRate, setCurRate] = useState(5.5);
  const [newRate, setNewRate] = useState(4.2);
  const [fees, setFees] = useState(1500);
  const [erc, setErc] = useState(0);

  const result = useMemo(() => {
    if (!balance || !termYears) return null;
    const n = termYears * 12;
    const cmo = calcMonthly(balance, curRate / 100, n);
    const nmo = calcMonthly(balance, newRate / 100, n);
    const msave = cmo - nmo;
    const totalCost = fees + erc;
    const be = msave > 0 ? totalCost / msave : Infinity;
    return { cmo, nmo, msave, totalCost, be, save2: msave * 24 - totalCost, save5: msave * 60 - totalCost };
  }, [balance, termYears, curRate, newRate, fees, erc]);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Outstanding balance (£)</Label>
        <Input type="number" value={balance} onChange={e => setBalance(+e.target.value)} className="bg-secondary border-border text-right" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Current rate (%)</Label><Input type="number" value={curRate} onChange={e => setCurRate(+e.target.value)} step={0.1} className="bg-secondary border-border text-right" /></div>
        <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">New rate (%)</Label><Input type="number" value={newRate} onChange={e => setNewRate(+e.target.value)} step={0.1} className="bg-secondary border-border text-right" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Term left (yrs)</Label><Input type="number" value={termYears} onChange={e => setTermYears(+e.target.value)} className="bg-secondary border-border text-right" /></div>
        <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Total fees (£)</Label><Input type="number" value={fees} onChange={e => setFees(+e.target.value)} className="bg-secondary border-border text-right" /></div>
      </div>
      <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">ERC to exit (£)</Label><Input type="number" value={erc} onChange={e => setErc(+e.target.value)} className="bg-secondary border-border text-right" /></div>

      {result && (
        <motion.div className="pt-3 border-t border-border/50 space-y-2.5" layout>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Monthly saving</span>
            <motion.span className={`text-xl font-bold ${result.msave > 0 ? 'text-emerald-400' : 'text-red-400'}`} key={result.msave} initial={{ scale: 1.1 }} animate={{ scale: 1 }}>
              {formatCurrency(Math.abs(result.msave))}/mo
            </motion.span>
          </div>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Current monthly</span><span className="text-sm font-medium">{formatCurrency(result.cmo)}</span></div>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">New monthly</span><span className="text-sm font-medium text-emerald-400">{formatCurrency(result.nmo)}</span></div>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Break-even</span>
            <span className={`text-sm font-medium ${isFinite(result.be) ? 'text-yellow-400' : 'text-red-400'}`}>
              {isFinite(result.be) && result.msave > 0 ? `${result.be.toFixed(1)} months` : 'No saving'}
            </span>
          </div>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">2-year net saving</span><span className={`text-sm font-medium ${result.save2 > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(result.save2)}</span></div>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">5-year net saving</span><span className={`text-sm font-medium ${result.save5 > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(result.save5)}</span></div>
        </motion.div>
      )}
    </div>
  );
}
