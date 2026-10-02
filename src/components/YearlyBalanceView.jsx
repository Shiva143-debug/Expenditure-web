import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Search } from "lucide-react";
import { getTotalIncomeData, getExpensesData, getSavingsData } from "../apiService";
import { formatAmount } from "../utils/format";
import { getMonthName } from "../utils/date";
import "./DetailsView.css";
import "./YearlyBalanceView.css";

const MONTHS = Array.from({ length: 12 }, (_, index) => getMonthName(index + 1));

const INCOME_COLOR = "#16a34a";
const EXPENSE_COLOR = "#dc2626";
const SAVINGS_COLOR = "#2563eb";

// The three yearly tables only differ by endpoint, date field and amount field,
// so one loader feeds all of them.
const yearlySources = {
  income: { fetcher: getTotalIncomeData, dateKey: 'date', amountKey: 'amount' },
  expenses: { fetcher: getExpensesData, dateKey: 'pDate', amountKey: 'cost' },
  savings: { fetcher: getSavingsData, dateKey: 'date', amountKey: 'amount' },
};

// Prefer the month / year the backend sends, otherwise read them off the date.
const readMonth = (item, dateKey) => {
  const fromField = Number(item.month);
  if (!Number.isNaN(fromField) && fromField >= 1 && fromField <= 12) return fromField;
  const date = new Date(item[dateKey]);
  return Number.isNaN(date.getTime()) ? 0 : date.getMonth() + 1;
};

const readYear = (item, dateKey) => {
  const fromField = Number(item.year);
  if (!Number.isNaN(fromField) && fromField > 0) return fromField;
  const date = new Date(item[dateKey]);
  return Number.isNaN(date.getTime()) ? 0 : date.getFullYear();
};

const toNumber = (value) => {
  const amount = Number(value);
  return Number.isNaN(amount) ? 0 : amount;
};

const YearlyBalanceView = ({ refreshKey, enabled = true, onClose }) => {
  const [data, setData] = useState({ income: [], expenses: [], savings: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      if (!enabled) {
        setData({ income: [], expenses: [], savings: [] });
        return;
      }

      setIsLoading(true);
      const entries = await Promise.all(
        Object.entries(yearlySources).map(async ([key, { fetcher }]) => {
          try {
            const res = await fetcher();
            return [key, res?.status && Array.isArray(res.data) ? res.data : []];
          } catch (error) {
            console.error(`Error fetching ${key}:`, error);
            return [key, []];
          }
        })
      );
      if (active) setData(Object.fromEntries(entries));
      if (active) setIsLoading(false);
    };

    loadData();
    return () => { active = false; };
  }, [enabled, refreshKey]);

  // One row per month that has any activity, newest first.
  const months = useMemo(() => {
    const totals = {};

    const accumulate = (rows, dateKey, amountKey, bucket) => {
      rows.forEach((item) => {
        const month = readMonth(item, dateKey);
        const year = readYear(item, dateKey);
        if (!month || !year) return;
        const key = `${year}-${month}`;
        if (!totals[key]) {
          totals[key] = { year, month, monthName: MONTHS[month - 1], income: 0, expenses: 0, savings: 0 };
        }
        totals[key][bucket] += toNumber(item[amountKey]);
      });
    };

    accumulate(data.income, 'date', 'amount', 'income');
    accumulate(data.expenses, 'pDate', 'cost', 'expenses');
    accumulate(data.savings, 'date', 'amount', 'savings');

    return Object.values(totals)
      .map((row) => ({ ...row, balance: row.income - (row.expenses + row.savings) }))
      .filter((row) => row.income > 0 || row.expenses > 0 || row.savings > 0)
      .sort((a, b) => (b.year - a.year) || (b.month - a.month));
  }, [data]);

  const totals = useMemo(() => {
    const income = months.reduce((sum, row) => sum + row.income, 0);
    const expenses = months.reduce((sum, row) => sum + row.expenses, 0);
    const savings = months.reduce((sum, row) => sum + row.savings, 0);
    return { income, expenses, savings, balance: income - (expenses + savings) };
  }, [months]);

  const filteredMonths = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return months;
    return months.filter((row) => row.monthName.toLowerCase().includes(search) || String(row.year).includes(search));
  }, [months, searchTerm]);

  const barTotal = totals.income + totals.expenses + totals.savings;
  const isPositiveBalance = totals.balance >= 0;

  const handleClose = useCallback(() => {
    setSearchTerm('');
    onClose();
  }, [onClose]);

  const stats = [
    { label: 'Earnings', key: 'income', color: INCOME_COLOR },
    { label: 'Expenses', key: 'expenses', color: EXPENSE_COLOR },
    { label: 'Savings', key: 'savings', color: SAVINGS_COLOR },
  ];

  return (
    <div className="yearly-balance-view">
      {isLoading && (
        <div className="details-loading-overlay">
          <div className="loader-spinner"></div>
        </div>
      )}

      <div className="yearly-balance-header">
        <button className="back-btn" onClick={handleClose} title="Back to Overview">
          <ArrowLeft size={20} />
          <span>Back to Overview</span>
        </button>

        <div className="search-container yearly-balance-search">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search month or year..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input" />
        </div>
      </div>

      <div className="yearly-balance-body">
        <div className="yearly-balance-summary">
          <div className="yearly-balance-summary__main">
            <div className="yearly-balance-summary__figure">
              <span className="yearly-balance-summary__label">Total Net Balance</span>
              <span className={`yearly-balance-summary__amount ${isPositiveBalance ? 'is-positive' : 'is-negative'}`}>
                ₹{formatAmount(totals.balance)}
              </span>
            </div>
            <Wallet size={26} className="yearly-balance-summary__icon" />
          </div>

          <div className="yearly-balance-summary__totals">
            {stats.map((stat) => (
              <div className="yearly-balance-total" key={stat.label}>
                <span className="yearly-balance-total__label" style={{ color: stat.color }}>{stat.label}</span>
                <span className="yearly-balance-total__value">₹{formatAmount(totals[stat.key])}</span>
              </div>
            ))}
          </div>

          <div className="yearly-balance-bar">
            {barTotal > 0 && (
              <>
                <span style={{ flex: totals.income, background: INCOME_COLOR }} />
                <span style={{ flex: totals.expenses, background: EXPENSE_COLOR }} />
                <span style={{ flex: totals.savings, background: SAVINGS_COLOR }} />
              </>
            )}
          </div>
        </div>

        <div className="details-content yearly-balance-list">
          {filteredMonths.length === 0 ? (
            <div className="no-data-message">No yearly data found.</div>
          ) : (
            filteredMonths.map((row, index) => {
              const isPositive = row.balance >= 0;
              const monthAbbr = row.monthName.slice(0, 3).toUpperCase();

              return (
                <div key={`${row.year}-${row.month}`}
                  className={`details-card yearly-balance-card ${isPositive ? 'is-positive' : 'is-negative'}`}
                  style={{ animationDelay: `${index * 0.04}s` }}>
                  <div className="yearly-balance-card__tile">{monthAbbr}</div>

                  <div className="yearly-balance-card__body">
                    <div className="yearly-balance-card__top">
                      <span className="yearly-balance-card__month">{row.monthName}</span>
                      <span className="yearly-balance-card__year">{row.year}</span>
                    </div>

                    <div className="yearly-balance-card__stats">
                      {stats.map((stat) => (
                        <div className="yearly-balance-card__stat" key={stat.label}>
                          <span className="yearly-balance-card__stat-label" style={{ color: stat.color }}>
                            {stat.label === 'Earnings' ? 'Earned' : stat.label}
                          </span>
                          <span className="yearly-balance-card__stat-value">₹{formatAmount(row[stat.key])}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`yearly-balance-card__net ${isPositive ? 'is-positive' : 'is-negative'}`}>
                    {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    <span>{isPositive ? '+' : '-'}₹{formatAmount(Math.abs(row.balance))}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default YearlyBalanceView;
