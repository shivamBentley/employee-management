import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../api';
import { seedDemoData, resetDemoData } from '../../dashboard/api';
import useToastStore from '../../../store/toastStore';
import useSettingsStore from '../../../store/settingsStore';
import { FlaskConical, Trash2 } from 'lucide-react';

const FEATURE_KEYS = [
  { key: 'leave_management_enabled',   label: 'Leave Management' },
  { key: 'announcements_enabled',      label: 'Announcements' },
  { key: 'presence_tracking_enabled',  label: 'Presence Tracking' },
  { key: 'backup_enabled',             label: 'Backup & Restore' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null); // 'seed' | 'reset' | null
  const toast = useToastStore((s) => s.toast);
  const invalidateSettings = useSettingsStore((s) => s.invalidate);

  useEffect(() => {
    getSettings()
      .then(({ data }) => setSettings(data.settings ?? {}))
      .catch(() => toast('Failed to load settings', 'error'));
  }, []);

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: prev[key] === '1' ? '0' : '1' }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      invalidateSettings();
      toast('Settings saved', 'success');
    } catch {
      toast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDemo = async (action) => {
    setDemoLoading(action);
    try {
      const fn = action === 'seed' ? seedDemoData : resetDemoData;
      const { data } = await fn();
      toast(data.message, 'success');
    } catch (err) {
      toast(err?.response?.data?.message ?? 'Something went wrong.', 'error');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 shadow-sm">
          {FEATURE_KEYS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between px-5 py-4">
              <span className="text-sm font-medium text-gray-700">{label}</span>
              <button
                onClick={() => toggle(key)}
                className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                  settings[key] === '1' ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
                    settings[key] === '1' ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>

        {/* Demo Data */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">Demo Data</h2>
            <p className="text-xs text-gray-400 mt-0.5">Populate the system with sample employees, departments and leaves, or wipe them all.</p>
          </div>
          <div className="px-5 py-4 flex flex-wrap gap-3">
            <button
              onClick={() => handleDemo('seed')}
              disabled={demoLoading !== null}
              className="flex items-center gap-1.5 text-sm bg-violet-50 text-violet-700 px-4 py-2 rounded-lg hover:bg-violet-100 transition disabled:opacity-50"
            >
              <FlaskConical size={14} />
              {demoLoading === 'seed' ? 'Seeding…' : 'Add Sample Data'}
            </button>
            <button
              onClick={() => handleDemo('reset')}
              disabled={demoLoading !== null}
              className="flex items-center gap-1.5 text-sm bg-rose-50 text-rose-700 px-4 py-2 rounded-lg hover:bg-rose-100 transition disabled:opacity-50"
            >
              <Trash2 size={14} />
              {demoLoading === 'reset' ? 'Resetting…' : 'Reset Demo Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

