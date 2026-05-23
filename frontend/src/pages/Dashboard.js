import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { student } = useAuth();
  const navigate    = useNavigate();
  const [history, setHistory]   = useState([]);
  const [exams, setExams]       = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [h, e] = await Promise.all([
          axios.get('/api/scores/history'),
          axios.get('/api/exams'),
        ]);
        setHistory(h.data);
        setExams(e.data);
      } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const totalExams   = history.length;
  const avgPct       = totalExams ? (history.reduce((s, r) => s + parseFloat(r.percentage), 0) / totalExams).toFixed(1) : '—';
  const passed       = history.filter(r => r.passed).length;
  const upcomingExams = exams.filter(e => !history.find(h => h.exam_id === e.exam_id));

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Welcome back, {student?.full_name?.split(' ')[0]} 👋</p>

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
        <div className="stat-card">
          <div className="label">Exams Taken</div>
          <div className="value">{totalExams}</div>
          <div className="sub">total attempts</div>
        </div>
        <div className="stat-card">
          <div className="label">Avg Score</div>
          <div className="value">{avgPct}{totalExams ? '%' : ''}</div>
          <div className="sub">across all exams</div>
        </div>
        <div className="stat-card">
          <div className="label">Passed</div>
          <div className="value" style={{ color: 'var(--green)' }}>{passed}</div>
          <div className="sub">out of {totalExams}</div>
        </div>
        <div className="stat-card">
          <div className="label">Upcoming</div>
          <div className="value" style={{ color: 'var(--yellow)' }}>{upcomingExams.length}</div>
          <div className="sub">exams available</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Available Exams */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Available Exams</h2>
            <button className="btn btn-secondary" onClick={() => navigate('/exams')} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              View all
            </button>
          </div>
          {upcomingExams.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>No new exams available.</p>
            : upcomingExams.slice(0, 4).map(ex => (
              <div key={ex.exam_id} className="flex justify-between items-center"
                style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{ex.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{ex.subject} · {ex.duration_min} min · {ex.question_count}Q</div>
                </div>
                <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '6px 14px' }}
                  onClick={() => navigate(`/exams/${ex.exam_id}`)}>
                  Start
                </button>
              </div>
            ))
          }
        </div>

        {/* Recent Results */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Results</h2>
            <button className="btn btn-secondary" onClick={() => navigate('/history')} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              Full history
            </button>
          </div>
          {history.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>No results yet.</p>
            : history.slice(0, 5).map(r => (
              <div key={r.exam_id} className="flex justify-between items-center"
                style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{r.exam_title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{r.subject}</div>
                </div>
                <div className="flex gap-2 items-center">
                  <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: parseFloat(r.percentage) >= 50 ? 'var(--green)' : 'var(--red)' }}>
                    {parseFloat(r.percentage).toFixed(1)}%
                  </span>
                  <span className={`badge ${r.passed ? 'badge-green' : 'badge-red'}`}>{r.grade}</span>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
