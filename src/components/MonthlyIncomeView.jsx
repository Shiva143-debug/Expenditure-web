import React, { useEffect, useState } from "react";
import "./DetailsView.css";
import { Edit2, Trash2, Search, Download, ChevronDown, ChevronUp } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getIncomeByMonthYear } from "../apiService";
import { formatDate, getMonthName } from "../utils/date";
import { formatAmount } from "../utils/format";
import "./MonthlyIncomeView.css";

const sum = (rows, key) => rows.reduce((total, item) => total + (Number(item[key]) || 0), 0);

/**
 * Income entries of the selected month, read from
 * GET /get-income-by-month-year/:month/:year — the earnings card opens this.
 */
const MonthlyIncomeView = ({ month, year, refreshKey, enabled = true, onClose, onEdit, onDelete }) => {
  const [income, setIncome] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const title = `Income for ${getMonthName(month)} ${year}`;

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  useEffect(() => {
    let active = true;

    const loadIncome = async () => {
      if (!enabled) {
        setIncome([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await getIncomeByMonthYear(month, year);
        const rows = res?.status && Array.isArray(res.data)
          ? [...res.data].sort((a, b) => new Date(b.date) - new Date(a.date))
          : [];
        if (active) setIncome(rows);
      } catch (error) {
        console.error("Error loading monthly income:", error);
        if (active) setIncome([]);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadIncome();
    return () => { active = false; };
  }, [month, year, enabled, refreshKey]);

  const total = sum(income, 'amount');

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const reportTitle = `${getMonthName(month)} ${year} Income Report`;

    doc.setFontSize(22);
    doc.setTextColor(0, 212, 255);
    doc.setFont("helvetica", "bold");
    doc.text(reportTitle, 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Income: Rs.${formatAmount(total)}`, 14, 35);
    doc.text(`Entries: ${income.length}`, 14, 43);

    autoTable(doc, {
      startY: 50,
      head: [['Source', 'Amount', 'Date', 'Note']],
      body: income.map((item) => [
        item.sourceName || item.source || '--',
        `Rs.${formatAmount(item.amount)}`,
        formatDate(item.date),
        item.note || item.description || '--',
      ]),
      headStyles: { fillColor: [0, 150, 190], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      styles: { fontSize: 10, cellPadding: 3, textColor: [40, 40, 40], font: "helvetica" },
    });

    doc.save(`${reportTitle.replace(/\s+/g, '_')}.pdf`);
  };

  const filteredData = income.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      (item.sourceName || item.source || '').toLowerCase().includes(search) ||
      (item.note || item.description || '').toLowerCase().includes(search)
    );
  });

  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="details-overlay monthly-income-overlay">
      {isLoading && (
        <div className="details-loading-overlay">
          <div className="loader-spinner"></div>
        </div>
      )}

      <div className="details-header details-header--with-total">
        <h2>{title}</h2>
        <div className="details-total">
          <span className="details-total__label">Total</span>
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
          <div className="no-data-message">No income found.</div>
        ) : (
          filteredData.map((item, index) => {
            const itemId = item.id || index;
            const isExpanded = expandedCards[itemId];
            const note = item.note || item.description;
            const hasExtra = Boolean(note);

            return (
              <div key={itemId}
                className={`details-card income-detail-card ${animate ? "show" : ""} ${isExpanded ? "expanded" : ""}`}
                style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="details-card-inner">
                  <div className="card-row">
                    <div className="details-name income-label">
                      <span className="income-label__source">{item.sourceName || item.source || 'Income'}</span>
                      <span className="income-label__amount">₹{formatAmount(item.amount)}</span>
                    </div>
                    <div className="card-actions">
                      {onEdit && <button className="action-btn edit-btn" onClick={() => onEdit(item)} title="Edit Income">
                        <Edit2 size={16} />
                      </button>}
                    </div>
                  </div>

                  <div className="card-row">
                    <div className="meta-item income-date"><span>{formatDate(item.date)}</span></div>
                    <div className="card-actions">
                      {hasExtra ? (
                        <button className="action-btn expand-btn" onClick={() => toggleExpand(itemId)} title="Show note">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      ) : (
                        onDelete && (
                          <button className="action-btn delete-btn" onClick={() => onDelete(item)} title="Delete Income">
                            <Trash2 size={16} />
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {isExpanded && hasExtra && (
                    <div className="expanded-content">
                      <div className="income-expanded-row">
                        <span className="meta-label income-note">Note: {note}</span>
                        {onDelete && <button className="action-btn delete-btn" onClick={() => onDelete(item)}
                          title="Delete Income"><Trash2 size={16} /></button>}
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

export default MonthlyIncomeView;
