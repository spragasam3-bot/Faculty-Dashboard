import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import DashboardPage from './pages/DashboardPage';
import FacultyPage from './pages/FacultyPage';
import ActivitiesPage from './pages/ActivitiesPage';
import AppraisalPage from './pages/AppraisalPage';
import LoginPage from './pages/LoginPage';
import { api } from './services/api';
import './App.css';

export default function App() {
  const [user, setUser] = useState(() => api.getUser());
  const [token, setToken] = useState(() => api.getToken());
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFacultyId, setSelectedFacultyId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Listen for unauthorized 401 events emitted across the application
  useEffect(() => {
    const handleUnauthorized = (event) => {
      setUser(null);
      setToken(null);
      setSessionExpiredMessage(event.detail?.message || 'Your session has expired. Please sign in again.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Re-verify existing session on initial load
  useEffect(() => {
    if (token) {
      api.getCurrentUser()
        .then((fetchedUser) => {
          setUser(fetchedUser);
          api.setUser(fetchedUser);
        })
        .catch(() => {
          // If token verification fails, 401 interceptor signs user out cleanly
        });
    }
  }, [token]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleLoginSuccess = (userProfile, accessToken) => {
    setUser(userProfile);
    setToken(accessToken);
    setSessionExpiredMessage('');
    setActiveTab('dashboard');
    showToast(`Signed in as ${userProfile.name}`, 'success');
  };

  const handleSignOut = () => {
    api.clearAuth();
    setUser(null);
    setToken(null);
    setSessionExpiredMessage('');
    showToast('Signed out successfully.', 'success');
  };

  const handleSelectFacultyForAppraisal = (facultyId) => {
    setSelectedFacultyId(facultyId);
    setActiveTab('appraisal');
  };

  const tabHeaders = {
    dashboard: {
      title: 'Institutional Performance Dashboard',
      subtitle: 'Comprehensive overview of faculty workload, research, programs, and grants',
    },
    faculty: {
      title: 'Faculty Members Directory',
      subtitle: 'Manage faculty profiles, academic designations, and departmental affiliations',
    },
    activities: {
      title: 'Academic Activities & Records',
      subtitle: 'Track teaching workload, research publications, FDPs, consultancy, and patents',
    },
    appraisal: {
      title: 'Faculty Performance Appraisal',
      subtitle: 'Transparent merit scoring, activity contribution breakdown, and evaluation grades',
    },
  };

  // If user is not authenticated, show the login page
  if (!token || !user) {
    return (
      <>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          sessionExpiredMessage={sessionExpiredMessage}
        />
        {toast.message && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ message: '', type: 'success' })}
          />
        )}
      </>
    );
  }

  const currentHeader = tabHeaders[activeTab] || tabHeaders.dashboard;

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          title={currentHeader.title}
          subtitle={currentHeader.subtitle}
          user={user}
          onSignOut={handleSignOut}
        />

        <main className="content-body">
          {activeTab === 'dashboard' && (
            <DashboardPage
              setActiveTab={setActiveTab}
              onSelectFacultyForAppraisal={handleSelectFacultyForAppraisal}
            />
          )}

          {activeTab === 'faculty' && (
            <FacultyPage
              onSelectFacultyForAppraisal={handleSelectFacultyForAppraisal}
              showToast={showToast}
            />
          )}

          {activeTab === 'activities' && (
            <ActivitiesPage
              preselectedFacultyId={selectedFacultyId}
              showToast={showToast}
            />
          )}

          {activeTab === 'appraisal' && (
            <AppraisalPage
              selectedFacultyId={selectedFacultyId}
              onSelectFaculty={setSelectedFacultyId}
            />
          )}
        </main>
      </div>

      {/* Floating Toast notification */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}
    </div>
  );
}
