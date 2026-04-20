import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveLead } from '@/lib/anna';

interface LeadCaptureModalProps {
  open: boolean;
  onComplete: (name?: string) => void;
}

export function LeadCaptureModal({ open, onComplete }: LeadCaptureModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [isFTB, setIsFTB] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Please enter your name and email to continue.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await saveLead({
        timestamp: new Date().toLocaleString('en-GB'),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || '—',
        area: area.trim() || '—',
        ftb: isFTB ? 'Yes' : 'No',
        source: window.location.hostname,
      });
      setSuccess(true);
      setTimeout(() => onComplete(name.trim()), 1800);
    } catch {
      setLoading(false);
      onComplete(name.trim());
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-background border border-border rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-900 to-teal-800 px-6 py-6 text-center relative">
              <button
                onClick={() => onComplete()}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3">
                <Home className="w-6 h-6 text-emerald-300" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-1">
                {success ? "You're all set!" : 'Get personalised guidance'}
              </h2>
              <p className="text-sm text-white/70">
                {success
                  ? 'Anna will tailor her answers to your situation.'
                  : 'Let Anna know a bit about you for tailored advice across Scotland.'}
              </p>
            </div>

            {/* Body */}
            <div className="p-6">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-muted-foreground text-sm">Connecting you with Anna now…</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Full name *</Label>
                      <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Jamie MacDonald"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Email *</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="jamie@example.com"
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Phone</Label>
                      <Input
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="07700 900000"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Area in Scotland</Label>
                      <Input
                        value={area}
                        onChange={e => setArea(e.target.value)}
                        placeholder="e.g. Glasgow"
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>

                  {/* FTB toggle */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Are you a first-time buyer?</Label>
                    <div className="flex bg-secondary rounded-lg p-1 gap-1">
                      <button
                        onClick={() => setIsFTB(true)}
                        className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-all ${isFTB ? 'bg-emerald-500 text-background' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        Yes, first-time buyer
                      </button>
                      <button
                        onClick={() => setIsFTB(false)}
                        className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-all ${!isFTB ? 'bg-emerald-500 text-background' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        No, bought before
                      </button>
                    </div>
                  </div>

                  {error && <p className="text-xs text-red-400">{error}</p>}

                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-background font-medium"
                  >
                    {loading ? 'Saving…' : 'Continue chatting with Anna →'}
                  </Button>

                  <button
                    onClick={() => onComplete()}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                  >
                    Skip for now
                  </button>

                  <p className="text-[10.5px] text-muted-foreground text-center leading-relaxed">
                    Your details are kept private. By continuing you agree to be contacted about mortgage guidance.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
