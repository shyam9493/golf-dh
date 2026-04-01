import { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { BKEND_URL } from '../config.js';

export default function UserDashboard() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [scores, setScores] = useState([]);
  const [draws, setDraws] = useState([]);
  const [currentDraw, setCurrentDraw] = useState(null);
  const [charities, setCharities] = useState([]);
  const [winnings, setWinnings] = useState([]);
  const [winningsSummary, setWinningsSummary] = useState({
    total_winnings_pence: 0,
    pending_verification: 0,
    approved: 0,
    rejected: 0,
    paid: 0,
  });

  const [alert, setAlert] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [newScore, setNewScore] = useState('');
  const [newScoreDate, setNewScoreDate] = useState('');
  const [editingScoreId, setEditingScoreId] = useState(null);
  const [editingScoreValue, setEditingScoreValue] = useState('');
  const [editingScoreDate, setEditingScoreDate] = useState('');
  const [selectedCharity, setSelectedCharity] = useState('');
  const [contributionPct, setContributionPct] = useState(10);
  const [donateAmount, setDonateAmount] = useState('');
  const [country, setCountry] = useState('');
  const [proofForm, setProofForm] = useState({ draw_id: '', match_type: '3_match', proof_url: '' });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadAll();
  }, [token]);

  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const loadAll = async () => {
    try {
      setLoading(true);
      setError('');
      const [
        profileRes,
        subRes,
        scoresRes,
        drawsRes,
        currentRes,
        charitiesRes,
        winningsRes,
      ] = await Promise.allSettled([
        axios.get(`${BKEND_URL}/auth/profile`, authHeaders),
        axios.get(`${BKEND_URL}/subscriptions/status`, authHeaders),
        axios.get(`${BKEND_URL}/scores`, authHeaders),
        axios.get(`${BKEND_URL}/draws`, authHeaders),
        axios.get(`${BKEND_URL}/draws/current`, authHeaders),
        axios.get(`${BKEND_URL}/charities?is_active=true&limit=100`),
        axios.get(`${BKEND_URL}/winners/my`, authHeaders),
      ]);

      const getData = (result, fallback) => (result.status === 'fulfilled' ? result.value.data : fallback);

      const profileData = getData(profileRes, null);
      const subData = getData(subRes, {});
      const scoreData = getData(scoresRes, []);
      const drawData = getData(drawsRes, { data: [] });
      const currentDrawData = getData(currentRes, null);
      const charitiesData = getData(charitiesRes, { data: [] });
      const winningsData = getData(winningsRes, { data: [], summary: {} });

      setProfile(profileData || null);
      setSubscription(subData?.subscription || null);
      setScores(Array.isArray(scoreData) ? scoreData : []);
      setDraws(drawData?.data || []);
      setCurrentDraw(currentDrawData || null);
      setCharities(charitiesData?.data || []);
      setWinnings(winningsData?.data || []);
      setWinningsSummary((prev) => ({ ...prev, ...(winningsData?.summary || {}) }));

      if (profileData?.charity_id) {
        setSelectedCharity(String(profileData.charity_id));
      }
      if (profileData?.charity_pct) {
        setContributionPct(profileData.charity_pct);
      }
      if (profileData?.country) {
        setCountry(profileData.country);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg) => {
    setAlert(msg);
    setTimeout(() => setAlert(''), 2500);
  };

  const addScore = async () => {
    if (!newScore || !newScoreDate) {
      setError('Score and date are required.');
      return;
    }
    try {
      await axios.post(
        `${BKEND_URL}/scores`,
        { score: Number(newScore), played_at: newScoreDate || undefined },
        authHeaders
      );
      setNewScore('');
      setNewScoreDate('');
      notify('Score added.');
      loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add score.');
    }
  };

  const deleteScore = async (scoreId) => {
    try {
      await axios.delete(`${BKEND_URL}/scores/${scoreId}`, authHeaders);
      notify('Score deleted.');
      loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete score.');
    }
  };

  const startEditScore = (score) => {
    setEditingScoreId(score.id);
    setEditingScoreValue(String(score.value));
    setEditingScoreDate(score.played_at ? new Date(score.played_at).toISOString().slice(0, 10) : '');
  };

  const saveEditedScore = async () => {
    if (!editingScoreId || !editingScoreValue || !editingScoreDate) {
      setError('Score and date are required for editing.');
      return;
    }
    try {
      await axios.put(
        `${BKEND_URL}/scores/${editingScoreId}`,
        { score: Number(editingScoreValue), played_at: editingScoreDate || undefined },
        authHeaders
      );
      setEditingScoreId(null);
      setEditingScoreValue('');
      setEditingScoreDate('');
      notify('Score updated.');
      loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update score.');
    }
  };

  const saveProfile = async () => {
    try {
      await axios.post(`${BKEND_URL}/auth/update-profile`, { country }, authHeaders);
      notify('Profile updated.');
      loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile.');
    }
  };

  const saveCharitySettings = async () => {
    try {
      if (selectedCharity) {
        await axios.post(
          `${BKEND_URL}/charities/select`,
          { charity_id: Number(selectedCharity) },
          authHeaders
        );
      }
      await axios.post(
        `${BKEND_URL}/charities/contribution`,
        { charity_pct: Number(contributionPct) },
        authHeaders
      );
      notify('Charity settings updated.');
      loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update charity settings.');
    }
  };

  const donateNow = async () => {
    if (!selectedCharity || !donateAmount) return;
    try {
      await axios.post(
        `${BKEND_URL}/charities/donate`,
        { charity_id: Number(selectedCharity), amount_pence: Math.round(Number(donateAmount) * 100) },
        authHeaders
      );
      setDonateAmount('');
      notify('Donation recorded.');
      loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to record donation.');
    }
  };

  const submitProof = async () => {
    if (!proofForm.draw_id) return;
    try {
      await axios.post(`${BKEND_URL}/winners/proof`, proofForm, authHeaders);
      setProofForm({ draw_id: '', match_type: '3_match', proof_url: '' });
      notify('Winner proof submitted.');
      loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit proof.');
    }
  };

  const startCheckout = async (plan) => {
    try {
      const response = await axios.post(`${BKEND_URL}/subscriptions/checkout`, { plan }, authHeaders);
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to start checkout.');
    }
  };

  const cancelSubscription = async () => {
    try {
      await axios.post(`${BKEND_URL}/subscriptions/cancel`, {}, authHeaders);
      notify('Subscription cancelled.');
      loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to cancel subscription.');
    }
  };

  const openPortal = async () => {
    try {
      const response = await axios.post(`${BKEND_URL}/subscriptions/portal`, {}, authHeaders);
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to open billing portal.');
    }
  };

  const totalWon = winnings.reduce((sum, item) => sum + (item.prize_pence || 0), 0);
  const isActiveSub = subscription?.status === 'active';
  const publishedDrawsCount = draws.filter((d) => d.status === 'published').length;

  return (
    <main className="min-h-screen bg-[#eef0f2] text-[#1e2530] pb-10">
      <header className="sticky top-0 z-40 bg-[#0b4a51] text-white">
        <section className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div>
            <p className="text-xl font-extrabold">GolFMaster User Dashboard</p>
            <p className="text-xs text-white/75">Welcome, {profile?.full_name || user?.full_name || 'Player'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="rounded-full border border-white/40 px-3 py-1.5 text-sm font-semibold">Home</Link>
            <button onClick={logout} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-[#0b4a51]">Logout</button>
          </div>
        </section>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-5 md:px-6">
        {alert && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">{alert}</div>}
        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

        {loading ? (
          <div className="rounded-2xl bg-white p-6 ring-1 ring-[#dde2e6]">Loading dashboard...</div>
        ) : (
          <div className="grid gap-4">
            <section className="grid gap-4 md:grid-cols-4">
              <Card title="Subscription" value={subscription?.status || 'inactive'} />
              <Card title="Renewal" value={subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'} />
              <Card title="Draw Entries" value={draws.length} />
              <Card title="Total Won" value={`£${Math.round(totalWon / 100)}`} />
            </section>

            <section className="grid gap-4 md:grid-cols-4">
              <Card title="Published Draws" value={publishedDrawsCount} />
              <Card title="Pending Verifications" value={winningsSummary.pending_verification || 0} />
              <Card title="Approved Wins" value={winningsSummary.approved || 0} />
              <Card title="Paid Wins" value={winningsSummary.paid || 0} />
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <Panel title="Subscription Controls">
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => startCheckout('monthly')} className="rounded-xl bg-[#0b4a51] px-4 py-2 text-white font-semibold">Subscribe Monthly</button>
                  <button onClick={() => startCheckout('yearly')} className="rounded-xl bg-[#18373c] px-4 py-2 text-white font-semibold">Subscribe Yearly</button>
                  <button onClick={openPortal} disabled={!subscription} className="rounded-xl border border-[#cad4d9] bg-white px-4 py-2 font-semibold disabled:opacity-50">Billing Portal</button>
                  <button onClick={cancelSubscription} disabled={!isActiveSub} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-700 disabled:opacity-50">Cancel Subscription</button>
                </div>
                {!isActiveSub && <p className="mt-3 text-sm text-[#9a5f2a]">Activate subscription to enter scores, submit winner proof, and join draw participation.</p>}
              </Panel>

              <Panel title="Profile & Charity Settings">
                <div className="mb-3 grid gap-2 md:grid-cols-[1fr_auto]">
                  <input value={country} onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))} placeholder="Country code (e.g. IN)" className="rounded-xl border border-[#d8dee3] bg-[#f8fafb] px-3 py-2.5" />
                  <button onClick={saveProfile} className="rounded-xl border border-[#cad4d9] bg-white px-4 py-2 font-semibold">Save Profile</button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <select value={selectedCharity} onChange={(e) => setSelectedCharity(e.target.value)} className="rounded-xl border border-[#d8dee3] bg-[#f8fafb] px-3 py-2.5">
                    <option value="">Select charity</option>
                    {charities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <input type="number" min="10" max="100" value={contributionPct} onChange={(e) => setContributionPct(e.target.value)} className="rounded-xl border border-[#d8dee3] bg-[#f8fafb] px-3 py-2.5" placeholder="Contribution %" />
                </div>
                <button onClick={saveCharitySettings} disabled={!isActiveSub} className="mt-3 rounded-xl bg-[#0b4a51] px-4 py-2 text-white font-semibold disabled:opacity-50">Save Charity Settings</button>

                <div className="mt-4 flex gap-2">
                  <input type="number" min="1" value={donateAmount} onChange={(e) => setDonateAmount(e.target.value)} placeholder="Independent donation (£)" className="w-full rounded-xl border border-[#d8dee3] bg-[#f8fafb] px-3 py-2.5" />
                  <button onClick={donateNow} className="rounded-xl bg-[#18373c] px-4 py-2 text-white font-semibold">Donate</button>
                </div>
              </Panel>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <Panel title="Last 5 Scores (Stableford)">
                <div className="flex flex-wrap gap-2">
                  <input type="number" min="1" max="45" value={newScore} onChange={(e) => setNewScore(e.target.value)} placeholder="Score (1-45)" className="rounded-xl border border-[#d8dee3] bg-[#f8fafb] px-3 py-2.5" />
                  <input type="date" value={newScoreDate} onChange={(e) => setNewScoreDate(e.target.value)} className="rounded-xl border border-[#d8dee3] bg-[#f8fafb] px-3 py-2.5" />
                  <button onClick={addScore} disabled={!isActiveSub} className="rounded-xl bg-[#0b4a51] px-4 py-2 text-white font-semibold disabled:opacity-50">Add Score</button>
                </div>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-105">
                    <thead>
                      <tr className="border-b border-[#dde2e6] text-left text-sm text-[#5d6970]">
                        <th className="py-2">Date</th>
                        <th className="py-2">Score</th>
                        <th className="py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scores.map((s) => (
                        <tr key={s.id} className="border-b border-[#eef2f4]">
                          <td className="py-2">{new Date(s.played_at).toLocaleDateString()}</td>
                          <td className="py-2 font-semibold">{s.value}</td>
                          <td className="py-2">
                            <div className="flex gap-2">
                              <button onClick={() => startEditScore(s)} disabled={!isActiveSub} className="rounded-lg bg-blue-50 px-2 py-1 text-sm font-semibold text-blue-700 disabled:opacity-50">Edit</button>
                              <button onClick={() => deleteScore(s.id)} disabled={!isActiveSub} className="rounded-lg bg-red-50 px-2 py-1 text-sm font-semibold text-red-700 disabled:opacity-50">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {editingScoreId && (
                  <div className="mt-3 grid gap-2 rounded-xl bg-[#f8fafb] p-3 md:grid-cols-[1fr_1fr_auto_auto]">
                    <input type="number" min="1" max="45" value={editingScoreValue} onChange={(e) => setEditingScoreValue(e.target.value)} className="rounded-xl border border-[#d8dee3] bg-white px-3 py-2" />
                    <input type="date" value={editingScoreDate} onChange={(e) => setEditingScoreDate(e.target.value)} className="rounded-xl border border-[#d8dee3] bg-white px-3 py-2" />
                    <button onClick={saveEditedScore} disabled={!isActiveSub} className="rounded-xl bg-[#0b4a51] px-4 py-2 text-white font-semibold disabled:opacity-50">Save</button>
                    <button onClick={() => setEditingScoreId(null)} className="rounded-xl border border-[#cad4d9] bg-white px-4 py-2 font-semibold">Cancel</button>
                  </div>
                )}
              </Panel>

              <Panel title="Draw Participation & Current Draw">
                <p className="text-sm text-[#5d6970]">Current draw: {currentDraw ? (currentDraw.drawn_numbers || []).join(', ') : 'Not published yet'}</p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-105">
                    <thead>
                      <tr className="border-b border-[#dde2e6] text-left text-sm text-[#5d6970]">
                        <th className="py-2">Month</th>
                        <th className="py-2">Mode</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {draws.slice(0, 8).map((d) => (
                        <tr key={d.id} className="border-b border-[#eef2f4]">
                          <td className="py-2">{d.month ? new Date(d.month).toLocaleDateString() : 'N/A'}</td>
                          <td className="py-2">{d.mode}</td>
                          <td className="py-2 capitalize">{d.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <Panel title="Winnings Overview">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-125">
                    <thead>
                      <tr className="border-b border-[#dde2e6] text-left text-sm text-[#5d6970]">
                        <th className="py-2">Draw</th>
                        <th className="py-2">Match</th>
                        <th className="py-2">Prize</th>
                        <th className="py-2">Verify</th>
                        <th className="py-2">Payout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {winnings.map((w) => (
                        <tr key={w.id} className="border-b border-[#eef2f4]">
                          <td className="py-2">{w.draw_id}</td>
                          <td className="py-2">{w.match_type}</td>
                          <td className="py-2">£{Math.round((w.prize_pence || 0) / 100)}</td>
                          <td className="py-2">{w.verify_status}</td>
                          <td className="py-2">{w.payout_status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel title="Winner Proof Upload">
                <div className="grid gap-3">
                  <input value={proofForm.draw_id} onChange={(e) => setProofForm((p) => ({ ...p, draw_id: e.target.value }))} placeholder="Draw ID" className="rounded-xl border border-[#d8dee3] bg-[#f8fafb] px-3 py-2.5" />
                  <select value={proofForm.match_type} onChange={(e) => setProofForm((p) => ({ ...p, match_type: e.target.value }))} className="rounded-xl border border-[#d8dee3] bg-[#f8fafb] px-3 py-2.5">
                    <option value="3_match">3 Match</option>
                    <option value="4_match">4 Match</option>
                    <option value="5_match">5 Match</option>
                  </select>
                  <input value={proofForm.proof_url} onChange={(e) => setProofForm((p) => ({ ...p, proof_url: e.target.value }))} placeholder="Proof URL (optional)" className="rounded-xl border border-[#d8dee3] bg-[#f8fafb] px-3 py-2.5" />
                  <button onClick={submitProof} disabled={!isActiveSub} className="rounded-xl bg-[#0b4a51] px-4 py-2 text-white font-semibold disabled:opacity-50">Submit Proof</button>
                </div>
              </Panel>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

function Card({ title, value }) {
  return (
    <article className="rounded-2xl bg-white p-4 ring-1 ring-[#dde2e6]">
      <p className="text-xs font-bold uppercase tracking-wide text-[#0b4a51]">{title}</p>
      <p className="mt-2 text-2xl font-extrabold text-[#1e2530]">{value}</p>
    </article>
  );
}

function Panel({ title, children }) {
  return (
    <article className="rounded-2xl bg-white p-4 ring-1 ring-[#dde2e6] md:p-5">
      <h2 className="text-lg font-extrabold text-[#1e2530]">{title}</h2>
      <div className="mt-3">{children}</div>
    </article>
  );
}
