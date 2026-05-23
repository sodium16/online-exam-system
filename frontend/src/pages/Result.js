import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function Result() {
  const { examId } = useParams();
  const navigate   = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/scores/result/${examId}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [examId]);

  if (loading) return <div className="loading">Loading result...</div>;
  if (!data)   return <div className="card" style={{ color: 'var(--red)' }}>Result not found.</div>;

  const { result, breakdown } = data;
  const pct = parseFloat(result.percentage).toFixed(1);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Result summary */}
      <div className="card text-center mb-6" style={{ padding: 40 }}>
        <div className="result-circle" style={{ borderColor: result.passed ? 'var(--green)' : 'var(--red)' }}>
          <span className="pct" style={{ color: result.passed ? 'var(--green)' : 'var(--red)' }}>{pct}%</span>
          <span className="grade">{result.grade}</span>
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>{result.title}</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>{result.subject}</p>

        <span className={`badge ${result.passed ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.9rem', padding: '6px 18px' }}>
          {result.passed ? '✓ PASSED' : '✗ FAILED'}
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginTop: 32 }}>
          {[
            { label: 'Score', value: `${result.total_score}/${result.total_marks}` },
            { label: 'Correct', value: result.total_correct },
            { label: 'Wrong', value: result.total_attempted - result.total_correct },
            { label: 'Time Taken', value: `${result.time_taken_min}m` },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="label">{s.label}</div>
              <div className="value" style={{ fontSize: '1.4rem' }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-between mt-6" style={{ justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/exams')}>← Back to Exams</button>
          <button className="btn btn-primary" onClick={() => navigate(`/leaderboard/${examId}`)}>🏆 View Leaderboard</button>
        </div>
      </div>

      {/* Question breakdown */}
      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Question Breakdown</h2>
        {breakdown.map((b, i) => (
          <div key={b.question_id} style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
            <div className="flex justify-between items-center mb-2">
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Q{i + 1} · {b.topic}</span>
              <span className={`badge ${b.is_correct ? 'badge-green' : 'badge-red'}`}>
                {b.is_correct ? `+${b.marks_awarded}` : '0'} / {b.marks}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', marginBottom: 12, lineHeight: 1.5 }}>{b.question_text}</p>
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              {['A','B','C','D'].map(opt => {
                let cls = '';
                if (opt === b.correct_option) cls = 'correct';
                else if (opt === b.chosen_option && !b.is_correct) cls = 'wrong';
                return (
                  <div key={opt} className={`option ${cls}`} style={{ flex: '1 1 45%', cursor: 'default', padding: '8px 12px' }}>
                    <span className="option-key">{opt}</span>
                    <span style={{ fontSize: '0.8rem' }}>{b[`option_${opt.toLowerCase()}`] || '—'}</span>
                  </div>
                );
              })}
            </div>
            {!b.chosen_option && (
              <p style={{ fontSize: '0.75rem', color: 'var(--yellow)', marginTop: 8 }}>⚠ Not attempted</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
