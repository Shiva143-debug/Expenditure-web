import React, { useEffect, useRef, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputSwitch } from "primereact/inputswitch";
import "./EarningsForm.css";
import { addExpense, getCategories, getExpenseItemsByCategory, updateExpense as updateExpenseApi } from "../apiService";
import { Toast } from "primereact/toast";

const ExpenseForm = ({ onClose, updateExpense, editData }) => {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([])
  const [expenseItems, setExpenseItems] = useState([])
  const [formData, setFormData] = useState({
    categoryId: null, expenseItemId: null, cost: "", date: null, description: "",
    isTax: false, percentage: 0, taxAmount: 0, image: null
  });

  useEffect(() => {
    fetchCategories();
    if (editData) {
      setFormData({
        categoryId: editData.categoryId, expenseItemId: editData.expenseItemId, cost: editData.cost,
        date: new Date(editData.pDate), description: editData.description || "", isTax: editData.isTaxApp || false,
        percentage: editData.percentage || 0, taxAmount: editData.taxAmount || 0, image: editData.image || null
      });
    }
  }, [editData])

  useEffect(() => {
    if (formData.categoryId) {
      fetchExpenseItemsByCategory(formData.categoryId);
    }
  }, [formData.categoryId])

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      if (res?.status && Array.isArray(res.data)) {
        const mappedCategories = res.data.map(item => ({ ...item, label: item.category, value: item.id }));
        setCategories(mappedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchExpenseItemsByCategory = async (categoryId) => {
    try {
      const res = await getExpenseItemsByCategory(categoryId);
      if (res?.status && Array.isArray(res.data)) {
        const mappedExpenseItems = res.data.map(item => ({ ...item, label: item.expenseName, value: item.id }));
        setExpenseItems(mappedExpenseItems);
      }
    } catch (error) {
      console.error("Error fetching expense items:", error);
    }
  }

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleChange = (field, value) => {
    let updated = { ...formData, [field]: value };

    if (field === "cost" || field === "percentage") {
      const cost = field === "cost" ? value : formData.cost;
      const percentage = field === "percentage" ? value : formData.percentage;

      if (cost && percentage) {
        updated.taxAmount = (cost * percentage) / 100;
      }
    }
    if (field === "isTax" && !value) {
      updated.percentage = 0;
      updated.taxAmount = 0;
    }

    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryId) {
      toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Please Select Category', life: 3000 });
      return;
    }
    if (!formData.expenseItemId) {
      toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Please Select expense name', life: 3000 });
      return;
    }
    if (!formData.cost) {
      toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Please Enter Amount', life: 3000 });
      return;
    }
    if (!formData.date) {
      toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Please Select Date', life: 3000 });
      return;
    }

    setLoading(true);
    const date = new Date(formData.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    let base64Image = formData.image;
    if (formData.image instanceof File) {
      try {
        base64Image = await convertToBase64(formData.image);
      } catch (error) {
        console.error("Error converting image to base64:", error);
      }
    }

    const payload = {
      categoryId: formData.categoryId, expenseItemId: formData.expenseItemId, cost: parseInt(formData.cost),
      pDate: formattedDate, description: formData.description, isTaxApp: formData.isTax,
      percentage: parseInt(formData.percentage), taxAmount: formData.taxAmount, image: base64Image
    };

    try {
      let response;
      if (editData) {
        response = await updateExpenseApi(editData.id, payload);
        if (response?.status) {
          toast.current.show({ severity: 'success', summary: 'Success', detail: response.message || 'Expense updated successfully', life: 3000 });
        } else if (response) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: response?.message || `Failed to update Expense`, life: 3000 });
        }
      } else {
        response = await addExpense(payload);
        if (response?.status) {
          toast.current.show({ severity: 'success', summary: 'Success', detail: response.message || 'Expense added successfully', life: 3000 });
        } else if (response) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: response?.message || `Failed to add Expense`, life: 3000 });
        }
      }

      if (response?.status) {
        setTimeout(() => onClose(), 1500);
      }
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: `Failed to ${editData ? 'update' : 'add'} Expense`, life: 3000 });
      console.error(`Error ${editData ? 'updating' : 'adding'} expense:`, error);
    } finally {
      setLoading(false);
    }
    await updateExpense()
  };

  return (
    <div className="modal-overlay">
      <Toast ref={toast} position="top-right" />
      <div className="earnings-modal">
        <div className="modal-header">
          <h2>{editData ? 'Update Expense' : 'Add Expense'}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          <div className="form-group">
            <label>Category<span style={{ color: '#ff4d4f' }}>*</span></label>
            <Dropdown
              value={formData.categoryId}
              options={categories}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => setFormData({ ...formData, categoryId: e.value })}
              placeholder="Select Category"
              className="w-full"
            />
          </div>

          {formData.categoryId !== null &&
            <div className="form-group">
              <label>Expense Name <span style={{ color: '#ff4d4f' }}>*</span></label>
              <Dropdown value={formData.expenseItemId} options={expenseItems} optionLabel="label" optionValue="value"
                onChange={(e) => setFormData({ ...formData, expenseItemId: e.value })} placeholder="Select Expense Name" />
            </div>
          }
          <div className="form-group">
            <label>Amount<span style={{ color: '#ff4d4f' }}>*</span></label>
            <input type="number" placeholder="Enter amount" value={formData.cost}
              onChange={(e) => handleChange("cost", e.target.value)} />
          </div>

          <div className="form-group">
            <label>Date<span style={{ color: '#ff4d4f' }}>*</span></label>
            <Calendar value={formData.date} onChange={(e) => handleChange("date", e.value)} showIcon
              placeholder="Select Date" dateFormat="dd/mm/yy" />
          </div>

          <div className="form-group">
            <label>Description(Optional)</label>
            <textarea rows="3" placeholder="Enter description" value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.06)",
                color: "white",
                border: "1px solid rgba(0,212,255,0.2)"
              }} />
          </div>

          <div className="form-group">
            <label>Is Tax Applicable?(By Default Not Applicable)</label>
            <InputSwitch checked={formData.isTax} onChange={(e) => handleChange("isTax", e.value)} />
          </div>

          {formData.isTax && (
            <>
              <div className="form-group">
                <label>Percentage (%)<span style={{ color: '#ff4d4f' }}>*</span></label>
                <input type="number" placeholder="Enter %" value={formData.percentage}
                  onChange={(e) => handleChange("percentage", e.target.value)} />
              </div>

              <div className="form-group">
                <label>Tax Amount</label>
                <input type="number" value={formData.taxAmount} disabled />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Select Image (Optional)</label>
            <input type="file" onChange={(e) => handleChange("image", e.target.files[0])} />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <i className="pi pi-spin pi-spinner" style={{ marginRight: '8px' }}></i>
                {editData ? 'Updating Expense...' : 'Adding Expense...'}
              </>
            ) : (
              editData ? 'Update Expense' : 'Add Expense'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
