import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const BLANK_Q = { question_text:'', option_a:'', option_b:'', option_c:'', option_d:'', correct_option:'A', marks:10, difficulty:'Medium', topic:'' };

export default function AdminExamDetail() {
  const { id }  = useParams();
  const navigate = useNavigate();

  const [exam, setExam]         = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editQ, setEditQ]       = useState(null);   // question being edited
  const [form, setForm]         = useState(BLANK_Q);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [leaderboard, setLboard] = useState([]);

  const loadExam = () => axios.get(`/api/admin/exams`).then(r => {
    const found = r.data.find(e => String(e.exam_id) === String(id));
    setExam(found);
  });
  const loadQs = () => axios.get(`/api/admin/exams/${id}/questions`).then(r => setQuestions(r.data));
  const loadLboard = () => axios.get(`/api/admin/reports/leaderboard/${id}?limit=10`).then(r => setLboard(r.data)).catch(() => {});

  useEffect(() => { loadExam(); loadQs(); loadLboard(); }, [id]);

  const openAdd  = () => { setEditQ(null); setForm(BLANK_Q); setShowForm(true); };
  const openEdit = (q) => { setEditQ(q); setForm({ ...q }); setShowForm(true); };

  const handleSave = async e => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editQ) {
        await axios.put(`/api/admin/questions/${editQ.question_id}`, form);
      } else {
        await axios.post(`/api/admin/exams/${id}/questions`, form);
      }
      setShowForm(false);
      setForm(BLANK_Q);
      setEditQ(null);
      await loadQs();
      await loadExam();   // refresh total_marks
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save question');
    } finally { setSaving(false); }
  };

  const deleteQuestion = async (qid) => {
    if (!window.confirm('Delete this question?')) return;
    await axios.delete(`/api/admin/questions/${qid}`);
    await loadQs();
    await loadExam();
  };

  const diffBadge = d => d === 'Easy' ? 'badge-green' : d === 'Hard' ? 'badge-red' : 'badge-yellow';

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <button className="btn btn-secondary" style={{ padding:'6px 12px' }} onClick={() => navigate('/admin/exams')}>← Back</button>
        <div>
          <h1 className="page-title" style={{ marginBottom:2 }}>{exam?.title || 'Loading...'}</h1>
          <p style={{ color:'var(--muted)', fontSize:'0.875rem' }}>
            {exam?.dept_name || 'All Departments'} · {exam?.subject}
          </p>
        </div>
      </div>

      {/* Exam stats bar */}
      {exam && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:24 }}>
          {[
            { label:'Questions',   value: questions.length },
            { label:'Total Marks', value: exam.total_marks, color:'var(--accent)' },
            { label:'Pass Marks',  value: exam.pass_marks,  color:'var(--yellow)' },
            { label:'Pass %',      value: `${exam.pass_percent}%` },
            { label:'Duration',    value: `${exam.duration_min}m` },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ padding:14 }}>
              <div className="label">{s.label}</div>
              <div className="value" style={{ fontSize:'1.4rem', color: s.color || 'var(--text)' }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:24 }}>
        {/* Questions panel */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 style={{ fontWeight:600 }}>Question Bank ({questions.length})</h2>
            <button className="btn btn-primary" onClick={openAdd}>+ Add Question</button>
          </div>

          {questions.length === 0
            ? <div className="card text-center" style={{ color:'var(--muted)', padding:40 }}>
                No questions yet. Click "Add Question" to start building the exam.
              </div>
            : questions.map((q, i) => (
              <div key={q.question_id} className="card mb-4" style={{ padding:20 }}>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex gap-2 items-center">
                    <span style={{ fontFamily:'JetBrains Mono', fontSize:'0.75rem', color:'var(--muted)', fontWeight:600 }}>Q{i+1}</span>
                    <span className={`badge ${diffBadge(q.difficulty)}`}>{q.difficulty}</span>
                    {q.topic && <span className="badge badge-blue" style={{ fontSize:'0.7rem' }}>{q.topic}</span>}
                    <span style={{ fontSize:'0.75rem', color:'var(--muted)' }}>{q.marks} mark{q.marks>1?'s':''}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary" style={{ fontSize:'0.75rem', padding:'4px 10px' }} onClick={() => openEdit(q)}>Edit</button>
                    <button className="btn btn-danger"    style={{ fontSize:'0.75rem', padding:'4px 10px' }} onClick={() => deleteQuestion(q.question_id)}>✕</button>
                  </div>
                </div>
                <p style={{ fontWeight:500, marginBottom:12, lineHeight:1.5 }}>{q.question_text}</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                  {['A','B','C','D'].map(opt => (
                    <div key={opt} style={{
                      display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:6,
                      border: `1.5px solid ${q.correct_option === opt ? 'var(--green)' : 'var(--border)'}`,
                      background: q.correct_option === opt ? 'rgba(34,197,94,0.08)' : 'var(--surface2)',
                      fontSize:'0.82rem',
                    }}>
                      <span style={{ width:20, height:20, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                        background: q.correct_option === opt ? 'var(--green)' : 'var(--border)',
                        color:'white', fontSize:'0.7rem', fontWeight:700, flexShrink:0 }}>{opt}</span>
                      {q[`option_${opt.toLowerCase()}`]}
                      {q.correct_option === opt && <span style={{ marginLeft:'auto', color:'var(--green)', fontSize:'0.7rem' }}>✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))
          }
        </div>

        {/* Leaderboard sidebar */}
        <div>
          <div className="card">
            <h2 style={{ fontWeight:600, fontSize:'0.9rem', marginBottom:16 }}>🏆 Leaderboard</h2>
            {leaderboard.length === 0
              ? <p style={{ color:'var(--muted)', fontSize:'0.8rem' }}>No attempts yet.</p>
              : leaderboard.map((row, i) => (
                <div key={row.student_id} className="flex justify-between items-center"
                  style={{ padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                  <div className="flex gap-2 items-center">
                    <span style={{ fontSize:'0.8rem', fontWeight:700, color: i===0?'#f59e0b':i===1?'#94a3b8':i===2?'#b45309':'var(--muted)', width:20 }}>
                      {i<3?['🥇','🥈','🥉'][i]:`#${i+1}`}
                    </span>
                    <div>
                      <div style={{ fontSize:'0.8rem', fontWeight:500 }}>{row.full_name}</div>
                      <div style={{ fontSize:'0.7rem', color:'var(--muted)' }}>{row.dept_code}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'0.85rem', color:'var(--accent)' }}>{row.total_score}</div>
                    <div style={{ fontSize:'0.7rem', color:'var(--muted)' }}>{parseFloat(row.percentage).toFixed(0)}%</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Add/Edit Question Modal */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div className="card" style={{ width:'100%', maxWidth:640, maxHeight:'92vh', overflowY:'auto' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 style={{ fontWeight:700 }}>{editQ ? 'Edit Question' : 'Add Question'}</h2>
              <button className="btn btn-secondary" style={{ padding:'4px 10px' }} onClick={() => { setShowForm(false); setError(''); }}>✕</button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Question Text</label>
                <textarea value={form.question_text} onChange={e => setForm({...form, question_text:e.target.value})}
                  required rows={3} style={{ width:'100%', background:'var(--surface2)', border:'1px solid var(--border)',
                  borderRadius:8, padding:'10px 14px', color:'var(--text)', fontSize:'0.9rem', fontFamily:'Space Grotesk, sans-serif', resize:'vertical' }} />
              </div>

              {['A','B','C','D'].map(opt => (
                <div key={opt} className="form-group" style={{ marginBottom:10 }}>
                  <label>Option {opt}</label>
                  <input value={form[`option_${opt.toLowerCase()}`]}
                    onChange={e => setForm({...form, [`option_${opt.toLowerCase()}`]:e.target.value})}
                    placeholder={`Option ${opt}`} required />
                </div>
              ))}

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12 }}>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label>Correct Answer</label>
                  <select value={form.correct_option} onChange={e => setForm({...form, correct_option:e.target.value})}>
                    {['A','B','C','D'].map(o => <option key={o} value={o}>Option {o}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label>Marks</label>
                  <input type="number" min="1" value={form.marks} onChange={e => setForm({...form, marks:parseInt(e.target.value)})} required />
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label>Difficulty</label>
                  <select value={form.difficulty} onChange={e => setForm({...form, difficulty:e.target.value})}>
                    {['Easy','Medium','Hard'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label>Topic</label>
                  <input value={form.topic} onChange={e => setForm({...form, topic:e.target.value})} placeholder="e.g. SQL" />
                </div>
              </div>

              <div style={{ marginTop:16 }} className="flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editQ ? 'Update Question' : 'Add Question'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setError(''); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
