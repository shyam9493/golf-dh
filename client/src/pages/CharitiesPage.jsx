import { useEffect, useMemo, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { BKEND_URL } from '../config.js';


function CharitiesPage() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0 });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectingCharityId, setSelectingCharityId] = useState(null);

  const categories = useMemo(() => {
    const distinct = new Set(charities.map((item) => item.category).filter(Boolean));
    return ['all', ...Array.from(distinct)];
  }, [charities]);

  useEffect(() => {
    const loadCharities = async () => {
      setLoading(true);
      setError('');

      try {
        const params = {
          page,
          limit: 9,
          search: searchText || undefined,
          category: category !== 'all' ? category : undefined,
          is_featured: featuredOnly ? true : undefined,
          is_active: true,
        };

        const response = await axios.get(`${BKEND_URL}/charities`, { params });
        const rows = response.data?.data || [];

        setCharities(rows);
        setPagination(response.data?.pagination || { page: 1, limit: 9, total: rows.length });

        if (rows.length > 0) {
          const pick = selectedCharity && rows.find((item) => item.id === selectedCharity.id);
          setSelectedCharity(pick || rows[0]);
        } else {
          setSelectedCharity(null);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load charities right now.');
      } finally {
        setLoading(false);
      }
    };

    loadCharities();
  }, [searchText, category, featuredOnly, page]);

  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || 9)));

  const spotlightCharity = useMemo(
    () => charities.find((item) => item.is_featured) || charities[0] || null,
    [charities]
  );

  const fetchCharityDetail = async (id) => {
    try {
      const response = await axios.get(`${BKEND_URL}/charities/${id}`);
      setSelectedCharity(response.data);
    } catch {
      const fallback = charities.find((item) => item.id === id);
      setSelectedCharity(fallback || null);
    }
  };

  const handleSelectCharity = async () => {
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    if (!selectedCharity) return;

    try {
      await axios.post(
        `${BKEND_URL}/charities/select`,
        { charity_id: selectedCharity.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Charity selected successfully - redirect to checkout or show success
      navigate('/subscription/success');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to select charity');
    }
  };

  return (
    <main className="min-h-screen bg-[#eef0f2] text-[#1e2530]">
      <section className="mx-auto max-w-315 px-5 pb-10 pt-6 md:px-8 md:pt-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-full bg-[#0b4a51]">
              <span className="absolute left-2.5 top-1.5 text-base text-[#94f7c4]">●</span>
              <span className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-white"></span>
            </div>
            <p className="text-[30px] font-extrabold tracking-tight text-[#20323a]">GolFMaster</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-full border border-[#c9d1d6] bg-white px-6 py-2 text-base font-semibold text-[#29434a] transition hover:bg-slate-50"
            >
              Home
            </Link>
            {token ? (
              <button 
                onClick={logout}
                className="rounded-full border border-[#c9d1d6] bg-white px-6 py-2 text-base font-semibold text-[#29434a] transition hover:bg-slate-50">
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-[#0b4a51] px-6 py-2 text-base font-semibold text-white transition hover:bg-[#083c42]"
              >
                Sign In
              </Link>
            )}
          </div>
        </header>

        <section className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-[#dde2e6] md:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-[#0b4a51]">Charity Directory</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-5xl">Explore and Support Verified Charities</h1>
          <p className="mt-3 max-w-190 text-lg text-[#5d6970] md:text-xl">
            Choose where your contribution goes. Every subscription supports your selected charity while keeping you in the monthly draw cycle.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <input
              value={searchText}
              onChange={(e) => {
                setPage(1);
                setSearchText(e.target.value);
              }}
              placeholder="Search charity name"
              className="rounded-2xl border border-[#d8dee3] bg-[#f8fafb] px-4 py-3 text-base outline-none transition focus:border-[#0b4a51] md:col-span-2"
            />

            <select
              value={category}
              onChange={(e) => {
                setPage(1);
                setCategory(e.target.value);
              }}
              className="rounded-2xl border border-[#d8dee3] bg-[#f8fafb] px-4 py-3 text-base outline-none transition focus:border-[#0b4a51]"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === 'all' ? 'All categories' : item}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setPage(1);
                setFeaturedOnly((prev) => !prev);
              }}
              className={`rounded-2xl px-4 py-3 text-base font-semibold transition ${
                featuredOnly
                  ? 'bg-[#0b4a51] text-white'
                  : 'border border-[#d8dee3] bg-[#f8fafb] text-[#2d3d46] hover:bg-white'
              }`}
            >
              {featuredOnly ? 'Featured Only: ON' : 'Featured Only'}
            </button>
          </div>
        </section>

        {spotlightCharity && (
          <section className="mt-6 rounded-3xl bg-[#0b4a51] p-6 text-white ring-1 ring-[#0f3f46] md:p-8">
            <p className="text-sm font-bold uppercase tracking-widest text-[#9dd9dd]">Spotlight Charity</p>
            <div className="mt-3 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <h2 className="text-3xl font-extrabold md:text-4xl">{spotlightCharity.name}</h2>
                <p className="mt-2 text-lg text-[#d6ecee]">{spotlightCharity.description || 'No description provided yet.'}</p>
                <p className="mt-3 text-sm text-[#b4d7db]">Category: {spotlightCharity.category || 'General'}</p>
              </div>
              <button
                onClick={() => fetchCharityDetail(spotlightCharity.id)}
                className="rounded-full bg-[#d8f3ae] px-6 py-3 text-base font-bold text-[#0e3c42] transition hover:bg-[#e6f8cb]"
              >
                View Profile
              </button>
            </div>
          </section>
        )}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {loading && Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-52 animate-pulse rounded-3xl bg-white ring-1 ring-[#dde2e6]" />
            ))}

            {!loading && charities.map((item) => (
              <article
                key={item.id}
                onClick={() => fetchCharityDetail(item.id)}
                className="cursor-pointer rounded-3xl bg-white p-5 ring-1 ring-[#dde2e6] transition hover:-translate-y-0.5 hover:ring-[#b9c7cf]"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xl font-bold text-[#1f2d36]">{item.name}</h3>
                  {item.is_featured && (
                    <span className="rounded-full bg-[#d8f3ae] px-2 py-1 text-xs font-bold text-[#285056]">Featured</span>
                  )}
                </div>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[#59717b]">{item.category || 'General'}</p>
                <p className="mt-3 line-clamp-3 text-base text-[#5d6970]">{item.description || 'No description available yet.'}</p>
                <p className="mt-4 text-sm text-[#56747b]">Total received: £{Math.round((Number(item.total_received) || 0) / 100)}</p>
              </article>
            ))}
          </div>

          <aside className="rounded-3xl bg-white p-6 ring-1 ring-[#dde2e6]">
            <p className="text-sm font-bold uppercase tracking-widest text-[#0b4a51]">Charity Profile</p>

            {selectedCharity ? (
              <>
                <h3 className="mt-2 text-3xl font-extrabold">{selectedCharity.name}</h3>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-[#5e6f79]">{selectedCharity.category || 'General'}</p>

                <div className="mt-4 overflow-hidden rounded-2xl bg-[#d2f1ae]/55 p-5">
                  <p className="text-sm font-bold uppercase tracking-widest text-[#29474d]">Upcoming Events</p>
                  <ul className="mt-3 space-y-2 text-base text-[#2f4d54]">
                    <li>- Charity Golf Day • 18 May</li>
                    <li>- Community Fundraiser • 02 Jun</li>
                    <li>- Junior Support Clinic • 20 Jun</li>
                  </ul>
                </div>

                <p className="mt-5 text-base leading-7 text-[#52606a]">
                  {selectedCharity.description || 'No profile description has been added for this charity yet.'}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#f3f7f9] p-4">
                    <p className="text-xs uppercase tracking-widest text-[#607881]">Raised</p>
                    <p className="mt-1 text-2xl font-bold text-[#1f2d36]">£{Math.round((Number(selectedCharity.total_received) || 0) / 100)}</p>
                  </div>
                  <div className="rounded-2xl bg-[#f3f7f9] p-4">
                    <p className="text-xs uppercase tracking-widest text-[#607881]">Status</p>
                    <p className="mt-1 text-2xl font-bold text-[#1f2d36]">{selectedCharity.is_active ? 'Active' : 'Paused'}</p>
                  </div>
                </div>

                <button 
                  onClick={handleSelectCharity}
                  className="mt-6 w-full rounded-2xl bg-[#0b4a51] px-5 py-3 text-lg font-bold text-white transition hover:bg-[#093f45]">
                  Select This Charity
                </button>
              </>
            ) : (
              <p className="mt-4 text-[#5d6970]">Pick a charity from the list to view full profile details.</p>
            )}
          </aside>
        </section>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-base text-[#5d6970]">
            Showing page {pagination.page} of {totalPages} ({pagination.total} charities)
          </p>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="rounded-xl border border-[#ccd6db] bg-white px-4 py-2 font-semibold text-[#314650] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Prev
            </button>
            <button
              disabled={pagination.page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="rounded-xl border border-[#ccd6db] bg-white px-4 py-2 font-semibold text-[#314650] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-3xl bg-white p-6 shadow-lg max-w-sm mx-4 md:p-8">
            <h2 className="text-2xl font-extrabold text-[#1e2530]">Sign In Required</h2>
            <p className="mt-3 text-base text-[#5d6970]">
              You need to be logged in to select a charity and participate in our monthly draws.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 rounded-xl border border-[#c9d1d6] bg-white px-4 py-2.5 font-semibold text-[#29434a] transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <Link
                to="/login"
                className="flex-1 rounded-xl bg-[#0b4a51] px-4 py-2.5 text-center font-semibold text-white transition hover:bg-[#083c42]"
              >
                Sign In
              </Link>
            </div>
            <p className="mt-4 text-center text-sm text-[#6b7a82]">
              New to GolFMaster?{' '}
              <Link to="/signup" className="font-semibold text-[#0b4a51] hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

export default CharitiesPage;
