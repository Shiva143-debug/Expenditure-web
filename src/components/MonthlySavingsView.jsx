import React, { useEffect, useState } from "react";
import "./DetailsView.css";
import { Edit2, Trash2, Search, Download, ChevronDown, ChevronUp } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getSavingsDataByMonthYear } from "../apiService";
import { formatDate, getMonthName } from "../utils/date";
import { formatAmount } from "../utils/format";
import "./MonthlySavingsView.css";

/**
 * Savings entries of the selected month, read from
 * GET /get-savings-by-month-year/:month/:year — the savings card opens this.
 */
const MonthlySavingsView = ({ month, year, refreshKey, enabled = true, onClose, onEdit, onDelete }) => {
  const [savings, setSavings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const title = `Savings for ${getMonthName(month)} ${year}`;

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  useEffect(() => {
    let active = true;

    const loadSavings = async () => {
      if (!enabled) {
        setSavings([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await getSavingsDataByMonthYear(month, year);
        const rows = res?.status && Array.isArray(res.data)
          ? [...res.data].sort((a, b) => new Date(b.date) - new Date(a.date))
          : [];
        if (active) setSavings(rows);
      } catch (error) {
        console.error("Error loading monthly savings:", error);
        if (active) setSavings([]);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadSavings();
    return () => { active = false; };
  }, [month, year, enabled, refreshKey]);

  const total = savings.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const reportTitle = `${getMonthName(month)} ${year} Savings Report`;

    doc.setFontSize(22);
    doc.setTextColor(34, 197, 94);
    doc.setFont("helvetica", "bold");
    doc.text(reportTitle, 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Savings: Rs.${formatAmount(total)}`, 14, 35);
    doc.text(`Entries: ${savings.length}`, 14, 43);

    autoTable(doc, {
      startY: 50,
      head: [['Amount', 'Date', 'Note']],
      body: savings.map((item) => [
        `Rs.${formatAmount(item.amount)}`,
        formatDate(item.date),
        item.note || '--',
      ]),
      headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      styles: { fontSize: 10, cellPadding: 3, textColor: [40, 40, 40], font: "helvetica" },
    });

    doc.save(`${reportTitle.replace(/\s+/g, '_')}.pdf`);
  };

  const filteredData = savings.filter((item) => (item.note || '').toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="details-overlay monthly-savings-overlay">
      {isLoading && (
        <div className="details-loading-overlay">
          <div className="loader-spinner"></div>
        </div>
      )}

      <div className="details-header details-header--with-total">
        <h2>{title}</h2>
        <div className="details-total">
          <span className="details-total__label">Saved</span>
          <span className="details-total__value">₹{formatAmount(total)}</span>
        </div>
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input" />
        </div>
        <button className="download-btn" onClick={handleDownloadPDF} title="Download PDF Report"><Download size={20} /></button>
        <button className="close-btn" onClick={onClose} title="Close">✕</button>
      </div>

      <div className="details-content">
        {filteredData.length === 0 ? (
          <div className="no-data-message">No savings found.</div>
        ) : (
          filteredData.map((item, index) => {
            const itemId = item.id || index;
            const isExpanded = expandedCards[itemId];
            const hasExtra = Boolean(item.note);

            return (
              <div key={itemId}
                className={`details-card savings-detail-card ${animate ? "show" : ""} ${isExpanded ? "expanded" : ""}`}
                style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="details-card-inner">
                  <div className="card-row">
                    <div className="details-amount text-green savings-amount">₹{formatAmount(item.amount)}</div>
                    <div className="card-actions">
                      {onEdit && <button className="action-btn edit-btn" onClick={() => onEdit(item)} title="Edit Savings">
                        <Edit2 size={16} />
                      </button>}
                    </div>
                  </div>

                  <div className="card-row">
                    <div className="meta-item savings-date"><span>{formatDate(item.date)}</span></div>
                    <div className="card-actions">
                      {hasExtra ? (
                        <button className="action-btn expand-btn" onClick={() => toggleExpand(itemId)} title="Show note">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      ) : (
                        onDelete && (
                          <button className="action-btn delete-btn" onClick={() => onDelete(item)} title="Delete Savings">
                            <Trash2 size={16} />
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {isExpanded && hasExtra && (
                    <div className="expanded-content">
                      <div className="savings-expanded-row">
                        <span className="meta-label savings-note">Note: {item.note}</span>
                        {onDelete && <button className="action-btn delete-btn" onClick={() => onDelete(item)}
                          title="Delete Savings"><Trash2 size={16} /></button>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MonthlySavingsView;
