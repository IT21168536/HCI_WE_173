import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

/**
 * Loads data when the screen gains focus (so lists stay fresh after another
 * screen changes the database), again whenever `deps` change, and exposes a
 * manual reload for pull-to-refresh and "Try again".
 *
 * Responses that arrive after the inputs have changed (for example while the
 * user is still typing a search) are ignored, so the screen never shows
 * results for an old query.
 */
export function useFocusData<T>(loader: () => Promise<T>, initial: T, deps: unknown[]) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const depsKey = JSON.stringify(deps);
  const loaderRef = useRef(loader);
  const activeKeyRef = useRef(depsKey);

  useEffect(() => {
    loaderRef.current = loader;
  });

  const reload = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    const key = activeKeyRef.current;
    if (mode === 'refresh') {
      setRefreshing(true);
    }
    try {
      const value = await loaderRef.current();
      if (key !== activeKeyRef.current) return;
      setData(value);
      setError(null);
    } catch (err) {
      if (key !== activeKeyRef.current) return;
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      activeKeyRef.current = depsKey;
      void reload();
    }, [reload, depsKey]),
  );

  return { data, setData, loading, refreshing, error, reload, refresh: () => reload('refresh') };
}
