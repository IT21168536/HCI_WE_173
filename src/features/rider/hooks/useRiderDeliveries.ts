import { useEffect, useState } from 'react';
import type { Order } from '@/shared/types/Order';
import { getAvailableDeliveries } from '../services/riderDelivery.service';

export function useRiderDeliveries() {
  const [deliveries, setDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getAvailableDeliveries()
      .then((items) => {
        if (mounted) {
          setDeliveries(items);
          setError(null);
        }
      })
      .catch((err) => mounted && setError(err instanceof Error ? err.message : "Couldn't load deliveries."))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return { deliveries, loading, error };
}
