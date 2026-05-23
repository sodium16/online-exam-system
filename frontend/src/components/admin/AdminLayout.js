import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to:'/admin',             icon:'⊞', label:'Dashboard',   exact:true },
  { to:'/admin/exams',       icon:'📝', label:'Exams & Questions' },
  { to:'/admin/students',    icon:'👥', label:'Students' },
  { to:'/admin/departments', icon:'🏛️', label:'Departments' },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="layout">
      <aside className="sidebar" style={{ background:'#0d1117', borderRight:'1px solid #1a2332' }}>
        {/* Brand */}
        <div className="sidebar-logo" style={{ borderBottom:'1px solid #1a2332' }}>
          <span style={{ color:'#6366f1' }}>Exam</span><span>Portal</span>
          <div style={{ fontSize:'0.65rem', color:'#6366f1', fontWeight:700, textTransform:'uppercase',
            letterSpacing:'0.1em', marginTop:4 }}>🛡️ Admin Console</div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ to, icon, label, exact }) => (
            <NavLink key={to} to={to} end={exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              style={({ isActive }) => isActive ? { borderLeft:'3px solid #6366f1' } : {}}>
              {icon} {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding:'16px 20px', borderTop:'1px solid #1a2332' }}>
          <div style={{ fontSize:'0.7rem', color:'var(--muted)', marginBottom:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>Logged in as</div>
          <div style={{ fontSize:'0.875rem', fontWeight:600, marginBottom:4 }}>{admin?.full_name}</div>
          <div style={{ marginBottom:12 }}><span className="badge" style={{ background:'rgba(99,102,241,0.15)', color:'#6366f1', fontSize:'0.7rem' }}>Administrator</span></div>
          <button className="nav-item" onClick={() => { logout(); navigate('/admin/login'); }}
            style={{ color:'var(--red)', paddingLeft:0 }}>→ Logout</button>
        </div>
      </aside>

      <main className="main-content"><Outlet /></main>
    </div>
  );
}
