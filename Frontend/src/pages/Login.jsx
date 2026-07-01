import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState(null);

 useEffect(() => {
  apiRequest("/health")
    .then(() => {
      setApiOnline(true);
    })
    .catch(() => {
      setApiOnline(false);
    });
}, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest('/auth/login', 'POST', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('name', res.data.name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="page-center">
      <div className="card">
        <div className="card-top">
          <span className="eyebrow">TASKFLOW</span>
          <span className={`status-dot ${apiOnline === null ? '' : apiOnline ? 'online' : 'offline'}`}></span>
        </div>
        <h1>Sign in</h1>
        <p className="subtitle">Access your tasks securely.</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <input type="email" placeholder=" " required value={email} onChange={(e) => setEmail(e.target.value)} />
            <label>Email</label>
          </div>
          <div className="field">
            <input type="password" placeholder=" " required value={password} onChange={(e) => setPassword(e.target.value)} />
            <label>Password</label>
          </div>
          <button type="submit" className="btn" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          <p className="endpoint-tag">POST /api/v1/auth/login</p>
        </form>

        <p className="switch-link">New here? <Link to="/register">Create an account</Link></p>
      </div>
    </div>
  );
}