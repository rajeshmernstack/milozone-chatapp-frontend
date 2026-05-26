import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
    // connection
    ws: null,
    setLocation: (location) => set({ location }),
    status: 'idle', // 'idle' | 'connecting' | 'queued' | 'paired' | 'disconnected'

    // identity
    nickname: '',
    partnerNickname: '',

    // chat
    messages: [],     // [{ from, text, mine }]
    partnerTyping: false,

    // actions
    setWs: (ws) => set({ ws }),
    setStatus: (status) => set({ status }),
    setNickname: (nickname) => set({ nickname }),
    setPartnerNickname: (partnerNickname) => set({ partnerNickname }),
    addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
    clearMessages: () => set({ messages: [] }),
    setPartnerTyping: (partnerTyping) => set({ partnerTyping }),

    // convenience: send a typed message through the socket
    send: (type, payload = {}) => {
        const { ws } = get();
        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type, payload }));
        }
    },

    // reset state on disconnect or leave
    reset: () => set({
        status: 'idle',
        partnerNickname: '',
        messages: [],
        partnerTyping: false,
    }),
}));