import React, { useEffect, useState, useRef } from "react";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import "./EarningsForm.css";
import { getIncomeSources, addIncome, updateIncome as updateIncomeApi } from "../apiService";

const EarningsForm = ({ onClose, updateEarnings, editData }) => {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [sources, setEaringSources] = useState([]);
  const [formData, setFormData] = useState({ sourceId: null, amount: null, date: null });

  useEffect(() => {
    fetchEarningSources();
    if (editData) {
      setFormData({ sourceId: editData.sourceId, amount: editData.amount, date: new Date(editData.date) });
    }
  }, [editData])

  const fetchEarningSources = async () => {
    try {
      const res = await getIncomeSources();
      if (res?.status && Array.isArray(res.data)) {
        const mappedEarningSources = res.data.map(item => ({
          ...item,
          label: item.sourceName || item.name || "Unknown",
          value: item.id
        }));
        setEaringSources(mappedEarningSources);
      }
    } catch (error) {
      console.error("Error fetching sources:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.sourceId) {
      toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Please Select source', life: 3000 });
      return;
    }

    if (!formData.amount) {
      toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Please Enter Amount', life: 3000 });
      return;
    }

    if (!formData.date) {
      toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Please select Date', life: 3000 });
      return;
    }
    setLoading(true);
    const date = new Date(formData.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    const payload = { sourceId: formData.sourceId, amount: formData.amount, date: formattedDate };

    try {
      let response;
      if (editData) {
        response = await updateIncomeApi(editData.id, payload);
        if (response?.status) {
          toast.current.show({ severity: 'success', summary: 'Success', detail: response.message || 'Earnings updated successfully', life: 3000 });
        } else if (response) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: response?.message || `Failed to update earnings`, life: 3000 });
        }
      } else {
        response = await addIncome(payload);
        if (response?.status) {
          toast.current.show({ severity: 'success', summary: 'Success', detail: response.message || 'Earnings added successfully', life: 3000 });
        } else if (response) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: response?.message || `Failed to add earnings`, life: 3000 });
        }
      }

      if (response?.status) {
        setTimeout(() => onClose(), 1500);
      }
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: `Failed to ${editData ? 'update' : 'add'} earnings`, life: 3000 });
      console.error(`Error ${editData ? 'updating' : 'adding'} earnings:`, error);
    } finally {
      setLoading(false);
    }
    await updateEarnings()
  };

  return (
    <div className="modal-overlay">
      <Toast ref={toast} position="top-right" />
      <div className="earnings-modal">
        <div className="modal-header">
          <h2>{editData ? 'Update Earnings' : 'Add Earnings'}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          <div className="form-group">
            <label>Source<span style={{ color: '#ff4d4f' }}>*</span></label>
            <Dropdown
              value={formData.sourceId}
              options={sources}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => setFormData({ ...formData, sourceId: e.value })}
              placeholder="Select Source"
              className="w-full"
            />
          </div>

          <div className="form-group">
            <label>Amount<span style={{ color: '#ff4d4f' }}>*</span></label>
            <input type="number" placeholder="Enter amount" value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Date<span style={{ color: '#ff4d4f' }}>*</span></label>
            <Calendar value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.value })} showIcon
              placeholder="Select Date" className="w-full" dateFormat="dd/mm/yy" />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <i className="pi pi-spin pi-spinner" style={{ marginRight: '8px' }}></i>
                {editData ? 'Updating Earnings...' : 'Adding Earnings...'}
              </>
            ) : (
              editData ? 'Update Earnings' : 'Add Earnings'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EarningsForm;
