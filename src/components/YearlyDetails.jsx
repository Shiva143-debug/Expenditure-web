import React, { useEffect, useState } from "react";
import { getSavingsData, getExpensesData, getTotalIncomeData, deleteIncome, deleteSaving } from "../apiService"
import { X, ArrowLeft, Edit2, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { confirmDialog } from 'primereact/confirmdialog';
import './YearlyDetails.css';
import EarningsForm from "./EarningsForm";
import SavingsForm from "./SavingsForm";

const Loader = () => (
    <div className="card-loader">
        <Loader2 className="animate-spin" size={24} />
        <span>Loading details...</span>
    </div>
);

const YearlyDetails = ({ Year, onClose, updateEarnings, updateSavings, updateExpenses, lastUpdate }) => {
    const [savings, setSavings] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [income, setIncome] = useState([]);

    const [loadingSavings, setLoadingSavings] = useState(true);
    const [loadingExpenses, setLoadingExpenses] = useState(true);
    const [loadingIncome, setLoadingIncome] = useState(true);

    const [showEarningsForm, setShowEarningsForm] = useState(false);
    const [showSavingsForm, setShowSavingsForm] = useState(false);
    const [editData, setEditData] = useState(null);

    useEffect(() => {
        setLoadingSavings(true);
        setLoadingExpenses(true);
        setLoadingIncome(true);
        fetchSavingsByYear();
        fetchExpensesByYear();
        fetchEarningsByYear();
    }, [Year, lastUpdate]);


    const fetchSavingsByYear = async () => {

        try {
            const data = await getSavingsData();
            if (data && Array.isArray(data)) {
                const filteredSavings = data.filter(item => {
                    const itemYear = new Date(item.date).getFullYear();
                    return itemYear == Year;
                }).sort((a, b) => new Date(b.date) - new Date(a.date));
                setSavings(filteredSavings);
            }
            else {
                setSavings([]);
            }
        } catch (error) {
            console.error("Error fetching savings:", error);
            setSavings([]);
        } finally {
            setLoadingSavings(false);
        }

    };

    const fetchExpensesByYear = async () => {
        try {
            const data = await getExpensesData();
            if (data && Array.isArray(data)) {
                const filteredExpenses = data.filter(item => {
                    const itemYear = new Date(item.pDate).getFullYear();
                    return itemYear == Year;
                }).sort((a, b) => new Date(b.pDate) - new Date(a.pDate));
                setExpenses(filteredExpenses);
            }
            else {
                setExpenses([]);
            }
        } catch (error) {
            console.error("Error fetching expenses:", error);
            setExpenses([]);
        } finally {
            setLoadingExpenses(false);
        }

    };

    const fetchEarningsByYear = async () => {

        try {
            const data = await getTotalIncomeData();
            if (data && Array.isArray(data)) {
                const filteredEarnings = data.filter(item => {
                    const itemYear = new Date(item.date).getFullYear();
                    return itemYear == Year;
                }).sort((a, b) => new Date(b.date) - new Date(a.date));
                setIncome(filteredEarnings);
            }
            else {
                setIncome([]);
            }
        } catch (error) {
            console.error("Error fetching earnings:", error);
            setIncome([]);
        } finally {
            setLoadingIncome(false);
        }

    };

    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();

        return `${day}-${month}-${year}`;
    };

    const handleDeleteIncome = (id) => {
        confirmDialog({
            message: 'Do you want to delete this Earning?',
            header: 'Delete Confirmation',
            icon: <AlertTriangle size={32} className="p-confirm-dialog-icon" />,
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    await deleteIncome(id);
                    fetchEarningsByYear();
                    if (updateEarnings) updateEarnings();
                } catch (error) {
                    console.error("Error deleting income:", error);
                }
            }
        });
    };

    const handleDeleteSaving = (id) => {
        confirmDialog({
            message: 'Do you want to delete this saving?',
            header: 'Delete Confirmation',
            icon: <AlertTriangle size={32} className="p-confirm-dialog-icon" />,
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    await deleteSaving(id);
                    fetchSavingsByYear();
                    if (updateSavings) updateSavings();
                } catch (error) {
                    console.error("Error deleting saving:", error);
                }
            }
        });
    };

    const onEditIncome = (item) => {
        setEditData(item);
        setShowEarningsForm(true);
    };

    const onEditSaving = (item) => {
        setEditData(item);
        setShowSavingsForm(true);
    };

    return (
        <div className="yearly-details-wrapper">
            <div className="yearly-details-header">
                <button className="back-btn" onClick={onClose} title="Back to Overview">
                    <ArrowLeft size={20} />
                    <span>Back to Overview</span>
                </button>
                <h2>Yearly Breakdown - {Year}</h2>
            </div>
            
            <div className="yearly-container">

                <div className="data-card income-card">
                    <div className="card-header">
                        <h3>Earnings</h3>
                        <span className="count">{income.length} Entries</span>
                    </div>
                    <div className="scroll-content">
                        {loadingIncome ? (
                            <Loader />
                        ) : income.length > 0 ? (
                            income.map((item) => (
                                <div key={item.id} className="detail-item">
                                    <div className="item-main">
                                        <span className="amount">₹{item.amount.toLocaleString('en-IN')}</span>
                                        <span className="note">{item.source}</span>
                                    </div>
                                    <div className="item-main">
                                        <span className="date">{formatDate(item.date)}</span>
                                        <div className="item-actions">
                                            <button className="edit-btn" onClick={() => onEditIncome(item)} title="Edit Earnings">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="delete-btn" onClick={() => handleDeleteIncome(item.id)} title="Delete Earnings">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">No income recorded for {Year}</div>
                        )}
                    </div>
                </div>

                <div className="data-card expenses-card">
                    <div className="card-header">
                        <h3>Expenses</h3>
                        <span className="count">{expenses.length} Entries</span>
                    </div>
                    <div className="scroll-content">
                        {loadingExpenses ? (
                            <Loader />
                        ) : expenses.length > 0 ? (
                            expenses.map((item) => (
                                <div key={item.id} className="detail-item">
                                    <div className="item-main">
                                        <span className="amount">₹{item.cost.toLocaleString('en-IN')}</span>
                                        <span className="note">{item.expenseName}</span>
                                    </div>
                                    <div className="item-main">
                                        <span className="date">{formatDate(item.pDate)}</span>
                                        <span className="note">{item.category}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">No expenses recorded for {Year}</div>
                        )}
                    </div>
                </div>
                <div className="data-card savings-card">
                    <div className="card-header">
                        <h3>Savings</h3>
                        <span className="count">{savings.length} Entries</span>
                    </div>
                    <div className="scroll-content">
                        {loadingSavings ? (
                            <Loader />
                        ) : savings.length > 0 ? (
                            savings.map((item) => (
                                <div key={item.id} className="detail-item">
                                    <div className="item-main">
                                        <span className="amount">₹{item.amount.toLocaleString('en-IN')}</span>
                                        <span className="note">{item.note || "No Note"}</span>
                                    </div>
                                    <div className="item-main">
                                        <span className="date">{formatDate(item.date)}</span>
                                        <div className="item-actions">
                                            <button className="edit-btn" onClick={() => onEditSaving(item)} title="Edit Savings">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="delete-btn" onClick={() => handleDeleteSaving(item.id)} title="Delete Savings">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">No savings recorded for {Year}</div>
                        )}
                    </div>
                </div>

            </div>

            {showEarningsForm && (
                <EarningsForm 
                    onClose={() => { setShowEarningsForm(false); setEditData(null); }} 
                    updateEarnings={async () => {
                        await fetchEarningsByYear();
                        if (updateEarnings) updateEarnings();
                    }} 
                    editData={editData} 
                />
            )}
            
            {showSavingsForm && (
                <SavingsForm 
                    onClose={() => { setShowSavingsForm(false); setEditData(null); }} 
                    updateSavings={async () => {
                        await fetchSavingsByYear();
                        if (updateSavings) updateSavings();
                    }} 
                    editData={editData} 
                />
            )}
        </div>
    );
};

export default YearlyDetails;
