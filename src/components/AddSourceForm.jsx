import React, { useRef, useState, useEffect } from "react";
import "./EarningsForm.css";
import { addIncomeSource, updateIncomeSource } from "../apiService";
import { Toast } from "primereact/toast";

const AddSourceForm = ({ onClose, updateIncomeSources, editData }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    if (editData) {
      setName(editData.name || "");
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Please Enter source name', life: 3000 });
      return;
    }

    setLoading(true);

    try {
      if (editData) {
        const payload = {
          sourceName: name
        };
        const response = await updateIncomeSource(editData.id, payload);
        if (response && response.status == "201") {
          toast.current.show({ severity: 'info', summary: 'Info', detail: `${name} already exists`, life: 3000 });
        } else if (response) {
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Income Source updated successfully', life: 3000 });
          setTimeout(() => onClose(), 1500);
        }
      } else {
        const payload = {
          sourceName: name
        };
        const response = await addIncomeSource(payload);
        if (response && response.status == 201) {
          toast.current.show({ severity: 'info', summary: 'Info', detail: 'Income source was already added', life: 3000 });
        } else if (response) {
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Income Source added successfully', life: 3000 });
          setTimeout(() => onClose(), 1500);
        }
      }
      await updateIncomeSources();
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: `Failed to ${editData ? 'update' : 'add'} Income Source`, life: 3000 });
      console.error(`Error ${editData ? 'updating' : 'adding'} Income Source:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <Toast ref={toast} position="top-right" />
      <div className="earnings-modal">

        <div className="modal-header">
          <h2>{editData ? 'Edit Source' : 'Add Source'}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <form className="form-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Source Name <span style={{ color: '#ff4d4f' }}>*</span></label>
            <input
              type="text"
              placeholder="Enter source name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <i className="pi pi-spin pi-spinner" style={{ marginRight: '8px' }}></i>
                {editData ? 'Updating Source...' : 'Adding Source...'}
              </>
            ) : (
              editData ? 'Update Source' : 'Add Source'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSourceForm;
