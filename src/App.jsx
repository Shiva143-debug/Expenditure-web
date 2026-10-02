import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LogIn, LogOut, AlertTriangle, Calendar } from 'lucide-react';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import "primereact/resources/themes/lara-dark-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { useAuth } from './context/AuthContext';
import { getCategories, getExpenseItems, getIncomeSources, deleteExpense, deleteIncome, deleteSaving, deleteCategory, deleteExpenseItem, deleteIncomeSource } from './apiService';
import { getMonthName } from './utils/date';
import { formatAmount } from './utils/format';
import OverviewCards from './components/OverviewCards';
import InfoCard, { InfoItem } from './components/InfoCard';
import DonutChart from './components/DonutChart';
import DetailsView from './components/DetailsView';
import MonthlyExpensesView from './components/MonthlyExpensesView';
import MonthlyIncomeView from './components/MonthlyIncomeView';
import MonthlySavingsView from './components/MonthlySavingsView';
import YearlyBalanceView from './components/YearlyBalanceView';
import EarningsForm from './components/EarningsForm';
import ExpenseForm from './components/ExpenseForm';
import SavingsForm from './components/SavingsForm';
import AddSourceForm from './components/AddSourceForm';
import AddCategoryForm from './components/AddCategoryForm';
import AddItemForm from './components/AddItemForm';
import SplashScreen from './components/SplashScreen';
import LoginForm from './components/LoginForm';
import expenditureData from './data/expenditureData.json';
import './App.css';

const monthOptions = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  .map((label, index) => ({ label, value: String(index + 1) }));

const yearOptions = [2024, 2025, 2026, 2027, 2028].map((year) => ({ label: String(year), value: String(year) }));

const particles = Array.from({ length: 30 }, (_, i) => (
  <div key={i} className="particle" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 15}s`, animationDuration: `${15 + Math.random() * 10}s` }} />
));

const confirmIcon = <AlertTriangle size={32} className="p-confirm-dialog-icon" />;

/** The three transactional lists only differ by endpoint, so they share one confirm + toast flow. */
const useDeleteFlow = (toast, onDeleted) => useCallback(({ message, request, label }) => {
  confirmDialog({
    message,
    header: 'Delete Confirmation',
    icon: confirmIcon,
    acceptClassName: 'p-button-danger',
    accept: async () => {
      try {
        const res = await request();
        if (res?.status) {
          onDeleted();
          toast.current.show({ severity: 'success', summary: 'Success', detail: res.message || `${label} deleted successfully`, life: 3000 });
        } else {
          toast.current.show({ severity: 'error', summary: 'Error', detail: res?.message || `Failed to delete ${label.toLowerCase()}`, life: 3000 });
        }
      } catch (error) {
        console.error(`Error deleting ${label.toLowerCase()}:`, error);
        toast.current.show({ severity: 'error', summary: 'Error', detail: `Failed to delete ${label.toLowerCase()}`, life: 3000 });
      }
    },
  });
}, [toast, onDeleted]);

function App() {
  const { user, logout } = useAuth();
  const toast = useRef(null);
  const dateSelectorRef = useRef(null);

  const [showSplash, setShowSplash] = useState(true);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [activeView, setActiveView] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // Every card / chart / table watches this stamp, so one bump refreshes them all.
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const [categories, setCategories] = useState(expenditureData.expenseCategories);
  const [expenseItems, setExpenseItems] = useState(expenditureData.expenseItems);
  const [earningsSources, setEaringSources] = useState(expenditureData.earningsSources);

  const [showEarningsForm, setShowEarningsForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showSavingsForm, setShowSavingsForm] = useState(false);
  const [showSourceForm, setShowSourceForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);

  const [editSourceData, setEditSourceData] = useState(null);
  const [editCategoryData, setEditCategoryData] = useState(null);
  const [editItemData, setEditItemData] = useState(null);
  const [editExpenseData, setEditExpenseData] = useState(null);
  const [editIncomeData, setEditIncomeData] = useState(null);
  const [editSavingsData, setEditSavingsData] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [isEditingDate, setIsEditingDate] = useState(false);

  const month = Number(selectedMonth);
  const year = Number(selectedYear);
  const isLoggedIn = Boolean(user);
  const isYearlyBalance = activeView === 'yearlyBalance';

  useEffect(() => {
    if (!isEditingDate) return undefined;

    // PrimeReact renders its options in a portal, so the panel is not a child of the ref.
    const handleClickOutside = (event) => {
      const isInside = dateSelectorRef.current?.contains(event.target) || event.target.closest('.p-dropdown-panel');
      if (!isInside) setIsEditingDate(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditingDate]);

  useEffect(() => {
    fetchCategories();
    fetchExpenseItems();
    fetchEarningSources();
  }, [user]);

  // The splash screen clears as soon as the first list resolves, logged in or not.
  const fetchCategories = async () => {
    if (!isLoggedIn) {
      setCategories(expenditureData.expenseCategories);
      return setShowSplash(false);
    }
    try {
      const res = await getCategories();
      if (res?.status && Array.isArray(res.data)) {
        setCategories(res.data.map((item) => ({ ...item, name: item.category, icon: item.icon || 'utensils' })));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
    setShowSplash(false);
  };

  const fetchEarningSources = async () => {
    if (!isLoggedIn) return setEaringSources(expenditureData.earningsSources);
    try {
      const res = await getIncomeSources();
      if (res?.status && Array.isArray(res.data)) {
        setEaringSources(res.data.map((item) => ({ ...item, name: item.sourceName })));
      }
    } catch (error) {
      console.error("Error fetching earnings sources:", error);
    }
  };

  const fetchExpenseItems = async () => {
    if (!isLoggedIn) return setExpenseItems(expenditureData.expenseItems);
    try {
      const res = await getExpenseItems();
      if (res?.status && Array.isArray(res.data)) {
        setExpenseItems(res.data.map((item) => ({ ...item, name: item.category, expenseName: item.expenseName })));
      }
    } catch (error) {
      console.error("Error fetching expense items:", error);
    }
  };

  const refreshData = useCallback(() => setLastUpdate(Date.now()), []);

  const withProcessing = useCallback(async (reload) => {
    setIsProcessing(true);
    await reload();
    setIsProcessing(false);
    refreshData();
  }, [refreshData]);

  const updateIncomeSource = () => withProcessing(fetchEarningSources);
  const updateCategories = () => withProcessing(async () => { await fetchCategories(); await fetchExpenseItems(); });
  const updateExpenseItems = () => withProcessing(fetchExpenseItems);

  const confirmDelete = useDeleteFlow(toast, refreshData);

  const handleDeleteExpense = (expense) => confirmDelete({
    message: `Do you want to delete "${expense.expenseName || expense.name}"?`,
    request: () => deleteExpense(expense.id),
    label: 'Expense',
  });

  const handleDeleteSavings = (saving) => confirmDelete({
    message: `Do you want to delete this saving of ₹${formatAmount(saving.amount)}?`,
    request: () => deleteSaving(saving.id),
    label: 'Savings',
  });

  const handleDeleteIncome = (income) => confirmDelete({
    message: `Do you want to delete "${income.sourceName || income.source || 'this income'}"?`,
    request: () => deleteIncome(income.id),
    label: 'Income',
  });

  // sources / categories / items share one list view; each opens its own form.
  const listViews = {
    sources: { title: 'All Earnings Sources', data: earningsSources, form: [setEditSourceData, setShowSourceForm], delete: [deleteIncomeSource, updateIncomeSource, 'Source'] },
    categories: { title: 'All Expense Categories', data: categories, form: [setEditCategoryData, setShowCategoryForm], delete: [deleteCategory, updateCategories, 'Category'] },
    items: { title: 'All Expense Items', data: expenseItems, form: [setEditItemData, setShowItemForm], delete: [deleteExpenseItem, updateExpenseItems, 'Expense Item'] },
  };
  const listView = listViews[activeView];

  const handleDeleteListItem = (item) => {
    if (!listView) return;
    const [request, reload, label] = listView.delete;
    confirmDialog({
      message: `Do you want to delete "${item.name || item.expenseName || 'this item'}"?`,
      header: 'Delete Confirmation',
      icon: confirmIcon,
      acceptClassName: 'p-button-danger',
      accept: async () => {
        setIsProcessing(true);
        try {
          const res = await request(item.id);
          if (res?.status) {
            await reload();
            toast.current.show({ severity: 'success', summary: 'Success', detail: res.message || `${label} deleted successfully`, life: 3000 });
          } else {
            toast.current.show({ severity: 'warn', summary: 'Warning', detail: res?.message || `Failed to delete ${label}`, life: 3000 });
          }
        } catch (error) {
          console.error(`Error deleting ${label.toLowerCase()}:`, error);
          toast.current.show({ severity: 'warn', summary: 'Warning', detail: error?.message || `Failed to delete ${label}`, life: 3000 });
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  const monthlyViews = [
    { id: 'monthlyExpenses', Component: MonthlyExpensesView, form: [setEditExpenseData, setShowExpenseForm], remove: handleDeleteExpense },
    { id: 'monthlyIncome', Component: MonthlyIncomeView, form: [setEditIncomeData, setShowEarningsForm], remove: handleDeleteIncome },
    { id: 'monthlySavings', Component: MonthlySavingsView, form: [setEditSavingsData, setShowSavingsForm], remove: handleDeleteSavings },
  ];

  const handleLogout = () => confirmDialog({
    message: 'Are you sure you want to logout?',
    header: 'Logout Confirmation',
    icon: confirmIcon,
    acceptClassName: 'p-button-danger',
    accept: logout,
  });

  return (
    <div className="app-container">
      <div className="particles">{particles}</div>
      {showSplash && <SplashScreen />}
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <div className="header-title">
              {user ? (
                <div className="user-profile">
                  <button className="logout-btn" onClick={handleLogout} title="Logout">
                    <LogOut size={16} style={{ transform: 'scaleX(-1)' }} />
                  </button>
                  <div className="user-info-vertical">
                    <div className="avatar"><div className="avatar-circle" /><div className="avatar-circle" /><div className="avatar-circle" /></div>
                    <h1>Hello, <span>{user.name}!</span></h1>
                  </div>
                </div>
              ) : (
                <div className="login-header">
                  <button className="login-btn" onClick={() => setShowLoginForm(true)}>
                    <LogIn size={16} />
                    <span>Login / Register</span>
                  </button>
                  <span className="header-subtitle">Login to track your finances</span>
                </div>
              )}
            </div>
          </div>

          <div className="header-center"><h1 className="logo-text">Expenditure</h1></div>

          <div className="header-right" ref={dateSelectorRef}>
            {isEditingDate ? (
              <div className="dropdown-group">
                <div className="dropdown-item">
                  <Dropdown value={selectedMonth} options={monthOptions} onChange={(e) => { setSelectedMonth(e.value); setIsEditingDate(false); }} placeholder="Month" />
                </div>
                <div className="dropdown-item">
                  <Dropdown value={selectedYear} options={yearOptions} onChange={(e) => { setSelectedYear(e.value); setIsEditingDate(false); }} placeholder="Year" />
                </div>
              </div>
            ) : (
              <div className="date-display-container" onClick={() => setIsEditingDate(true)}>
                <div className="date-display-glass">
                  <Calendar size={15} className="calendar-icon" />
                  <span className="date-month">{getMonthName(month)}</span>
                  <span className="date-year">{year}</span>
                </div>
              </div>
            )}
          </div>
        </header>

        <OverviewCards
          month={month}
          year={year}
          refreshKey={lastUpdate}
          canManage={isLoggedIn}
          showIncomeArrow={isLoggedIn && activeView !== 'monthlyIncome' && !isYearlyBalance}
          showExpensesArrow={isLoggedIn && activeView !== 'monthlyExpenses' && !isYearlyBalance}
          showSavingsArrow={isLoggedIn && activeView !== 'monthlySavings' && !isYearlyBalance}
          showYearlyArrow={isLoggedIn && !isYearlyBalance}
          onAddEarnings={() => setShowEarningsForm(true)}
          onAddExpense={() => setShowExpenseForm(true)}
          onAddSavings={() => setShowSavingsForm(true)}
          onOpenIncome={() => setActiveView('monthlyIncome')}
          onOpenExpenses={() => setActiveView('monthlyExpenses')}
          onOpenSavings={() => setActiveView('monthlySavings')}
          onOpenYearly={() => setActiveView('yearlyBalance')}
        />

        {isYearlyBalance && (
          <YearlyBalanceView refreshKey={lastUpdate} enabled={isLoggedIn} onClose={() => setActiveView(null)} />
        )}

        {!isYearlyBalance && (
          <div className="main-container" style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: '1' }}>
              <InfoCard title={`${getMonthName(month)} Expenses`} height="350px">
                <DonutChart month={month} year={year} enabled={isLoggedIn} refreshKey={lastUpdate} />
              </InfoCard>
            </div>

            <div style={{ flex: '3' }}>
              {!activeView && (
                <div className="info-cards-slider" style={{ display: 'flex', gap: '20px' }}>
                  <InfoCard title="Earnings Sources" height="350px" onViewAllClick={() => setActiveView('sources')} onAddClick={isLoggedIn ? () => setShowSourceForm(true) : null}>
                    {earningsSources.map((source) => <InfoItem key={source.id} {...source} hasArrow />)}
                  </InfoCard>

                  <InfoCard title="Expense Categories" height="350px" onViewAllClick={() => setActiveView('categories')} onAddClick={isLoggedIn ? () => setShowCategoryForm(true) : null}>
                    {categories.map((category) => <InfoItem key={category.id} {...category} hasArrow />)}
                  </InfoCard>

                  <InfoCard title="Expense ITEMS" height="350px" onViewAllClick={() => setActiveView('items')} onAddClick={isLoggedIn ? () => setShowItemForm(true) : null}>
                    {expenseItems.map((item) => <InfoItem key={item.id} {...item} hasArrow />)}
                  </InfoCard>
                </div>
              )}

              {listView && (
                <DetailsView
                  title={listView.title}
                  data={listView.data}
                  onClose={() => setActiveView(null)}
                  onEdit={isLoggedIn ? (item) => { listView.form[0](item); listView.form[1](true); } : undefined}
                  onDelete={isLoggedIn ? handleDeleteListItem : undefined}
                  isLoading={isProcessing}
                />
              )}

              {monthlyViews.map(({ id, Component, form, remove }) => activeView === id && (
                <Component
                  key={id}
                  month={month}
                  year={year}
                  refreshKey={lastUpdate}
                  enabled={isLoggedIn}
                  onClose={() => setActiveView(null)}
                  onEdit={isLoggedIn ? (item) => { form[0](item); form[1](true); } : undefined}
                  onDelete={isLoggedIn ? remove : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {showEarningsForm && <EarningsForm onClose={() => { setShowEarningsForm(false); setEditIncomeData(null); }} updateEarnings={refreshData} editData={editIncomeData} />}
        {showExpenseForm && <ExpenseForm onClose={() => { setShowExpenseForm(false); setEditExpenseData(null); }} updateExpense={refreshData} editData={editExpenseData} />}
        {showSavingsForm && <SavingsForm onClose={() => { setShowSavingsForm(false); setEditSavingsData(null); }} updateSavings={refreshData} editData={editSavingsData} />}
        {showSourceForm && <AddSourceForm onClose={() => { setShowSourceForm(false); setEditSourceData(null); }} updateIncomeSources={updateIncomeSource} editData={editSourceData} />}
        {showCategoryForm && <AddCategoryForm onClose={() => { setShowCategoryForm(false); setEditCategoryData(null); }} updateCategories={updateCategories} editData={editCategoryData} />}
        {showItemForm && <AddItemForm onClose={() => { setShowItemForm(false); setEditItemData(null); }} updateExpenseItems={updateExpenseItems} editData={editItemData} />}
      </div>

      {showLoginForm && <LoginForm onClose={() => setShowLoginForm(false)} showToast={(msg) => toast.current.show(msg)} />}
    </div>
  );
}

export default App;
