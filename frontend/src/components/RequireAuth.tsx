"use client";
import Link from 'next/link';
import { useCurrentUser } from '@/lib/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RequireAuth({ children, redirectTo }: { children: React.ReactNode; redirectTo?: string }) {
  const { user, loading } = useCurrentUser();
  const router = useRouter();

  if (loading) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center text-sm text-muted-foreground">
        Checking your account...
      </div>
    );
  }

  if (!user) {
    if (redirectTo) {
      // Redirect unauthenticated users if a redirect target is provided
      // Use an effect to avoid rendering on server
      useEffect(() => {
        router.replace(redirectTo);
      }, [redirectTo]);
      return null;
    }
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