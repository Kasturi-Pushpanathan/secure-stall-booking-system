import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { publicApi } from "../api/client";


function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}


function useFadeUpOnScroll() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

export default function Home() {
  const [data, setData] = useState({
    title: "",
    description: "",
    videoUrl: "",
  });

  useEffect(() => {
    publicApi.home().then(setData).catch(() => { });
  }, []);

  const ytId = getYouTubeId(data.videoUrl);
  const isDirectVideo = data.videoUrl && !ytId;

  const [heroRef, heroVisible] = useFadeUpOnScroll();
  const [aboutRef, aboutVisible] = useFadeUpOnScroll();
  const [featuresRef, featuresVisible] = useFadeUpOnScroll();
  const [whyRef, whyVisible] = useFadeUpOnScroll();
  const [booksRef, booksVisible] = useFadeUpOnScroll();
  const [quotesRef, quotesVisible] = useFadeUpOnScroll();
  const [testiRef, testiVisible] = useFadeUpOnScroll();
  const [ctaRef, ctaVisible] = useFadeUpOnScroll();

  return (
    <div className="w-full scroll-smooth bg-slate-900 text-stone-100">

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {ytId && (
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&modestbranding=1&rel=0`}
              title="Background Video"
              allow="autoplay; encrypted-media"
              className="absolute top-1/2 left-1/2 w-[180%] h-[180%] -translate-x-1/2 -translate-y-1/2 border-0"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
        )}

        {isDirectVideo && (
          <>
            <video
              autoPlay
              muted
              loop
              playsInline
              src={data.videoUrl}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </>
        )}

        {!ytId && !isDirectVideo && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-violet-700" />
        )}

        <div
          ref={heroRef}
          className={`relative z-10 text-center px-6 max-w-4xl transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
            {data.title || "Book Fair Management System"}
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90 text-stone-200">
            {data.description || "Reserve your stall at the best book fairs. Get started today."}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/events"
              className="bg-white text-black font-semibold px-5 py-2.5 rounded-xl text-lg transition-all duration-300 shadow-md hover:bg-black hover:text-white"
            >
              View Events
            </Link>
          </div>
        </div>
      </section>


      <section
        id="about-section"
        ref={aboutRef}
        className={`py-20 px-6 transition-all duration-1000 ${aboutVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            About the Platform
          </h2>
          <p className="text-lg max-w-3xl mx-auto text-stone-200">
            The Book Fair Management System digitizes stall allocation, organizer coordination, and exhibitor communication. It ensures transparency, efficiency, and a seamless reservation experience for publishers and event organizers.
          </p>
        </div>
      </section>

      <section
        ref={featuresRef}
        className={`py-20 px-6 transition-all duration-1000 ${featuresVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-white">
            Platform Features
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="p-6 shadow-lg shadow-violet-700/50 rounded-xl transform transition-all duration-700 bg-slate-800 hover:scale-110 hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-white">Online Stall Reservation</h3>
              <p className="text-stone-200">Reserve stalls easily through an intuitive interface with real-time availability updates and instant confirmations.</p>
            </div>
            <div className="p-6 shadow-lg shadow-violet-700/50 rounded-xl transform transition-all duration-700 bg-slate-800 hover:scale-110 hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-white">Organizer Dashboard</h3>
              <p className="text-stone-200">Manage events, allocate stalls, monitor reservations, and oversee exhibitor participation efficiently with actionable insights.</p>
            </div>
            <div className="p-6 shadow-lg shadow-violet-700/50 rounded-xl transform transition-all duration-700 bg-slate-800 hover:scale-110 hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-white">Secure & Transparent</h3>
              <p className="text-stone-200">Role-based authentication ensures secure access and reliable management of all event-related activities, keeping data private and safe.</p>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={whyRef}
        className={`py-20 px-6 bg-slate-800 transition-all duration-1000 ${whyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-white">Why Choose Our System?</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="p-6 rounded-xl bg-violet-700/20 hover:bg-violet-700/40 transition-all">
              <h3 className="text-xl font-semibold mb-3 text-white">Efficiency</h3>
              <p className="text-stone-200">Automated stall allocation and organizer tools save hours of manual work.</p>
            </div>
            <div className="p-6 rounded-xl bg-violet-700/20 hover:bg-violet-700/40 transition-all">
              <h3 className="text-xl font-semibold mb-3 text-white">Transparency</h3>
              <p className="text-stone-200">Track reservations and payments with real-time visibility and clear reporting.</p>
            </div>
            <div className="p-6 rounded-xl bg-violet-700/20 hover:bg-violet-700/40 transition-all">
              <h3 className="text-xl font-semibold mb-3 text-white">Reliability</h3>
              <p className="text-stone-200">Trusted by multiple publishers and organizers for accurate, secure management.</p>
            </div>
          </div>
        </div>
      </section>


      <section
        ref={ctaRef}
        className={`py-20 px-6 bg-gray-900 text-white text-center transition-all duration-1000 ${ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Reserve Your Stall?</h2>
        <p className="mb-8 text-lg max-w-2xl mx-auto">
          Join Sri Lanka’s largest book fairs and showcase your publications to thousands of readers.
        </p>
        <Link
          to="/events"
          className="bg-white text-black font-semibold px-6 py-3 rounded-xl text-lg transition-all duration-300 shadow-md hover:bg-black hover:text-white"
        >
          Get Started Now
        </Link>
      </section>

    </div>
  );
}