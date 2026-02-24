'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * Custom Hooks for NeoRoutine
 * Encapsulate common data fetching patterns with loading, error, and caching
 */

// Simple in-memory cache for API responses
const cache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds

/**
 * Base fetch hook with loading, error handling, and optional caching
 */
export function useFetch(url, options = {}) {
  const {
    enabled = true,
    cacheKey = url,
    cacheTTL = CACHE_TTL,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  const fetchData = useCallback(async (skipCache = false) => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Check cache first
    if (!skipCache && cacheKey) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTTL) {
        setData(cached.data);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (isMounted.current) {
        // Handle both { data: ... } and direct response formats
        const responseData = result.data !== undefined ? result.data : result;
        setData(responseData);
        setError(null);

        // Cache the result
        if (cacheKey) {
          cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
        }

        onSuccess?.(responseData);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err.message);
        onError?.(err);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [url, enabled, cacheKey, cacheTTL, onSuccess, onError]);

  useEffect(() => {
    isMounted.current = true;
    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);
  const invalidate = useCallback(() => {
    if (cacheKey) cache.delete(cacheKey);
  }, [cacheKey]);

  return { data, loading, error, refetch, invalidate };
}

/**
 * Hook for authenticated user data
 */
export function useAuth() {
  const { data, loading, error, refetch } = useFetch('/api/auth/me', {
    cacheKey: 'auth:me',
    cacheTTL: 60 * 1000, // 1 minute
  });

  const user = data?.user || null;
  const isAuthenticated = !!user;
  const isVerified = user?.isEmailVerified || false;
  const tier = user?.tier || 'free';
  const isDemo = user?.email === 'demo@neoroutine.app';

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      cache.delete('auth:me');
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isVerified,
    tier,
    isDemo,
    refetch,
    logout,
  };
}

/**
 * Hook for user routines
 */
export function useRoutines() {
  const [mutating, setMutating] = useState(false);
  const { data, loading, error, refetch, invalidate } = useFetch('/api/routines', {
    cacheKey: 'routines:list',
  });

  const routines = data?.routines || [];

  const createRoutine = useCallback(async (routineData) => {
    setMutating(true);
    try {
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routineData),
      });
      if (!response.ok) throw new Error('Failed to create routine');
      invalidate();
      await refetch();
      return await response.json();
    } finally {
      setMutating(false);
    }
  }, [invalidate, refetch]);

  const updateRoutine = useCallback(async (id, updates) => {
    setMutating(true);
    try {
      const response = await fetch(`/api/routines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update routine');
      invalidate();
      await refetch();
      return await response.json();
    } finally {
      setMutating(false);
    }
  }, [invalidate, refetch]);

  const deleteRoutine = useCallback(async (id) => {
    setMutating(true);
    try {
      const response = await fetch(`/api/routines/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete routine');
      invalidate();
      await refetch();
    } finally {
      setMutating(false);
    }
  }, [invalidate, refetch]);

  return {
    routines,
    loading,
    error,
    mutating,
    refetch,
    createRoutine,
    updateRoutine,
    deleteRoutine,
  };
}

/**
 * Hook for today's check-in data
 */
export function useCheckIns() {
  const [submitting, setSubmitting] = useState(false);
  const { data, loading, error, refetch, invalidate } = useFetch('/api/checkins/today', {
    cacheKey: 'checkins:today',
    cacheTTL: 10 * 1000, // 10 seconds - more frequent updates
  });

  const checkedTasks = useMemo(() => data?.checkedTasks || {}, [data?.checkedTasks]);
  const todayDate = data?.date;

  const toggleTask = useCallback(async (routineId, taskId, checked) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routineId, taskId, checked }),
      });
      
      if (!response.ok) throw new Error('Failed to update check-in');
      
      invalidate();
      const result = await response.json();
      await refetch();
      
      return result;
    } finally {
      setSubmitting(false);
    }
  }, [invalidate, refetch]);

  // Get checked task IDs for a specific routine
  const getCheckedTasks = useCallback((routineId) => {
    return checkedTasks[routineId] || [];
  }, [checkedTasks]);

  return {
    checkedTasks,
    todayDate,
    loading,
    error,
    submitting,
    refetch,
    toggleTask,
    getCheckedTasks,
  };
}

/**
 * Hook for dashboard stats
 */
export function useDashboardStats() {
  const { data, loading, error, refetch } = useFetch('/api/dashboard/stats', {
    cacheKey: 'dashboard:stats',
    cacheTTL: 30 * 1000,
  });

  return {
    stats: data,
    greeting: data?.greeting,
    quote: data?.quote,
    streaks: data?.streaks,
    analytics: data?.analytics,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for user insights
 */
export function useInsights(range = '30') {
  const { data, loading, error, refetch } = useFetch(`/api/insights/user?range=${range}`, {
    cacheKey: `insights:${range}`,
    cacheTTL: 60 * 1000, // 1 minute
  });

  return {
    insights: data,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for user goals
 */
export function useGoals() {
  const [mutating, setMutating] = useState(false);
  const { data, loading, error, refetch, invalidate } = useFetch('/api/user/goals', {
    cacheKey: 'goals:list',
  });

  const goals = data?.goals || [];

  const createGoal = useCallback(async (goalData) => {
    setMutating(true);
    try {
      const response = await fetch('/api/user/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
      });
      if (!response.ok) throw new Error('Failed to create goal');
      invalidate();
      await refetch();
      return await response.json();
    } finally {
      setMutating(false);
    }
  }, [invalidate, refetch]);

  const updateGoal = useCallback(async (id, updates) => {
    setMutating(true);
    try {
      const response = await fetch(`/api/user/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update goal');
      invalidate();
      await refetch();
      return await response.json();
    } finally {
      setMutating(false);
    }
  }, [invalidate, refetch]);

  const deleteGoal = useCallback(async (id) => {
    setMutating(true);
    try {
      const response = await fetch(`/api/user/goals/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete goal');
      invalidate();
      await refetch();
    } finally {
      setMutating(false);
    }
  }, [invalidate, refetch]);

  return {
    goals,
    loading,
    error,
    mutating,
    refetch,
    createGoal,
    updateGoal,
    deleteGoal,
  };
}

/**
 * Hook for local storage state
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('useLocalStorage error:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

/**
 * Hook for debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Clear all cached data (useful on logout)
 */
export function clearCache() {
  cache.clear();
}
