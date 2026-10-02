import axios from 'axios';

// Base URL for all API calls
// https://backend-exp-1.onrender.com
// https://exciting-spice-armadillo.glitch.me
// const BASE_URL = 'http://localhost:4000';
const BASE_URL = 'https://backend-exp.onrender.com';
// const BASE_URL = "http://192.168.1.62:5000"


// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Every backend response follows the standard shape:
// { status: boolean, message: string, data: [] | {} }
// These helpers normalize success and error paths so consumers
// can always rely on that shape and check `response.status`.

const ok = (response) => {
  // Axios wraps the body in `data`; that body is the standard object.
  return response.data ?? { status: true, message: '', data: null };
};

const fail = (error, fallbackMessage = 'Something went wrong') => {
  const payload = error?.response?.data;
  const message =
    payload?.message ||
    error?.message ||
    fallbackMessage;
  return { status: false, message, data: null };
};


// ==================== USER RELATED API CALLS ====================


export const registerUser = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error registering user');
  }
};


export const loginUser = async (loginData) => {
  try {
    const response = await api.post('/login', loginData);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error logging in');
  }
};

// ==================== STATS RELATED API CALLS ====================

// Aggregated income / expense / tax / savings numbers for one month.
// GET /get-stats/:month/:year -> { incomeAmount, expenseAmount, taxAmount,
// expenseCount, categoryCount, savingsAmount }
export const getMonthlyStats = async (month, year) => {
  try {
    const response = await api.get(`/get-stats/${month}/${year}`);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error fetching monthly stats');
  }
};

// Same aggregates for a full year.
// GET /get-stats-year/:year -> { incomeAmount, expenseAmount, taxAmount,
// expenseCount, categoryCount, savingsAmount }
export const getYearlyStats = async (year) => {
  try {
    const response = await api.get(`/get-stats-year/${year}`);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error fetching yearly stats');
  }
};

// ==================== EXPENSE RELATED API CALLS ====================


export const getExpensesData = async () => {
  try {
    const response = await api.get('/get-all-expenses');
    return ok(response);
  } catch (error) {
    return fail(error, 'Error fetching expense costs');
  }
};

export const getFilteredExpenses = async (month, year) => {
  try {
    const res = await getExpensesData();
    const allExpenses = res?.status ? res.data : null;

    if (Array.isArray(allExpenses)) {
      const filteredByDate = allExpenses.filter(item => {
        const date = new Date(item.pDate);
        return (
          date.getMonth() + 1 === month &&
          date.getFullYear() === year
        );
      });

      return filteredByDate.sort(
        (a, b) => new Date(b.pDate) - new Date(a.pDate)
      );
    }

    return [];
  } catch (error) {
    return [];
  }
};

export const addExpense = async (expenseData) => {
  try {
    const response = await api.post('/add-expense', expenseData);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error adding expense');
  }
};

export const updateExpense = async (expenseId, payload) => {
  try {
    const res = await api.put(`/update-expense/${expenseId}`, payload);
    return ok(res);
  }
  catch (error) {
    return fail(error, 'Error updating expense');
  }
};

export const deleteExpense = async (expenseId) => {
  try {
    const response = await api.delete(`/delete-expence/${expenseId}`);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error deleting expense');
  }
};


// ==================== CATEGORY RELATED API CALLS ====================

export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return ok(response);
  } catch (error) {
    return fail(error, 'Error fetching categories');
  }
};

export const addCategory = async (categoryData) => {
  try {
    const response = await api.post('/add-category', categoryData);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error adding category');
  }
};

export const updateCategory = async (categoryId, oldCategory, newCategory) => {
  try {
    const res = await api.put(`/update-category/${categoryId}`, {
      oldCategory,
      newCategory
    });
    return ok(res);
  } catch (error) {
    return fail(error, 'Error updating category');
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await api.delete(`/delete-category/${categoryId}`);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error deleting category');
  }
};



// ==================== SAVINGS RELATED API CALLS ====================

export const getSavingsData = async () => {
  try {
    const response = await api.get('/get-savings');
    return ok(response);
  } catch (error) {
    return fail(error, 'Error fetching savings');
  }
};

export const getSavingsDataByMonthYear = async (month, year) => {
  try {
    const response = await api.get(`/get-savings-by-month-year/${month}/${year}`);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error fetching monthly savings');
  }
};

export const addSaving = async (savingData) => {
  try {
    const response = await api.post('/add-savings', savingData);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error adding saving');
  }
};

export const updateSavings = async (savingId, payload) => {
  try {
    const res = await api.put(`/update-savings/${savingId}`, payload);
    return ok(res);
  } catch (error) {
    return fail(error, 'Error updating savings');
  }
};

export const deleteSaving = async (savingId) => {
  try {
    const response = await api.delete(`/delete-saving/${savingId}`);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error deleting saving');
  }
};

// ==================== EXPENSE_ITEM RELATED API CALLS ====================

export const getExpenseItems = async () => {
  try {
    const response = await api.get('/get-expense-items');
    return ok(response);
  } catch (error) {
    return fail(error, 'Error fetching expense items');
  }
};

export const getExpenseItemsByCategory = async (categoryId) => {
  try {
    const response = await api.get(`/get-expense-items-by-category?categoryId=${categoryId}`);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error fetching expense items by category');
  }
};

export const addExpenseItem = async (expenceData) => {
  try {
    const response = await api.post('/add-expense-item', expenceData);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error adding expense item');
  }
};

export const updateExpenseItem = async (expenseItemId, newexpenseItem) => {
  try {
    const res = await api.put(`/update-expense-item/${expenseItemId}`, { newexpenseItem });
    return ok(res);
  } catch (error) {
    return fail(error, 'Error updating expense item');
  }
};

export const deleteExpenseItem = async (expenseItemId) => {
  try {
    const response = await api.delete(`/delete-expense-item/${expenseItemId}`);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error deleting Expense Item');
  }
};

// ==================== INCOME_SOURCE RELATED API CALLS ====================

export const getIncomeSources = async () => {
  try {
    const response = await api.get('/get-income-sources');
    return ok(response);
  } catch (error) {
    return fail(error, 'Error fetching default sources');
  }
};

export const addIncomeSource = async (sourceData) => {
  try {
    const response = await api.post('/add-income-source', sourceData);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error adding default source');
  }
};

export const updateIncomeSource = async (sourceId, updatedSource) => {
  try {
    const response = await api.put(`/update-income-source/${sourceId}`, updatedSource);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error updating source of income');
  }
};

export const deleteIncomeSource = async (sourceId) => {
  try {
    const response = await api.delete(`/delete-income-source/${sourceId}`);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error deleting source');
  }
};

// ==================== INCOME RELATED API CALLS ====================

// Income entries for one month, used by the monthly income details view.
// GET /get-income-by-month-year/:month/:year
export const getIncomeByMonthYear = async (month, year) => {
  try {
    const response = await api.get(`/get-income-by-month-year/${month}/${year}`);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error fetching monthly income');
  }
};

export const getTotalIncomeData = async () => {
  try {
    const response = await api.get('/get-total-income');
    return ok(response);
  } catch (error) {
    return fail(error, 'Error fetching source data');
  }
};

export const addIncome = async (sourceData) => {
  try {
    const response = await api.post('/add-income', sourceData);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error adding source');
  }
};

export const updateIncome = async (id, payload) => {
  try {
    const res = await api.put(`/update-income/${id}`, payload);
    return ok(res);
  }
  catch (error) {
    return fail(error, 'Error updating source');
  }
};

export const deleteIncome = async (sourceId) => {
  try {
    const response = await api.delete(`/delete-income/${sourceId}`);
    return ok(response);
  } catch (error) {
    return fail(error, 'Error deleting source');
  }
};
