import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingView } from '@/shared/components/LoadingView';
import { OrderCard } from '@/shared/components/OrderCard';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { screenStyles } from '@/shared/theme/screen';
import { useRiderDeliveries } from '@/features/rider/hooks/useRiderDeliveries';

export default function RiderDashboardScreen() {
  const { deliveries, loading } = useRiderDeliveries();

  return (
    <FlatList
      style={screenStyles.container}
      contentContainerStyle={screenStyles.content}
      data={deliveries}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={<ScreenHeader title="Rider dashboard" subtitle="Ready pickups and active deliveries." />}
      ListEmptyComponent={loading ? <LoadingView message="Loading deliveries..." /> : <EmptyState title="No ready deliveries" message="Orders marked ready by cooks will appear here." />}
      renderItem={({ item }) => <OrderCard order={item} onPress={() => router.push(`/(rider)/delivery/${item.id}` as any)} />}
    />
  );
}
