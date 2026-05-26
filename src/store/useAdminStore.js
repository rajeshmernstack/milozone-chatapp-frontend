import { create } from 'zustand';

export const useAdminStore = create((set, get) => ({
  token: null,
  ws: null,
  connected: false,

  // user list — keyed by id for fast updates
  users: new Map(),   // id -> { nickname, location, partnerId }

  // recent chat messages, capped at 200
  messages: [],       // [{ from, to, text, ts }]

  setToken: (token) => set({ token }),
  setWs: (ws) => set({ ws }),
  setConnected: (connected) => set({ connected }),

  // bulk replace (used on SNAPSHOT)
  setUsers: (users) => set({ users: new Map(users.map((u) => [u.id, u])) }),

  upsertUser: (user) => {
    const users = new Map(get().users);
    users.set(user.id, { ...users.get(user.id), ...user });
    set({ users });
  },

  removeUser: (id) => {
    const users = new Map(get().users);
    users.delete(id);
    set({ users });
  },

  pairUsers: (aId, bId) => {
    const users = new Map(get().users);
    if (users.has(aId)) users.set(aId, { ...users.get(aId), partnerId: bId });
    if (users.has(bId)) users.set(bId, { ...users.get(bId), partnerId: aId });
    set({ users });
  },

  unpairUsers: (aId, bId) => {
    const users = new Map(get().users);
    if (users.has(aId)) users.set(aId, { ...users.get(aId), partnerId: null });
    if (users.has(bId)) users.set(bId, { ...users.get(bId), partnerId: null });
    set({ users });
  },

  addMessage: (msg) => {
    const messages = [...get().messages, { ...msg, ts: Date.now() }];
    if (messages.length > 200) messages.shift();
    set({ messages });
  },

  reset: () => set({ token: null, ws: null, connected: false, users: new Map(), messages: [] }),
}));