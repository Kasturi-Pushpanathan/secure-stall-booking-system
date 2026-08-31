import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/client';

export default function AdminProfile() {
  const { isAdmin, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('profile');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', phone: '', password: '' });

   // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ name: '', phone: '' });

  useEffect(() => {
    if (isAdmin) {
      loadProfileData();
      loadAdmins();
    }
  }, [isAdmin]);

    const loadProfileData = async () => {
    try {
      const data = await adminApi.profile.get();
      setProfile(data);
      setEditedProfile({ name: data.name, phone: data.phone || '' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load profile' });
    }
  };

    const loadAdmins = async () => {
    try {
      const data = await adminApi.profile.admins();
      setAdmins(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load admins' });
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedProfile({ name: profile.name, phone: profile.phone || '' });
  };

   const handleSaveProfile = async () => {
    if (!editedProfile.name.trim()) {
      setMessage({ type: 'error', text: 'Name cannot be empty' });
      return;
    }

    setMessage({ type: '', text: '' });
    try {
      // Call your update profile API endpoint
      await adminApi.profile.update(editedProfile);
      
      // Update local profile state
      setProfile({ ...profile, name: editedProfile.name, phone: editedProfile.phone });
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    }
  };

   const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({ ...prev, [name]: value }));
  };

    const changePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    
    setMessage({ type: '', text: '' });
    try {
      await adminApi.profile.changePassword(newPassword);
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setNewPassword('');
      setShowPassword(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update password' });
    }
  };

  const addAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setMessage({ type: '', text: '' });
    try {
      await adminApi.profile.addAdmin(newAdmin);
      setMessage({ type: 'success', text: 'Admin added successfully' });
      setNewAdmin({ name: '', email: '', phone: '', password: '' });
      loadAdmins(); // Reload the admins list
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to add admin' });
    }
  };

    const removeAdmin = async (adminId, adminName) => {
    if (!window.confirm(`Are you sure you want to remove ${adminName} as an admin?`)) return;
    
    try {
      await adminApi.profile.removeAdmin(adminId);
      setMessage({ type: 'success', text: 'Admin removed successfully' });
      setAdmins((prev) => prev.filter((a) => a.id !== adminId));
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to remove admin' });
    }
  };

    if (!isAdmin) return <Navigate to="/login" replace />;
  if (!profile) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
          <p className="mt-4 text-stone-600">Loading profile...</p>
        </div>
      </div>
    );
  }

   return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Header with breadcrumb */}
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-stone-800">
            Admin Profile
          </h1>
          <p className="text-stone-600 mt-1">
            Manage your account and administrator settings
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-stone-200 bg-stone-50 px-6">
            <nav className="flex space-x-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('admins')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'admins'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                }`}
              >
                Admin Management
              </button>
            </nav>
          </div>

          {/* Alert Message */}
          {message.text && (
            <div className={`mx-6 mt-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                <p className="text-sm font-medium">{message.text}</p>
                <button
                  onClick={() => setMessage({ type: '', text: '' })}
                  className="ml-auto text-stone-400 hover:text-stone-600"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

           {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Header with Edit Button */}
                <div className="flex items-center justify-between pb-6 border-b border-stone-200">
                  <div className="flex items-center space-x-4">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {profile.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-stone-800">{profile.name}</h2>
                      <p className="text-stone-500">Administrator</p>
                    </div>
                  </div>

                   {!isEditing && (
                    <button
                      onClick={handleEditProfile}
                      className="flex items-center space-x-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>

                  {/* Profile Details - Edit or View Mode */}
                {isEditing ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-stone-800">Edit Profile Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editedProfile.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-stone-50 text-stone-500"
                        disabled
                      />
                      <p className="mt-1 text-xs text-stone-500">Email cannot be changed</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        value={editedProfile.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Enter phone number"
                      />
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={handleSaveProfile}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-stone-50 p-4 rounded-lg">
                      <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Full Name</label>
                      <p className="mt-1 text-lg text-stone-800">{profile.name}</p>
                    </div>
                    
                    <div className="bg-stone-50 p-4 rounded-lg">
                      <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Email Address</label>
                      <p className="mt-1 text-lg text-stone-800">{profile.email}</p>
                    </div>
                    
                    <div className="bg-stone-50 p-4 rounded-lg">
                      <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Phone Number</label>
                      <p className="mt-1 text-lg text-stone-800">{profile.phone || 'Not provided'}</p>
                    </div>
                    
                    <div className="bg-stone-50 p-4 rounded-lg">
                      <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Account Type</label>
                      <p className="mt-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                          Administrator
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Password Change Section - Always visible */}
                {!isEditing && (
                  <div className="mt-8 pt-6 border-t border-stone-200">
                    <h3 className="text-lg font-semibold text-stone-800 mb-4">Change Password</h3>
                    <form onSubmit={changePassword} className="max-w-md space-y-4">
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          minLength="6"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
                      >
                        Update Password
                      </button>
                    </form>
                  </div>
                  )}
                </div>
              )}

                {activeTab === 'admins' && (
              <div className="space-y-6">
                {/* Admin List */}
                <div>
                  <h3 className="text-lg font-semibold text-stone-800 mb-4">Current Administrators</h3>
                  <div className="bg-stone-50 rounded-lg overflow-hidden">
                    {admins.length > 0 ? (
                      <ul className="divide-y divide-stone-200">
                        {admins.map((admin) => (
                          <li key={admin.id} className="p-4 hover:bg-white transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-semibold">
                                  {admin.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-stone-800">{admin.name}</p>
                                  <p className="text-sm text-stone-500">{admin.email}</p>
                                  {admin.phone && (
                                    <p className="text-xs text-stone-400">{admin.phone}</p>
                                  )}
                                </div>
                              </div>
                              {admin.id !== profile?.id && (
                                <button
                                  onClick={() => removeAdmin(admin.id, admin.name)}
                                  className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Remove Admin"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-stone-500">No administrators found</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add New Admin Form */}
                <div className="mt-8 pt-6 border-t border-stone-200">
                  <h3 className="text-lg font-semibold text-stone-800 mb-4">Add New Administrator</h3>
                  <form onSubmit={addAdmin} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={newAdmin.name}
                        onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Phone (Optional)</label>
                      <input
                        type="text"
                        value={newAdmin.phone}
                        onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                      <input
                        type="password"
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        required
                        minLength="6"
                      />
                      <p className="mt-1 text-xs text-stone-500">Minimum 6 characters</p>
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
                    >
                      Add Administrator
                    </button>
                  </form>
                </div>
              </div>
              )}
             </div>
          </div>            
        </div>
      </div>
   );
}
