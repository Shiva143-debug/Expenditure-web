const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long' });

/** 1 -> "January" */
export const getMonthName = (month) => monthFormatter.format(new Date(2000, Number(month) - 1, 1));

/** "2024-05-09" -> "09/05/2024" */
export const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};
