import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { reservationsApi } from '../api/client';

export default function ReservationDetail() {
  const { id } = useParams();
  const [r, setR] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reservationsApi
      .get(id)
      .then(setR)
      .catch(() => setR(null))
      .finally(() => setLoading(false));
  }, [id]);

  // 🔄 Loading Screen
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-stone-100 flex items-center justify-center">
        <p className="text-xl animate-pulse">Loading reservation...</p>
      </div>
    );
  }

  // ❌ Not Found
  if (!r) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-stone-100 flex items-center justify-center">
        <p className="text-xl text-red-400">Reservation not found.</p>
      </div>
    );
  }

  // ✅ Main Page
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-stone-100 px-6 py-12">
      
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8 text-center">
        Reservation Details
      </h1>

      {/* Card */}
      <div className="max-w-xl mx-auto bg-slate-800/70 backdrop-blur-md border border-slate-700 rounded-2xl shadow-xl p-8 space-y-4">

        <Detail label="Booking ID" value={r.bookingId} />
        <Detail label="Event" value={r.eventName} />
        <Detail
          label="Date"
          value={new Date(r.eventDate).toLocaleString()}
        />
        <Detail label="Location" value={r.location} />

        {/* Status with color */}
        <div className="flex justify-between">
          <span className="font-semibold">Status:</span>
          <span
            className={`font-bold ${
              r.status === 'PENDING'
                ? 'text-yellow-400'
                : r.status === 'SUCCESS'
                ? 'text-green-400'
                : 'text-red-400'
            }`}
          >
            {r.status}
          </span>
        </div>

        <Detail
          label="Cancellation Deadline"
          value={r.cancellationDeadline || 'N/A'}
        />
        <Detail label="Stalls" value={r.stallCodes} />
        <Detail label="Genres" value={r.genres} />
        <Detail label="Description" value={r.stallDescription || '-'} />

        <Detail
          label="Total Amount"
          value={`Rs. ${r.totalAmount}`}
        />
        <Detail
          label="Advance Paid"
          value={`Rs. ${r.advanceAmount}`}
        />

        {r.qrCodeValue && (
          <div className="pt-4 border-t border-slate-700 text-sm text-stone-400">
            QR Value: {r.qrCodeValue}
          </div>
        )}
      </div>
    </div>
  );
}

/* 🔹 Reusable Detail Row Component */
function Detail({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="font-semibold text-stone-300">{label}:</span>
      <span className="text-stone-100 text-right">{value}</span>
    </div>
  );
}