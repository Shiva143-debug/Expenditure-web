import React, { useState } from 'react';
import { useMonthlyExpenses } from '../hooks/useMonthlyExpenses';
import './DonutChart.css';

const DonutChart = ({ month, year, enabled = true, refreshKey }) => {
  const { chartData, isLoading } = useMonthlyExpenses(month, year, enabled, refreshKey);
  const [hovered, setHovered] = useState(null);

  const colors = ['#00d4ff', '#ff1493', '#ffd700', '#00ff96', '#8a2be2'];

  if (isLoading) {
    return (
      <div className="donut-chart-container no-data">
        <div className="chart-svg-container">
          <div className="loader-spinner"></div>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="donut-chart-container no-data">
        <div className="chart-svg-container">
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1a1f3a" strokeWidth="15" />
            <circle cx="50" cy="50" r="25" fill="#0a0e27" />
            <text x="50" y="52" textAnchor="middle" fill="rgba(255, 255, 255, 0.4)" style={{ fontSize: '8px', fontWeight: '500' }}>No Expenses Found</text>
          </svg>
        </div>
      </div>
    );
  }

  let cumulative = 0;

  return (
    <div className="donut-chart-container">
      {hovered && (
        <div className="chart-tooltip">
          {hovered.name} <br />
          ₹{hovered.value} <br />
          {hovered.percentage.toFixed(1)}%
        </div>
      )}

      <div className="chart-svg-container">
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          {chartData.map((item, index) => {
            const percentage = item.percentage;

            if (percentage <= 0) return null;

            const startAngle = (cumulative / 100) * 360;
            const endAngle = ((cumulative + percentage) / 100) * 360;

            cumulative += percentage;

            const startRad = (startAngle - 90) * (Math.PI / 180);
            const endRad = (endAngle - 90) * (Math.PI / 180);

            const x1 = 50 + 40 * Math.cos(startRad);
            const y1 = 50 + 40 * Math.sin(startRad);
            const x2 = 50 + 40 * Math.cos(endRad);
            const y2 = 50 + 40 * Math.sin(endRad);

            const largeArcFlag = percentage > 50 ? 1 : 0;

            const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            return (
              <path
                key={index} d={pathData} fill={colors[index % colors.length]} onMouseEnter={() => setHovered(item)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}
              />
            );
          })}

          {/* Donut hole */}
          <circle cx="50" cy="50" r="25" fill="#0a0e27" />
        </svg>
      </div>

      {/* Legend */}
      <div className="chart-legend">
        {chartData.map((item, index) => (
          <div key={index} className="legend-item">
            <span className="legend-color" style={{ backgroundColor: colors[index % colors.length] }} />
            <span>{item.name} ({item.percentage.toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
