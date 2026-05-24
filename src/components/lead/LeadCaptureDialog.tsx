'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, Home } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { COUNCIL_AREAS } from '@/content/areas';
import { SCHEMES } from '@/content/schemes';
import type { LeadTimeline } from '@/lib/lead-scoring';

const TIMELINE_OPTIONS: ReadonlyArray<{ value: LeadTimeline; label: string }> = [
  { value: 'asap', label: 'As soon as possible' },
  { value: '3m', label: 'Within 3 months' },
  { value: '6m', label: 'Within 6 months' },
  { value: '12m+', label: '12+ months' },
  { value: 'browsing', label: 'Just browsing for now' },
];

const CONSENT_TEXT =
  'I consent to ANNAH sharing my details with a regulated mortgage broker partner so they can contact me about my enquiry.';

interface LeadCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Engagement depth — forwarded to the server for lead scoring. */
  engagementMessages: number;
  /** Whether the user uploaded a document — a scoring signal. */
  hasUploadedDoc: boolean;
  /** Called after a successful submission. */
  onSubmitted: () => void;
}

export function LeadCaptureDialog({
  open,
  onOpenChange,
  engagementMessages,
  hasUploadedDoc,
  onSubmitted,
}: LeadCaptureDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState<LeadTimeline | ''>('');
  const [schemes, setSchemes] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const toggleScheme = (id: string) => {
    setSchemes((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError('Please tick the consent box so we can pass your details to a broker.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          purchaseArea: area || undefined,
          budget: budget ? Number(budget) : undefined,
          timeline: timeline || undefined,
          schemeInterest: schemes.length ? schemes : undefined,
          engagementMessages,
          hasUploadedDoc,
          consent: true,
          consentText: CONSENT_TEXT,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      setDone(true);
      onSubmitted();
    } catch {
      setError('Could not reach the server. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        {done ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <DialogTitle className="text-lg">You&apos;re all set</DialogTitle>
            <DialogDescription>
              Thanks{name ? `, ${name.split(' ')[0]}` : ''} — a regulated broker partner will be
              in touch shortly. We&apos;ve recorded your enquiry.
            </DialogDescription>
            <Button
              className="mt-2 bg-emerald-500 hover:bg-emerald-600 text-background"
              onClick={() => onOpenChange(false)}
            >
              Back to chat
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Home className="w-4 h-4 text-background" />
                </div>
                <DialogTitle>Speak to a mortgage broker</DialogTitle>
              </div>
              <DialogDescription>
                Get matched with a regulated broker in Scotland — free, no obligation. Tell us a
                little about your plans.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="lead-name">Name</Label>
                  <Input
                    id="lead-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    maxLength={120}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lead-phone">Phone (optional)</Label>
                  <Input
                    id="lead-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    maxLength={40}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lead-email">Email</Label>
                <Input
                  id="lead-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  maxLength={200}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Purchase area</Label>
                  <Select value={area} onValueChange={setArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNCIL_AREAS.map((a) => (
                        <SelectItem key={a.slug} value={a.name}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lead-budget">Budget (£)</Label>
                  <Input
                    id="lead-budget"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. 250000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Timeline</Label>
                <Select value={timeline} onValueChange={(v) => setTimeline(v as LeadTimeline)}>
                  <SelectTrigger>
                    <SelectValue placeholder="When are you looking to buy?" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMELINE_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Schemes you&apos;re interested in (optional)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SCHEMES.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer"
                    >
                      <Checkbox
                        checked={schemes.includes(s.id)}
                        onCheckedChange={() => toggleScheme(s.id)}
                      />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer pt-1">
                <Checkbox
                  className="mt-0.5"
                  checked={consent}
                  onCheckedChange={(v) => setConsent(v === true)}
                />
                <span>{CONSENT_TEXT}</span>
              </label>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-background font-medium"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect me with a broker'}
              </Button>

              <p className="text-[11px] text-muted-foreground text-center">
                ANNAH provides guidance only and is not regulated financial advice.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
