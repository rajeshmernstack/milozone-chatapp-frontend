export const CLIENT = {
  JOIN: 'JOIN',
  CHAT: 'CHAT',
  TYPING: 'TYPING',
  SKIP: 'SKIP',
  LEAVE: 'LEAVE',
};

export const SERVER = {
  QUEUED: 'QUEUED',
  PAIRED: 'PAIRED',
  CHAT: 'CHAT',
  TYPING: 'TYPING',
  PARTNER_LEFT: 'PARTNER_LEFT',
};

export const ADMIN = {
  SNAPSHOT: 'SNAPSHOT',
  USER_JOINED: 'USER_JOINED',
  USER_LEFT: 'USER_LEFT',
  PAIR_FORMED: 'PAIR_FORMED',
  PAIR_ENDED: 'PAIR_ENDED',
  CHAT_MESSAGE: 'CHAT_MESSAGE',
};

export const ADMIN_WS_URL = 'https://milozone-chatapp-backend-production.up.railway.app/ws/admin';
export const API_URL = 'https://milozone-chatapp-backend-production.up.railway.app';

export const WS_URL = 'wss://milozone-chatapp-backend-production.up.railway.app/ws';
