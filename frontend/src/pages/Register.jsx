import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register({ full_name: form.full_name, email: form.email, password: form.password });
      navigate('/shop');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="text-navy font-bold text-2xl tracking-widest uppercase">Aether Threads</Link>
          <p className="text-gray-500 text-sm mt-2">Create your account</p>
        </div>

        <div className="bg-white p-8 border border-gray-100">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { name: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Omar Aboubakr' },
              { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { name: 'password', label: 'Password', type: 'password', placeholder: 'Min. 8 characters' },
              { name: 'confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password' },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-1.5">{label}</label>
                <input name={name} type={type} required value={form[name]} onChange={handleChange} className="input" placeholder={placeholder} />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-navy font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
