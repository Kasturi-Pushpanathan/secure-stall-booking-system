const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function getErrorMessage(data, statusText) {
  if (!data) return statusText || 'Request failed';
  if (data.message) return data.message;
  if (data.error) return data.error;
  if (Array.isArray(data.errors)) return data.errors.join('; ');
  if (typeof data === 'string') return data;
  return statusText || 'Request failed';
}

export async function api(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(BASE + url, { ...options, headers });
  } catch (err) {
    throw new Error('Cannot reach server. Is the backend running on port 8080?');
  }
  const isAuthRequest = url.startsWith('/auth/');
  if (res.status === 401 && !isAuthRequest) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!res.ok) throw new Error(getErrorMessage(data, res.statusText));
  return data;
}

export const publicApi = {
  home: () => api('/public/home'),
  about: () => api('/public/about'),
  contact: () => api('/public/contact'),
  upcomingEvents: () => api('/public/events/upcoming'),
  genres: () => api('/public/genres'),
};

export const eventsApi = {
  list: () => api('/events'),
  get: (id) => api(`/events/${id}`),
  stallAvailability: (id) => api(`/events/${id}/stall-availability`),
};

export const authApi = {
  login: (email, password, role) => api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, role }) }),
  register: (body) => api('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body) => api('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
};

export const profileApi = {
  get: () => api('/profile'),
  update: (body) => api('/profile', { method: 'PUT', body: JSON.stringify(body) }),
};

export const reservationsApi = {
  book: (body) => api('/reservations/book', { method: 'POST', body: JSON.stringify(body) }),
  my: () => api('/reservations/my'),
  get: (id) => api(`/reservations/${id}`),
  cancel: (id) => api(`/reservations/${id}/cancel`, { method: 'POST' }),

  approve: (id) => api(`/reservations/${id}/approve`, { method: 'POST' }),
  reject: (id) => api(`/reservations/${id}/reject`, { method: 'POST' }),
  refund: (id) => api(`/reservations/${id}/refund`, { method: 'POST' }),
  check: (eventId) => api(`/reservations/check?eventId=${eventId}`),
};



export const adminApi = {
  dashboard: () => api('/admin/dashboard'),
  events: {
    list: (search) => api('/admin/events' + (search ? `?search=${encodeURIComponent(search)}` : '')),
    get: (id) => api(`/admin/events/${id}`),
    create: (body) => api('/admin/events', { method: 'POST', body: JSON.stringify(body) }),
    remove: (id) => api(`/admin/events/${id}`, { method: 'DELETE' }),
    toggleBlockStall: (eventId, stallId, blocked) =>
      api(`/admin/events/${eventId}/stalls/${stallId}/block`, { method: 'PUT', body: JSON.stringify({ blocked }) }),
  },
  users: {
    list: () => api('/admin/users'),
    get: (id) => api(`/admin/users/${id}`),
    remove: (id) => api(`/admin/users/${id}`, { method: 'DELETE' }),
    removeReservation: (userId, reservationId) =>
      api(`/admin/users/${userId}/reservations/${reservationId}`, { method: 'DELETE' }),
  },
  profile: {
    get: () => api('/admin/profile'),
    changePassword: (newPassword) => api('/admin/profile/password', { method: 'PUT', body: JSON.stringify({ newPassword }) }),
    admins: () => api('/admin/profile/admins'),
    addAdmin: (body) => api('/admin/profile/admins', { method: 'POST', body: JSON.stringify(body) }),
    removeAdmin: (id) => api(`/admin/profile/admins/${id}`, { method: 'DELETE' }),
  },
  content: {
    get: () => api('/admin/content'),
    update: (body) => api('/admin/content', { method: 'PUT', body: JSON.stringify(body) }),
    deleteAbout: () => api('/admin/content/about', { method: 'DELETE' }),
    uploadVideo: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const token = getToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(BASE + '/admin/content/upload-video', {
        method: 'POST', headers, body: formData,
      });
      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : null; } catch { data = null; }
      if (!res.ok) throw new Error(getErrorMessage(data, res.statusText));
      return data;
    },
  },
  notifications: () => api('/admin/notifications'),
  markNotificationRead: (id) => api(`/admin/notifications/mark-read/${id}`, { method: 'POST' }),
};

const ML_BASE_URL = 'http://localhost:8003';

export const mlApi = {
  predict: async (stalls) => {
    try {
      const response = await fetch(`${ML_BASE_URL}/predict-genres`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stalls }),
      });
      if (!response.ok) throw new Error('ML Service Error');
      return await response.json();
    } catch (err) {
      console.error('ML Prediction failed:', err);
      return { top_genres: [] };
    }
  }
};
