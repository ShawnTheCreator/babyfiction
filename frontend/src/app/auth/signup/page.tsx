"use client";
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { fetchJson } from '@/lib/api';

export const dynamic = 'force-dynamic';

function SignupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdmin = (searchParams.get('role') || '').toLowerCase() === 'admin';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Password validation
  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isPasswordValid) {
      setError('Password does not meet requirements');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await fetchJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      router.push('/auth/login');
    } catch (err: any) {
      setError(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-zinc-900 via-neutral-800 to-zinc-900 text-white flex items-center justify-center p-6">
      <div className="relative w-full max-w-md">
        <div className="mb-4">
          <a href="/" className="text-sm text-zinc-300 hover:text-white">← Back to Home</a>
        </div>
        <div className="absolute -top-10 -left-10 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-white/10 blur-xl" />

        <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">{isAdmin ? 'Create Admin Account' : 'Join Babyfiction'}</h1>
            <p className="mt-2 text-sm text-zinc-300">{isAdmin ? 'Admin signup (demo)' : 'Create your account to shop and review'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300">First name</label>
              <input
                type="text"
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
                placeholder="Your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">Surname</label>
              <input
                type="text"
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
                placeholder="Your surname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">Email</label>
              <input
                type="email"
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">Password</label>
              <div className="relative mt-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 pr-10 text-white placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {(passwordFocused || password) && (
                <div className="mt-2 space-y-1 text-xs">
                  <p className={`flex items-center gap-1 ${passwordRequirements.minLength ? 'text-green-400' : 'text-zinc-400'}`}>
                    <span>{passwordRequirements.minLength ? '✓' : '○'}</span> At least 8 characters
                  </p>
                  <p className={`flex items-center gap-1 ${passwordRequirements.hasUpperCase ? 'text-green-400' : 'text-zinc-400'}`}>
                    <span>{passwordRequirements.hasUpperCase ? '✓' : '○'}</span> One uppercase letter
                  </p>
                  <p className={`flex items-center gap-1 ${passwordRequirements.hasLowerCase ? 'text-green-400' : 'text-zinc-400'}`}>
                    <span>{passwordRequirements.hasLowerCase ? '✓' : '○'}</span> One lowercase letter
                  </p>
                  <p className={`flex items-center gap-1 ${passwordRequirements.hasNumber ? 'text-green-400' : 'text-zinc-400'}`}>
                    <span>{passwordRequirements.hasNumber ? '✓' : '○'}</span> One number
                  </p>
                  <p className={`flex items-center gap-1 ${passwordRequirements.hasSpecialChar ? 'text-green-400' : 'text-zinc-400'}`}>
                    <span>{passwordRequirements.hasSpecialChar ? '✓' : '○'}</span> One special character (!@#$%^&*)
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">Confirm Password</label>
              <div className="relative mt-2">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 pr-10 text-white placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-white text-black py-2.5 font-medium shadow hover:bg-zinc-100 disabled:opacity-50"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Already have an account? <a href="/auth/login" className="underline hover:text-white">Sign in</a>
          </p>
          <p className="mt-2 text-center text-sm text-zinc-400">
            <a href="/" className="underline hover:text-white">Go to Home</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading…</div>}>
      <SignupInner />
    </Suspense>
  );
}