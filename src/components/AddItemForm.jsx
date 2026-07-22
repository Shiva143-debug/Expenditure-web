import React, { useEffect, useRef, useState } from "react";
import "./EarningsForm.css";
import { Dropdown } from "primereact/dropdown";
import { addExpenseItem, getCategories, updateExpenseItem } from "../apiService";
import { Toast } from "primereact/toast";

const AddItemForm = ({ onClose, updateExpenseItems, editData }) => {
  const [expenseName, setItem] = useState("");
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(null)
  const [categories, setCategories] = useState([])
  const toast = useRef(null);

  useEffect(() => {
    if (editData) {
      setItem(editData.expenseName || editData.name || "");
      setCategory(editData.category || null);
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) {
      toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Please Select Category', life: 3000 });
      return;
    }
    if (!expenseName) {
      toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Please Enter Expense Name', life: 3000 });
      return;
    }

    setLoading(true);

    try {
      if (editData) {
        const response = await updateExpenseItem(editData.id, expenseName);
        if (response && response.status == "201") {
          toast.current.show({ severity: 'info', summary: 'Info', detail: `${expenseName} already exists`, life: 3000 });
        } else if (response) {
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Expense Item updated successfully', life: 3000 });
          setTimeout(() => onClose(), 1500);
        }
      } else {
        const payload = {
          category,
          expenseName
        };
        const response = await addExpenseItem(payload);
        if (response && response.message == "Expense Name already exist") {
          toast.current.show({ severity: 'info', summary: 'Info', detail: `${expenseName} was already added`, life: 3000 });
        } else if (response) {
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Expense Item added successfully', life: 3000 });
          setTimeout(() => onClose(), 1500);
        }
      }
      await updateExpenseItems();
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: `Failed to ${editData ? 'update' : 'add'} Expense Item`, life: 3000 });
      console.error(`Error ${editData ? 'updating' : 'adding'} Expense Item:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      if (data && Array.isArray(data)) {
        const mappedCategories = data.map(item => ({
          ...item,
          label: item.category,
          value: item.category
        }));
        setCategories(mappedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <Toast ref={toast} position="top-right" />
      <div className="earnings-modal">

        <div className="modal-header">
          <h2>{editData ? 'Edit Expense Item' : 'Add Expense Item'}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <form className="form-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Category <span style={{ color: '#ff4d4f' }}>*</span></label>
            <Dropdown
              value={category}
              options={categories}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Select category"
              disabled={!!editData}
            />
          </div>
          <div className="form-group">
            <label>Expense Name<span style={{ color: '#ff4d4f' }}>*</span></label>
            <input
              type="text"
              placeholder="Enter expense name"
              value={expenseName}
              onChange={(e) => setItem(e.target.value)}
            />
          </div>

          <button className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <i className="pi pi-spin pi-spinner" style={{ marginRight: '8px' }}></i>
                {editData ? 'Updating Item...' : 'Adding Item...'}
              </>
            ) : (
              editData ? 'Update Expense Item' : 'Add Expense Item'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddItemForm;
