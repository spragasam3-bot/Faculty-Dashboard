import React, { useState, useEffect } from 'react';
import {
  Award,
  Users,
  Calendar,
  Mail,
  GraduationCap,
  BookOpen,
  Briefcase,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export default function AppraisalPage({ selectedFacultyId, onSelectFaculty }) {
  const [facultyList, setFacultyList] = useState([]);
  const [currentFacultyId, setCurrentFacultyId] = useState(selectedFacultyId || '');
  const [appraisalData, setAppraisalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load faculty list for dropdown
  useEffect(() => {
    const loadFaculty = async () => {
      try {
        const list = await api.getFaculty();
        setFacultyList(list);
        if (list.length > 0 && !currentFacultyId) {
          setCurrentFacultyId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load faculty list:', err);
      }
    };
    loadFaculty();
  }, []);

  // Update currentFacultyId if prop changes
  useEffect(() => {
    if (selectedFacultyId) {
      setCurrentFacultyId(selectedFacultyId);
    }
  }, [selectedFacultyId]);

  // Fetch appraisal data whenever currentFacultyId changes
  useEffect(() => {
    if (!currentFacultyId) return;

    const fetchAppraisal = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getFacultyAppraisal(currentFacultyId);
        setAppraisalData(data);
      } catch (err) {
        setError(err.message || 'Failed to calculate appraisal scores.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppraisal();
  }, [currentFacultyId]);

  const handleFacultyChange = (id) => {
    setCurrentFacultyId(id);
    if (onSelectFaculty) {
      onSelectFaculty(id);
    }
  };

  const getGradeClass = (score) => {
    if (score >= 80) return 'grade-a-plus';
    if (score >= 60) return 'grade-a';
    if (score >= 40) return 'grade-b-plus';
    if (score >= 20) return 'grade-b';
    return 'grade-c';
  };

  const categoryIcons = {
    Teaching: GraduationCap,
    Publication: BookOpen,
    FDP: Award,
    Consultancy: Briefcase,
    Patent: Lightbulb,
  };

  const categoryThemes = {
    Teaching: 'cat-teaching',
    Publication: 'cat-publication',
    FDP: 'cat-fdp',
    Consultancy: 'cat-consultancy',
    Patent: 'cat-patent',
  };

  return (
    <div>
      {/* Faculty Selector Bar */}
      <div className="filter-bar" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={16} color="var(--primary)" />
            <span>Select Faculty Member:</span>
          </label>
          <select
            className="select-input"
            value={currentFacultyId}
            onChange={(e) => handleFacultyChange(Number(e.target.value))}
            style={{ minWidth: 260, fontWeight: 600 }}
          >
            {facultyList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} - {f.department} ({f.designation})
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Transparent Academic Performance & Appraisal Metric
        </div>
      </div>

      {loading && (
        <div className="state-container">
          <div className="loading-spinner"></div>
          <p className="state-desc">Calculating performance appraisal metrics...</p>
        </div>
      )}

      {error && !loading && (
        <div className="state-container">
          <AlertTriangle size={36} color="#dc2626" className="state-icon" />
          <h3 className="state-title">Appraisal Calculation Error</h3>
          <p className="state-desc">{error}</p>
        </div>
      )}

      {!loading && !error && appraisalData && (
        <>
          {/* Appraisal Hero Profile Card */}
          <div className="appraisal-hero">
            <div>
              <span className="brand-badge" style={{ background: 'rgba(96, 165, 250, 0.25)', color: '#93c5fd' }}>
                Academic Year Performance Appraisal
              </span>
              <h2 className="appraisal-faculty-name">{appraisalData.faculty.name}</h2>
              <div className="appraisal-faculty-meta">
                <span>{appraisalData.faculty.designation}</span>
                <span>•</span>
                <span>{appraisalData.faculty.department}</span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Mail size={13} />
                  {appraisalData.faculty.email}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={13} />
                  Joined {appraisalData.faculty.joining_date}
                </span>
              </div>
            </div>

            <div className="appraisal-score-box">
              <div className="appraisal-total-val">{Math.round(appraisalData.total_score)}</div>
              <div className="appraisal-score-label">Total Performance Score</div>
              <div className={`appraisal-grade-badge ${getGradeClass(appraisalData.total_score)}`}>
                {appraisalData.performance_rating}
              </div>
            </div>
          </div>

          {/* Formula Explanation Card */}
          <div className="formula-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontWeight: 700 }}>
              <Info size={16} color="var(--primary)" />
              <span>Calculation Formula & Scoring Methodology</span>
            </div>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              {appraisalData.calculation_summary}
            </p>
          </div>

          {/* Category Breakdown Score Cards */}
          <div className="summary-grid" style={{ marginBottom: 28 }}>
            {appraisalData.score_breakdown.map((item) => {
              const Icon = categoryIcons[item.category] || Award;
              const theme = categoryThemes[item.category] || 'cat-faculty';
              return (
                <div key={item.category} className="card summary-card">
                  <div className="summary-card-top">
                    <div>
                      <div className="summary-card-label" style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {item.category}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {item.multiplier_label}
                      </div>
                    </div>
                    <div className={`summary-card-icon ${theme}`}>
                      <Icon size={18} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                    <span className="summary-card-val" style={{ color: 'var(--primary)' }}>
                      {Math.round(item.subtotal_score)}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                      pts ({item.count} recorded)
                    </span>
                  </div>

                  <div className="summary-card-subtext" style={{ fontSize: 11, marginTop: 8 }}>
                    {item.notes}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Activity Contributions Table */}
          <div className="card">
            <div className="section-header">
              <h3 className="section-title">
                <CheckCircle2 size={18} color="#16a34a" />
                <span>Contributing Activities Portfolio ({appraisalData.activities.length} Total)</span>
              </h3>
            </div>

            {appraisalData.activities.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '16px 0' }}>
                No activities have been recorded for this faculty member yet.
              </p>
            ) : (
              <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Activity Title</th>
                      <th>Year / Period</th>
                      <th>Metric / Organization</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appraisalData.activities.map((act) => {
                      const catClass = `badge-${act.category.toLowerCase()}`;
                      const statusClass = `badge-status-${act.status.toLowerCase().replace(/\s+/g, '-')}`;
                      return (
                        <tr key={act.id}>
                          <td>
                            <span className={`badge ${catClass}`}>
                              {act.category}
                            </span>
                          </td>
                          <td style={{ maxWidth: 380 }}>
                            <div style={{ fontWeight: 600 }}>{act.title}</div>
                            {act.description && (
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                {act.description}
                              </div>
                            )}
                          </td>
                          <td>{act.date_or_period || act.year}</td>
                          <td>
                            {act.category === 'Consultancy' && act.metric_value > 0 ? (
                              <div style={{ fontWeight: 700, color: '#c2410c' }}>
                                ₹ {Number(act.metric_value).toLocaleString('en-IN')}
                              </div>
                            ) : act.category === 'Teaching' ? (
                              <div style={{ fontWeight: 600, color: '#1d4ed8' }}>
                                {act.metric_value} hrs/wk
                              </div>
                            ) : null}
                            {act.publisher_or_organization && (
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {act.publisher_or_organization}
                              </div>
                            )}
                          </td>
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
        </>
      )}
    </div>
  );
}
