import { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore.js';
import { CLIENT, SERVER, WS_URL } from '../lib/protocol.js';

export default function useChatSocket() {
  const nickname = useChatStore((s) => s.nickname);
  const retryRef = useRef(0);
  const closedByUserRef = useRef(false);

  useEffect(() => {
    if (!nickname) return;

    closedByUserRef.current = false;
    let ws;
    let reconnectTimer;

    const connect = () => {
      ws = new WebSocket(WS_URL);
      const isFirstAttempt = retryRef.current === 0;
      useChatStore.getState().setStatus(isFirstAttempt ? 'connecting' : 'reconnecting');

      ws.onopen = () => {
        retryRef.current = 0;
        const { location } = useChatStore.getState();
        useChatStore.getState().setWs(ws);
        ws.send(JSON.stringify({ type: CLIENT.JOIN, payload: { nickname, location } }));
      };

      ws.onmessage = async (e) => {
        const raw = typeof e.data === 'string' ? e.data : await e.data.text();
        const { type, payload } = JSON.parse(raw);
        const s = useChatStore.getState();

        switch (type) {
          case SERVER.QUEUED:
            s.setStatus('queued');
            s.setPartnerNickname('');
            s.clearMessages();
            break;
          case SERVER.PAIRED:
            s.setStatus('paired');
            s.setPartnerNickname(payload.partnerNickname);
            s.clearMessages();
            break;
          case SERVER.CHAT:
            s.addMessage({ from: payload.from, text: payload.text, mine: false });
            break;
          case SERVER.TYPING:
            s.setPartnerTyping(payload.isTyping);
            break;
          case SERVER.PARTNER_LEFT:
            s.setStatus('queued');
            s.setPartnerNickname('');
            s.setPartnerTyping(false);
            break;
        }
      };

      ws.onclose = () => {
        if (closedByUserRef.current) return;
        const delay = Math.min(1000 * 2 ** retryRef.current, 10000);
        retryRef.current += 1;
        useChatStore.getState().setStatus('reconnecting');
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      closedByUserRef.current = true;
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [nickname]);
}