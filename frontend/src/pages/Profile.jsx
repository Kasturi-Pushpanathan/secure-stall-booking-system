import { useEffect, useState } from 'react';
import { profileApi } from '../api/client';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', businessName: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileApi.get().then((p) => {
      setProfile(p);
      setForm({ name: p.name, email: p.email, phone: p.phone || '', businessName: p.businessName || '' });
    }).catch(() => setProfile(null)).finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    profileApi.update(form).then(() => setMessage('Profile updated.')).catch((err) => setMessage(err.message || 'Update failed'));
  };

  if (loading) return <div className="container mx-auto px-4 py-12">Loading...</div>;
  if (!profile) return <div className="container mx-auto px-4 py-12">Not found.</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <h1 className="font-display text-2xl font-bold mb-6">Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {['name', 'email', 'phone', 'businessName'].map((key) => (
          <div key={key}>
            <label className="block font-medium mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
            <input
              type={key === 'email' ? 'email' : 'text'}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="w-full border border-stone-300 rounded-lg p-2"
            />
          </div>
        ))}
        {message && <p className={message.startsWith('Profile') ? 'text-green-600' : 'text-red-600'}>{message}</p>}
        <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold py-3 rounded-lg">
          Save
        </button>
      </form>
    </div>
  );
}