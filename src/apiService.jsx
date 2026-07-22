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

// Error handler helper
const handleError = (error, customMessage = 'An error occurred') => {
  console.error(`${customMessage}:`, error);
  throw error;
};


// ==================== USER RELATED API CALLS ====================



export const registerUser = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const loginUser = async (loginData) => {
  try {
    console.log('Login Data:', loginData);
    const response = await api.post('/login', loginData);
    return response.data;
  } catch (error) {
    handleError(error.message, 'Error logging in');
  }
};

// ==================== EXPENSE RELATED API CALLS ====================


export const getExpensesData = async () => {
  try {
    const response = await api.get('/get-all-expenses');
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching expense costs');
  }
};

export const getFilteredExpenses = async (month, year) => {
  try {
    const allExpenses = await getExpensesData();

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
    handleError(error, 'Error filtering expenses');
    return [];
  }
};

export const addExpense = async (expenseData) => {
  try {
    const response = await api.post('/add-expense', expenseData);
    return response.data;
  } catch (error) {
    handleError(error, 'Error adding expense');
  }
};

export const updateExpense = async (expenseId, payload) => {
  try {
    const res = await api.put(`/update-expense/${expenseId}`, payload);
    return res.data;
  }
  catch (error) {
    handleError(error, 'Error updating expense');
  }
};

export const deleteExpense = async (expenseId) => {
  try {
    const response = await api.delete(`/delete-expence/${expenseId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error deleting expense');
  }
};


// ==================== CATEGORY RELATED API CALLS ====================

export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching categories');
  }
};

export const addCategory = async (categoryData) => {
  try {
    const response = await api.post('/add-category', categoryData);
    return response;
  } catch (error) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

export const updateCategory = async (categoryId, oldCategory, newCategory) => {
  try {
    const res = await api.put(`/update-category/${categoryId}`, {
      oldCategory,
      newCategory
    });
    return res.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await api.delete(`/delete-category/${categoryId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error deleting category');
  }
};



// ==================== SAVINGS RELATED API CALLS ====================

export const getSavingsData = async () => {
  try {
    const response = await api.get('/get-savings');
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching savings');
  }
};

export const getSavingsDataByMonthYear = async (month, year) => {
  try {
    const response = await api.get(`/get-savings-by-month-year/${month}/${year}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching savings');
  }
};

export const addSaving = async (savingData) => {
  try {
    const response = await api.post('/add-savings', savingData);
    return response.data;
  } catch (error) {
    handleError(error, 'Error adding saving');
  }
};

export const updateSavings = async (savingId, payload) => {
  try {
    const res = await api.put(`/update-savings/${savingId}`, payload);
    return res.data;
  } catch (error) {
    console.error("Error updating savings:", error);
    throw error;
  }
};

export const deleteSaving = async (savingId) => {
  try {
    const response = await api.delete(`/delete-saving/${savingId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error deleting saving');
  }
};

// ==================== EXPENSE_ITEM RELATED API CALLS ====================

export const getExpenseItems = async () => {
  try {
    const response = await api.get('/get-expense-items');
    return response.data;
  } catch (error) {
    console.error('Error fetching expense items:', error);
    throw error;
  }
};

export const getExpenseItemsByCategory = async (categoryName) => {
  try {
    const response = await api.get(`/get-expense-items-by-category?category=${categoryName}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expense items by category:', error);
    throw error;
  }
};

export const addExpenseItem = async (expenceData) => {
  try {
    const response = await api.post('/add-expense-item', expenceData);
    return response.data;
  } catch (error) {
    handleError(error, 'Error adding expense item');
  }
};

export const updateExpenseItem = async (expenseItemId, newexpenseItem) => {
  try {
    const res = await api.put(`/update-expense-item/${expenseItemId}`, { newexpenseItem });
    return res.data;
  } catch (error) {
    console.error('Error updating expense item:', error);
    throw error;
  }
};

export const deleteExpenseItem = async (expenseItemId) => {
  try {
    const response = await api.delete(`/delete-expense-item/${expenseItemId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error deleting Expense Item');
  }
};

// ==================== INCOME_SOURCE RELATED API CALLS ====================

export const getIncomeSources = async () => {
  try {
    const response = await api.get('/get-income-sources');
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching default sources');
  }
};

export const addIncomeSource = async (sourceData) => {
  try {
    const response = await api.post('/add-income-source', sourceData);
    return response;
  } catch (error) {
    if (error.response) {
      return error.response;
    }
    handleError(error, 'Error adding default source');
  }
};

export const updateIncomeSource = async (sourceId, updatedSource) => {
  try {
    const response = await api.put(`/update-income-source/${sourceId}`, updatedSource);
    return response.data;
  } catch (error) {
    handleError(error, 'Error updating source of income');
    throw error;
  }
};

export const deleteIncomeSource = async (sourceId) => {
  try {
    const response = await api.delete(`/delete-income-source/${sourceId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error deleting source');
  }
};

// ==================== INCOME RELATED API CALLS ====================


export const getIncomeByMonthYear = async (month, year) => {
  try {
    const response = await api.get(`/get-income-by-month-year/${month}/${year}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching income sources');
  }
};

export const getTotalIncomeData = async () => {
  try {
    const response = await api.get('/get-total-income');
    return response.data;
  } catch (error) {
    handleError(error, 'Error fetching source data');
  }
};

export const addIncome = async (sourceData) => {
  try {
    const response = await api.post('/add-income', sourceData);
    return response.data;
  } catch (error) {
    handleError(error, 'Error adding source');
  }
};

export const updateIncome = async (sourceId, payload) => {
  try {
    const res = await api.put(`/update-income/${sourceId}`, payload);
    return res.data;
  }
  catch (error) {
    handleError("Error updating source", error);
  }

  return res.data;
};

export const deleteIncome = async (sourceId) => {
  try {
    const response = await api.delete(`/delete-income/${sourceId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Error deleting source');
  }
};

export default {
  getExpensesData,
  getFilteredExpenses,
  addExpense,
  getExpenseItemsByCategory,
  getCategories,
  addCategory,
  updateCategory,
  addExpenseItem,
  updateExpenseItem,
  getExpenseItems,
  getIncomeSources,
  getTotalIncomeData,
  addIncome,
  updateIncome,
  addIncomeSource,
  updateIncomeSource,
  deleteIncome,
  deleteIncomeSource,
  registerUser,
  loginUser,
  getSavingsData,
  getSavingsDataByMonthYear,
  deleteSaving,
  addSaving,
  updateSavings,
  deleteExpense,
  deleteExpenseItem,
  deleteCategory,
  getIncomeByMonthYear
};
