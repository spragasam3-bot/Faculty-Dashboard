import React from 'react';

export default function SummaryCard({ label, value, subtext, icon: Icon, themeClass = 'cat-faculty' }) {
  return (
    <div className="card summary-card">
      <div className="summary-card-top">
        <span className="summary-card-label">{label}</span>
        <div className={`summary-card-icon ${themeClass}`}>
          {Icon && <Icon size={20} />}
        </div>
      </div>
      <div className="summary-card-val">{value}</div>
      {subtext && <div className="summary-card-subtext">{subtext}</div>}
    </div>
  );
}
