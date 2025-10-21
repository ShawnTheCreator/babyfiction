"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchJson, setAuthToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const loginRes: any = await fetchJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const token = loginRes?.token;
      if (token) setAuthToken(token);
      // After successful login, migrate guest cart & wishlist to backend or clear server if none
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('bf_cart') : null;
        const guestCart = raw ? JSON.parse(raw) : [];
        if (Array.isArray(guestCart) && guestCart.length > 0) {
          for (const it of guestCart) {
            if (!it?.id) continue;
            try {
              await fetchJson('/api/cart/items', {
                method: 'POST',
                body: JSON.stringify({ product: it.id, quantity: 1 }),
              });
            } catch {}
          }
          try {
            localStorage.setItem('bf_cart', JSON.stringify([]));
            if (typeof window !== 'undefined') window.dispatchEvent(new Event('bf_cart_updated'));
          } catch {}
        } else {
          // No guest cart: ensure server cart is empty on login per requirement
          try { await fetchJson('/api/cart', { method: 'DELETE' }); } catch {}
        }

        // Wishlist migration
        const rawW = typeof window !== 'undefined' ? localStorage.getItem('bf_wishlist') : null;
        const guestWish = rawW ? JSON.parse(rawW) : [];
        if (Array.isArray(guestWish) && guestWish.length > 0) {
          for (const it of guestWish) {
            if (!it?.id) continue;
            try {
              await fetchJson('/api/wishlist/items', {
                method: 'POST',
                body: JSON.stringify({ product: it.id }),
              });
            } catch {}
          }
          try {
            localStorage.setItem('bf_wishlist', JSON.stringify([]));
            if (typeof window !== 'undefined') window.dispatchEvent(new Event('bf_wishlist_updated'));
          } catch {}
        } else {
          // No guest wishlist: ensure server wishlist is empty
          try { await fetchJson('/api/wishlist', { method: 'DELETE' }); } catch {}
        }
      } catch {}
      // After successful login, determine role and redirect accordingly
      try {
        const me: any = await fetchJson('/api/auth/me');
        const user = me?.data || me?.user || me;
        const role = user?.role;
        router.push(role === 'admin' ? '/admin' : '/');
      } catch {
        // Fallback: if /me fails, go home
        router.push('/');
      }
    } catch (err: any) {
      const status = (err && typeof err === 'object' && 'status' in err) ? (err as any).status : undefined;
      if (status === 401) setError('Invalid email or password');
      else setError(err?.message || 'Login failed');
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
            <h1 className="text-3xl font-bold tracking-tight">Babyfiction</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <input
                type="password"
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            {/* Demo buttons removed per request */}
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            No account? <a href="/auth/signup" className="underline hover:text-white">Sign up</a>
          </p>
          <p className="mt-2 text-center text-sm text-zinc-400">
            <a href="/" className="underline hover:text-white">Go to Home</a>
          </p>
        </div>
      </div>
    </div>
  );
}