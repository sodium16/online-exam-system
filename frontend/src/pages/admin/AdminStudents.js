import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [depts, setDepts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const load = () => {
    axios.get('/api/admin/students').then(r => setStudents(r.data)).finally(() => setLoading(false));
    axios.get('/api/admin/departments').then(r => setDepts(r.data));
  };
  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    await axios.patch(`/api/admin/students/${id}/toggle`);
    load();
  };

  const filtered = students.filter(s => {
    const matchSearch = !search || s.full_name.toLowerCase().includes(search.toLowerCase())
      || s.roll_number.toLowerCase().includes(search.toLowerCase())
      || s.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = !deptFilter || String(s.dept_id) === deptFilter;
    return matchSearch && matchDept;
  });

  if (loading) return <div className="loading">Loading students...</div>;

  return (
    <div>
      <h1 className="page-title">Student Management</h1>
      <p className="page-sub">{students.length} total registered students</p>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <input placeholder="Search name, roll number, email..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth:320, marginBottom:0 }} />
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ maxWidth:220, marginBottom:0 }}>
          <option value="">All Departments</option>
          {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.name} ({d.code})</option>)}
        </select>
        <span style={{ marginLeft:'auto', alignSelf:'center', color:'var(--muted)', fontSize:'0.875rem' }}>
          Showing {filtered.length} of {students.length}
        </span>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Roll No.</th><th>Department</th>
                <th>Semester</th><th>Exams Taken</th><th>Avg Score</th>
                <th>Joined</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={10} style={{ textAlign:'center', color:'var(--muted)', padding:32 }}>No students found.</td></tr>
                : filtered.map((s, i) => (
                  <tr key={s.student_id} style={!s.is_active ? { opacity:0.5 } : {}}>
                    <td style={{ color:'var(--muted)', fontFamily:'JetBrains Mono' }}>{i+1}</td>
                    <td>
                      <div style={{ fontWeight:500 }}>{s.full_name}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--muted)' }}>{s.email}</div>
                    </td>
                    <td style={{ fontFamily:'JetBrains Mono', fontSize:'0.85rem' }}>{s.roll_number}</td>
                    <td><span className="badge badge-blue">{s.dept_code}</span></td>
                    <td style={{ color:'var(--muted)' }}>Sem {s.semester}</td>
                    <td style={{ fontFamily:'JetBrains Mono' }}>{s.exam_count || 0}</td>
                    <td style={{ fontFamily:'JetBrains Mono', color: (s.avg_score||0) >= 50 ? 'var(--green)' : 'var(--red)' }}>
                      {s.avg_score != null ? `${s.avg_score}%` : '—'}
                    </td>
                    <td style={{ color:'var(--muted)', fontSize:'0.8rem' }}>{new Date(s.created_at).toLocaleDateString('en-IN')}</td>
                    <td><span className={`badge ${s.is_active ? 'badge-green' : 'badge-red'}`}>{s.is_active ? 'Active' : 'Blocked'}</span></td>
                    <td>
                      <button className={`btn ${s.is_active ? 'btn-secondary' : 'btn-success'}`}
                        style={{ fontSize:'0.75rem', padding:'4px 10px' }} onClick={() => toggle(s.student_id)}>
                        {s.is_active ? 'Block' : 'Unblock'}
                      </button>
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
