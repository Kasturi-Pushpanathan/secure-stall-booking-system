import { useState, useEffect } from "react";

export default function About() {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const contentSections = [
    {
      title: "Welcome to the Book Fair Management System",
      text: "Your one-stop platform for efficiently reserving and managing stalls at book fairs. Our platform connects publishers, organizers, and exhibitors in a seamless, transparent, and user-friendly interface."
    },
    {
      title: "Our Mission",
      text: "To simplify the book fair experience by providing digital tools that save time, reduce errors, and ensure smooth coordination between all stakeholders."
    },
    {
      title: "Our Vision",
      text: "To create the most reliable and trusted platform for book fairs across Sri Lanka, empowering publishers and organizers to focus on what they do best: sharing knowledge and literature with the world."
    },
    {
      title: "Why Choose Us?",
      text: "Efficiency: Quickly reserve stalls and manage bookings without the hassle of paperwork.\nTransparency: Track reservations, payments, and exhibitor participation with clarity.\nReliability: Trusted by numerous publishers and organizers for accurate and secure operations."
    },
    {
      title: "Our Values",
      text: "Promoting literacy and reading culture.\nSupporting publishers and small authors.\nEnsuring a smooth, professional, and engaging book fair experience for all attendees."
    },
    {
      title: "User Guide at a Glance",
      text: "✦ Select the stall size and quantity.\n✦ Make a 10% advance payment to confirm booking.\n✦ Check your email for the QR code confirmation.\n✦ Keep the QR code safe; it is required for stall access.\n✦ Refunds can only be requested 7 days or more before the event."
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-stone-100 px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-6">

        <div className="text-center animate-fadeIn">
          <h1 className="text-5xl font-bold mb-4 text-white">About Us</h1>
          <p className="text-white max-w-2xl mx-auto text-lg md:text-xl">
            Learn more about our mission, vision, and the purpose behind this platform.
          </p>
        </div>

        {contentSections.map((section, index) => (
          <div
            key={index}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] animate-fadeIn"
          >
            <h2 className="font-semibold mb-4 text-blue-400 text-2xl md:text-3xl">
              {section.title}
            </h2>

            <p className="leading-relaxed whitespace-pre-line text-white text-base md:text-lg">
              {section.text}
            </p>
          </div>
        ))}
      </div>

      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold px-4 py-3 rounded-full shadow-lg transition duration-300"
        >
          ↑
        </button>
      )}


    </div>
  );
}
