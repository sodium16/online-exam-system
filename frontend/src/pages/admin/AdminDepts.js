import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDepts() {
  const [depts, setDepts]     = useState([]);
  const [form, setForm]       = useState({ name:'', code:'' });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    axios.get('/api/admin/departments').then(r => setDepts(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async e => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await axios.post('/api/admin/departments', form);
      setForm({ name:'', code:'' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add department');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete department? This may affect students and exams linked to it.')) return;
    await axios.delete(`/api/admin/departments/${id}`);
    load();
  };

  if (loading) return <div className="loading">Loading departments...</div>;

  return (
    <div style={{ maxWidth:900 }}>
      <h1 className="page-title">Department Management</h1>
      <p className="page-sub">Departments control which exams are visible to which students.</p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        {/* Add form */}
        <div className="card">
          <h2 style={{ fontWeight:600, fontSize:'1rem', marginBottom:16 }}>Add Department</h2>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label>Department Name</label>
              <input value={form.name} onChange={e => setForm({...form, name:e.target.value})}
                placeholder="e.g. Computer Science" required />
            </div>
            <div className="form-group">
              <label>Short Code</label>
              <input value={form.code} onChange={e => setForm({...form, code:e.target.value.toUpperCase()})}
                placeholder="e.g. CS" maxLength={10} required
                style={{ textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:'JetBrains Mono, monospace' }} />
            </div>
            <div style={{ padding:'10px 14px', background:'rgba(59,130,246,0.08)', borderRadius:8, fontSize:'0.8rem', color:'var(--muted)', marginBottom:16 }}>
              💡 An exam assigned to a department is only visible to students of that department. Exams with no department are open to all.
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Adding...' : '+ Add Department'}</button>
          </form>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {depts.map(d => (
            <div key={d.dept_id} className="card" style={{ padding:16 }}>
              <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <div style={{ width:40, height:40, borderRadius:8, background:'rgba(59,130,246,0.1)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'JetBrains Mono', fontWeight:700, color:'var(--accent)', fontSize:'0.8rem' }}>
                    {d.code}
                  </div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{d.name}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--muted)' }}>
                      {d.student_count} students · {d.exam_count} exams
                    </div>
                  </div>
                </div>
                <button className="btn btn-danger" style={{ fontSize:'0.75rem', padding:'4px 10px' }}
                  onClick={() => handleDelete(d.dept_id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
