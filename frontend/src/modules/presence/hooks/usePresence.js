import { useEffect, useRef } from 'react';
import useAuthStore from '../../../store/authStore';
import { updateStatus } from '../api';

export function usePresence() {
  const { user, token } = useAuthStore();
  const wsRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const REVERB_HOST   = import.meta.env.VITE_REVERB_HOST   || 'localhost';
    const REVERB_PORT   = import.meta.env.VITE_REVERB_PORT   || '8080';
    const REVERB_SCHEME = import.meta.env.VITE_REVERB_SCHEME || 'ws';
    const REVERB_KEY    = import.meta.env.VITE_REVERB_APP_KEY;

    const wsScheme = REVERB_SCHEME === 'https' ? 'wss' : 'ws';
    const url = `${wsScheme}://${REVERB_HOST}:${REVERB_PORT}/app/${REVERB_KEY}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        event: 'pusher:subscribe',
        data: { channel: 'presence' },
      }));
      // Mark as online when connected
      updateStatus('online').catch(() => {});
    };

    ws.onclose = () => {
      // Mark as offline on disconnect
      updateStatus('offline').catch(() => {});
    };

    return () => {
      ws.close();
    };
  }, [token]);

  return wsRef;
}
