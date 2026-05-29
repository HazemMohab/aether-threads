import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="text-navy font-bold text-2xl tracking-widest uppercase">Aether Threads</Link>
          <p className="text-gray-500 text-sm mt-2">Sign in to your account</p>
        </div>

        <div className="bg-white p-8 border border-gray-100">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-1.5">Email</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange} className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-1.5">Password</label>
              <input name="password" type="password" required value={form.password} onChange={handleChange} className="input" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-navy font-medium hover:underline">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
