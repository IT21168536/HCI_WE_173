import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { claimDelivery, getDelivery, getDeliveryItems, moveDelivery, nextRiderAction } from '@/features/rider/services/rider.service';
import { AppButton } from '@/shared/components/AppButton';
import { Avatar } from '@/shared/components/Avatar';
import { Icon } from '@/shared/components/Icon';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { orderNumber } from '@/shared/components/OrderCard';
import { Screen } from '@/shared/components/Screen';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Card, Divider, IconCircle, InfoRow, Notice } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import type { Order } from '@/shared/types/Order';
import { showError } from '@/shared/utils/alerts';
import { formatShortDateTime, formatTime } from '@/shared/utils/dateUtils';
import { formatCurrency } from '@/shared/utils/formatCurrency';

const steps: { key: Order['status']; label: string }[] = [
  { key: 'ready', label: 'Assigned' },
  { key: 'picked_up', label: 'Picked up' },
  { key: 'on_the_way', label: 'On the way' },
  { key: 'delivered', label: 'Delivered' },
];

export default function RiderDeliveryDetailsScreen() {
  const user = useCurrentUser();
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data, loading, error, reload, refresh, refreshing } = useFocusData(
    async () => {
      const order = await getDelivery(orderId);
      if (!order || order.deliveryType !== 'delivery') throw new Error('Delivery not found.');
      if (order.riderId && order.riderId !== user.id) throw new Error('Another rider is handling this delivery.');
      return { order, items: await getDeliveryItems(orderId) };
    },
    null,
    [orderId, user.id],
  );

  if (loading) return <LoadingView message="Loading delivery..." fill />;
  if (error || !data) {
    return (
      <Screen title="Delivery Details" back>
        <ErrorView message={error ?? 'Delivery not found.'} onRetry={() => reload()} />
      </Screen>
    );
  }

  const { order, items } = data;
  const action = nextRiderAction(order, user.id);
  const currentStep = steps.findIndex((step) => step.key === order.status);
  const collectCash = order.paymentStatus !== 'paid' && order.paymentStatus !== 'refunded';
  const call = (mobile?: string | null) => mobile && Linking.openURL(`tel:${mobile.replace(/\s/g, '')}`);

  async function run() {
    if (!action) return;
    if (action.status === 'picked_up' && !checked) {
      Alert.alert('Check the order first', 'Tick the box to confirm you checked the order number and items with the cook.');
      return;
    }
    try {
      setBusy(true);
      if (action.status === 'claim') {
        await claimDelivery(order.id, user.id);
      } else {
        await moveDelivery(order.id, user.id, action.status as 'picked_up' | 'on_the_way' | 'delivered');
      }
      if (action.status === 'delivered') {
        Alert.alert('Delivery completed!', `Great job. ${orderNumber(order.id)} was delivered to ${order.customerName}.`);
        router.replace('/(rider)/(tabs)/history');
        return;
      }
      await reload();
    } catch (err) {
      showError('Could not update the delivery', err);
      await reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      title="Delivery Details"
      back
      refreshing={refreshing}
      onRefresh={refresh}
      footer={action ? <AppButton title={action.label} loading={busy} onPress={run} /> : undefined}
    >
      <View style={styles.between}>
        <Text style={styles.orderNo}>{orderNumber(order.id)}</Text>
        <StatusBadge status={order.status} order={order} />
      </View>

      <Card>
        <Text style={styles.label}>Pickup from</Text>
        <View style={styles.person}>
          <Avatar name={order.cookBusinessName ?? 'Kitchen'} size={46} />
          <View style={styles.flex}>
            <Text style={styles.name}>{order.cookBusinessName}</Text>
            <Text style={styles.muted}>{order.cookAddress ?? order.cookLocation}</Text>
          </View>
          {order.cookMobile && order.status !== 'delivered' ? (
            <AppButton title="Call cook" size="sm" variant="outline" icon="call-outline" onPress={() => call(order.cookMobile)} />
          ) : null}
        </View>
      </Card>

      <Card>
        <Text style={styles.label}>Deliver to</Text>
        <View style={styles.person}>
          <Avatar name={order.customerName ?? 'Customer'} size={46} tone="blue" />
          <View style={styles.flex}>
            <Text style={styles.name}>{order.customerName}</Text>
            <Text style={styles.muted}>{order.deliveryAddress}</Text>
          </View>
          {order.customerMobile && order.riderId === user.id && order.status !== 'delivered' ? (
            <AppButton title="Call" size="sm" variant="outline" icon="call-outline" onPress={() => call(order.customerMobile)} accessibilityLabel="Call customer" />
          ) : null}
        </View>
        {order.customerNote ? <Notice tone="warning" icon="chatbubble-ellipses-outline" text={`Customer note: ${order.customerNote}`} /> : null}
      </Card>

      <Card>
        <InfoRow label="Collection time" value={order.scheduledTime ? formatShortDateTime(order.scheduledTime) : order.status === 'ready' ? 'Ready now' : formatTime(order.updatedAt ?? order.createdAt)} />
        <InfoRow label="Items" value={items.map((item) => `${item.mealName} ×${item.quantity}`).join(', ')} />
        <Divider />
        <InfoRow label="Payment" value={collectCash ? `Collect ${formatCurrency(order.total)} cash` : 'Paid online'} valueColor={collectCash ? colors.brandText : undefined} />
        <InfoRow label="Your delivery fee" value={formatCurrency(order.deliveryFee)} strong />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Delivery status</Text>
        <View style={styles.steps}>
          {steps.map((step, index) => {
            const done = index < currentStep || order.status === 'delivered';
            const now = index === currentStep && order.status !== 'delivered';
            return (
              <View key={step.key} style={styles.step} accessibilityLabel={`${step.label}${done ? ', done' : now ? ', current' : ''}`}>
                <View style={[styles.stepBar, done && styles.stepDone, now && styles.stepNow]} />
                <Text style={[styles.stepLabel, (done || now) && styles.stepLabelOn]}>{step.label}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {action?.status === 'picked_up' ? (
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={() => setChecked((value) => !value)} style={styles.check}>
          <View style={[styles.box, checked && styles.boxOn]}>{checked ? <Icon name="checkmark" size={14} color={colors.surface} /> : null}</View>
          <Text style={styles.checkText}>I checked the order number and items with the cook</Text>
        </Pressable>
      ) : null}

      {order.status === 'delivered' ? (
        <Card tone="success" style={styles.person}>
          <IconCircle icon="checkmark-done-outline" tone="success" />
          <Text style={[styles.name, styles.flex]}>Delivered {formatShortDateTime(order.deliveredAt)}</Text>
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
  between: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderNo: {
    ...typography.sectionTitle,
    color: colors.ink,
  },
  label: {
    ...typography.captionStrong,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  person: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  name: {
    ...typography.cardTitle,
    color: colors.ink,
  },
  muted: {
    ...typography.caption,
    color: colors.muted,
  },
  cardTitle: {
    ...typography.cardTitle,
    color: colors.ink,
  },
  steps: {
    flexDirection: 'row',
    gap: 6,
  },
  step: {
    flex: 1,
    gap: 6,
  },
  stepBar: {
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    height: 4,
  },
  stepDone: {
    backgroundColor: colors.success,
  },
  stepNow: {
    backgroundColor: colors.warning,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.muted,
    fontSize: 11,
  },
  stepLabelOn: {
    color: colors.ink,
    fontWeight: '600',
  },
  check: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 44,
  },
  box: {
    alignItems: 'center',
    borderColor: '#BDBDBD',
    borderRadius: 5,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  boxOn: {
    backgroundColor: colors.brandStrong,
    borderColor: colors.brandStrong,
  },
  checkText: {
    ...typography.body,
    color: colors.ink,
    flex: 1,
  },
});
