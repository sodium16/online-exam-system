import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate            = useNavigate();

  useEffect(() => {
    axios.get('/api/admin/overview').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const { stats, recentExams, recentStudents } = data || {};

  const statCards = [
    { label:'Total Students',  value: stats?.total_students,   color:'var(--accent)',  icon:'👥' },
    { label:'Active Exams',    value: stats?.total_exams,      color:'var(--green)',   icon:'📝' },
    { label:'Questions',       value: stats?.total_questions,  color:'var(--yellow)',  icon:'❓' },
    { label:'Attempts',        value: stats?.total_attempts,   color:'#6366f1',        icon:'✍️' },
    { label:'Avg Score',       value: `${stats?.overall_avg_pct || 0}%`, color:'var(--accent)', icon:'📊' },
    { label:'Departments',     value: stats?.total_departments, color:'var(--muted)',  icon:'🏛️' },
  ];

  const ttStyle = { background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, fontSize:'0.8rem' };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 className="page-title">Admin Dashboard</h1>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => navigate('/admin/exams')}>+ New Exam</button>
        </div>
      </div>
      <p className="page-sub">System overview — via stored procedure <code style={{ fontSize:'0.7rem', background:'var(--surface2)', padding:'2px 6px', borderRadius:4 }}>sp_admin_overview</code></p>

      {/* Stats grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12, marginBottom:28 }}>
        {statCards.map(s => (
          <div key={s.label} className="stat-card" style={{ padding:16 }}>
            <div style={{ fontSize:'1.2rem', marginBottom:4 }}>{s.icon}</div>
            <div className="value" style={{ fontSize:'1.5rem', color:s.color }}>{s.value ?? '—'}</div>
            <div className="label" style={{ fontSize:'0.65rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        {/* Recent Exams */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 style={{ fontSize:'0.9rem', fontWeight:600 }}>Recent Exams</h2>
            <button className="btn btn-secondary" style={{ fontSize:'0.75rem', padding:'5px 10px' }}
              onClick={() => navigate('/admin/exams')}>Manage all</button>
          </div>
          {(recentExams || []).map(ex => (
            <div key={ex.exam_id} className="flex justify-between items-center"
              style={{ padding:'10px 0', borderBottom:'1px solid var(--border)', cursor:'pointer' }}
              onClick={() => navigate(`/admin/exams/${ex.exam_id}`)}>
              <div>
                <div style={{ fontSize:'0.875rem', fontWeight:500 }}>{ex.title}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--muted)' }}>
                  {ex.dept_name || 'All Departments'} · {ex.question_count}Q · {ex.total_marks} marks
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <span style={{ fontSize:'0.75rem', color:'var(--muted)' }}>{ex.attempt_count} attempts</span>
                <span className={`badge ${ex.is_active ? 'badge-green' : 'badge-red'}`}>
                  {ex.is_active ? 'Live' : 'Off'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Students */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 style={{ fontSize:'0.9rem', fontWeight:600 }}>Recent Registrations</h2>
            <button className="btn btn-secondary" style={{ fontSize:'0.75rem', padding:'5px 10px' }}
              onClick={() => navigate('/admin/students')}>View all</button>
          </div>
          {(recentStudents || []).map(st => (
            <div key={st.student_id} className="flex justify-between items-center"
              style={{ padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize:'0.875rem', fontWeight:500 }}>{st.full_name}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--muted)' }}>{st.roll_number} · {st.dept_name}</div>
              </div>
              <div style={{ fontSize:'0.75rem', color:'var(--muted)' }}>
                {new Date(st.created_at).toLocaleDateString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
