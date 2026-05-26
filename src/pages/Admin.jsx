import { useState } from 'react';
import { useAdminStore } from '../store/useAdminStore.js';
import { API_URL } from '../lib/protocol.js';
import useAdminSocket from '../hooks/useAdminSocket.js';
import UsersMap from '../components/UsersMap.jsx';


export default function Admin() {
  const token = useAdminStore((s) => s.token);
  return token ? <Dashboard /> : <Login />;
}

function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setToken = useAdminStore((s) => s.setToken);

  const login = async () => {
    if (!password.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (json.success) setToken(json.data.token);
      else setError(json.error || 'Login failed');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 shadow-lg shadow-rose-500/30 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-slate-400 text-sm">Restricted area. Authentication required.</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-xl">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Admin password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && login()}
            placeholder="Enter password"
            className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition"
            autoFocus
          />

          <button
            onClick={login}
            disabled={!password.trim() || loading}
            className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg shadow-rose-500/20 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2">
              <svg className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-rose-200">{error}</p>
            </div>
          )}
        </div>

        {/* Footer link back to the chat */}
        <div className="text-center mt-6">
          <a href="/" className="text-xs text-slate-500 hover:text-slate-300 transition">
            ← Back to chat
          </a>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  useAdminSocket();

  const users = useAdminStore((s) => s.users);
  const messages = useAdminStore((s) => s.messages);
  const connected = useAdminStore((s) => s.connected);
  const reset = useAdminStore((s) => s.reset);

  const userList = [...users.values()];
  const paired = userList.filter((u) => u.partnerId);
  const waiting = userList.filter((u) => !u.partnerId);

  const seenPairs = new Set();
  const pairs = [];
  for (const u of paired) {
    if (seenPairs.has(u.id)) continue;
    const partner = users.get(u.partnerId);
    if (!partner) continue;
    seenPairs.add(u.id);
    seenPairs.add(u.partnerId);
    pairs.push([u, partner]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top bar */}
      <header className="border-b border-slate-700 bg-slate-900/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-semibold">Admin Dashboard</h1>
              <p className="text-xs text-slate-400">Real-time chat monitoring</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${connected ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className={`text-xs font-medium ${connected ? 'text-emerald-300' : 'text-rose-300'}`}>
                {connected ? 'Live' : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={reset}
              className="px-3 py-1.5 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total connected" value={userList.length} color="blue" icon="users" />
          <StatCard label="Active pairs" value={pairs.length} color="emerald" icon="link" />
          <StatCard label="Waiting" value={waiting.length} color="amber" icon="clock" />
          <StatCard label="Recent messages" value={messages.length} color="indigo" icon="chat" />
        </div>

        {/* Map */}
        <section className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-semibold">Users on map</h2>
              <p className="text-xs text-slate-400 mt-0.5">Live locations of connected users</p>
            </div>
            <span className="text-xs text-slate-500">
              {userList.filter((u) => u.location).length} of {userList.length} sharing location
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-700">
            <UsersMap />
          </div>
        </section>

        {/* Pairs + Waiting */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active pairs */}
          <section className="lg:col-span-2 bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Active pairs</h2>
              <span className="text-xs px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-300">
                {pairs.length} active
              </span>
            </div>

            {pairs.length === 0 ? (
              <EmptyState message="No active pairs right now." />
            ) : (
              <div className="space-y-3">
                {pairs.map(([a, b]) => {
                  const pairMessages = messages.filter(
                    (m) =>
                      (m.fromId === a.id && m.toId === b.id) ||
                      (m.fromId === b.id && m.toId === a.id)
                  );
                  return (
                    <div key={a.id} className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <PairAvatar name={a.nickname} />
                        <div className="flex-1 text-center">
                          <div className="flex items-center justify-center gap-2 text-white text-sm">
                            <span className="font-medium">{a.nickname}</span>
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            <span className="font-medium">{b.nickname}</span>
                          </div>
                        </div>
                        <PairAvatar name={b.nickname} />
                      </div>

                      {pairMessages.length === 0 ? (
                        <p className="text-xs text-slate-500 italic text-center py-2">No messages yet</p>
                      ) : (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {pairMessages.slice(-5).map((m, i) => (
                            <div key={i} className="text-sm">
                              <span className="text-slate-400 font-medium">{m.from}:</span>{' '}
                              <span className="text-slate-200">{m.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Waiting queue */}
          <section className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Waiting</h2>
              <span className="text-xs px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-300">
                {waiting.length} in queue
              </span>
            </div>

            {waiting.length === 0 ? (
              <EmptyState message="Nobody waiting." />
            ) : (
              <div className="space-y-2">
                {waiting.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-700 rounded-xl">
                    <PairAvatar name={u.nickname} />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{u.nickname}</div>
                      <div className="text-xs text-amber-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        waiting...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  const colors = {
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-300',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-300',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-300',
    indigo: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/30 text-indigo-300',
  };
  const icons = {
    users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    link: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    chat: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-4 shadow-xl`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
        <svg className={`w-4 h-4 ${colors[color].split(' ').pop()}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icons[icon]} />
        </svg>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

function PairAvatar({ name }) {
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="py-8 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-700/50 mb-2">
        <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
        </svg>
      </div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

const styles = {
  page: { maxWidth: 1100, margin: '0 auto', padding: 16 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: 12 },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 },
  stat: { padding: 16, border: '1px solid #eee', borderRadius: 8 },
  statValue: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  body: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 },
  section: { border: '1px solid #eee', borderRadius: 8, padding: 16 },
  pair: { borderBottom: '1px solid #f3f4f6', padding: '10px 0' },
  pairHeader: { marginBottom: 6 },
  pairMessages: { display: 'flex', flexDirection: 'column', gap: 3 },
  pairMsg: { fontSize: 13 },
  msgFrom: { color: '#666', fontWeight: 600 },
  user: { padding: 6, borderBottom: '1px solid #f3f4f6' },
  muted: { color: '#999' },
  btn: { padding: '6px 12px', cursor: 'pointer' },
};