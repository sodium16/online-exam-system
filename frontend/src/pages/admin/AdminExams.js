import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BLANK = { title:'', subject:'', description:'', dept_id:'', pass_percent:40, duration_min:60, start_time:'', end_time:'' };

export default function AdminExams() {
  const [exams, setExams]       = useState([]);
  const [depts, setDepts]       = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(BLANK);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState('');
  const navigate = useNavigate();

  const load = () => {
    axios.get('/api/admin/exams').then(r => setExams(r.data)).catch(() => {});
    axios.get('/api/admin/departments').then(r => setDepts(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await axios.post('/api/admin/exams', { ...form, dept_id: form.dept_id || null });
      setShowForm(false);
      setForm(BLANK);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create exam');
    } finally { setSaving(false); }
  };

  const toggleActive = async (exam) => {
    await axios.put(`/api/admin/exams/${exam.exam_id}`, { ...exam, is_active: !exam.is_active, dept_id: exam.dept_id || null });
    load();
  };

  const deleteExam = async (id) => {
    if (!window.confirm('Delete this exam and all its questions?')) return;
    await axios.delete(`/api/admin/exams/${id}`);
    load();
  };

  const filtered = filter ? exams.filter(e => String(e.dept_id) === filter || (filter === 'all_depts' && !e.dept_id)) : exams;

  const inputStyle = { marginBottom:0 };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 className="page-title">Exam Management</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Create Exam</button>
      </div>
      <p className="page-sub">Create exams per department. Questions added inside each exam.</p>

      {/* Filter bar */}
      <div className="flex gap-2 mb-6" style={{ flexWrap:'wrap' }}>
        <button className="btn btn-secondary" style={{ fontSize:'0.8rem', padding:'6px 12px', background: filter==='' ? 'var(--accent)' : '', color: filter==='' ? 'white' : '' }}
          onClick={() => setFilter('')}>All ({exams.length})</button>
        <button className="btn btn-secondary" style={{ fontSize:'0.8rem', padding:'6px 12px', background: filter==='all_depts' ? 'var(--accent)' : '', color: filter==='all_depts' ? 'white' : '' }}
          onClick={() => setFilter('all_depts')}>🌐 All Departments</button>
        {depts.map(d => (
          <button key={d.dept_id} className="btn btn-secondary" style={{ fontSize:'0.8rem', padding:'6px 12px',
            background: filter===String(d.dept_id) ? 'var(--accent)' : '', color: filter===String(d.dept_id) ? 'white' : '' }}
            onClick={() => setFilter(String(d.dept_id))}>{d.code}</button>
        ))}
      </div>

      {/* Create Exam Modal */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="card" style={{ width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 style={{ fontWeight:700 }}>Create New Exam</h2>
              <button className="btn btn-secondary" style={{ padding:'4px 10px' }} onClick={() => { setShowForm(false); setError(''); }}>✕</button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group" style={{ gridColumn:'1/-1', ...inputStyle }}>
                  <label>Exam Title</label>
                  <input value={form.title} onChange={e => setForm({...form, title:e.target.value})} placeholder="DBMS Mid-Term" required />
                </div>
                <div className="form-group" style={{ ...inputStyle }}>
                  <label>Subject</label>
                  <input value={form.subject} onChange={e => setForm({...form, subject:e.target.value})} placeholder="Database Systems" required />
                </div>
                <div className="form-group" style={{ ...inputStyle }}>
                  <label>Department <span style={{ color:'var(--muted)', fontWeight:400 }}>(blank = all)</span></label>
                  <select value={form.dept_id} onChange={e => setForm({...form, dept_id:e.target.value})}>
                    <option value="">🌐 All Departments</option>
                    {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.name} ({d.code})</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1', ...inputStyle }}>
                  <label>Description</label>
                  <input value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="Brief description of exam topics" />
                </div>
                <div className="form-group" style={{ ...inputStyle }}>
                  <label>Pass % Threshold</label>
                  <input type="number" min="1" max="100" value={form.pass_percent}
                    onChange={e => setForm({...form, pass_percent:e.target.value})} required />
                </div>
                <div className="form-group" style={{ ...inputStyle }}>
                  <label>Duration (minutes)</label>
                  <input type="number" min="5" value={form.duration_min}
                    onChange={e => setForm({...form, duration_min:e.target.value})} required />
                </div>
                <div className="form-group" style={{ ...inputStyle }}>
                  <label>Start Time</label>
                  <input type="datetime-local" value={form.start_time}
                    onChange={e => setForm({...form, start_time:e.target.value})} required />
                </div>
                <div className="form-group" style={{ ...inputStyle }}>
                  <label>End Time</label>
                  <input type="datetime-local" value={form.end_time}
                    onChange={e => setForm({...form, end_time:e.target.value})} required />
                </div>
              </div>
              <div style={{ marginTop:4, padding:'10px 14px', background:'rgba(59,130,246,0.08)', borderRadius:8, fontSize:'0.8rem', color:'var(--muted)', marginBottom:16 }}>
                💡 <strong>Total marks are auto-calculated</strong> from the questions you add. Set pass threshold as a percentage.
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Exam'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setError(''); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exam table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th><th>Subject</th><th>Department</th>
                <th>Questions</th><th>Total Marks</th><th>Pass %</th>
                <th>Duration</th><th>Attempts</th><th>Avg Score</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={11} style={{ textAlign:'center', color:'var(--muted)', padding:32 }}>No exams found.</td></tr>
                : filtered.map(ex => (
                  <tr key={ex.exam_id}>
                    <td style={{ fontWeight:500 }}>{ex.title}</td>
                    <td style={{ color:'var(--muted)' }}>{ex.subject}</td>
                    <td>
                      {ex.dept_name
                        ? <span className="badge badge-blue">{ex.dept_code}</span>
                        : <span className="badge" style={{ background:'rgba(100,116,139,0.15)', color:'var(--muted)' }}>🌐 All</span>}
                    </td>
                    <td style={{ fontFamily:'JetBrains Mono, monospace' }}>{ex.question_count}</td>
                    <td style={{ fontFamily:'JetBrains Mono, monospace', fontWeight:600, color:'var(--accent)' }}>{ex.total_marks}</td>
                    <td style={{ fontFamily:'JetBrains Mono, monospace' }}>{ex.pass_percent}%</td>
                    <td style={{ color:'var(--muted)' }}>{ex.duration_min}m</td>
                    <td>{ex.attempt_count}</td>
                    <td style={{ color: ex.avg_score >= 50 ? 'var(--green)' : 'var(--red)' }}>
                      {ex.avg_score != null ? `${ex.avg_score}%` : '—'}
                    </td>
                    <td>
                      <span className={`badge ${ex.is_active ? 'badge-green' : 'badge-red'}`} style={{ cursor:'pointer' }}
                        onClick={() => toggleActive(ex)}>
                        {ex.is_active ? 'Live' : 'Off'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary" style={{ fontSize:'0.75rem', padding:'4px 10px' }}
                          onClick={() => navigate(`/admin/exams/${ex.exam_id}`)}>Questions</button>
                        <button className="btn btn-danger" style={{ fontSize:'0.75rem', padding:'4px 10px' }}
                          onClick={() => deleteExam(ex.exam_id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
