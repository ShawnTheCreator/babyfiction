"use client";
import Link from 'next/link';
import { useCurrentUser } from '@/lib/auth';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center text-sm text-muted-foreground">
        Checking your account...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <h2 className="text-xl font-semibold">Sign in required</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You need an account to checkout, comment, or rate products.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link className="rounded bg-black px-4 py-2 text-white" href="/auth/login">Login</Link>
          <Link className="rounded border px-4 py-2" href="/auth/signup">Sign up</Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}