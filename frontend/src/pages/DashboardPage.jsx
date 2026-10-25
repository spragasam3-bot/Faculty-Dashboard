import React, { useEffect, useState } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  Lightbulb,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import SummaryCard from '../components/SummaryCard';
import ActivityChart from '../components/ActivityChart';

export default function DashboardPage({ setActiveTab, onSelectFacultyForAppraisal }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="state-container">
        <div className="loading-spinner"></div>
        <h3 className="state-title">Loading Dashboard Statistics</h3>
        <p className="state-desc">Fetching performance data from the database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container">
        <AlertTriangle size={40} color="#dc2626" className="state-icon" />
        <h3 className="state-title">Unable to Connect to Backend</h3>
        <p className="state-desc">{error}</p>
        <button className="btn btn-primary" onClick={fetchStats}>
          <RefreshCw size={16} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div>
      {/* 6 Summary Cards */}
      <div className="summary-grid">
        <SummaryCard
          label="Total Faculty"
          value={stats.total_faculty}
          subtext="Across all departments"
          icon={Users}
          themeClass="cat-faculty"
        />
        <SummaryCard
          label="Teaching Workload"
          value={`${stats.teaching_count} Courses`}
          subtext={`${stats.total_teaching_hours} Contact hrs/week`}
          icon={GraduationCap}
          themeClass="cat-teaching"
        />
        <SummaryCard
          label="Publications"
          value={stats.publications_count}
          subtext="Journals & Conferences"
          icon={BookOpen}
          themeClass="cat-publication"
        />
        <SummaryCard
          label="Faculty Dev (FDPs)"
          value={stats.fdps_count}
          subtext="Workshops & Seminars"
          icon={Award}
          themeClass="cat-fdp"
        />
        <SummaryCard
          label="Consultancy Projects"
          value={stats.consultancy_count}
          subtext={formatCurrency(stats.total_consultancy_amount)}
          icon={Briefcase}
          themeClass="cat-consultancy"
        />
        <SummaryCard
          label="Patents & IP"
          value={stats.patents_count}
          subtext="Filed & Granted"
          icon={Lightbulb}
          themeClass="cat-patent"
        />
      </div>

      {/* Chart Section */}
      <div style={{ marginBottom: '28px' }}>
        <ActivityChart
          categoryDistribution={stats.category_distribution}
          departmentStats={stats.department_stats}
          yearTrends={stats.year_trends}
        />
      </div>

      {/* Recent Activities Section */}
      <div className="card">
        <div className="section-header">
          <h2 className="section-title">
            <Clock size={18} color="#2563eb" />
            <span>Recent Academic Activities</span>
          </h2>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('activities')}
          >
            <span>View All Activities</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {stats.recent_activities.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '16px 0' }}>
            No recent activities recorded yet.
          </p>
        ) : (
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Activity Title</th>
                  <th>Faculty Member</th>
                  <th>Department</th>
                  <th>Year / Period</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_activities.map((act) => {
                  const catClass = `badge-${act.category.toLowerCase()}`;
                  const statusClass = `badge-status-${act.status.toLowerCase().replace(/\s+/g, '-')}`;
                  return (
                    <tr key={act.id}>
                      <td>
                        <span className={`badge ${catClass}`}>
                          {act.category}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{act.title}</td>
                      <td>
                        <button
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            padding: 0,
                            textAlign: 'left'
                          }}
                          onClick={() => {
                            if (onSelectFacultyForAppraisal) {
                              onSelectFacultyForAppraisal(act.faculty_id);
                            }
                          }}
                          title="View Appraisal"
                        >
                          {act.faculty_name}
                        </button>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{act.faculty_department}</td>
                      <td>{act.date_or_period || act.year}</td>
                      <td>
                        <span className={`badge badge-status ${statusClass}`}>
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
