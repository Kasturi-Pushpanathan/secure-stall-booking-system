import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { adminApi } from '../api/client';
import logo from '../assets/logo.jpeg';

export default function Header() {
  const { user, logout, isAdmin, isVendor } = useAuth();
  const navigate = useNavigate();
  const [dropdown, setDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdown(false);
    navigate('/');
  };

  useEffect(() => {
    if (isAdmin) {
      const fetchNotif = () => {
        adminApi.notifications()
          .then(setNotifications)
          .catch(err => console.error("Failed to fetch notifications", err));
      };

      fetchNotif();
      const interval = setInterval(fetchNotif, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  // Unified navClass for all text-link style links
  const navClass = ({ isActive }) =>
    `text-lg font-semibold transition duration-300 ${
      isActive
        ? "text-sky-400"
        : "text-stone-200 hover:text-sky-300"
    }`;

  /* ================= ADMIN HEADER ================= */
  if (isAdmin) {
    return (
      <header className="bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-4">

          {/* Logo + Title */}
          <Link to="/admin" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Book Fair Logo"
              className="h-12 w-auto object-contain"
            />
            <span className="text-3xl font-bold tracking-wide">
              Book Fair Admin
            </span>
          </Link>

          <nav className="flex items-center gap-8 flex-wrap relative">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative p-2 rounded-full hover:bg-slate-800 transition"
              >
                <span className="text-2xl">🔔</span>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-800 text-stone-100 rounded-lg shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 bg-slate-900 border-b font-semibold text-base flex justify-between items-center">
                    <span>Notifications</span>
                    <button
                      onClick={() => setShowNotif(false)}
                      className="text-stone-400 hover:text-stone-200"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-stone-400 text-sm">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((n, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            if (n.link) {
                              navigate(n.link);
                              setShowNotif(false);
                            }
                          }}
                          className="p-4 border-b border-slate-700 hover:bg-slate-700 cursor-pointer transition"
                        >
                          <p className="text-base font-medium">{n.message}</p>
                          <p className="text-sm text-stone-400 mt-1">
                            {new Date(n.time).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/admin" end className={navClass}>Dashboard</NavLink>
            <NavLink to="/admin/events" className={navClass}>Events</NavLink>
            <NavLink to="/admin/users" className={navClass}>Users</NavLink>
            <NavLink to="/admin/profile" className={navClass}>Profile</NavLink>
            <NavLink to="/admin/site-settings" className={navClass}>Site Settings</NavLink>

            <button
              onClick={handleLogout}
              className="px-5 py-2 text-lg bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
    );
  }

  /* ================= PUBLIC / VENDOR HEADER ================= */
  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-4">

        {/* Logo + Title */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Book Fair Logo"
            className="h-12 w-auto object-contain"
          />
          <span className="text-3xl font-bold tracking-wide">
            Book Fair
          </span>
        </Link>

        <nav className="flex items-center gap-8 flex-wrap">
          <NavLink to="/" end className={navClass}>Home</NavLink>
          <NavLink to="/events" className={navClass}>Upcoming Events</NavLink>
          <NavLink to="/about" className={navClass}>About</NavLink>
          <NavLink to="/contact" className={navClass}>Contact Us</NavLink>

          {isVendor && (
            <>
              <NavLink to="/reservations" className={navClass}>My Reservations</NavLink>

              {/* Vendor Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdown(!dropdown)}
                  className="px-5 py-2 text-lg bg-white text-blue-900 rounded-lg font-semibold hover:text-blue-800 hover:bg-blue-50 transition"
                >
                  Profile ▾
                </button>

                {dropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-slate-800 text-stone-100 rounded-lg shadow-lg py-2 z-50">
                    <NavLink
                      to="/profile"
                      className="block px-4 py-3 text-base hover:bg-slate-700"
                      onClick={() => setDropdown(false)}
                    >
                      Profile
                    </NavLink>

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-base hover:bg-slate-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!user && (
            <>
              <NavLink to="/register" className={navClass}>
                Create Account
              </NavLink>

              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `px-6 py-2 text-lg rounded-lg font-semibold transition ${
                    isActive
                      ? "bg-white text-blue-900"
                      : "bg-white text-blue-900 hover:bg-blue-50"
                  }`
                }
              >
                Login
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}