// OIDC PKCE flow helper for the stall reservation frontend
const AUTHORITY = import.meta.env.VITE_OIDC_AUTHORITY || 'https://dev-bookfair.us.auth0.com';
const CLIENT_ID = import.meta.env.VITE_OIDC_CLIENT_ID || '';
const REDIRECT_URI = import.meta.env.VITE_OIDC_REDIRECT_URI || 'https://localhost:5173/callback';
const AUDIENCE = import.meta.env.VITE_OIDC_AUDIENCE || '';

function randomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const oidcService = {
  isConfigured: () => {
    return !!CLIENT_ID;
  },

  getLoginUrl: async () => {
    const verifier = randomString(43);
    const state = randomString(16);
    sessionStorage.setItem('pkce_verifier', verifier);
    sessionStorage.setItem('pkce_state', state);

    const challenge = await sha256(verifier);
    
    let url = `${AUTHORITY}/authorize?` +
      `response_type=code` +
      `&client_id=${CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=openid%20profile%20email` +
      `&state=${state}` +
      `&code_challenge=${challenge}` +
      `&code_challenge_method=S256`;

    if (AUDIENCE) {
      url += `&audience=${encodeURIComponent(AUDIENCE)}`;
    }
    return url;
  },

  handleCallback: async (code, state) => {
    const savedState = sessionStorage.getItem('pkce_state');
    const verifier = sessionStorage.getItem('pkce_verifier');

    if (state !== savedState) {
      throw new Error('Invalid state token');
    }

    const response = await fetch(`${AUTHORITY}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        code_verifier: verifier,
        code: code,
        redirect_uri: REDIRECT_URI
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Token exchange failed: ${errText}`);
    }

    const data = await response.json();
    
    // Decode ID token payload
    const idToken = data.id_token;
    const base64Url = idToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const claims = JSON.parse(jsonPayload);

    // Save tokens and user info
    return {
      token: data.access_token,
      user: {
        userId: null,
        email: claims.email || claims.sub,
        name: claims.name || claims.nickname || claims.email,
        // Auto grant admin if email is admin or contains admin@
        role: claims['https://bookfair.com/roles']?.includes('ADMIN') || claims.email?.includes('admin@') ? 'ADMIN' : 'VENDOR'
      }
    };
  },

  getLogoutUrl: () => {
    return `${AUTHORITY}/v2/logout?client_id=${CLIENT_ID}&returnTo=${encodeURIComponent(window.location.origin)}`;
  }
};
