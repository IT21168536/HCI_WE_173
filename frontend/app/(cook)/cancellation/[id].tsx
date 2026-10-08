import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { getOrder, getOrderItems, resolveCancellation } from '@/features/cook/services/cook.service';
import { AppButton } from '@/shared/components/AppButton';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { orderNumber } from '@/shared/components/OrderCard';
import { Screen } from '@/shared/components/Screen';
import { Badge, Card, Divider, InfoRow, Notice } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { showError } from '@/shared/utils/alerts';
import { formatRelative, formatShortDateTime } from '@/shared/utils/dateUtils';
import { formatCurrency } from '@/shared/utils/formatCurrency';

export default function CancellationScreen() {
  const user = useCurrentUser();
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);

  const { data, loading, error, reload } = useFocusData(
    async () => {
      const order = await getOrder(orderId);
      if (!order || order.cookId !== user.id) throw new Error('Order not found.');
      return { order, items: await getOrderItems(orderId) };
    },
    null,
    [orderId, user.id],
  );

  async function resolve(approve: boolean) {
    try {
      setBusy(approve ? 'approve' : 'reject');
      await resolveCancellation(orderId, approve);
      Alert.alert(
        approve ? 'Order cancelled' : 'Request rejected',
        approve ? 'The customer has been told, and portions are back on your menu.' : 'The order continues as normal. Please contact the customer if needed.',
      );
      router.back();
    } catch (err) {
      showError('Could not update the request', err);
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <LoadingView fill />;
  if (error || !data) {
    return (
      <Screen title="Cancellation" back variant="brand">
        <ErrorView message={error ?? 'Order not found.'} onRetry={() => reload()} />
      </Screen>
    );
  }

  const { order, items } = data;
  const open = order.cancelStatus === 'requested' && order.status !== 'cancelled' && order.status !== 'delivered';

  return (
    <Screen
      title="Cancellation"
      back
      variant="brand"
      footer={
        open ? (
          <View style={styles.row}>
            <AppButton title="Reject request" variant="outline" flex loading={busy === 'reject'} onPress={() => resolve(false)} />
            <AppButton title="Approve" flex loading={busy === 'approve'} onPress={() => resolve(true)} />
          </View>
        ) : undefined
      }
    >
      <Card>
        <View style={styles.between}>
          <Text style={styles.title}>Order {orderNumber(order.id)}</Text>
          <Badge label={open ? 'Cancellation requested' : order.status === 'cancelled' ? 'Cancelled' : 'Request closed'} tone={open ? 'warning' : 'neutral'} />
        </View>
        <Text style={styles.muted}>
          Requested {formatRelative(order.updatedAt ?? order.createdAt)} · {order.scheduledTime ? `For ${formatShortDateTime(order.scheduledTime)}` : `Placed ${formatShortDateTime(order.createdAt)}`}
        </Text>
      </Card>

      <Card>
        <InfoRow label="Customer" value={order.customerName ?? 'Customer'} />
        <Divider />
        {items.map((item) => (
          <InfoRow key={item.id} label={`${item.mealName} × ${item.quantity}`} value={formatCurrency(item.unitPrice * item.quantity)} />
        ))}
        <InfoRow label="Payment" value={order.paymentStatus === 'paid' ? 'Paid online' : 'Cash on delivery'} />
      </Card>

      <Card>
        <Text style={styles.muted}>Cancellation reason</Text>
        <Text style={styles.reason}>{order.cancelReason ?? 'No reason given.'}</Text>
      </Card>

      {open ? (
        <Notice
          icon="alert-circle-outline"
          text={`If you approve, ${order.customerName?.split(' ')[0] ?? 'the customer'} ${order.paymentStatus === 'paid' ? `gets a full refund of ${formatCurrency(order.total)}` : 'is not charged'} and the portions go back on your menu. Already started cooking? Reject the request and call the customer.`}
        />
      ) : (
        <Notice tone="neutral" text="This request has already been handled." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  between: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  title: {
    ...typography.sectionTitle,
    color: colors.ink,
  },
  muted: {
    ...typography.caption,
    color: colors.muted,
  },
  reason: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
});
