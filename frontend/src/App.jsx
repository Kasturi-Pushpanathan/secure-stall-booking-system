import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import UpcomingEvents from './pages/UpcomingEvents';
import EventDetail from './pages/EventDetail';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import MyReservations from './pages/MyReservations';
import ReservationDetail from './pages/ReservationDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminEventDetail from './pages/admin/AdminEventDetail';
import AdminEventNew from './pages/admin/AdminEventNew';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminProfile from './pages/admin/AdminProfile';
import AdminSiteSettings from './pages/admin/AdminSiteSettings';
import { useAuth } from './context/AuthContext';

function AdminLayout() {
  return <Outlet />;
}

function VendorRoute({ children }) {
  const { isVendor, isAdmin } = useAuth();
  if (isAdmin) return <Navigate to="/admin" replace />;
  if (!isVendor) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="events" element={<UpcomingEvents />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="events/:id/book" element={<VendorRoute><Booking /></VendorRoute>} />
          <Route path="payment/:reservationId" element={<VendorRoute><Payment /></VendorRoute>} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="profile" element={<VendorRoute><Profile /></VendorRoute>} />
          <Route path="reservations" element={<VendorRoute><MyReservations /></VendorRoute>} />
          <Route path="reservations/:id" element={<VendorRoute><ReservationDetail /></VendorRoute>} />

          <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="events/new" element={<AdminEventNew />} />
            <Route path="events/:id" element={<AdminEventDetail />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:id" element={<AdminUserDetail />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="site-settings" element={<AdminSiteSettings />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
