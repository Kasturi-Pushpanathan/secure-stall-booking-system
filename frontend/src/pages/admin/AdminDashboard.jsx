import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/client';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      adminApi.dashboard()
        .then(response => {
          setData(response);
          setLoading(false);
        })
        .catch(() => {
          setData(null);
          setLoading(false);
        });
    }
  }, [isAdmin]);

  if (!isAdmin) return <Navigate to="/login" replace />;
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-500">Failed to load dashboard data</p>
      </div>
    );
  }

    const next = data.nextUpcomingEvent && Object.keys(data.nextUpcomingEvent).length ? data.nextUpcomingEvent : null;
    const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1'];

  // Prepare data for revenue pie chart
  const revenueData = [
    { name: 'Received', value: data.totalReceivedAmount || 0 },
    { name: 'Pending', value: data.totalPendingAmount || 0 }
  ];

  // Prepare data for reservation status chart
  const totalReservations = data.totalReservations || 0;
  const pendingCount = data.pendingReservations || 0;
  const cancelledCount = data.recentCancellations || 0;
  const completedCount = Math.max(0, totalReservations - pendingCount - cancelledCount);
  
  const reservationData = [
    { name: 'Completed', value: completedCount },
    { name: 'Pending', value: pendingCount },
    { name: 'Cancelled', value: cancelledCount }
  ];

  return (
    <div className="container mx-auto px-4 py-12 bg-stone-50 min-h-screen">
      
        {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-stone-500 mt-1">Welcome back! Here's your stall reservation overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-amber-500 hover:shadow-xl transition-shadow">
          <p className="text-stone-500 text-sm">Total events</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-stone-800">{data.totalEvents || 0}</p>
            <span className="text-amber-500 text-xl">📅</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
          <p className="text-stone-500 text-sm">Pending amount</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-stone-800">Rs.{Number(data.totalPendingAmount || 0).toFixed(2)}</p>
            <span className="text-blue-500 text-xl">⏳</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
          <p className="text-stone-500 text-sm">Received amount</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-stone-800">Rs.{Number(data.totalReceivedAmount || 0).toFixed(2)}</p>
            <span className="text-green-500 text-xl">💰</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
          <p className="text-stone-500 text-sm">Reservations</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-stone-800">{data.totalReservations || 0}</p>
            <span className="text-purple-500 text-xl">🎫</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-pink-500 hover:shadow-xl transition-shadow">
          <p className="text-stone-500 text-sm">Vendors</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-stone-800">{data.totalVendors || 0}</p>
            <span className="text-pink-500 text-xl">👥</span>
          </div>
        </div>
      </div>

      {/* Next Event Banner */}
      {next && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">NEXT UPCOMING EVENT</p>
              <h2 className="text-2xl font-bold mt-1">{next.name}</h2>
              <div className="flex gap-4 mt-2">
                <span className="flex items-center gap-1 text-amber-100">📅 {next.eventDate}</span>
                <span className="flex items-center gap-1 text-amber-100">📍 {next.location}</span>
              </div>
            </div>
            <div className="bg-white/20 p-4 rounded-full">
              <span className="text-4xl">🎪</span>
            </div>
          </div>
        </div>
      )}

       {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Revenue Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-200">
          <h2 className="font-display font-semibold text-lg mb-6">Revenue Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {revenueData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `Rs.${Number(value).toFixed(2)}`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
              <span className="text-sm">Received: Rs.{Number(data.totalReceivedAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
              <span className="text-sm">Pending: Rs.{Number(data.totalPendingAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Reservation Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-200">
          <h2 className="font-display font-semibold text-lg mb-6">Reservation Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reservationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#78716c" />
              <YAxis stroke="#78716c" />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {reservationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Genre Distribution */}
        {data.genreDistribution && data.genreDistribution.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-200 lg:col-span-2">
            <h2 className="font-display font-semibold text-lg mb-6">Genre Distribution</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.genreDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="count"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.genreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-4">
                {data.genreDistribution.map((genre, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-stone-600">{genre.name}</span>
                      <span className="font-semibold">{Math.round(genre.percent)}%</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${genre.percent}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

        {/* Quick Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Collection Rate Card - FIXED */}
        <div className="group relative bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-xl p-6 border border-amber-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-300/10 rounded-full -ml-8 -mb-8 group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg shadow-amber-200/50">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                COLLECTION
              </span>
            </div>
            
            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400 mb-1">
              {(() => {
                const received = data.totalReceivedAmount || 0;
                const pending = data.totalPendingAmount || 0;
                const total = received + pending;
                if (total === 0) return '0%';
                return `${Math.round((received / total) * 100)}%`;
              })()}
            </p>
            <p className="text-sm text-stone-500 font-medium">of total revenue collected</p>
            
            <div className="mt-4 h-2 bg-stone-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ 
                  width: (() => {
                    const received = data.totalReceivedAmount || 0;
                    const pending = data.totalPendingAmount || 0;
                    const total = received + pending;
                    if (total === 0) return '0%';
                    return `${Math.round((received / total) * 100)}%`;
                  })()
                }}
              ></div>
            </div>

            {/* FIXED: Status message now shows collected amount correctly */}
            <p className="text-xs text-amber-600 mt-3 font-medium flex items-center gap-1">
              {data.totalReceivedAmount > 0 ? (
                <>
                  <span>✓</span> Rs.{Number(data.totalReceivedAmount).toFixed(2)} collected
                  {data.totalPendingAmount > 0 && (
                    <span className="ml-1">(Rs.{Number(data.totalPendingAmount).toFixed(2)} pending)</span>
                  )}
                </>
              ) : (
                <>
                  <span>📊</span> No revenue data
                </>
              )}
            </p>
          </div>
        </div>

        {/* Average per Reservation Card */}
        <div className="group relative bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-6 border border-blue-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-300/10 rounded-full -ml-8 -mb-8 group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200/50">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-semibold tracking-wider text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                AVERAGE
              </span>
            </div>
            
            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 mb-1">
              Rs.{data.totalReservations 
                ? ((data.totalReceivedAmount + data.totalPendingAmount) / data.totalReservations).toFixed(2)
                : '0.00'}
            </p>
            <p className="text-sm text-stone-500 font-medium">average amount per booking</p>
            
            <div className="mt-4 flex items-end justify-between h-8">
              <div className="w-8 bg-blue-200 rounded-t-lg h-4 group-hover:h-6 transition-all duration-300"></div>
              <div className="w-8 bg-blue-300 rounded-t-lg h-6 group-hover:h-8 transition-all duration-300"></div>
              <div className="w-8 bg-blue-400 rounded-t-lg h-8 group-hover:h-10 transition-all duration-300"></div>
              <div className="w-8 bg-blue-500 rounded-t-lg h-5 group-hover:h-7 transition-all duration-300"></div>
              <div className="w-8 bg-blue-200 rounded-t-lg h-3 group-hover:h-5 transition-all duration-300"></div>
            </div>
          </div>
        </div>

        {/* Pending Actions Card */}
        <div className="group relative bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl p-6 border border-purple-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-300/10 rounded-full -ml-8 -mb-8 group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-200/50">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {data.pendingReservations > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
              </div>
              <span className="text-xs font-semibold tracking-wider text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                ACTION NEEDED
              </span>
            </div>
            
            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400 mb-1">
              {data.pendingReservations || 0}
            </p>
            <p className="text-sm text-stone-500 font-medium">reservations need approval</p>
            
            {data.pendingReservations > 0 ? (
              <>
                <div className="mt-4 flex items-center gap-2">
                  <div className="relative">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <span className="text-sm text-stone-600">
                    {data.pendingReservations} pending {data.pendingReservations === 1 ? 'reservation' : 'reservations'}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-stone-400 mt-4">No pending reservations</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}