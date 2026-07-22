import React from 'react';
import './BarChart.css';

const BarChart = ({ data, type = 'comparison' }) => {
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.earnings || 0, d.expenses || 0))
  );

  const normalizeHeight = (value) => {
    return (value / maxValue) * 100;
  };

  const formatValue = (value) => {
    if (value >= 100000) return `${(value / 1000).toFixed(0)}K`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <div className="bar-chart-container">
      <div className="chart-labels">
        <div className="chart-label-item">
          <div className="label-color earnings-color"></div>
          <span>Earnings</span>
        </div>
        <div className="chart-label-item">
          <div className="label-color expenses-color"></div>
          <span>Expenses</span>
        </div>
      </div>

      <div className="bar-chart">
        <div className="chart-y-axis">
          <span className="y-label">100K</span>
          <span className="y-label">75K</span>
          <span className="y-label">50K</span>
          <span className="y-label">20K</span>
        </div>

        <div className="chart-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="grid-line" />
          ))}
        </div>

        <div className="chart-bars">
          {data.map((item, index) => (
            <div key={index} className="bar-group">
              <div className="bar-pair">
                <div
                  className="bar earnings-bar"
                  style={{ height: `${normalizeHeight(item.earnings)}%` }}
                  data-value={formatValue(item.earnings)}
                >
                  <div className="bar-tooltip">{item.earnings.toLocaleString('en-IN')}</div>
                </div>
                <div
                  className="bar expenses-bar"
                  style={{ height: `${normalizeHeight(item.expenses)}%` }}
                  data-value={formatValue(item.expenses)}
                >
                  <div className="bar-tooltip">{item.expenses.toLocaleString('en-IN')}</div>
                </div>
              </div>
              <div className="bar-label">{item.month}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BarChart;
