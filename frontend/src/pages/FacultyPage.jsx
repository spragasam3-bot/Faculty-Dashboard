import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Award,
  AlertTriangle,
  Mail,
  Calendar,
  Building,
  GraduationCap
} from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';

export default function FacultyPage({ onSelectFacultyForAppraisal, showToast }) {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [facultyToDelete, setFacultyToDelete] = useState(null);

  // Form input state
  const initialFormData = {
    name: '',
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    email: '',
    joining_date: new Date().toISOString().split('T')[0],
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const departments = [
    'Computer Science & Engineering',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Information Technology',
    'Civil Engineering',
    'Electrical & Electronics',
    'Management Studies'
  ];

  const designations = [
    'Professor & HOD',
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Adjunct Faculty',
    'Lecturer'
  ];

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getFaculty({
        q: searchQuery,
        department: selectedDept,
      });
      setFacultyList(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch faculty list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchFaculty();
    }, 250);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedDept]);

  const handleOpenAddModal = () => {
    setEditingFaculty(null);
    setFormData(initialFormData);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.name,
      department: faculty.department,
      designation: faculty.designation,
      email: faculty.email,
      joining_date: faculty.joining_date,
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (faculty) => {
    setFacultyToDelete(faculty);
    setIsDeleteModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters.';
    }
    if (!formData.department.trim()) {
      errors.department = 'Department is required.';
    }
    if (!formData.designation.trim()) {
      errors.designation = 'Designation is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
    if (!formData.joining_date) {
      errors.joining_date = 'Joining date is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (editingFaculty) {
        await api.updateFaculty(editingFaculty.id, formData);
        showToast(`Faculty member "${formData.name}" updated successfully.`);
      } else {
        await api.createFaculty(formData);
        showToast(`Faculty member "${formData.name}" added successfully.`);
      }
      setIsFormModalOpen(false);
      fetchFaculty();
    } catch (err) {
      setFormErrors({ submit: err.message || 'Operation failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!facultyToDelete) return;
    try {
      setSubmitting(true);
      await api.deleteFaculty(facultyToDelete.id);
      showToast(`Faculty member "${facultyToDelete.name}" and all records removed.`);
      setIsDeleteModalOpen(false);
      setFacultyToDelete(null);
      fetchFaculty();
    } catch (err) {
      showToast(err.message || 'Failed to delete faculty member.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="filter-bar">
        <div className="filter-inputs">
          <div className="search-input-wrap">
            <Search size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="Search faculty by name, email, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="select-input"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={16} />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Main Content / Table */}
      {loading && (
        <div className="state-container">
          <div className="loading-spinner"></div>
          <p className="state-desc">Loading faculty directory...</p>
        </div>
      )}

      {error && !loading && (
        <div className="state-container">
          <AlertTriangle size={36} color="#dc2626" className="state-icon" />
          <h3 className="state-title">Error Loading Faculty</h3>
          <p className="state-desc">{error}</p>
          <button className="btn btn-primary" onClick={fetchFaculty}>Retry</button>
        </div>
      )}

      {!loading && !error && facultyList.length === 0 && (
        <div className="state-container">
          <GraduationCap size={40} className="state-icon" />
          <h3 className="state-title">No Faculty Members Found</h3>
          <p className="state-desc">
            {searchQuery || selectedDept
              ? 'No faculty matched your filter criteria. Try clearing your filters.'
              : 'Get started by registering your first faculty member.'}
          </p>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={16} />
            <span>Add First Faculty</span>
          </button>
        </div>
      )}

      {!loading && !error && facultyList.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Faculty Name</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Email Address</th>
                <th>Joining Date</th>
                <th>Activities</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.map((faculty) => (
                <tr key={faculty.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {faculty.name}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>
                      {faculty.designation}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
                      <Building size={12} style={{ marginRight: 4 }} />
                      {faculty.department}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                      <Mail size={14} color="#94a3b8" />
                      {faculty.email}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                      <Calendar size={14} color="#94a3b8" />
                      {faculty.joining_date}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-teaching" style={{ fontWeight: 700 }}>
                      {faculty.activity_count} records
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onSelectFacultyForAppraisal(faculty.id)}
                        title="View Appraisal Score"
                      >
                        <Award size={14} color="#7c3aed" />
                        <span>Appraisal</span>
                      </button>
                      <button
                        className="btn btn-secondary btn-icon"
                        onClick={() => handleOpenEditModal(faculty)}
                        title="Edit Faculty"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-icon"
                        onClick={() => handleOpenDeleteModal(faculty)}
                        title="Delete Faculty"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Faculty Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !submitting && setIsFormModalOpen(false)}
        title={editingFaculty ? 'Edit Faculty Details' : 'Add New Faculty Member'}
      >
        <form onSubmit={handleSubmitForm}>
          {formErrors.submit && (
            <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
              {formErrors.submit}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Dr. Rajesh Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {formErrors.name && <div className="form-error">{formErrors.name}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Department <span className="required">*</span>
              </label>
              <select
                className="form-control"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {formErrors.department && <div className="form-error">{formErrors.department}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Designation <span className="required">*</span>
              </label>
              <select
                className="form-control"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              >
                {designations.map((desig) => (
                  <option key={desig} value={desig}>{desig}</option>
                ))}
              </select>
              {formErrors.designation && <div className="form-error">{formErrors.designation}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Institutional Email <span className="required">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="name@university.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {formErrors.email && <div className="form-error">{formErrors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Joining Date <span className="required">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={formData.joining_date}
                onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
              />
              {formErrors.joining_date && <div className="form-error">{formErrors.joining_date}</div>}
            </div>
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
              {submitting ? 'Saving...' : editingFaculty ? 'Save Changes' : 'Create Faculty'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !submitting && setIsDeleteModalOpen(false)}
        title="Confirm Faculty Removal"
        maxWidth="460px"
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <AlertTriangle size={44} color="#dc2626" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 8 }}>
            Delete {facultyToDelete?.name}?
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            This will permanently delete this faculty member along with all associated teaching, publication, FDP, consultancy, and patent records.
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
