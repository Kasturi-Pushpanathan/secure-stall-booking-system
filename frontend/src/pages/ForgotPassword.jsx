import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/client';

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const [form, setForm] = useState({ email: emailParam, mobileNumber: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    authApi
      .forgotPassword(form)
      .then(() => setSuccess(true))
      .catch((err) => setError(err.message || 'Failed'))
      .finally(() => setLoading(false));
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md text-center">
        <p className="text-green-600 font-medium">Password updated successfully.</p>
        <Link to="/login" className="text-amber-600 hover:underline mt-4 inline-block">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="animate-fadeIn">
        <h1 className="font-display text-2xl font-bold mb-6">Forgot Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Email (read-only if opened from login)</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              readOnly={!!emailParam}
              className="w-full border border-stone-300 rounded-lg p-2 bg-stone-50"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Registered mobile number</label>
            <input
              type="text"
              value={form.mobileNumber}
              onChange={(e) => setForm((f) => ({ ...f, mobileNumber: e.target.value }))}
              required
              className="w-full border border-stone-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">New password</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
              required
              minLength={8}
              className="w-full border border-stone-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Confirm password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              required
              className="w-full border border-stone-300 rounded-lg p-2"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold py-3 rounded-lg">
            Reset Password
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-amber-600 hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
