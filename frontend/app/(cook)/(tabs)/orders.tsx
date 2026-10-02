import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingView } from '@/shared/components/LoadingView';
import { OrderCard } from '@/shared/components/OrderCard';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { screenStyles } from '@/shared/theme/screen';
import type { Order } from '@/shared/types/Order';
import { getCookOrders } from '@/features/cook/services/cookOrder.service';
import { useSessionUser } from '@/shared/hooks/useSessionUser';

export default function CookOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: sessionLoading } = useSessionUser();

  useEffect(() => {
    if (sessionLoading) {
      return;
    }

    if (!user || user.role !== 'cook') {
      setLoading(false);
      return;
    }

    getCookOrders(user.id)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [sessionLoading, user]);

  return (
    <FlatList
      style={screenStyles.container}
      contentContainerStyle={screenStyles.content}
      data={orders}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={<ScreenHeader title="Cook orders" subtitle="Accept, prepare, and mark meals ready." />}
      ListEmptyComponent={loading ? <LoadingView message="Loading orders..." /> : <EmptyState title="No incoming orders" message="Customer requests will appear here." />}
      renderItem={({ item }) => <OrderCard order={item} onPress={() => router.push(`/(cook)/order/${item.id}` as any)} />}
    />
  );
}
