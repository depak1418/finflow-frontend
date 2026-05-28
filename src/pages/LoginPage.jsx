import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data);
      toast.success(`Welcome back, ${data.fullName}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex',
      alignItems:'center', justifyContent:'center',
      background:'radial-gradient(ellipse at 60% 40%, #1a2540 0%, #0f1117 70%)',
    }}>
      <div style={{ width:'100%', maxWidth:'420px', padding:'0 1rem' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <h1 style={{ fontSize:'2.5rem', color:'#4f8ef7',
            letterSpacing:'-0.04em', marginBottom:'6px' }}>FinFlow</h1>
          <p style={{ color:'#8892a4', fontSize:'0.9rem' }}>
            Your personal finance command centre
          </p>
        </div>

        <div className="card" style={{ padding:'2rem' }}>
          <h2 style={{ fontSize:'1.3rem', marginBottom:'1.5rem' }}>Sign in</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email" placeholder="deepak@gmail.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password" placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
              />
            </div>

            <button className="btn btn-primary" type="submit"
              disabled={loading}
              style={{ width:'100%', padding:'0.75rem',
                fontSize:'0.95rem', marginTop:'0.5rem' }}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:'1.5rem',
            color:'#8892a4', fontSize:'0.85rem' }}>
            No account?{' '}
            <Link to="/register"
              style={{ color:'#4f8ef7', textDecoration:'none' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}