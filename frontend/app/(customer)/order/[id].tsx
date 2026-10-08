import { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { cancelOrderByCustomer, getOrder, getOrderItems } from '@/features/customer/services/customer.service';
import { AppButton } from '@/shared/components/AppButton';
import { Avatar } from '@/shared/components/Avatar';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { orderNumber } from '@/shared/components/OrderCard';
import { Screen } from '@/shared/components/Screen';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { StatusTimeline } from '@/shared/components/StatusTimeline';
import { Card, Chip, ChipRow, Divider, IconCircle, InfoRow, Notice } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { confirm, showError } from '@/shared/utils/alerts';
import { formatShortDateTime } from '@/shared/utils/dateUtils';
import { formatCurrency } from '@/shared/utils/formatCurrency';

const cancelReasons = ['Change of plans', 'Ordered by mistake', 'Delivery time is too late', 'Want to change my order'];

export default function CustomerOrderDetailsScreen() {
  const user = useCurrentUser();
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const [showCancel, setShowCancel] = useState(false);
  const [reason, setReason] = useState(cancelReasons[0]);
  const [cancelling, setCancelling] = useState(false);

  const { data, loading, error, reload, refresh, refreshing } = useFocusData(
    async () => {
      const order = await getOrder(orderId);
      if (!order || order.customerId !== user.id) {
        throw new Error('Order not found.');
      }
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
      <Screen title="Order" back>
        <ErrorView message={error ?? 'Order not found.'} onRetry={() => reload()} />
      </Screen>
    );
  }

  const { order, items } = data;
  const canCancel = ['requested', 'accepted', 'preparing'].includes(order.status) && order.cancelStatus !== 'requested';

  async function onCancel() {
    const immediate = order.status === 'requested';
    const ok = await confirm(
      immediate ? 'Cancel this order?' : 'Ask to cancel?',
      immediate
        ? 'The cook has not accepted it yet, so it will be cancelled right away.'
        : 'The cook has already started on this order. They will approve or decline your request.',
      immediate ? 'Cancel order' : 'Send request',
      true,
    );
    if (!ok) return;
    try {
      setCancelling(true);
      const result = await cancelOrderByCustomer(order.id, user.id, reason);
      Alert.alert(
        result === 'cancelled' ? 'Order cancelled' : 'Request sent',
        result === 'cancelled'
          ? order.paymentStatus === 'paid'
            ? 'Your card payment will be refunded.'
            : 'Nothing was charged.'
          : 'We will let you know when the cook responds.',
      );
      setShowCancel(false);
      await reload();
    } catch (err) {
      showError('Could not cancel', err);
    } finally {
      setCancelling(false);
    }
  }

  const call = (mobile?: string | null) => mobile && Linking.openURL(`tel:${mobile.replace(/\s/g, '')}`);

  return (
    <Screen title={`Order ${orderNumber(order.id)}`} back refreshing={refreshing} onRefresh={refresh}>
      <Card>
        <View style={styles.between}>
          <Text style={styles.title}>{order.status === 'delivered' ? 'Delivered' : order.status === 'cancelled' ? 'Cancelled' : 'Order progress'}</Text>
          <StatusBadge status={order.status} order={order} />
        </View>
        <Text style={styles.muted}>
          Placed {formatShortDateTime(order.createdAt)}
          {order.scheduledTime ? ` · For ${formatShortDateTime(order.scheduledTime)}` : ''}
        </Text>
        {order.status === 'cancelled' ? (
          <Notice
            tone="neutral"
            text={`${order.cancelReason ?? 'This order was cancelled.'}${order.paymentStatus === 'refunded' ? ' Your card payment has been refunded.' : ''}`}
          />
        ) : (
          <StatusTimeline order={order} />
        )}
        {order.cancelStatus === 'requested' && order.status !== 'cancelled' ? (
          <Notice tone="warning" icon="hourglass-outline" text="You asked to cancel this order. Waiting for the cook to respond." />
        ) : null}
        {order.cancelStatus === 'rejected' && order.status !== 'cancelled' ? (
          <Notice tone="neutral" text="The cook had already started cooking, so the cancellation was declined." />
        ) : null}
      </Card>

      <Card style={styles.person}>
        <Avatar name={order.cookBusinessName ?? 'Kitchen'} size={44} />
        <View style={styles.flex}>
          <Text style={styles.muted}>Kitchen</Text>
          <Text style={styles.name}>{order.cookBusinessName}</Text>
          <Text style={styles.muted}>{order.cookLocation}</Text>
        </View>
        {order.cookMobile && order.status !== 'delivered' && order.status !== 'cancelled' ? (
          <AppButton title="Call" size="sm" variant="outline" icon="call-outline" onPress={() => call(order.cookMobile)} accessibilityLabel="Call the kitchen" />
        ) : null}
      </Card>

      {order.riderName ? (
        <Card style={styles.person}>
          <Avatar name={order.riderName} size={44} tone="blue" />
          <View style={styles.flex}>
            <Text style={styles.muted}>Rider</Text>
            <Text style={styles.name}>{order.riderName}</Text>
          </View>
          {order.riderMobile && (order.status === 'picked_up' || order.status === 'on_the_way') ? (
            <AppButton title="Call" size="sm" variant="outline" icon="call-outline" onPress={() => call(order.riderMobile)} accessibilityLabel="Call the rider" />
          ) : null}
        </Card>
      ) : null}

      <Card>
        <Text style={styles.title}>Items</Text>
        {items.map((item) => (
          <InfoRow key={item.id} label={`${item.mealName} × ${item.quantity}`} value={formatCurrency(item.unitPrice * item.quantity)} />
        ))}
        <Divider />
        <InfoRow label="Subtotal" value={formatCurrency(order.subtotal)} />
        <InfoRow label={order.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'} value={order.deliveryType === 'delivery' ? formatCurrency(order.deliveryFee) : 'Free'} />
        <InfoRow label="Total" value={formatCurrency(order.total)} strong valueColor={colors.brandText} />
        <Text style={styles.muted}>
          {order.paymentMethod === 'card' ? 'Card' : 'Cash'} ·{' '}
          {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'refunded' ? 'Refunded' : 'Pay on arrival'}
        </Text>
      </Card>

      <Card style={styles.person}>
        <IconCircle icon={order.deliveryType === 'delivery' ? 'location-outline' : 'bag-handle-outline'} />
        <View style={styles.flex}>
          <Text style={styles.muted}>{order.deliveryType === 'delivery' ? 'Delivering to' : 'Collect from'}</Text>
          <Text style={styles.body}>{order.deliveryType === 'delivery' ? order.deliveryAddress : `${order.cookBusinessName}, ${order.cookLocation}`}</Text>
          {order.customerNote ? <Text style={styles.muted}>Note: {order.customerNote}</Text> : null}
        </View>
      </Card>

      {order.status === 'delivered' && !order.hasReview ? (
        <AppButton
          title="Rate this meal"
          icon="star-outline"
          onPress={() => router.push({ pathname: '/(customer)/review/[orderId]', params: { orderId: String(order.id) } })}
        />
      ) : null}

      {canCancel ? (
        showCancel ? (
          <Card tone="warning">
            <Text style={styles.title}>Why do you want to cancel?</Text>
            <ChipRow>
              {cancelReasons.map((item) => (
                <Chip key={item} label={item} selected={reason === item} onPress={() => setReason(item)} />
              ))}
            </ChipRow>
            <View style={styles.actions}>
              <AppButton title="Keep order" variant="secondary" size="sm" flex onPress={() => setShowCancel(false)} />
              <AppButton title={order.status === 'requested' ? 'Cancel order' : 'Send request'} variant="danger" size="sm" flex loading={cancelling} onPress={onCancel} />
            </View>
          </Card>
        ) : (
          <AppButton title="Cancel order" variant="ghost" icon="close-circle-outline" onPress={() => setShowCancel(true)} />
        )
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    gap: 2,
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
  body: {
    ...typography.body,
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
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
