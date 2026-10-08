import { useState } from 'react';
import { router } from 'expo-router';
import { claimDelivery, moveDelivery, nextRiderAction } from '@/features/rider/services/rider.service';
import { AppButton } from '@/shared/components/AppButton';
import { OrderCard } from '@/shared/components/OrderCard';
import type { Order } from '@/shared/types/Order';
import { showError } from '@/shared/utils/alerts';

type RiderDeliveryCardProps = {
  order: Order;
  riderId: number;
  onChanged: () => void;
  showAction?: boolean;
};

export function RiderDeliveryCard({ order, riderId, onChanged, showAction = true }: RiderDeliveryCardProps) {
  const [busy, setBusy] = useState(false);
  const action = nextRiderAction(order, riderId);
  const open = () => router.push({ pathname: '/(rider)/delivery/[id]', params: { id: String(order.id) } });

  async function run() {
    if (!action) return;
    // Pickup needs the checklist on the details screen.
    if (action.status === 'picked_up') {
      open();
      return;
    }
    try {
      setBusy(true);
      if (action.status === 'claim') {
        await claimDelivery(order.id, riderId);
      } else {
        await moveDelivery(order.id, riderId, action.status as 'on_the_way' | 'delivered');
      }
      onChanged();
    } catch (err) {
      showError('Could not update the delivery', err);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <OrderCard order={order} perspective="rider" onPress={open}>
      {showAction && action ? <AppButton title={action.label} size="sm" flex loading={busy} onPress={run} /> : null}
    </OrderCard>
  );
}
