import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { listCart, placeOrder } from '@/features/customer/services/customer.service';
import { buildTimeSlots } from '@/features/customer/utils/timeSlots';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { Screen } from '@/shared/components/Screen';
import { Card, Chip, ChipRow, Divider, InfoRow, Notice, Segmented } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import type { CartItem } from '@/shared/types/CartItem';
import { DELIVERY_FEE, type DeliveryType, type PaymentMethod } from '@/shared/types/Order';
import { errorMessage } from '@/shared/utils/alerts';
import { formatCurrency } from '@/shared/utils/formatCurrency';

const deliveryOptions: { value: DeliveryType; label: string }[] = [
  { value: 'delivery', label: 'Delivery' },
  { value: 'pickup', label: 'Pickup' },
];

const paymentOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
];

export default function CheckoutScreen() {
  const user = useCurrentUser();
  const { data: items, loading, error, reload } = useFocusData(() => listCart(user.id), [] as CartItem[], [user.id]);
  const slots = useMemo(() => buildTimeSlots(), []);

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [address, setAddress] = useState(user.address ?? '');
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentMethod>('cash');
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const kitchens = useMemo(() => {
    const map = new Map<number, { name: string; location: string; items: CartItem[] }>();
    for (const item of items) {
      const entry = map.get(item.meal.cookId) ?? { name: item.meal.cookName ?? 'Kitchen', location: item.meal.cookLocation ?? '', items: [] };
      entry.items.push(item);
      map.set(item.meal.cookId, entry);
    }
    return [...map.values()];
  }, [items]);

  const subtotal = items.reduce((sum, item) => sum + item.meal.price * item.quantity, 0);
  const deliveryTotal = deliveryType === 'delivery' ? DELIVERY_FEE * kitchens.length : 0;
  const total = subtotal + deliveryTotal;

  async function onPlaceOrder() {
    if (deliveryType === 'delivery' && !address.trim()) {
      setFormError('Add a delivery address, or choose pickup.');
      return;
    }
    try {
      setPlacing(true);
      setFormError(null);
      const orderIds = await placeOrder(user.id, {
        deliveryType,
        deliveryAddress: address,
        scheduledTime,
        paymentMethod: payment,
        note,
      });
      Alert.alert(
        'Order successfully placed.',
        orderIds.length > 1
          ? `We sent ${orderIds.length} orders to the kitchens. You'll see each one update in Orders.`
          : 'The cook will confirm your order shortly.',
      );
      router.dismissAll();
      if (orderIds.length === 1) {
        router.push({ pathname: '/(customer)/order/[id]', params: { id: String(orderIds[0]) } });
      } else {
        router.replace('/(customer)/(tabs)/orders');
      }
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return <LoadingView message="Preparing checkout..." fill />;
  }

  return (
    <Screen
      title="Checkout"
      back
      footer={
        items.length > 0 ? (
          <>
            {formError ? (
              <Text accessibilityLiveRegion="polite" style={styles.error}>
                {formError}
              </Text>
            ) : null}
            <AppButton title={`Place order · ${formatCurrency(total)}`} loading={placing} onPress={onPlaceOrder} />
          </>
        ) : undefined
      }
    >
      {error ? (
        <ErrorView message={error} onRetry={() => reload()} />
      ) : items.length === 0 ? (
        <EmptyState title="No checkout items" message="Your selected meals will appear here." icon="cart-outline" actionLabel="Browse meals" onAction={() => router.replace('/(customer)/(tabs)/home')} />
      ) : (
        <>
          <Text style={styles.label}>How do you want your meal?</Text>
          <Segmented options={deliveryOptions} value={deliveryType} onChange={setDeliveryType} />
          {deliveryType === 'delivery' ? (
            <AppInput label="Delivery address" icon="location-outline" value={address} onChangeText={setAddress} placeholder="House no., street, town" />
          ) : (
            <Card tone="brand">
              <Text style={styles.cardTitle}>Collect from</Text>
              {kitchens.map((kitchen) => (
                <Text key={kitchen.name} style={styles.body}>
                  {kitchen.name} · {kitchen.location}
                </Text>
              ))}
              <Text style={styles.muted}>The kitchen tells you when your meal is ready. Exact address is shared after the cook accepts.</Text>
            </Card>
          )}

          <Text style={styles.label}>When</Text>
          <ChipRow>
            {slots.map((slot) => (
              <Chip key={slot.label} label={slot.label} icon={slot.value ? 'calendar-outline' : 'flash-outline'} selected={scheduledTime === slot.value} onPress={() => setScheduledTime(slot.value)} />
            ))}
          </ChipRow>
          {scheduledTime ? <Notice icon="calendar-outline" text="This is a pre-order. The cook will prepare it for the time you chose." /> : null}

          <Text style={styles.label}>Payment</Text>
          <Segmented options={paymentOptions} value={payment} onChange={setPayment} />
          <Text style={styles.muted}>
            {payment === 'cash'
              ? deliveryType === 'delivery'
                ? 'Pay the rider in cash when your meal arrives.'
                : 'Pay the cook in cash when you collect.'
              : 'Card payments are simulated in this prototype; your order is marked as paid.'}
          </Text>

          <AppInput label="Note for the cook (optional)" value={note} onChangeText={setNote} placeholder="e.g. Less spicy, please" multiline />

          <Card>
            <Text style={styles.cardTitle}>Order summary</Text>
            {kitchens.map((kitchen) => (
              <View key={kitchen.name} style={styles.kitchen}>
                <Text style={styles.kitchenName}>{kitchen.name}</Text>
                {kitchen.items.map((item) => (
                  <InfoRow key={item.id} label={`${item.meal.name} × ${item.quantity}`} value={formatCurrency(item.meal.price * item.quantity)} />
                ))}
              </View>
            ))}
            <Divider />
            <InfoRow label="Subtotal" value={formatCurrency(subtotal)} />
            <InfoRow
              label={deliveryType === 'delivery' ? `Delivery${kitchens.length > 1 ? ` (${kitchens.length} kitchens)` : ''}` : 'Pickup'}
              value={deliveryType === 'delivery' ? formatCurrency(deliveryTotal) : 'Free'}
            />
            <InfoRow label="Total" value={formatCurrency(total)} strong valueColor={colors.brandText} />
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  cardTitle: {
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
  kitchen: {
    gap: 6,
  },
  kitchenName: {
    ...typography.captionStrong,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  error: {
    ...typography.body,
    color: colors.danger,
  },
});
