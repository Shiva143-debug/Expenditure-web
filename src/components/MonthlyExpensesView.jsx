import React, { useEffect, useState } from "react";
import "./DetailsView.css"; // Reuse styles
import { Calendar, Tag, CreditCard, Edit2, Trash2, Eye, X, ChevronDown, ChevronUp, Search, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MonthlyExpensesView = ({ title, data, onClose, onEdit, onDelete, isLoading }) => {
  const [animate, setAnimate] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const cleanTitle = title.replace('Expenses for ', '');
    const reportTitle = `${cleanTitle} Expense Report`;
    
    // Group data by category
    const groupedData = data.reduce((acc, item) => {
      const category = item.category || "Uncategorized";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});

    const totalExpenses = data.reduce((sum, item) => sum + parseFloat(item.cost || 0), 0);
    const totalTax = data.reduce((sum, item) => sum + parseFloat(item.taxAmount || 0), 0);

    // Title
    doc.setFontSize(22);
    doc.setTextColor(38, 166, 154); // Teal color from image
    doc.setFont("helvetica", "bold");
    doc.text(reportTitle, 105, 20, { align: "center" });

    // Totals
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Expenses: Rs.${totalExpenses.toLocaleString()}`, 14, 35);
    doc.text(`Total Tax: Rs.${totalTax.toLocaleString()}`, 14, 43);

    const tableRows = [];
    Object.keys(groupedData).sort().forEach(category => {
      // Category Header Row
      tableRows.push([
        { content: category.toUpperCase(), colSpan: 5, styles: { fillColor: [242, 242, 242], fontStyle: 'bold', textColor: [0, 0, 0] } }
      ]);
      
      groupedData[category].forEach(item => {
        tableRows.push([
          item.expenseName || item.name,
          ` ${parseFloat(item.cost || 0).toLocaleString()}`,
          `${parseFloat(item.taxAmount || 0).toLocaleString()}`,
          new Date(item.pDate).toISOString().split('T')[0],
          item.description || "--"
        ]);
      });
    });

    autoTable(doc, {
      startY: 50,
      head: [['Expense', 'Amount', 'Tax', 'Date', 'Description']],
      body: tableRows,
      headStyles: { fillColor: [38, 166, 154], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      styles: { 
        fontSize: 10, 
        cellPadding: 3, 
        textColor: [40, 40, 40],
        font: "helvetica",
        fontStyle: "normal"
      },
      columnStyles: {
        1: { halign: 'left' },
        2: { halign: 'left' }
      },
      didParseCell: function(data) {
        if (data.row.raw && data.row.raw[0] && data.row.raw[0].content) {
          // This is a category header row, handled by the cell configuration already
        }
      }
    });

    doc.save(`${reportTitle.replace(/\s+/g, '_')}.pdf`);
  };

  const filteredData = data.filter((item) => {
    const expenseName = (item.expenseName || item.name || "").toLowerCase();
    const category = (item.category || "").toLowerCase();
    const description = (item.description || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return (
      expenseName.includes(search) ||
      category.includes(search) ||
      description.includes(search)
    );
  });

  const toggleExpand = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="details-overlay monthly-expenses-overlay">
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
        <button className="download-btn" onClick={handleDownloadPDF} title="Download PDF Report">
          <Download size={20} />
        </button>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="details-content">
        {filteredData.length === 0 ? (
          <div className="no-data-message">No expenses found.</div>
        ) : (
          filteredData.map((item, index) => {
            const itemId = item.id || index;
            const isExpanded = expandedCards[itemId];
            const hasExtra = item.isTaxApp || item.isTax || (item.taxAmount != null && item.taxAmount !== '') || item.image || item.description;

            return (
              <div
                key={itemId}
                className={`details-card ${animate ? "show" : ""} ${isExpanded ? "expanded" : ""}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="details-card-inner" >
                  <div className="card-row">
                    <div className="details-name col-name">{item.expenseName || item.name}</div>
                    <div className="details-amount text-orange col-amount">₹{item.cost}</div>
                    <div className="card-actions col-actions">
                      {onEdit && (
                        <button className="action-btn edit-btn" onClick={() => onEdit(item)}>
                          <Edit2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="card-row">
                    <div className="meta-item col-name">
                      {/* <Tag size={14} /> */}
                      <span>{item.category}</span>
                    </div>
                    <div className="meta-item col-amount">
                      {/* <Calendar size={14} /> */}
                      <span>{formatDate(item.pDate)}</span>
                    </div>
                    <div className="card-actions col-actions">
                      {hasExtra ? (
                        <button className="action-btn expand-btn" onClick={() => toggleExpand(itemId)}>
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      ) : (
                        onDelete && (
                          <button className="action-btn delete-btn" onClick={() => onDelete(item)}>
                            <Trash2 size={16} />
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="expanded-content">
                      {(item.isTaxApp || item.isTax || (item.taxAmount != null && item.taxAmount !== '') || item.image) && (
                        <div className="card-row card-row-extra">
                          <div className="meta-item">
                            {(item.isTaxApp || item.isTax) && (
                              <>
                                <span className="meta-label">Tax: </span>
                                <span >
                                  {(item.percentage != null && item.percentage !== '') && `${item.percentage}% `}
                                  {(item.taxAmount != null && item.taxAmount !== '') && `₹${item.taxAmount}`}
                                </span>
                              </>
                            )}
                          </div>
                          
                          <div className="meta-item col-amount">
                            {onDelete && (
                              <button className="action-btn delete-btn" onClick={() => onDelete(item)}>
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>

                          <div className="card-actions col-actions">
                            {item.image && (
                              <button
                                type="button"
                                className="image-preview-btn"
                                onClick={() => setPreviewImage(item.image)}
                                title="Preview image"
                              >
                                <Eye size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {item.description && (
                        <>
                          <hr />
                          <div className="card-row card-row-desc">
                            <span className="meta-label">Note: {item.description}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {previewImage && (
        <div className="image-modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setPreviewImage(null)}>
              <X size={18} />
            </button>
            <img src={previewImage} alt="Expense" className="image-modal-img" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyExpensesView;
