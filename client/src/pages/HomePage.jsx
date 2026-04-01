import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

function HomePage() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#eef0f2] text-[#1e2530]">
      <section className="mx-auto max-w-315 pb-10 pt-6 md:px-8 md:pt-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-full bg-[#0b4a51]">
              <span className="absolute left-2.5 top-1.5 text-base text-[#94f7c4]">●</span>
              <span className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-white"></span>
            </div>
            <p className="text-[30px] font-extrabold tracking-tight text-[#20323a]">GolFMaster</p>
          </div>

          <nav className="hidden items-center gap-9 text-[18px] md:flex">
            <Link to="/" className="font-semibold text-[#1e2530]">Home</Link>
            <Link to="/charities" className="text-[#4e5b65] transition hover:text-[#1e2530]">Charities</Link>
            <a href="#" className="text-[#4e5b65] transition hover:text-[#1e2530]">How Draws Work</a>
            <a href="#" className="text-[#4e5b65] transition hover:text-[#1e2530]">Impact</a>
          </nav>

          {token ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/dashboard')}
                className="rounded-full border border-[#c9d1d6] bg-white px-6 py-3 text-base font-semibold text-[#29434a] transition hover:bg-slate-50">
                Dashboard
              </button>
              <button 
                onClick={() => navigate('/charities')}
                className="rounded-full bg-[#0b4a51] px-8 py-3 text-base font-semibold text-white transition hover:bg-[#083c42] active:scale-[0.98]">
                Select Charity
              </button>
              <button 
                onClick={logout}
                className="rounded-full border border-[#c9d1d6] bg-white px-6 py-3 text-base font-semibold text-[#29434a] transition hover:bg-slate-50">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-full border border-[#c9d1d6] bg-white px-6 py-3 text-base font-semibold text-[#29434a] transition hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-[#0b4a51] px-8 py-3 text-base font-semibold text-white transition hover:bg-[#083c42] active:scale-[0.98]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </header>

        <div className="relative mx-auto mt-14 max-w-232.5 text-center md:mt-16">
          <h1 className="text-[44px] font-extrabold leading-[1.18] text-[#1e2530] md:text-[68px]">
            Golf Charity Subscriptions
            <br />
            with <span className="text-[#0b4a51]">Monthly Prize Draws</span>
          </h1>
          <p className="mx-auto mt-5 max-w-195 text-[20px] leading-8 text-[#5d6970] md:text-[28px] md:leading-10">
            Subscribe once, support trusted charities, and enter transparent monthly draws.
            Win prizes while making every month meaningful.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <button className="rounded-full bg-[#0b4a51] px-10 py-4 text-xl font-semibold text-white shadow-[0_10px_30px_rgba(11,74,81,0.28)] transition hover:bg-[#093f45] hover:-translate-y-0.5 active:translate-y-0">
              Subscribe Monthly
            </button>
            <Link to="/charities" className="rounded-full border border-[#d8dde1] bg-[#f2f4f6] px-10 py-4 text-xl font-semibold text-[#2f3b44] transition hover:bg-white hover:-translate-y-0.5 active:translate-y-0">
              Explore Charities
            </Link>
          </div>

          <div className="mt-8">
            <p className="text-3xl text-[#f2bf25]">★★★★★ <span className="text-2xl font-bold text-[#2e3942]">5.0</span></p>
            <p className="mt-2 text-[21px] text-[#5d6970]">trusted by 80+ early members</p>
          </div>

          <div className="gm-float pointer-events-none absolute -left-16 top-20 hidden h-12 w-12 items-center justify-center rounded-full border-2 border-[#29545a] text-2xl text-[#29545a] lg:flex">
            ↗
          </div>
          <div className="gm-float-delayed pointer-events-none absolute -left-2 top-32 hidden h-11 w-11 items-center justify-center rounded-full bg-[#0b4a51] text-lg text-white lg:flex">
            ♢
          </div>
          <div className="gm-float pointer-events-none absolute -left-1 top-46 hidden h-11 w-11 items-center justify-center rounded-full bg-[#d2f1ae] text-lg lg:flex">
            ₤
          </div>

          <div className="gm-float pointer-events-none absolute -right-2 top-42 hidden h-12 w-12 items-center justify-center rounded-full bg-[#d2f1ae] text-lg lg:flex">
            📊
          </div>
          <div className="gm-float-delayed pointer-events-none absolute -right-12 top-54 hidden h-12 w-12 items-center justify-center rounded-full border-2 border-[#29545a] text-xl text-[#29545a] lg:flex">
            ≋
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-4">
          <article className="gm-rise rounded-3xl bg-[#114a52] p-6 text-white ring-1 ring-[#0f3f46]">
            <p className="text-5xl font-extrabold">100+</p>
            <p className="mt-3 text-2xl leading-tight text-[#d5ecef]">charities listed</p>
          </article>
          <article className="gm-rise rounded-3xl bg-[#f4f5f7] p-6 ring-1 ring-[#dde2e6]">
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#0b4a51]">Monthly Draws</p>
            <p className="mt-3 text-5xl font-extrabold text-[#1f2932]">1951+</p>
            <p className="mt-2 text-xl text-[#5d6970]">active prize entries</p>
          </article>
          <article className="gm-rise rounded-3xl bg-[#d2f1ae] p-6 text-[#203038]">
            <p className="text-5xl font-extrabold">6+</p>
            <p className="mt-3 text-2xl leading-tight">years of dedicated impact</p>
          </article>
          <article className="gm-rise rounded-3xl bg-[#08383f] p-6 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#9dd9dd]">Promise</p>
            <p className="mt-3 text-3xl font-semibold leading-tight text-[#e7f2f3]">Win monthly, give back, feel good.</p>
          </article>
        </div>

        <section className="mt-10 rounded-[30px] bg-[#071017] p-6 text-white md:p-10">
          <h2 className="text-center text-3xl font-bold md:text-4xl">Subscription Plans</h2>
          <p className="mt-2 text-center text-lg text-[#a8b6be]">Simple pricing with automatic charity contribution and draw access.</p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <article className="rounded-3xl bg-[#1b242c] p-6 ring-1 ring-[#27333d]">
              <p className="text-2xl text-[#d6dde2]">Monthly</p>
              <p className="mt-4 text-5xl font-extrabold">$99 <span className="text-lg font-medium text-[#9fb0bb]">/ month</span></p>
              <p className="mt-3 text-[#a8b6be]">Best for steady monthly participation in prize draws.</p>
              <button className="mt-6 w-full rounded-full border border-[#aec0ca] px-5 py-3 text-lg font-semibold transition hover:bg-[#ffffff10]">Subscribe Monthly</button>
            </article>
            <article className="rounded-3xl bg-[#0d464f] p-6 ring-1 ring-[#18616c]">
              <p className="text-2xl text-[#e8f0f3]">Yearly</p>
              <p className="mt-4 text-5xl font-extrabold">$999 <span className="text-lg font-medium text-[#bfdbdf]">/ year</span></p>
              <p className="mt-3 text-[#d4e9eb]">Lower annual cost and uninterrupted monthly draw eligibility.</p>
              <button className="mt-6 w-full rounded-full bg-[#d9f2b4] px-5 py-3 text-lg font-bold text-[#0f3d43] transition hover:bg-[#e6f8cb]">Choose Yearly</button>
            </article>
          </div>
        </section>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl bg-white p-6 ring-1 ring-[#dde2e6] transition hover:-translate-y-0.5">
            <p className="text-sm font-bold uppercase tracking-widest text-[#0b4a51]">Contribution Model</p>
            <h3 className="mt-3 text-2xl font-bold">Give While You Play</h3>
            <ul className="mt-3 space-y-2 text-lg text-[#5d6970]">
              <li>- Users select a charity at signup</li>
              <li>- Minimum charity contribution is 10%</li>
              <li>- Users can voluntarily increase contribution %</li>
              <li>- Independent donations available anytime</li>
            </ul>
          </article>
          <article className="rounded-3xl bg-white p-6 ring-1 ring-[#dde2e6] transition hover:-translate-y-0.5">
            <p className="text-sm font-bold uppercase tracking-widest text-[#0b4a51]">Charity Directory</p>
            <h3 className="mt-3 text-2xl font-bold">Discover Causes</h3>
            <ul className="mt-3 space-y-2 text-lg text-[#5d6970]">
              <li>- Search and filter all charities</li>
              <li>- Rich profile pages with description and gallery</li>
              <li>- Upcoming events (golf days and more)</li>
              <li>- Featured spotlight charity on homepage</li>
            </ul>
          </article>
          <article className="rounded-3xl bg-[#0b4a51] p-6 text-white transition hover:-translate-y-0.5">
            <p className="text-sm font-bold uppercase tracking-widest text-[#9dd9dd]">Public Visitor</p>
            <h3 className="mt-3 text-2xl font-bold">Understand Then Subscribe</h3>
            <p className="mt-2 text-lg text-[#d5ebed]">View the platform concept, explore charities, learn draw mechanics, then start subscription in one flow.</p>
            <button className="mt-5 w-full rounded-2xl bg-white px-5 py-3 text-lg font-bold text-[#0b4a51] transition hover:bg-[#ecfbf8]">
              Subscribe Now
            </button>
          </article>
        </div>

        <section className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-[#dde2e6] md:p-8">
          <h2 className="text-3xl font-bold">Prize Pool Distribution</h2>
          <p className="mt-2 text-lg text-[#5d6970]">A fixed portion of each subscription contributes to the prize pool and is enforced automatically.</p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-160 border-separate border-spacing-0 overflow-hidden rounded-2xl ring-1 ring-[#d8dee3]">
              <thead>
                <tr className="bg-[#f4f7f8] text-left text-sm uppercase tracking-[0.06em] text-[#48606a]">
                  <th className="px-4 py-3">Match Type</th>
                  <th className="px-4 py-3">Pool Share</th>
                  <th className="px-4 py-3">Rollover</th>
                  <th className="px-4 py-3">Rule</th>
                </tr>
              </thead>
              <tbody className="text-lg text-[#2b3941]">
                <tr className="border-t border-[#e4eaee]">
                  <td className="px-4 py-3 font-semibold">5-Number Match</td>
                  <td className="px-4 py-3">40%</td>
                  <td className="px-4 py-3">Yes (Jackpot)</td>
                  <td className="px-4 py-3">Unclaimed jackpot carries forward</td>
                </tr>
                <tr className="border-t border-[#e4eaee] bg-[#fbfcfc]">
                  <td className="px-4 py-3 font-semibold">4-Number Match</td>
                  <td className="px-4 py-3">35%</td>
                  <td className="px-4 py-3">No</td>
                  <td className="px-4 py-3">Split equally among all winners</td>
                </tr>
                <tr className="border-t border-[#e4eaee]">
                  <td className="px-4 py-3 font-semibold">3-Number Match</td>
                  <td className="px-4 py-3">25%</td>
                  <td className="px-4 py-3">No</td>
                  <td className="px-4 py-3">Split equally among all winners</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-lg text-[#5d6970]">
            Pool tiers auto-calculate from active subscriber count each cycle. If multiple winners land in the same tier, that tier is divided equally.
          </p>
        </section>

        <section className="mt-10 grid gap-6 rounded-3xl bg-white p-6 ring-1 ring-[#dde2e6] md:grid-cols-2 md:p-10">
          <div className="self-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#0b4a51]">Platform Integrations</p>
            <h2 className="mt-3 text-4xl font-extrabold leading-tight text-[#1e2530] md:text-5xl">
              Empowering Charity
              <br />
              Operations Seamlessly
            </h2>
            <p className="mt-4 text-xl text-[#5d6970] md:max-w-130">
              From payments to notifications and analytics, GolFMaster integrates the tools you need to run subscriptions, draws, and charity impact reporting smoothly.
            </p>
            <button className="mt-6 rounded-full bg-[#d2f1ae] px-8 py-3 text-lg font-semibold text-[#1d3b40] transition hover:bg-[#dcf7bf]">
              Work With Us
            </button>
          </div>

          <div className="relative overflow-hidden rounded-[28px] bg-[#d2f1ae] p-6 md:p-10">
            <div className="absolute inset-0 opacity-35 [background:radial-gradient(circle_at_center,transparent_24%,rgba(15,70,79,0.14)_24.7%,transparent_25.4%)]"></div>
            <div className="relative grid h-full place-items-center">
              <div className="grid grid-cols-4 gap-3 md:gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-sm font-bold text-[#2b5661] shadow-sm">ST</span>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-sm font-bold text-[#2b5661] shadow-sm">PG</span>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-sm font-bold text-[#2b5661] shadow-sm">ML</span>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-sm font-bold text-[#2b5661] shadow-sm">DB</span>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-sm font-bold text-[#2b5661] shadow-sm">EM</span>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-sm font-bold text-[#2b5661] shadow-sm">AN</span>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-sm font-bold text-[#2b5661] shadow-sm">API</span>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-sm font-bold text-[#2b5661] shadow-sm">WS</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl bg-[#0a3c44] text-white ring-1 ring-[#175761]">
          <div className="bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[44px_44px] px-6 py-16 text-center md:px-10 md:py-20">
            <h2 className="text-4xl font-extrabold md:text-5xl">From Subscription to Impact in Days</h2>
            <p className="mx-auto mt-4 max-w-185 text-xl text-[#c7e0e3]">
              Join the next cycle, support your selected charity, and participate in transparent monthly draws with automated payout tracking.
            </p>
            <button className="mt-8 rounded-full bg-[#d8f3ae] px-8 py-3 text-lg font-bold text-[#0f3d43] transition hover:bg-[#e6f8cb]">
              Subscribe Now
            </button>
          </div>

          <footer className="border-t border-[#1a5861] bg-[#060d14] px-6 pb-6 pt-8 md:px-10">
            <div className="grid gap-7 md:grid-cols-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="relative h-8 w-8 rounded-full bg-[#0b4a51]">
                    <span className="absolute left-2 top-1 text-sm text-[#94f7c4]">●</span>
                    <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-white"></span>
                  </div>
                  <p className="text-2xl font-bold">GolFMaster</p>
                </div>
                <p className="mt-3 text-base text-[#a8b6be]">
                  Subscription-led charity impact and monthly draws for the golf community.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Platform</h3>
                <ul className="mt-3 space-y-2 text-base text-[#a8b6be]">
                  <li>About Us</li>
                  <li>How It Works</li>
                  <li>Monthly Draw Rules</li>
                  <li>Winner Stories</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Charities</h3>
                <ul className="mt-3 space-y-2 text-base text-[#a8b6be]">
                  <li>Directory</li>
                  <li>Featured Spotlight</li>
                  <li>Upcoming Golf Days</li>
                  <li>Impact Reports</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Plans</h3>
                <ul className="mt-3 space-y-2 text-base text-[#a8b6be]">
                  <li>Monthly $99</li>
                  <li>Yearly $999</li>
                  <li>Contribution Settings</li>
                  <li>Independent Donations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Get in Touch</h3>
                <ul className="mt-3 space-y-2 text-base text-[#a8b6be]">
                  <li>sam.genzgalaxy@gmail.com</li>
                  <li>+91 9493992099</li>
                </ul>
                <div className="mt-4 flex gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#1a2a35] text-sm">in</span>
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#1a2a35] text-sm">ig</span>
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#1a2a35] text-sm">f</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-[#1a2a35] pt-4 text-sm text-[#8fa0ab] md:flex-row md:items-center md:justify-between">
              <p>© 2026 GolFMaster. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white">Terms & Conditions</a>
                <a href="#" className="hover:text-white">Privacy Policy</a>
              </div>
            </div>
          </footer>
        </section>
      </section>
    </main>
  );
}

export default HomePage;
