import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  BookOpen,
  Calendar,
  Building,
  GraduationCap
} from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';

export default function ActivitiesPage({ preselectedFacultyId = null, showToast }) {
  const [activities, setActivities] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState(preselectedFacultyId ? String(preselectedFacultyId) : '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityToDelete, setActivityToDelete] = useState(null);

  // Form input state
  const initialFormData = {
    faculty_id: '',
    title: '',
    category: 'Teaching',
    year: new Date().getFullYear(),
    date_or_period: '',
    status: 'Completed',
    description: '',
    metric_value: 4.0,
    publisher_or_organization: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const categories = ['Teaching', 'Publication', 'FDP', 'Consultancy', 'Patent'];
  const years = [2026, 2025, 2024, 2023, 2022];

  // Dynamic helper metadata for selected category
  const categoryMeta = {
    Teaching: {
      metricLabel: 'Contact Hours/Week',
      metricPlaceholder: '4',
      orgLabel: 'Department / Academic Unit',
      orgPlaceholder: 'Dept. of Computer Science',
      periodPlaceholder: 'e.g. Semester 1 (Aug - Dec 2025)',
      statusOptions: ['Completed', 'Ongoing', 'Scheduled'],
      defaultStatus: 'Completed',
    },
    Publication: {
      metricLabel: 'Impact Factor / Citations (optional)',
      metricPlaceholder: '1.0',
      orgLabel: 'Journal / Conference / Publisher',
      orgPlaceholder: 'e.g. IEEE Transactions on Software Engineering',
      periodPlaceholder: 'e.g. March 2025',
      statusOptions: ['Published', 'Accepted', 'Under Review', 'Submitted'],
      defaultStatus: 'Published',
    },
    FDP: {
      metricLabel: 'Training Duration (Hours)',
      metricPlaceholder: '40',
      orgLabel: 'Organizing Institution / Agency',
      orgPlaceholder: 'e.g. IIT Madras & AICTE ATAL Academy',
      periodPlaceholder: 'e.g. June 10 - June 15, 2025',
      statusOptions: ['Completed', 'Attended', 'Ongoing'],
      defaultStatus: 'Completed',
    },
    Consultancy: {
      metricLabel: 'Grant / Funding Amount (₹)',
      metricPlaceholder: '350000',
      orgLabel: 'Client / Funding Agency',
      orgPlaceholder: 'e.g. Bosch IoT Solutions',
      periodPlaceholder: 'e.g. Jan - Aug 2025',
      statusOptions: ['Completed', 'Ongoing', 'Sanctioned', 'Proposed'],
      defaultStatus: 'Completed',
    },
    Patent: {
      metricLabel: 'Claims Count (optional)',
      metricPlaceholder: '1',
      orgLabel: 'Patent Office / Application Number',
      orgPlaceholder: 'e.g. Indian Patent Office (App: 202541001289)',
      periodPlaceholder: 'e.g. Filed: Jan 2026',
      statusOptions: ['Granted', 'Published', 'Filed', 'Under Review'],
      defaultStatus: 'Filed',
    },
  };

  // Load faculty dropdown options
  useEffect(() => {
    const loadFaculty = async () => {
      try {
        const facs = await api.getFaculty();
        setFacultyList(facs);
        if (facs.length > 0 && !formData.faculty_id) {
          setFormData((prev) => ({ ...prev, faculty_id: facs[0].id }));
        }
      } catch (err) {
        console.error('Failed to load faculty list for dropdown:', err);
      }
    };
    loadFaculty();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getActivities({
        search: searchQuery,
        faculty_id: selectedFaculty || undefined,
        category: selectedCategory || undefined,
        year: selectedYear ? Number(selectedYear) : undefined,
        status: selectedStatus || undefined,
      });
      setActivities(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch academic activities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchActivities();
    }, 250);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedFaculty, selectedCategory, selectedYear, selectedStatus]);

  const handleOpenAddModal = () => {
    setEditingActivity(null);
    setFormData({
      ...initialFormData,
      faculty_id: facultyList.length > 0 ? facultyList[0].id : '',
      category: 'Teaching',
      status: 'Completed',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (act) => {
    setEditingActivity(act);
    setFormData({
      faculty_id: act.faculty_id,
      title: act.title,
      category: act.category,
      year: act.year,
      date_or_period: act.date_or_period || '',
      status: act.status,
      description: act.description || '',
      metric_value: act.metric_value || 0,
      publisher_or_organization: act.publisher_or_organization || '',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (act) => {
    setActivityToDelete(act);
    setIsDeleteModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.faculty_id) {
      errors.faculty_id = 'Please select a faculty member.';
    }
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters.';
    }
    if (!formData.category) {
      errors.category = 'Category is required.';
    }
    if (!formData.year || isNaN(formData.year) || formData.year < 1990 || formData.year > 2050) {
      errors.year = 'Please enter a valid academic year (1990 - 2050).';
    }
    if (!formData.status) {
      errors.status = 'Status is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        faculty_id: Number(formData.faculty_id),
        year: Number(formData.year),
        metric_value: Number(formData.metric_value) || 0,
      };

      if (editingActivity) {
        await api.updateActivity(editingActivity.id, payload);
        showToast(`Activity "${formData.title}" updated successfully.`);
      } else {
        await api.createActivity(payload);
        showToast(`Activity "${formData.title}" recorded successfully.`);
      }

      setIsFormModalOpen(false);
      fetchActivities();
    } catch (err) {
      setFormErrors({ submit: err.message || 'Operation failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!activityToDelete) return;
    try {
      setSubmitting(true);
      await api.deleteActivity(activityToDelete.id);
      showToast(`Activity "${activityToDelete.title}" deleted.`);
      setIsDeleteModalOpen(false);
      setActivityToDelete(null);
      fetchActivities();
    } catch (err) {
      showToast(err.message || 'Failed to delete activity.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const currentMeta = categoryMeta[formData.category] || categoryMeta.Teaching;

  return (
    <div>
      {/* Filtering Toolbar */}
      <div className="filter-bar">
        <div className="filter-inputs">
          <div className="search-input-wrap">
            <Search size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by title, publisher, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Faculty filter */}
          <select
            className="select-input"
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
          >
            <option value="">All Faculty Members</option>
            {facultyList.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>

          {/* Category filter */}
          <select
            className="select-input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Year filter */}
          <select
            className="select-input"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ minWidth: 100 }}
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={16} />
          <span>Add Activity Record</span>
        </button>
      </div>

      {/* States */}
      {loading && (
        <div className="state-container">
          <div className="loading-spinner"></div>
          <p className="state-desc">Loading activity records...</p>
        </div>
      )}

      {error && !loading && (
        <div className="state-container">
          <AlertTriangle size={36} color="#dc2626" className="state-icon" />
          <h3 className="state-title">Error Loading Activities</h3>
          <p className="state-desc">{error}</p>
          <button className="btn btn-primary" onClick={fetchActivities}>Retry</button>
        </div>
      )}

      {!loading && !error && activities.length === 0 && (
        <div className="state-container">
          <BookOpen size={40} className="state-icon" />
          <h3 className="state-title">No Activities Found</h3>
          <p className="state-desc">
            {searchQuery || selectedFaculty || selectedCategory || selectedYear
              ? 'No activities match your current filter settings.'
              : 'Start logging teaching workloads, publications, FDPs, consultancy, or patents.'}
          </p>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={16} />
            <span>Add First Activity</span>
          </button>
        </div>
      )}

      {/* Activities Table */}
      {!loading && !error && activities.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Activity Title & Details</th>
                <th>Faculty Member</th>
                <th>Year / Period</th>
                <th>Metric / Organization</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((act) => {
                const catClass = `badge-${act.category.toLowerCase()}`;
                const statusClass = `badge-status-${act.status.toLowerCase().replace(/\s+/g, '-')}`;
                return (
                  <tr key={act.id}>
                    <td>
                      <span className={`badge ${catClass}`}>
                        {act.category}
                      </span>
                    </td>
                    <td style={{ maxWidth: 360 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>
                        {act.title}
                      </div>
                      {act.description && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {act.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        {act.faculty_name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {act.faculty_department}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{act.year}</span>
                      {act.date_or_period && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {act.date_or_period}
                        </div>
                      )}
                    </td>
                    <td>
                      {act.category === 'Consultancy' && act.metric_value > 0 ? (
                        <div style={{ fontWeight: 700, color: '#c2410c' }}>
                          ₹ {Number(act.metric_value).toLocaleString('en-IN')}
                        </div>
                      ) : act.category === 'Teaching' ? (
                        <div style={{ fontWeight: 600, color: '#1d4ed8' }}>
                          {act.metric_value} hrs/wk
                        </div>
                      ) : act.category === 'FDP' ? (
                        <div style={{ fontWeight: 600, color: '#15803d' }}>
                          {act.metric_value} training hrs
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
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          onClick={() => handleOpenEditModal(act)}
                          title="Edit Activity"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon"
                          onClick={() => handleOpenDeleteModal(act)}
                          title="Delete Activity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Activity Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !submitting && setIsFormModalOpen(false)}
        title={editingActivity ? 'Edit Academic Activity Record' : 'Record New Academic Activity'}
        maxWidth="640px"
      >
        <form onSubmit={handleSubmitForm}>
          {formErrors.submit && (
            <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
              {formErrors.submit}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Faculty Member <span className="required">*</span>
              </label>
              <select
                className="form-control"
                value={formData.faculty_id}
                onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
              >
                <option value="">Select Faculty...</option>
                {facultyList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.department})
                  </option>
                ))}
              </select>
              {formErrors.faculty_id && <div className="form-error">{formErrors.faculty_id}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Activity Category <span className="required">*</span>
              </label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  const newMeta = categoryMeta[newCat] || categoryMeta.Teaching;
                  setFormData({
                    ...formData,
                    category: newCat,
                    status: newMeta.defaultStatus,
                  });
                }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {formErrors.category && <div className="form-error">{formErrors.category}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Activity Title <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Advanced Database Systems (CS601) or Research Paper Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            {formErrors.title && <div className="form-error">{formErrors.title}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Academic Year <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                min="1990"
                max="2050"
              />
              {formErrors.year && <div className="form-error">{formErrors.year}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Status <span className="required">*</span>
              </label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {currentMeta.statusOptions.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Date / Duration / Period
              </label>
              <input
                type="text"
                className="form-control"
                placeholder={currentMeta.periodPlaceholder}
                value={formData.date_or_period}
                onChange={(e) => setFormData({ ...formData, date_or_period: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {currentMeta.metricLabel}
              </label>
              <input
                type="number"
                step="any"
                className="form-control"
                placeholder={currentMeta.metricPlaceholder}
                value={formData.metric_value}
                onChange={(e) => setFormData({ ...formData, metric_value: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              {currentMeta.orgLabel}
            </label>
            <input
              type="text"
              className="form-control"
              placeholder={currentMeta.orgPlaceholder}
              value={formData.publisher_or_organization}
              onChange={(e) => setFormData({ ...formData, publisher_or_organization: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Summary</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Provide a brief summary, abstract, or relevant notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px -24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsFormModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : editingActivity ? 'Save Changes' : 'Record Activity'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !submitting && setIsDeleteModalOpen(false)}
        title="Confirm Activity Deletion"
        maxWidth="460px"
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <AlertTriangle size={44} color="#dc2626" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 8 }}>
            Delete this activity record?
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            "{activityToDelete?.title}" will be permanently removed.
          </p>
        </div>

        <div className="modal-footer" style={{ margin: '20px -24px -24px -24px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirmDelete}
            disabled={submitting}
          >
            {submitting ? 'Deleting...' : 'Yes, Delete Record'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
