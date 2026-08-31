import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { oidcService } from '../services/oidcService';

export default function Callback() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      setError('Missing authentication code or state');
      return;
    }

    oidcService
      .handleCallback(code, state)
      .then((res) => {
        login(res.user, res.token);
        navigate('/');
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Authentication failed');
      });
  }, [searchParams, login, navigate]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-stone-600 mb-6">{error}</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold px-6 py-2 rounded-lg"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
      <p className="text-lg text-stone-600">Completing sign-in. Please wait...</p>
    </div>
  );
}
