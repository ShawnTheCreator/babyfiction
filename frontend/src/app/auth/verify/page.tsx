"use client";
// imports and dynamic settings
import { Suspense } from 'react';
export const dynamic = 'force-dynamic';
import VerifyClient from './VerifyClient';

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { mode?: string; email?: string };
}) {
  const mode = (searchParams?.mode ?? 'login') as 'login' | 'signup';
  const initialEmail = searchParams?.email ?? '';

  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-zinc-900 text-white flex items-center justify-center p-6">Loading…</div>}>
      <VerifyClient initialEmail={initialEmail} mode={mode} />
    </Suspense>
  );
}