import { useEffect, useState } from 'react';
import { getSessionUser } from '@/core/auth/session.service';
import type { User } from '@/shared/types/User';

export function useSessionUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getSessionUser()
      .then((sessionUser) => {
        if (mounted) {
          setUser(sessionUser);
        }
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return { user, loading };
}
