import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { getOrder, getOrderItems, moveCookOrder, nextCookAction } from '@/features/cook/services/cook.service';
import { AppButton } from '@/shared/components/AppButton';
import { Avatar } from '@/shared/components/Avatar';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { orderNumber } from '@/shared/components/OrderCard';
import { Screen } from '@/shared/components/Screen';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Badge, Card, Divider, IconCircle, InfoRow, Notice } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { cookEarnings, PLATFORM_FEE_RATE, type OrderStatus } from '@/shared/types/Order';
import { confirm, showError } from '@/shared/utils/alerts';
import { formatShortDateTime, formatTime, isFuture } from '@/shared/utils/dateUtils';
import { formatCurrency } from '@/shared/utils/formatCurrency';

const headline: Record<OrderStatus, string> = {
  requested: 'New order',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  picked_up: 'With the rider',
  on_the_way: 'On the way',
  delivered: 'Completed',
  cancelled: 'Cancelled',
};

export default function CookOrderDetailsScreen() {
  const user = useCurrentUser();
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const [busy, setBusy] = useState<string | null>(null);

  const { data, loading, error, reload, refresh, refreshing } = useFocusData(
    async () => {
      const order = await getOrder(orderId);
      if (!order || order.cookId !== user.id) throw new Error('Order not found.');
      return { order, items: await getOrderItems(orderId) };
    },
    null,
    [orderId, user.id],
  );

  if (loading) {
    return <LoadingView message="Loading order..." fill />;
  }
  if (error || !data) {
    return (
      <Screen title="Order" back variant="brand">
        <ErrorView message={error ?? 'Order not found.'} onRetry={() => reload()} />
      </Screen>
    );
  }

  const { order, items } = data;
  const action = nextCookAction(order);
  const fee = order.subtotal - cookEarnings(order);

  async function move(status: OrderStatus, key: string) {
    if (status === 'cancelled') {
      const ok = await confirm('Decline this order?', 'The customer will be told the kitchen could not take it, and any card payment is refunded.', 'Decline', true);
      if (!ok) return;
    }
    try {
      setBusy(key);
      await moveCookOrder(order.id, status);
      await reload();
    } catch (err) {
      showError('Could not update the order', err);
    } finally {
      setBusy(null);
    }
  }

  const call = (mobile?: string | null) => mobile && Linking.openURL(`tel:${mobile.replace(/\s/g, '')}`);
  const pendingCancel = order.cancelStatus === 'requested' && order.status !== 'cancelled' && order.status !== 'delivered';

  let footer = null;
  if (pendingCancel) {
    footer = (
      <AppButton
        title="Review cancellation request"
        icon="alert-circle-outline"
        onPress={() => router.push({ pathname: '/(cook)/cancellation/[id]', params: { id: String(order.id) } })}
      />
    );
  } else if (order.status === 'requested') {
    footer = (
      <View style={styles.row}>
        <AppButton title="Decline" variant="outline" flex loading={busy === 'decline'} onPress={() => move('cancelled', 'decline')} />
        <AppButton title="Accept order" flex loading={busy === 'accept'} onPress={() => move('accepted', 'accept')} />
      </View>
    );
  } else if (action) {
    footer = <AppButton title={action.label} loading={busy === 'next'} onPress={() => move(action.status, 'next')} />;
  }

  return (
    <Screen title={`Order ${orderNumber(order.id)}`} back variant="brand" footer={footer} refreshing={refreshing} onRefresh={refresh}>
      <Card>
        <View style={styles.between}>
          <Text style={styles.title}>{headline[order.status]}</Text>
          <StatusBadge status={order.status} order={order} />
        </View>
        <Text style={styles.muted}>
          Placed {formatShortDateTime(order.createdAt)}
          {order.scheduledTime ? ` · ${isFuture(order.scheduledTime) ? 'Pre-order for' : 'Scheduled'} ${formatShortDateTime(order.scheduledTime)}` : ''}
        </Text>
        {order.status === 'ready' && order.deliveryType === 'delivery' ? (
          <Notice tone="info" icon="bicycle-outline" text={order.riderName ? `${order.riderName} is coming to collect this order.` : 'Waiting for a rider to accept this delivery.'} />
        ) : null}
        {order.status === 'cancelled' && order.cancelReason ? <Notice tone="neutral" text={order.cancelReason} /> : null}
      </Card>

      <Card style={styles.person}>
        <Avatar name={order.customerName ?? 'Customer'} size={44} />
        <View style={styles.flex}>
          <Text style={styles.name}>{order.customerName}</Text>
          <Text style={styles.muted}>{order.deliveryType === 'delivery' ? order.deliveryAddress : 'Collecting from your kitchen'}</Text>
        </View>
        {order.customerMobile && !['delivered', 'cancelled'].includes(order.status) ? (
          <AppButton title="Call" size="sm" variant="outline" icon="call-outline" onPress={() => call(order.customerMobile)} accessibilityLabel="Call the customer" />
        ) : null}
      </Card>

      <Card>
        <Text style={styles.title}>Order items</Text>
        {items.map((item) => (
          <InfoRow key={item.id} label={`${item.mealName} × ${item.quantity}`} value={formatCurrency(item.unitPrice * item.quantity)} />
        ))}
        <Divider />
        <InfoRow label="Subtotal" value={formatCurrency(order.subtotal)} />
        <InfoRow label={`Platform fee (${Math.round(PLATFORM_FEE_RATE * 100)}%)`} value={`− ${formatCurrency(fee)}`} />
        <InfoRow label="You earn" value={formatCurrency(cookEarnings(order))} strong valueColor={colors.brandText} />
        <View style={styles.row}>
          <Badge
            label={order.paymentStatus === 'paid' ? 'Paid online' : order.paymentStatus === 'refunded' ? 'Refunded' : 'Cash on delivery'}
            tone={order.paymentStatus === 'paid' ? 'success' : 'neutral'}
          />
          <Badge label={order.deliveryType === 'delivery' ? 'Rider delivery' : 'Customer pickup'} tone="info" />
        </View>
      </Card>

      {order.customerNote ? <Notice tone="warning" icon="chatbubble-ellipses-outline" text={`Note from customer: ${order.customerNote}`} /> : null}

      {order.riderName ? (
        <Card style={styles.person}>
          <IconCircle icon="bicycle-outline" tone="info" />
          <View style={styles.flex}>
            <Text style={styles.muted}>Rider</Text>
            <Text style={styles.name}>{order.riderName}</Text>
            {order.updatedAt && order.status !== 'ready' ? <Text style={styles.muted}>Updated {formatTime(order.updatedAt)}</Text> : null}
          </View>
          {order.riderMobile && ['ready', 'picked_up', 'on_the_way'].includes(order.status) ? (
            <AppButton title="Call" size="sm" variant="outline" icon="call-outline" onPress={() => call(order.riderMobile)} accessibilityLabel="Call the rider" />
          ) : null}
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  between: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  title: {
    ...typography.sectionTitle,
    color: colors.ink,
  },
  name: {
    ...typography.cardTitle,
    color: colors.ink,
  },
  muted: {
    ...typography.caption,
    color: colors.muted,
  },
  person: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
});
