import React from 'react';

export default function StatsCard({ title, value, icon, color = 'blue' }) {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <span className="stat-label">{title}</span>
        <span className="stat-value">{value !== undefined && value !== null ? value.toLocaleString() : '0'}</span>
      </div>
      <div className={`stat-icon-wrapper stat-icon-${color}`}>
        {icon}
      </div>
    </div>
  );
}
