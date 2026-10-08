import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { getCookMeals, getCookOrders, listReviewsForCook } from '@/features/cook/services/cook.service';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { orderNumber } from '@/shared/components/OrderCard';
import { Screen } from '@/shared/components/Screen';
import { IconCircle, type BadgeTone } from '@/shared/components/ui';
import type { IconName } from '@/shared/components/Icon';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { isMealSoldOut } from '@/shared/types/Meal';
import { formatRelative } from '@/shared/utils/dateUtils';

type Notification = {
  key: string;
  icon: IconName;
  tone: BadgeTone;
  title: string;
  detail: string;
  at: string;
  unread: boolean;
  href: Href;
};

/**
 * There is no push backend in the MVP, so notifications are worked out from
 * what is in the database: new orders, cancellation requests, sold-out meals
 * and recent reviews.
 */
export default function CookNotificationsScreen() {
  const user = useCurrentUser();

  const { data, loading, error, reload, refresh, refreshing } = useFocusData(
    async () => {
      const [orders, meals, reviews] = await Promise.all([getCookOrders(user.id), getCookMeals(user.id), listReviewsForCook(user.id, 5)]);
      const items: Notification[] = [];

      for (const order of orders) {
        if (order.status === 'requested') {
          items.push({
            key: `new-${order.id}`,
            icon: 'receipt-outline',
            tone: 'brand',
            title: `New order ${orderNumber(order.id)}`,
            detail: `${order.customerName} ordered ${order.itemsSummary}`,
            at: order.createdAt,
            unread: true,
            href: { pathname: '/(cook)/order/[id]', params: { id: String(order.id) } },
          });
        }
        if (order.cancelStatus === 'requested' && !['cancelled', 'delivered'].includes(order.status)) {
          items.push({
            key: `cancel-${order.id}`,
            icon: 'alert-circle-outline',
            tone: 'warning',
            title: `Cancellation request ${orderNumber(order.id)}`,
            detail: `${order.customerName} asked to cancel`,
            at: order.updatedAt ?? order.createdAt,
            unread: true,
            href: { pathname: '/(cook)/cancellation/[id]', params: { id: String(order.id) } },
          });
        }
      }

      for (const meal of meals.filter((item) => isMealSoldOut(item))) {
        items.push({
          key: `soldout-${meal.id}`,
          icon: 'restaurant-outline',
          tone: 'neutral',
          title: `${meal.name} is sold out`,
          detail: 'Set it available again if you cook more',
          at: meal.updatedAt ?? meal.createdAt,
          unread: false,
          href: '/(cook)/availability',
        });
      }

      for (const review of reviews) {
        items.push({
          key: `review-${review.id}`,
          icon: 'star-outline',
          tone: 'warning',
          title: `New ${review.rating}-star review`,
          detail: `${review.customerName} reviewed ${review.mealName ?? 'your kitchen'}`,
          at: review.createdAt,
          unread: false,
          href: '/(cook)/reviews',
        });
      }

      return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    },
    [] as Notification[],
    [user.id],
  );

  return (
    <Screen title="Notifications" back variant="brand" refreshing={refreshing} onRefresh={refresh}>
      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorView message={error} onRetry={() => reload()} />
      ) : data.length === 0 ? (
        <EmptyState title="You're all caught up" message="New orders and requests will show up here." icon="notifications-outline" />
      ) : (
        data.map((item) => (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            accessibilityLabel={`${item.unread ? 'Unread. ' : ''}${item.title}. ${item.detail}`}
            onPress={() => router.push(item.href)}
            style={({ pressed }) => [styles.item, item.unread && styles.unread, pressed && styles.pressed]}
          >
            <IconCircle icon={item.icon} tone={item.tone} size={38} />
            <View style={styles.flex}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.muted}>
                {item.detail} · {formatRelative(item.at)}
              </Text>
            </View>
            {item.unread ? <View style={styles.dot} /> : null}
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  unread: {
    backgroundColor: '#FFF8F6',
    borderColor: '#F6D3CA',
  },
  pressed: {
    opacity: 0.85,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  muted: {
    ...typography.caption,
    color: colors.muted,
  },
  dot: {
    backgroundColor: colors.brandStrong,
    borderRadius: 4,
    height: 8,
    marginTop: 6,
    width: 8,
  },
});
