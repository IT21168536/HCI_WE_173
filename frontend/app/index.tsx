import { Redirect } from 'expo-router';
import { homeRouteFor } from '@/core/auth/auth.service';
import { useSession } from '@/core/auth/SessionContext';
import { LoadingView } from '@/shared/components/LoadingView';

/** Session check: signed-in users go straight to their role's home. */
export default function Index() {
  const { user, loading } = useSession();

  if (loading) {
    return <LoadingView message="Opening Worky Kitchen..." fill />;
  }

  return <Redirect href={user ? homeRouteFor(user.role) : '/(auth)/login'} />;
}
