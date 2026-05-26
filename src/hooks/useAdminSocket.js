import { useEffect, useRef } from 'react';
import { useAdminStore } from '../store/useAdminStore.js';
import { ADMIN, ADMIN_WS_URL } from '../lib/protocol.js';

export default function useAdminSocket() {
  const token = useAdminStore((s) => s.token);
  const retryRef = useRef(0);
  const closedByUserRef = useRef(false);

  useEffect(() => {
    if (!token) return;

    closedByUserRef.current = false;
    let ws;
    let reconnectTimer;

    const connect = () => {
      ws = new WebSocket(`${ADMIN_WS_URL}?token=${token}`);

      ws.onopen = () => {
        retryRef.current = 0;
        useAdminStore.getState().setWs(ws);
        useAdminStore.getState().setConnected(true);
      };

      ws.onmessage = async (e) => {
        const raw = typeof e.data === 'string' ? e.data : await e.data.text();
        const { type, payload } = JSON.parse(raw);
        const s = useAdminStore.getState();

        switch (type) {
          case ADMIN.SNAPSHOT:
            s.setUsers(payload.users);
            break;
          case ADMIN.USER_JOINED:
            s.upsertUser(payload);
            break;
          case ADMIN.USER_LEFT:
            s.removeUser(payload.id);
            break;
          case ADMIN.PAIR_FORMED:
            s.pairUsers(payload.a.id, payload.b.id);
            break;
          case ADMIN.PAIR_ENDED:
            s.unpairUsers(payload.aId, payload.bId);
            break;
          case ADMIN.CHAT_MESSAGE:
            s.addMessage(payload);
            break;
        }
      };

      ws.onclose = () => {
        useAdminStore.getState().setConnected(false);
        if (closedByUserRef.current) return;
        const delay = Math.min(1000 * 2 ** retryRef.current, 10000);
        retryRef.current += 1;
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      closedByUserRef.current = true;
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [token]);
}