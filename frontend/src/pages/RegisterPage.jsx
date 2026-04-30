import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to TaskFlow 🎉');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon" style={{ width: 48, height: 48, fontSize: 22 }}>✦</div>
          <h1 className="auth-title" style={{ marginTop: 12 }}>Create your account</h1>
          <p className="auth-subtitle">Start managing tasks with your team</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full name</label>
            <input id="name" type="text" className="form-input" placeholder="John Doe"
              value={form.name} onChange={set('name')} required />
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input id="reg-email" type="email" className="form-input" placeholder="you@company.com"
              value={form.email} onChange={set('email')} required />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input id="reg-password" type="password" className="form-input" placeholder="Min 6 chars"
                value={form.password} onChange={set('password')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm</label>
              <input id="confirm-password" type="password" className="form-input" placeholder="Repeat"
                value={form.confirm} onChange={set('confirm')} required />
            </div>
          </div>

          <button id="register-btn" type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className="auth-link" style={{ marginTop: 24 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
