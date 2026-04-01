import { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import { BKEND_URL } from '../config.js';

function SubscriptionSuccessPage() {
  const { token, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !token) {
      return;
    }

    const sessionId = new URLSearchParams(window.location.search).get('session_id');

    const syncAndRedirect = async () => {
      if (sessionId) {
        try {
          await axios.post(
            `${BKEND_URL}/subscriptions/sync?session_id=${encodeURIComponent(sessionId)}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          console.error('Subscription sync after checkout failed:', err);
        }
      }

      navigate('/dashboard');
    };

    const timeoutId = setTimeout(syncAndRedirect, 2000);

    return () => clearTimeout(timeoutId);
  }, [loading, token, navigate]);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-extrabold text-ink">Payment Successful</h1>
        {loading ? (
          <p className="mt-3 text-sm text-slate-600">Checking your session...</p>
        ) : token ? (
          <>
            <p className="mt-3 text-sm text-slate-600">
              Your checkout completed. Redirecting to your dashboard to refresh subscription status.
            </p>
            <Link
              to="/dashboard"
              className="mt-6 inline-block rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brandDark"
            >
              Go to Dashboard
            </Link>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-slate-600">
              Payment succeeded, but your session is not active on this browser. Sign in to sync your subscription.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brandDark"
            >
              Sign In
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default SubscriptionSuccessPage;
