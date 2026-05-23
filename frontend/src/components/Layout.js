import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const icons = {
  dashboard:   '⊞',
  exams:       '📝',
  history:     '🕐',
  reports:     '📊',
  logout:      '→',
};

export default function Layout() {
  const { student, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          Exam<span>Portal</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {icons.dashboard} Dashboard
          </NavLink>
          <NavLink to="/exams" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {icons.exams} Exams
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {icons.history} My History
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {icons.reports} Reports
          </NavLink>
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 4 }}>Signed in as</div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {student?.full_name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 12 }}>
            {student?.roll_number} · Sem {student?.semester}
          </div>
          <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--red)', paddingLeft: 0 }}>
            {icons.logout} Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
