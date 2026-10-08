import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { listCart, removeFromCart, setCartQuantity } from '@/features/customer/services/customer.service';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { Icon } from '@/shared/components/Icon';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { MealImage } from '@/shared/components/MealImage';
import { Screen } from '@/shared/components/Screen';
import { Badge, Card, Divider, InfoRow, Notice, Stepper } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import type { CartItem } from '@/shared/types/CartItem';
import { isMealSoldOut } from '@/shared/types/Meal';
import { DELIVERY_FEE } from '@/shared/types/Order';
import { showError } from '@/shared/utils/alerts';
import { formatCurrency } from '@/shared/utils/formatCurrency';

export default function CartScreen() {
  const user = useCurrentUser();
  const { data: items, loading, error, reload, setData } = useFocusData(() => listCart(user.id), [] as CartItem[], [user.id]);

  async function changeQuantity(item: CartItem, quantity: number) {
    try {
      await setCartQuantity(user.id, item.mealId, quantity);
      setData((current) => current.map((entry) => (entry.mealId === item.mealId ? { ...entry, quantity } : entry)));
    } catch (err) {
      showError('Could not update cart', err);
    }
  }

  async function remove(item: CartItem) {
    try {
      await removeFromCart(user.id, item.mealId);
      setData((current) => current.filter((entry) => entry.mealId !== item.mealId));
    } catch (err) {
      showError('Could not update cart', err);
    }
  }

  const kitchens = new Set(items.map((item) => item.meal.cookId)).size;
  const subtotal = items.reduce((sum, item) => sum + item.meal.price * item.quantity, 0);
  const problems = items.filter((item) => isMealSoldOut(item.meal) || item.quantity > item.meal.availableQuantity);

  return (
    <Screen
      title="Cart"
      back
      footer={
        items.length > 0 ? (
          <AppButton
            title={`Checkout · ${formatCurrency(subtotal)}`}
            disabled={problems.length > 0}
            onPress={() => router.push('/(customer)/checkout')}
          />
        ) : undefined
      }
    >
      {loading ? (
        <LoadingView message="Loading your cart..." />
      ) : error ? (
        <ErrorView message={error} onRetry={() => reload()} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          message="Choose a meal from a local cook to begin checkout."
          icon="cart-outline"
          actionLabel="Browse meals"
          onAction={() => router.replace('/(customer)/(tabs)/home')}
        />
      ) : (
        <>
          {kitchens > 1 ? <Notice text={`Your meals come from ${kitchens} kitchens, so they arrive as ${kitchens} separate orders.`} /> : null}
          {problems.length > 0 ? (
            <Notice tone="danger" icon="alert-circle-outline" text="Some meals are sold out or have fewer portions left. Update them to continue." />
          ) : null}

          {items.map((item) => {
            const soldOut = isMealSoldOut(item.meal);
            return (
              <Card key={item.id} style={styles.item}>
                <MealImage uri={item.meal.imagePath} size={64} dimmed={soldOut} />
                <View style={styles.flex}>
                  <View style={styles.between}>
                    <Text style={styles.name} numberOfLines={2}>
                      {item.meal.name}
                    </Text>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${item.meal.name}`} hitSlop={10} onPress={() => remove(item)}>
                      <Icon name="trash-outline" size={18} color={colors.muted} />
                    </Pressable>
                  </View>
                  <Text style={styles.muted}>by {item.meal.cookName}</Text>
                  {soldOut ? (
                    <Badge label="Sold out for today" tone="neutral" />
                  ) : item.quantity > item.meal.availableQuantity ? (
                    <Badge label={`Only ${item.meal.availableQuantity} left`} tone="warning" />
                  ) : null}
                  <View style={styles.between}>
                    <Text style={styles.price}>{formatCurrency(item.meal.price * item.quantity)}</Text>
                    {!soldOut ? (
                      <Stepper
                        label={`${item.meal.name} portions`}
                        value={item.quantity}
                        min={1}
                        max={Math.max(item.meal.availableQuantity, 1)}
                        onChange={(value) => changeQuantity(item, value)}
                      />
                    ) : null}
                  </View>
                </View>
              </Card>
            );
          })}

          <Card>
            <InfoRow label="Meals" value={formatCurrency(subtotal)} />
            <InfoRow label="Delivery" value={`${formatCurrency(DELIVERY_FEE)} per kitchen`} />
            <Divider />
            <Text style={styles.muted}>Choose delivery or pickup and a time at checkout.</Text>
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    gap: 4,
  },
  item: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  between: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  name: {
    ...typography.cardTitle,
    color: colors.ink,
    flex: 1,
  },
  muted: {
    ...typography.caption,
    color: colors.muted,
  },
  price: {
    ...typography.cardTitle,
    color: colors.brandText,
    fontWeight: '700',
  },
});
