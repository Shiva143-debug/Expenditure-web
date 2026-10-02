import { useCallback, useEffect, useState } from 'react';
import { getMonthlyStats, getYearlyStats } from '../apiService';

const EMPTY_STATS = { incomeAmount: 0, expenseAmount: 0, taxAmount: 0, expenseCount: 0, categoryCount: 0, savingsAmount: 0 };

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeStats = (stats) => ({
  incomeAmount: toNumber(stats?.incomeAmount),
  expenseAmount: toNumber(stats?.expenseAmount),
  taxAmount: toNumber(stats?.taxAmount),
  expenseCount: toNumber(stats?.expenseCount),
  categoryCount: toNumber(stats?.categoryCount),
  savingsAmount: toNumber(stats?.savingsAmount),
});

/**
 * Loads the dashboard aggregates for the selected month + year.
 * Two requests replace the six per-month / per-year list fetches that the
 * cards used to make. `refreshKey` (the app's lastUpdate stamp) re-runs them
 * after any add / edit / delete.
 */
export const useStats = (month, year, enabled, refreshKey) => {
  const [monthly, setMonthly] = useState(EMPTY_STATS);
  const [yearly, setYearly] = useState(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setMonthly(EMPTY_STATS);
      setYearly(EMPTY_STATS);
      return;
    }

    setIsLoading(true);
    try {
      const [monthRes, yearRes] = await Promise.all([getMonthlyStats(month, year), getYearlyStats(year)]);

      setMonthly(monthRes?.status ? normalizeStats(monthRes.data) : EMPTY_STATS);
      setYearly(yearRes?.status ? normalizeStats(yearRes.data) : EMPTY_STATS);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setMonthly(EMPTY_STATS);
      setYearly(EMPTY_STATS);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, month, year]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  return { monthly, yearly, isLoading, refresh };
};

export default useStats;
