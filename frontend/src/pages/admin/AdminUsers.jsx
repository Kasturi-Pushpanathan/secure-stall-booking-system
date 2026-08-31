import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/client';

export default function AdminUsers() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAdmin) adminApi.users.list().then(setUsers).catch(() => setUsers([]));
  }, [isAdmin]);

  const remove = (id, e) => {
    e.preventDefault();
    if (!window.confirm('Deactivate this vendor? They will receive an email notification.')) return;
    adminApi.users.remove(id).then(() => setUsers((prev) => prev.filter((u) => u.id !== id))).catch((err) => alert(err.message));
  };

   // Filter users based on search term
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.includes(searchTerm)
  );

  if (!isAdmin) return <Navigate to="/login" replace />;

   return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <div className="h-1 w-20 bg-blue-600 rounded"></div>
        </div>

         {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white shadow-sm"
            />
            <svg 
              className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Search results summary */}
          <div className="mt-2 text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="ml-2 text-blue-600 hover:text-blue-700 underline"
              >
                Clear search
              </button>
            )}
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* List header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Total Users: <span className="text-blue-600 font-semibold">{users.length}</span>
                </span>
              </div>
            </div>
          </div>

          {/* User cards */}
          <div className="divide-y divide-gray-100">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? `No results for "${searchTerm}"` : 'No vendors in the system'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div 
                  key={u.id} 
                  className="group px-6 py-4 hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="flex justify-between items-center">
                    {/* User info with avatar */}
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                        {u.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      
                      <div className="flex-1">
                        <Link 
                          to={`/admin/users/${u.id}`} 
                          className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {u.name}
                        </Link>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {u.email}
                          </span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {u.phone || 'No phone'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button 
                      onClick={(e) => remove(u.id, e)} 
                      className="opacity-0 group-hover:opacity-100 ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Deactivate vendor"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Click on user name to view details • Hover over user to show remove option • Use search to filter users
        </div>
      </div>
    </div>
  );
}