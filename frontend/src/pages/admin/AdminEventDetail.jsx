import { useEffect, useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/client';
import FloorPlanMap from '../../components/FloorPlanMap';

export default function AdminEventDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [editingLayout, setEditingLayout] = useState(false);

  useEffect(() => {
    if (isAdmin && id) adminApi.events.get(id).then(setEvent).catch(() => setEvent(null));
  }, [isAdmin, id]);

  const toggleBlock = (stall) => {
    adminApi.events.toggleBlockStall(Number(id), stall.id, !stall.blocked).then(() => {
      setEvent(prev => ({
        ...prev,
        stalls: prev.stalls.map(s => s.id === stall.id ? { ...s, blocked: !stall.blocked } : s),
      }));
    });
  };

  const handlePositionChange = (stallCode, x, y) => {
    setEvent(prev => ({
      ...prev,
      stalls: prev.stalls.map(s => s.stallCode === stallCode ? { ...s, positionX: x, positionY: y } : s),
    }));
  };

  const remove = (eventId, e) => {
    e.preventDefault();
    if (!window.confirm('Remove this event? Vendors will be notified and refunds issued.')) return;
    adminApi.events.remove(eventId).then(() => {
      alert('Event removed and vendors notified.');
      navigate('/admin/events');
    }).catch(err => alert(err.message));
  };

  if (!isAdmin) return <Navigate to="/login" replace />;
  if (!event) return <div className="container mx-auto px-4 py-12">Loading...</div>;

  const stalls = event.stalls || [];
  const blockedCount = stalls.filter(s => s.blocked).length;
  const bookedCount = stalls.filter(s => s.bookedBy).length;
  const blockedSet = new Set(stalls.filter(s => s.blocked).map(s => s.stallCode));
  const bookedIdSet = new Set(stalls.filter(s => s.bookedBy).map(s => s.id));

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Link to="/admin/events" className="text-amber-600 hover:underline mb-4 inline-block">← Events</Link>

      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="font-display text-2xl font-bold">{event.name}</h1>
        <button onClick={e => remove(event.id, e)} className="text-red-600 hover:underline text-sm">Remove Event</button>
      </div>

      {event.description && <p className="text-stone-600 whitespace-pre-wrap mb-2">{event.description}</p>}
      <p className="text-stone-500 text-sm mb-6">{event.eventDate} · {event.location}</p>


      <section className="bg-white rounded-xl shadow border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            Reservation Map
          </h2>
        </div>
        <p className="text-stone-500 text-sm mb-4">
          {editingLayout ? 'Drag stalls to rearrange.' : 'Click a stall to block/unblock. Hover for vendor info.'}
        </p>

        <FloorPlanMap
          stalls={stalls}
          selectedSet={blockedSet}
          onStallClick={editingLayout ? undefined : toggleBlock}
          onPositionChange={handlePositionChange}
          draggable={editingLayout}
          mode="admin"
          bookedIds={bookedIdSet}
        />

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-600">
          <span>Total: <strong>{stalls.length}</strong></span>
          <span>Available: <strong className="text-emerald-600">{stalls.length - blockedCount - bookedCount}</strong></span>
          <span>Booked: <strong className="text-amber-600">{bookedCount}</strong></span>
          <span>Blocked: <strong className="text-red-600">{blockedCount}</strong></span>
        </div>
      </section>
    </div>
  );
}
