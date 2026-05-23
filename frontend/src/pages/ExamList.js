import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ExamList() {
  const [exams, setExams]       = useState([]);
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [e, h] = await Promise.all([
          axios.get('/api/exams'),
          axios.get('/api/scores/history'),
        ]);
        setExams(e.data);
        setHistory(h.data);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const attemptedIds = new Set(history.map(h => h.exam_id));

  const filtered = exams.filter(e => {
    if (filter === 'pending')   return !attemptedIds.has(e.exam_id);
    if (filter === 'completed') return attemptedIds.has(e.exam_id);
    return true;
  });

  if (loading) return <div className="loading">Loading exams...</div>;

  const tabStyle = (tab) => ({
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
    fontFamily: 'Space Grotesk, sans-serif',
    background: filter === tab ? 'var(--accent)' : 'var(--surface2)',
    color: filter === tab ? 'white' : 'var(--muted)',
    transition: 'all 0.15s',
  });

  return (
    <div>
      <h1 className="page-title">Question Bank & Exams</h1>
      <p className="page-sub">Select an exam to begin. Each exam can only be attempted once.</p>

      <div className="flex gap-2 mb-6">
        <button style={tabStyle('all')}       onClick={() => setFilter('all')}>All ({exams.length})</button>
        <button style={tabStyle('pending')}   onClick={() => setFilter('pending')}>Pending ({exams.length - attemptedIds.size})</button>
        <button style={tabStyle('completed')} onClick={() => setFilter('completed')}>Completed ({attemptedIds.size})</button>
      </div>

      {filtered.length === 0
        ? <div className="card text-center" style={{ color: 'var(--muted)' }}>No exams found.</div>
        : <div className="card-grid">
            {filtered.map(ex => {
              const done = attemptedIds.has(ex.exam_id);
              const result = history.find(h => h.exam_id === ex.exam_id);
              return (
                <div key={ex.exam_id} className="exam-card">
                  <div className="subject-tag">{ex.subject}</div>
                  <h3>{ex.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>
                    {ex.description || 'No description provided.'}
                  </p>
                  <div className="meta">
                    <span>⏱ {ex.duration_min} min</span>
                    <span>📝 {ex.question_count} questions</span>
                    <span>🎯 {ex.pass_marks}/{ex.total_marks} to pass</span>
                  </div>
                  {done
                    ? <div className="flex gap-2">
                        <span className={`badge ${result?.passed ? 'badge-green' : 'badge-red'}`}>
                          {result?.passed ? '✓ Passed' : '✗ Failed'} · {parseFloat(result?.percentage || 0).toFixed(1)}%
                        </span>
                        <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '4px 10px', marginLeft: 'auto' }}
                          onClick={() => navigate(`/result/${ex.exam_id}`)}>View Result</button>
                      </div>
                    : <button className="btn btn-primary" style={{ width: '100%' }}
                        onClick={() => navigate(`/exams/${ex.exam_id}`)}>
                        Start Exam →
                      </button>
                  }
                </div>
              );
            })}
          </div>
      }
    </div>
  );
}
