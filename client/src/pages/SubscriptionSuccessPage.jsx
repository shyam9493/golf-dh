import { Link } from 'react-router-dom';

function SubscriptionSuccessPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-extrabold text-ink">Payment Successful</h1>
        <p className="mt-3 text-sm text-slate-600">
          Your subscription checkout completed. We are syncing your status now.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brandDark"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}

export default SubscriptionSuccessPage;
