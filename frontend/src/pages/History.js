import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/scores/history')
      .then(r => setHistory(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading history...</div>;

  const totalExams  = history.length;
  const passed      = history.filter(h => h.passed).length;
  const avgPct      = totalExams ? (history.reduce((s, h) => s + parseFloat(h.percentage), 0) / totalExams).toFixed(1) : 0;

  return (
    <div>
      <h1 className="page-title">Attempt History</h1>
      <p className="page-sub">All your exam attempts via stored procedure <code style={{ fontSize: '0.75rem', background: 'var(--surface2)', padding: '2px 6px', borderRadius: 4 }}>sp_get_attempt_history</code></p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card"><div className="label">Total Attempts</div><div className="value">{totalExams}</div></div>
        <div className="stat-card"><div className="label">Pass Rate</div><div className="value" style={{ color: 'var(--green)' }}>{totalExams ? Math.round((passed/totalExams)*100) : 0}%</div></div>
        <div className="stat-card"><div className="label">Average Score</div><div className="value">{avgPct}%</div></div>
      </div>

      {history.length === 0
        ? <div className="card text-center" style={{ color: 'var(--muted)', padding: 48 }}>No exams attempted yet. <br/><button className="btn btn-primary mt-4" onClick={() => navigate('/exams')}>Browse Exams</button></div>
        : <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Exam</th>
                    <th>Subject</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Grade</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={h.exam_id}>
                      <td style={{ color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{h.exam_title}</td>
                      <td><span className="badge badge-blue">{h.subject}</span></td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{h.total_score}/{h.total_marks}</td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                        color: parseFloat(h.percentage) >= 50 ? 'var(--green)' : 'var(--red)' }}>
                        {parseFloat(h.percentage).toFixed(1)}%
                      </td>
                      <td><span className="badge badge-yellow">{h.grade}</span></td>
                      <td><span className={`badge ${h.passed ? 'badge-green' : 'badge-red'}`}>{h.passed ? 'Passed' : 'Failed'}</span></td>
                      <td style={{ color: 'var(--muted)' }}>{h.time_taken_min}m</td>
                      <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                        {new Date(h.submitted_at).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                          onClick={() => navigate(`/result/${h.exam_id}`)}>
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      }
    </div>
  );
}
