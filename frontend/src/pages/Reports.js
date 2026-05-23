import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#6366f1', '#ec4899'];

export default function Reports() {
  const [difficulty, setDifficulty] = useState([]);
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [d, h] = await Promise.all([
          axios.get('/api/scores/difficulty-report'),
          axios.get('/api/scores/history'),
        ]);
        setDifficulty(d.data);
        setHistory(h.data);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="loading">Loading reports...</div>;

  // Bar chart: score per exam
  const scoreData = history.map(h => ({
    name: h.exam_title.length > 14 ? h.exam_title.slice(0, 14) + '…' : h.exam_title,
    score: parseFloat(h.percentage),
    pass:  h.pass_marks ? (h.pass_marks / h.total_marks) * 100 : 40,
  }));

  // Pie: pass vs fail
  const passed = history.filter(h => h.passed).length;
  const pieData = [
    { name: 'Passed', value: passed },
    { name: 'Failed', value: history.length - passed },
  ];

  // Difficulty wrong%
  const diffBar = difficulty.map(d => ({
    name: `${d.subject.slice(0,8)} (${d.difficulty})`,
    wrong_pct: parseFloat(d.wrong_pct || 0),
  }));

  // Radar: per-subject avg score
  const subjectMap = {};
  history.forEach(h => {
    if (!subjectMap[h.subject]) subjectMap[h.subject] = [];
    subjectMap[h.subject].push(parseFloat(h.percentage));
  });
  const radarData = Object.entries(subjectMap).map(([subj, vals]) => ({
    subject: subj.slice(0, 12),
    avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
  }));

  const cardStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 };
  const ttStyle   = { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.8rem' };

  return (
    <div>
      <h1 className="page-title">Reports & Analytics</h1>
      <p className="page-sub">Visualised from stored procedure <code style={{ fontSize: '0.75rem', background: 'var(--surface2)', padding: '2px 6px', borderRadius: 4 }}>sp_subject_difficulty_report</code></p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Score per exam */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 16, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Score per Exam (%)
          </h2>
          {scoreData.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>No data yet.</p>
            : <ResponsiveContainer width="100%" height={240}>
                <BarChart data={scoreData} margin={{ left: -10 }}>
                  <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                  <YAxis domain={[0,100]} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                  <Tooltip contentStyle={ttStyle} />
                  <Bar dataKey="score" fill="#3b82f6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
          }
        </div>

        {/* Pass/Fail pie */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 16, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pass / Fail Ratio
          </h2>
          {history.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>No data yet.</p>
            : <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                    dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={i === 0 ? '#22c55e' : '#ef4444'} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: '0.8rem', color: 'var(--muted)' }} />
                  <Tooltip contentStyle={ttStyle} />
                </PieChart>
              </ResponsiveContainer>
          }
        </div>

        {/* Subject difficulty (wrong%) */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 16, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Subject Difficulty — Wrong Answer % (sp_subject_difficulty_report)
          </h2>
          {diffBar.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>No difficulty data yet.</p>
            : <ResponsiveContainer width="100%" height={240}>
                <BarChart data={diffBar} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" domain={[0,100]} tick={{ fill: 'var(--muted)', fontSize: 11 }} unit="%" />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 10 }} width={110} />
                  <Tooltip contentStyle={ttStyle} />
                  <Bar dataKey="wrong_pct" fill="#ef4444" radius={[0,4,4,0]} name="Wrong %" />
                </BarChart>
              </ResponsiveContainer>
          }
        </div>

        {/* Radar: per subject avg */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 16, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Performance by Subject
          </h2>
          {radarData.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>No data yet.</p>
            : <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0,100]} tick={{ fill: 'var(--muted)', fontSize: 9 }} />
                  <Radar dataKey="avg" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                  <Tooltip contentStyle={ttStyle} />
                </RadarChart>
              </ResponsiveContainer>
          }
        </div>
      </div>

      {/* Raw difficulty table */}
      {difficulty.length > 0 && (
        <div className="card mt-4">
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 16, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Difficulty Report Table
          </h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Subject</th><th>Difficulty</th><th>Questions</th>
                  <th>Attempts</th><th>Correct</th><th>Wrong %</th>
                </tr>
              </thead>
              <tbody>
                {difficulty.map((d, i) => (
                  <tr key={i}>
                    <td>{d.subject}</td>
                    <td>
                      <span className={`badge ${d.difficulty === 'Easy' ? 'badge-green' : d.difficulty === 'Hard' ? 'badge-red' : 'badge-yellow'}`}>
                        {d.difficulty}
                      </span>
                    </td>
                    <td>{d.total_questions}</td>
                    <td>{d.total_attempts}</td>
                    <td style={{ color: 'var(--green)' }}>{d.correct_answers}</td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                      color: parseFloat(d.wrong_pct) > 60 ? 'var(--red)' : parseFloat(d.wrong_pct) > 30 ? 'var(--yellow)' : 'var(--green)' }}>
                      {parseFloat(d.wrong_pct || 0).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
