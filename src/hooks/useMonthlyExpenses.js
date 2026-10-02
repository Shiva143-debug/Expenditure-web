import { useCallback, useEffect, useMemo, useState } from 'react';
import { getFilteredExpenses } from '../apiService';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

// The donut chart needs the same month of expenses that the details table
// lists, so both are derived from one request inside each component.
const toChartData = (expenses) => {
  const totalsByCategory = {};

  expenses.forEach(({ category, cost }) => {
    const key = category || 'Others';
    totalsByCategory[key] = (totalsByCategory[key] || 0) + toNumber(cost);
  });

  const total = Object.values(totalsByCategory).reduce((sum, value) => sum + value, 0);
  if (total === 0) return [];

  return Object.entries(totalsByCategory).map(([name, value]) => ({ name, value, percentage: (value / total) * 100 }));
};

/**
 * Loads the expense rows of one month.
 * `refreshKey` (the app's lastUpdate stamp) re-runs the request after any edit.
 */
export const useMonthlyExpenses = (month, year, enabled, refreshKey) => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!enabled) {
      setExpenses([]);
      return;
    }

    setIsLoading(true);
    try {
      setExpenses(await getFilteredExpenses(month, year));
    } catch (error) {
      console.error('Error loading monthly expenses:', error);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, month, year]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const chartData = useMemo(() => toChartData(expenses), [expenses]);
  const total = useMemo(() => expenses.reduce((sum, item) => sum + toNumber(item.cost), 0), [expenses]);
  const totalTax = useMemo(() => expenses.reduce((sum, item) => sum + toNumber(item.taxAmount), 0), [expenses]);

  return { expenses, chartData, total, totalTax, isLoading, refresh: load };
};

export default useMonthlyExpenses;
