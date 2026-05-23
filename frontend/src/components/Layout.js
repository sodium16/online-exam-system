import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { student, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">Exam<span>Portal</span></div>
        <nav className="sidebar-nav">
          {[
            { to:'/dashboard', icon:'⊞', label:'Dashboard' },
            { to:'/exams',     icon:'📝', label:'Exams' },
            { to:'/history',   icon:'🕐', label:'My History' },
            { to:'/reports',   icon:'📊', label:'Reports' },
          ].map(({ to, icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              {icon} {label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding:'16px 20px', borderTop:'1px solid var(--border)' }}>
          <div style={{ fontSize:'0.75rem', color:'var(--muted)', marginBottom:2 }}>Signed in as</div>
          <div style={{ fontSize:'0.875rem', fontWeight:600, marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{student?.full_name}</div>
          <div style={{ fontSize:'0.75rem', color:'var(--muted)', marginBottom:4 }}>{student?.roll_number}</div>
          <div style={{ fontSize:'0.75rem', marginBottom:12 }}>
            <span className="badge badge-blue">{student?.dept_name || student?.dept_code}</span>
            <span style={{ marginLeft:6, color:'var(--muted)' }}>· Sem {student?.semester}</span>
          </div>
          <button className="nav-item" onClick={() => { logout(); navigate('/login'); }} style={{ color:'var(--red)', paddingLeft:0 }}>
            → Logout
          </button>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  );
}
