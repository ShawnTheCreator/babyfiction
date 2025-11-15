"use client";
export const dynamic = 'force-dynamic';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchJson, setAuthToken } from '@/lib/api';

export default function VerifyPage() {
  const router = useRouter();
  const params = useSearchParams();
  const mode = (params.get('mode') || 'login') as 'login' | 'signup';
  const initialEmail = params.get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !code) {
      setError('Email and PIN are required');
      return;
    }
    setLoading(true);
    try {
      const res: any = await fetchJson('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, code, purpose: mode }),
      });
      const token = res?.token;
      if (!token) throw new Error('Verification failed');
      setAuthToken(token);
      // Optional: fetch user and route by role
      try {
        const me: any = await fetchJson('/api/auth/me');
        const user = me?.data || me?.user || me;
        const role = user?.role;
        router.push(role === 'admin' ? '/admin' : '/');
      } catch {
        router.push('/');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to verify PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-zinc-900 text-white flex items-center justify-center p-6">Loading…</div>}>
      <div className="min-h-screen w-full bg-gradient-to-br from-zinc-900 via-neutral-800 to-zinc-900 text-white flex items-center justify-center p-6">
        <div className="relative w-full max-w-md">
          <div className="mb-4">
            <Link href="/" className="text-sm text-zinc-300 hover:text-white">← Back to Home</Link>
          </div>
          <div className="absolute -top-10 -left-10 h-24 w-24 rounded-full bg-white/10 blur-xl" />
          <div className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-white/10 blur-xl" />
          <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-8 shadow-2xl">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight">Enter Verification PIN</h1>
              <p className="mt-2 text-sm text-zinc-400">
                We sent a PIN to your email. Enter it below to {mode === 'signup' ? 'verify your account' : 'complete login'}.
              </p>
            </div>
            <form onSubmit={handleVerify} className="space-y-5">
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
                <label className="block text-sm font-medium text-zinc-300">PIN Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, ''))}
                  required
                />
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
                {loading ? 'Verifying…' : 'Verify'}
              </button>
              <p className="mt-4 text-center text-sm text-zinc-400">
                Didn’t receive a PIN? Check spam or try again.
              </p>
            </form>
          </div>
        </div>
      </div>
    </Suspense>
  );
}