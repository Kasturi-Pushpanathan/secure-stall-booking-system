import { useEffect, useState } from "react";
import { publicApi } from "../api/client";

export default function Contact() {
  const [data, setData] = useState({
    email: "",
    phone: "",
    address: "",
    content: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .contact()
      .then((res) => {
        setData(res || {});
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const hasDetails = data.email || data.phone || data.address;

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-stone-100 px-6 py-14">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-stone-400 text-lg">
            We would love to hear from you. Reach out using the details below.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && (
          <div className="space-y-8 animate-fadeIn">

            {hasDetails && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-8 space-y-6 transition-all duration-500">

                {data.email && (
                  <div className="flex items-start gap-4">
                    <span className="text-xl">✉️</span>
                    <div>
                      <p className="text-stone-400 text-sm">Email</p>
                      <a
                        href={`mailto:${data.email}`}
                        className="text-amber-400 hover:text-amber-500 font-medium transition"
                      >
                        {data.email}
                      </a>
                    </div>
                  </div>
                )}

                {data.phone && (
                  <div className="flex items-start gap-4">
                    <span className="text-xl">📞</span>
                    <div>
                      <p className="text-stone-400 text-sm">Phone</p>
                      <a
                        href={`tel:${data.phone}`}
                        className="text-amber-400 hover:text-amber-500 font-medium transition"
                      >
                        {data.phone}
                      </a>
                    </div>
                  </div>
                )}

                {data.address && (
                  <div className="flex items-start gap-4">
                    <span className="text-xl">📍</span>
                    <div>
                      <p className="text-stone-400 text-sm">Address</p>
                      <p className="text-stone-200 font-medium">
                        {data.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}


            {data.content && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-lg">
                <div className="prose prose-invert text-stone-200 whitespace-pre-wrap">
                  {data.content}
                </div>
              </div>
            )}

            {!hasDetails && !data.content && (
              <p className="text-stone-400 text-center">
                No contact information available.
              </p>
            )}
          </div>
        )}
      </div>

      
    </div>
  );
}