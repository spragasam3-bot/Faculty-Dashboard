import React from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  GraduationCap,
  LogOut,
  UserCheck
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onSignOut }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'faculty', label: 'Faculty Members', icon: Users },
    { id: 'activities', label: 'Academic Activities', icon: BookOpen },
    { id: 'appraisal', label: 'Faculty Appraisal', icon: Award },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="brand-badge">Institutional Portal</span>
        <div className="brand-title">
          <GraduationCap size={24} color="#60a5fa" />
          <span>FacultyHub</span>
        </div>
        <p className="brand-subtitle">Performance & Activity System</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Authenticated user section in sidebar */}
      {user && (
        <div className="sidebar-user-section">
          <div className="sidebar-user-info">
            <div className="sidebar-user-icon">
              <UserCheck size={16} />
            </div>
            <div className="sidebar-user-text">
              <p className="sidebar-user-name">{user.name}</p>
              <p className="sidebar-user-email">{user.email}</p>
            </div>
          </div>
          {onSignOut && (
            <button
              type="button"
              className="sidebar-signout-btn"
              onClick={onSignOut}
              title="Sign Out"
              id="sidebar-signout-btn"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      )}

      <div className="sidebar-footer">
        <div>
          <span className="status-dot"></span>
          <span>FastAPI + SQLite</span>
        </div>
        <span style={{ color: '#94a3b8' }}>v1.0</span>
      </div>
    </aside>
  );
}
