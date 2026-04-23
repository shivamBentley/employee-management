import { useState } from 'react';
import { updateStatus } from '../api';
import useAuthStore from '../../../store/authStore';
import StatusBadge from './StatusBadge';
import { useFeatureFlag } from '../../../shared/hooks/useFeatureFlag';

const STATUSES = [
  { value: 'online', label: 'Online' },
  { value: 'away', label: 'Away' },
  { value: 'out_of_office', label: 'Out of Office' },
  { value: 'offline', label: 'Offline' },
];

export default function StatusDropdown() {
  const { user, setUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const current = user?.presence?.status ?? 'offline';
  const { enabled: presenceEnabled } = useFeatureFlag('presence_tracking_enabled');

  if (!presenceEnabled) return null;

  const handleChange = async (value) => {
    setOpen(false);
    try {
      await updateStatus(value);
      setUser({ ...user, presence: { ...user?.presence, status: value } });
    } catch (_) {}
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100"
      >
        <StatusBadge status={current} showLabel />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          {STATUSES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleChange(value)}
              className={`flex items-center gap-2.5 w-full px-4 py-2 text-sm hover:bg-gray-50 ${
                value === current ? 'text-blue-600 font-medium' : 'text-gray-700'
              }`}
            >
              <StatusBadge status={value} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
