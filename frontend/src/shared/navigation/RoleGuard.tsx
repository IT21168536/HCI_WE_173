import type { ReactNode } from 'react';
import { Redirect } from 'expo-router';
import { useSession } from '@/core/auth/SessionContext';
import { LoadingView } from '@/shared/components/LoadingView';
import type { UserRole } from '@/shared/types/User';

/** Keeps each role's screens for that role only; anyone else goes back to login. */
export function RoleGuard({ role, children }: { role: UserRole; children: ReactNode }) {
  const { user, loading } = useSession();

  if (loading) {
    return <LoadingView message="Checking your session..." fill />;
  }
  if (!user || user.role !== role) {
    return <Redirect href="/(auth)/login" />;
  }
  return <>{children}</>;
}
