import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicApi } from "../api/client";

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .upcomingEvents()
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-stone-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-stone-100 px-6 py-14">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-12 text-center animate-fadeIn">
          <h1 className="text-5xl font-bold mb-4 ">Upcoming Events</h1>
          <p className="text-blue-300 text-lg">
            Explore our scheduled book fair events and reserve your place.
          </p>
        </div>

        {events.length === 0 ? (
          <p className="text-stone-400 text-center py-12 animate-fadeIn">
            No upcoming events available at the moment.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
            {events.map((e) => (
              <Link
                key={e.id}
                to={`/events/${e.id}`}
                className="block bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition duration-500 overflow-hidden"
              >
                {e.imageUrl ? (
                  <img
                    src={e.imageUrl}
                    alt={e.name}
                    className="w-full h-52 object-cover"
                  />
                ) : (
                  <div className="w-full h-52 bg-stone-700 flex items-center justify-center text-stone-400">
                    No image
                  </div>
                )}

                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-3 text-blue-300">
                    {e.name}
                  </h2>

                  <p className="text-stone-300 text-sm line-clamp-2 mb-3">
                    {e.description}
                  </p>

                  <div className="text-stone-400 text-sm space-y-1">
                    <p>
                      📅 {new Date(e.eventDate).toLocaleString()}
                    </p>
                    <p>
                      🏪 Bookings : {e.stallsBooked}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}