import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    authApi
      .register(form)
      .then(() => navigate('/login'))
      .catch((err) => setError(err.message || 'Registration failed'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="animate-fadeIn">
        <h1 className="font-display text-2xl font-bold mb-6">Create Account (Vendor)</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {['fullName', 'email', 'phoneNumber', 'newPassword', 'confirmPassword'].map((key) => (
            <div key={key}>
              <label className="block font-medium mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
              <input
                type={key.includes('Password') ? 'password' : key === 'email' ? 'email' : 'text'}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                required
                className="w-full border border-stone-300 rounded-lg p-2"
              />
            </div>
          ))}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold py-3 rounded-lg">
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-amber-600 hover:underline">Already have an account? Login</Link>
        </p>
      </div>
    </div>
  );
}
