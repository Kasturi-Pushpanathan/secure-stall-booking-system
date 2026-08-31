import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reservationsApi } from '../api/client';

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    reservationsApi
      .my()
      .then(setReservations)
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));

    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCancel = (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    reservationsApi
      .cancel(id)
      .then(() => reservationsApi.my().then(setReservations))
      .catch((err) => alert(err.message));
  };

  const getTimeLeft = (deadline) => {
    const diff = new Date(deadline) - now;
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    return `${days}d ${hours}h ${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-stone-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-stone-100 px-6 py-12">
      <div className="max-w-4xl mx-auto animate-fadeIn">

        {/* Header */}
        <h1 className="text-3xl font-bold mb-6">My Reservations</h1>

        {reservations.length === 0 ? (
          <p className="text-stone-400 py-12 animate-fadeIn">You have no reservations yet.</p>
        ) : (
          <div className="grid gap-6">
            {reservations.map((r) => {
              const timeLeft = getTimeLeft(r.cancellationDeadline);
              const isCancelled = r.status === 'CANCELLED';
              const canCancel = timeLeft !== null && !isCancelled && r.status !== 'EVENT_REMOVED';

              return (
                <div
                  key={r.id}
                  className="bg-slate-800 rounded-xl shadow-lg border border-stone-700 p-6 animate-fadeIn"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-blue-300">{r.eventName}</h2>
                      <p className="text-stone-400">{new Date(r.eventDate).toLocaleDateString()}</p>
                      <p className="text-sm font-semibold mt-1">
                        Status:{' '}
                        <span
                          className={
                            r.status === 'PENDING'
                              ? 'text-amber-400'
                              : r.status === 'SUCCESS'
                              ? 'text-green-400'
                              : 'text-red-400'
                          }
                        >
                          {r.status}
                        </span>
                      </p>
                    </div>
                    <Link
                      to={`/reservations/${r.id}`}
                      className="text-amber-400 hover:underline font-semibold"
                    >
                      View Details
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-4 items-end justify-between">
                    <div className="text-sm text-stone-400">
                      <p>Booking ID: {r.bookingId}</p>
                      <p>Total: Rs.{r.totalAmount}</p>
                    </div>

                    {canCancel ? (
                      <div className="text-right">
                        <p className="text-xs text-red-400 font-bold mb-1">
                          Cancellation deadline in: {timeLeft}
                        </p>
                        <button
                          onClick={() => handleCancel(r.id)}
                          className="bg-red-700 text-red-100 border border-red-600 px-4 py-2 rounded-lg hover:bg-red-600 transition"
                        >
                          Cancel Reservation
                        </button>
                      </div>
                    ) : !isCancelled && r.status !== 'EVENT_REMOVED' ? (
                      <p className="text-xs text-stone-500 italic">
                        Cancellation deadline passed
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fade-in animation */}
      <style>
        {`
          .animate-fadeIn {
            animation: fadeIn 0.8s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}