import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BKEND_URL } from '../config.js';

export default function AdminDashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!token) {
      navigate('/admin/login');
      return;
    }

    // Check if user is admin
    if (user && user.role === 'admin') {
      setIsAuthorized(true);
    } else if (user && user.role !== 'admin') {
      // User is logged in but not an admin, redirect to login with error
      localStorage.removeItem('authToken');
      navigate('/admin/login?error=unauthorized');
    }
  }, [token, user, navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
  };

  return (
    <main className="min-h-screen bg-[#eef0f2] text-[#1e2530]">
      {!isAuthorized ? (
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-semibold text-[#1e2530] mb-4">Verifying access...</p>
            <p className="text-[#5d6970]">Redirecting to admin login</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <header className="bg-[#0b4a51] text-white sticky top-0 z-40">
            <section className="mx-auto max-w-full px-5 py-4 md:px-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 rounded-full bg-white/20">
                  <span className="absolute left-2.5 top-1.5 text-base text-[#d8f3ae]">●</span>
                  <span className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-white"></span>
                </div>
                <p className="text-2xl font-extrabold">GolFMaster Admin</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span>Welcome, {user?.full_name || 'Admin'}</span>
                <button
                  onClick={logout}
                  className="rounded-full border border-white/40 px-4 py-2 font-semibold transition hover:bg-white/10"
                >
                  Logout
                </button>
              </div>
            </section>
          </header>

          {/* Navigation Tabs */}
          <div className="bg-white border-b border-[#dde2e6] sticky top-20 z-30">
            <div className="mx-auto max-w-full px-5 md:px-8">
              <div className="flex gap-2 overflow-x-auto pb-0">
                {[
                  { id: 'dashboard', label: '📊 Dashboard' },
                  { id: 'users', label: '👥 Users' },
                  { id: 'charities', label: '🏛️ Charities' },
                  { id: 'subscriptions', label: '💳 Subscriptions' },
                  { id: 'draws', label: '🎲 Draws' },
                  { id: 'winners', label: '🏆 Winners' },
                  { id: 'payouts', label: '💰 Payouts' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-4 py-3 font-semibold whitespace-nowrap transition border-b-2 ${
                      activeTab === tab.id
                        ? 'border-[#0b4a51] text-[#0b4a51]'
                        : 'border-transparent text-[#6b7a82] hover:text-[#0b4a51]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <section className="mx-auto max-w-full px-5 py-8 md:px-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && <DashboardTab token={token} />}

            {/* Users Tab */}
            {activeTab === 'users' && <UsersTab token={token} />}

            {/* Charities Tab */}
            {activeTab === 'charities' && <CharitiesTab token={token} />}

            {/* Subscriptions Tab */}
            {activeTab === 'subscriptions' && <SubscriptionsTab token={token} />}

            {/* Draws Tab */}
            {activeTab === 'draws' && <DrawsTab token={token} />}

            {/* Winners Tab */}
            {activeTab === 'winners' && <WinnersTab token={token} />}

            {/* Payouts Tab */}
            {activeTab === 'payouts' && <PayoutsTab token={token} />}
          </section>
        </>
      )}
    </main>
  );
}

// ============ DASHBOARD TAB ============
function DashboardTab({ token }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalCharities: 0,
    pendingWinners: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [users, charities, winners] = await Promise.all([
        axios.get(`${BKEND_URL}/admin/users?limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BKEND_URL}/charities?limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BKEND_URL}/winners/admin?limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStats((prev) => ({
        ...prev,
        totalUsers: users.data?.pagination?.total || 0,
        totalCharities: charities.data?.pagination?.total || 0,
        pendingWinners: winners.data?.pagination?.total || 0,
      }));
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-[#1e2530]">Dashboard Overview</h2>
        <p className="mt-2 text-[#5d6970]">Platform statistics and key metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.totalUsers} icon="👥" />
        <StatCard label="Active Subscriptions" value={stats.activeSubscriptions} icon="💳" />
        <StatCard label="Listed Charities" value={stats.totalCharities} icon="🏛️" />
        <StatCard label="Pending Winners" value={stats.pendingWinners} icon="🏆" />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-3xl bg-white p-6 ring-1 ring-[#dde2e6]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#0b4a51]">{label}</p>
          <p className="mt-3 text-4xl font-extrabold text-[#1e2530]">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}

// ============ USERS TAB ============
function UsersTab({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [editingRole, setEditingRole] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [editingSubscriptionUser, setEditingSubscriptionUser] = useState(null);
  const [subForm, setSubForm] = useState({ status: 'active', plan: 'monthly' });
  const [showScoresModal, setShowScoresModal] = useState(false);
  const [scoresForUser, setScoresForUser] = useState([]);
  const [scoresUser, setScoresUser] = useState(null);
  const [editingScoreId, setEditingScoreId] = useState(null);
  const [editingScoreValue, setEditingScoreValue] = useState('');

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BKEND_URL}/admin/users`, {
        params: { page, limit: 10, search: search || undefined },
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.data || []);
      setPagination(response.data.pagination || { page: 1, limit: 10, total: 0 });
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1e2530]">Users Management</h2>
          <p className="mt-1 text-[#5d6970]">Total: {pagination.total} users</p>
        </div>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="rounded-2xl border border-[#d8dee3] bg-[#f8fafb] px-4 py-2.5 text-base outline-none transition focus:border-[#0b4a51] md:w-80"
        />
      </div>

      <div className="rounded-3xl bg-white ring-1 ring-[#dde2e6] overflow-x-auto">
        <table className="w-full min-w-190">
          <thead className="bg-[#f4f7f8]">
            <tr className="border-b border-[#dde2e6]">
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Name</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Email</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Role</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Subscription</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-[#5d6970]">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-[#5d6970]">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-[#dde2e6] hover:bg-[#f8fafb]">
                  <td className="px-6 py-4 font-semibold text-[#1e2530]">{u.full_name}</td>
                  <td className="px-6 py-4 text-[#5d6970]">{u.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-[#d8f3ae] text-[#285056]'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        u.subscription_status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {u.subscription_status || 'none'}
                    </span>
                    <p className="mt-1 text-xs text-[#6b7a82]">{u.subscription_plan || 'no plan'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {editingRole === u.id ? (
                        <div className="flex gap-2">
                          <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="rounded-lg border border-[#d8dee3] px-2 py-1 text-sm">
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                          <button onClick={() => updateRole(u.id)} className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 font-semibold">Save</button>
                          <button onClick={() => setEditingRole(null)} className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingRole(u.id); setNewRole(u.role); }} className="text-xs px-3 py-1 rounded-lg bg-blue-100 text-blue-700 font-semibold">Change Role</button>
                      )}

                      <button
                        onClick={() => openSubscriptionEditor(u)}
                        className="text-xs px-3 py-1 rounded-lg bg-amber-100 text-amber-700 font-semibold"
                      >
                        Manage Sub
                      </button>
                      <button
                        onClick={() => openScoresEditor(u)}
                        className="text-xs px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 font-semibold"
                      >
                        Edit Scores
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-[#5d6970]">
          Page {pagination.page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPage(Math.max(1, page - 1))}
            className="rounded-xl border border-[#ccd6db] bg-white px-4 py-2 font-semibold text-[#314650] disabled:opacity-45"
          >
            Prev
          </button>
          <button
            disabled={pagination.page >= totalPages}
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            className="rounded-xl border border-[#ccd6db] bg-white px-4 py-2 font-semibold text-[#314650] disabled:opacity-45"
          >
            Next
          </button>
        </div>
      </div>

      {editingSubscriptionUser && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 ring-1 ring-[#dde2e6]">
            <h3 className="text-xl font-extrabold text-[#1e2530]">Manage Subscription</h3>
            <p className="mt-1 text-sm text-[#5d6970]">{editingSubscriptionUser.full_name}</p>
            <div className="mt-4 grid gap-3">
              <select value={subForm.status} onChange={(e) => setSubForm((prev) => ({ ...prev, status: e.target.value }))} className="rounded-xl border border-[#d8dee3] px-3 py-2.5">
                <option value="active">active</option>
                <option value="lapsed">lapsed</option>
                <option value="canceled">canceled</option>
              </select>
              <select value={subForm.plan} onChange={(e) => setSubForm((prev) => ({ ...prev, plan: e.target.value }))} className="rounded-xl border border-[#d8dee3] px-3 py-2.5">
                <option value="monthly">monthly</option>
                <option value="yearly">yearly</option>
              </select>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={saveSubscription} className="flex-1 rounded-xl bg-[#0b4a51] py-2.5 text-white font-semibold">Save</button>
              <button onClick={() => setEditingSubscriptionUser(null)} className="flex-1 rounded-xl border border-[#d8dee3] py-2.5 font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showScoresModal && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 ring-1 ring-[#dde2e6]">
            <h3 className="text-xl font-extrabold text-[#1e2530]">Edit Scores</h3>
            <p className="mt-1 text-sm text-[#5d6970]">{scoresUser?.full_name}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-125">
                <thead>
                  <tr className="border-b border-[#dde2e6] text-left text-sm text-[#5d6970]">
                    <th className="py-2">Date</th>
                    <th className="py-2">Score</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scoresForUser.map((s) => (
                    <tr key={s.id} className="border-b border-[#eef2f4]">
                      <td className="py-2">{new Date(s.played_at).toLocaleDateString()}</td>
                      <td className="py-2">
                        {editingScoreId === s.id ? (
                          <input
                            type="number"
                            min="1"
                            max="45"
                            value={editingScoreValue}
                            onChange={(e) => setEditingScoreValue(e.target.value)}
                            className="rounded-lg border border-[#d8dee3] px-2 py-1 w-24"
                          />
                        ) : (
                          <span className="font-semibold">{s.value}</span>
                        )}
                      </td>
                      <td className="py-2">
                        {editingScoreId === s.id ? (
                          <div className="flex gap-2">
                            <button onClick={() => saveAdminScore(s.id)} className="rounded-lg bg-green-100 text-green-700 px-2 py-1 text-sm font-semibold">Save</button>
                            <button onClick={() => setEditingScoreId(null)} className="rounded-lg bg-gray-100 text-gray-700 px-2 py-1 text-sm font-semibold">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingScoreId(s.id); setEditingScoreValue(String(s.value)); }} className="rounded-lg bg-indigo-100 text-indigo-700 px-2 py-1 text-sm font-semibold">Edit</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => { setShowScoresModal(false); setEditingScoreId(null); }} className="rounded-xl border border-[#d8dee3] px-4 py-2 font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  async function updateRole(userId) {
    try {
      await axios.patch(`${BKEND_URL}/admin/users/${userId}`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadUsers();
      setEditingRole(null);
    } catch (err) {
      console.error('Error updating role:', err);
    }
  }

  function openSubscriptionEditor(user) {
    setEditingSubscriptionUser(user);
    setSubForm({
      status: user.subscription_status || 'active',
      plan: user.subscription_plan || 'monthly',
    });
  }

  async function saveSubscription() {
    if (!editingSubscriptionUser) return;
    try {
      await axios.patch(
        `${BKEND_URL}/admin/users/${editingSubscriptionUser.id}`,
        { subscription: { status: subForm.status, plan: subForm.plan } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingSubscriptionUser(null);
      loadUsers();
    } catch (err) {
      console.error('Error updating subscription:', err);
    }
  }

  async function openScoresEditor(user) {
    try {
      const response = await axios.get(`${BKEND_URL}/scores/admin/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScoresForUser(response.data.data || []);
      setScoresUser(user);
      setShowScoresModal(true);
    } catch (err) {
      console.error('Error loading scores for user:', err);
    }
  }

  async function saveAdminScore(scoreId) {
    try {
      await axios.put(
        `${BKEND_URL}/scores/admin/${scoreId}`,
        { score: Number(editingScoreValue) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (scoresUser) {
        const response = await axios.get(`${BKEND_URL}/scores/admin/user/${scoresUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setScoresForUser(response.data.data || []);
      }
      setEditingScoreId(null);
    } catch (err) {
      console.error('Error updating score by admin:', err);
    }
  }
}

// ============ CHARITIES TAB ============
function CharitiesTab({ token }) {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingCharity, setEditingCharity] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', category: 'General', is_featured: false });

  useEffect(() => {
    loadCharities();
  }, [page, search]);

  const loadCharities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BKEND_URL}/charities`, {
        params: { page, limit: 10, search: search || undefined, is_active: true },
        headers: { Authorization: `Bearer ${token}` },
      });
      setCharities(response.data.data || []);
      setPagination(response.data.pagination || { page: 1, limit: 10, total: 0 });
    } catch (err) {
      console.error('Error loading charities:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1e2530]">Charities Management</h2>
          <p className="mt-1 text-[#5d6970]">Total: {pagination.total} active charities</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search charities..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-2xl border border-[#d8dee3] bg-[#f8fafb] px-4 py-2.5 text-base outline-none transition focus:border-[#0b4a51] md:w-80"
          />
          <button onClick={() => { setEditingCharity(null); setFormData({ name: '', description: '', category: 'General', is_featured: false }); setShowModal(true); }} className="rounded-2xl bg-[#0b4a51] text-white px-4 py-2.5 font-semibold transition hover:bg-[#083c42]">
            + Add Charity
          </button>
        </div>
      </div>

      <div className="rounded-3xl bg-white ring-1 ring-[#dde2e6] overflow-x-auto">
        <table className="w-full min-w-190">
          <thead className="bg-[#f4f7f8]">
            <tr className="border-b border-[#dde2e6]">
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Name</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Category</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Featured</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Total Raised</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-[#5d6970]">
                  Loading charities...
                </td>
              </tr>
            ) : charities.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-[#5d6970]">
                  No charities found
                </td>
              </tr>
            ) : (
              charities.map((c) => (
                <tr key={c.id} className="border-b border-[#dde2e6] hover:bg-[#f8fafb]">
                  <td className="px-6 py-4 font-semibold text-[#1e2530]">{c.name}</td>
                  <td className="px-6 py-4 text-[#5d6970]">{c.category || 'General'}</td>
                  <td className="px-6 py-4">
                    {c.is_featured ? (
                      <span className="rounded-full bg-[#d8f3ae] px-3 py-1 text-xs font-bold text-[#285056]">
                        Yes
                      </span>
                    ) : (
                      <span className="text-[#9fb5bf]">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold">£{Math.round((c.total_received || 0) / 100)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingCharity(c); setFormData({ name: c.name, description: c.description || '', category: c.category || 'General', is_featured: c.is_featured }); setShowModal(true); }} className="text-sm px-3 py-1 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200">Edit</button>
                      <button onClick={() => deleteCharity(c.id)} className="text-sm px-3 py-1 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && <CharityModal charity={editingCharity} formData={formData} setFormData={setFormData} onSave={saveCharity} onClose={() => setShowModal(false)} token={token} />}

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-[#5d6970]">
          Page {pagination.page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPage(Math.max(1, page - 1))}
            className="rounded-xl border border-[#ccd6db] bg-white px-4 py-2 font-semibold text-[#314650] disabled:opacity-45"
          >
            Prev
          </button>
          <button
            disabled={pagination.page >= totalPages}
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            className="rounded-xl border border-[#ccd6db] bg-white px-4 py-2 font-semibold text-[#314650] disabled:opacity-45"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

  async function deleteCharity(charityId) {
    if (confirm('Are you sure you want to delete this charity?')) {
      try {
        await axios.delete(`${BKEND_URL}/charities/admin/${charityId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        loadCharities();
      } catch (err) {
        console.error('Error deleting charity:', err);
      }
    }
  }

  async function saveCharity() {
    try {
      if (editingCharity) {
        await axios.post(`${BKEND_URL}/charities/admin/${editingCharity.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${BKEND_URL}/charities/admin`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowModal(false);
      loadCharities();
    } catch (err) {
      console.error('Error saving charity:', err);
    }
  }
}

// ============ CHARITY MODAL COMPONENT ============
function CharityModal({ charity, formData, setFormData, onSave, onClose, token }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full">
        <h3 className="text-2xl font-extrabold text-[#1e2530] mb-6">{charity ? 'Edit Charity' : 'Add New Charity'}</h3>
        <div className="space-y-4">
          <input type="text" placeholder="Charity Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border border-[#d8dee3] px-4 py-2.5 outline-none focus:border-[#0b4a51]" />
          <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-xl border border-[#d8dee3] px-4 py-2.5 outline-none focus:border-[#0b4a51] min-h-24" />
          <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full rounded-xl border border-[#d8dee3] px-4 py-2.5 outline-none focus:border-[#0b4a51]">
            <option>General</option>
            <option>Healthcare</option>
            <option>Education</option>
            <option>Environment</option>
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="w-5 h-5" />
            <span className="text-[#1e2530] font-semibold">Featured Charity</span>
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onSave} className="flex-1 rounded-xl bg-[#0b4a51] text-white py-2.5 font-semibold transition hover:bg-[#083c42]">Save</button>
          <button onClick={onClose} className="flex-1 rounded-xl border border-[#d8dee3] py-2.5 font-semibold transition hover:bg-[#f8fafb]">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ============ SUBSCRIPTIONS TAB ============
function SubscriptionsTab({ token }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BKEND_URL}/admin/users`, {
        params: { limit: 50, sub_status: 'active' },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubscriptions(response.data.data || []);
    } catch (err) {
      console.error('Error loading subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-[#1e2530]">Active Subscriptions</h2>
        <p className="mt-1 text-[#5d6970]">Total: {subscriptions.length} active subscriptions</p>
      </div>

      <div className="rounded-3xl bg-white ring-1 ring-[#dde2e6] overflow-x-auto">
        <table className="w-full min-w-190">
          <thead className="bg-[#f4f7f8]">
            <tr className="border-b border-[#dde2e6]">
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Subscriber Name</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Email</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Plan</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-[#5d6970]">
                  Loading subscriptions...
                </td>
              </tr>
            ) : subscriptions.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-[#5d6970]">
                  No active subscriptions yet
                </td>
              </tr>
            ) : (
              subscriptions.map((s) => (
                <tr key={s.id} className="border-b border-[#dde2e6] hover:bg-[#f8fafb]">
                  <td className="px-6 py-4 font-semibold text-[#1e2530]">{s.full_name}</td>
                  <td className="px-6 py-4 text-[#5d6970]">{s.email}</td>
                  <td className="px-6 py-4 font-semibold">Monthly</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      Active
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ DRAWS TAB ============
function DrawsTab({ token }) {
  const [showForm, setShowForm] = useState(false);
  const [drawMode, setDrawMode] = useState('random');
  const [simulating, setSimulating] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDrawHistory();
  }, []);

  const loadDrawHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BKEND_URL}/draws`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDraws(response.data.data || []);
    } catch (err) {
      console.error('Error loading draws:', err);
    } finally {
      setLoading(false);
    }
  };

  const simulateDraw = async () => {
    try {
      setSimulating(true);
      const response = await axios.post(
        `${BKEND_URL}/draws/admin/simulate`,
        { mode: drawMode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSimResult(response.data);
      loadDrawHistory();
    } catch (err) {
      console.error('Error simulating draw:', err);
    } finally {
      setSimulating(false);
    }
  };

  const executeDraw = async (drawId = null) => {
    if (!confirm('Declare results now? This will publish and notify users.')) return;
    try {
      setExecuting(true);
      await axios.post(
        `${BKEND_URL}/draws/admin/execute`,
        drawId ? { draw_id: drawId } : { mode: drawMode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowForm(false);
      setSimResult(null);
      loadDrawHistory();
    } catch (err) {
      console.error('Error executing draw:', err);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1e2530]">Draw Management</h2>
          <p className="mt-1 text-[#5d6970]">Step 1: Save simulation. Step 2: Declare saved draw result.</p>
        </div>
        {!showForm && <button onClick={() => setShowForm(true)} className="rounded-2xl bg-[#0b4a51] text-white px-6 py-3 font-semibold transition hover:bg-[#083c42]">+ Start New Simulation</button>}
      </div>

      {showForm && (
        <div className="rounded-3xl bg-white p-8 ring-1 ring-[#dde2e6] mb-8">
          <h3 className="text-xl font-extrabold text-[#1e2530] mb-4">Create and Save Simulation</h3>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-[#0b4a51] mb-2">Draw Mode</label>
              <select value={drawMode} onChange={(e) => setDrawMode(e.target.value)} className="w-full rounded-xl border border-[#d8dee3] px-4 py-2.5 outline-none focus:border-[#0b4a51]">
                <option value="random">Random Draw</option>
                <option value="weighted">Weighted Draw (by subscription)</option>
              </select>
            </div>
          </div>
          <button onClick={simulateDraw} disabled={simulating} className="w-full rounded-xl bg-blue-600 text-white py-3 font-semibold transition hover:bg-blue-700 disabled:opacity-50">
            {simulating ? 'Saving simulation...' : '💾 Save Simulation'}
          </button>
          {simResult && (
            <div className="mt-6 p-6 bg-[#f8fafb] rounded-2xl">
              <p className="font-semibold text-[#0b4a51] mb-3">Simulation Saved</p>
              <p className="text-[#5d6970] mb-2">Saved Draw ID: <span className="font-bold text-[#1e2530]">#{simResult?.draw?.id || '—'}</span></p>
              <p className="text-[#5d6970] mb-4">Numbers: <span className="font-bold text-[#1e2530]">{(simResult?.draw?.drawn_numbers || []).join(', ') || '—'}</span></p>
              <button onClick={() => executeDraw(simResult?.draw?.id)} disabled={executing || !simResult?.draw?.id} className="w-full rounded-xl bg-green-600 text-white py-3 font-semibold transition hover:bg-green-700 disabled:opacity-50">
                {executing ? 'Declaring...' : '📢 Declare This Saved Draw'}
              </button>
              <button onClick={() => { setShowForm(false); setSimResult(null); }} className="w-full mt-2 rounded-xl border border-[#d8dee3] py-3 font-semibold transition hover:bg-[#f8fafb]">
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      <div className="rounded-3xl bg-white ring-1 ring-[#dde2e6] overflow-x-auto">
        <table className="w-full min-w-225">
          <thead className="bg-[#f4f7f8]">
            <tr className="border-b border-[#dde2e6]">
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Month</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Mode</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Numbers</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Status</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Published</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-[#5d6970]">Loading draws...</td></tr>
            ) : draws.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-[#5d6970]">No draws yet</td></tr>
            ) : (
              draws.map((d) => (
                <tr key={d.id} className="border-b border-[#dde2e6] hover:bg-[#f8fafb]">
                  <td className="px-6 py-4 text-[#5d6970]">{d.month ? new Date(d.month).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4 font-semibold text-[#1e2530]">{d.mode === 'random' ? '🎲 Random' : '⚖️ Weighted'}</td>
                  <td className="px-6 py-4 font-semibold text-[#1e2530]">{(d.drawn_numbers || []).join(', ') || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${d.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {d.status || 'unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#5d6970]">{d.published_at ? new Date(d.published_at).toLocaleString() : 'Not declared'}</td>
                  <td className="px-6 py-4">
                    {d.status === 'simulation' ? (
                      <button onClick={() => executeDraw(d.id)} disabled={executing} className="rounded-lg bg-green-600 text-white px-3 py-1 text-sm font-semibold transition hover:bg-green-700 disabled:opacity-50">
                        Declare Result
                      </button>
                    ) : (
                      <span className="text-[#9fb5bf] text-sm">Done</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ WINNERS TAB ============
function WinnersTab({ token }) {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWinners();
  }, []);

  const loadWinners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BKEND_URL}/winners/admin`, {
        params: { limit: 20 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setWinners(response.data.data || []);
    } catch (err) {
      console.error('Error loading winners:', err);
    } finally {
      setLoading(false);
    }
  };

  const verifyWinner = async (winnerId, status) => {
    try {
      await axios.post(
        `${BKEND_URL}/winners/admin/${winnerId}/verify`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWinners((prev) =>
        prev.map((w) =>
          w.id === winnerId
            ? {
                ...w,
                verify_status: status,
                payout_status: status === 'approved' ? (w.payout_status || 'pending') : w.payout_status,
              }
            : w
        )
      );
    } catch (err) {
      console.error('Error verifying winner:', err);
    }
  };

  const markWinnerPaid = async (winnerId) => {
    try {
      await axios.patch(
        `${BKEND_URL}/winners/admin/${winnerId}/payout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWinners((prev) =>
        prev.map((w) => (w.id === winnerId ? { ...w, payout_status: 'paid' } : w))
      );
    } catch (err) {
      console.error('Error marking payout as paid:', err);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-[#1e2530]">Pending Winners</h2>
        <p className="mt-1 text-[#5d6970]">Verify and approve winner claims</p>
      </div>

      <div className="rounded-3xl bg-white ring-1 ring-[#dde2e6] overflow-x-auto">
        <table className="w-full min-w-190">
          <thead className="bg-[#f4f7f8]">
            <tr className="border-b border-[#dde2e6]">
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">User</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Match Type</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Prize</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Status</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-[#5d6970]">
                  Loading pending winners...
                </td>
              </tr>
            ) : winners.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-[#5d6970]">
                  No pending winners
                </td>
              </tr>
            ) : (
              winners.map((w) => (
                <tr key={w.id} className="border-b border-[#dde2e6] hover:bg-[#f8fafb]">
                  <td className="px-6 py-4 font-semibold text-[#1e2530]">{w.user?.full_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-[#5d6970]">{w.match_type}</td>
                  <td className="px-6 py-4 font-semibold">£{Math.round(w.prize_pence / 100)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        w.verify_status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : w.verify_status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {w.verify_status || 'pending'}
                      </span>
                      {w.verify_status === 'approved' && (
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          w.payout_status === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          payout: {w.payout_status || 'pending'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {w.verify_status === 'pending' && (
                        <>
                          <button
                            onClick={() => verifyWinner(w.id, 'approved')}
                            className="rounded-lg bg-green-600 text-white px-3 py-1 text-sm font-semibold transition hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => verifyWinner(w.id, 'rejected')}
                            className="rounded-lg bg-red-600 text-white px-3 py-1 text-sm font-semibold transition hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {w.verify_status === 'approved' && w.payout_status !== 'paid' && (
                        <button
                          onClick={() => markWinnerPaid(w.id)}
                          className="rounded-lg bg-blue-600 text-white px-3 py-1 text-sm font-semibold transition hover:bg-blue-700"
                        >
                          Mark as Paid
                        </button>
                      )}
                      {w.verify_status === 'approved' && w.payout_status === 'paid' && (
                        <span className="rounded-lg bg-blue-100 text-blue-700 px-3 py-1 text-sm font-semibold">
                          Paid
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ PAYOUTS TAB ============
function PayoutsTab({ token }) {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalContributions, setTotalContributions] = useState(0);

  useEffect(() => {
    loadPayoutData();
  }, []);

  const loadPayoutData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BKEND_URL}/charities?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const charitiesData = response.data.data || [];
      setCharities(charitiesData);
      const total = charitiesData.reduce((sum, c) => sum + (c.total_received || 0), 0);
      setTotalContributions(total);
    } catch (err) {
      console.error('Error loading payouts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-[#1e2530]">Payouts & Contributions</h2>
        <p className="mt-1 text-[#5d6970]">Track charity contributions and payment history</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <div className="rounded-2xl bg-[#0b4a51] text-white p-6">
          <p className="font-semibold text-white/80 mb-2">Total Contributions</p>
          <p className="text-4xl font-extrabold">£{Math.round(totalContributions / 100)}</p>
        </div>
        <div className="rounded-2xl bg-green-600 text-white p-6">
          <p className="font-semibold text-white/80 mb-2">Charities Supported</p>
          <p className="text-4xl font-extrabold">{charities.length}</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white ring-1 ring-[#dde2e6] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#f4f7f8]">
            <tr className="border-b border-[#dde2e6]">
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Charity</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Category</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">Total Raised</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#0b4a51]">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-[#5d6970]">Loading contributions...</td></tr>
            ) : charities.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-[#5d6970]">No contribution data</td></tr>
            ) : (
              charities.sort((a, b) => (b.total_received || 0) - (a.total_received || 0)).map((c) => {
                const raised = c.total_received || 0;
                const percentage = totalContributions > 0 ? Math.round((raised / totalContributions) * 100) : 0;
                return (
                  <tr key={c.id} className="border-b border-[#dde2e6] hover:bg-[#f8fafb]">
                    <td className="px-6 py-4 font-semibold text-[#1e2530]">{c.name}</td>
                    <td className="px-6 py-4 text-[#5d6970]">{c.category || 'General'}</td>
                    <td className="px-6 py-4 font-bold text-[#0b4a51]">£{Math.round(raised / 100)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-[#dde2e6] rounded-full overflow-hidden">
                          <div className="h-full bg-[#0b4a51]" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="text-sm font-semibold text-[#5d6970]">{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
