import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../api';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    apiRequest('/health').then(() => setApiOnline(true)).catch(() => setApiOnline(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest('/auth/register', 'POST', { name, email, password });
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
        <h1>Create account</h1>
        <p className="subtitle">Start tracking your tasks.</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <input placeholder=" " required value={name} onChange={(e) => setName(e.target.value)} />
            <label>Full name</label>
          </div>
          <div className="field">
            <input type="email" placeholder=" " required value={email} onChange={(e) => setEmail(e.target.value)} />
            <label>Email</label>
          </div>
          <div className="field">
            <input type="password" placeholder=" " required value={password} onChange={(e) => setPassword(e.target.value)} />
            <label>Password</label>
          </div>
          <button type="submit" className="btn" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
          <p className="endpoint-tag">POST /api/v1/auth/register</p>
        </form>

        <p className="switch-link">Already have an account? <Link to="/">Sign in</Link></p>
      </div>
    </div>
  );
}