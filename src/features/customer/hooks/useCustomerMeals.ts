import { useEffect, useState } from 'react';
import type { Meal } from '@/shared/types/Meal';
import { getCustomerMeals } from '../services/customerMeal.service';

export function useCustomerMeals(search = '') {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getCustomerMeals(search)
      .then((items) => {
        if (mounted) {
          setMeals(items);
          setError(null);
        }
      })
      .catch((err) => mounted && setError(err instanceof Error ? err.message : "Couldn't load meals."))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [search]);

  return { meals, loading, error };
}
