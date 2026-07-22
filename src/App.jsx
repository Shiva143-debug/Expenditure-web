import React, { useState, useEffect, useRef } from 'react';
import { PiggyBank, LogIn, LogOut, AlertTriangle, Calendar } from 'lucide-react';
import OverviewCard from './components/OverviewCard';
import InfoCard, { InfoItem } from './components/InfoCard';
import DonutChart from './components/DonutChart';
import BarChart from './components/BarChart';
import expenditureData from './data/expenditureData.json';
import './App.css';
import DetailsView from './components/DetailsView';
import MonthlyExpensesView from './components/MonthlyExpensesView';
import "primereact/resources/themes/lara-dark-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import EarningsForm from './components/EarningsForm';
import ExpenseForm from './components/ExpenseForm';
import SavingsForm from './components/SavingsForm';
import AddSourceForm from "./components/AddSourceForm";
import AddCategoryForm from "./components/AddCategoryForm";
import AddItemForm from "./components/AddItemForm";
import SplashScreen from './components/SplashScreen';
import LoginForm from './components/LoginForm';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { useAuth } from './context/AuthContext';
import { getCategories, getExpenseItems, getExpensesData, getFilteredExpenses, getIncomeByMonthYear, getIncomeSources, getSavingsData, getSavingsDataByMonthYear, getTotalIncomeData, deleteExpense, deleteCategory, deleteExpenseItem, deleteIncomeSource } from './apiService';
import YearlyDetails from './components/YearlyDetails';



// Month Options
const months = [
  { label: "January", value: "1" },
  { label: "February", value: "2" },
  { label: "March", value: "3" },
  { label: "April", value: "4" },
  { label: "May", value: "5" },
  { label: "June", value: "6" },
  { label: "July", value: "7" },
  { label: "August", value: "8" },
  { label: "September", value: "9" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" }
];

// Year Options
const years = [
  { label: "2024", value: "2024" },
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
  { label: "2027", value: "2027" },
  { label: "2028", value: "2028" }
];

function App() {
  const { user, logout } = useAuth();
  const toast = useRef(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [view, setView] = useState('Monthly');
  const [categories, setCategories] = useState(expenditureData.expenseCategories);
  const [expenseItems, setExpenseItems] = useState(expenditureData.expenseItems);
  const [earningsSources, setEaringSources] = useState(expenditureData.earningsSources);
  const [expensesForChart, setExpensesForChart] = useState([])

  const [savingsByMonth, setSavingsByMonth] = useState(0)
  const [earningsByMonth, setEarningsByMonth] = useState(0)
  const [expensesByMonth, setExpensesByMonth] = useState(0)
  const [monthlyExpensesList, setMonthlyExpensesList] = useState([])

  const [savingsByYear, setSavingsByYear] = useState(0)
  const [expensesByYear, setExpensesByYear] = useState(0)
  const [earningsByYear, setEarningsByYear] = useState(0)

  const [activeView, setActiveView] = useState(null);

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

  const [showYearWiseData, setShowYearWiseData] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  // const currentDate = new Date();

  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [isEditingDate, setIsEditingDate] = useState(false);
  const dateSelectorRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the date selector and not on a PrimeReact dropdown panel
      if (dateSelectorRef.current && 
          !dateSelectorRef.current.contains(event.target) && 
          !event.target.closest('.p-dropdown-panel')) {
        setIsEditingDate(false);
      }
    };

    if (isEditingDate) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditingDate]);

  // useEffect(() => {
  //   // Hide splash screen after 3 seconds
  //   const timer = setTimeout(() => {
  //     setShowSplash(false);
  //   }, 3000);

  //   return () => clearTimeout(timer);
  // }, []);

  useEffect(() => {

    fetchCategories();
    fetchExpenseItems();
    fetchEarningSources();

  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        await Promise.all([
          fetchSavingsByMonthAndYear(),
          fetchEarningsByMonthAndYear(),
          fetchExpensesByMonthAndYear(),
          fetchSavingsByYear(),
          fetchExpensesByYear(),
          fetchEarningsByYear(),
          fetchExpensesForChart()
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear, user])

  const fetchCategories = async () => {
    if (user) {
      try {
        const data = await getCategories();
        if (data && Array.isArray(data)) {
          const mappedCategories = data.map(item => ({
            ...item,
            name: item.category,
            icon: item.icon || 'utensils' // default icon if none provided
          }));
          setCategories(mappedCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    } else {
      setCategories(expenditureData.expenseCategories);
    }
    setShowSplash(false);
  };


  const fetchEarningSources = async () => {
    if (user) {
      try {
        const data = await getIncomeSources();
        if (data && Array.isArray(data)) {
          const mappedEarningSources = data.map(item => ({
            ...item,
            name: item.sourceName,
          }));
          setEaringSources(mappedEarningSources);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    } else {
      setEaringSources(expenditureData.earningsSources);
    }
  };


  const fetchExpenseItems = async () => {
    if (user) {
      try {
        const data = await getExpenseItems();
        if (data && Array.isArray(data)) {
          const mappedExpenseItems = data.map(item => ({
            ...item,
            name: item.category,
            expenseName: item.expenseName
            // icon: item.icon || 'utensils' // default icon if none provided
          }));
          setExpenseItems(mappedExpenseItems);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    } else {
      setExpenseItems(expenditureData.expenseItems);
    }
  };

  const fetchSavingsByMonthAndYear = async () => {
    if (user) {
      try {
        const data = await getSavingsDataByMonthYear(parseInt(selectedMonth), parseInt(selectedYear));
        if (data && Array.isArray(data)) {
          const totalSavings = data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
          setSavingsByMonth(totalSavings);
        } else {
          setSavingsByMonth(0);
        }
      } catch (error) {
        console.error("Error fetching savings:", error);
      }
    } else {
      setSavingsByMonth(0);
    }
  };

  const fetchEarningsByMonthAndYear = async () => {
    if (user) {
      try {
        const data = await getIncomeByMonthYear(parseInt(selectedMonth), parseInt(selectedYear));
        if (data && Array.isArray(data)) {
          const totalEarnings = data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
          setEarningsByMonth(totalEarnings);
        } else {
          setEarningsByMonth(0);
        }
      } catch (error) {
        console.error("Error fetching earnings:", error);
      }
    } else {
      setEarningsByMonth(0);
    }
  };

  const fetchExpensesByMonthAndYear = async () => {
    if (user) {
      try {
        const data = await getFilteredExpenses(parseInt(selectedMonth), parseInt(selectedYear));
        if (data && Array.isArray(data)) {
          const totalExpenses = data.reduce((sum, item) => sum + parseFloat(item.cost || 0), 0);
          setExpensesByMonth(totalExpenses);
          setMonthlyExpensesList(data);
        } else {
          setExpensesByMonth(0);
          setMonthlyExpensesList([]);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    } else {
      setExpensesByMonth(0);
      setMonthlyExpensesList([]);
    }
  };

  const fetchSavingsByYear = async () => {
    if (user) {
      try {
        const data = await getSavingsData();
        if (data && Array.isArray(data)) {
          const totalSavings = data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
          setSavingsByYear(totalSavings);
        } else {
          setSavingsByYear(0);
        }
      } catch (error) {
        console.error("Error fetching savings:", error);
      }
    } else {
      setSavingsByYear(0);
    }
  };

  const fetchExpensesByYear = async () => {
    if (user) {
      try {
        const data = await getExpensesData();
        if (data && Array.isArray(data)) {
          const totalExpenses = data.reduce((sum, item) => sum + parseFloat(item.cost || 0), 0);
          setExpensesByYear(totalExpenses);
        } else {
          setExpensesByYear(0);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    } else {
      setExpensesByYear(0);
    }
  };

  const fetchEarningsByYear = async () => {
    if (user) {
      try {
        const data = await getTotalIncomeData();
        if (data && Array.isArray(data)) {
          const totalEarnings = data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
          setEarningsByYear(totalEarnings);
        } else {
          setEarningsByYear(0);
        }
      } catch (error) {
        console.error("Error fetching earnings:", error);
      }
    } else {
      setEarningsByYear(0);
    }
  };


  //   const fetchExpensesForChart = async () => {
  //   if (user && user.id) {
  //     try {
  //        const data = await getFilteredExpenses(parseInt(selectedMonth), parseInt(selectedYear));
  //       if (data && Array.isArray(data)) {
  //         const mappedExpenses = data.map(item => ({
  //           ...item
  //         }));
  //         setExpensesForChart(mappedExpenses);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching categories:", error);
  //     }
  //   }

  // };

  const fetchExpensesForChart = async () => {
    if (user) {
      try {
        const data = await getFilteredExpenses(
          parseInt(selectedMonth),
          parseInt(selectedYear)
        );

        if (data && Array.isArray(data)) {

          // ✅ Step 1: Group by category
          const categoryTotals = {};

          data.forEach(item => {
            const category = item.category || "Others";
            const cost = Number(item.cost);

            if (!isNaN(cost)) {
              categoryTotals[category] =
                (categoryTotals[category] || 0) + cost;
            }
          });

          // ✅ Step 2: Total amount
          const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

          // ❌ If no data
          if (total === 0) {
            setExpensesForChart([]);
            return;
          }

          // ✅ Step 3: Convert to percentage
          const chartData = Object.keys(categoryTotals).map(category => ({
            name: category,
            value: categoryTotals[category],
            percentage: (categoryTotals[category] / total) * 100
          }));

          console.log("Chart Data:", chartData); // 🔍 debug

          setExpensesForChart(chartData); // ✅ FINAL DATA

        } else {
          setExpensesForChart([]);
        }

      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    } else {
      setExpensesForChart([]);
    }
  };
  const createParticles = () => {
    return Array.from({ length: 30 }, (_, i) => (
      <div
        key={i}
        className="particle"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 15}s`,
          animationDuration: `${15 + Math.random() * 10}s`
        }}
      />
    ));
  };


  const updateExpenses = async () => {
    try {
      setIsLoadingData(true);
      setIsProcessing(true);
      await Promise.all([
        fetchExpensesByMonthAndYear(),
        fetchExpensesByYear(),
        fetchExpensesForChart()
      ]);
      setLastUpdate(Date.now());
    } catch (error) {
      console.error("Error updating expenses:", error);
    } finally {
      setIsLoadingData(false);
      setIsProcessing(false);
    }
  }

  const updateSavings = async () => {
    try {
      setIsLoadingData(true);
      setIsProcessing(true);
      await Promise.all([
        fetchSavingsByMonthAndYear(),
        fetchSavingsByYear()
      ]);
      setLastUpdate(Date.now());
    } catch (error) {
      console.error("Error updating savings:", error);
    } finally {
      setIsLoadingData(false);
      setIsProcessing(false);
    }
  }

  const updateEarnings = async () => {
    try {
      setIsLoadingData(true);
      setIsProcessing(true);
      await Promise.all([
        fetchEarningsByMonthAndYear(),
        fetchEarningsByYear()
      ]);
      setLastUpdate(Date.now());
    } catch (error) {
      console.error("Error updating earnings:", error);
    } finally {
      setIsLoadingData(false);
      setIsProcessing(false);
    }
  }

  const updateIncomeSource = async () => {
    setIsProcessing(true);
    await fetchEarningSources();
    setIsProcessing(false);
  }

  const updateCategories = async () => {
    setIsProcessing(true);
    await fetchCategories();
    setIsProcessing(false);
  }

  const updateExpenseItems = async () => {
    setIsProcessing(true);
    await fetchExpenseItems();
    setIsProcessing(false);
  }

  const handleDeleteExpense = (expense) => {
    confirmDialog({
      message: `Do you want to delete "${expense.expenseName}"?`,
      header: 'Delete Confirmation',
      icon: <AlertTriangle size={32} className="p-confirm-dialog-icon" />,
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          setIsProcessing(true);
          await deleteExpense(expense.id);
          await updateExpenses();
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Expense deleted successfully', life: 3000 });
        } catch (error) {
          console.error("Error deleting expense:", error);
          toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete expense', life: 3000 });
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  const handleDeleteGeneralItem = (item) => {
    let message = `Do you want to delete "${item.name || item.expenseName || 'this item'}"?`;
    let deleteFunc = null;
    let refreshFunc = null;
    let itemLabel = "item";

    if (activeView === "sources") {
      deleteFunc = deleteIncomeSource;
      refreshFunc = updateIncomeSource;
      itemLabel = "Source";
    } else if (activeView === "categories") {
      deleteFunc = deleteCategory;
      refreshFunc = updateCategories;
      itemLabel = "Category";
    } else if (activeView === "items") {
      deleteFunc = deleteExpenseItem;
      refreshFunc = updateExpenseItems;
      itemLabel = "Expense Item";
    }

    if (deleteFunc) {
      confirmDialog({
        message: message,
        header: 'Delete Confirmation',
        icon: <AlertTriangle size={32} className="p-confirm-dialog-icon" />,
        acceptClassName: 'p-button-danger',
        accept: async () => {
          try {
            setIsProcessing(true);
            await deleteFunc(item.id);
            await refreshFunc();
            toast.current.show({ severity: 'success', summary: 'Success', detail: `${itemLabel} deleted successfully`, life: 3000 });
          } catch (error) {
            console.error(`Error deleting from ${activeView}:`, error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: `Failed to delete ${itemLabel}`, life: 3000 });
          } finally {
            setIsProcessing(false);
          }
        }
      });
    }
  };

  // if (showSplash) {
  //   return <SplashScreen />;
  // }

  const handleLogout = () => {
    confirmDialog({
      message: 'Are you sure you want to logout?',
      header: 'Logout Confirmation',
      icon: <AlertTriangle size={32} className="p-confirm-dialog-icon" />,
      acceptClassName: 'p-button-danger',
      accept: () => {
        logout();
      }
    });
  };

  const onYearWiseDetails = () => {
    setShowYearWiseData(true)
  }



  const getMonthName = (month) => {
    return new Date(0, month - 1).toLocaleString('en-US', { month: 'long' });
  };

  return (

    <div className="app-container">
      <div className="particles">{createParticles()}</div>
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
                    <LogOut size={18} style={{ transform: 'scaleX(-1)' }} />
                  </button>
                  <div className="user-info-vertical">
                    <div className="avatar">
                      <div className="avatar-circle"></div>
                      <div className="avatar-circle"></div>
                      <div className="avatar-circle"></div>
                    </div>
                    <h1>Hello, <span>{user.name}!</span></h1>
                    {/* <span className="header-subtitle">Your Financial Overview</span> */}
                  </div>
                </div>
              ) : (
                <div className="login-header">
                  <button className="login-btn" onClick={() => setShowLoginForm(true)}>
                    <LogIn size={20} />
                    <span>Login / Register</span>
                  </button>
                  <span className="header-subtitle">Login to track your finances</span>
                </div>
              )}
            </div>
          </div>

          <div className="header-center">
            <h1 className="logo-text">Expenditure</h1>
          </div>

          <div className="header-right" ref={dateSelectorRef}>
            {isEditingDate ? (
              <div className="dropdown-group">
                <div className="dropdown-item">
                  <Dropdown
                    value={selectedMonth}
                    options={months}
                    onChange={(e) => {
                      setSelectedMonth(e.value);
                      setIsEditingDate(false);
                    }}
                    placeholder="Month"
                  />
                </div>
                <div className="dropdown-item">
                  <Dropdown
                    value={selectedYear}
                    options={years}
                    onChange={(e) => {
                      setSelectedYear(e.value);
                      setIsEditingDate(false);
                    }}
                    placeholder="Year"
                  />
                </div>
              </div>
            ) : (
              <div className="date-display-container" onClick={() => setIsEditingDate(true)}>
                <div className="date-display-glass">
                  <Calendar size={18} className="calendar-icon" />
                  <span className="date-month">{getMonthName(selectedMonth)}</span>
                  <span className="date-year">{selectedYear}</span>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="overview-cards">
          <OverviewCard
            type="earnings"
            amount={earningsByMonth}
            label="Monthly Earnings"
            onAddClick={user ? () => setShowEarningsForm(true) : null}
            isLoading={isLoadingData}
            loadingText="Loading Earnings..."
          />
          <OverviewCard
            type="expenses"
            amount={expensesByMonth}
            label="Monthly Expenses"
            onAddClick={user ? () => setShowExpenseForm(true) : null}
            onArrowClick={() => setActiveView("monthlyExpenses")}
            hideArrow={!user || activeView === "monthlyExpenses" || showYearWiseData}
            isLoading={isLoadingData}
            loadingText="Loading Expenses..."
          />
          <OverviewCard
            type="savings"
            amount={savingsByMonth}
            label="Monthly Savings"
            onAddClick={user ? () => setShowSavingsForm(true) : null}
            isLoading={isLoadingData}
            loadingText="Loading Savings..."
          />
          <OverviewCard
            type="yearly"
            amount={earningsByYear}
            label="Yearly Overview"

            expenseAmount={expensesByYear}
            expenseLabel="Expenses"

            secondaryAmount={savingsByYear}
            secondaryLabel="Savings"
            onShowYearWiseData={onYearWiseDetails}
            hideArrow={!user || showYearWiseData}
            isLoading={isLoadingData}
            loadingText="Loading Yearly Overview..."
          />
        </div>

        {showYearWiseData &&
          <YearlyDetails 
            Year={selectedYear} 
            onClose={() => setShowYearWiseData(false)} 
            updateEarnings={updateEarnings}
            updateSavings={updateSavings}
            updateExpenses={updateExpenses}
            lastUpdate={lastUpdate}
          />
        }


        {!showYearWiseData &&
          <div className="main-container" style={{ display: 'flex', gap: '20px' }}>

            {/* LEFT SIDE (UNCHANGED) */}
            <div style={{ flex: '1' }}>
              <InfoCard title={`${getMonthName(selectedMonth)} Expenses`} height="350px">
                <DonutChart data={expensesForChart} />
              </InfoCard>
            </div>

            {/* RIGHT SIDE */}
            <div style={{ flex: '3' }}>

              {!activeView && (
                <div className="info-cards-slider" style={{ display: 'flex', gap: '20px' }}>

                  <InfoCard
                    title="Earnings Sources"
                    height="350px"
                    onViewAllClick={() => setActiveView("sources")}
                    onAddClick={user ? () => setShowSourceForm(true) : null}
                  >
                    {earningsSources.map(source => (
                      <InfoItem key={source.id} {...source} hasArrow />
                    ))}
                  </InfoCard>

                  {/* Expense Categories */}
                  <InfoCard
                    title="Expense Categories"
                    height="350px"
                    onViewAllClick={() => setActiveView("categories")}
                    onAddClick={user ? () => setShowCategoryForm(true) : null}
                  >
                    {categories.map(category => (
                      <InfoItem key={category.id} {...category} hasArrow />
                    ))}
                  </InfoCard>

                  {/* Expense Items */}
                  <InfoCard
                    title="Expense ITEMS"
                    height="350px"
                    onViewAllClick={() => setActiveView("items")}
                    onAddClick={user ? () => setShowItemForm(true) : null}
                  >
                    {expenseItems.map(e => (
                      <InfoItem key={e.id} {...e} hasArrow />
                    ))}
                  </InfoCard>

                </div>
              )}


              {/* ✅ DETAILS VIEW REPLACES RIGHT SIDE */}
              {activeView && activeView !== "monthlyExpenses" && (
                <DetailsView
                  title={
                    activeView === "categories"
                      ? "All Expense Categories"
                      : activeView === "items"
                        ? "All Expense Items"
                        : "All Earnings Sources"
                  }
                  data={
                    activeView === "categories"
                      ? categories
                      : activeView === "items"
                        ? expenseItems
                        : earningsSources
                  }
                  onClose={() => setActiveView(null)}
                  onEdit={user ? (item) => {
                    if (activeView === "sources") {
                      setEditSourceData(item);
                      setShowSourceForm(true);
                    } else if (activeView === "categories") {
                      setEditCategoryData(item);
                      setShowCategoryForm(true);
                    } else if (activeView === "items") {
                      setEditItemData(item);
                      setShowItemForm(true);
                    }
                  } : undefined}
                  onDelete={user ? handleDeleteGeneralItem : undefined}
                  isLoading={isProcessing}
                />
              )}

              {activeView === "monthlyExpenses" && (
                <MonthlyExpensesView
                  title={`Expenses for ${getMonthName(selectedMonth)} ${selectedYear}`}
                  data={monthlyExpensesList}
                  onClose={() => setActiveView(null)}
                  onEdit={user ? (item) => {
                    setEditExpenseData(item);
                    setShowExpenseForm(true);
                  } : undefined}
                  onDelete={user ? handleDeleteExpense : undefined}
                  isLoading={isProcessing}
                />
              )}

            </div>
          </div>
        }

        {showEarningsForm && (<EarningsForm onClose={() => setShowEarningsForm(false)} updateEarnings={updateEarnings} />)}
        {showExpenseForm && (<ExpenseForm onClose={() => { setShowExpenseForm(false); setEditExpenseData(null); }} updateExpense={updateExpenses} editData={editExpenseData} />)}
        {showSavingsForm && (<SavingsForm onClose={() => setShowSavingsForm(false)} updateSavings={updateSavings} />)}
        {showSourceForm && <AddSourceForm onClose={() => { setShowSourceForm(false); setEditSourceData(null); }} updateIncomeSources={updateIncomeSource} editData={editSourceData} />}
        {showCategoryForm && <AddCategoryForm onClose={() => { setShowCategoryForm(false); setEditCategoryData(null); }} updateCategories={updateCategories} editData={editCategoryData} />}
        {showItemForm && <AddItemForm onClose={() => { setShowItemForm(false); setEditItemData(null); }} updateExpenseItems={updateExpenseItems} editData={editItemData} />}


      </div>
      {showLoginForm && <LoginForm onClose={() => setShowLoginForm(false)} />}
    </div>
  );
}

export default App;
