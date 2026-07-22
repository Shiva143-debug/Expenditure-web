import React, { useEffect, useRef, useState } from "react";
import "./EarningsForm.css";
import { addSaving, updateSavings as updateSavingsApi } from "../apiService";
import { Toast } from "primereact/toast";
import { Calendar } from "primereact/calendar";

const SavingsForm = ({ onClose, updateSavings, editData }) => {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: null,
    date: null,
    note: ""
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        amount: editData.amount,
        date: new Date(editData.date),
        note: editData.note || ""
      });
    }
  }, [editData])

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount) {
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

    const payload = {
      amount: formData.amount,
      date: formattedDate,
      note: formData.note
    };

    try {
      let response;
      if (editData) {
        response = await updateSavingsApi(editData.id, payload);
        if (response) {
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Saving updated successfully', life: 3000 });
        }
      } else {
        response = await addSaving(payload);
        if (response) {
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Saving added successfully', life: 3000 });
        }
      }
      
      if (response) {
        setTimeout(() => onClose(), 1500);
      }
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: `Failed to ${editData ? 'update' : 'add'} saving`, life: 3000 });
      console.error(`Error ${editData ? 'updating' : 'adding'} saving:`, error);
    } finally {
      setLoading(false);
    }
    await updateSavings()
  };

  return (
    <div className="modal-overlay">
       <Toast ref={toast} position="top-right" />
      <div className="earnings-modal">

        <div className="modal-header">
          <h2>{editData ? 'Update Savings' : 'Add Savings'}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <form className="form-body" onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Amount <span style={{ color: '#ff4d4f' }}>*</span></label>
            <input
              type="number"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Date <span style={{ color: '#ff4d4f' }}>*</span></label>
            <Calendar
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.value })}
              showIcon
              placeholder="Select Date"
              dateFormat="dd/mm/yy"
              className="w-full"
            />
          </div>

          <div className="form-group">
            <label>Note (Optional)</label>
            <textarea
              rows="3"
              placeholder="Enter note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            style={{
                padding: "10px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.06)",
                color: "white",
                border: "1px solid rgba(0,212,255,0.2)"
              }}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <i className="pi pi-spin pi-spinner" style={{ marginRight: '8px' }}></i>
                {editData ? 'Updating Savings...' : 'Adding Savings...'}
              </>
            ) : (
              editData ? 'Update Savings' : 'Add Savings'
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default SavingsForm;
