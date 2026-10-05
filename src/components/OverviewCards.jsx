import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, IndianRupee, PiggyBank, Receipt, Scale, TrendingDown, TrendingUp } from 'lucide-react';
import OverviewCard from './OverviewCard';
import { useStats } from '../hooks/useStats';
import { formatCurrency, formatPercent, safeRatio } from '../utils/format';
import './OverviewCards.css';

const buildCards = ({
  year,
  monthly,
  yearly,
  canManage,
  showIncomeArrow,
  showExpensesArrow,
  showSavingsArrow,
  showYearlyArrow,
  onAddEarnings,
  onAddExpense,
  onAddSavings,
  onOpenIncome,
  onOpenExpenses,
  onOpenSavings,
  onOpenYearly,
}) => {
  const balance = monthly.incomeAmount - (monthly.expenseAmount + monthly.savingsAmount);

  return [
    {
      id: 'earnings',
      tone: 'earnings',
      icon: <IndianRupee size={17} />,
      coins: 'fall',
      label: 'Earnings',
      amount: monthly.incomeAmount,
      // amountLabel: 'Income',
      rows: [{ label: 'Expensed', value: formatPercent(safeRatio(monthly.expenseAmount, monthly.incomeAmount)) }],
      note: 'Income received this month',
      onAddClick: canManage ? onAddEarnings : undefined,
      onOpen: showIncomeArrow ? onOpenIncome : undefined,
      openTitle: 'View monthly income',
    },
    {
      id: 'expenses',
      tone: 'expenses',
      icon: <TrendingDown size={17} />,
      coins: 'rise',
      label: 'Expenses',
      amount: monthly.expenseAmount,
      rows: [{ label: 'Entries', value: monthly.expenseCount }, { label: 'Categories', value: monthly.categoryCount }],
      onAddClick: canManage ? onAddExpense : undefined,
      onOpen: showExpensesArrow ? onOpenExpenses : undefined,
      openTitle: 'View monthly expenses',
    },
    {
      id: 'savings',
      tone: 'savings',
      icon: <PiggyBank size={17} />,
      coins: 'drop',
      label: 'Savings',
      amount: monthly.savingsAmount,
      rows: [{ label: 'Saved of income', value: formatPercent(safeRatio(monthly.savingsAmount, monthly.incomeAmount)) }],
      onAddClick: canManage ? onAddSavings : undefined,
      onOpen: showSavingsArrow ? onOpenSavings : undefined,
      openTitle: 'View monthly savings',
    },
    {
      id: 'tax',
      tone: 'tax',
      icon: <Receipt size={17} />,
      label: 'Tax Paid',
      amount: monthly.taxAmount,
      rows: [{ label: 'Effective rate', value: formatPercent(safeRatio(monthly.taxAmount, monthly.expenseAmount)) }],
      note: 'GST included in expenses',
    },
    {
      id: 'balance',
      tone: 'balance',
      icon: <Scale size={17} />,
      label: 'Balance',
      amount: Math.abs(balance),
      isNegative: balance < 0,
      rows: [
        { label: 'Expenses', value: formatCurrency(monthly.expenseAmount) },
        { label: 'Savings', value: formatCurrency(monthly.savingsAmount) },
      ],
      note: balance < 0 ? 'Income spent beyond savings' : 'Income left after expenses + savings',
    },
    {
      id: 'yearly',
      tone: 'yearly',
      icon: <TrendingUp size={17} />,
      label: 'Yearly',
      amount: yearly.incomeAmount,
      amountLabel: `${year} income`,
      rows: [
        { label: 'Expenses', value: formatCurrency(yearly.expenseAmount) },
        { label: 'Tax', value: formatCurrency(yearly.taxAmount) },
        { label: 'Savings', value: formatCurrency(yearly.savingsAmount) },
      ],
      onOpen: showYearlyArrow ? onOpenYearly : undefined,
      openTitle: `Open ${year} breakdown`,
    },
  ];
};

const OverviewCards = ({
  month,
  year,
  refreshKey,
  canManage = false,
  showIncomeArrow = false,
  showExpensesArrow = false,
  showSavingsArrow = false,
  showYearlyArrow = false,
  onAddEarnings,
  onAddExpense,
  onAddSavings,
  onOpenIncome,
  onOpenExpenses,
  onOpenSavings,
  onOpenYearly,
}) => {
  // The cards own their data: /get-stats + /get-stats-year live here, not in App.
  const { monthly, yearly, isLoading } = useStats(month, year, canManage, refreshKey);
  const cards = buildCards({
    year,
    monthly,
    yearly,
    canManage,
    showIncomeArrow,
    showExpensesArrow,
    showSavingsArrow,
    showYearlyArrow,
    onAddEarnings,
    onAddExpense,
    onAddSavings,
    onOpenIncome,
    onOpenExpenses,
    onOpenSavings,
    onOpenYearly,
  });
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [overflow, setOverflow] = useState({ atStart: true, atEnd: false, isScrollable: false });

  const syncTrack = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const { scrollLeft, scrollWidth, clientWidth } = track;
    setOverflow({
      atStart: scrollLeft <= 1,
      atEnd: scrollLeft + clientWidth >= scrollWidth - 1,
      isScrollable: scrollWidth > clientWidth + 1,
    });

    let closestIndex = 0;
    let closestDistance = Infinity;
    Array.from(track.children).forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    setActiveIndex(closestIndex);
  }, []);

  useEffect(() => {
    syncTrack();
    window.addEventListener('resize', syncTrack);
    return () => window.removeEventListener('resize', syncTrack);
  }, [syncTrack, cards.length]);

  const goTo = (index) => {
    const track = trackRef.current;
    const target = track?.children[index];
    if (track && target) {
      track.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
    }
  };

  const page = (direction) => {
    const track = trackRef.current;
    if (track) {
      track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' });
    }
  };

  return (
    <div className="overview-cards mb-5">
      <div className="overview-slider">
        {overflow.isScrollable && (
          <>
            <button
              type="button" className="overview-slider__nav overview-slider__nav--prev" onClick={() => page(-1)} disabled={overflow.atStart} aria-label="Scroll cards left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button" className="overview-slider__nav overview-slider__nav--next" onClick={() => page(1)} disabled={overflow.atEnd} aria-label="Scroll cards right"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        <div className="overview-slider__track" ref={trackRef} onScroll={syncTrack}>
          {cards.map((card) => (
            <div className="overview-slider__item" key={card.id}>
              <OverviewCard {...card} isLoading={isLoading} loadingText="Loading..." />
            </div>
          ))}
        </div>
      </div>

      {overflow.isScrollable && (
        <div className="overview-slider__dots">
          {cards.map((card, index) => (
            <button
              type="button" key={card.id} className={`overview-slider__dot ${index === activeIndex ? 'is-active' : ''}`} onClick={() => goTo(index)} aria-label={`Go to ${card.label} card`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OverviewCards;
