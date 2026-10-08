import { useState } from 'react';
import { router } from 'expo-router';
import { moveCookOrder, nextCookAction } from '@/features/cook/services/cook.service';
import { AppButton } from '@/shared/components/AppButton';
import { OrderCard } from '@/shared/components/OrderCard';
import type { Order } from '@/shared/types/Order';
import { confirm, showError } from '@/shared/utils/alerts';

type CookOrderCardProps = {
  order: Order;
  onChanged: () => void;
  /** Show the one-tap next step (Accept, Start preparing...) under the card. */
  showActions?: boolean;
};

/** An order as the cook sees it: customer, items, their share, and the next step. */
export function CookOrderCard({ order, onChanged, showActions = true }: CookOrderCardProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const action = nextCookAction(order);

  async function run(status: Parameters<typeof moveCookOrder>[1], label: string) {
    if (status === 'cancelled') {
      const ok = await confirm('Decline this order?', 'The customer will be told the kitchen could not take it, and any card payment is refunded.', 'Decline', true);
      if (!ok) return;
    }
    try {
      setBusy(label);
      await moveCookOrder(order.id, status);
      onChanged();
    } catch (err) {
      showError('Could not update the order', err);
    } finally {
      setBusy(null);
    }
  }

  const open = () => router.push({ pathname: '/(cook)/order/[id]', params: { id: String(order.id) } });

  return (
    <OrderCard order={order} perspective="cook" onPress={open}>
      {showActions && order.cancelStatus === 'requested' && order.status !== 'cancelled' ? (
        <AppButton
          title="Review cancellation request"
          size="sm"
          variant="outline"
          icon="alert-circle-outline"
          flex
          onPress={() => router.push({ pathname: '/(cook)/cancellation/[id]', params: { id: String(order.id) } })}
        />
      ) : showActions && order.status === 'requested' ? (
        <>
          <AppButton title="Decline" size="sm" variant="outline" flex loading={busy === 'decline'} onPress={() => run('cancelled', 'decline')} />
          <AppButton title="Accept" size="sm" flex loading={busy === 'accept'} onPress={() => run('accepted', 'accept')} />
        </>
      ) : showActions && action ? (
        <AppButton title={action.label} size="sm" flex loading={busy === 'next'} onPress={() => run(action.status, 'next')} />
      ) : null}
    </OrderCard>
  );
}
