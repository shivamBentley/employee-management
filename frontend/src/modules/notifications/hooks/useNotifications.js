import { useState, useEffect, useCallback } from 'react';
import { getNotifications, markRead, markAllRead } from '../api';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const { data } = await getNotifications();
      const list = data.notifications ?? [];
      setNotifications(list);
      // prefer server-computed count; fall back to client count
      setUnreadCount(
        data.unread_count !== undefined
          ? data.unread_count
          : list.filter((n) => !n.read_at).length
      );
    } catch (_) {}
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000); // poll every 30 s
    return () => clearInterval(interval);
  }, [load]);

  const handleMarkRead = async (id) => {
    await markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, handleMarkRead, handleMarkAllRead, reload: load };
}
