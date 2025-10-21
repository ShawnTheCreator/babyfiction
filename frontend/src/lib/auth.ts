"use client";
import { useEffect, useState } from 'react';
import { fetchJson } from '@/lib/api';

export type CurrentUser = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res: any = await fetchJson('/api/auth/me');
        const maybeUser = res?.data || res?.user || res;
        const normalized = maybeUser
          ? {
              ...maybeUser,
              name:
                maybeUser?.name ||
                [maybeUser?.firstName, maybeUser?.lastName].filter(Boolean).join(' ') ||
                undefined,
            }
          : null;
        if (active) setUser(normalized);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return { user, loading };
}