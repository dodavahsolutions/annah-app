'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-glow">
          <Home className="w-5 h-5 text-background" />
        </div>
        <div>
          <span className="text-xl font-bold text-foreground">Anna</span>
          <p className="text-xs text-muted-foreground">Scotland Mortgage Advisor</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-foreground mb-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground mb-6">Sign in to access your saved conversations</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-background font-medium" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            No account?{' '}
            <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 text-center">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Continue as guest →
          </Link>
        </div>
      </div>
    </div>
  );
}
