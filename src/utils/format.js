const currencyFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

const percentFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 });

/** 30590 -> "30,590" (keeps paise only when they exist) */
export const formatAmount = (value) => currencyFormatter.format(Number(value) || 0);

/** 30590 -> "₹ 30,590" */
export const formatCurrency = (value) => `₹ ${formatAmount(value)}`;

/** 0.2277 -> "22.8%" */
export const formatPercent = (ratio) => `${percentFormatter.format((Number(ratio) || 0) * 100)}%`;

/** Safe division: 0 denominator collapses to 0 instead of NaN/Infinity. */
export const safeRatio = (part, total) => (Number(total) > 0 ? Number(part) / Number(total) : 0);
