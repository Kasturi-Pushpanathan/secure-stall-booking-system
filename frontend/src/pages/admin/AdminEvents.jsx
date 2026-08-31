import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/client';

export default function AdminEvents() {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isAdmin) adminApi.events.list(search).then(setEvents).catch(() => setEvents([]));
  }, [isAdmin, search]);

  const remove = (id, e) => {
    e.preventDefault();
    if (!window.confirm('Remove this event? Vendors will be notified and refunds issued.')) return;
    adminApi.events.remove(id).then(() => {
      alert('Event removed and vendors notified.');
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }).catch((err) => alert(err.message));
  };

  if (!isAdmin) return <Navigate to="/login" replace />;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h1 className="font-display text-2xl font-bold">Event Management</h1>
        <Link to="/admin/events/new" className="bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold px-4 py-2 rounded-lg">Add Event</Link>
      </div>
      <input
        type="text"
        placeholder="Search events"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-stone-300 rounded-lg p-2 mb-4 w-full max-w-md"
      />
      <div className="space-y-2">
        {events.map((e) => (
          <div key={e.id} className="flex justify-between items-center bg-white border border-stone-200 rounded-lg p-4">
            <div>
              <Link to={`/admin/events/${e.id}`} className="font-semibold hover:underline">{e.name}</Link>
              <p className="text-stone-500 text-sm">{e.eventDate} · {e.location} · {e.period}</p>
            </div>
            {e.period === 'future' && (
              <button onClick={(ev) => remove(e.id, ev)} className="text-red-600 hover:underline">Remove</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
