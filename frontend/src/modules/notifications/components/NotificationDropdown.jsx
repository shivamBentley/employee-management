import { useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationDropdown({ notifications, onMarkRead, onMarkAllRead, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="font-semibold text-sm text-gray-800">Notifications</span>
        <button
          onClick={onMarkAllRead}
          className="text-xs text-blue-600 hover:underline"
        >
          Mark all read
        </button>
      </div>

      <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-gray-400">No notifications</li>
        ) : (
          notifications.map((n) => (
            <li
              key={n.id}
              onClick={() => !n.read_at && onMarkRead(n.id)}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                !n.read_at ? 'bg-blue-50/50' : ''
              }`}
            >
              <p className="text-sm font-medium text-gray-800">{n.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
              <p className="text-[11px] text-gray-400 mt-1">
                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
