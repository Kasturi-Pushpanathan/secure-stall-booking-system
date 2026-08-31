import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi, reservationsApi } from '../../api/client';

export default function AdminUserDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isAdmin && id) adminApi.users.get(id).then(setUser).catch(() => setUser(null));
  }, [isAdmin, id]);

  if (!isAdmin) return <Navigate to="/login" replace />;
  if (!user) return <div className="container mx-auto px-4 py-12">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <Link to="/admin/users" className="text-amber-600 hover:underline mb-4 inline-block">← Users</Link>
      <h1 className="font-display text-2xl font-bold mb-4">{user.name}</h1>
      <p>{user.email} · {user.phone}</p>
      <p>Business: {user.businessName || '-'}</p>
      <h2 className="font-semibold mt-6 mb-2">Reservations</h2>
      <div className="space-y-2">
        {user.reservations?.map((r) => (
          <div key={r.id} className="bg-stone-50 rounded p-4 text-sm border border-stone-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-lg">{r.eventName} <span className="text-stone-500 text-sm">({r.bookingId})</span></p>
                <p>Status: <strong className={r.status === 'SUCCESS' ? 'text-green-600' : r.status === 'PENDING' ? 'text-amber-600' : 'text-red-600'}>{r.status}</strong></p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">Rs.{r.totalAmount}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p><strong>Stalls:</strong> {r.stallCodes}</p>
                <p><strong>Genres:</strong> {r.genres}</p>
              </div>
              <div>
                <p><strong>Payment:</strong> {r.paymentMethod}</p>
                <p><strong>Bank:</strong> {r.bankName} ({r.accountNumber})</p>
                <p><strong>Address:</strong> {r.address}</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-end border-t pt-3">
              {r.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => {
                      if (window.confirm('Approve this reservation?')) {
                        reservationsApi.approve(r.id)
                          .then(() => adminApi.users.get(id).then(setUser))
                          .catch(err => alert(err.message));
                      }
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Reject and Refund? Use this if the user has already paid.')) {
                        reservationsApi.rejectAndRefund(r.id)
                          .then(() => adminApi.users.get(id).then(setUser))
                          .catch(err => alert(err.message));
                      }
                    }}
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                  >
                    Reject & Refund
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Reject this reservation? (No refund)')) {
                        reservationsApi.reject(r.id)
                          .then(() => adminApi.users.get(id).then(setUser))
                          .catch(err => alert(err.message));
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </>
              )}

              {r.status === 'SUCCESS' && (
                <button
                  onClick={() => {
                    if (window.confirm('Refund this reservation? This will mark it as REFUNDED.')) {
                      reservationsApi.refund(r.id)
                        .then(() => adminApi.users.get(id).then(setUser))
                        .catch(err => alert(err.message));
                    }
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Refund
                </button>
              )}

              {r.status === 'CANCELLED' && (
                <>
                  <button
                    onClick={() => {
                      if (window.confirm('Process Refund for this cancelled reservation?')) {
                        reservationsApi.refund(r.id)
                          .then(() => adminApi.users.get(id).then(setUser))
                          .catch(err => alert(err.message));
                      }
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Refund
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Reject? (Ensure no refund is needed)')) {
                        reservationsApi.reject(r.id)
                          .then(() => adminApi.users.get(id).then(setUser))
                          .catch(err => alert(err.message));
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div >
  );
}