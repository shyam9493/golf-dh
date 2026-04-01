import { Link } from 'react-router-dom';

function SubscriptionCancelPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-extrabold text-ink">Checkout Canceled</h1>
        <p className="mt-3 text-sm text-slate-600">
          No worries. Your subscription was not changed. You can try again anytime.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}

export default SubscriptionCancelPage;
