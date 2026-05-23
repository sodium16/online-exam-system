import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm]         = useState({ full_name:'', email:'', password:'', confirm:'', roll_number:'', dept_id:'', semester:'1' });
  const [departments, setDepts] = useState([]);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { register }            = useAuth();
  const navigate                = useNavigate();

  useEffect(() => {
    axios.get('/api/auth/departments').then(r => setDepts(r.data)).catch(() => {});
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6)       return setError('Password must be at least 6 characters.');
    if (!form.dept_id)                  return setError('Please select your department.');
    setLoading(true);
    try {
      await register({ ...form, dept_id: parseInt(form.dept_id), semester: parseInt(form.semester) });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-box" style={{ maxWidth: 520 }}>
        <div style={{ fontSize:'2rem', marginBottom:8 }}>📋</div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-sub">Register to access online examinations</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label>Full Name</label>
              <input name="full_name" placeholder="Arjun Sharma" value={form.full_name} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label>Email Address</label>
              <input type="email" name="email" placeholder="you@college.edu" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Roll Number</label>
              <input name="roll_number" placeholder="CS21001" value={form.roll_number} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Semester</label>
              <select name="semester" value={form.semester} onChange={handleChange}>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label>Department</label>
              <select name="dept_id" value={form.dept_id} onChange={handleChange} required>
                <option value="">— Select Department —</option>
                {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.name} ({d.code})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" placeholder="Min 6 chars" value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" name="confirm" placeholder="Repeat password" value={form.confirm} onChange={handleChange} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width:'100%', marginTop:4 }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:24, fontSize:'0.875rem', color:'var(--muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
