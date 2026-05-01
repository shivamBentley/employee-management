import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../api';
import { seedDemoData, resetDemoData } from '../../dashboard/api';
import useToastStore from '../../../store/toastStore';
import useSettingsStore from '../../../store/settingsStore';
import { FlaskConical, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';

const FEATURE_KEYS = [
  { key: 'leave_management_enabled',   label: 'Leave Management',   description: 'Allow employees to apply for leaves, view balances, and track approval status. Admins can approve or reject requests.' },
  { key: 'holiday_management_enabled', label: 'Holiday Management', description: 'Manage public holidays per country. Holidays are excluded from leave calculations and shown on the attendance heatmap.' },
  { key: 'announcements_enabled',      label: 'Announcements',      description: 'Post company-wide announcements visible to all employees on their dashboard.' },
  { key: 'presence_tracking_enabled',  label: 'Presence Tracking',  description: 'Track employee clock-in/clock-out times and display daily presence status across the organisation.' },
  { key: 'backup_enabled',             label: 'Backup & Restore',   description: 'Enable scheduled database backups and allow admins to download or restore from previous snapshots.' },
  { key: 'country_support_enabled',    label: 'Country Support',    description: 'Show country selection on employee profiles. When disabled, all employees default to India (IN) and country info is hidden across the application.' },
  { key: 'leave_group_support_enabled', label: 'Leave Group Support', description: 'Allow employees to be assigned to specific leave groups with custom leave type allocations. When disabled, all employees use the default leave group and group selectors are hidden.' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null); // 'seed' | 'reset' | 'reseed' | null
  const [confirmReset, setConfirmReset] = useState(false);
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
      if (action === 'reseed') {
        await resetDemoData();
        const { data } = await seedDemoData();
        toast(data.message, 'success');
      } else {
        const fn = action === 'seed' ? seedDemoData : resetDemoData;
        const { data } = await fn();
        toast(data.message, 'success');
      }
      setConfirmReset(false);
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
          {FEATURE_KEYS.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between px-5 py-4">
              <div className="min-w-0 pr-4">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
              </div>
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
            <h2 className="text-sm font-semibold text-gray-700">Sample Data</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Populate the system with 15 employees (India, US, UK, Germany, Singapore, Canada, Australia, Japan),
              leave requests, balances, holidays, announcements & more — or wipe it all clean.
            </p>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleDemo('seed')}
                disabled={demoLoading !== null}
                className="flex items-center gap-1.5 text-sm bg-violet-50 text-violet-700 px-4 py-2 rounded-lg hover:bg-violet-100 transition disabled:opacity-50"
              >
                <FlaskConical size={14} />
                {demoLoading === 'seed' ? 'Seeding…' : 'Add Sample Data'}
              </button>
              <button
                onClick={() => handleDemo('reseed')}
                disabled={demoLoading !== null}
                className="flex items-center gap-1.5 text-sm bg-amber-50 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-100 transition disabled:opacity-50"
              >
                <RefreshCw size={14} className={demoLoading === 'reseed' ? 'animate-spin' : ''} />
                {demoLoading === 'reseed' ? 'Reseeding…' : 'Reset & Reseed'}
              </button>
              {!confirmReset ? (
                <button
                  onClick={() => setConfirmReset(true)}
                  disabled={demoLoading !== null}
                  className="flex items-center gap-1.5 text-sm bg-rose-50 text-rose-700 px-4 py-2 rounded-lg hover:bg-rose-100 transition disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  Remove All Sample Data
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-lg border border-rose-200">
                  <AlertTriangle size={14} className="text-rose-600 shrink-0" />
                  <span className="text-xs text-rose-700">This removes all demo employees & data. Admin is preserved.</span>
                  <button
                    onClick={() => handleDemo('reset')}
                    disabled={demoLoading !== null}
                    className="text-xs font-semibold text-white bg-rose-600 px-3 py-1 rounded-md hover:bg-rose-700 disabled:opacity-50"
                  >
                    {demoLoading === 'reset' ? 'Removing…' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="text-xs text-rose-600 hover:text-rose-800"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-400">
              Password for all sample employees: <code className="bg-gray-100 px-1 rounded">ab@123CD</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

