import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [form, setForm]     = useState({ email:'', password:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin }      = useAuth();
  const navigate            = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(form.email, form.password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        {/* Admin badge */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24,
          background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.3)',
          borderRadius:8, padding:'8px 14px', width:'fit-content' }}>
          <span style={{ fontSize:'1rem' }}>🛡️</span>
          <span style={{ fontSize:'0.8rem', fontWeight:700, color:'#6366f1', textTransform:'uppercase', letterSpacing:'0.08em' }}>
            Admin Portal
          </span>
        </div>

        <h1 className="auth-title">Admin Sign In</h1>
        <p className="auth-sub">Access the examination management dashboard</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Email</label>
            <input type="email" name="email" placeholder="admin@examportal.com"
              value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password:e.target.value})} required />
          </div>
          <button type="submit" className="btn btn-lg" style={{ width:'100%', marginTop:8,
            background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'white' }} disabled={loading}>
            {loading ? 'Signing in...' : '🛡️  Sign In as Admin'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:20, fontSize:'0.8rem', color:'var(--muted)' }}>
          Default → admin@examportal.com / Admin@1234
        </p>
        <p style={{ textAlign:'center', marginTop:8, fontSize:'0.8rem', color:'var(--muted)' }}>
          <a href="/login" style={{ color:'var(--accent)', textDecoration:'none' }}>← Student Login</a>
        </p>
      </div>
    </div>
  );
}
