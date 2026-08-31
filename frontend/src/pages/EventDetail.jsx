import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventsApi, reservationsApi } from '../api/client';
import FloorPlanMap from '../components/FloorPlanMap';

const DAYS_NO_BOOKING = 3;

export default function EventDetail() {
    const { id } = useParams();
    const { isVendor } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasBooking, setHasBooking] = useState(false);

    useEffect(() => {
        eventsApi
            .get(id)
            .then(setEvent)
            .catch(() => setEvent(null))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (isVendor && id) {
            reservationsApi
                .check(id)
                .then(res => setHasBooking(res.exists))
                .catch(() => {});
        }
    }, [isVendor, id]);

    if (loading)
        return (
            <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-stone-100 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );

    if (!event)
        return (
            <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-stone-100 flex items-center justify-center">
                Event not found.
            </div>
        );

    const eventDate = new Date(event.eventDate);
    const cutoff = new Date(eventDate);
    cutoff.setDate(cutoff.getDate() - DAYS_NO_BOOKING);

    const canBook = isVendor && new Date() < cutoff && !hasBooking;

    const stalls = event.stalls || [];
    const bookedIdSet = new Set(event.bookedStallIds || []);

    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-stone-100 px-6 py-14">
            <div className="container mx-auto max-w-5xl">

                {event.imageUrl && (
                    <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="w-full max-h-80 object-cover rounded-xl mb-6"
                    />
                )}

                <h1 className="font-display text-3xl font-bold mb-4 text-blue-300">{event.name}</h1>

                <p className="text-stone-300 whitespace-pre-wrap mb-4">{event.description}</p>

                <p>
                    <strong>Date : </strong>
                    {eventDate.toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </p>

                <p>
                    <strong>Time : </strong>
                    {eventDate.toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>

                <p>
                    <strong>Venue : </strong> {event.location}
                </p>

                <p className="text-stone-400 mt-2">
                    Bookings : {event.stallsBooked}
                </p>

                {!isVendor && new Date() < cutoff && new Date() < eventDate && (
                    <div className="mt-6 p-4 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                        Please{" "}
                        <Link
                            to="/login"
                            className="font-semibold underline hover:text-amber-800"
                        >
                            login
                        </Link>{" "}
                        to reserve a stall for this event.
                    </div>
                )}

                {stalls.length > 0 && (
                    <section className="mt-6 bg-white rounded-xl shadow border border-stone-200 p-6">
                        <h2 className="font-display font-semibold text-lg mb-4 text-black">
                            Stall Map Preview
                        </h2>

                        <FloorPlanMap
                            stalls={stalls}
                            mode="view"
                            bookedIds={bookedIdSet}
                        />
                    </section>
                )}

                {canBook && (
                    <div className="flex justify-end">
                        <Link
                            to={`/events/${id}/book`}
                            className="inline-block mt-6 bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold px-6 py-3 rounded-lg"
                        >
                            Book Stalls
                        </Link>
                    </div>
                )}

                {isVendor && hasBooking && (
                    <div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                        You already have an active reservation for this event.
                    </div>
                )}

                {isVendor && !canBook && !hasBooking && new Date() < eventDate && (
                    <p className="mt-6 text-amber-700">
                        Booking is closed (within {DAYS_NO_BOOKING} days of event).
                    </p>
                )}
            </div>
        </div>
    );
}