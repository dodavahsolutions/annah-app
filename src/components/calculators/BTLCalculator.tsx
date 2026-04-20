import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { formatCurrency } from '@/lib/calculations';

export function BTLCalculator() {
  const [propVal, setPropVal] = useState(250000);
  const [loanAmt, setLoanAmt] = useState(187500);
  const [rate, setRate] = useState(4.8);
  const [rent, setRent] = useState(1200);
  const [costs, setCosts] = useState(150);

  const result = useMemo(() => {
    if (!propVal || !loanAmt) return null;
    const io = loanAmt * (rate / 100 / 12);
    const grossY = (rent * 12 / propVal) * 100;
    const netY = ((rent - costs) * 12 - io * 12) / propVal * 100;
    const cf = rent - io - costs;
    const ltv = (loanAmt / propVal) * 100;
    const stressNeeded = loanAmt * (0.05 / 12) * 1.45;
    const passes = rent >= stressNeeded;
    return { io, grossY, netY, cf, ltv, stressNeeded, passes };
  }, [propVal, loanAmt, rate, rent, costs]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex justify-between"><Label className="text-xs text-muted-foreground uppercase tracking-wide">Property value</Label><span className="text-xs text-emerald-400">{formatCurrency(propVal)}</span></div>
        <Input type="number" value={propVal} onChange={e => setPropVal(+e.target.value)} className="bg-secondary border-border text-right" />
        <Slider value={[propVal]} onValueChange={([v]) => setPropVal(v)} min={50000} max={1000000} step={5000} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Loan (£)</Label><Input type="number" value={loanAmt} onChange={e => setLoanAmt(+e.target.value)} className="bg-secondary border-border text-right" /></div>
        <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Rate (%)</Label><Input type="number" value={rate} onChange={e => setRate(+e.target.value)} step={0.1} className="bg-secondary border-border text-right" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Monthly rent (£)</Label><Input type="number" value={rent} onChange={e => setRent(+e.target.value)} className="bg-secondary border-border text-right" /></div>
        <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Monthly costs (£)</Label><Input type="number" value={costs} onChange={e => setCosts(+e.target.value)} className="bg-secondary border-border text-right" /></div>
      </div>

      {result && (
        <motion.div className="pt-3 border-t border-border/50 space-y-2.5" layout>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">IO payment</span><motion.span className="text-xl font-bold text-emerald-400" key={result.io} initial={{ scale: 1.1 }} animate={{ scale: 1 }}>{formatCurrency(result.io)}/mo</motion.span></div>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Gross yield</span><span className="text-sm font-medium">{result.grossY.toFixed(2)}%</span></div>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Net yield</span><span className={`text-sm font-medium ${result.netY > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{result.netY.toFixed(2)}%</span></div>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Monthly cash flow</span><span className={`text-sm font-medium ${result.cf > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(result.cf)}/mo</span></div>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">LTV</span><span className="text-sm font-medium">{result.ltv.toFixed(1)}%</span></div>
          <div className="pt-1 border-t border-border/30">
            <div className="flex justify-between"><span className="text-xs text-muted-foreground">Stress test (5%/145%)</span>
              <span className={`text-xs font-semibold ${result.passes ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.passes ? '✓ Passes' : '✗ Fails'}
              </span>
            </div>
            <p className="text-[10.5px] text-muted-foreground mt-1">Needs {formatCurrency(result.stressNeeded)}/mo · You have {formatCurrency(rent)}/mo</p>
          </div>
        </motion.div>
      )}
      <p className="text-[10.5px] text-muted-foreground">Scottish PRT rules apply · BTL rental income is taxable · Seek professional tax advice</p>
    </div>
  );
}
