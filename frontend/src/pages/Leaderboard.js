import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const { examId } = useParams();
  const navigate   = useNavigate();
  const { student } = useAuth();
  const [board, setBoard]   = useState([]);
  const [overall, setOverall] = useState([]);
  const [tab, setTab]       = useState('exam');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [b, o] = await Promise.all([
          axios.get(`/api/scores/leaderboard/${examId}?limit=20`),
          axios.get('/api/scores/top-overall?limit=20'),
        ]);
        setBoard(b.data);
        setOverall(o.data);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, [examId]);

  if (loading) return <div className="loading">Loading leaderboard...</div>;

  const tabStyle = (t) => ({
    padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: '0.875rem', fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif',
    background: tab === t ? 'var(--accent)' : 'var(--surface2)',
    color: tab === t ? 'white' : 'var(--muted)', transition: 'all 0.15s',
  });

  const renderRow = (row, i, cols) => {
    const isMe = row.student_id === student?.student_id;
    return (
      <tr key={row.student_id} style={isMe ? { background: 'rgba(59,130,246,0.08)' } : {}}>
        <td>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
            color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : 'var(--muted)' }}>
            {i < 3 ? MEDALS[i] : `#${i + 1}`}
          </span>
        </td>
        <td>
          <div style={{ fontWeight: isMe ? 700 : 500, color: isMe ? 'var(--accent)' : 'var(--text)' }}>
            {row.full_name} {isMe && <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>(You)</span>}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{row.roll_number}</div>
        </td>
        <td><span className="badge badge-blue">{row.branch}</span></td>
        {cols}
      </tr>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 className="page-title">🏆 Leaderboard</h1>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
      </div>
      <p className="page-sub">Rankings via stored procedures <code style={{ fontSize: '0.75rem', background: 'var(--surface2)', padding: '2px 6px', borderRadius: 4 }}>sp_get_leaderboard</code> & <code style={{ fontSize: '0.75rem', background: 'var(--surface2)', padding: '2px 6px', borderRadius: 4 }}>sp_top_scorers_overall</code></p>

      <div className="flex gap-2 mb-6">
        <button style={tabStyle('exam')}    onClick={() => setTab('exam')}>This Exam</button>
        <button style={tabStyle('overall')} onClick={() => setTab('overall')}>Overall Rankings</button>
      </div>

      {tab === 'exam' ? (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rank</th><th>Student</th><th>Branch</th>
                  <th>Score</th><th>Percentage</th><th>Grade</th>
                  <th>Correct</th><th>Time</th>
                </tr>
              </thead>
              <tbody>
                {board.map((row, i) => renderRow(row, i, <>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{row.total_score}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', color: parseFloat(row.percentage) >= 50 ? 'var(--green)' : 'var(--red)' }}>
                    {parseFloat(row.percentage).toFixed(1)}%
                  </td>
                  <td><span className="badge badge-yellow">{row.grade}</span></td>
                  <td>{row.total_correct}</td>
                  <td style={{ color: 'var(--muted)' }}>{row.time_taken_min}m</td>
                </>))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rank</th><th>Student</th><th>Branch</th>
                  <th>Exams</th><th>Avg %</th><th>Total Score</th><th>Passed</th>
                </tr>
              </thead>
              <tbody>
                {overall.map((row, i) => renderRow(row, i, <>
                  <td>{row.exams_attempted}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                    color: parseFloat(row.avg_percentage) >= 50 ? 'var(--green)' : 'var(--red)' }}>
                    {row.avg_percentage}%
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{row.cumulative_score}</td>
                  <td><span className="badge badge-green">{row.exams_passed}</span></td>
                </>))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
