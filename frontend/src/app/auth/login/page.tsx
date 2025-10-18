"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchJson } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const DEMO_USERS = {
    user: {
      email: 'shawnchareka7@gmail.com',
      password: 'userpass123',
      name: 'Shawn',
      role: 'user',
    },
    admin: {
      email: 'admin@babyfiction.com',
      password: 'adminpass123',
      name: 'Babyfiction Admin',
      role: 'admin',
    },
  } as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const loginRes: any = await fetchJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      // After successful login, determine role and redirect accordingly
      try {
        const me: any = await fetchJson('/api/auth/me');
        const user = me?.data || me?.user || me;
        const role = user?.role;
        if (typeof window !== 'undefined') {
          localStorage.setItem('babyfiction_demo_user', JSON.stringify({
            email: user?.email,
            name: user?.name,
            role: role || 'user',
          }));
        }
        router.push(role === 'admin' ? '/admin' : '/');
      } catch {
        // Fallback: if /me fails, go home
        router.push('/');
      }
    } catch (err: any) {
      const matchedDemo =
        (email === DEMO_USERS.user.email && password === DEMO_USERS.user.password)
          ? DEMO_USERS.user
          : (email === DEMO_USERS.admin.email && password === DEMO_USERS.admin.password)
            ? DEMO_USERS.admin
            : null;

      if (matchedDemo && typeof window !== 'undefined') {
        localStorage.setItem('babyfiction_demo_user', JSON.stringify({
          email: matchedDemo.email,
          name: matchedDemo.name,
          role: matchedDemo.role,
        }));
        router.push(matchedDemo.role === 'admin' ? '/admin' : '/');
      } else {
        setError(err?.message || 'Login failed');
      }
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