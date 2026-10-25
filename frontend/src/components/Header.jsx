import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function Header({ title, subtitle, actionButton, user, onSignOut }) {
  return (
    <header className="top-header">
      <div className="page-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="header-right-section">
        {actionButton && <div className="header-actions">{actionButton}</div>}

        {user && (
          <div className="header-user-profile">
            <div className="user-avatar" title={user.email}>
              <UserIcon size={16} />
            </div>
            <div className="user-info-text">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role || 'Administrator'}</span>
            </div>
            {onSignOut && (
              <button
                type="button"
                className="btn btn-secondary btn-sm sign-out-btn"
                onClick={onSignOut}
                title="Sign out of FacultyHub"
                id="header-signout-btn"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
