"use client";
import { useEffect, useState } from 'react';
import { fetchJson } from '@/lib/api';

export type CurrentUser = {
  _id?: string;
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  phone?: string;
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
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
    };

    load();

    const onAuthChanged = () => {
      if (!active) return;
      setLoading(true);
      load();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('bf_auth_changed', onAuthChanged);
    }
    
    return () => { 
      active = false; 
      if (typeof window !== 'undefined') {
        window.removeEventListener('bf_auth_changed', onAuthChanged);
      }
    };
  }, []);

  return { user, loading };
}