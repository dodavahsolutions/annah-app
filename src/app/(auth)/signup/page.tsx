'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Loader2, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-card text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Check your email</h2>
          <p className="text-sm text-muted-foreground mb-6">
            We sent a confirmation link to <span className="text-foreground font-medium">{email}</span>. Click it to activate your account.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full">Back to sign in</Button>
          </Link>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-semibold text-foreground mb-1">Create account</h1>
        <p className="text-sm text-muted-foreground mb-6">Save your conversations and get personalised advice</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Alex Smith"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

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
              placeholder="8+ characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-background font-medium" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Sign in
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
