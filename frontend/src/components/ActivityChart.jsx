import React, { useState } from 'react';
import { BarChart3, PieChart, Layers } from 'lucide-react';

export default function ActivityChart({ categoryDistribution = [], departmentStats = [], yearTrends = [] }) {
  const [activeView, setActiveView] = useState('categories'); // 'categories' | 'departments' | 'trends'

  // Colors mapped to categories
  const categoryColors = {
    Teaching: '#2563eb',     // Blue
    Publication: '#7c3aed',  // Purple
    FDP: '#059669',          // Green
    Consultancy: '#ea580c',  // Orange
    Patent: '#db2777',       // Pink
  };

  const deptColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const maxDeptActivity = Math.max(...departmentStats.map(d => d.activity_count), 1);
  const maxYearActivity = Math.max(...yearTrends.map(y => y.count), 1);

  return (
    <div className="chart-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 className="section-title">
          <BarChart3 size={18} color="#2563eb" />
          <span>Activity & Performance Breakdown</span>
        </h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeView === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveView('categories')}
          >
            By Category
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeView === 'departments' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveView('departments')}
          >
            By Department
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeView === 'trends' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveView('trends')}
          >
            Year Trends
          </button>
        </div>
      </div>

      {activeView === 'categories' && (
        <div>
          {categoryDistribution.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
              No activity records available.
            </p>
          ) : (
            categoryDistribution.map((item) => {
              const color = categoryColors[item.category] || '#64748b';
              return (
                <div key={item.category} className="chart-bar-row">
                  <div className="chart-bar-header">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color }}></span>
                      <span>{item.category}</span>
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      <strong>{item.count}</strong> records ({item.percentage}%)
                    </span>
                  </div>
                  <div className="chart-bar-track">
                    <div
                      className="chart-bar-fill"
                      style={{
                        width: `${Math.max(item.percentage, 3)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeView === 'departments' && (
        <div>
          {departmentStats.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
              No department data available.
            </p>
          ) : (
            departmentStats.map((dept, index) => {
              const color = deptColors[index % deptColors.length];
              const percentage = Math.round((dept.activity_count / maxDeptActivity) * 100);
              return (
                <div key={dept.department} className="chart-bar-row">
                  <div className="chart-bar-header">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color }}></span>
                      <span>{dept.department}</span>
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {dept.faculty_count} Faculty | <strong>{dept.activity_count}</strong> Activities
                    </span>
                  </div>
                  <div className="chart-bar-track">
                    <div
                      className="chart-bar-fill"
                      style={{
                        width: `${Math.max(percentage, 5)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeView === 'trends' && (
        <div>
          {yearTrends.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
              No yearly trends available.
            </p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', height: '140px', paddingTop: '20px', paddingBottom: '10px' }}>
              {yearTrends.map((yt) => {
                const heightPct = Math.round((yt.count / maxYearActivity) * 100);
                return (
                  <div key={yt.year} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', marginBottom: '4px' }}>
                      {yt.count}
                    </span>
                    <div style={{ width: '100%', maxWidth: '42px', flex: 1, display: 'flex', alignItems: 'flex-end', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
                      <div
                        style={{
                          width: '100%',
                          height: `${Math.max(heightPct, 15)}%`,
                          backgroundColor: '#2563eb',
                          borderRadius: '4px',
                          transition: 'height 0.3s ease',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '600' }}>
                      {yt.year}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
