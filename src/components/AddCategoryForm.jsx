import React, { useRef, useState, useEffect } from "react";
import "./EarningsForm.css";
import { addCategory, updateCategory } from "../apiService";
import { Toast } from "primereact/toast";

const AddCategoryForm = ({ onClose, updateCategories, editData }) => {
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    if (editData) {
      setCategory(editData.name || "");
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) {
      toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Please Enter Category Name', life: 3000 });
      return;
    }
    setLoading(true);

    try {
      if (editData) {
        const response = await updateCategory(editData.id, editData.name, category);
        if (response && response.status == "201") {
          toast.current.show({ severity: 'info', summary: 'Info', detail: `${category} already exists`, life: 3000 });
        } else if (response) {
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Category updated successfully', life: 3000 });
          setTimeout(() => onClose(), 1500);
        }
      } else {
        const payload = {
          category
        };
        const response = await addCategory(payload);
        if (response && response.status == 201) {
          toast.current.show({ severity: 'info', summary: 'Info', detail: 'Category was already added', life: 3000 });
        } else if (response) {
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Category added successfully', life: 3000 });
          setTimeout(() => onClose(), 1500);
        }
      }
      updateCategories && await updateCategories();
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: `Failed to ${editData ? 'update' : 'add'} category`, life: 3000 });
      console.error(`Error ${editData ? 'updating' : 'adding'} Category:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <Toast ref={toast} position="top-right" />
      <div className="earnings-modal">

        <div className="modal-header">
          <h2>{editData ? 'Edit Category' : 'Add Category'}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <form className="form-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category Name<span style={{ color: '#ff4d4f' }}>*</span></label>
            <input
              type="text"
              placeholder="Enter category name"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <button className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <i className="pi pi-spin pi-spinner" style={{ marginRight: '8px' }}></i>
                {editData ? 'Updating Category...' : 'Adding Category...'}
              </>
            ) : (
              editData ? 'Update Category' : 'Add Category'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryForm;
