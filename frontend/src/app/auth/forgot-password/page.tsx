"use client";
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { fetchJson } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await fetchJson('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-zinc-900 via-neutral-800 to-zinc-900 text-white flex items-center justify-center p-6">
      <div className="relative w-full max-w-md">
        <div className="mb-4">
          <Link href="/auth/login" className="text-sm text-zinc-300 hover:text-white inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>
        </div>
        <div className="absolute -top-10 -left-10 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-white/10 blur-xl" />

        <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
            <p className="mt-2 text-sm text-zinc-300">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                <p className="font-medium mb-1">Email sent!</p>
                <p>Check your inbox for password reset instructions.</p>
              </div>
              <Link href="/auth/login">
                <button className="w-full rounded-lg bg-white text-black py-2.5 font-medium shadow hover:bg-zinc-100">
                  Back to Login
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300">Email Address</label>
                <input
                  type="email"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-zinc-400">
            Remember your password? <Link href="/auth/login" className="underline hover:text-white">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
