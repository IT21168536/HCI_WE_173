import { useState } from 'react';
import { router } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { getCustomerOrders } from '@/features/customer/services/customer.service';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { OrderCard } from '@/shared/components/OrderCard';
import { Screen } from '@/shared/components/Screen';
import { Segmented } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { ACTIVE_STATUSES, type Order } from '@/shared/types/Order';

type Filter = 'ongoing' | 'completed' | 'cancelled';

export default function CustomerOrdersScreen() {
  const user = useCurrentUser();
  const [filter, setFilter] = useState<Filter>('ongoing');
  const { data: orders, loading, error, reload, refresh, refreshing } = useFocusData(() => getCustomerOrders(user.id), [] as Order[], [user.id]);

  const groups: Record<Filter, Order[]> = {
    ongoing: orders.filter((order) => ACTIVE_STATUSES.includes(order.status)),
    completed: orders.filter((order) => order.status === 'delivered'),
    cancelled: orders.filter((order) => order.status === 'cancelled'),
  };
  const visible = groups[filter];

  return (
    <Screen title="Your orders" subtitle="Track requested, preparing, ready and delivered meals" inTabs refreshing={refreshing} onRefresh={refresh}>
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'ongoing', label: `Ongoing (${groups.ongoing.length})` },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' },
        ]}
      />
      {loading ? (
        <LoadingView message="Loading orders..." />
      ) : error ? (
        <ErrorView message={error} onRetry={() => reload()} />
      ) : visible.length === 0 ? (
        <EmptyState
          title={filter === 'ongoing' ? 'No orders on the way' : filter === 'completed' ? 'No completed orders yet' : 'No cancelled orders'}
          message={filter === 'ongoing' ? 'Add a meal to your cart and checkout to start an order.' : undefined}
          icon="receipt-outline"
          actionLabel={filter === 'ongoing' ? 'Find a meal' : undefined}
          onAction={() => router.push('/(customer)/(tabs)/home')}
        />
      ) : (
        visible.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            perspective="customer"
            onPress={() => router.push({ pathname: '/(customer)/order/[id]', params: { id: String(order.id) } })}
          >
            {order.status === 'delivered' && !order.hasReview ? (
              <AppButton
                title="Rate this meal"
                size="sm"
                variant="outline"
                icon="star-outline"
                flex
                onPress={() => router.push({ pathname: '/(customer)/review/[orderId]', params: { orderId: String(order.id) } })}
              />
            ) : null}
          </OrderCard>
        ))
      )}
    </Screen>
  );
}
