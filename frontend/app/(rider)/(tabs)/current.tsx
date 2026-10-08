import { router } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { RiderDeliveryCard } from '@/features/rider/components/RiderDeliveryCard';
import { getActiveDeliveries } from '@/features/rider/services/rider.service';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { Screen } from '@/shared/components/Screen';
import { Notice } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import type { Order } from '@/shared/types/Order';

export default function CurrentDeliveryScreen() {
  const user = useCurrentUser();
  const { data: deliveries, loading, error, reload, refresh, refreshing } = useFocusData(() => getActiveDeliveries(user.id), [] as Order[], [user.id]);

  return (
    <Screen title="Current Deliveries" inTabs refreshing={refreshing} onRefresh={refresh}>
      {loading ? (
        <LoadingView message="Loading your deliveries..." />
      ) : error ? (
        <ErrorView message={error} onRetry={() => reload()} />
      ) : deliveries.length === 0 ? (
        <EmptyState
          title="No active delivery"
          message="Accept a ready order from the dashboard to start a pickup."
          icon="bicycle-outline"
          actionLabel="Find deliveries"
          onAction={() => router.push('/(rider)/(tabs)/dashboard')}
        />
      ) : (
        <>
          <Notice icon="information-circle-outline" text="Tap a delivery for pickup and customer details. Each step has one main action." />
          {deliveries.map((order) => (
            <RiderDeliveryCard key={order.id} order={order} riderId={user.id} onChanged={() => reload()} />
          ))}
        </>
      )}
    </Screen>
  );
}
