import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/useChatStore.js';
import { CLIENT } from '../lib/protocol.js';
import useChatSocket from '../hooks/useChatSocket.js';

export default function Chat() {
  const navigate = useNavigate();
  const nickname = useChatStore((s) => s.nickname);
  const status = useChatStore((s) => s.status);
  const partnerNickname = useChatStore((s) => s.partnerNickname);
  const messages = useChatStore((s) => s.messages);
  const partnerTyping = useChatStore((s) => s.partnerTyping);
  const send = useChatStore((s) => s.send);

  const [text, setText] = useState('');
  const scrollRef = useRef(null);
  const typingTimerRef = useRef(null);

  useChatSocket();

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, partnerTyping]);

  const handleTyping = (e) => {
    setText(e.target.value);
    if (status !== 'paired') return;
    send(CLIENT.TYPING, { isTyping: true });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      send(CLIENT.TYPING, { isTyping: false });
    }, 1000);
  };

  const sendMessage = () => {
    if (!text.trim() || status !== 'paired') return;
    send(CLIENT.CHAT, { text: text.trim() });
    send(CLIENT.TYPING, { isTyping: false });
    clearTimeout(typingTimerRef.current);
    useChatStore.getState().addMessage({ from: nickname, text: text.trim(), mine: true });
    setText('');
  };

  const handleSkip = () => send(CLIENT.SKIP);

  const handleLeave = () => {
    send(CLIENT.LEAVE);
    useChatStore.getState().reset();
    useChatStore.getState().setNickname('');
    navigate('/');
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/70 backdrop-blur px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
            {(partnerNickname || nickname || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            {status === 'paired' && (
              <>
                <div className="text-white font-medium">{partnerNickname}</div>
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  online
                </div>
              </>
            )}
            {status === 'queued' && (
              <>
                <div className="text-white font-medium">Finding a partner</div>
                <div className="text-xs text-amber-400">please wait...</div>
              </>
            )}
            {status === 'connecting' && (
              <>
                <div className="text-white font-medium">Connecting</div>
                <div className="text-xs text-slate-400">establishing link...</div>
              </>
            )}
            {status === 'disconnected' && (
              <>
                <div className="text-white font-medium">Disconnected</div>
                <div className="text-xs text-rose-400">connection lost</div>
              </>
            )}

            {status === 'reconnecting' && (
              <>
                <div className="text-white font-medium">Reconnecting</div>
                <div className="text-xs text-amber-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  trying again...
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSkip}
            disabled={status !== 'paired'}
            className="px-3 py-1.5 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition"
          >
            Skip
          </button>
          <button
            onClick={handleLeave}
            className="px-3 py-1.5 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition"
          >
            Leave
          </button>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {status === 'queued' && messages.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/60 border border-slate-700 rounded-full">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm text-slate-300">Waiting for someone to join...</span>
              </div>
            </div>
          )}

          {status === 'paired' && messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">
                You are now chatting with <span className="text-white font-medium">{partnerNickname}</span>
              </p>
              <p className="text-slate-500 text-xs mt-1">Say hi 👋</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${m.mine ? 'order-2' : 'order-1'}`}>
                {!m.mine && (
                  <div className="text-xs text-slate-500 mb-1 px-1">{m.from}</div>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl ${m.mine
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-sm'
                      : 'bg-slate-700 text-slate-100 rounded-bl-sm'
                    }`}
                >
                  {m.text}
                </div>
              </div>
            </div>
          ))}

          {partnerTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-slate-700 bg-slate-900/70 backdrop-blur px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            value={text}
            onChange={handleTyping}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={status === 'paired' ? 'Type a message...' : 'Waiting for a partner...'}
            disabled={status !== 'paired'}
            className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-full text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50 transition"
          />
          <button
            onClick={sendMessage}
            disabled={status !== 'paired' || !text.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-full shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
          >
            <span>Send</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}