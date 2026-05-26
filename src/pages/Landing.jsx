import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/useChatStore.js';

export default function Landing() {
  const [nickname, setNickname] = useState('');
  const setStoreNickname = useChatStore((s) => s.setNickname);
  const setLocation = useChatStore((s) => s.setLocation);
  const navigate = useNavigate();

  const start = () => {
    if (!nickname.trim()) return;
    setStoreNickname(nickname.trim());

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { timeout: 5000 }
      );
    }

    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Anonymous Chat</h1>
          <p className="text-slate-400 text-sm">Talk to a stranger. One message at a time.</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-xl">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Choose a nickname
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && start()}
            placeholder="e.g. nightowl42"
            className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
            autoFocus
          />
          <button
            onClick={start}
            disabled={!nickname.trim()}
            className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg shadow-blue-500/20 transition"
          >
            Start Chatting
          </button>

          {/* Privacy disclosure */}
          <div className="mt-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-xs text-amber-200/90 leading-relaxed">
              <span className="font-semibold">Heads up:</span> This chat is monitored.
              Messages and approximate location are visible to administrators in real time.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          No signup. No history. No tracking beyond this session.
        </p>
      </div>
    </div>
  );
}