import React, { useEffect, useState } from "react";
import { Edit2, Trash2, Info, Search } from "lucide-react";
import "./DetailsView.css";

const DetailsView = ({ title, data, onClose, onEdit, onDelete, isLoading }) => {
  const [animate, setAnimate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100); // trigger animation
  }, []);

  const filteredData = data.filter((item) => {
    const name = (item.name || "").toLowerCase();
    const expenseName = (item.expenseName || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || expenseName.includes(search);
  });

  const isDefault = (item) => item.userId === 0 || item.user_id === 0;

  const getTooltipMessage = () => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("source")) return "Default Earning Source (cannot be modified)";
    if (lowerTitle.includes("categories")) return "Default Expense Category (cannot be modified)";
    if (lowerTitle.includes("item")) return "Default Expense Item (cannot be modified)";
    return "Default system item (cannot be modified)";
  };

  const handleEdit = (item) => {
    if (onEdit) {
      onEdit(item);
    } else {
      console.log("Editing item:", item);
    }
  };

  const handleDelete = (item) => {
    if (onDelete) {
      onDelete(item);
    } else {
      console.log("Deleting item:", item);
    }
  };

  return (
    <div className="details-overlay">
      {isLoading && (
        <div className="details-loading-overlay">
          <div className="loader-spinner"></div>
        </div>
      )}
      <div className="details-header">
        <h2>{title}</h2>
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="details-content">
        {filteredData.length === 0 ? (
          <div className="no-data-message">No items found.</div>
        ) : (
          filteredData.map((item, index) => (
             <div
               key={item.id}
               className={`details-card ${animate ? "show" : ""} ${isDefault(item) ? "default-item" : ""}`}
               style={{ animationDelay: `${index * 0.1}s` }}
               title={isDefault(item) ? getTooltipMessage() : ""}
             >
               <div className="details-card-inner">
                 <div className="details-row">
                   <div className="details-name">
                     {item.name}
                     {isDefault(item) && <Info size={12} className="default-info-icon" />}
                   </div>
                   {(onEdit || onDelete) && !isDefault(item) && (
                     <div className="details-actions">
                      {onEdit && (
                        <button className="action-btn edit-btn" onClick={() => handleEdit(item)}>
                          <Edit2 size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button className="action-btn delete-btn" onClick={() => handleDelete(item)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {(item.expenseName || item.amount) && (
                  <div className="details-info">
                    {item.expenseName && <div className="details-expenseName">{item.expenseName}</div>}
                    {item.amount && (
                      <div className="details-amount">₹{item.amount}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DetailsView;